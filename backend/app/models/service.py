"""Services catalogue, client services and client requirements (Module E)."""
import enum
import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PricingModel(str, enum.Enum):
    one_time = "one_time"
    recurring = "recurring"
    hourly = "hourly"


class Service(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "services"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    pricing_model: Mapped[PricingModel] = mapped_column(
        Enum(PricingModel, name="pricing_model", create_type=True),
        nullable=False,
    )
    default_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)


class ClientServiceStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    ended = "ended"


class ClientService(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "client_services"

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
    service_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("services.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    status: Mapped[ClientServiceStatus] = mapped_column(
        Enum(ClientServiceStatus, name="client_service_status", create_type=True),
        default=ClientServiceStatus.active,
        nullable=False,
    )
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)


class ClientRequirement(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "client_requirements"

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
    icp: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_geography: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_industry: Mapped[str | None] = mapped_column(Text, nullable=True)
    exclusions: Mapped[str | None] = mapped_column(Text, nullable=True)
    volume: Mapped[int | None] = mapped_column(Integer, nullable=True)
    success_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
