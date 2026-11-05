"""Email templates, campaign steps and enrollments."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class EmailTemplate(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "email_templates"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )


class CampaignStep(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "campaign_steps"

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    template_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("email_templates.id", ondelete="SET NULL"),
        nullable=True,
    )
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    delay_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    step_type: Mapped[str] = mapped_column(String(20), default="email", nullable=False)  # email/task/manual

    campaign = relationship("Campaign", back_populates="steps")
    template = relationship("EmailTemplate")


class EnrollmentStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    unsubscribed = "unsubscribed"
    bounced = "bounced"
    completed = "completed"


class CampaignEnrollment(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "campaign_enrollments"
    __table_args__ = (UniqueConstraint("campaign_id", "contact_id", name="uq_campaign_contact"),)

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(EnrollmentStatus, name="enrollment_status", create_type=True),
        default=EnrollmentStatus.active,
        nullable=False,
    )
    current_step_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaign_steps.id", ondelete="SET NULL"),
        nullable=True,
    )
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    campaign = relationship("Campaign", back_populates="enrollments")
