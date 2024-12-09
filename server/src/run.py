from contextlib import asynccontextmanager

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import health.router as health_router
import inference.router as inference_router
from inference.service import init_inference
from utils.utils import Settings, get_config, init_log

router_list = [
    health_router.router,
    inference_router.router,
]


async def cleanup_services():
    pass


@asynccontextmanager
async def init_app(app: FastAPI):
    for router in router_list:
        app.include_router(router)
    config = get_config()
    load_dotenv(override=True)
    init_log()
    yield
    await cleanup_services()


app = FastAPI(
    title="AI Inference Server Template",
    root_path="/api",
    lifespan=init_app,
)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    config = get_config()
    uvicorn.run(
        "run:app",
        host="0.0.0.0",
        port=int(config.port),
        reload=bool(config.reload),
    )
