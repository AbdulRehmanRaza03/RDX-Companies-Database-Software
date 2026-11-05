"""Authentication routes: login, refresh, logout, me, password change, register."""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.auth import (
    LoginRequest,
    PasswordChangeRequest,
    ProfileCreate,
    ProfileOut,
    TokenPair,
    TokenRefreshRequest,
)
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenPair)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    profile = auth_service.authenticate(db, data)
    return auth_service.issue_tokens(profile)


@router.post("/register", response_model=ProfileOut, status_code=status.HTTP_201_CREATED)
def register(data: ProfileCreate, db: Session = Depends(get_db)) -> Profile:
    return auth_service.register(db, data)


@router.post("/refresh", response_model=TokenPair)
def refresh(data: TokenRefreshRequest) -> TokenPair:
    return auth_service.refresh_tokens(data.refresh_token)


@router.post("/logout")
def logout() -> dict[str, str]:
    # Stateless JWT: client discards tokens. A denylist can be added later.
    return {"detail": "Logged out"}


@router.get("/me", response_model=ProfileOut)
def me(profile: Profile = Depends(get_current_profile)) -> Profile:
    return profile


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: PasswordChangeRequest,
    profile: Profile = Depends(get_current_profile),
    db: Session = Depends(get_db),
) -> None:
    auth_service.change_password(db, profile, data)
