from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from collections import Counter
import pandas as pd
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/analytics", tags=["Analytics & Healthcare Gaps"])

def identify_gaps(
    threshold: int,
    days: int,
    db: Session,
    current_user: models.User,
    district_id: Optional[int] = None,
    state_name: Optional[str] = None,
    facility_id: Optional[int] = None
) -> schemas.GapAnalysisResponse:
    cutoff_date = date.today() - timedelta(days=days)

    # Base facility query with district join
    fac_q = db.query(models.Facility).join(models.District, models.Facility.district_id == models.District.district_id)

    # Role-based scoping
    if current_user.role == "Facility Staff" and current_user.facility_id:
        fac_q = fac_q.filter(models.Facility.facility_id == current_user.facility_id)
    elif facility_id:
        fac_q = fac_q.filter(models.Facility.facility_id == facility_id)

    if current_user.role == "District Officer" and current_user.district_id:
        fac_q = fac_q.filter(models.Facility.district_id == current_user.district_id)
    elif district_id:
        fac_q = fac_q.filter(models.Facility.district_id == district_id)

    if current_user.role == "State Officer" and current_user.state_name:
        fac_q = fac_q.filter(models.District.state_name == current_user.state_name)
    elif state_name:
        fac_q = fac_q.filter(models.District.state_name == state_name)

    facilities = fac_q.all()
    services = db.query(models.Service).filter(models.Service.is_active == True).all()

    gap_items = []
    potential_count = 0
    needs_review_count = 0
    insufficient_count = 0

    specialist_gaps_count = 0
    equipment_gaps_count = 0
    diagnostic_gaps_count = 0
    bed_gaps_count = 0

    for fac in facilities:
        for srv in services:
            # Query outbound referrals from this facility for this service in the analysis window
            referrals = db.query(models.Referral).filter(
                models.Referral.source_facility_id == fac.facility_id,
                models.Referral.service_id == srv.service_id,
                models.Referral.referral_date >= cutoff_date
            ).order_by(models.Referral.referral_date.desc()).all()

            ref_count = len(referrals)
            if ref_count == 0:
                continue

            # Query reported capacity
            capacity = db.query(models.FacilityCapacity).filter(
                models.FacilityCapacity.facility_id == fac.facility_id,
                models.FacilityCapacity.service_id == srv.service_id
            ).first()

            # Determine dominant unavailable resource and reason category from referrals
            categories = [r.reason_category for r in referrals if r.reason_category]
            top_category = Counter(categories).most_common(1)[0][0] if categories else "Equipment Unavailable"

            resources = [r.unavailable_resource for r in referrals if r.unavailable_resource]
            top_resource = Counter(resources).most_common(1)[0][0] if resources else srv.service_name

            gap_status = None
            severity = "Low"
            flag_reason = ""
            shortage_type = "Equipment Shortage"

            if top_category == "Specialist Unavailable" or (capacity and capacity.specialist_count == 0):
                shortage_type = "Specialist Shortage"
            elif top_category == "Diagnostic Service Unavailable" or srv.category == "Diagnostic & Pathology":
                shortage_type = "Diagnostic Shortage"
            elif top_category == "Insufficient Beds" or (capacity and capacity.beds_available == 0 and srv.category in ["Surgical Specialties", "Emergency & Critical Care"]):
                shortage_type = "Bed Shortage"
            else:
                shortage_type = "Equipment Shortage"

            if capacity is None:
                if ref_count >= threshold:
                    gap_status = "Insufficient Data"
                    severity = "Medium"
                    flag_reason = f"Facility dispatched {ref_count} referrals for {srv.service_name}, but has no baseline capacity record filed."
                    insufficient_count += 1
            else:
                # Rule 1: Service reported unavailable with repeated referrals
                if not capacity.service_available and ref_count >= threshold:
                    gap_status = "Potential Gap"
                    severity = "High"
                    flag_reason = (
                        f"Facility reported service as UNAVAILABLE, yet recorded {ref_count} outbound referrals "
                        f"(threshold: {threshold} in last {days} days)."
                    )
                    potential_count += 1
                # Rule 2: Equipment deficit reported with repeated referrals
                elif not capacity.equipment_available and ref_count >= threshold:
                    gap_status = "Potential Gap"
                    severity = "High"
                    shortage_type = "Equipment Shortage"
                    flag_reason = (
                        f"Repeated referrals associated with unavailable equipment ({top_resource}). "
                        f"Facility recorded {ref_count} outbound referrals with equipment deficit."
                    )
                    potential_count += 1
                # Rule 3: Equipment reported unavailable with moderate referrals
                elif not capacity.equipment_available and ref_count >= 2:
                    gap_status = "Needs Review"
                    severity = "Medium"
                    shortage_type = "Equipment Shortage"
                    flag_reason = (
                        f"Facility reports equipment DEFICIT for {top_resource} with {ref_count} referrals logged."
                    )
                    needs_review_count += 1
                # Rule 4: Service available but specialists count == 0
                elif capacity.service_available and capacity.specialist_count == 0 and ref_count >= 2:
                    gap_status = "Needs Review"
                    severity = "Medium"
                    shortage_type = "Specialist Shortage"
                    flag_reason = (
                        f"Facility reports service available, but has 0 specialists credentialed with {ref_count} referrals generated."
                    )
                    needs_review_count += 1
                # Rule 5: Bed deficit for surgical/inpatient services
                elif srv.category in ["Surgical Specialties", "Emergency & Critical Care"] and capacity.beds_available == 0 and ref_count >= 2:
                    gap_status = "Needs Review"
                    severity = "Medium"
                    shortage_type = "Bed Shortage"
                    flag_reason = (
                        f"Facility reports 0 available inpatient beds for {srv.service_name} with {ref_count} referrals dispatched."
                    )
                    needs_review_count += 1

            if gap_status:
                if shortage_type == "Specialist Shortage":
                    specialist_gaps_count += 1
                elif shortage_type == "Equipment Shortage":
                    equipment_gaps_count += 1
                elif shortage_type == "Diagnostic Shortage":
                    diagnostic_gaps_count += 1
                elif shortage_type == "Bed Shortage":
                    bed_gaps_count += 1

                gap_id = f"GAP-{fac.facility_id}-{srv.service_id}"
                # Return ALL supporting referrals so officers can inspect complete evidence (e.g. all 50 echocardiogram records)
                supporting = [
                    schemas.SupportingReferral(
                        referral_id=r.referral_id,
                        referral_date=r.referral_date,
                        destination_facility_name=r.destination_facility.facility_name,
                        reason_category=r.reason_category or "Equipment Unavailable",
                        unavailable_resource=r.unavailable_resource or top_resource,
                        reason=r.reason,
                        priority=r.priority,
                        status=r.status
                    ) for r in referrals
                ]

                gap_items.append(schemas.PotentialGapItem(
                    gap_id=gap_id,
                    facility_id=fac.facility_id,
                    facility_name=fac.facility_name,
                    district_id=fac.district_id,
                    district_name=fac.district.district_name if fac.district else "Unknown",
                    state_name=fac.district.state_name if fac.district else "Unknown",
                    service_id=srv.service_id,
                    service_name=srv.service_name,
                    service_category=srv.category,
                    shortage_type=shortage_type,
                    unavailable_resource=top_resource,
                    referral_count=ref_count,
                    analysis_period=f"Last {days} days",
                    service_reported_available=capacity.service_available if capacity else False,
                    specialist_count=capacity.specialist_count if capacity else 0,
                    equipment_available=capacity.equipment_available if capacity else False,
                    beds_available=capacity.beds_available if capacity else 0,
                    capacity_last_updated=capacity.last_updated if capacity else None,
                    gap_status=gap_status,
                    severity=severity,
                    flag_reason=flag_reason,
                    supporting_referrals=supporting
                ))

    # Sort gaps: High severity first, then by referral count descending
    gap_items.sort(key=lambda x: (0 if x.severity == "High" else 1 if x.severity == "Medium" else 2, -x.referral_count))

    return schemas.GapAnalysisResponse(
        total_gaps_identified=len(gap_items),
        potential_gaps_count=potential_count,
        needs_review_count=needs_review_count,
        insufficient_data_count=insufficient_count,
        specialist_gaps_count=specialist_gaps_count,
        equipment_gaps_count=equipment_gaps_count,
        diagnostic_gaps_count=diagnostic_gaps_count,
        bed_gaps_count=bed_gaps_count,
        threshold_used=threshold,
        time_window_days=days,
        items=gap_items
    )

