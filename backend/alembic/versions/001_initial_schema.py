"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-06-27
"""

from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "allergens",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False, unique=True),
    )

    op.create_table(
        "food_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("sub_category", sa.String(100), nullable=True),
        sa.Column("is_drink", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "food_item_allergens",
        sa.Column(
            "food_item_id",
            sa.Integer(),
            sa.ForeignKey("food_items.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "allergen_id",
            sa.Integer(),
            sa.ForeignKey("allergens.id", ondelete="CASCADE"),
            primary_key=True,
        ),
    )

    op.create_table(
        "food_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "food_item_id",
            sa.Integer(),
            sa.ForeignKey("food_items.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("custom_name", sa.String(255), nullable=True),
        sa.Column("entry_type", sa.String(10), nullable=False),
        sa.Column("preparation", sa.String(10), nullable=True),
        sa.Column("quantity", sa.String(10), nullable=True),
        sa.Column("volume_ml", sa.Integer(), nullable=True),
        sa.Column("logged_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.CheckConstraint("entry_type IN ('food', 'drink')", name="ck_food_log_entry_type"),
        sa.CheckConstraint(
            "preparation IN ('raw', 'cooked') OR preparation IS NULL",
            name="ck_food_log_preparation",
        ),
        sa.CheckConstraint(
            "quantity IN ('small', 'normal', 'large') OR quantity IS NULL",
            name="ck_food_log_quantity",
        ),
    )

    op.create_table(
        "stool_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("bristol_type", sa.SmallInteger(), nullable=False),
        sa.Column("quality", sa.String(20), nullable=False),
        sa.Column("logged_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.CheckConstraint("bristol_type BETWEEN 1 AND 7", name="ck_stool_bristol_range"),
        sa.CheckConstraint(
            "quality IN ('ideal', 'normal', 'concerning')", name="ck_stool_quality"
        ),
    )

    op.create_table(
        "symptom_log",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("intensity", sa.SmallInteger(), nullable=False),
        sa.Column("logged_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.CheckConstraint("intensity BETWEEN 1 AND 10", name="ck_symptom_intensity_range"),
    )


def downgrade() -> None:
    op.drop_table("symptom_log")
    op.drop_table("stool_log")
    op.drop_table("food_log")
    op.drop_table("food_item_allergens")
    op.drop_table("food_items")
    op.drop_table("allergens")
