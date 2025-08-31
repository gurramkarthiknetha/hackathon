"""
ML inference API routes for computer vision and AI analysis.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import List, Optional
import numpy as np
import cv2
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.deps import get_db, require_any_role
from app.ml.inference import MLInferenceService
from app.ml.enhanced_detection import get_enhanced_detector
from app.middleware.security import incident_limiter
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/api/ml", tags=["ml-inference"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/detect")
@limiter.limit("10/1minute")
async def detect_objects(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(require_any_role(["operator", "admin", "responder"]))
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
        ml_service = MLInferenceService()
        results = await ml_service.detect_objects(image)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


@router.post("/analyze/enhanced")
@limiter.limit("5/1minute")
async def enhanced_multimodal_analysis(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(require_any_role(["operator", "admin", "responder"]))
):
    """Enhanced multi-modal detection analysis"""
    try:
        # Read and validate image
        contents = await file.read()
        
        # Get enhanced detector and analyze
        detector = get_enhanced_detector()
        results = await detector.analyze_image(contents)
        
        return JSONResponse(content=results)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enhanced analysis failed: {str(e)}")


@router.post("/analyze/comprehensive")
@limiter.limit("3/1minute")
async def comprehensive_analysis(
    file: UploadFile = File(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user = Depends(require_any_role(["operator", "admin", "responder"]))
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
        ml_service = MLInferenceService()
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
@limiter.limit("10/1minute")
async def detect_fire_smoke(
    request,
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
@limiter.limit("10/1minute")
async def analyze_pose(
    request,
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
@limiter.limit("10/1minute")
async def analyze_crowd(
    request,
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
@limiter.limit("20/1minute")
async def analyze_video_frame(
    request,
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
