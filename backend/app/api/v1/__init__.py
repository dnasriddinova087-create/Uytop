from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.properties import router as properties_router
from app.api.v1.favorites import router as favorites_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.locations import router as locations_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(properties_router)
api_v1_router.include_router(favorites_router)
api_v1_router.include_router(conversations_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(notifications_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(admin_router)
