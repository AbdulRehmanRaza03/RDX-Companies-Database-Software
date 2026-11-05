"""Companies router."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.crm import CompanyCreate, CompanyOut, CompanyUpdate
from app.services import company_service

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=dict)
def list_companies(
    organization_id: uuid.UUID = Query(...),
    search: str | None = None,
    status_id: uuid.UUID | None = None,
    source_id: uuid.UUID | None = None,
    industry: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = company_service.list_companies(
        db,
        organization_id,
        search=search,
        status_id=status_id,
        source_id=source_id,
        industry=industry,
        skip=skip,
        limit=limit,
    )
    return {"items": [CompanyOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.get("/{company_id}", response_model=CompanyOut)
def get_company(
    organization_id: uuid.UUID,
    company_id: uuid.UUID,
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return company_service.get_company(db, organization_id, company_id)


@router.post("", response_model=CompanyOut, status_code=status.HTTP_201_CREATED)
def create_company(
    data: CompanyCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return company_service.create_company(db, organization_id, data, profile.id)


@router.patch("/{company_id}", response_model=CompanyOut)
def update_company(
    company_id: uuid.UUID,
    data: CompanyUpdate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return company_service.update_company(db, organization_id, company_id, data, profile.id)


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(
    company_id: uuid.UUID,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    company_service.delete_company(db, organization_id, company_id)
