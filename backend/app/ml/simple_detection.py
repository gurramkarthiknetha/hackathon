"""
Simple YOLOv8 detection service without complex dependencies.
"""

import cv2
import numpy as np
from ultralytics import YOLO
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class SimpleDetectionService:
    """Simple detection service using YOLOv8"""
    
    def __init__(self):
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load YOLOv8 model"""
        try:
            # First try to load the trained model
            model_path = Path(__file__).parent / 'models/yolov8n.pt'
            if model_path.exists():
                self.model = YOLO(str(model_path))
                logger.info(f"✅ Loaded trained YOLOv8 model from {model_path}")
            else:
                # Fallback to default YOLOv8 nano model
                self.model = YOLO('yolov8n.pt')
                logger.warning(f"⚠️ Trained model not found at {model_path}, using default YOLOv8n model")
        except Exception as e:
            logger.error(f"❌ Failed to load YOLO model: {e}")
            self.model = None
    
    def detect_fire_by_color(self, image: np.ndarray) -> dict:
        """Detect fire using color-based analysis"""
        try:
            # Convert to HSV for better color detection
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # Define fire color ranges (orange/red/yellow)
            fire_ranges = [
                # Orange-red range
                (np.array([0, 120, 70]), np.array([20, 255, 255])),
                # Yellow-orange range  
                (np.array([15, 120, 70]), np.array([35, 255, 255])),
                # Deep red range
                (np.array([170, 120, 70]), np.array([180, 255, 255]))
            ]
            
            fire_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
            for lower, upper in fire_ranges:
                mask = cv2.inRange(hsv, lower, upper)
                fire_mask = cv2.bitwise_or(fire_mask, mask)
            
            # Calculate fire area percentage
            fire_pixels = cv2.countNonZero(fire_mask)
            total_pixels = image.shape[0] * image.shape[1]
            fire_percentage = fire_pixels / total_pixels
            
            # Fire detected if significant fire-colored area
            fire_detected = fire_percentage > 0.02  # 2% of image
            confidence = min(fire_percentage * 10, 1.0)  # Scale to 0-1
            
            return {
                "detected": fire_detected,
                "confidence": confidence,
                "fire_percentage": fire_percentage
            }
            
        except Exception as e:
            logger.error(f"Fire detection error: {e}")
            return {"detected": False, "confidence": 0.0, "fire_percentage": 0.0}
    
    async def detect_objects(self, image: np.ndarray) -> dict:
        """Run object detection on image"""
        if not self.model:
            return {
                "success": False,
                "error": "Model not loaded",
                "detections": []
            }
        
        try:
            # Run YOLO inference
            results = self.model(image)
            
            detections = []
            for r in results:
                boxes = r.boxes
                if boxes is not None:
                    for i in range(len(boxes)):
                        box = boxes.xyxy[i].cpu().numpy()
                        conf = float(boxes.conf[i].cpu().numpy())
                        cls = int(boxes.cls[i].cpu().numpy())
                        class_name = self.model.names[cls]
                        
                        # Include all detections above confidence threshold
                        if conf >= 0.1:  # Lower threshold for better detection
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
            
            # Run fire detection
            fire_result = self.detect_fire_by_color(image)
            
            # Count persons and check for emergencies
            person_count = len([d for d in detections if d["class"] == "person"])
            
            # Emergency detection logic
            emergency_detected = False
            emergency_type = None
            
            # Check for fire
            fire_detected = fire_result["detected"]
            if fire_detected:
                emergency_detected = True
                emergency_type = "fire"
            
            # Check for crowd
            elif person_count > 5:
                emergency_detected = True
                emergency_type = "crowd_density"
            
            # Format response to match comprehensive analysis structure
            return {
                "success": True,
                "standard_ml": {
                    "objects": [
                        {
                            "class_name": d["class"],
                            "confidence": d["confidence"],
                            "bbox": {
                                "x": d["bbox"]["x1"],
                                "y": d["bbox"]["y1"],
                                "width": d["bbox"]["x2"] - d["bbox"]["x1"],
                                "height": d["bbox"]["y2"] - d["bbox"]["y1"]
                            }
                        }
                        for d in detections
                    ]
                },
                "enhanced_multimodal": {
                    "detections": {
                        "stampede": {"detected": emergency_detected and emergency_type == "crowd_density", "confidence": 0.8 if emergency_detected and emergency_type == "crowd_density" else 0.0},
                        "medical_emergency": {"detected": False, "confidence": 0.0},
                        "fire": {"detected": fire_detected, "confidence": fire_result["confidence"]},
                        "smoke": {"detected": False, "confidence": 0.0},
                        "fallen": {"detected": False, "confidence": 0.0},
                        "running": {"detected": False, "confidence": 0.0}
                    },
                    "person_count": person_count,
                    "person_bboxes": [
                        {
                            "bbox": [d["bbox"]["x1"], d["bbox"]["y1"], 
                                    d["bbox"]["x2"] - d["bbox"]["x1"], 
                                    d["bbox"]["y2"] - d["bbox"]["y1"]],
                            "confidence": d["confidence"]
                        }
                        for d in detections if d["class"] == "person"
                    ],
                    "timestamp": str(np.datetime64('now'))
                },
                "summary": {
                    "total_detections": len(detections),
                    "person_count": person_count,
                    "critical_alerts": [emergency_type] if emergency_detected else []
                }
            }
            
        except Exception as e:
            logger.error(f"Detection error: {e}")
            return {
                "success": False,
                "error": str(e),
                "detections": []
            }

# Global instance
detection_service = SimpleDetectionService()
