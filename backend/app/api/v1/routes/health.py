from fastapi import APIRouter
from sqlalchemy import text

from app.database.deps import DBSession

router = APIRouter(tags=["Health"])


@router.get("/health")
async def api_health_check():
    return {"status": "ok"}


@router.get("/health/db")
async def db_health_check(db: DBSession):
    await db.execute(text("SELECT 1"))
    return {"status": "ok"}
