from fastapi import APIRouter, Depends

from app.database.deps import DBSession
from app.schemas.food import AllergenRead
from app.services.food import AllergenService

router = APIRouter(prefix="/allergens", tags=["Allergens"])


def get_service(db: DBSession) -> AllergenService:
    return AllergenService(db)


@router.get("", response_model=list[AllergenRead])
async def list_allergens(service: AllergenService = Depends(get_service)):
    return await service.list_all()
