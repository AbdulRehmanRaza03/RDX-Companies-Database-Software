"""Dashboard summary, pipeline and reports services.

All metrics are computed from live database aggregate queries (documented rule:
"Dashboard metrics must use backend aggregate queries. Do not hardcode demo numbers").
"""
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import (
    Activity,
    Campaign,
    CampaignEnrollment,
    Company,
    Contact,
    Deal,
    Expense,
    Invoice,
    LeadStatus,
    Meeting,
    Payment,
    RevenueRecord,
    Task,
)


def dashboard_summary(db: Session, organization_id: uuid.UUID) -> dict:
    """Aggregate KPIs for the dashboard."""
    companies = (
        db.scalar(select(func.count()).select_from(Company).where(Company.organization_id == organization_id))
        or 0
    )
    contacts = (
        db.scalar(select(func.count()).select_from(Contact).where(Contact.organization_id == organization_id))
        or 0
    )

    qualified = (
        db.scalar(
            select(func.count())
            .select_from(Company)
            .join(LeadStatus, Company.lead_status_id == LeadStatus.id)
            .where(Company.organization_id == organization_id, LeadStatus.category == "qualified")
        )
        or 0
    )

    open_deals = (
        db.scalar(select(func.count()).select_from(Deal).where(Deal.organization_id == organization_id, Deal.outcome == "open"))
        or 0
    )
    won_deals = (
        db.scalar(select(func.count()).select_from(Deal).where(Deal.organization_id == organization_id, Deal.outcome == "won"))
        or 0
    )

    pipeline_value = (
        db.scalar(
            select(func.coalesce(func.sum(Deal.amount), 0)).where(
                Deal.organization_id == organization_id, Deal.outcome == "open"
            )
        )
        or Decimal("0")
    )

    outstanding_invoices = (
        db.scalar(
            select(func.coalesce(func.sum(Invoice.total), 0)).where(
                Invoice.organization_id == organization_id,
                Invoice.status.in_(["sent", "overdue"]),
            )
        )
        or Decimal("0")
    )

    tasks_due = (
        db.scalar(select(func.count()).select_from(Task).where(Task.organization_id == organization_id, Task.status != "completed"))
        or 0
    )

    return {
        "companies": companies,
        "contacts": contacts,
        "qualified_leads": qualified,
        "open_deals": open_deals,
        "won_deals": won_deals,
        "pipeline_value": str(pipeline_value),
        "outstanding_invoices": str(outstanding_invoices),
        "open_tasks": tasks_due,
    }


def leads_by_status(db: Session, organization_id: uuid.UUID) -> list[dict]:
    rows = db.execute(
        select(LeadStatus.name, func.count(Company.id))
        .join(Company, Company.lead_status_id == LeadStatus.id)
        .where(Company.organization_id == organization_id)
        .group_by(LeadStatus.name, LeadStatus.sort_order)
        .order_by(LeadStatus.sort_order)
    ).all()
    return [{"status": name, "count": count} for name, count in rows]


def leads_by_source(db: Session, organization_id: uuid.UUID) -> list[dict]:
    from app.models import LeadSource

    rows = db.execute(
        select(LeadSource.name, func.count(Company.id))
        .join(Company, Company.lead_source_id == LeadSource.id)
        .where(Company.organization_id == organization_id)
        .group_by(LeadSource.name)
    ).all()
    return [{"source": name, "count": count} for name, count in rows]


def deals_by_stage(db: Session, organization_id: uuid.UUID) -> list[dict]:
    from app.models import PipelineStage

    rows = db.execute(
        select(PipelineStage.name, func.count(Deal.id), func.coalesce(func.sum(Deal.amount), 0))
        .join(Deal, Deal.stage_id == PipelineStage.id)
        .where(Deal.organization_id == organization_id)
        .group_by(PipelineStage.name, PipelineStage.sort_order)
        .order_by(PipelineStage.sort_order)
    ).all()
    return [{"stage": name, "count": count, "value": str(value)} for name, count, value in rows]


def pipeline_value(db: Session, organization_id: uuid.UUID) -> str:
    value = (
        db.scalar(
            select(func.coalesce(func.sum(Deal.amount), 0)).where(
                Deal.organization_id == organization_id, Deal.outcome == "open"
            )
        )
        or Decimal("0")
    )
    return str(value)


def revenue_over_time(db: Session, organization_id: uuid.UUID) -> list[dict]:
    rows = db.execute(
        select(RevenueRecord.record_date, func.coalesce(func.sum(RevenueRecord.amount), 0))
        .where(RevenueRecord.organization_id == organization_id)
        .group_by(RevenueRecord.record_date)
        .order_by(RevenueRecord.record_date)
    ).all()
    return [{"date": str(d), "amount": str(a)} for d, a in rows if d is not None]


def recent_activities(db: Session, organization_id: uuid.UUID, limit: int = 10) -> list[dict]:
    rows = db.scalars(
        select(Activity)
        .where(Activity.organization_id == organization_id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
    ).all()
    return [
        {"id": str(r.id), "type": r.type, "subject": r.subject, "created_at": r.created_at.isoformat()}
        for r in rows
    ]


def upcoming_meetings(db: Session, organization_id: uuid.UUID, limit: int = 5) -> list[dict]:
    now = datetime.now(timezone.utc)
    rows = db.scalars(
        select(Meeting)
        .where(Meeting.organization_id == organization_id, Meeting.scheduled_at >= now, Meeting.status == "scheduled")
        .order_by(Meeting.scheduled_at.asc())
        .limit(limit)
    ).all()
    return [{"id": str(r.id), "title": r.title, "scheduled_at": r.scheduled_at.isoformat() if r.scheduled_at else None} for r in rows]


def active_campaigns(db: Session, organization_id: uuid.UUID) -> list[dict]:
    rows = db.execute(
        select(Campaign.name, func.count(CampaignEnrollment.id))
        .outerjoin(CampaignEnrollment, CampaignEnrollment.campaign_id == Campaign.id)
        .where(Campaign.organization_id == organization_id, Campaign.status == "active")
        .group_by(Campaign.id, Campaign.name)
    ).all()
    return [{"campaign": name, "enrollments": count} for name, count in rows]


def team_workload(db: Session, organization_id: uuid.UUID) -> list[dict]:
    from app.models import OrganizationMember, Profile

    rows = db.execute(
        select(Profile.first_name, Profile.last_name, func.count(Task.id))
        .join(OrganizationMember, OrganizationMember.profile_id == Profile.id)
        .outerjoin(Task, (Task.assignee_id == Profile.id) & (Task.status != "completed"))
        .where(OrganizationMember.organization_id == organization_id)
        .group_by(Profile.id, Profile.first_name, Profile.last_name)
    ).all()
    return [{"name": f"{first or ''} {last or ''}".strip(), "open_tasks": count} for first, last, count in rows]


def expenses_total(db: Session, organization_id: uuid.UUID) -> str:
    total = (
        db.scalar(select(func.coalesce(func.sum(Expense.amount), 0)).where(Expense.organization_id == organization_id))
        or Decimal("0")
    )
    return str(total)


def revenue_total(db: Session, organization_id: uuid.UUID) -> str:
    total = (
        db.scalar(select(func.coalesce(func.sum(RevenueRecord.amount), 0)).where(RevenueRecord.organization_id == organization_id))
        or Decimal("0")
    )
    return str(total)
