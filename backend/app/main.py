import logging
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import init_db
from app.api.v1 import api_v1_router

logger = logging.getLogger("uytop")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema and seed data are ready
    try:
        init_db()
    except Exception as e:
        logger.error(f"Database initialization error during lifespan: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="UyTop - O'zbekiston bo'yicha uy-ijara platformasi uchun yagona REST API",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    logger.error(f"Xatolik yuz berdi ({request.method} {request.url.path}): {exc}\n{error_trace}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Server xatoligi: {str(exc)}",
            "path": request.url.path
        }
    )

# Mount static files safely for uploaded property images
try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")
except Exception as e:
    logger.warning(f"Static uploads directory mount skipped or failed: {e}")

# Include API v1 routes
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
