"""Campaigns and their channel configuration."""
import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CampaignStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    paused = "paused"
    completed = "completed"


class Campaign(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "campaigns"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[CampaignStatus] = mapped_column(
        Enum(CampaignStatus, name="campaign_status", create_type=True),
        default=CampaignStatus.draft,
        nullable=False,
    )
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )

    channels = relationship("CampaignChannel", back_populates="campaign", cascade="all, delete-orphan")
    steps = relationship("CampaignStep", back_populates="campaign", cascade="all, delete-orphan")
    enrollments = relationship("CampaignEnrollment", back_populates="campaign", cascade="all, delete-orphan")


class CampaignChannel(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "campaign_channels"

    campaign_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaigns.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    channel_type: Mapped[str] = mapped_column(String(40), nullable=False)  # email/linkedin/manual
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    email_account_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("email_accounts.id", ondelete="SET NULL"),
        nullable=True,
    )

    campaign = relationship("Campaign", back_populates="channels")
