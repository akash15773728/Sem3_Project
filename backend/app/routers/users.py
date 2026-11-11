from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/users", tags=["Users Management"])

@router.get("", response_model=List[schemas.UserResponse])
def get_users(
    role: Optional[str] = Query(None),
    facility_id: Optional[int] = Query(None),
    district_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if facility_id:
        query = query.filter(models.User.facility_id == facility_id)
    if district_id:
        query = query.filter(models.User.district_id == district_id)

    users = query.order_by(models.User.name).all()
    result = []
    for u in users:
        result.append(schemas.UserResponse(
            user_id=u.user_id,
            name=u.name,
            email=u.email,
            role=u.role,
            facility_id=u.facility_id,
            district_id=u.district_id,
            is_active=u.is_active,
            created_at=u.created_at,
            facility_name=u.facility.facility_name if u.facility else None,
            district_name=u.district.district_name if u.district else (u.facility.district.district_name if u.facility and u.facility.district else None)
        ))
    return result

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    existing = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = models.User(
        name=user_in.name,
        email=user_in.email,
        password_hash=auth.get_password_hash(user_in.password),
        role=user_in.role,
        facility_id=user_in.facility_id,
        district_id=user_in.district_id,
        is_active=user_in.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    auth.log_activity(db, f"Admin created user account: {new_user.email} [{new_user.role}]", user_id=current_user.user_id)

    return schemas.UserResponse(
        user_id=new_user.user_id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        facility_id=new_user.facility_id,
        district_id=new_user.district_id,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
        facility_name=new_user.facility.facility_name if new_user.facility else None,
        district_name=new_user.district.district_name if new_user.district else None
    )

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator"]))
):
    u = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.name is not None:
        u.name = user_in.name
    if user_in.role is not None:
        u.role = user_in.role
    if user_in.facility_id is not None:
        u.facility_id = user_in.facility_id
    if user_in.district_id is not None:
        u.district_id = user_in.district_id
    if user_in.is_active is not None:
        u.is_active = user_in.is_active
    if user_in.password:
        u.password_hash = auth.get_password_hash(user_in.password)

    db.commit()
    db.refresh(u)

    auth.log_activity(db, f"Admin updated user account: {u.email}", user_id=current_user.user_id)

    return schemas.UserResponse(
        user_id=u.user_id,
        name=u.name,
        email=u.email,
        role=u.role,
        facility_id=u.facility_id,
        district_id=u.district_id,
        is_active=u.is_active,
        created_at=u.created_at,
        facility_name=u.facility.facility_name if u.facility else None,
        district_name=u.district.district_name if u.district else None
    )
