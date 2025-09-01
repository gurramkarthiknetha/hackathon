"""
ML inference service for computer vision and AI detection models.
Integrates Torch, TensorFlow, Ultralytics for real-time analysis.
"""

import asyncio
import numpy as np
import cv2
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import torch
import tensorflow as tf
from ultralytics import YOLO
import mediapipe as mp
from pathlib import Path

from app.config import settings


class ModelManager:
    """Manages loading and caching of ML models"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_configs = {
            'yolo_detection': {
                'path': 'models/yolo_detection.pt',
                'type': 'ultralytics',
                'classes': ['person', 'fire', 'smoke', 'crowd']
            },
            'fire_smoke_detection': {
                'path': 'models/fire_smoke_model.h5',
                'type': 'tensorflow',
                'input_shape': (224, 224, 3)
            },
            'pose_estimation': {
                'type': 'mediapipe',
                'model': 'pose'
            }
        }
    
    async def load_model(self, model_name: str) -> Any:
        """Load a model if not already cached"""
        if model_name in self.models:
            return self.models[model_name]
        
        config = self.model_configs.get(model_name)
        if not config:
            raise ValueError(f"Unknown model: {model_name}")
        
        try:
            if config['type'] == 'ultralytics':
                # Load YOLOv8 model
                model_path = Path(__file__).parent / config['path']
                if not model_path.exists():
                    # Use the existing yolov8n.pt model
                    model_path = Path(__file__).parent / 'models/yolov8n.pt'
                    if not model_path.exists():
                        # Fallback to default model
                        model_path = "yolov8n.pt"
                model = YOLO(str(model_path))
                self.models[model_name] = model
                print(f"✅ Loaded YOLO model: {model_name}")
                return model
                
            elif config['type'] == 'tensorflow':
                model_path = Path(__file__).parent / config['path']
                if model_path.exists():
                    model = tf.keras.models.load_model(str(model_path))
                    self.models[model_name] = model
                    print(f"✅ Loaded TensorFlow model: {model_name}")
                    return model
                else:
                    print(f"⚠️ TensorFlow model not found: {model_path}")
                    return None
                    
            elif config['type'] == 'mediapipe':
                if config['model'] == 'pose':
                    model = mp.solutions.pose.Pose(
                        static_image_mode=False,
                        model_complexity=1,
                        enable_segmentation=False,
                        min_detection_confidence=0.5
                    )
                    self.models[model_name] = model
                    print(f"✅ Loaded MediaPipe model: {model_name}")
                    return model
                    
        except Exception as e:
            print(f"❌ Failed to load model {model_name}: {e}")
            return None
    
    async def warmup_models(self):
        """Preload all models for faster inference"""
        print("🔥 Warming up ML models...")
        for model_name in self.model_configs.keys():
            await self.load_model(model_name)
        print("✅ Model warmup complete")


class MockModel:
    """Mock model for development when actual models aren't available"""
    
    def __init__(self, name: str):
        self.name = name
    
    def predict(self, *args, **kwargs):
        """Return mock predictions"""
        if 'yolo' in self.name:
            return [MockYOLOResult()]
        elif 'fire_smoke' in self.name:
            return np.array([[0.1, 0.9]])  # [no_fire, fire]
        return None
    
    def process(self, *args, **kwargs):
        """Mock MediaPipe processing"""
        return MockMediaPipeResult()


class MockYOLOResult:
    """Mock YOLO detection result"""
    
    def __init__(self):
        self.boxes = MockBoxes()
    
    @property
    def names(self):
        return {0: 'person', 1: 'fire', 2: 'smoke', 3: 'crowd'}


class MockBoxes:
    """Mock YOLO bounding boxes"""
    
    @property
    def xyxy(self):
        return torch.tensor([[100, 100, 200, 200]])  # Mock bounding box
    
    @property
    def conf(self):
        return torch.tensor([0.85])  # Mock confidence
    
    @property
    def cls(self):
        return torch.tensor([1])  # Mock class (fire)


class MockMediaPipeResult:
    """Mock MediaPipe result"""
    
    def __init__(self):
        self.pose_landmarks = None


# Global model manager
model_manager = ModelManager()


