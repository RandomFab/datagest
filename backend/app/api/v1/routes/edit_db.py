from fastapi import APIRouter

router = APIRouter()


@router.post("/post_db")
def post_db():
    return {"status": "ok"}
