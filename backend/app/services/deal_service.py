"""Deal service: CRUD with stage-history tracking.

Every stage transition writes a ``DealStageHistory`` row (documented behavior in the
master spec: "Stage history records every stage transition").
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models import Deal, DealStageHistory
from app.schemas.sales import DealCreate, DealUpdate


def get_deal(db: Session, organization_id: uuid.UUID, deal_id: uuid.UUID) -> Deal:
    deal = db.get(Deal, deal_id)
    if deal is None or deal.organization_id != organization_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deal not found")
    return deal


def list_deals(
    db: Session,
    organization_id: uuid.UUID,
    *,
    pipeline_id: uuid.UUID | None = None,
    stage_id: uuid.UUID | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Deal], int]:
    query = select(Deal).where(Deal.organization_id == organization_id)
    if pipeline_id:
        query = query.where(Deal.pipeline_id == pipeline_id)
    if stage_id:
        query = query.where(Deal.stage_id == stage_id)
    if search:
        query = query.where(Deal.name.ilike(f"%{search}%"))

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Deal.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_deal(
    db: Session,
    organization_id: uuid.UUID,
    data: DealCreate,
    created_by: uuid.UUID | None,
) -> Deal:
    # Validate stage belongs to pipeline.
    from app.models import PipelineStage

    stage = db.get(PipelineStage, data.stage_id)
    if stage is None or stage.pipeline_id != data.pipeline_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Stage does not belong to the given pipeline",
        )

    deal = Deal(
        organization_id=organization_id,
        company_id=data.company_id,
        pipeline_id=data.pipeline_id,
        stage_id=data.stage_id,
        name=data.name,
        amount=data.amount,
        currency=data.currency,
        expected_close_date=data.expected_close_date,
        primary_contact_id=data.primary_contact_id,
        owner_id=data.owner_id,
        probability=data.probability,
        created_by=created_by,
    )
    db.add(deal)
    db.flush()

    db.add(DealStageHistory(deal_id=deal.id, from_stage_id=None, to_stage_id=data.stage_id, changed_by=created_by))
    db.commit()
    db.refresh(deal)
    return deal


def update_deal(
    db: Session,
    organization_id: uuid.UUID,
    deal_id: uuid.UUID,
    data: DealUpdate,
    updated_by: uuid.UUID | None,
) -> Deal:
    deal = get_deal(db, organization_id, deal_id)
    payload = data.model_dump(exclude_unset=True)

    new_stage_id = payload.get("stage_id")
    if new_stage_id and new_stage_id != deal.stage_id:
        from app.models import PipelineStage

        stage = db.get(PipelineStage, new_stage_id)
        if stage is None or stage.pipeline_id != deal.pipeline_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Stage does not belong to the deal's pipeline",
            )
        db.add(
            DealStageHistory(
                deal_id=deal.id,
                from_stage_id=deal.stage_id,
                to_stage_id=new_stage_id,
                changed_by=updated_by,
            )
        )
        # Update probability from the stage if not explicitly set.
        if "probability" not in payload:
            payload["probability"] = stage.probability

    for key, value in payload.items():
        setattr(deal, key, value)
    deal.updated_by = updated_by

    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


def get_stage_history(db: Session, organization_id: uuid.UUID, deal_id: uuid.UUID):
    deal = get_deal(db, organization_id, deal_id)
    rows = db.scalars(
        select(DealStageHistory)
        .where(DealStageHistory.deal_id == deal.id)
        .order_by(DealStageHistory.changed_at.asc())
    ).all()
    return list(rows)
