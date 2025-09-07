"""
Test routes for generating sample incidents and alerts for development/demo purposes.
"""

import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

from app.deps import get_database, get_current_user, require_role
from app.auth.models import UserResponse
from app.realtime.socket import sio
from app.middleware.security import incident_limiter

router = APIRouter(prefix="/api/test", tags=["testing"])

# Sample incident data for testing
SAMPLE_INCIDENTS = [
    {
        "type": "fire",
        "severity": "critical",
        "description": "Fire detected in main auditorium - smoke visible",
        "zone": "central_zone",
        "location": "Main Auditorium, Section A",
        "confidence": 95
    },
    {
        "type": "medical_emergency", 
        "severity": "high",
        "description": "Person collapsed near food court - requires immediate medical attention",
        "zone": "east_zone",
        "location": "Food Court, Near Entrance",
        "confidence": 88
    },
    {
        "type": "crowd_surge",
        "severity": "medium",
        "description": "Large crowd gathering detected - potential safety concern",
        "zone": "west_zone", 
        "location": "West Entrance Gate",
        "confidence": 76
    },
    {
        "type": "security_threat",
        "severity": "high",
        "description": "Suspicious activity detected - unattended bag in restricted area",
        "zone": "north_zone",
        "location": "Security Checkpoint B",
        "confidence": 82
    },
    {
        "type": "equipment_failure",
        "severity": "low",
        "description": "Emergency lighting system malfunction in corridor",
        "zone": "south_zone",
        "location": "South Corridor, Level 2",
        "confidence": 91
    },
    {
        "type": "unconscious_person",
        "severity": "high", 
        "description": "Unconscious individual found in restroom area",
        "zone": "central_zone",
        "location": "Public Restrooms, Ground Floor",
        "confidence": 93
    }
]

ZONES = ["central_zone", "east_zone", "west_zone", "north_zone", "south_zone"]
SEVERITIES = ["critical", "high", "medium", "low"]
STATUSES = ["active", "assigned", "in_progress"]


