"""SQLAlchemy models package — imports register all models on Base.metadata."""
from app.models.activity import Activity
from app.models.audit_log import AuditLog
from app.models.campaign import Campaign, CampaignChannel
from app.models.company import Company
from app.models.contact import Contact
from app.models.contact_method import ContactMethod
from app.models.contract import Contract, ContractItem
from app.models.deal import Deal, DealStageHistory
from app.models.email_ops import (
    EmailAccount,
    EmailEvent,
    EmailMessage,
    SuppressionList,
)
from app.models.email_template import CampaignEnrollment, CampaignStep, EmailTemplate
from app.models.finance import (
    Expense,
    Invoice,
    InvoiceItem,
    Payment,
    RevenueRecord,
)
from app.models.invitation import Invitation
from app.models.lead_source import LeadSource
from app.models.lead_status import LeadStatus, LeadStatusHistory
from app.models.lead_tag import LeadTag, LeadTagAssignment
from app.models.meeting import Meeting, MeetingAttendee
from app.models.organization import Organization
from app.models.organization_member import OrganizationMember
from app.models.pipeline import Pipeline, PipelineStage
from app.models.profile import Profile
from app.models.proposal import Proposal
from app.models.role import Permission, Role, role_permissions
from app.models.service import ClientRequirement, ClientService, Service
from app.models.system import Integration, Notification
from app.models.task import Note, Task

__all__ = [
    "Activity",
    "AuditLog",
    "Campaign",
    "CampaignChannel",
    "CampaignEnrollment",
    "CampaignStep",
    "ClientRequirement",
    "ClientService",
    "Company",
    "Contact",
    "ContactMethod",
    "Contract",
    "ContractItem",
    "Deal",
    "DealStageHistory",
    "EmailAccount",
    "EmailEvent",
    "EmailMessage",
    "EmailTemplate",
    "Expense",
    "Integration",
    "Invoice",
    "InvoiceItem",
    "Invitation",
    "LeadSource",
    "LeadStatus",
    "LeadStatusHistory",
    "LeadTag",
    "LeadTagAssignment",
    "Meeting",
    "MeetingAttendee",
    "Note",
    "Notification",
    "Organization",
    "OrganizationMember",
    "Payment",
    "Permission",
    "Pipeline",
    "PipelineStage",
    "Profile",
    "Proposal",
    "RevenueRecord",
    "Role",
    "Service",
    "SuppressionList",
    "Task",
    "role_permissions",
]
