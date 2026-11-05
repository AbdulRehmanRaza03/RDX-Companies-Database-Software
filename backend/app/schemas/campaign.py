"""Pydantic schemas for campaign management (Phase 5)."""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# --- Email templates ---
class TemplateBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    subject: str | None = None
    body: str = Field(min_length=1)


class TemplateCreate(TemplateBase):
    pass


class TemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    subject: str | None = None
    body: str
    created_at: datetime


# --- Campaigns ---
class CampaignBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    status: str = "draft"


class CampaignCreate(CampaignBase):
    pass


class CampaignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    status: str
    owner_id: uuid.UUID | None = None
    created_at: datetime


# --- Enrollment ---
class EnrollmentCreate(BaseModel):
    campaign_id: uuid.UUID
    contact_id: uuid.UUID


class EnrollmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    campaign_id: uuid.UUID
    contact_id: uuid.UUID
    status: str
    enrolled_at: datetime


# --- Suppression ---
class SuppressionCreate(BaseModel):
    email: str = Field(min_length=1, max_length=320)
    reason: str
    contact_id: uuid.UUID | None = None


class SuppressionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    reason: str
    contact_id: uuid.UUID | None = None
    created_at: datetime


# --- Email accounts ---
class EmailAccountCreate(BaseModel):
    email: str = Field(min_length=1, max_length=320)
    provider: str | None = None
    display_name: str | None = None


class EmailAccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    provider: str | None = None
    display_name: str | None = None
    connection_state: str
