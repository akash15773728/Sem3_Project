from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("", response_model=List[schemas.ServiceResponse])
def get_services(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Service)
    if category:
        query = query.filter(models.Service.category == category)
    if is_active is not None:
        query = query.filter(models.Service.is_active == is_active)

    services = query.order_by(models.Service.service_name).all()
    result = []
    for s in services:
        fac_count = db.query(func.count(models.FacilityCapacity.facility_id)).filter(
            models.FacilityCapacity.service_id == s.service_id,
            models.FacilityCapacity.service_available == True
        ).scalar() or 0

        result.append(schemas.ServiceResponse(
            service_id=s.service_id,
            service_name=s.service_name,
            category=s.category,
            description=s.description,
            is_active=s.is_active,
            facilities_offering=fac_count
        ))
    return result

@router.post("", response_model=schemas.ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_in: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    existing = db.query(models.Service).filter(models.Service.service_name == service_in.service_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Service with this name already exists")

    new_srv = models.Service(
        service_name=service_in.service_name,
        category=service_in.category,
        description=service_in.description,
        is_active=service_in.is_active
    )
    db.add(new_srv)
    db.commit()
    db.refresh(new_srv)

    auth.log_activity(db, f"Admin created service: {new_srv.service_name} ({new_srv.category})", user_id=current_user.user_id)
    return schemas.ServiceResponse(
        service_id=new_srv.service_id,
        service_name=new_srv.service_name,
        category=new_srv.category,
        description=new_srv.description,
        is_active=new_srv.is_active,
        facilities_offering=0
    )

@router.put("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(
    service_id: int,
    service_in: schemas.ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    srv = db.query(models.Service).filter(models.Service.service_id == service_id).first()
    if not srv:
        raise HTTPException(status_code=404, detail="Service not found")

    if service_in.service_name is not None:
        srv.service_name = service_in.service_name
    if service_in.category is not None:
        srv.category = service_in.category
    if service_in.description is not None:
        srv.description = service_in.description
    if service_in.is_active is not None:
        srv.is_active = service_in.is_active

    db.commit()
    db.refresh(srv)

    auth.log_activity(db, f"Admin updated service: {srv.service_name}", user_id=current_user.user_id)
    return schemas.ServiceResponse(
        service_id=srv.service_id,
        service_name=srv.service_name,
        category=srv.category,
        description=srv.description,
        is_active=srv.is_active,
        facilities_offering=0
    )
