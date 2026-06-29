from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import AllergenName, FoodCategory


class AllergenRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: AllergenName


class FoodItemSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: FoodCategory
    sub_category: str | None
    is_drink: bool


class FoodItemCreate(BaseModel):
    name: str
    category: FoodCategory
    sub_category: str | None = None
    is_drink: bool = False
    allergen_ids: list[int] = []


class FoodItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: FoodCategory
    sub_category: str | None
    is_drink: bool
    created_at: datetime
    allergens: list[AllergenRead] = []


class FoodItemUpdate(BaseModel):
    name: str | None = None
    category: FoodCategory | None = None
    sub_category: str | None = None
    is_drink: bool | None = None
    allergen_ids: list[int] | None = None
