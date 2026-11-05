"""Organization membership (links a profile to an organization with a role)."""
import enum
import uuid

from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MemberStatus(str, enum.Enum):
    active = "active"
    invited = "invited"
    suspended = "suspended"


class OrganizationMember(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "organization_members"
    __table_args__ = (
        UniqueConstraint("organization_id", "profile_id", name="uq_org_profile"),
    )

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="SET NULL"),
        nullable=True,
    )
    status: Mapped[MemberStatus] = mapped_column(
        Enum(MemberStatus, name="member_status", create_type=True),
        default=MemberStatus.active,
        nullable=False,
    )

    organization: Mapped["Organization"] = relationship(back_populates="members")
    profile: Mapped["Profile"] = relationship(back_populates="memberships")
    role: Mapped["Role"] = relationship()
