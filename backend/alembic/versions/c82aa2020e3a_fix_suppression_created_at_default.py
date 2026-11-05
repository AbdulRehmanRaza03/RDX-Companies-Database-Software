"""fix suppression created_at default

Revision ID: c82aa2020e3a
Revises: 4a24fed85ce7
Create Date: 2026-11-05 14:03:57.855505

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c82aa2020e3a'
down_revision: Union[str, Sequence[str], None] = '4a24fed85ce7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'suppression_list',
        'created_at',
        existing_type=sa.DateTime(timezone=True),
        server_default=sa.text('now()'),
        existing_nullable=False,
    )
    op.alter_column(
        'email_events',
        'occurred_at',
        existing_type=sa.DateTime(timezone=True),
        server_default=sa.text('now()'),
        existing_nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'suppression_list',
        'created_at',
        existing_type=sa.DateTime(timezone=True),
        server_default=None,
        existing_nullable=False,
    )
    op.alter_column(
        'email_events',
        'occurred_at',
        existing_type=sa.DateTime(timezone=True),
        server_default=None,
        existing_nullable=False,
    )
