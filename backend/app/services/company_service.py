"""Company service: CRUD, duplicate detection, search, filter, pagination."""
import uuid

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models import Company
from app.schemas.crm import CompanyCreate, CompanyUpdate


def normalize_domain(website: str | None) -> str | None:
    """Extract a normalized domain from a URL or plain domain string."""
    if not website:
        return None
    value = website.strip().lower()
    value = value.replace("https://", "").replace("http://", "")
    value = value.split("/")[0]
    value = value.split("?")[0].split("#")[0]
    value = value.strip(".")
    # Strip leading "www."
    if value.startswith("www."):
        value = value[4:]
    return value or None


def get_company(db: Session, organization_id: uuid.UUID, company_id: uuid.UUID) -> Company:
    company = db.get(Company, company_id)
    if company is None or company.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
        )
    return company


def list_companies(
    db: Session,
    organization_id: uuid.UUID,
    *,
    search: str | None = None,
    status_id: uuid.UUID | None = None,
    source_id: uuid.UUID | None = None,
    industry: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> tuple[list[Company], int]:
    query = select(Company).where(Company.organization_id == organization_id)

    if search:
        like = f"%{search}%"
        query = query.where(
            or_(
                Company.name.ilike(like),
                Company.domain.ilike(like),
                Company.website.ilike(like),
            )
        )
    if status_id:
        query = query.where(Company.lead_status_id == status_id)
    if source_id:
        query = query.where(Company.lead_source_id == source_id)
    if industry:
        query = query.where(Company.industry.ilike(f"%{industry}%"))

    total = db.scalar(
        select(func.count()).select_from(query.subquery())
    ) or 0

    rows = db.scalars(
        query.order_by(Company.created_at.desc()).offset(skip).limit(limit)
    ).all()

    return list(rows), total


def create_company(
    db: Session,
    organization_id: uuid.UUID,
    data: CompanyCreate,
    created_by: uuid.UUID | None,
) -> Company:
    domain = normalize_domain(data.website) or (data.domain or "").strip().lower() or None

    if domain:
        existing = db.scalar(
            select(Company).where(
                Company.organization_id == organization_id,
                Company.domain == domain,
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A company with domain '{domain}' already exists",
            )

    company = Company(
        organization_id=organization_id,
        name=data.name,
        website=data.website,
        domain=domain,
        industry=data.industry,
        employee_range=data.employee_range,
        country=data.country,
        region=data.region,
        city=data.city,
        linkedin_url=data.linkedin_url,
        description=data.description,
        lead_source_id=data.lead_source_id,
        lead_status_id=data.lead_status_id,
        owner_id=data.owner_id,
        research_notes=data.research_notes,
        next_follow_up_date=data.next_follow_up_date,
        created_by=created_by,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def update_company(
    db: Session,
    organization_id: uuid.UUID,
    company_id: uuid.UUID,
    data: CompanyUpdate,
    updated_by: uuid.UUID | None,
) -> Company:
    company = get_company(db, organization_id, company_id)
    payload = data.model_dump(exclude_unset=True)

    if "website" in payload or "domain" in payload:
        domain = normalize_domain(payload.get("website", company.website)) or (
            (payload.get("domain") or "").strip().lower() or None
        )
        if domain and domain != company.domain:
            existing = db.scalar(
                select(Company).where(
                    Company.organization_id == organization_id,
                    Company.domain == domain,
                    Company.id != company.id,
                )
            )
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A company with domain '{domain}' already exists",
                )
            payload["domain"] = domain

    for key, value in payload.items():
        setattr(company, key, value)
    company.updated_by = updated_by

    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def delete_company(
    db: Session, organization_id: uuid.UUID, company_id: uuid.UUID
) -> None:
    company = get_company(db, organization_id, company_id)
    db.delete(company)
    db.commit()
