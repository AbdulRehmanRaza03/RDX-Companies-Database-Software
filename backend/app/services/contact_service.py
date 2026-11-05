"""Contact service: CRUD and duplicate detection."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models import Contact
from app.schemas.crm import ContactCreate, ContactUpdate


def normalize_email(email: str | None) -> str | None:
    if not email:
        return None
    return email.strip().lower()


def get_contact(db: Session, organization_id: uuid.UUID, contact_id: uuid.UUID) -> Contact:
    contact = db.get(Contact, contact_id)
    if contact is None or contact.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found"
        )
    return contact


def list_contacts(
    db: Session,
    organization_id: uuid.UUID,
    *,
    company_id: uuid.UUID | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Contact], int]:
    query = select(Contact).where(Contact.organization_id == organization_id)

    if company_id:
        query = query.where(Contact.company_id == company_id)
    if search:
        like = f"%{search}%"
        query = query.where(
            or_(
                Contact.first_name.ilike(like),
                Contact.last_name.ilike(like),
                Contact.email.ilike(like),
                Contact.job_title.ilike(like),
            )
        )

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        query.order_by(Contact.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return list(rows), total


def create_contact(
    db: Session,
    organization_id: uuid.UUID,
    data: ContactCreate,
    created_by: uuid.UUID | None,
) -> Contact:
    email = normalize_email(data.email)
    if email:
        existing = db.scalar(
            select(Contact).where(
                Contact.organization_id == organization_id,
                Contact.email == email,
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A contact with email '{email}' already exists",
            )

    contact = Contact(
        organization_id=organization_id,
        company_id=data.company_id,
        first_name=data.first_name,
        last_name=data.last_name,
        job_title=data.job_title,
        email=email,
        phone=data.phone,
        linkedin_url=data.linkedin_url,
        owner_id=data.owner_id,
        verification_status=data.verification_status,
        consent_status=data.consent_status,
        do_not_contact=data.do_not_contact,
        created_by=created_by,
    )
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(
    db: Session,
    organization_id: uuid.UUID,
    contact_id: uuid.UUID,
    data: ContactUpdate,
    updated_by: uuid.UUID | None,
) -> Contact:
    contact = get_contact(db, organization_id, contact_id)
    payload = data.model_dump(exclude_unset=True)

    if "email" in payload:
        email = normalize_email(payload["email"])
        if email and email != contact.email:
            existing = db.scalar(
                select(Contact).where(
                    Contact.organization_id == organization_id,
                    Contact.email == email,
                    Contact.id != contact.id,
                )
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A contact with email '{email}' already exists",
                )
            payload["email"] = email

    for key, value in payload.items():
        setattr(contact, key, value)
    contact.updated_by = updated_by

    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def delete_contact(
    db: Session, organization_id: uuid.UUID, contact_id: uuid.UUID
) -> None:
    contact = get_contact(db, organization_id, contact_id)
    db.delete(contact)
    db.commit()
