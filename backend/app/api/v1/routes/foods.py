from fastapi import APIRouter, Depends, status

from app.database.deps import DBSession
from app.models.enums import FoodCategory
from app.schemas.food import FoodItemCreate, FoodItemRead, FoodItemUpdate
from app.services.food import FoodItemService

router = APIRouter(prefix="/foods", tags=["Foods"])


def get_service(db: DBSession) -> FoodItemService:
    return FoodItemService(db)


@router.get("", response_model=list[FoodItemRead])
async def list_foods(
    category: FoodCategory | None = None,
    is_drink: bool | None = None,
    search: str | None = None,
    allergen_id: int | None = None,
    service: FoodItemService = Depends(get_service),
):
    return await service.list_all(
        category=category, is_drink=is_drink, search=search, allergen_id=allergen_id
    )


@router.post("", response_model=FoodItemRead, status_code=status.HTTP_201_CREATED)
async def create_food(data: FoodItemCreate, service: FoodItemService = Depends(get_service)):
    return await service.create(data)


@router.get("/{food_id}", response_model=FoodItemRead)
async def get_food(food_id: int, service: FoodItemService = Depends(get_service)):
    return await service.get_or_404(food_id)


@router.patch("/{food_id}", response_model=FoodItemRead)
async def update_food(
    food_id: int, data: FoodItemUpdate, service: FoodItemService = Depends(get_service)
):
    return await service.update(food_id, data)


@router.delete("/{food_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_food(food_id: int, service: FoodItemService = Depends(get_service)):
    await service.delete(food_id)