@router.post("/generate-incident")
@incident_limiter.limit("10/60second")
async def generate_test_incident(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(require_role(["operator", "admin"]))
):
    """Generate a random test incident for development/demo purposes"""
    try:
        # Select random incident template
        template = random.choice(SAMPLE_INCIDENTS)
        
        # Create incident with some randomization
        incident_data = {
            **template,
            "id": f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
            "status": random.choice(STATUSES),
            "priority": random.randint(1, 5),
            "aiGenerated": True,
            "humanApprovalRequired": template["severity"] in ["critical", "high"],
            "humanApproved": template["severity"] not in ["critical", "high"],
            "timestamp": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "detectedBy": "AI_SYSTEM",
            "cameraId": f"CAM_{random.randint(1, 20):02d}",
            "assignedTo": None,
            "notes": [],
            "responseTime": None
        }
        
        # Add some variation to location and description
        if random.random() > 0.5:
            incident_data["zone"] = random.choice(ZONES)
        
        # Save to database
        result = await db.incidents.insert_one(incident_data)
        incident_data["_id"] = str(result.inserted_id)
        
        # Broadcast via Socket.IO with correct event name
        await sio.emit("new-incident", incident_data)
        
        return {
            "success": True,
            "message": "Test incident generated successfully",
            "incident": incident_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate test incident: {str(e)}")


@router.post("/generate-multiple-incidents")
@incident_limiter.limit("5/60second") 
async def generate_multiple_incidents(
    request: Request,
    count: int = 5,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(require_role(["operator", "admin"]))
):
    """Generate multiple test incidents at once"""
    try:
        if count > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 incidents can be generated at once")
        
        incidents = []
        
        for i in range(count):
            template = random.choice(SAMPLE_INCIDENTS)
            
            incident_data = {
                **template,
                "id": f"INC-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
                "status": random.choice(STATUSES),
                "priority": random.randint(1, 5),
                "aiGenerated": True,
                "humanApprovalRequired": template["severity"] in ["critical", "high"],
                "humanApproved": template["severity"] not in ["critical", "high"],
                "timestamp": datetime.utcnow() - timedelta(minutes=random.randint(0, 120)),
                "createdAt": datetime.utcnow() - timedelta(minutes=random.randint(0, 120)),
                "updatedAt": datetime.utcnow(),
                "detectedBy": "AI_SYSTEM",
                "cameraId": f"CAM_{random.randint(1, 20):02d}",
                "assignedTo": None,
                "notes": [],
                "responseTime": None
            }
            
            # Add variation
            if random.random() > 0.5:
                incident_data["zone"] = random.choice(ZONES)
            
            # Save to database
            result = await db.incidents.insert_one(incident_data)
            incident_data["_id"] = str(result.inserted_id)
            incidents.append(incident_data)
            
            # Broadcast via Socket.IO
            await sio.emit("new-incident", incident_data)
        
        return {
            "success": True,
            "message": f"{count} test incidents generated successfully",
            "incidents": incidents
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate test incidents: {str(e)}")


@router.post("/simulate-ml-detection")
@incident_limiter.limit("20/60second")
async def simulate_ml_detection(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(require_role(["operator", "admin"]))
):
    """Simulate ML detection system generating an incident"""
    try:
        # Simulate AI detection with high confidence
        detection_types = [
            {"type": "fire", "confidence": random.randint(85, 98)},
            {"type": "crowd_surge", "confidence": random.randint(75, 95)},
            {"type": "medical_emergency", "confidence": random.randint(80, 95)},
            {"type": "security_threat", "confidence": random.randint(70, 90)}
        ]
        
        detection = random.choice(detection_types)
        
        # Create incident based on detection
        incident_data = {
            "id": f"AI-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{random.randint(100, 999)}",
            "type": detection["type"],
            "severity": "critical" if detection["confidence"] > 90 else "high" if detection["confidence"] > 80 else "medium",
            "description": f"AI detected {detection['type'].replace('_', ' ')} with {detection['confidence']}% confidence",
            "zone": random.choice(ZONES),
            "location": f"Camera {random.randint(1, 20)} detection zone",
            "confidence": detection["confidence"],
            "status": "active",
            "priority": 5 if detection["confidence"] > 90 else 4,
            "aiGenerated": True,
            "humanApprovalRequired": True,
            "humanApproved": False,
            "timestamp": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "detectedBy": "YOLO_AI_SYSTEM",
            "cameraId": f"CAM_{random.randint(1, 20):02d}",
            "assignedTo": None,
            "notes": [],
            "responseTime": None,
            "mlData": {
                "model": "YOLOv8",
                "confidence": detection["confidence"],
                "boundingBoxes": [
                    {
                        "x": random.randint(100, 500),
                        "y": random.randint(100, 400), 
                        "width": random.randint(50, 200),
                        "height": random.randint(50, 200),
                        "class": detection["type"],
                        "confidence": detection["confidence"]
                    }
                ]
            }
        }
        
        # Save to database
        result = await db.incidents.insert_one(incident_data)
        incident_data["_id"] = str(result.inserted_id)
        
        # Broadcast via Socket.IO
        await sio.emit("new-incident", incident_data)
        
        return {
            "success": True,
            "message": "ML detection simulation completed",
            "incident": incident_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to simulate ML detection: {str(e)}")


@router.delete("/clear-test-incidents")
@incident_limiter.limit("2/60second")
async def clear_test_incidents(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(require_role(["admin"]))
):
    """Clear all test incidents (admin only)"""
    try:
        # Delete incidents created by AI or test system
        result = await db.incidents.delete_many({
            "$or": [
                {"aiGenerated": True},
                {"detectedBy": {"$in": ["AI_SYSTEM", "YOLO_AI_SYSTEM"]}}
            ]
        })
        
        return {
            "success": True,
            "message": f"Cleared {result.deleted_count} test incidents"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear test incidents: {str(e)}")


@router.get("/incident-stats")
async def get_test_stats(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get statistics about test incidents"""
    try:
        total_incidents = await db.incidents.count_documents({})
        ai_incidents = await db.incidents.count_documents({"aiGenerated": True})
        active_incidents = await db.incidents.count_documents({"status": "active"})
        
        return {
            "total_incidents": total_incidents,
            "ai_generated": ai_incidents,
            "active_incidents": active_incidents,
            "manual_incidents": total_incidents - ai_incidents
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get test stats: {str(e)}")
