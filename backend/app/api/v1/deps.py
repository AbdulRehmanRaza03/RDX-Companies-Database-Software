"""FastAPI dependencies for authentication, current-user, and permission checks.

These are the backend enforcement points for the authentication/authorization rules
from the master documentation:

- Every protected route depends on ``get_current_profile``.
- ``require_permission`` ensures the user's active membership grants a permission.
- Organization scoping is enforced by requiring an active membership for a given
  organization id.
"""
import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models import OrganizationMember, Profile

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_profile(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Profile:
    """Resolve the authenticated profile from a bearer token."""
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    subject = payload.get("sub")
    try:
        profile_id = uuid.UUID(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject",
        )

    profile = db.get(Profile, profile_id)
    if profile is None or not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return profile


def get_current_membership(
    organization_id: uuid.UUID,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
) -> OrganizationMember:
    """Return the active membership for the profile in the given organization."""
    membership = (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.profile_id == profile.id,
            OrganizationMember.organization_id == organization_id,
        )
        .first()
    )
    if membership is None or membership.status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No active membership in this organization",
        )
    return membership


def require_permission(permission_code: str):
    """Return a dependency that enforces a single permission on the current user.

    Usage: ``Depends(require_permission("company:create"))``.
    """

    def _check(
        profile: Profile = Depends(get_current_profile),
        db: Session = Depends(get_db),
    ) -> Profile:
        if profile.is_superuser:
            return profile

        for membership in profile.memberships:
            if membership.status.value != "active":
                continue
            role = membership.role
            if role is None:
                continue
            codes = {p.code for p in role.permissions}
            if permission_code in codes:
                return profile

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing required permission: {permission_code}",
        )

    return _check
