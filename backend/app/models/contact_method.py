"""Additional contact channels (secondary emails, WhatsApp, etc.)."""
import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ContactMethodType(str, enum.Enum):
    email = "email"
    phone = "phone"
    whatsapp = "whatsapp"
    other = "other"


class ContactMethod(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "contact_methods"

    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    method_type: Mapped[ContactMethodType] = mapped_column(
        Enum(ContactMethodType, name="contact_method_type", create_type=True),
        nullable=False,
    )
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    contact = relationship("Contact", back_populates="methods")
