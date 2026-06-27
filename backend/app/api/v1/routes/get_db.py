from fastapi import APIRouter

router = APIRouter()


@router.get("/get_db")
def get_db():
    return {"status": "ok"}
