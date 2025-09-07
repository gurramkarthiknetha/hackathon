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


@router.get("/cameras/{camera_id}/detection-scores")
@incident_limiter.limit("100/60second")
async def get_detection_scores(
    request: Request,
    camera_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get real-time detection confidence scores from ML analysis results"""
    try:
        import requests
        import time
        
        logger.info(f"🔍 Getting detection scores for camera: {camera_id}")
        
        # Try to get real detection scores from the ML cache
        # Import the detection cache from ML routes
        try:
            from app.ml.routes import detection_cache
            
            logger.info(f"📊 Detection cache keys: {list(detection_cache.keys())}")
            logger.info(f"🎯 Looking for camera_id: {camera_id}")
            
            # Check if we have cached detection results for this camera
            if camera_id in detection_cache:
                cached_data = detection_cache[camera_id]
                detections = cached_data["detections"]
                object_counts = cached_data["object_counts"]
                
                # Calculate accuracy scores based on actual detection results
                scores = {
                    "person": 0,
                    "stampede": 0,
                    "medical_emergency": 0,
                    "fire": 0,
                    "smoke": 0,
                    "running": 0,
                    "fallen": 0,
                    "me": 0,
                    "violence": 0,
                    "crowd_density": 0,
                    "weapon": 0,
                    "suspicious_activity": 0
                }
                
                # Person detection - use highest confidence person detection
                person_detections = [d for d in detections if d["class"] == "person"]
                if person_detections:
                    scores["person"] = max(d["confidence"] * 100 for d in person_detections)
                
                # Fire detection
                fire_detections = [d for d in detections if "fire" in d["class"].lower()]
                if fire_detections:
                    scores["fire"] = max(d["confidence"] * 100 for d in fire_detections)
                
                # Smoke detection
                smoke_detections = [d for d in detections if "smoke" in d["class"].lower()]
                if smoke_detections:
                    scores["smoke"] = max(d["confidence"] * 100 for d in smoke_detections)
                
                # Crowd density based on person count
                person_count = object_counts.get("person", 0)
                if person_count > 0:
                    scores["crowd_density"] = min(person_count * 15, 100)
                
                # Stampede detection based on high person count
                if person_count > 3:
                    scores["stampede"] = min(person_count * 10, 85)
                
                # Medical emergency - check for fallen person
                if person_count > 0:
                    fallen_persons = [d for d in person_detections if d["bbox"]["height"] < d["bbox"]["width"]]
                    if fallen_persons:
                        scores["medical_emergency"] = 60
                        scores["fallen"] = max(d["confidence"] * 100 for d in fallen_persons)
                
                # Running detection
                if person_count > 1:
                    scores["running"] = min(person_count * 12, 70)
                
                # Violence detection
                if person_count > 1:
                    scores["violence"] = min(person_count * 8, 45)
                
                # Weapon detection
                weapon_objects = ["knife", "gun", "rifle", "pistol"]
                weapon_detections = [d for d in detections if any(weapon in d["class"].lower() for weapon in weapon_objects)]
                if weapon_detections:
                    scores["weapon"] = max(d["confidence"] * 100 for d in weapon_detections)
                
                # Suspicious activity
                if len(detections) > 5 or person_count > 2:
                    scores["suspicious_activity"] = min(len(detections) * 8, 60)
                
                # "Me" detection - single person with high confidence
                if person_count == 1 and person_detections:
                    scores["me"] = person_detections[0]["confidence"] * 100
                
                logger.info(f"✅ Found cached data for {camera_id}, returning real scores: {scores}")
                return {
                    "success": True,
                    "scores": scores,
                    "camera_id": camera_id,
                    "timestamp": cached_data["timestamp"],
                    "detection_count": len(detections),
                    "person_count": person_count,
                    "message": "Detection scores from live ML analysis"
                }
                
        except Exception as ml_error:
            logger.warning(f"Could not access ML detection cache: {ml_error}")
        
        # Fallback to mock data if ML service is unavailable
        import random
        
        # For demo purposes, generate realistic mock scores
        # Person detection typically has high accuracy
        person_score = random.uniform(85, 98) if random.random() > 0.3 else random.uniform(60, 85)
        
        # Emergency events have lower base probability but can spike
        base_time = int(time.time()) % 100
        scores = {
            "person": random.randint(85, 95),
            "stampede": random.randint(0, 5),
            "medical_emergency": random.randint(15, 25),
            "fire": random.randint(0, 5),
            "smoke": random.randint(15, 25),
            "running": random.randint(25, 35),
            "fallen": random.randint(0, 5),
            "me": random.randint(95, 100),
            "violence": random.randint(80, 90),
            "crowd_density": random.randint(70, 80),
            "weapon": random.randint(80, 90),
            "suspicious_activity": random.randint(60, 70)
        }
        
        logger.info(f"📋 Returning fallback scores for {camera_id}: {scores}")
        
        return {
            "success": True,
            "scores": scores,
            "camera_id": camera_id,
            "timestamp": str(time.time()),
            "message": "Mock detection scores (ML cache unavailable)"
        }
        
    except Exception as e:
        logger.error(f"Error fetching detection scores for camera {camera_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch detection scores")
