"""Pydantic schemas for CRM foundation entities (companies, contacts, leads)."""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Lead sources ---
class LeadSourceBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    is_active: bool = True


class LeadSourceCreate(LeadSourceBase):
    pass


class LeadSourceUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None


class LeadSourceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    is_active: bool
    created_at: datetime


# --- Lead statuses ---
class LeadStatusBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str
    sort_order: int = 0


class LeadStatusCreate(LeadStatusBase):
    pass


class LeadStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    category: str
    sort_order: int


# --- Companies ---
class CompanyBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    website: str | None = None
    domain: str | None = None
    industry: str | None = None
    employee_range: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    linkedin_url: str | None = None
    description: str | None = None
    lead_source_id: uuid.UUID | None = None
    lead_status_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    research_notes: str | None = None
    next_follow_up_date: date | None = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    name: str | None = None
    website: str | None = None
    domain: str | None = None
    industry: str | None = None
    employee_range: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    linkedin_url: str | None = None
    description: str | None = None
    lead_source_id: uuid.UUID | None = None
    lead_status_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    research_notes: str | None = None
    next_follow_up_date: date | None = None


class CompanyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    website: str | None = None
    domain: str | None = None
    industry: str | None = None
    employee_range: str | None = None
    country: str | None = None
    region: str | None = None
    city: str | None = None
    linkedin_url: str | None = None
    description: str | None = None
    lead_source_id: uuid.UUID | None = None
    lead_status_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    research_notes: str | None = None
    next_follow_up_date: date | None = None
    created_at: datetime


# --- Contacts ---
class ContactBase(BaseModel):
    company_id: uuid.UUID
    first_name: str = Field(min_length=1, max_length=120)
    last_name: str = Field(min_length=1, max_length=120)
    job_title: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    owner_id: uuid.UUID | None = None
    verification_status: str = "unverified"
    consent_status: str = "unknown"
    do_not_contact: bool = False


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    company_id: uuid.UUID | None = None
    first_name: str | None = None
    last_name: str | None = None
    job_title: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    owner_id: uuid.UUID | None = None
    verification_status: str | None = None
    consent_status: str | None = None
    do_not_contact: bool | None = None


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    first_name: str
    last_name: str
    job_title: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    linkedin_url: str | None = None
    owner_id: uuid.UUID | None = None
    verification_status: str
    consent_status: str
    do_not_contact: bool
    created_at: datetime
