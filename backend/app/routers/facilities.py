from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/facilities", tags=["Facilities"])

@router.get("", response_model=List[schemas.FacilityResponse])
def get_facilities(
    district_id: Optional[int] = Query(None),
    facility_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Facility)
    if district_id:
        query = query.filter(models.Facility.district_id == district_id)
    if facility_type:
        query = query.filter(models.Facility.facility_type == facility_type)
    if search:
        query = query.filter(models.Facility.facility_name.ilike(f"%{search}%"))

    facilities = query.order_by(models.Facility.facility_name).all()
    result = []
    for f in facilities:
        active_srv_count = db.query(func.count(models.FacilityCapacity.capacity_id)).filter(
            models.FacilityCapacity.facility_id == f.facility_id,
            models.FacilityCapacity.service_available == True
        ).scalar() or 0

        referral_count = db.query(func.count(models.Referral.referral_id)).filter(
            models.Referral.source_facility_id == f.facility_id
        ).scalar() or 0

        result.append(schemas.FacilityResponse(
            facility_id=f.facility_id,
            facility_name=f.facility_name,
            facility_type=f.facility_type,
            district_id=f.district_id,
            contact_phone=f.contact_phone,
            address=f.address,
            created_at=f.created_at,
            district_name=f.district.district_name if f.district else None,
            state_name=f.district.state_name if f.district else None,
            active_services_count=active_srv_count,
            total_referrals_sent=referral_count
        ))
    return result

@router.get("/{facility_id}", response_model=schemas.FacilityResponse)
def get_facility(facility_id: int, db: Session = Depends(get_db)):
    f = db.query(models.Facility).filter(models.Facility.facility_id == facility_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Facility not found")

    active_srv_count = db.query(func.count(models.FacilityCapacity.capacity_id)).filter(
        models.FacilityCapacity.facility_id == f.facility_id,
        models.FacilityCapacity.service_available == True
    ).scalar() or 0

    referral_count = db.query(func.count(models.Referral.referral_id)).filter(
        models.Referral.source_facility_id == f.facility_id
    ).scalar() or 0

    return schemas.FacilityResponse(
        facility_id=f.facility_id,
        facility_name=f.facility_name,
        facility_type=f.facility_type,
        district_id=f.district_id,
        contact_phone=f.contact_phone,
        address=f.address,
        created_at=f.created_at,
        district_name=f.district.district_name if f.district else None,
        state_name=f.district.state_name if f.district else None,
        active_services_count=active_srv_count,
        total_referrals_sent=referral_count
    )

@router.post("", response_model=schemas.FacilityResponse, status_code=status.HTTP_201_CREATED)
def create_facility(
    facility_in: schemas.FacilityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    district = db.query(models.District).filter(models.District.district_id == facility_in.district_id).first()
    if not district:
        raise HTTPException(status_code=400, detail="Invalid district ID")

    new_fac = models.Facility(
        facility_name=facility_in.facility_name,
        facility_type=facility_in.facility_type,
        district_id=facility_in.district_id,
        contact_phone=facility_in.contact_phone,
        address=facility_in.address
    )
    db.add(new_fac)
    db.commit()
    db.refresh(new_fac)

    auth.log_activity(db, f"Admin added facility: {new_fac.facility_name} ({new_fac.facility_type})", user_id=current_user.user_id)
    return schemas.FacilityResponse(
        facility_id=new_fac.facility_id,
        facility_name=new_fac.facility_name,
        facility_type=new_fac.facility_type,
        district_id=new_fac.district_id,
        contact_phone=new_fac.contact_phone,
        address=new_fac.address,
        created_at=new_fac.created_at,
        district_name=district.district_name,
        state_name=district.state_name,
        active_services_count=0,
        total_referrals_sent=0
    )

@router.put("/{facility_id}", response_model=schemas.FacilityResponse)
def update_facility(
    facility_id: int,
    facility_in: schemas.FacilityUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    fac = db.query(models.Facility).filter(models.Facility.facility_id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")

    if facility_in.district_id:
        dist = db.query(models.District).filter(models.District.district_id == facility_in.district_id).first()
        if not dist:
            raise HTTPException(status_code=400, detail="Invalid district ID")
        fac.district_id = facility_in.district_id

    if facility_in.facility_name is not None:
        fac.facility_name = facility_in.facility_name
    if facility_in.facility_type is not None:
        fac.facility_type = facility_in.facility_type
    if facility_in.contact_phone is not None:
        fac.contact_phone = facility_in.contact_phone
    if facility_in.address is not None:
        fac.address = facility_in.address

    db.commit()
    db.refresh(fac)

    auth.log_activity(db, f"Admin updated facility: {fac.facility_name}", user_id=current_user.user_id)
    return get_facility(facility_id, db)
