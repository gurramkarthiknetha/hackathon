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
            model_path = Path(__file__).parent / 'models/yolov8n.pt'
            if model_path.exists():
                self.model = YOLO(str(model_path))
                logger.info(f"✅ Loaded YOLOv8 model from {model_path}")
            else:
                # Download default YOLOv8 nano model
                self.model = YOLO('yolov8n.pt')
                logger.info("✅ Loaded default YOLOv8n model")
        except Exception as e:
            logger.error(f"❌ Failed to load YOLO model: {e}")
            self.model = None
    
    async def detect_objects(self, image: np.ndarray) -> dict:
        """Run object detection on image"""
        if not self.model:
            return {
                "success": False,
                "error": "Model not loaded",
                "detections": []
            }
        
        try:
            # Run inference
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
            
            # Count persons and check for emergencies
            person_count = len([d for d in detections if d["class"] == "person"])
            
            # Simple emergency detection logic
            emergency_detected = False
            emergency_type = None
            
            if person_count > 5:
                emergency_detected = True
                emergency_type = "crowd_density"
            
            return {
                "success": True,
                "detections": detections,
                "person_count": person_count,
                "emergency_detected": emergency_detected,
                "emergency_type": emergency_type,
                "analysis_timestamp": str(np.datetime64('now'))
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
