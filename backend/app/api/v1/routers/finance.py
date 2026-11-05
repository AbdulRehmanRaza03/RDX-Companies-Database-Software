"""Finance and services router."""
import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.schemas.finance import (
    ExpenseCreate,
    ExpenseOut,
    InvoiceCreate,
    InvoiceOut,
    PaymentCreate,
    PaymentOut,
    RevenueCreate,
    RevenueOut,
    ServiceCreate,
    ServiceOut,
)
from app.services import finance_service

router = APIRouter(tags=["finance"])


# --- Services ---
@router.get("/services", response_model=list[ServiceOut])
def list_services(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return finance_service.list_services(db, organization_id)


@router.post("/services", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    data: ServiceCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return finance_service.create_service(db, organization_id, data)


# --- Invoices ---
@router.get("/invoices", response_model=dict)
def list_invoices(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = finance_service.list_invoices(db, organization_id, skip=skip, limit=limit)
    return {"items": [InvoiceOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/invoices", response_model=InvoiceOut, status_code=status.HTTP_201_CREATED)
def create_invoice(
    data: InvoiceCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return finance_service.create_invoice(db, organization_id, data, profile.id)


# --- Payments ---
@router.get("/payments", response_model=dict)
def list_payments(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = finance_service.list_payments(db, organization_id, skip=skip, limit=limit)
    return {"items": [PaymentOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/payments", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def create_payment(
    data: PaymentCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return finance_service.create_payment(db, organization_id, data)


# --- Expenses ---
@router.get("/expenses", response_model=dict)
def list_expenses(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = finance_service.list_expenses(db, organization_id, skip=skip, limit=limit)
    return {"items": [ExpenseOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/expenses", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    data: ExpenseCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return finance_service.create_expense(db, organization_id, data, profile.id)


# --- Revenue ---
@router.get("/revenue", response_model=dict)
def list_revenue(
    organization_id: uuid.UUID = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    rows, total = finance_service.list_revenue(db, organization_id, skip=skip, limit=limit)
    return {"items": [RevenueOut.model_validate(r).model_dump() for r in rows], "total": total}


@router.post("/revenue", response_model=RevenueOut, status_code=status.HTTP_201_CREATED)
def create_revenue(
    data: RevenueCreate,
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return finance_service.create_revenue(db, organization_id, data)