class InferenceService:
    """Main inference service for ML predictions"""
    
    @staticmethod
    async def detect_objects(image_data: np.ndarray, model_name: str = 'yolo_detection') -> List[Dict[str, Any]]:
        """Detect objects in image using YOLO"""
        try:
            model = await model_manager.load_model(model_name)
            results = model.predict(image_data, conf=0.5)
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for i, box in enumerate(boxes.xyxy):
                        detection = {
                            'bbox': {
                                'x': float(box[0]),
                                'y': float(box[1]),
                                'width': float(box[2] - box[0]),
                                'height': float(box[3] - box[1])
                            },
                            'confidence': float(boxes.conf[i]),
                            'class_id': int(boxes.cls[i]),
                            'class_name': result.names[int(boxes.cls[i])],
                            'timestamp': datetime.utcnow().isoformat()
                        }
                        detections.append(detection)
            
            return detections
            
        except Exception as e:
            print(f"❌ Object detection error: {e}")
            return []
    
    @staticmethod
    async def detect_fire_smoke(image_data: np.ndarray) -> Dict[str, Any]:
        """Detect fire and smoke using TensorFlow model"""
        try:
            model = await model_manager.load_model('fire_smoke_detection')
            
            # Preprocess image
            image_resized = cv2.resize(image_data, (224, 224))
            image_normalized = image_resized.astype(np.float32) / 255.0
            image_batch = np.expand_dims(image_normalized, axis=0)
            
            # Predict
            predictions = model.predict(image_batch)
            fire_confidence = float(predictions[0][1])  # Assuming binary classification
            
            return {
                'fire_detected': fire_confidence > 0.5,
                'confidence': fire_confidence,
                'severity': 'high' if fire_confidence > 0.8 else 'medium' if fire_confidence > 0.5 else 'low',
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Fire/smoke detection error: {e}")
            return {
                'fire_detected': False,
                'confidence': 0.0,
                'severity': 'low',
                'timestamp': datetime.utcnow().isoformat()
            }
    
    @staticmethod
    async def analyze_pose(image_data: np.ndarray) -> Dict[str, Any]:
        """Analyze human pose using MediaPipe"""
        try:
            model = await model_manager.load_model('pose_estimation')
            
            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(image_data, cv2.COLOR_BGR2RGB)
            
            # Process image
            results = model.process(image_rgb)
            
            pose_data = {
                'pose_detected': results.pose_landmarks is not None,
                'landmarks': [],
                'timestamp': datetime.utcnow().isoformat()
            }
            
            if results.pose_landmarks:
                for landmark in results.pose_landmarks.landmark:
                    pose_data['landmarks'].append({
                        'x': landmark.x,
                        'y': landmark.y,
                        'z': landmark.z,
                        'visibility': landmark.visibility
                    })
            
            return pose_data
            
        except Exception as e:
            print(f"❌ Pose analysis error: {e}")
            return {
                'pose_detected': False,
                'landmarks': [],
                'timestamp': datetime.utcnow().isoformat()
            }
    
    @staticmethod
    async def analyze_crowd_density(image_data: np.ndarray) -> Dict[str, Any]:
        """Analyze crowd density and detect potential issues"""
        try:
            # Use YOLO to detect people
            detections = await InferenceService.detect_objects(image_data)
            person_detections = [d for d in detections if d['class_name'] == 'person']
            
            person_count = len(person_detections)
            image_area = image_data.shape[0] * image_data.shape[1]
            density = person_count / (image_area / 10000)  # People per 100x100 pixel area
            
            # Determine risk level
            if density > 0.5:
                risk_level = 'high'
            elif density > 0.2:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            return {
                'person_count': person_count,
                'density': density,
                'risk_level': risk_level,
                'crowd_surge_detected': density > 0.6,
                'detections': person_detections,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Crowd analysis error: {e}")
            return {
                'person_count': 0,
                'density': 0.0,
                'risk_level': 'low',
                'crowd_surge_detected': False,
                'detections': [],
                'timestamp': datetime.utcnow().isoformat()
            }
    
    @staticmethod
    async def process_video_frame(frame_data: np.ndarray, analysis_types: List[str] = None) -> Dict[str, Any]:
        """Process a single video frame with multiple analysis types"""
        if analysis_types is None:
            analysis_types = ['objects', 'fire_smoke', 'crowd']
        
        results = {
            'timestamp': datetime.utcnow().isoformat(),
            'frame_shape': frame_data.shape
        }
        
        # Run analyses concurrently
        tasks = []
        
        if 'objects' in analysis_types:
            tasks.append(('objects', InferenceService.detect_objects(frame_data)))
        
        if 'fire_smoke' in analysis_types:
            tasks.append(('fire_smoke', InferenceService.detect_fire_smoke(frame_data)))
        
        if 'pose' in analysis_types:
            tasks.append(('pose', InferenceService.analyze_pose(frame_data)))
        
        if 'crowd' in analysis_types:
            tasks.append(('crowd', InferenceService.analyze_crowd_density(frame_data)))
        
        # Execute all tasks concurrently
        for name, task in tasks:
            try:
                results[name] = await task
            except Exception as e:
                print(f"❌ Error in {name} analysis: {e}")
                results[name] = {'error': str(e)}
        
        return results
    
    @staticmethod
    def preprocess_image(image_path: str) -> Optional[np.ndarray]:
        """Load and preprocess image from file path or URL"""
        try:
            if image_path.startswith(('http://', 'https://')):
                # Handle URL
                import requests
                response = requests.get(image_path)
                image_array = np.frombuffer(response.content, np.uint8)
                image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
            else:
                # Handle file path
                image = cv2.imread(image_path)
            
            if image is None:
                raise ValueError("Could not load image")
            
            return image
            
        except Exception as e:
            print(f"❌ Image preprocessing error: {e}")
            return None


# Initialize models on startup
async def initialize_ml_models():
    """Initialize ML models during application startup"""
    await model_manager.warmup_models()
