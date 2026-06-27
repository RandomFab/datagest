from datetime import date, datetime

from fastapi import APIRouter, Depends, status

from app.database.deps import DBSession
from app.schemas.log import SymptomLogCreate, SymptomLogRead, SymptomLogUpdate
from app.services.log import SymptomLogService

router = APIRouter(prefix="/logs/symptoms", tags=["Symptom Logs"])


def get_service(db: DBSession) -> SymptomLogService:
    return SymptomLogService(db)


@router.get("", response_model=list[SymptomLogRead])
async def list_symptom_logs(
    date: date | None = None,
    from_: datetime | None = None,
    to: datetime | None = None,
    name: str | None = None,
    service: SymptomLogService = Depends(get_service),
):
    return await service.list_all(logged_date=date, from_=from_, to=to, name=name)


@router.post("", response_model=SymptomLogRead, status_code=status.HTTP_201_CREATED)
async def create_symptom_log(
    data: SymptomLogCreate, service: SymptomLogService = Depends(get_service)
):
    return await service.create(data)


@router.get("/{log_id}", response_model=SymptomLogRead)
async def get_symptom_log(log_id: int, service: SymptomLogService = Depends(get_service)):
    return await service.get_or_404(log_id)


@router.patch("/{log_id}", response_model=SymptomLogRead)
async def update_symptom_log(
    log_id: int, data: SymptomLogUpdate, service: SymptomLogService = Depends(get_service)
):
    return await service.update(log_id, data)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom_log(log_id: int, service: SymptomLogService = Depends(get_service)):
    await service.delete(log_id)
