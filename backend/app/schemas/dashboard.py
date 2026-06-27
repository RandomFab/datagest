from datetime import date

from pydantic import BaseModel

from app.schemas.log import FoodLogRead, StoolLogRead, SymptomLogRead


class DaySummary(BaseModel):
    date: date
    food_logs: list[FoodLogRead]
    stool_logs: list[StoolLogRead]
    symptom_logs: list[SymptomLogRead]
