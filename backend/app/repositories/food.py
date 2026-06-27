from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.enums import FoodCategory
from app.models.food import Allergen, FoodItem
from app.schemas.food import FoodItemCreate, FoodItemUpdate


class AllergenRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_all(self) -> list[Allergen]:
        result = await self.db.execute(select(Allergen).order_by(Allergen.name))
        return list(result.scalars().all())

    async def get_by_ids(self, ids: list[int]) -> list[Allergen]:
        result = await self.db.execute(select(Allergen).where(Allergen.id.in_(ids)))
        return list(result.scalars().all())


class FoodItemRepository:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_all(
        self,
        *,
        category: FoodCategory | None = None,
        is_drink: bool | None = None,
        search: str | None = None,
        allergen_id: int | None = None,
    ) -> list[FoodItem]:
        stmt = select(FoodItem).options(selectinload(FoodItem.allergens))
        if category is not None:
            stmt = stmt.where(FoodItem.category == category)
        if is_drink is not None:
            stmt = stmt.where(FoodItem.is_drink == is_drink)
        if search:
            stmt = stmt.where(FoodItem.name.ilike(f"%{search}%"))
        if allergen_id is not None:
            stmt = stmt.join(FoodItem.allergens).where(Allergen.id == allergen_id)
        result = await self.db.execute(stmt.order_by(FoodItem.name))
        return list(result.scalars().all())

    async def get_by_id(self, food_id: int) -> FoodItem | None:
        result = await self.db.execute(
            select(FoodItem)
            .options(selectinload(FoodItem.allergens))
            .where(FoodItem.id == food_id)
        )
        return result.scalar_one_or_none()

    async def create(self, data: FoodItemCreate, allergens: list[Allergen]) -> FoodItem:
        item = FoodItem(
            name=data.name,
            category=data.category,
            sub_category=data.sub_category,
            is_drink=data.is_drink,
            allergens=allergens,
        )
        self.db.add(item)
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def update(
        self,
        item: FoodItem,
        data: FoodItemUpdate,
        allergens: list[Allergen] | None,
    ) -> FoodItem:
        for field, value in data.model_dump(exclude_unset=True, exclude={"allergen_ids"}).items():
            setattr(item, field, value)
        if allergens is not None:
            item.allergens = allergens
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete(self, item: FoodItem) -> None:
        await self.db.delete(item)
        await self.db.commit()
