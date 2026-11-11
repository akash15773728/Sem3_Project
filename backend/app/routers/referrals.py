from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/referrals", tags=["Referrals"])

def build_referral_response(r: models.Referral) -> schemas.ReferralResponse:
    src_dist = r.source_facility.district if r.source_facility else None
    dst_dist = r.destination_facility.district if r.destination_facility else None

    return schemas.ReferralResponse(
        referral_id=r.referral_id,
        source_facility_id=r.source_facility_id,
        destination_facility_id=r.destination_facility_id,
        service_id=r.service_id,
        created_by=r.created_by,
        referral_date=r.referral_date,
        reason_category=r.reason_category or "Equipment Unavailable",
        unavailable_resource=r.unavailable_resource,
        reason=r.reason,
        status=r.status,
        priority=r.priority,
        notes=r.notes,
        created_at=r.created_at,
        source_facility_name=r.source_facility.facility_name if r.source_facility else None,
        source_district_name=src_dist.district_name if src_dist else None,
        source_state_name=src_dist.state_name if src_dist else None,
        destination_facility_name=r.destination_facility.facility_name if r.destination_facility else None,
        destination_district_name=dst_dist.district_name if dst_dist else None,
        destination_state_name=dst_dist.state_name if dst_dist else None,
        service_name=r.service.service_name if r.service else None,
        service_category=r.service.category if r.service else None,
        creator_name=r.creator.name if r.creator else None
    )

@router.get("", response_model=List[schemas.ReferralResponse])
def get_referrals(
    source_facility_id: Optional[int] = Query(None),
    destination_facility_id: Optional[int] = Query(None),
    district_id: Optional[int] = Query(None),
    state_name: Optional[str] = Query(None),
    service_id: Optional[int] = Query(None),
    reason_category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.Referral).join(
        models.Facility, models.Referral.source_facility_id == models.Facility.facility_id
    ).join(
        models.District, models.Facility.district_id == models.District.district_id
    )

    # Scoping for Facility Staff
    if current_user.role == "Facility Staff":
        if current_user.facility_id:
            query = query.filter(
                or_(
                    models.Referral.source_facility_id == current_user.facility_id,
                    models.Referral.destination_facility_id == current_user.facility_id
                )
            )
        else:
            return []
    elif source_facility_id:
        query = query.filter(models.Referral.source_facility_id == source_facility_id)

    # Scoping for District Officer
    if current_user.role == "District Officer" and current_user.district_id:
        query = query.filter(models.Facility.district_id == current_user.district_id)
    elif district_id:
        query = query.filter(models.Facility.district_id == district_id)

    # Scoping for State Officer
    if current_user.role == "State Officer" and current_user.state_name:
        query = query.filter(models.District.state_name == current_user.state_name)
    elif state_name:
        query = query.filter(models.District.state_name == state_name)

    if destination_facility_id:
        query = query.filter(models.Referral.destination_facility_id == destination_facility_id)
    if service_id:
        query = query.filter(models.Referral.service_id == service_id)
    if reason_category:
        query = query.filter(models.Referral.reason_category == reason_category)
    if status_filter:
        query = query.filter(models.Referral.status == status_filter)
    if priority:
        query = query.filter(models.Referral.priority == priority)
    if date_from:
        query = query.filter(models.Referral.referral_date >= date_from)
    if date_to:
        query = query.filter(models.Referral.referral_date <= date_to)

    referrals = query.order_by(models.Referral.referral_date.desc(), models.Referral.referral_id.desc()).offset(skip).limit(limit).all()

    return [build_referral_response(r) for r in referrals]

@router.get("/{referral_id}", response_model=schemas.ReferralResponse)
def get_referral(
    referral_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    r = db.query(models.Referral).filter(models.Referral.referral_id == referral_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Referral record not found")

    return build_referral_response(r)

@router.post("", response_model=schemas.ReferralResponse, status_code=status.HTTP_201_CREATED)
def create_referral(
    referral_in: schemas.ReferralCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Facility Staff", "Administrator", "District Officer"]))
):
    # Facility staff can only create referrals originating from their assigned facility
    if current_user.role == "Facility Staff" and current_user.facility_id != referral_in.source_facility_id:
        raise HTTPException(status_code=403, detail="You can only originate referrals from your assigned facility")

    if referral_in.source_facility_id == referral_in.destination_facility_id:
        raise HTTPException(status_code=400, detail="Source and destination facility cannot be the same")

    src = db.query(models.Facility).filter(models.Facility.facility_id == referral_in.source_facility_id).first()
    dst = db.query(models.Facility).filter(models.Facility.facility_id == referral_in.destination_facility_id).first()
    srv = db.query(models.Service).filter(models.Service.service_id == referral_in.service_id).first()

    if not src or not dst or not srv:
        raise HTTPException(status_code=400, detail="Invalid source facility, destination facility, or service ID")

    new_ref = models.Referral(
        source_facility_id=referral_in.source_facility_id,
        destination_facility_id=referral_in.destination_facility_id,
        service_id=referral_in.service_id,
        created_by=current_user.user_id,
        referral_date=referral_in.referral_date or date.today(),
        reason_category=referral_in.reason_category or "Equipment Unavailable",
        unavailable_resource=referral_in.unavailable_resource or srv.service_name,
        reason=referral_in.reason,
        status="Pending",
        priority=referral_in.priority or "Routine",
        notes=referral_in.notes,
        created_at=datetime.utcnow()
    )
    db.add(new_ref)
    db.commit()
    db.refresh(new_ref)

    auth.log_activity(
        db,
        f"Referral #{new_ref.referral_id} created: {src.facility_name} -> {dst.facility_name} ({srv.service_name}) [{new_ref.reason_category}: {new_ref.unavailable_resource}]",
        user_id=current_user.user_id
    )

    return build_referral_response(new_ref)

@router.put("/{referral_id}", response_model=schemas.ReferralResponse)
def update_referral(
    referral_id: int,
    referral_in: schemas.ReferralUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    r = db.query(models.Referral).filter(models.Referral.referral_id == referral_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Referral record not found")

    old_status = r.status
    if referral_in.status is not None:
        r.status = referral_in.status
    if referral_in.priority is not None:
        r.priority = referral_in.priority
    if referral_in.notes is not None:
        r.notes = referral_in.notes
    if referral_in.destination_facility_id is not None:
        r.destination_facility_id = referral_in.destination_facility_id

    db.commit()
    db.refresh(r)

    if old_status != r.status:
        auth.log_activity(
            db,
            f"Referral #{r.referral_id} status updated from '{old_status}' to '{r.status}'",
            user_id=current_user.user_id
        )

    return build_referral_response(r)
