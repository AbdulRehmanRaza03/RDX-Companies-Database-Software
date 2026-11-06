"""Campaign management router."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.campaign import (
    CampaignCreate,
    CampaignOut,
    EmailAccountCreate,
    EmailAccountOut,
    EnrollmentCreate,
    EnrollmentOut,
    SuppressionCreate,
    SuppressionOut,
    TemplateCreate,
    TemplateOut,
)
from app.services import campaign_service

router = APIRouter(tags=["campaigns"])


# --- Templates ---
@router.get("/templates", response_model=dict)
def list_templates(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = campaign_service.list_templates(db, organization_id, skip=skip, limit=limit)
    return {"items": [TemplateOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/templates", response_model=TemplateOut, status_code=status.HTTP_201_CREATED)
def create_template(
    data: TemplateCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return campaign_service.create_template(db, organization_id, data, profile.id)


# --- Campaigns ---
@router.get("/campaigns", response_model=dict)
def list_campaigns(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = campaign_service.list_campaigns(db, organization_id, skip=skip, limit=limit)
    return {"items": [CampaignOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/campaigns", response_model=CampaignOut, status_code=status.HTTP_201_CREATED)
def create_campaign(
    data: CampaignCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return campaign_service.create_campaign(db, organization_id, data, profile.id)


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: uuid.UUID,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    campaign_service.delete_campaign(db, organization_id, campaign_id)


# --- Enrollments ---
@router.get("/enrollments", response_model=dict)
def list_enrollments(
    organization_id: uuid.UUID = Query(...),
    campaign_id: uuid.UUID | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = campaign_service.list_enrollments(db, organization_id, campaign_id, skip=skip, limit=limit)
    return {"items": [EnrollmentOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/enrollments", response_model=EnrollmentOut, status_code=status.HTTP_201_CREATED)
def enroll(
    data: EnrollmentCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return campaign_service.enroll_contact(db, organization_id, data)


# --- Suppression ---
@router.get("/suppression-list", response_model=dict)
def list_suppression(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = campaign_service.list_suppression(db, organization_id, skip=skip, limit=limit)
    return {"items": [SuppressionOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/suppression-list", response_model=SuppressionOut, status_code=status.HTTP_201_CREATED)
def add_suppression(
    data: SuppressionCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return campaign_service.add_suppression(db, organization_id, data)


# --- Email accounts ---
@router.get("/email-accounts", response_model=list[EmailAccountOut])
def list_email_accounts(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return campaign_service.list_email_accounts(db, organization_id)


@router.post("/email-accounts", response_model=EmailAccountOut, status_code=status.HTTP_201_CREATED)
def create_email_account(
    data: EmailAccountCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return campaign_service.create_email_account(db, organization_id, data)
