from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/facility-capacity", tags=["Facility Capacity"])

@router.get("", response_model=List[schemas.CapacityResponse])
def get_facility_capacities(
    facility_id: Optional[int] = Query(None),
    district_id: Optional[int] = Query(None),
    service_id: Optional[int] = Query(None),
    service_available: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    query = db.query(models.FacilityCapacity).join(models.Facility).join(models.Service)

    # Scoping for Facility Staff: only their assigned facility
    if current_user.role == "Facility Staff":
        if not current_user.facility_id:
            return []
        query = query.filter(models.FacilityCapacity.facility_id == current_user.facility_id)
    elif facility_id:
        query = query.filter(models.FacilityCapacity.facility_id == facility_id)

    # District scoping for District Officer
    if current_user.role == "District Officer" and current_user.district_id:
        query = query.filter(models.Facility.district_id == current_user.district_id)
    elif district_id:
        query = query.filter(models.Facility.district_id == district_id)

    if service_id:
        query = query.filter(models.FacilityCapacity.service_id == service_id)
    if service_available is not None:
        query = query.filter(models.FacilityCapacity.service_available == service_available)

    records = query.order_by(models.Facility.facility_name, models.Service.service_name).all()
    result = []
    for r in records:
        result.append(schemas.CapacityResponse(
            capacity_id=r.capacity_id,
            facility_id=r.facility_id,
            service_id=r.service_id,
            service_available=r.service_available,
            specialist_count=r.specialist_count,
            equipment_available=r.equipment_available,
            beds_available=r.beds_available,
            last_updated=r.last_updated,
            facility_name=r.facility.facility_name if r.facility else None,
            service_name=r.service.service_name if r.service else None,
            district_name=r.facility.district.district_name if r.facility and r.facility.district else None,
            category=r.service.category if r.service else None
        ))
    return result

@router.post("", response_model=schemas.CapacityResponse, status_code=status.HTTP_201_CREATED)
def create_capacity(
    capacity_in: schemas.CapacityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator", "Facility Staff"]))
):
    # Facility staff can only create capacity for their assigned facility
    if current_user.role == "Facility Staff" and current_user.facility_id != capacity_in.facility_id:
        raise HTTPException(status_code=403, detail="You can only manage capacity for your assigned facility")

    existing = db.query(models.FacilityCapacity).filter(
        models.FacilityCapacity.facility_id == capacity_in.facility_id,
        models.FacilityCapacity.service_id == capacity_in.service_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Capacity record for this facility and service already exists. Use PUT to update.")

    new_cap = models.FacilityCapacity(
        facility_id=capacity_in.facility_id,
        service_id=capacity_in.service_id,
        service_available=capacity_in.service_available,
        specialist_count=capacity_in.specialist_count,
        equipment_available=capacity_in.equipment_available,
        beds_available=capacity_in.beds_available,
        last_updated=datetime.utcnow()
    )
    db.add(new_cap)
    db.commit()
    db.refresh(new_cap)

    auth.log_activity(
        db,
        f"Capacity record created for Facility #{new_cap.facility_id}, Service #{new_cap.service_id}",
        user_id=current_user.user_id
    )

    fac = db.query(models.Facility).filter(models.Facility.facility_id == new_cap.facility_id).first()
    srv = db.query(models.Service).filter(models.Service.service_id == new_cap.service_id).first()

    return schemas.CapacityResponse(
        capacity_id=new_cap.capacity_id,
        facility_id=new_cap.facility_id,
        service_id=new_cap.service_id,
        service_available=new_cap.service_available,
        specialist_count=new_cap.specialist_count,
        equipment_available=new_cap.equipment_available,
        beds_available=new_cap.beds_available,
        last_updated=new_cap.last_updated,
        facility_name=fac.facility_name if fac else None,
        service_name=srv.service_name if srv else None,
        district_name=fac.district.district_name if fac and fac.district else None,
        category=srv.category if srv else None
    )

@router.put("/{capacity_id}", response_model=schemas.CapacityResponse)
def update_capacity(
    capacity_id: int,
    capacity_in: schemas.CapacityUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator", "Facility Staff"]))
):
    cap = db.query(models.FacilityCapacity).filter(models.FacilityCapacity.capacity_id == capacity_id).first()
    if not cap:
        raise HTTPException(status_code=404, detail="Capacity record not found")

    # Facility staff can only update capacity for their assigned facility
    if current_user.role == "Facility Staff" and current_user.facility_id != cap.facility_id:
        raise HTTPException(status_code=403, detail="You can only update capacity for your assigned facility")

    if capacity_in.service_available is not None:
        cap.service_available = capacity_in.service_available
    if capacity_in.specialist_count is not None:
        cap.specialist_count = capacity_in.specialist_count
    if capacity_in.equipment_available is not None:
        cap.equipment_available = capacity_in.equipment_available
    if capacity_in.beds_available is not None:
        cap.beds_available = capacity_in.beds_available

    cap.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(cap)

    auth.log_activity(
        db,
        f"Capacity updated for Facility #{cap.facility_id}, Service #{cap.service_id}: Specialists={cap.specialist_count}, Beds={cap.beds_available}, Avail={cap.service_available}",
        user_id=current_user.user_id
    )

    return schemas.CapacityResponse(
        capacity_id=cap.capacity_id,
        facility_id=cap.facility_id,
        service_id=cap.service_id,
        service_available=cap.service_available,
        specialist_count=cap.specialist_count,
        equipment_available=cap.equipment_available,
        beds_available=cap.beds_available,
        last_updated=cap.last_updated,
        facility_name=cap.facility.facility_name if cap.facility else None,
        service_name=cap.service.service_name if cap.service else None,
        district_name=cap.facility.district.district_name if cap.facility and cap.facility.district else None,
        category=cap.service.category if cap.service else None
    )
