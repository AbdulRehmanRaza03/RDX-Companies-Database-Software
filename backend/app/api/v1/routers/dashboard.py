"""Dashboard and reports router."""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.deps import get_current_profile
from app.db.session import get_db
from app.models import Profile
from app.services import dashboard_service

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary")
def summary(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return dashboard_service.dashboard_summary(db, organization_id)


@router.get("/dashboard/pipeline")
def pipeline(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {
        "deals_by_stage": dashboard_service.deals_by_stage(db, organization_id),
        "pipeline_value": dashboard_service.pipeline_value(db, organization_id),
    }


@router.get("/reports/leads-by-status")
def leads_by_status(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.leads_by_status(db, organization_id)}


@router.get("/reports/leads-by-source")
def leads_by_source(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.leads_by_source(db, organization_id)}


@router.get("/reports/deals-by-stage")
def deals_by_stage(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.deals_by_stage(db, organization_id)}


@router.get("/reports/revenue-over-time")
def revenue_over_time(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.revenue_over_time(db, organization_id)}


@router.get("/dashboard/activity-feed")
def activity_feed(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.recent_activities(db, organization_id)}


@router.get("/dashboard/upcoming-meetings")
def upcoming_meetings(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.upcoming_meetings(db, organization_id)}


@router.get("/dashboard/campaign-performance")
def campaign_performance(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.active_campaigns(db, organization_id)}


@router.get("/dashboard/team-workload")
def team_workload(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {"items": dashboard_service.team_workload(db, organization_id)}


@router.get("/reports/financials")
def financials(
    organization_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
    profile: Profile = Depends(get_current_profile),
):
    return {
        "expenses_total": dashboard_service.expenses_total(db, organization_id),
        "revenue_total": dashboard_service.revenue_total(db, organization_id),
    }
