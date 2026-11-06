"""Campaign service: campaigns, templates, enrollments, suppression.

Key documented rule: suppression is enforced before every enrolment. A contact whose
email is on the suppression list (or marked do_not_contact) cannot be enrolled.
"""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Campaign,
    CampaignEnrollment,
    Contact,
    EmailAccount,
    EmailTemplate,
    SuppressionList,
)


def _is_suppressed(db: Session, organization_id: uuid.UUID, contact: Contact) -> bool:
    """Check whether a contact is suppressed (list entry or do_not_contact flag)."""
    if contact.do_not_contact:
        return True
    if contact.email:
        entry = db.scalar(
            select(SuppressionList).where(
                SuppressionList.organization_id == organization_id,
                SuppressionList.email == contact.email.lower(),
            )
        )
        if entry is not None:
            return True
    return False


# --- Templates ---
def list_templates(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(EmailTemplate).where(EmailTemplate.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(EmailTemplate.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_template(db: Session, organization_id: uuid.UUID, data, created_by) -> EmailTemplate:
    t = EmailTemplate(organization_id=organization_id, created_by=created_by, **data.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


# --- Campaigns ---
def list_campaigns(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(Campaign).where(Campaign.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Campaign.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_campaign(db: Session, organization_id: uuid.UUID, data, owner_id) -> Campaign:
    c = Campaign(organization_id=organization_id, owner_id=owner_id, **data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


def delete_campaign(db: Session, organization_id: uuid.UUID, campaign_id: uuid.UUID) -> None:
    campaign = db.get(Campaign, campaign_id)
    if campaign is None or campaign.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(campaign)
    db.commit()


# --- Enrollments ---
def enroll_contact(db: Session, organization_id: uuid.UUID, data) -> CampaignEnrollment:
    contact = db.get(Contact, data.contact_id)
    if contact is None or contact.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Contact not found")

    campaign = db.get(Campaign, data.campaign_id)
    if campaign is None or campaign.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Campaign not found")

    # Suppression check (documented mandatory behavior).
    if _is_suppressed(db, organization_id, contact):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Contact is suppressed and cannot be enrolled",
        )

    # Duplicate enrollment check.
    existing = db.scalar(
        select(CampaignEnrollment).where(
            CampaignEnrollment.campaign_id == data.campaign_id,
            CampaignEnrollment.contact_id == data.contact_id,
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Contact is already enrolled in this campaign",
        )

    from datetime import datetime, timezone

    enrollment = CampaignEnrollment(
        campaign_id=data.campaign_id,
        contact_id=data.contact_id,
        enrolled_at=datetime.now(timezone.utc),
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def list_enrollments(db: Session, organization_id: uuid.UUID, campaign_id: uuid.UUID | None = None, *, skip=0, limit=50):
    query = select(CampaignEnrollment).join(Campaign).where(Campaign.organization_id == organization_id)
    if campaign_id:
        query = query.where(CampaignEnrollment.campaign_id == campaign_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(CampaignEnrollment.enrolled_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


# --- Suppression ---
def add_suppression(db: Session, organization_id: uuid.UUID, data) -> SuppressionList:
    email = data.email.lower().strip()
    existing = db.scalar(
        select(SuppressionList).where(
            SuppressionList.organization_id == organization_id,
            SuppressionList.email == email,
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email already suppressed")

    entry = SuppressionList(
        organization_id=organization_id,
        email=email,
        reason=data.reason,
        contact_id=data.contact_id,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def list_suppression(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(SuppressionList).where(SuppressionList.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(SuppressionList.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


# --- Email accounts ---
def list_email_accounts(db: Session, organization_id: uuid.UUID):
    return list(
        db.scalars(select(EmailAccount).where(EmailAccount.organization_id == organization_id)).all()
    )


def create_email_account(db: Session, organization_id: uuid.UUID, data) -> EmailAccount:
    a = EmailAccount(organization_id=organization_id, **data.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a
