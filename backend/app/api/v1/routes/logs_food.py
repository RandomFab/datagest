from datetime import date, datetime

from fastapi import APIRouter, Depends, status

from app.database.deps import DBSession
from app.models.enums import EntryType
from app.schemas.log import FoodLogCreate, FoodLogRead, FoodLogUpdate
from app.services.log import FoodLogService

router = APIRouter(prefix="/logs/food", tags=["Food Logs"])


def get_service(db: DBSession) -> FoodLogService:
    return FoodLogService(db)


@router.get("", response_model=list[FoodLogRead])
async def list_food_logs(
    date: date | None = None,
    from_: datetime | None = None,
    to: datetime | None = None,
    entry_type: EntryType | None = None,
    service: FoodLogService = Depends(get_service),
):
    return await service.list_all(logged_date=date, from_=from_, to=to, entry_type=entry_type)


@router.post("", response_model=FoodLogRead, status_code=status.HTTP_201_CREATED)
async def create_food_log(data: FoodLogCreate, service: FoodLogService = Depends(get_service)):
    return await service.create(data)


@router.get("/{log_id}", response_model=FoodLogRead)
async def get_food_log(log_id: int, service: FoodLogService = Depends(get_service)):
    return await service.get_or_404(log_id)


@router.patch("/{log_id}", response_model=FoodLogRead)
async def update_food_log(
    log_id: int, data: FoodLogUpdate, service: FoodLogService = Depends(get_service)
):
    return await service.update(log_id, data)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food_log(log_id: int, service: FoodLogService = Depends(get_service)):
    await service.delete(log_id)
