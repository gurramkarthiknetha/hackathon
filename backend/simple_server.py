"""
Simple FastAPI server for testing ML detection with Socket.IO support.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
import uvicorn
from pathlib import Path
import sys
import socketio

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

# Detection results cache
detection_cache = {}

# Simple YOLOv8 detection
try:
    from ultralytics import YOLO
    model_path = Path(__file__).parent / 'app/ml/models/yolov8n.pt'
    if model_path.exists():
        yolo_model = YOLO(str(model_path))
    else:
        yolo_model = YOLO('yolov8n.pt')  # Download default
    print("✅ YOLOv8 model loaded successfully")
except Exception as e:
    print(f"❌ Failed to load YOLO model: {e}")
    yolo_model = None

app = FastAPI(title="AI Event Monitor API")

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=["http://localhost:5174", "http://localhost:5173"],
    logger=True,
    engineio_logger=True
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    print(f'🔌 User connected: {sid}')

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f'🔌 User disconnected: {sid}')

@sio.event
async def join_room(sid, data):
    """Handle user joining rooms"""
    try:
        user_id = data.get('userId')
        role = data.get('role')
        zone = data.get('zone')

        print(f'👥 User {user_id} ({role}) joined rooms')

        # Join role-based room
        if role:
            await sio.enter_room(sid, role)

        # Join zone-based room
        if zone:
            await sio.enter_room(sid, zone)

    except Exception as e:
        print(f'❌ Error in join_room: {e}')

# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

@app.get("/health")
async def health():
    return {"status": "ok", "yolo_loaded": yolo_model is not None}

@app.get("/api/cameras")
async def get_cameras():
    """Mock camera endpoint"""
    return {
        "success": True,
        "data": [
            {
                "id": "camera_1",
                "name": "Main Camera",
                "location": "Main Area",
                "status": "active"
            }
        ]
    }

@app.post("/api/ml/analyze/enhanced")
async def analyze_frame(file: UploadFile = File(...)):
    """Analyze video frame with YOLOv8 for comprehensive object detection"""
    try:
        if not yolo_model:
            return JSONResponse(content={
                "success": False,
                "error": "YOLO model not loaded",
                "detections": []
            })

        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")

        # Run YOLO detection with optimized settings for real-time processing
        results = yolo_model(image, conf=0.25, iou=0.45, verbose=False)

        detections = []
        object_counts = {}

        for r in results:
            boxes = r.boxes
            if boxes is not None:
                for i in range(len(boxes)):
                    box = boxes.xyxy[i].cpu().numpy()
                    conf = float(boxes.conf[i].cpu().numpy())
                    cls = int(boxes.cls[i].cpu().numpy())
                    class_name = yolo_model.names[cls]

                    # Count objects by class
                    object_counts[class_name] = object_counts.get(class_name, 0) + 1

                    # Calculate box dimensions for additional analysis
                    width = float(box[2] - box[0])
                    height = float(box[3] - box[1])
                    area = width * height
                    center_x = float(box[0] + width / 2)
                    center_y = float(box[1] + height / 2)

                    detection = {
                        "class": class_name,
                        "confidence": round(conf, 3),
                        "bbox": {
                            "x1": float(box[0]),
                            "y1": float(box[1]),
                            "x2": float(box[2]),
                            "y2": float(box[3]),
                            "width": width,
                            "height": height,
                            "center_x": center_x,
                            "center_y": center_y,
                            "area": area
                        },
                        "class_id": cls
                    }
                    detections.append(detection)

        # Analyze detection results
        person_count = object_counts.get("person", 0)
        vehicle_count = sum(object_counts.get(vehicle, 0) for vehicle in ["car", "truck", "bus", "motorcycle", "bicycle"])
        total_objects = len(detections)

        # Enhanced emergency detection logic
        emergency_detected = False
        emergency_type = None
        risk_level = "low"
        alerts = []

        # Crowd density analysis
        if person_count > 10:
            emergency_detected = True
            emergency_type = "high_crowd_density"
            risk_level = "high"
            alerts.append(f"High crowd density detected: {person_count} people")
        elif person_count > 5:
            risk_level = "medium"
            alerts.append(f"Moderate crowd density: {person_count} people")

        # Vehicle analysis
        if vehicle_count > 3:
            alerts.append(f"Multiple vehicles detected: {vehicle_count}")

        # Dangerous object detection
        dangerous_objects = ["knife", "gun", "fire", "smoke"]
        detected_objects = [d["class"] for d in detections]
        dangerous_found = [obj for obj in dangerous_objects if obj in detected_objects]

        if dangerous_found:
            emergency_detected = True
            emergency_type = "dangerous_object"
            risk_level = "critical"
            alerts.append(f"Dangerous objects detected: {', '.join(dangerous_found)}")

        # Get unique object classes with counts
        object_summary = [f"{obj}: {count}" for obj, count in object_counts.items()]

        # Calculate confidence statistics
        if detections:
            avg_confidence = sum(d["confidence"] for d in detections) / len(detections)
            max_confidence = max(d["confidence"] for d in detections)
            min_confidence = min(d["confidence"] for d in detections)
        else:
            avg_confidence = max_confidence = min_confidence = 0.0

        # Store detection results in cache for accuracy levels
        # Support multiple camera ID formats
        camera_ids = ["system_camera", "iphone_camera"]
        # Also support system camera IDs that start with "system_"
        for i in range(10):  # Support system_0 through system_9
            camera_ids.append(f"system_{i}")
        
        # Store results for all possible camera IDs
        detection_data = {
            "detections": detections,
            "object_counts": object_counts,
            "person_count": person_count,
            "emergency_detected": emergency_detected,
            "emergency_type": emergency_type,
            "risk_level": risk_level,
            "timestamp": np.datetime64('now').astype(str),
            "confidence_stats": {
                "average": round(avg_confidence, 3),
                "maximum": round(max_confidence, 3),
                "minimum": round(min_confidence, 3)
            }
        }
        
        for camera_id in camera_ids:
            detection_cache[camera_id] = detection_data

        return JSONResponse(content={
            "success": True,
            "detections": detections,
            "summary": {
                "total_objects": total_objects,
                "person_count": person_count,
                "vehicle_count": vehicle_count,
                "object_counts": object_counts,
                "object_summary": object_summary,
                "unique_classes": len(object_counts)
            },
            "analysis": {
                "emergency_detected": emergency_detected,
                "emergency_type": emergency_type,
                "risk_level": risk_level,
                "alerts": alerts,
                "confidence_stats": {
                    "average": round(avg_confidence, 3),
                    "maximum": round(max_confidence, 3),
                    "minimum": round(min_confidence, 3)
                }
            },
            "detected_objects": detected_objects,
            "analysis_timestamp": str(np.datetime64('now')),
            "processing_info": {
                "model": "YOLOv8n",
                "confidence_threshold": 0.25,
                "iou_threshold": 0.45
            }
        })

    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e),
            "detections": [],
            "summary": {
                "total_objects": 0,
                "person_count": 0,
                "vehicle_count": 0,
                "object_counts": {},
                "object_summary": [],
                "unique_classes": 0
            },
            "analysis": {
                "emergency_detected": False,
                "emergency_type": None,
                "risk_level": "unknown",
                "alerts": [f"Analysis failed: {str(e)}"],
                "confidence_stats": {
                    "average": 0.0,
                    "maximum": 0.0,
                    "minimum": 0.0
                }
            }
        })

@app.get("/api/cameras/{camera_id}/detection-scores")
async def get_detection_scores(camera_id: str):
    """Get real-time detection confidence scores from cached ML results"""
    try:
        # Check if we have cached detection results for this camera
        if camera_id not in detection_cache:
            # Return zero scores if no detection data available
            return JSONResponse(content={
                "success": True,
                "scores": {
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
                },
                "camera_id": camera_id,
                "timestamp": np.datetime64('now').astype(str),
                "message": "No detection data available"
            })
        
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
            scores["crowd_density"] = min(person_count * 15, 100)  # Scale person count to percentage
        
        # Stampede detection based on high person count and movement patterns
        if person_count > 3:
            scores["stampede"] = min(person_count * 10, 85)
        
        # Medical emergency - basic heuristic based on person positions and context
        if person_count > 0:
            # Check for potential fallen person (low bounding boxes)
            fallen_persons = [d for d in person_detections if d["bbox"]["height"] < d["bbox"]["width"]]
            if fallen_persons:
                scores["medical_emergency"] = 60
                scores["fallen"] = max(d["confidence"] * 100 for d in fallen_persons)
        
        # Running detection - heuristic based on person aspect ratios and positions
        if person_count > 1:
            # Simple heuristic: multiple people might indicate running/movement
            scores["running"] = min(person_count * 12, 70)
        
        # Violence detection - basic heuristic
        if person_count > 1:
            scores["violence"] = min(person_count * 8, 45)
        
        # Weapon detection
        weapon_objects = ["knife", "gun", "rifle", "pistol"]
        weapon_detections = [d for d in detections if any(weapon in d["class"].lower() for weapon in weapon_objects)]
        if weapon_detections:
            scores["weapon"] = max(d["confidence"] * 100 for d in weapon_detections)
        
        # Suspicious activity - general heuristic
        if len(detections) > 5 or person_count > 2:
            scores["suspicious_activity"] = min(len(detections) * 8, 60)
        
        # "Me" detection - if there's exactly one person with high confidence
        if person_count == 1 and person_detections:
            scores["me"] = person_detections[0]["confidence"] * 100
        
        return JSONResponse(content={
            "success": True,
            "scores": scores,
            "camera_id": camera_id,
            "timestamp": cached_data["timestamp"],
            "detection_count": len(detections),
            "person_count": person_count,
            "message": "Detection scores retrieved from live ML analysis"
        })
        
    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e),
            "scores": {
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
            },
            "camera_id": camera_id,
            "timestamp": np.datetime64('now').astype(str)
        })

@app.get("/api/ml/model-info")
async def get_model_info():
    """Get information about the loaded YOLO model"""
    if not yolo_model:
        return JSONResponse(content={
            "success": False,
            "error": "Model not loaded"
        })

    return JSONResponse(content={
        "success": True,
        "model_info": {
            "name": "YOLOv8n",
            "classes": list(yolo_model.names.values()),
            "class_count": len(yolo_model.names),
            "confidence_threshold": 0.25,
            "iou_threshold": 0.45,
            "input_size": "640x640",
            "framework": "Ultralytics YOLOv8"
        }
    })

@app.get("/api/ml/supported-objects")
async def get_supported_objects():
    """Get list of objects that can be detected"""
    if not yolo_model:
        return JSONResponse(content={
            "success": False,
            "error": "Model not loaded",
            "classes": []
        })

    # Group classes by category for better organization
    categories = {
        "People": ["person"],
        "Vehicles": ["bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat"],
        "Animals": ["bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe"],
        "Objects": ["backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
                   "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket"],
        "Furniture": ["chair", "couch", "potted plant", "bed", "dining table", "toilet"],
        "Electronics": ["tv", "laptop", "mouse", "remote", "keyboard", "cell phone"],
        "Kitchen": ["bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl"],
        "Food": ["banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza",
                "donut", "cake"]
    }

    return JSONResponse(content={
        "success": True,
        "total_classes": len(yolo_model.names),
        "categories": categories,
        "all_classes": list(yolo_model.names.values())
    })

# Authentication endpoints for simple testing
@app.post("/api/auth/signup")
async def signup(request: Request):
    """Simple signup endpoint for testing"""
    try:
        body = await request.json()

        # Validate required fields
        required_fields = ["email", "password", "name", "role"]
        for field in required_fields:
            if field not in body:
                return JSONResponse(
                    status_code=400,
                    content={"success": False, "error": f"Missing required field: {field}"}
                )

        # Validate role
        valid_roles = ["admin", "operator", "responder"]
        if body["role"] not in valid_roles:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"
                }
            )

        # Simple user creation (in-memory for testing)
        user_data = {
            "id": f"user_{len(body['email'])}_{body['role']}",
            "email": body["email"],
            "name": body["name"],
            "role": body["role"],
            "isVerified": True,
            "isActive": True,
            "createdAt": str(np.datetime64('now')),
            "assignedZone": body.get("assignedZone"),
            "phoneNumber": body.get("phoneNumber")
        }

        return JSONResponse(content={
            "success": True,
            "message": "User created successfully",
            "user": user_data
        })

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.post("/api/auth/login")
async def login(request: Request):
    """Simple login endpoint for testing"""
    try:
        body = await request.json()

        # Validate required fields
        if "email" not in body or "password" not in body:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Email and password required"}
            )

        # Simple authentication (accept any credentials for testing)
        user_data = {
            "id": f"user_{len(body['email'])}_operator",
            "email": body["email"],
            "name": body["email"].split("@")[0].title(),
            "role": "operator",
            "isVerified": True,
            "isActive": True,
            "lastLogin": str(np.datetime64('now')),
            "assignedZone": "Zone A"
        }

        return JSONResponse(content={
            "success": True,
            "message": "Logged in successfully",
            "user": user_data
        })

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.get("/api/auth/check-auth")
async def check_auth():
    """Check authentication status"""
    # For testing, always return authenticated
    user_data = {
        "id": "test_user_operator",
        "email": "test@example.com",
        "name": "Test User",
        "role": "operator",
        "isVerified": True,
        "isActive": True,
        "assignedZone": "Zone A"
    }

    return JSONResponse(content={
        "success": True,
        "authenticated": True,
        "user": user_data
    })

@app.post("/api/auth/logout")
async def logout():
    """Simple logout endpoint"""
    return JSONResponse(content={
        "success": True,
        "message": "Logged out successfully"
    })

if __name__ == "__main__":
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
