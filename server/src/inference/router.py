from fastapi import APIRouter

from inference import service
from inference.schemas import InferenceBody, InferenceResult

router = APIRouter()


@router.post("/inference")
async def inference(body: InferenceBody) -> InferenceResult:
    result = await service.detect_language(body.text)
    return InferenceResult(**result)
