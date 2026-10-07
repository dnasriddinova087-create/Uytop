import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent

# Check if running in serverless / read-only environment like Vercel / AWS Lambda
is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

def get_writable_dir() -> Path:
    if is_serverless:
        return Path("/tmp")
    try:
        test_path = BASE_DIR / ".write_test"
        test_path.touch()
        test_path.unlink()
        return BASE_DIR
    except (OSError, PermissionError):
        return Path("/tmp")

SAFE_STORAGE_DIR = get_writable_dir()

def get_default_database_url() -> str:
    env_db = os.environ.get("DATABASE_URL")
    if env_db:
        # Normalize postgres:// to postgresql:// for SQLAlchemy 2.0
        if env_db.startswith("postgres://"):
            return env_db.replace("postgres://", "postgresql://", 1)
        return env_db
    # Fallback to SQLite in safe writable storage directory
    return f"sqlite:///{SAFE_STORAGE_DIR}/uytop.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "UyTop"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "uytop-super-secret-key-change-in-production-2026-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # Database
    DATABASE_URL: str = get_default_database_url()
    
    # File Storage
    UPLOAD_DIR: Path = SAFE_STORAGE_DIR / "uploads"
    MAX_IMAGE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19000",
        "http://localhost:19006",
        "*"
    ]
    
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Safe directory creation
try:
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except (OSError, PermissionError):
    pass
