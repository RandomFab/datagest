from fastapi import APIRouter

from app.api.v1.routes.allergens import router as allergens_router
from app.api.v1.routes.dashboard import router as dashboard_router
from app.api.v1.routes.foods import router as foods_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.logs_food import router as logs_food_router
from app.api.v1.routes.logs_stools import router as logs_stools_router
from app.api.v1.routes.logs_symptoms import router as logs_symptoms_router

router = APIRouter(prefix="/api/v1")

router.include_router(health_router)
router.include_router(allergens_router)
router.include_router(foods_router)
router.include_router(logs_food_router)
router.include_router(logs_stools_router)
router.include_router(logs_symptoms_router)
router.include_router(dashboard_router)
