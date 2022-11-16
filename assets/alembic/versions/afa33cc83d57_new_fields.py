"""new_fields

Revision ID: afa33cc83d57
Revises:
Create Date: 2021-10-11 02:34:39.460385

"""
import sqlalchemy as sa

from alembic import op
from src.db.models import TSVector

# revision identifiers, used by Alembic.
revision = "afa33cc83d57"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "datasets",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("created", sa.DateTime(), nullable=False),
        sa.Column(
            "ts_vector",
            TSVector(),
            sa.Computed("to_tsvector('english', name)", persisted=True),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(
        "ix_ds_name",
        "datasets",
        ["ts_vector"],
        unique=False,
        postgresql_using="gin",
    )
    op.create_table(
        "files",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("original_name", sa.String(length=150), nullable=False),
        sa.Column("bucket", sa.String(length=65), nullable=False),
        sa.Column("size_in_bytes", sa.Integer(), nullable=False),
        sa.Column("extension", sa.String(length=50), nullable=False),
        sa.Column("content_type", sa.String(length=150), nullable=False),
        sa.Column("pages", sa.Integer(), nullable=True),
        sa.Column("last_modified", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column(
            "ts_vector",
            TSVector(),
            sa.Computed(
                "to_tsvector('english', original_name)", persisted=True
            ),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_name", "files", ["ts_vector"], unique=False, postgresql_using="gin"
    )
    op.create_table(
        "association",
        sa.Column("dataset_id", sa.Integer(), nullable=False),
        sa.Column("file_id", sa.Integer(), nullable=False),
        sa.Column("created", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"], ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(["file_id"], ["files.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("dataset_id", "file_id"),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("association")
    op.drop_index("ix_name", table_name="files", postgresql_using="gin")
    op.drop_table("files")
    op.drop_index("ix_ds_name", table_name="datasets", postgresql_using="gin")
    op.drop_table("datasets")
    # ### end Alembic commands ###