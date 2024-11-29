from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
async def check_healthz() -> str:
    return "healthz"
