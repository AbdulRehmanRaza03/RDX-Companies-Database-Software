"""Finance service: invoices, payments, expenses, revenue, service catalogue.

Documented rules:
- Money uses Decimal (Numeric(12,2)), never float.
- Currency is explicit; totals do not silently mix currencies.
- Multi-step operations (invoice + items) run in a transaction.
"""
import uuid
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Expense,
    Invoice,
    InvoiceItem,
    Payment,
    RevenueRecord,
    Service,
)


def _compute_totals(items) -> tuple[Decimal, Decimal]:
    """Return (subtotal, total) using Decimal arithmetic."""
    subtotal = Decimal("0")
    for item in items:
        qty = Decimal(item.quantity)
        price = item.unit_price or Decimal("0")
        amount = item.amount if item.amount is not None else qty * price
        subtotal += amount
    # Flat 0% tax in v1; tax handling can be extended later.
    tax = Decimal("0")
    return subtotal.quantize(Decimal("0.01")), (subtotal + tax).quantize(Decimal("0.01"))


# --- Services ---
def list_services(db: Session, organization_id: uuid.UUID):
    return list(db.scalars(select(Service).where(Service.organization_id == organization_id)).all())


def create_service(db: Session, organization_id: uuid.UUID, data) -> Service:
    s = Service(organization_id=organization_id, **data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


# --- Invoices ---
def list_invoices(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(Invoice).where(Invoice.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Invoice.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_invoice(db: Session, organization_id: uuid.UUID, data, created_by) -> Invoice:
    # Validate unique invoice number within org/global.
    existing = db.scalar(select(Invoice).where(Invoice.invoice_number == data.invoice_number))
    if existing:
        raise HTTPException(status_code=409, detail="Invoice number already exists")

    invoice = Invoice(
        organization_id=organization_id,
        company_id=data.company_id,
        contract_id=data.contract_id,
        invoice_number=data.invoice_number,
        currency=data.currency,
        issue_date=data.issue_date,
        due_date=data.due_date,
        created_by=created_by,
    )
    db.add(invoice)
    db.flush()

    items = []
    for it in data.items:
        amount = it.amount if it.amount is not None else (Decimal(it.quantity) * (it.unit_price or Decimal("0")))
        items.append(
            InvoiceItem(
                invoice_id=invoice.id,
                description=it.description,
                quantity=it.quantity,
                unit_price=it.unit_price,
                amount=amount.quantize(Decimal("0.01")),
            )
        )
    db.add_all(items)

    subtotal, total = _compute_totals(items)
    invoice.subtotal = subtotal
    invoice.tax = Decimal("0")
    invoice.total = total

    db.commit()
    db.refresh(invoice)
    return invoice


# --- Payments ---
def list_payments(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(Payment).where(Payment.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Payment.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_payment(db: Session, organization_id: uuid.UUID, data) -> Payment:
    invoice = db.get(Invoice, data.invoice_id)
    if invoice is None or invoice.organization_id != organization_id:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = Payment(
        organization_id=organization_id,
        invoice_id=data.invoice_id,
        company_id=data.company_id or invoice.company_id,
        amount=data.amount,
        currency=data.currency,
        method=data.method,
        reference=data.reference,
        status=data.status,
        payment_date=data.payment_date,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


# --- Expenses ---
def list_expenses(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(Expense).where(Expense.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Expense.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_expense(db: Session, organization_id: uuid.UUID, data, created_by) -> Expense:
    e = Expense(organization_id=organization_id, created_by=created_by, **data.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return e


# --- Revenue ---
def list_revenue(db: Session, organization_id: uuid.UUID, *, skip=0, limit=50):
    query = select(RevenueRecord).where(RevenueRecord.organization_id == organization_id)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(RevenueRecord.created_at.desc()).offset(skip).limit(limit)).all()
    return list(rows), total


def create_revenue(db: Session, organization_id: uuid.UUID, data) -> RevenueRecord:
    r = RevenueRecord(organization_id=organization_id, **data.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)
    return r
