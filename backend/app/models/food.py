from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.enums import AllergenName, FoodCategory

food_item_allergens = Table(
    "food_item_allergens",
    Base.metadata,
    Column(
        "food_item_id", Integer, ForeignKey("food_items.id", ondelete="CASCADE"), primary_key=True
    ),
    Column(
        "allergen_id", Integer, ForeignKey("allergens.id", ondelete="CASCADE"), primary_key=True
    ),
)


class Allergen(Base):
    __tablename__ = "allergens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[AllergenName] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    food_items: Mapped[list["FoodItem"]] = relationship(
        "FoodItem", secondary=food_item_allergens, back_populates="allergens"
    )


class FoodItem(Base):
    __tablename__ = "food_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    category: Mapped[FoodCategory] = mapped_column(String(50), nullable=False)
    sub_category: Mapped[str | None] = mapped_column(String(100))
    is_drink: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    allergens: Mapped[list[Allergen]] = relationship(
        Allergen, secondary=food_item_allergens, back_populates="food_items"
    )
    food_logs: Mapped[list["FoodLog"]] = relationship(  # noqa: F821
        "FoodLog", back_populates="food_item"
    )
