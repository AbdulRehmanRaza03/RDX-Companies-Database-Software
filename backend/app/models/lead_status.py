"""Lead statuses (configurable) and status history."""
import enum
import uuid

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class LeadStatusCategory(str, enum.Enum):
    new = "new"
    qualified = "qualified"
    contacted = "contacted"
    meeting = "meeting"
    won = "won"
    lost = "lost"


class LeadStatus(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "lead_statuses"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[LeadStatusCategory] = mapped_column(
        Enum(LeadStatusCategory, name="lead_status_category", create_type=True),
        nullable=False,
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    companies = relationship("Company", back_populates="lead_status")


class LeadStatusHistory(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "lead_status_history"

    company_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    from_status_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lead_statuses.id", ondelete="SET NULL"),
        nullable=True,
    )
    to_status_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("lead_statuses.id", ondelete="SET NULL"),
        nullable=False,
    )
    changed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="SET NULL"),
        nullable=True,
    )
    changed_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
