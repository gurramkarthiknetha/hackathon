"""
Simple ML routes for YOLOv8 detection without complex dependencies.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Request
from fastapi.responses import JSONResponse
import numpy as np
import cv2

from app.ml.simple_detection import detection_service
from app.middleware.security import incident_limiter

router = APIRouter(prefix="/api/ml", tags=["ml-detection"])


@router.post("/analyze/enhanced")
async def analyze_frame(
    request: Request,
    file: UploadFile = File(...)
):
    """Analyze video frame with YOLOv8 model"""
    try:
        # Read and validate image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run detection
        results = await detection_service.detect_objects(image)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/models/status")
async def get_model_status():
    """Get status of loaded ML models"""
    return {
        "success": True,
        "status": {
            "yolo_model_loaded": detection_service.model is not None,
            "model_type": "YOLOv8",
            "available": True
        }
    }
