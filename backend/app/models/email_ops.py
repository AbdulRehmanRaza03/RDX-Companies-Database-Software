"""Email messages, events, suppression list and sender accounts."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SendState(str, enum.Enum):
    draft = "draft"
    queued = "queued"
    sent = "sent"
    failed = "failed"


class EmailMessage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "email_messages"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    enrollment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaign_enrollments.id", ondelete="SET NULL"),
        nullable=True,
    )
    step_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("campaign_steps.id", ondelete="SET NULL"),
        nullable=True,
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email_account_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("email_accounts.id", ondelete="SET NULL"),
        nullable=True,
    )
    subject: Mapped[str | None] = mapped_column(String(255), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    send_state: Mapped[SendState] = mapped_column(
        Enum(SendState, name="send_state", create_type=True),
        default=SendState.draft,
        nullable=False,
    )
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class EventType(str, enum.Enum):
    delivered = "delivered"
    bounced = "bounced"
    opened = "opened"
    clicked = "clicked"
    replied = "replied"
    unsubscribed = "unsubscribed"
    complained = "complained"


class EmailEvent(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "email_events"

    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("email_messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[EventType] = mapped_column(
        Enum(EventType, name="email_event_type", create_type=True),
        nullable=False,
    )
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    metadata_json: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)


class SuppressionReason(str, enum.Enum):
    unsubscribe = "unsubscribe"
    bounce = "bounce"
    complaint = "complaint"
    invalid = "invalid"
    do_not_contact = "do_not_contact"


class SuppressionList(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "suppression_list"
    __table_args__ = (UniqueConstraint("organization_id", "email", name="uq_org_suppression_email"),)

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="SET NULL"),
        nullable=True,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    reason: Mapped[SuppressionReason] = mapped_column(
        Enum(SuppressionReason, name="suppression_reason", create_type=True),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )


class ConnectionState(str, enum.Enum):
    not_connected = "not_connected"
    connected = "connected"
    error = "error"


class EmailAccount(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "email_accounts"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    provider: Mapped[str | None] = mapped_column(String(120), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    connection_state: Mapped[ConnectionState] = mapped_column(
        Enum(ConnectionState, name="connection_state", create_type=True),
        default=ConnectionState.not_connected,
        nullable=False,
    )
    metadata_json: Mapped[dict | None] = mapped_column("metadata", JSONB, nullable=True)
