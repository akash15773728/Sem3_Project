from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(request: Request, login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user or not auth.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    client_ip = request.client.host if request.client else "127.0.0.1"
    auth.log_activity(db, f"User logged in: {user.email} ({user.role})", user_id=user.user_id, ip_address=client_ip)

    access_token = auth.create_access_token(
        data={
            "sub": user.email,
            "role": user.role,
            "user_id": user.user_id,
            "facility_id": user.facility_id,
            "district_id": user.district_id
        }
    )

    user_resp = schemas.UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        facility_id=user.facility_id,
        district_id=user.district_id,
        is_active=user.is_active,
        created_at=user.created_at,
        facility_name=user.facility.facility_name if user.facility else None,
        district_name=user.district.district_name if user.district else (user.facility.district.district_name if user.facility and user.facility.district else None)
    )

    return schemas.Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserResponse(
        user_id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        facility_id=current_user.facility_id,
        district_id=current_user.district_id,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        facility_name=current_user.facility.facility_name if current_user.facility else None,
        district_name=current_user.district.district_name if current_user.district else (current_user.facility.district.district_name if current_user.facility and current_user.facility.district else None)
    )
