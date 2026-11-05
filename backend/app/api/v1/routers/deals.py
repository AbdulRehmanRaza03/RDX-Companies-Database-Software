"""Deals router."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.sales import DealCreate, DealOut, DealUpdate
from app.services import deal_service

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("", response_model=dict)
def list_deals(
    organization_id: uuid.UUID = Query(...),
    pipeline_id: uuid.UUID | None = None,
    stage_id: uuid.UUID | None = None,
    search: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = deal_service.list_deals(
        db, organization_id, pipeline_id=pipeline_id, stage_id=stage_id, search=search, skip=skip, limit=limit
    )
    return {"items": [DealOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.get("/{deal_id}", response_model=DealOut)
def get_deal(
    organization_id: uuid.UUID,
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return deal_service.get_deal(db, organization_id, deal_id)


@router.post("", response_model=DealOut, status_code=status.HTTP_201_CREATED)
def create_deal(
    data: DealCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return deal_service.create_deal(db, organization_id, data, profile.id)


@router.patch("/{deal_id}", response_model=DealOut)
def update_deal(
    deal_id: uuid.UUID,
    data: DealUpdate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return deal_service.update_deal(db, organization_id, deal_id, data, profile.id)


@router.get("/{deal_id}/history", response_model=list[dict])
def stage_history(
    organization_id: uuid.UUID,
    deal_id: uuid.UUID,
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows = deal_service.get_stage_history(db, organization_id, deal_id)
    return [
        {
            "id": str(r.id),
            "from_stage_id": str(r.from_stage_id) if r.from_stage_id else None,
            "to_stage_id": str(r.to_stage_id),
            "changed_by": str(r.changed_by) if r.changed_by else None,
            "changed_at": r.changed_at.isoformat(),
        }
        for r in rows
    ]
