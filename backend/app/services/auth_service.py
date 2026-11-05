"""Authentication service: login, registration, password change."""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models import Profile
from app.schemas.auth import (
    LoginRequest,
    PasswordChangeRequest,
    ProfileCreate,
    TokenPair,
)


def authenticate(db: Session, login: LoginRequest) -> Profile:
    """Validate credentials and return the profile (raises 401 on failure)."""
    profile = (
        db.query(Profile)
        .filter(Profile.email == login.email.lower().strip())
        .first()
    )
    if profile is None or not verify_password(login.password, profile.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not profile.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )
    return profile


def issue_tokens(profile: Profile) -> TokenPair:
    """Issue a new access + refresh token pair for a profile."""
    subject = str(profile.id)
    return TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


def refresh_tokens(refresh_token: str) -> TokenPair:
    """Exchange a valid refresh token for a new token pair."""
    from app.core.security import decode_token

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    subject = payload.get("sub")
    try:
        uuid.UUID(subject)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    return TokenPair(
        access_token=create_access_token(subject),
        refresh_token=create_refresh_token(subject),
    )


def register(db: Session, data: ProfileCreate) -> Profile:
    """Create a new profile account."""
    email = data.email.lower().strip()
    existing = db.query(Profile).filter(Profile.email == email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    profile = Profile(
        email=email,
        password_hash=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        phone=data.phone,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def change_password(
    db: Session, profile: Profile, data: PasswordChangeRequest
) -> None:
    """Change the current profile's password after verifying the old one."""
    if not verify_password(data.current_password, profile.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    profile.password_hash = hash_password(data.new_password)
    profile.updated_at = datetime.now(timezone.utc)
    db.add(profile)
    db.commit()
