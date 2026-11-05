"""Aggregate API v1 router."""
from fastapi import APIRouter

from app.api.v1.routers import (
    auth,
    campaigns,
    companies,
    contacts,
    deals,
    finance,
    health,
    work,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(companies.router)
api_router.include_router(contacts.router)
api_router.include_router(deals.router)
api_router.include_router(work.router)
api_router.include_router(campaigns.router)
api_router.include_router(finance.router)