@router.get("/summary", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(
    district_id: Optional[int] = Query(None),
    state_name: Optional[str] = Query(None),
    facility_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    ref_query = db.query(models.Referral).join(
        models.Facility, models.Referral.source_facility_id == models.Facility.facility_id
    ).join(
        models.District, models.Facility.district_id == models.District.district_id
    )

    if current_user.role == "Facility Staff" and current_user.facility_id:
        ref_query = ref_query.filter(models.Referral.source_facility_id == current_user.facility_id)
    elif facility_id:
        ref_query = ref_query.filter(models.Referral.source_facility_id == facility_id)

    if current_user.role == "District Officer" and current_user.district_id:
        ref_query = ref_query.filter(models.Facility.district_id == current_user.district_id)
    elif district_id:
        ref_query = ref_query.filter(models.Facility.district_id == district_id)

    if current_user.role == "State Officer" and current_user.state_name:
        ref_query = ref_query.filter(models.District.state_name == current_user.state_name)
    elif state_name:
        ref_query = ref_query.filter(models.District.state_name == state_name)

    total_referrals = ref_query.count()
    pending_referrals = ref_query.filter(models.Referral.status == "Pending").count()
    completed_referrals = ref_query.filter(models.Referral.status == "Completed").count()
    emergency_referrals = ref_query.filter(models.Referral.priority == "Emergency").count()

    total_facilities = db.query(func.count(models.Facility.facility_id)).scalar() or 0
    total_districts = db.query(func.count(models.District.district_id)).scalar() or 0
    total_services = db.query(func.count(models.Service.service_id)).scalar() or 0

    gaps_resp = identify_gaps(threshold=3, days=180, db=db, current_user=current_user, district_id=district_id, state_name=state_name, facility_id=facility_id)

    return schemas.AnalyticsSummary(
        total_referrals=total_referrals,
        total_facilities=total_facilities,
        total_districts=total_districts,
        total_services=total_services,
        potential_gaps_count=gaps_resp.potential_gaps_count,
        pending_referrals=pending_referrals,
        completed_referrals=completed_referrals,
        emergency_referrals=emergency_referrals
    )

@router.get("/patterns")
def get_referral_patterns(
    district_id: Optional[int] = Query(None),
    state_name: Optional[str] = Query(None),
    facility_id: Optional[int] = Query(None),
    service_id: Optional[int] = Query(None),
    days: int = Query(180, ge=7, le=730),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    cutoff_date = date.today() - timedelta(days=days)
    query = db.query(models.Referral).join(
        models.Facility, models.Referral.source_facility_id == models.Facility.facility_id
    ).join(
        models.District, models.Facility.district_id == models.District.district_id
    ).join(
        models.Service, models.Referral.service_id == models.Service.service_id
    ).filter(models.Referral.referral_date >= cutoff_date)

    if current_user.role == "Facility Staff" and current_user.facility_id:
        query = query.filter(models.Referral.source_facility_id == current_user.facility_id)
    elif facility_id:
        query = query.filter(models.Referral.source_facility_id == facility_id)

    if current_user.role == "District Officer" and current_user.district_id:
        query = query.filter(models.Facility.district_id == current_user.district_id)
    elif district_id:
        query = query.filter(models.Facility.district_id == district_id)

    if current_user.role == "State Officer" and current_user.state_name:
        query = query.filter(models.District.state_name == current_user.state_name)
    elif state_name:
        query = query.filter(models.District.state_name == state_name)

    if service_id:
        query = query.filter(models.Referral.service_id == service_id)

    records = query.all()

    if not records:
        return {
            "trends": [],
            "service_distribution": [],
            "category_distribution": [],
            "status_distribution": [],
            "district_comparison": [],
            "reason_distribution": []
        }

    df = pd.DataFrame([{
        "date": r.referral_date.strftime("%Y-%m-%d"),
        "month": r.referral_date.strftime("%Y-%m"),
        "service": r.service.service_name,
        "category": r.service.category,
        "status": r.status,
        "priority": r.priority,
        "reason_category": r.reason_category or "Other",
        "unavailable_resource": r.unavailable_resource or "Unspecified",
        "reason": r.reason,
        "source_facility": r.source_facility.facility_name,
        "source_district": r.source_facility.district.district_name if r.source_facility and r.source_facility.district else "Unknown",
        "source_state": r.source_facility.district.state_name if r.source_facility and r.source_facility.district else "Unknown",
        "destination_facility": r.destination_facility.facility_name,
        "is_emergency": 1 if r.priority == "Emergency" else 0,
        "is_completed": 1 if r.status == "Completed" else 0
    } for r in records])

    monthly = df.groupby("month").agg(
        referral_count=("date", "count"),
        emergency_count=("is_emergency", "sum"),
        completed_count=("is_completed", "sum")
    ).reset_index().rename(columns={"month": "date"}).to_dict(orient="records")

    srv_dist = df.groupby("service").size().reset_index(name="count").sort_values(by="count", ascending=False).head(10).to_dict(orient="records")
    cat_dist = df.groupby("category").size().reset_index(name="count").sort_values(by="count", ascending=False).to_dict(orient="records")
    status_dist = df.groupby("status").size().reset_index(name="count").to_dict(orient="records")
    dist_dist = df.groupby("source_district").size().reset_index(name="count").sort_values(by="count", ascending=False).to_dict(orient="records")
    reason_cat_dist = df.groupby("reason_category").size().reset_index(name="count").sort_values(by="count", ascending=False).to_dict(orient="records")
    resource_dist = df.groupby("unavailable_resource").size().reset_index(name="count").sort_values(by="count", ascending=False).head(8).to_dict(orient="records")

    return {
        "trends": monthly,
        "service_distribution": srv_dist,
        "category_distribution": cat_dist,
        "status_distribution": status_dist,
        "district_comparison": dist_dist,
        "reason_category_distribution": reason_cat_dist,
        "top_unavailable_resources": resource_dist
    }

@router.get("/gaps", response_model=schemas.GapAnalysisResponse)
def get_potential_gaps(
    threshold: int = Query(3, ge=1, le=50, description="Configurable referral threshold count"),
    days: int = Query(180, ge=7, le=730, description="Analysis window in days"),
    district_id: Optional[int] = Query(None),
    state_name: Optional[str] = Query(None),
    facility_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return identify_gaps(threshold, days, db, current_user, district_id=district_id, state_name=state_name, facility_id=facility_id)

@router.get("/gaps/{gap_id}", response_model=schemas.PotentialGapItem)
def get_gap_detail(
    gap_id: str,
    threshold: int = Query(3, ge=1, le=50),
    days: int = Query(180, ge=7, le=730),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    analysis = identify_gaps(threshold, days, db, current_user)
    for item in analysis.items:
        if item.gap_id == gap_id:
            return item
    raise HTTPException(status_code=404, detail="Gap item not found or does not meet threshold criteria")

@router.get("/dashboard-level", response_model=schemas.LevelDashboardResponse)
def get_level_dashboard(
    level: Optional[str] = Query(None, description="'District', 'State', or 'National'"),
    district_id: Optional[int] = Query(None),
    state_name: Optional[str] = Query(None),
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Determine level and geographic scope
    user_role = current_user.role

    if level is None:
        if user_role == "National Officer":
            level = "National"
        elif user_role == "State Officer":
            level = "State"
        else:
            level = "District"

    # Region name and base queries
    if level == "District":
        target_dist_id = district_id or current_user.district_id or 1
        dist_obj = db.query(models.District).filter(models.District.district_id == target_dist_id).first()
        region_name = f"{dist_obj.district_name} District ({dist_obj.state_name})" if dist_obj else "Central Delhi District"
        target_state = dist_obj.state_name if dist_obj else "Delhi NCR"
    elif level == "State":
        target_state = state_name or current_user.state_name or "Delhi NCR"
        region_name = f"{target_state} State / UT"
        target_dist_id = None
    else: # National
        level = "National"
        region_name = "India (National Healthcare Overview)"
        target_dist_id = None
        target_state = None

    # Calculate Gaps for this level
    gaps_resp = identify_gaps(
        threshold=3,
        days=days,
        db=db,
        current_user=current_user,
        district_id=target_dist_id if level == "District" else None,
        state_name=target_state if level == "State" else None
    )

    # Calculate Facilities in this scope
    fac_q = db.query(models.Facility).join(models.District, models.Facility.district_id == models.District.district_id)
    if level == "District":
        fac_q = fac_q.filter(models.Facility.district_id == target_dist_id)
    elif level == "State":
        fac_q = fac_q.filter(models.District.state_name == target_state)
    scope_facilities = fac_q.all()
    card_facilities_count = len(scope_facilities)

    # Calculate Referrals in this scope
    ref_q = db.query(models.Referral).join(models.Facility, models.Referral.source_facility_id == models.Facility.facility_id).join(
        models.District, models.Facility.district_id == models.District.district_id
    ).filter(models.Referral.referral_date >= date.today() - timedelta(days=days))

    if level == "District":
        ref_q = ref_q.filter(models.Facility.district_id == target_dist_id)
    elif level == "State":
        ref_q = ref_q.filter(models.District.state_name == target_state)
    scope_referrals = ref_q.all()
    card_referrals_count = len(scope_referrals)

    # 4-5 summary cards
    card_potential_gaps_count = gaps_resp.potential_gaps_count
    review_facilities_set = set(g.facility_id for g in gaps_resp.items if g.gap_status in ["Potential Gap", "Needs Review"])
    card_review_facilities_count = len(review_facilities_set)

    # Top shortage resource based on referrals and identified gaps
    ref_resources = [r.unavailable_resource for r in scope_referrals if r.unavailable_resource]
    if ref_resources:
        top_res_tuple = Counter(ref_resources).most_common(1)[0]
        card_top_shortage_resource = top_res_tuple[0]
        card_top_shortage_count = top_res_tuple[1]
    else:
        shortage_counter = Counter(g.unavailable_resource for g in gaps_resp.items)
        if shortage_counter:
            card_top_shortage_resource = shortage_counter.most_common(1)[0][0]
            card_top_shortage_count = shortage_counter.most_common(1)[0][1]
        else:
            card_top_shortage_resource = "None Detected"
            card_top_shortage_count = 0

    # Recent alerts (top 10 critical gaps)
    recent_alerts = gaps_resp.items[:10]

    # Trends with multi-series breakdown by category
    if scope_referrals:
        df_refs = pd.DataFrame([{
            "date": r.referral_date.strftime("%Y-%m-%d"),
            "month": r.referral_date.strftime("%Y-%m"),
            "category": r.reason_category or "Other",
            "resource": r.unavailable_resource or "Unspecified",
            "is_emergency": 1 if r.priority == "Emergency" else 0,
            "is_equipment": 1 if r.reason_category == "Equipment Unavailable" else 0,
            "is_specialist": 1 if r.reason_category == "Specialist Unavailable" else 0,
            "is_bed": 1 if r.reason_category == "Insufficient Beds" else 0,
            "is_diagnostic": 1 if r.reason_category == "Diagnostic Service Unavailable" else 0,
            "source_fac_id": r.source_facility_id,
            "source_fac_name": r.source_facility.facility_name if r.source_facility else "Unknown"
        } for r in scope_referrals])

        trends = df_refs.groupby("month").agg(
            referral_count=("date", "count"),
            equipment_referrals=("is_equipment", "sum"),
            specialist_referrals=("is_specialist", "sum"),
            bed_referrals=("is_bed", "sum"),
            diagnostic_referrals=("is_diagnostic", "sum"),
            emergency_count=("is_emergency", "sum")
        ).reset_index().rename(columns={"month": "date"}).to_dict(orient="records")

        # Top reasons for referral
        top_reasons = df_refs.groupby("category").size().reset_index(name="count").sort_values(by="count", ascending=False).to_dict(orient="records")

        # Most frequently reported resource shortages (actual database resources)
        top_resource_shortages = df_refs.groupby("resource").size().reset_index(name="count").sort_values(by="count", ascending=False).head(10).to_dict(orient="records")
    else:
        trends = []
        top_reasons = []
        top_resource_shortages = []

    # Top unavailable specialists and equipment
    spec_items = [g for g in gaps_resp.items if g.shortage_type == "Specialist Shortage"]
    equip_items = [g for g in gaps_resp.items if g.shortage_type == "Equipment Shortage"]

    top_unavailable_specialists = [
        {"name": k, "count": v} for k, v in Counter(g.unavailable_resource for g in spec_items).most_common(5)
    ]
    top_unavailable_equipment = [
        {"name": k, "count": v} for k, v in Counter(g.unavailable_resource for g in equip_items).most_common(5)
    ]

    # Regional breakdown, Facility Comparisons, and Heat Map Nodes
    heat_map_nodes = []
    regional_breakdown = []
    facility_comparisons = []

    if level == "District":
        # Nodes are individual facilities in the district
        for fac in scope_facilities:
            fac_gaps = [g for g in gaps_resp.items if g.facility_id == fac.facility_id]
            fac_refs = [r for r in scope_referrals if r.source_facility_id == fac.facility_id]
            ref_c = len(fac_refs)
            gap_c = len(fac_gaps)
            top_res = fac_gaps[0].unavailable_resource if fac_gaps else (
                Counter([r.unavailable_resource for r in fac_refs if r.unavailable_resource]).most_common(1)[0][0] if fac_refs else "None"
            )
            
            # Determine facility status
            if any(g.gap_status == "Potential Gap" or g.severity == "High" for g in fac_gaps):
                node_status = "Potential Gap"
            elif any(g.gap_status == "Needs Review" for g in fac_gaps):
                node_status = "Needs Review"
            else:
                node_status = "Normal"

            shortage_cat = fac_gaps[0].shortage_type if fac_gaps else "Equipment"
            intensity = min(100, int((gap_c * 25) + (ref_c * 1.5)))

            # Coordinates fallback within Central Delhi if missing
            default_lat = 28.6432 if "Paharganj" in fac.facility_name else (28.6480 if "Daryaganj" in fac.facility_name else 28.6360)
            default_lng = 77.2155 if "Paharganj" in fac.facility_name else (77.2420 if "Daryaganj" in fac.facility_name else 77.2390)

            lat = fac.latitude if fac.latitude is not None else default_lat
            lng = fac.longitude if fac.longitude is not None else default_lng

            heat_map_nodes.append(schemas.HeatMapNode(
                id=f"fac-{fac.facility_id}",
                name=fac.facility_name,
                facility_id=fac.facility_id,
                facility_type=fac.facility_type,
                parent_region=fac.district.district_name if fac.district else "District",
                latitude=lat,
                longitude=lng,
                referral_count=ref_c,
                gap_count=gap_c,
                primary_shortage=top_res,
                shortage_category=shortage_cat,
                status=node_status,
                gap_id=fac_gaps[0].gap_id if fac_gaps else None,
                intensity=intensity
            ))

            regional_breakdown.append({
                "facility_id": fac.facility_id,
                "name": fac.facility_name,
                "type": fac.facility_type,
                "referral_count": ref_c,
                "gap_count": gap_c,
                "primary_shortage": top_res,
                "status": node_status
            })

            # Facility comparison metrics
            eq_refs = sum(1 for r in fac_refs if r.reason_category == "Equipment Unavailable")
            sp_refs = sum(1 for r in fac_refs if r.reason_category == "Specialist Unavailable")
            bed_refs = sum(1 for r in fac_refs if r.reason_category == "Insufficient Beds")
            diag_refs = sum(1 for r in fac_refs if r.reason_category == "Diagnostic Service Unavailable")

            facility_comparisons.append({
                "facility_id": fac.facility_id,
                "facility_name": fac.facility_name,
                "facility_type": fac.facility_type,
                "total_referrals": ref_c,
                "equipment_referrals": eq_refs,
                "specialist_referrals": sp_refs,
                "bed_referrals": bed_refs,
                "diagnostic_referrals": diag_refs,
                "gap_count": gap_c,
                "primary_shortage": top_res,
                "status": node_status
            })

    elif level == "State":
        # Nodes are districts in this state
        state_districts = db.query(models.District).filter(models.District.state_name == target_state).all()
        for dist in state_districts:
            dist_gaps = [g for g in gaps_resp.items if g.district_id == dist.district_id]
            dist_refs = [r for r in scope_referrals if r.source_facility.district_id == dist.district_id]
            ref_c = len(dist_refs)
            gap_c = len(dist_gaps)
            top_res = dist_gaps[0].unavailable_resource if dist_gaps else "Normal"
            intensity = min(100, int((gap_c * 20) + (ref_c * 1.2)))

            # Coordinates for Delhi districts
            lat_map = {"Central Delhi": 28.6420, "South Delhi": 28.5200, "North Delhi": 28.7000, "East Delhi": 28.6280, "New Delhi": 28.6139}
            lng_map = {"Central Delhi": 77.2200, "South Delhi": 77.2100, "North Delhi": 77.1500, "East Delhi": 77.2900, "New Delhi": 77.2090}

            heat_map_nodes.append(schemas.HeatMapNode(
                id=f"dist-{dist.district_id}",
                name=dist.district_name,
                parent_region=dist.state_name,
                latitude=lat_map.get(dist.district_name, 28.6139),
                longitude=lng_map.get(dist.district_name, 77.2090),
                referral_count=ref_c,
                gap_count=gap_c,
                primary_shortage=top_res,
                status="Potential Gap" if gap_c >= 3 else "Needs Review" if gap_c > 0 else "Normal",
                intensity=intensity
            ))
            regional_breakdown.append({
                "name": dist.district_name,
                "state_name": dist.state_name,
                "referral_count": ref_c,
                "gap_count": gap_c,
                "primary_shortage": top_res,
                "status": "Critical" if any(g.severity == "High" for g in dist_gaps) else "Review" if gap_c > 0 else "Normal"
            })

    else: # National
        # Nodes are States / UTs across the country
        states = db.query(models.District.state_name).distinct().all()
        for s in states:
            s_name = s[0]
            s_gaps = [g for g in gaps_resp.items if g.state_name == s_name]
            s_refs = [r for r in scope_referrals if r.source_facility.district.state_name == s_name]
            ref_c = len(s_refs)
            gap_c = len(s_gaps)
            top_res = s_gaps[0].unavailable_resource if s_gaps else "Normal"
            intensity = min(100, int((gap_c * 20) + (ref_c * 1.0)))

            state_coords = {"Delhi NCR": (28.6139, 77.2090), "Maharashtra": (19.0760, 72.8777), "Karnataka": (12.9716, 77.5946)}
            coords = state_coords.get(s_name, (20.5937, 78.9629))

            heat_map_nodes.append(schemas.HeatMapNode(
                id=f"state-{s_name.replace(' ', '_')}",
                name=s_name,
                parent_region="India",
                latitude=coords[0],
                longitude=coords[1],
                referral_count=ref_c,
                gap_count=gap_c,
                primary_shortage=top_res,
                status="Potential Gap" if gap_c >= 3 else "Needs Review" if gap_c > 0 else "Normal",
                intensity=intensity
            ))
            regional_breakdown.append({
                "name": s_name,
                "referral_count": ref_c,
                "gap_count": gap_c,
                "primary_shortage": top_res,
                "status": "Critical" if any(g.severity == "High" for g in s_gaps) else "Review" if gap_c > 0 else "Normal"
            })

    # Sort regional breakdown by gap_count desc
    regional_breakdown.sort(key=lambda x: -x["gap_count"])

    return schemas.LevelDashboardResponse(
        level=level,
        region_name=region_name,
        last_updated=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        card_facilities_count=card_facilities_count,
        card_referrals_count=card_referrals_count,
        card_potential_gaps_count=card_potential_gaps_count,
        card_review_facilities_count=card_review_facilities_count,
        card_top_shortage_resource=card_top_shortage_resource,
        card_top_shortage_count=card_top_shortage_count,
        recent_alerts=recent_alerts,
        trends=trends,
        top_reasons=top_reasons,
        top_resource_shortages=top_resource_shortages,
        facility_comparisons=facility_comparisons,
        top_unavailable_specialists=top_unavailable_specialists,
        top_unavailable_equipment=top_unavailable_equipment,
        regional_breakdown=regional_breakdown,
        heat_map_nodes=heat_map_nodes
    )
