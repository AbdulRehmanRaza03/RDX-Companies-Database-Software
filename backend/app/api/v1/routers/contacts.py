"""Contacts router."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.crm import ContactCreate, ContactOut, ContactUpdate
from app.services import contact_service

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("", response_model=dict)
def list_contacts(
    organization_id: uuid.UUID = Query(...),
    company_id: uuid.UUID | None = None,
    search: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = contact_service.list_contacts(
        db,
        organization_id,
        company_id=company_id,
        search=search,
        skip=skip,
        limit=limit,
    )
    return {"items": [ContactOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.get("/{contact_id}", response_model=ContactOut)
def get_contact(
    organization_id: uuid.UUID,
    contact_id: uuid.UUID,
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return contact_service.get_contact(db, organization_id, contact_id)


@router.post("", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(
    data: ContactCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return contact_service.create_contact(db, organization_id, data, profile.id)


@router.patch("/{contact_id}", response_model=ContactOut)
def update_contact(
    contact_id: uuid.UUID,
    data: ContactUpdate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return contact_service.update_contact(db, organization_id, contact_id, data, profile.id)


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: uuid.UUID,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    contact_service.delete_contact(db, organization_id, contact_id)
