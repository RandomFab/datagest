from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import EntryType, Preparation, Quantity, StoolQuality


class FoodLogCreate(BaseModel):
    food_item_id: int | None = None
    custom_name: str | None = None
    entry_type: EntryType
    preparation: Preparation | None = None
    quantity: Quantity | None = None
    volume_ml: int | None = Field(None, ge=1)
    logged_at: datetime
    notes: str | None = None


class FoodLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    food_item_id: int | None
    custom_name: str | None
    entry_type: EntryType
    preparation: Preparation | None
    quantity: Quantity | None
    volume_ml: int | None
    logged_at: datetime
    notes: str | None


class FoodLogUpdate(BaseModel):
    preparation: Preparation | None = None
    quantity: Quantity | None = None
    volume_ml: int | None = Field(None, ge=1)
    logged_at: datetime | None = None
    notes: str | None = None


class StoolLogCreate(BaseModel):
    bristol_type: int = Field(..., ge=1, le=7)
    quality: StoolQuality
    logged_at: datetime
    notes: str | None = None


class StoolLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bristol_type: int
    quality: StoolQuality
    logged_at: datetime
    notes: str | None


class StoolLogUpdate(BaseModel):
    bristol_type: int | None = Field(None, ge=1, le=7)
    quality: StoolQuality | None = None
    logged_at: datetime | None = None
    notes: str | None = None


class SymptomLogCreate(BaseModel):
    name: str
    intensity: int = Field(..., ge=1, le=10)
    logged_at: datetime
    notes: str | None = None


class SymptomLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    intensity: int
    logged_at: datetime
    notes: str | None


class SymptomLogUpdate(BaseModel):
    name: str | None = None
    intensity: int | None = Field(None, ge=1, le=10)
    logged_at: datetime | None = None
    notes: str | None = None
