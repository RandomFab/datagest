from datetime import date, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql import Select

from app.models.enums import EntryType
from app.models.log import FoodLog, StoolLog, SymptomLog
from app.schemas.log import (
    FoodLogCreate,
    FoodLogUpdate,
    StoolLogCreate,
    StoolLogUpdate,
    SymptomLogCreate,
    SymptomLogUpdate,
)


def _apply_date_filters(
    stmt: Select,
    col,
    *,
    logged_date: date | None,
    from_: datetime | None,
    to: datetime | None,
) -> Select:
    if logged_date is not None:
        start = datetime(logged_date.year, logged_date.month, logged_date.day)
        end = datetime(logged_date.year, logged_date.month, logged_date.day, 23, 59, 59, 999999)
        return stmt.where(col.between(start, end))
    if from_ is not None:
        stmt = stmt.where(col >= from_)
    if to is not None:
        stmt = stmt.where(col <= to)
    return stmt


class FoodLogRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    def _base_stmt(self):
        return select(FoodLog).options(selectinload(FoodLog.food_item))

    async def list_all(
        self,
        *,
        logged_date: date | None = None,
        from_: datetime | None = None,
        to: datetime | None = None,
        entry_type: EntryType | None = None,
    ) -> list[FoodLog]:
        stmt = self._base_stmt()
        stmt = _apply_date_filters(stmt, FoodLog.logged_at, logged_date=logged_date, from_=from_, to=to)
        if entry_type is not None:
            stmt = stmt.where(FoodLog.entry_type == entry_type)
        result = await self.db.execute(stmt.order_by(FoodLog.logged_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, log_id: int) -> FoodLog | None:
        result = await self.db.execute(self._base_stmt().where(FoodLog.id == log_id))
        return result.scalar_one_or_none()

    async def create(self, data: FoodLogCreate) -> FoodLog:
        log = FoodLog(**data.model_dump())
        self.db.add(log)
        await self.db.commit()
        return await self.get_by_id(log.id)  # type: ignore[return-value]

    async def update(self, log: FoodLog, data: FoodLogUpdate) -> FoodLog:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(log, field, value)
        await self.db.commit()
        return await self.get_by_id(log.id)  # type: ignore[return-value]

    async def delete(self, log: FoodLog) -> None:
        await self.db.delete(log)
        await self.db.commit()

    async def list_for_day(self, logged_date: date) -> list[FoodLog]:
        return await self.list_all(logged_date=logged_date)


class StoolLogRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_all(
        self,
        *,
        logged_date: date | None = None,
        from_: datetime | None = None,
        to: datetime | None = None,
    ) -> list[StoolLog]:
        stmt = select(StoolLog)
        stmt = _apply_date_filters(stmt, StoolLog.logged_at, logged_date=logged_date, from_=from_, to=to)
        result = await self.db.execute(stmt.order_by(StoolLog.logged_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, log_id: int) -> StoolLog | None:
        result = await self.db.execute(select(StoolLog).where(StoolLog.id == log_id))
        return result.scalar_one_or_none()

    async def create(self, data: StoolLogCreate) -> StoolLog:
        log = StoolLog(**data.model_dump())
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def update(self, log: StoolLog, data: StoolLogUpdate) -> StoolLog:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(log, field, value)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def delete(self, log: StoolLog) -> None:
        await self.db.delete(log)
        await self.db.commit()

    async def list_for_day(self, logged_date: date) -> list[StoolLog]:
        return await self.list_all(logged_date=logged_date)


class SymptomLogRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_all(
        self,
        *,
        logged_date: date | None = None,
        from_: datetime | None = None,
        to: datetime | None = None,
        name: str | None = None,
    ) -> list[SymptomLog]:
        stmt = select(SymptomLog)
        stmt = _apply_date_filters(stmt, SymptomLog.logged_at, logged_date=logged_date, from_=from_, to=to)
        if name is not None:
            stmt = stmt.where(SymptomLog.name.ilike(f"%{name}%"))
        result = await self.db.execute(stmt.order_by(SymptomLog.logged_at.desc()))
        return list(result.scalars().all())

    async def get_by_id(self, log_id: int) -> SymptomLog | None:
        result = await self.db.execute(select(SymptomLog).where(SymptomLog.id == log_id))
        return result.scalar_one_or_none()

    async def create(self, data: SymptomLogCreate) -> SymptomLog:
        log = SymptomLog(**data.model_dump())
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def update(self, log: SymptomLog, data: SymptomLogUpdate) -> SymptomLog:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(log, field, value)
        await self.db.commit()
        await self.db.refresh(log)
        return log

    async def delete(self, log: SymptomLog) -> None:
        await self.db.delete(log)
        await self.db.commit()

    async def list_for_day(self, logged_date: date) -> list[SymptomLog]:
        return await self.list_all(logged_date=logged_date)
