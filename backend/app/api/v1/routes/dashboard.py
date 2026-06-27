from datetime import date

from fastapi import APIRouter

from app.database.deps import DBSession
from app.schemas.dashboard import DaySummary
from app.services.log import FoodLogService, StoolLogService, SymptomLogService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/day", response_model=DaySummary)
async def get_day_summary(day: date, db: DBSession):
    food_logs = await FoodLogService(db).list_for_day(day)
    stool_logs = await StoolLogService(db).list_for_day(day)
    symptom_logs = await SymptomLogService(db).list_for_day(day)
    return DaySummary(date=day, food_logs=food_logs, stool_logs=stool_logs, symptom_logs=symptom_logs)
