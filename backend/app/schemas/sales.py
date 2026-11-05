"""Pydantic schemas for sales & work management (Phase 4)."""
import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# --- Deals ---
class DealBase(BaseModel):
    company_id: uuid.UUID
    pipeline_id: uuid.UUID
    stage_id: uuid.UUID
    name: str = Field(min_length=1, max_length=255)
    amount: Decimal | None = None
    currency: str = "USD"
    expected_close_date: date | None = None
    primary_contact_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    probability: int = Field(default=0, ge=0, le=100)


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    name: str | None = None
    amount: Decimal | None = None
    currency: str | None = None
    expected_close_date: date | None = None
    primary_contact_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    probability: int | None = Field(default=None, ge=0, le=100)
    stage_id: uuid.UUID | None = None
    outcome: str | None = None
    loss_reason: str | None = None


class DealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    pipeline_id: uuid.UUID
    stage_id: uuid.UUID
    name: str
    amount: Decimal | None = None
    currency: str
    expected_close_date: date | None = None
    primary_contact_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    probability: int
    outcome: str
    loss_reason: str | None = None
    created_at: datetime


# --- Tasks ---
class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    assignee_id: uuid.UUID | None = None
    priority: str = "medium"
    status: str = "open"
    due_date: date | None = None
    related_type: str | None = None
    related_id: uuid.UUID | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    assignee_id: uuid.UUID | None = None
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str | None = None
    assignee_id: uuid.UUID | None = None
    priority: str
    status: str
    due_date: date | None = None
    related_type: str | None = None
    related_id: uuid.UUID | None = None
    created_at: datetime


# --- Notes ---
class NoteCreate(BaseModel):
    noteable_type: str = Field(min_length=1, max_length=40)
    noteable_id: uuid.UUID
    content: str = Field(min_length=1)


class NoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    noteable_type: str
    noteable_id: uuid.UUID
    content: str
    author_id: uuid.UUID
    created_at: datetime


# --- Activities ---
class ActivityCreate(BaseModel):
    type: str
    subject: str | None = None
    description: str | None = None
    company_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None
    deal_id: uuid.UUID | None = None
    occurred_at: datetime | None = None


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    subject: str | None = None
    description: str | None = None
    company_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None
    deal_id: uuid.UUID | None = None
    owner_id: uuid.UUID
    occurred_at: datetime | None = None
    created_at: datetime


# --- Meetings ---
class MeetingCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    agenda: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    location: str | None = None
    company_id: uuid.UUID | None = None
    deal_id: uuid.UUID | None = None
    status: str = "scheduled"


class MeetingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    agenda: str | None = None
    outcome: str | None = None
    scheduled_at: datetime | None = None
    duration_minutes: int | None = None
    location: str | None = None
    organizer_id: uuid.UUID
    company_id: uuid.UUID | None = None
    deal_id: uuid.UUID | None = None
    status: str
    created_at: datetime


# --- Pipelines ---
class PipelineStageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    sort_order: int
    probability: int


class PipelineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    is_default: bool
    stages: list[PipelineStageOut] = []


class PipelineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    is_default: bool = False
    stages: list[dict] = []


class PipelineUpdate(BaseModel):
    name: str | None = None
    is_default: bool | None = None
