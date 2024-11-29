from pydantic import BaseModel, Field


class InferenceBody(BaseModel):
    text: str = Field(..., description="Short sentence to detect language")


class InferenceResult(BaseModel):
    label: str = Field(..., description="Label of language given text")
    prob: float = Field(..., description="Probability of the inference result")
