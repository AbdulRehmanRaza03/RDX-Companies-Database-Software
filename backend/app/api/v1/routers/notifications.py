"""Notifications and team (organization members) endpoints."""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Notification, OrganizationMember, Profile

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
def list_notifications(
    organization_id: uuid.UUID = Query(...),
    unread_only: bool = False,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    query = (
        db.query(Notification)
        .filter(
            Notification.organization_id == organization_id,
            Notification.profile_id == profile.id,
        )
        .order_by(Notification.created_at.desc())
    )
    if unread_only:
        query = query.filter(Notification.is_read.is_(False))
    rows = query.limit(limit).all()
    return {
        "items": [
            {
                "id": str(n.id),
                "type": n.type,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in rows
        ]
    }


@router.get("/team")
def list_team(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows = (
        db.query(
            OrganizationMember.profile_id,
            Profile.first_name,
            Profile.last_name,
            Profile.email,
            OrganizationMember.status,
        )
        .join(Profile, Profile.id == OrganizationMember.profile_id)
        .filter(OrganizationMember.organization_id == organization_id)
        .all()
    )
    return {
        "items": [
            {
                "id": str(r.profile_id),
                "name": f"{r.first_name or ''} {r.last_name or ''}".strip() or r.email,
                "email": r.email,
                "status": r.status.value if hasattr(r.status, "value") else str(r.status),
            }
            for r in rows
        ]
    }
