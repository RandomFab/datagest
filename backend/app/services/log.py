from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import EntryType
from app.models.log import FoodLog, StoolLog, SymptomLog
from app.repositories.log import FoodLogRepository, StoolLogRepository, SymptomLogRepository
from app.schemas.log import (
    FoodLogCreate,
    FoodLogUpdate,
    StoolLogCreate,
    StoolLogUpdate,
    SymptomLogCreate,
    SymptomLogUpdate,
)


class FoodLogService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = FoodLogRepository(db)

    async def list_all(
        self,
        *,
        logged_date: date | None = None,
        from_: datetime | None = None,
        to: datetime | None = None,
        entry_type: EntryType | None = None,
    ) -> list[FoodLog]:
        return await self.repo.list_all(
            logged_date=logged_date, from_=from_, to=to, entry_type=entry_type
        )

    async def get_or_404(self, log_id: int) -> FoodLog:
        log = await self.repo.get_by_id(log_id)
        if log is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food log not found")
        return log

    async def create(self, data: FoodLogCreate) -> FoodLog:
        return await self.repo.create(data)

    async def update(self, log_id: int, data: FoodLogUpdate) -> FoodLog:
        log = await self.get_or_404(log_id)
        return await self.repo.update(log, data)

    async def delete(self, log_id: int) -> None:
        log = await self.get_or_404(log_id)
        await self.repo.delete(log)

    async def list_for_day(self, logged_date: date) -> list[FoodLog]:
        return await self.repo.list_for_day(logged_date)


class StoolLogService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = StoolLogRepository(db)

    async def list_all(
        self,
        *,
        logged_date: date | None = None,
        from_: datetime | None = None,
        to: datetime | None = None,
    ) -> list[StoolLog]:
        return await self.repo.list_all(logged_date=logged_date, from_=from_, to=to)

    async def get_or_404(self, log_id: int) -> StoolLog:
        log = await self.repo.get_by_id(log_id)
        if log is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stool log not found")
        return log

    async def create(self, data: StoolLogCreate) -> StoolLog:
        return await self.repo.create(data)

    async def update(self, log_id: int, data: StoolLogUpdate) -> StoolLog:
        log = await self.get_or_404(log_id)
        return await self.repo.update(log, data)

    async def delete(self, log_id: int) -> None:
        log = await self.get_or_404(log_id)
        await self.repo.delete(log)

    async def list_for_day(self, logged_date: date) -> list[StoolLog]:
        return await self.repo.list_for_day(logged_date)


class SymptomLogService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = SymptomLogRepository(db)

    async def list_all(
        self,
        *,
        logged_date: date | None = None,
        from_: datetime | None = None,
        to: datetime | None = None,
        name: str | None = None,
    ) -> list[SymptomLog]:
        return await self.repo.list_all(
            logged_date=logged_date, from_=from_, to=to, name=name
        )

    async def get_or_404(self, log_id: int) -> SymptomLog:
        log = await self.repo.get_by_id(log_id)
        if log is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Symptom log not found"
            )
        return log

    async def create(self, data: SymptomLogCreate) -> SymptomLog:
        return await self.repo.create(data)

    async def update(self, log_id: int, data: SymptomLogUpdate) -> SymptomLog:
        log = await self.get_or_404(log_id)
        return await self.repo.update(log, data)

    async def delete(self, log_id: int) -> None:
        log = await self.get_or_404(log_id)
        await self.repo.delete(log)

    async def list_for_day(self, logged_date: date) -> list[SymptomLog]:
        return await self.repo.list_for_day(logged_date)
