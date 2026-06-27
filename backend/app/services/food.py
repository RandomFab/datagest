from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import FoodCategory
from app.models.food import Allergen, FoodItem
from app.repositories.food import AllergenRepository, FoodItemRepository
from app.schemas.food import FoodItemCreate, FoodItemUpdate


class AllergenService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = AllergenRepository(db)

    async def list_all(self) -> list[Allergen]:
        return await self.repo.list_all()


class FoodItemService:
    def __init__(self, db: AsyncSession) -> None:
        self.repo = FoodItemRepository(db)
        self.allergen_repo = AllergenRepository(db)

    async def list_all(
        self,
        *,
        category: FoodCategory | None = None,
        is_drink: bool | None = None,
        search: str | None = None,
        allergen_id: int | None = None,
    ) -> list[FoodItem]:
        return await self.repo.list_all(
            category=category,
            is_drink=is_drink,
            search=search,
            allergen_id=allergen_id,
        )

    async def get_or_404(self, food_id: int) -> FoodItem:
        item = await self.repo.get_by_id(food_id)
        if item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Food item not found")
        return item

    async def create(self, data: FoodItemCreate) -> FoodItem:
        allergens = await self._resolve_allergens(data.allergen_ids)
        return await self.repo.create(data, allergens)

    async def update(self, food_id: int, data: FoodItemUpdate) -> FoodItem:
        item = await self.get_or_404(food_id)
        allergens = None
        if data.allergen_ids is not None:
            allergens = await self._resolve_allergens(data.allergen_ids)
        return await self.repo.update(item, data, allergens)

    async def delete(self, food_id: int) -> None:
        item = await self.get_or_404(food_id)
        await self.repo.delete(item)

    async def _resolve_allergens(self, ids: list[int]) -> list[Allergen]:
        if not ids:
            return []
        allergens = await self.allergen_repo.get_by_ids(ids)
        if len(allergens) != len(ids):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="One or more allergen IDs are invalid",
            )
        return allergens
