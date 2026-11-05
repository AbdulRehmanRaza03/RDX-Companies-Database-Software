"""Organization endpoints (read-only for the demo single-org app)."""
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Organization, OrganizationMember, Profile

router = APIRouter(tags=["organizations"])


@router.get("/organizations")
def list_organizations(
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    """Return the organizations the current profile is a member of."""
    rows = (
        db.query(Organization)
        .join(OrganizationMember, OrganizationMember.organization_id == Organization.id)
        .filter(OrganizationMember.profile_id == profile.id)
        .all()
    )
    return [
        {"id": str(o.id), "name": o.name, "slug": o.slug}
        for o in rows
    ]
