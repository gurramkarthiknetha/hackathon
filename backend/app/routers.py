"""
Central router configuration for FastAPI application.
Includes all route modules and configures the main application routing.
"""

from fastapi import APIRouter
from app.auth.routes import router as auth_router
from app.users.routes import router as users_router
from app.ml.simple_routes import router as ml_router
from app.monitoring.routes import router as monitoring_router
from app.monitoring.camera_routes import router as camera_router

# Create main API router
api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(ml_router)
api_router.include_router(monitoring_router)
api_router.include_router(camera_router)

# Additional routers will be added here as they are implemented:
# api_router.include_router(notification_router)
# api_router.include_router(message_router)
# api_router.include_router(video_router)
# api_router.include_router(maps_router)
