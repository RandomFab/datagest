from datetime import date, datetime

from fastapi import APIRouter, Depends, status

from app.database.deps import DBSession
from app.schemas.log import StoolLogCreate, StoolLogRead, StoolLogUpdate
from app.services.log import StoolLogService

router = APIRouter(prefix="/logs/stools", tags=["Stool Logs"])


def get_service(db: DBSession) -> StoolLogService:
    return StoolLogService(db)


@router.get("", response_model=list[StoolLogRead])
async def list_stool_logs(
    date: date | None = None,
    from_: datetime | None = None,
    to: datetime | None = None,
    service: StoolLogService = Depends(get_service),
):
    return await service.list_all(logged_date=date, from_=from_, to=to)


@router.post("", response_model=StoolLogRead, status_code=status.HTTP_201_CREATED)
async def create_stool_log(data: StoolLogCreate, service: StoolLogService = Depends(get_service)):
    return await service.create(data)


@router.get("/{log_id}", response_model=StoolLogRead)
async def get_stool_log(log_id: int, service: StoolLogService = Depends(get_service)):
    return await service.get_or_404(log_id)


@router.patch("/{log_id}", response_model=StoolLogRead)
async def update_stool_log(
    log_id: int, data: StoolLogUpdate, service: StoolLogService = Depends(get_service)
):
    return await service.update(log_id, data)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stool_log(log_id: int, service: StoolLogService = Depends(get_service)):
    await service.delete(log_id)
