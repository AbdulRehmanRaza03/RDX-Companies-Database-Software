"""Sales pipelines and their ordered stages."""
import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Pipeline(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "pipelines"

    organization_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    stages = relationship(
        "PipelineStage",
        back_populates="pipeline",
        cascade="all, delete-orphan",
        order_by="PipelineStage.sort_order",
    )


class PipelineStage(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "pipeline_stages"

    pipeline_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    probability: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    pipeline = relationship("Pipeline", back_populates="stages")
