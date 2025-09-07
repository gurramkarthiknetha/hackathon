"""
ML inference API routes for computer vision and AI analysis.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from typing import List, Optional
import numpy as np
import cv2
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_database, require_any_role
from app.ml.inference import InferenceService
from app.ml.enhanced_detection import get_enhanced_detector
from app.middleware.security import incident_limiter
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/api/ml", tags=["ml-inference"])
limiter = Limiter(key_func=get_remote_address)

# Global detection cache for accuracy levels
detection_cache = {}


@router.post("/detect")
async def detect_objects(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user = Depends(require_any_role)
):
    """Object detection endpoint"""
    try:
        # Read and validate image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Get ML service and run detection
        ml_service = InferenceService()
        results = await ml_service.detect_objects(image)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@router.post("/analyze/enhanced")
async def enhanced_multimodal_analysis(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user = Depends(require_any_role)
):
    """Enhanced multi-modal detection analysis with caching for accuracy levels"""
    try:
        # Read and validate image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Get enhanced detector and analyze
        detector = get_enhanced_detector()
        results = await detector.analyze_image(contents)
        
        # Also run standard object detection for comprehensive results
        ml_service = InferenceService()
        object_results = await ml_service.detect_objects(image)
        
        # Store results in cache for accuracy levels
        camera_ids = ["system_camera", "iphone_camera"]
        for i in range(10):
            camera_ids.append(f"system_{i}")
        
        # Process detections for caching
        detections = []
        object_counts = {}
        
        if object_results and 'detections' in object_results:
            for detection in object_results['detections']:
                class_name = detection.get('class', detection.get('label', 'unknown'))
                confidence = detection.get('confidence', detection.get('score', 0))
                bbox = detection.get('bbox', detection.get('box', {}))
                
                object_counts[class_name] = object_counts.get(class_name, 0) + 1
                
                detections.append({
                    "class": class_name,
                    "confidence": confidence,
                    "bbox": bbox
                })
        
        person_count = object_counts.get("person", 0)
        
        # Cache detection data for all camera IDs
        detection_data = {
            "detections": detections,
            "object_counts": object_counts,
            "person_count": person_count,
            "emergency_detected": results.get('detections', {}).get('fire', {}).get('detected', False),
            "emergency_type": "fire" if results.get('detections', {}).get('fire', {}).get('detected') else None,
            "risk_level": "high" if person_count > 5 else "low",
            "timestamp": str(np.datetime64('now')),
            "confidence_stats": {
                "average": np.mean([d["confidence"] for d in detections]) if detections else 0,
                "maximum": max([d["confidence"] for d in detections]) if detections else 0,
                "minimum": min([d["confidence"] for d in detections]) if detections else 0
            }
        }
        
        for camera_id in camera_ids:
            detection_cache[camera_id] = detection_data
        
        # Combine results
        combined_results = {
            "enhanced_multimodal": results,
            "standard_ml": {"objects": object_results},
            "success": True
        }
        
        return JSONResponse(content=combined_results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhanced analysis failed: {str(e)}")


@router.post("/analyze/comprehensive")
async def comprehensive_analysis(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user = Depends(require_any_role)
):
    """Comprehensive analysis combining all detection methods"""
    try:
        # Read and validate image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run both standard ML inference and enhanced detection
        ml_service = InferenceService()
        detector = get_enhanced_detector()
        
        # Standard detections
        object_results = await ml_service.detect_objects(image)
        fire_results = await ml_service.detect_fire_smoke(image)
        pose_results = await ml_service.analyze_pose(image)
        crowd_results = await ml_service.analyze_crowd(image)
        
        # Enhanced multi-modal detection
        enhanced_results = await detector.analyze_image(contents)
        
        # Combine results
        comprehensive_results = {
            'standard_ml': {
                'objects': object_results,
                'fire_smoke': fire_results,
                'pose': pose_results,
                'crowd': crowd_results
            },
            'enhanced_multimodal': enhanced_results,
            'summary': {
                'total_detections': len(object_results.get('detections', [])),
                'person_count': enhanced_results.get('person_count', 0),
                'critical_alerts': [],
                'confidence_scores': {}
            }
        }
        
        # Generate critical alerts
        if enhanced_results.get('detections', {}).get('fire', {}).get('detected'):
            comprehensive_results['summary']['critical_alerts'].append('Fire detected')
        if enhanced_results.get('detections', {}).get('stampede', {}).get('detected'):
            comprehensive_results['summary']['critical_alerts'].append('Stampede risk detected')
        if enhanced_results.get('detections', {}).get('medical_emergency', {}).get('detected'):
            comprehensive_results['summary']['critical_alerts'].append('Medical emergency detected')
        
        return JSONResponse(content=comprehensive_results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")


@router.post("/fire-smoke")
async def detect_fire_smoke(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_role)
):
    """Detect fire and smoke in uploaded image"""
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run fire/smoke detection
        result = await InferenceService.detect_fire_smoke(image)
        
        return {
            "success": True,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fire/smoke detection failed: {str(e)}")


@router.post("/pose")
async def analyze_pose(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_role)
):
    """Analyze human pose in uploaded image"""
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run pose analysis
        result = await InferenceService.analyze_pose(image)
        
        return {
            "success": True,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pose analysis failed: {str(e)}")


@router.post("/crowd-analysis")
async def analyze_crowd(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_any_role)
):
    """Analyze crowd density and detect potential issues"""
    try:
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run crowd analysis
        result = await InferenceService.analyze_crowd_density(image)
        
        return {
            "success": True,
            "result": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crowd analysis failed: {str(e)}")


@router.post("/analyze-frame")
async def analyze_video_frame(
    request: Request,
    file: UploadFile = File(...),
    analysis_types: Optional[str] = "objects,fire_smoke,crowd",
    current_user: dict = Depends(require_any_role)
):
    """Comprehensive analysis of video frame with multiple AI models"""
    try:
        # Parse analysis types
        if analysis_types:
            types_list = [t.strip() for t in analysis_types.split(",")]
        else:
            types_list = ["objects", "fire_smoke", "crowd"]
        
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Run comprehensive analysis
        results = await InferenceService.process_video_frame(image, types_list)
        
        return {
            "success": True,
            "results": results,
            "analysis_types": types_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame analysis failed: {str(e)}")


@router.get("/models/status")
async def get_model_status(current_user: dict = Depends(require_any_role)):
    """Get status of loaded ML models"""
    from app.ml.inference import model_manager
    
    status = {
        "loaded_models": list(model_manager.models.keys()),
        "available_models": list(model_manager.model_configs.keys()),
        "model_info": {}
    }
    
    for name, config in model_manager.model_configs.items():
        status["model_info"][name] = {
            "type": config["type"],
            "loaded": name in model_manager.models
        }
    
    return {
        "success": True,
        "status": status
    }


@router.post("/models/warmup")
async def warmup_models(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_any_role)
):
    """Trigger model warmup in background"""
    from app.ml.inference import model_manager
    
    background_tasks.add_task(model_manager.warmup_models)
    
    return {
        "success": True,
        "message": "Model warmup started in background"
    }
