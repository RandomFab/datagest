from fastapi import APIRouter

from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.get_db import router as get_db_router
from app.api.v1.routes.edit_db import router as edit_db_router

router = APIRouter(prefix="/api/v1")

router.include_router(health_router)
router.include_router(get_db_router)
router.include_router(edit_db_router)
