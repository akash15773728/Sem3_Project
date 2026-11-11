from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/activity-logs", tags=["Activity Logs"])

@router.get("", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(
    limit: int = Query(100, ge=1, le=500),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["Administrator", "State Officer"]))
):
    query = db.query(models.ActivityLog)
    if user_id:
        query = query.filter(models.ActivityLog.user_id == user_id)

    logs = query.order_by(models.ActivityLog.created_at.desc()).limit(limit).all()
    result = []
    for l in logs:
        result.append(schemas.ActivityLogResponse(
            log_id=l.log_id,
            user_id=l.user_id,
            user_name=l.user.name if l.user else "System",
            user_role=l.user.role if l.user else None,
            action=l.action,
            ip_address=l.ip_address,
            created_at=l.created_at
        ))
    return result
