"""Pydantic schemas for finance (Phase 6)."""
import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


# --- Services catalogue ---
class ServiceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str | None = None
    pricing_model: str = "one_time"
    default_price: Decimal | None = None
    currency: str = "USD"


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None = None
    pricing_model: str
    default_price: Decimal | None = None
    currency: str


# --- Invoices ---
class InvoiceItemCreate(BaseModel):
    description: str | None = None
    quantity: int = 1
    unit_price: Decimal | None = None
    amount: Decimal | None = None


class InvoiceCreate(BaseModel):
    company_id: uuid.UUID
    contract_id: uuid.UUID | None = None
    invoice_number: str
    currency: str = "USD"
    issue_date: date | None = None
    due_date: date | None = None
    items: list[InvoiceItemCreate] = []


class InvoiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    invoice_number: str
    status: str
    currency: str
    subtotal: Decimal | None = None
    tax: Decimal | None = None
    total: Decimal | None = None
    issue_date: date | None = None
    due_date: date | None = None
    created_at: datetime


# --- Payments ---
class PaymentCreate(BaseModel):
    invoice_id: uuid.UUID
    company_id: uuid.UUID | None = None
    amount: Decimal = Field(gt=0)
    currency: str = "USD"
    method: str = "bank_transfer"
    reference: str | None = None
    status: str = "completed"
    payment_date: date | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    invoice_id: uuid.UUID
    amount: Decimal
    currency: str
    method: str
    status: str
    payment_date: date | None = None
    created_at: datetime


# --- Expenses ---
class ExpenseCreate(BaseModel):
    category: str | None = None
    amount: Decimal = Field(gt=0)
    currency: str = "USD"
    expense_date: date | None = None
    receipt_reference: str | None = None
    description: str | None = None


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str | None = None
    amount: Decimal
    currency: str
    expense_date: date | None = None
    receipt_reference: str | None = None
    description: str | None = None


# --- Revenue ---
class RevenueCreate(BaseModel):
    company_id: uuid.UUID | None = None
    type: str = "other"
    amount: Decimal = Field(gt=0)
    currency: str = "USD"
    record_date: date | None = None
    description: str | None = None


class RevenueOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID | None = None
    type: str
    amount: Decimal
    currency: str
    record_date: date | None = None
