from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Integer, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import EntryType, Preparation, Quantity, StoolQuality
from app.models.food import FoodItem


class FoodLog(Base):
    __tablename__ = "food_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    food_item_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("food_items.id", ondelete="SET NULL"), nullable=True
    )
    custom_name: Mapped[str | None] = mapped_column(String(255))
    entry_type: Mapped[EntryType] = mapped_column(String(10), nullable=False)
    preparation: Mapped[Preparation | None] = mapped_column(String(10))
    quantity: Mapped[Quantity | None] = mapped_column(String(10))
    volume_ml: Mapped[int | None] = mapped_column(Integer)
    logged_at: Mapped[datetime] = mapped_column(nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    food_item: Mapped[FoodItem | None] = relationship(FoodItem, back_populates="food_logs")

    __table_args__ = (
        CheckConstraint("entry_type IN ('food', 'drink')", name="ck_food_log_entry_type"),
        CheckConstraint(
            "preparation IN ('raw', 'cooked') OR preparation IS NULL",
            name="ck_food_log_preparation",
        ),
        CheckConstraint(
            "quantity IN ('small', 'normal', 'large') OR quantity IS NULL",
            name="ck_food_log_quantity",
        ),
    )


class StoolLog(Base):
    __tablename__ = "stool_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    bristol_type: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    quality: Mapped[StoolQuality] = mapped_column(String(20), nullable=False)
    logged_at: Mapped[datetime] = mapped_column(nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint("bristol_type BETWEEN 1 AND 7", name="ck_stool_bristol_range"),
        CheckConstraint("quality IN ('ideal', 'normal', 'concerning')", name="ck_stool_quality"),
    )


class SymptomLog(Base):
    __tablename__ = "symptom_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    # Texte libre — presets suggérés côté frontend, mais non contraignable en DB
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    intensity: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    logged_at: Mapped[datetime] = mapped_column(nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    __table_args__ = (
        CheckConstraint("intensity BETWEEN 1 AND 10", name="ck_symptom_intensity_range"),
    )
