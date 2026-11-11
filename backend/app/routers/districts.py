from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/districts", tags=["Districts"])

@router.get("", response_model=List[schemas.DistrictResponse])
def get_districts(db: Session = Depends(get_db)):
    districts = db.query(models.District).order_by(models.District.district_name).all()
    result = []
    for d in districts:
        fac_count = db.query(func.count(models.Facility.facility_id)).filter(models.Facility.district_id == d.district_id).scalar() or 0
        result.append(schemas.DistrictResponse(
            district_id=d.district_id,
            district_name=d.district_name,
            state_name=d.state_name,
            created_at=d.created_at,
            facility_count=fac_count
        ))
    return result

@router.post("", response_model=schemas.DistrictResponse, status_code=status.HTTP_201_CREATED)
def create_district(
    district_in: schemas.DistrictCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    existing = db.query(models.District).filter(
        models.District.district_name == district_in.district_name,
        models.District.state_name == district_in.state_name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="District with this name and state already exists")

    district = models.District(
        district_name=district_in.district_name,
        state_name=district_in.state_name
    )
    db.add(district)
    db.commit()
    db.refresh(district)

    auth.log_activity(db, f"Created district: {district.district_name}", user_id=current_user.user_id)
    return schemas.DistrictResponse(
        district_id=district.district_id,
        district_name=district.district_name,
        state_name=district.state_name,
        created_at=district.created_at,
        facility_count=0
    )
