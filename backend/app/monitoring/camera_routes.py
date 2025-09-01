"""
Camera management routes for monitoring system.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import logging

from app.deps import get_database, get_current_user
from app.auth.models import UserResponse
from app.middleware.security import incident_limiter

router = APIRouter(prefix="/api", tags=["cameras"])
logger = logging.getLogger(__name__)


@router.get("/cameras")
@incident_limiter.limit("100/60second")
async def get_cameras(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all available cameras"""
    try:
        # For now, return mock camera data since we're focusing on system cameras
        # In a real implementation, this would fetch from a camera management system
        mock_cameras = [
            {
                "id": "camera_1",
                "name": "Main Entrance Camera",
                "location": "Building A - Main Entrance",
                "zone": "Entrance",
                "status": "active",
                "type": "ip_camera",
                "stream_url": "rtsp://example.com/camera1"
            },
            {
                "id": "camera_2", 
                "name": "Parking Lot Camera",
                "location": "Building A - Parking",
                "zone": "Parking",
                "status": "active",
                "type": "ip_camera",
                "stream_url": "rtsp://example.com/camera2"
            }
        ]
        
        return {
            "success": True,
            "data": mock_cameras,
            "message": "Cameras retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error fetching cameras: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cameras")


@router.get("/cameras/{camera_id}")
@incident_limiter.limit("100/60second")
async def get_camera(
    request: Request,
    camera_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get camera by ID"""
    try:
        # Mock implementation - in real system would query camera database
        if camera_id == "camera_1":
            camera = {
                "id": "camera_1",
                "name": "Main Entrance Camera",
                "location": "Building A - Main Entrance", 
                "zone": "Entrance",
                "status": "active",
                "type": "ip_camera",
                "stream_url": "rtsp://example.com/camera1"
            }
        elif camera_id == "camera_2":
            camera = {
                "id": "camera_2",
                "name": "Parking Lot Camera", 
                "location": "Building A - Parking",
                "zone": "Parking", 
                "status": "active",
                "type": "ip_camera",
                "stream_url": "rtsp://example.com/camera2"
            }
        else:
            raise HTTPException(status_code=404, detail="Camera not found")
            
        return {
            "success": True,
            "data": camera,
            "message": "Camera retrieved successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching camera {camera_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch camera")
