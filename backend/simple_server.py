"""
Simple FastAPI server for testing ML detection without complex dependencies.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
import uvicorn
from pathlib import Path
import sys

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

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

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

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
    """Analyze video frame with YOLOv8"""
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
        
        # Run YOLO detection
        results = yolo_model(image)
        
        detections = []
        for r in results:
            boxes = r.boxes
            if boxes is not None:
                for i in range(len(boxes)):
                    box = boxes.xyxy[i].cpu().numpy()
                    conf = float(boxes.conf[i].cpu().numpy())
                    cls = int(boxes.cls[i].cpu().numpy())
                    class_name = yolo_model.names[cls]
                    
                    detection = {
                        "class": class_name,
                        "confidence": conf,
                        "bbox": {
                            "x1": float(box[0]),
                            "y1": float(box[1]),
                            "x2": float(box[2]),
                            "y2": float(box[3])
                        }
                    }
                    detections.append(detection)
        
        # Count persons and analyze
        person_count = len([d for d in detections if d["class"] == "person"])
        
        # Emergency detection logic
        emergency_detected = False
        emergency_type = None
        
        if person_count > 5:
            emergency_detected = True
            emergency_type = "crowd_density"
        
        # Check for specific objects
        detected_objects = [d["class"] for d in detections]
        if "fire" in detected_objects:
            emergency_detected = True
            emergency_type = "fire"
        
        return JSONResponse(content={
            "success": True,
            "detections": detections,
            "person_count": person_count,
            "emergency_detected": emergency_detected,
            "emergency_type": emergency_type,
            "detected_objects": detected_objects,
            "analysis_timestamp": str(np.datetime64('now'))
        })
        
    except Exception as e:
        return JSONResponse(content={
            "success": False,
            "error": str(e),
            "detections": []
        })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
