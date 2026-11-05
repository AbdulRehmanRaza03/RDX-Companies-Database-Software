"""Contacts (decision-makers and other people at companies)."""
import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class VerificationStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"
    invalid = "invalid"


class ConsentStatus(str, enum.Enum):
    unknown = "unknown"
    granted = "granted"
    denied = "denied"


class Contact(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "contacts"
    __table_args__ = (
        UniqueConstraint("organization_id", "email", name="uq_org_email"),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    first_name: Mapped[str] = mapped_column(String(120), nullable=False)
    last_name: Mapped[str] = mapped_column(String(120), nullable=False)
    job_title: Mapped[str | None] = mapped_column(String(160), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus, name="verification_status", create_type=True),
        default=VerificationStatus.unverified,
        nullable=False,
    )
    consent_status: Mapped[ConsentStatus] = mapped_column(
        Enum(ConsentStatus, name="consent_status", create_type=True),
        default=ConsentStatus.unknown,
        nullable=False,
    )
    do_not_contact: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )

    company = relationship("Company", back_populates="contacts")
    methods = relationship(
        "ContactMethod", back_populates="contact", cascade="all, delete-orphan"
    )
