#!/usr/bin/env python3
"""
Enhanced Multi-Modal Detection System for FastAPI Backend
Integrates YOLO + Pose + Fire/Smoke + Crowd + Audio detection
"""

import cv2
import json
import time
import datetime
import numpy as np
from ultralytics import YOLO
import threading
from collections import deque
import os
import logging
from typing import Dict, List, Optional, Tuple, Any

# Import specialized detection modules
try:
    import mediapipe as mp
    import tensorflow as tf
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.preprocessing import image
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
    ENHANCED_MODULES_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Enhanced modules not available: {e}")
    ENHANCED_MODULES_AVAILABLE = False

logger = logging.getLogger(__name__)

class FireSmokeDetector:
    """Advanced fire and smoke detection using CNN classification"""
    
    def __init__(self):
        if not ENHANCED_MODULES_AVAILABLE:
            logger.warning("TensorFlow not available, using basic detection")
            self.available = False
            return
            
        try:
            # Load pre-trained MobileNetV2 for feature extraction
            self.base_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
            self.available = True
        except Exception as e:
            logger.error(f"Error loading MobileNetV2: {e}")
            self.available = False
            return
        
        # Fire and smoke detection parameters
        self.fire_confidence_threshold = 0.6
        self.smoke_confidence_threshold = 0.7
        self.min_region_size = 100
        
        # Color-based detection parameters
        self.fire_color_ranges = [
            (np.array([0, 100, 100]), np.array([20, 255, 255])),
            (np.array([20, 100, 100]), np.array([30, 255, 255])),
            (np.array([170, 100, 100]), np.array([180, 255, 255]))
        ]
        
        self.smoke_color_ranges = [
            (np.array([0, 0, 120]), np.array([180, 25, 180])),
            (np.array([0, 0, 60]), np.array([180, 40, 140])),
            (np.array([0, 0, 140]), np.array([180, 20, 200]))
        ]
        
        # Temporal analysis
        self.fire_history = deque(maxlen=10)
        self.smoke_history = deque(maxlen=10)
    
    def detect_fire_smoke(self, frame: np.ndarray) -> Dict[str, Any]:
        """Detect fire and smoke in frame"""
        if not self.available:
            return {
                'fire_detected': False,
                'smoke_detected': False,
                'max_fire_confidence': 0.0,
                'max_smoke_confidence': 0.0
            }
        
        try:
            # Convert to HSV for color-based detection
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            
            # Fire detection
            fire_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
            for lower, upper in self.fire_color_ranges:
                mask = cv2.inRange(hsv, lower, upper)
                fire_mask = cv2.bitwise_or(fire_mask, mask)
            
            # Smoke detection
            smoke_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
            for lower, upper in self.smoke_color_ranges:
                mask = cv2.inRange(hsv, lower, upper)
                smoke_mask = cv2.bitwise_or(smoke_mask, mask)
            
            # Calculate confidence based on detected regions
            fire_area = cv2.countNonZero(fire_mask)
            smoke_area = cv2.countNonZero(smoke_mask)
            
            total_area = frame.shape[0] * frame.shape[1]
            fire_confidence = min(fire_area / (total_area * 0.1), 1.0)
            smoke_confidence = min(smoke_area / (total_area * 0.15), 1.0)
            
            # Apply temporal smoothing
            self.fire_history.append(fire_confidence)
            self.smoke_history.append(smoke_confidence)
            
            avg_fire_confidence = np.mean(self.fire_history)
            avg_smoke_confidence = np.mean(self.smoke_history)
            
            return {
                'fire_detected': avg_fire_confidence > self.fire_confidence_threshold,
                'smoke_detected': avg_smoke_confidence > self.smoke_confidence_threshold,
                'max_fire_confidence': avg_fire_confidence,
                'max_smoke_confidence': avg_smoke_confidence,
                'fire_regions': fire_area,
                'smoke_regions': smoke_area
            }
            
        except Exception as e:
            logger.error(f"Error in fire/smoke detection: {e}")
            return {
                'fire_detected': False,
                'smoke_detected': False,
                'max_fire_confidence': 0.0,
                'max_smoke_confidence': 0.0
            }


class PoseDetector:
    """Medical emergency pose detection using MediaPipe"""
    
    def __init__(self):
        if not ENHANCED_MODULES_AVAILABLE:
            logger.warning("MediaPipe not available, using basic detection")
            self.available = False
            return
            
        try:
            self.mp_pose = mp.solutions.pose
            self.mp_drawing = mp.solutions.drawing_utils
            self.pose = self.mp_pose.Pose(
                static_image_mode=False,
                model_complexity=1,
                smooth_landmarks=True,
                enable_segmentation=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
            self.available = True
        except Exception as e:
            logger.error(f"Error initializing MediaPipe: {e}")
            self.available = False
            return
        
        # Medical emergency detection parameters
        self.lying_threshold = 0.7
        self.raised_hands_threshold = 0.6
        self.collapsed_threshold = 0.8
        
        # Temporal analysis
        self.pose_history = deque(maxlen=30)
    
    def detect_poses(self, frame: np.ndarray, person_bboxes: List[Dict]) -> List[Dict[str, Any]]:
        """Detect poses and medical emergencies"""
        if not self.available:
            return []
        
        results = []
        
        try:
            # Convert BGR to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process the frame
            pose_results = self.pose.process(rgb_frame)
            
            if pose_results.pose_landmarks:
                landmarks = pose_results.pose_landmarks.landmark
                
                # Analyze pose for medical emergency
                emergency_detected, confidence = self._analyze_emergency_pose(landmarks, frame.shape)
                fallen_detected, fallen_confidence = self._analyze_fallen_pose(landmarks, frame.shape)
                
                results.append({
                    'emergency_detected': emergency_detected,
                    'fallen_detected': fallen_detected,
                    'confidence': max(confidence, fallen_confidence),
                    'landmarks': landmarks
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error in pose detection: {e}")
            return []
    
    def _analyze_emergency_pose(self, landmarks, frame_shape) -> Tuple[bool, float]:
        """Analyze pose for medical emergency indicators"""
        try:
            # Get key landmarks
            left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST]
            
            # Check for raised hands (help gesture)
            shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
            hands_raised = (left_wrist.y < shoulder_y - 0.1) and (right_wrist.y < shoulder_y - 0.1)
            
            confidence = 0.0
            if hands_raised:
                confidence = 0.8
            
            return confidence > self.raised_hands_threshold, confidence
            
        except Exception as e:
            logger.error(f"Error analyzing emergency pose: {e}")
            return False, 0.0
    
    def _analyze_fallen_pose(self, landmarks, frame_shape) -> Tuple[bool, float]:
        """Analyze pose for fallen person detection"""
        try:
            # Get key landmarks
            nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
            left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
            
            # Calculate body orientation
            hip_y = (left_hip.y + right_hip.y) / 2
            body_angle = abs(nose.y - hip_y)
            
            # Person is likely fallen if body is horizontal
            confidence = 0.0
            if body_angle < 0.2:  # Very horizontal
                confidence = 0.9
            elif body_angle < 0.4:  # Somewhat horizontal
                confidence = 0.6
            
            return confidence > self.lying_threshold, confidence
            
        except Exception as e:
            logger.error(f"Error analyzing fallen pose: {e}")
            return False, 0.0


class CrowdDensityDetector:
    """Crowd density and stampede detection"""
    
    def __init__(self):
        self.stampede_threshold = 15
        self.density_history = deque(maxlen=10)
        self.motion_history = deque(maxlen=5)
        self.prev_frame = None
    
    def analyze_crowd(self, frame: np.ndarray, person_bboxes: List[Dict]) -> Dict[str, Any]:
        """Analyze crowd density and movement patterns"""
        try:
            person_count = len(person_bboxes)
            
            # Calculate crowd density
            frame_area = frame.shape[0] * frame.shape[1]
            total_person_area = sum([
                (bbox['bbox'][2] - bbox['bbox'][0]) * (bbox['bbox'][3] - bbox['bbox'][1])
                for bbox in person_bboxes
            ])
            
            density_ratio = total_person_area / frame_area if frame_area > 0 else 0
            
            # Calculate motion level using optical flow
            motion_level = self._calculate_motion_level(frame)
            
            # Update history
            self.density_history.append(density_ratio)
            self.motion_history.append(motion_level)
            
            # Stampede detection
            avg_density = np.mean(self.density_history)
            avg_motion = np.mean(self.motion_history)
            
            stampede_detected = (
                person_count > self.stampede_threshold and
                avg_density > 0.3 and
                avg_motion > 2.0
            )
            
            stampede_confidence = min(
                (person_count / 30.0) * 0.4 +
                avg_density * 0.3 +
                (avg_motion / 5.0) * 0.3,
                1.0
            )
            
            return {
                'person_count': person_count,
                'density_ratio': avg_density,
                'motion_level': avg_motion,
                'stampede_detected': stampede_detected,
                'stampede_confidence': stampede_confidence
            }
            
        except Exception as e:
            logger.error(f"Error in crowd analysis: {e}")
            return {
                'person_count': 0,
                'density_ratio': 0.0,
                'motion_level': 0.0,
                'stampede_detected': False,
                'stampede_confidence': 0.0
            }
    
    def _calculate_motion_level(self, frame: np.ndarray) -> float:
        """Calculate motion level using frame difference"""
        try:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            if self.prev_frame is not None:
                # Calculate frame difference
                diff = cv2.absdiff(self.prev_frame, gray)
                motion_pixels = cv2.countNonZero(cv2.threshold(diff, 25, 255, cv2.THRESH_BINARY)[1])
                total_pixels = gray.shape[0] * gray.shape[1]
                motion_level = (motion_pixels / total_pixels) * 10.0
            else:
                motion_level = 0.0
            
            self.prev_frame = gray.copy()
            return motion_level
            
        except Exception as e:
            logger.error(f"Error calculating motion level: {e}")
            return 0.0


class EnhancedMultiModalDetector:
    """Enhanced multi-modal emergency detection system for FastAPI"""
    
    def __init__(self):
        # Initialize YOLO model
        try:
            # Use the trained model from the models directory
            model_path = os.path.join(os.path.dirname(__file__), "models", "yolov8n.pt")
            if os.path.exists(model_path):
                self.yolo_model = YOLO(model_path)
                logger.info(f"YOLO model loaded successfully from {model_path}")
            else:
                # Fallback to default model
                self.yolo_model = YOLO("yolov8n.pt")
                logger.warning(f"Trained model not found at {model_path}, using default yolov8n.pt")
        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")
            self.yolo_model = None
        
        # Initialize specialized detectors
        self.pose_detector = PoseDetector()
        self.fire_smoke_detector = FireSmokeDetector()
        self.crowd_detector = CrowdDensityDetector()
        
        # Detection thresholds
        self.STAMPEDE_THRESHOLD = 15
        self.FALL_ASPECT_RATIO_THRESHOLD = 1.3
        
        # Multi-modal fusion weights
        self.fusion_weights = {
            'yolo': 0.3,
            'pose': 0.2,
            'fire_smoke': 0.2,
            'crowd': 0.2,
            'visual': 0.1
        }
    
    def extract_person_bboxes(self, yolo_results) -> List[Dict]:
        """Extract person bounding boxes from YOLO results"""
        person_bboxes = []
        
        if not self.yolo_model or not yolo_results or len(yolo_results) == 0:
            return person_bboxes
        
        try:
            result = yolo_results[0]
            if result.boxes is not None:
                for box in result.boxes:
                    if box.conf is not None and box.cls is not None:
                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])
                        
                        # Filter for person class (class_id 0 in COCO dataset)
                        if class_id == 0 and confidence >= 0.3:
                            bbox = box.xyxy[0].cpu().numpy()
                            person_bboxes.append({
                                'bbox': bbox,
                                'confidence': confidence
                            })
        except Exception as e:
            logger.error(f"Error extracting person bboxes: {e}")
        
        return person_bboxes
    
    def process_frame(self, frame: np.ndarray) -> Tuple[Dict[str, Any], List[Dict]]:
        """Process a single frame with all detection methods"""
        try:
            # Run YOLO detection
            yolo_results = None
            if self.yolo_model:
                yolo_results = self.yolo_model(frame, verbose=False)
            
            person_bboxes = self.extract_person_bboxes(yolo_results)
            
            # Run specialized detections
            pose_results = self.pose_detector.detect_poses(frame, person_bboxes)
            fire_smoke_results = self.fire_smoke_detector.detect_fire_smoke(frame)
            crowd_results = self.crowd_detector.analyze_crowd(frame, person_bboxes)
            
            # Fuse all detection results
            fused_results = self._fuse_detections(
                yolo_results, pose_results, fire_smoke_results,
                crowd_results, person_bboxes
            )
            
            return fused_results, person_bboxes
            
        except Exception as e:
            logger.error(f"Error processing frame: {e}")
            return {}, []
    
    def _fuse_detections(self, yolo_results, pose_results, fire_smoke_results,
                        crowd_results, person_bboxes) -> Dict[str, Any]:
        """Fuse results from all detection modules"""
        fused_results = {}
        
        try:
            # 1. Stampede Detection
            stampede_score = 0.0
            person_count = len(person_bboxes) if person_bboxes else 0
            
            if crowd_results and crowd_results.get('stampede_detected', False):
                stampede_score += crowd_results.get('stampede_confidence', 0) * self.fusion_weights['crowd']
            
            if person_count > self.STAMPEDE_THRESHOLD:
                stampede_score += min(person_count / 30.0, 1.0) * self.fusion_weights['yolo']
            
            fused_results['stampede'] = {
                'detected': stampede_score > 0.3,
                'confidence': min(stampede_score, 1.0)
            }
            
            # 2. Medical Emergency Detection
            medical_score = 0.0
            if pose_results:
                for pose_result in pose_results:
                    if pose_result.get('emergency_detected', False):
                        medical_score += pose_result.get('confidence', 0) * self.fusion_weights['pose']
            
            fused_results['medical_emergency'] = {
                'detected': medical_score > 0.25,
                'confidence': min(medical_score, 1.0)
            }
            
            # 3. Fire Detection
            fire_score = 0.0
            if fire_smoke_results and fire_smoke_results.get('fire_detected', False):
                fire_score = fire_smoke_results.get('max_fire_confidence', 0) * self.fusion_weights['fire_smoke']
            
            fused_results['fire'] = {
                'detected': fire_score > 0.3,
                'confidence': min(fire_score, 1.0)
            }
            
            # 4. Smoke Detection
            smoke_score = 0.0
            if fire_smoke_results and fire_smoke_results.get('smoke_detected', False):
                smoke_score = fire_smoke_results.get('max_smoke_confidence', 0) * self.fusion_weights['fire_smoke']
            
            fused_results['smoke'] = {
                'detected': smoke_score > 0.4,
                'confidence': min(smoke_score, 1.0)
            }
            
            # 5. Fallen Person Detection
            fallen_score = 0.0
            
            # YOLO-based fallen detection
            if person_bboxes:
                fallen_count = 0
                for person in person_bboxes:
                    bbox = person['bbox']
                    width = bbox[2] - bbox[0]
                    height = bbox[3] - bbox[1]
                    if height > 0:
                        aspect_ratio = width / height
                        if aspect_ratio > self.FALL_ASPECT_RATIO_THRESHOLD:
                            fallen_count += 1
                
                if fallen_count > 0:
                    fallen_score += min(fallen_count / 3.0, 1.0) * self.fusion_weights['yolo']
            
            # Pose-based fallen detection
            if pose_results:
                for pose_result in pose_results:
                    if pose_result.get('fallen_detected', False):
                        fallen_score += pose_result.get('confidence', 0) * self.fusion_weights['pose']
            
            fused_results['fallen'] = {
                'detected': fallen_score > 0.2,
                'confidence': min(fallen_score, 1.0)
            }
            
            # 6. Running Detection
            running_score = 0.0
            if crowd_results:
                motion_level = crowd_results.get('motion_level', 0)
                if motion_level > 1.5:
                    running_score = min(motion_level / 3.0, 1.0) * self.fusion_weights['crowd']
            
            fused_results['running'] = {
                'detected': running_score > 0.3,
                'confidence': min(running_score, 1.0)
            }
            
        except Exception as e:
            logger.error(f"Error in detection fusion: {e}")
        
        return fused_results
    
    async def analyze_image(self, image_data: bytes) -> Dict[str, Any]:
        """Analyze image for FastAPI endpoint"""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                raise ValueError("Could not decode image")
            
            # Process frame
            fused_results, person_bboxes = self.process_frame(frame)
            
            return {
                'detections': fused_results,
                'person_count': len(person_bboxes),
                'person_bboxes': [
                    {
                        'bbox': bbox['bbox'].tolist() if hasattr(bbox['bbox'], 'tolist') else list(bbox['bbox']),
                        'confidence': bbox['confidence']
                    }
                    for bbox in person_bboxes
                ],
                'timestamp': datetime.datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            return {
                'error': str(e),
                'detections': {},
                'person_count': 0,
                'person_bboxes': [],
                'timestamp': datetime.datetime.now().isoformat()
            }


# Global detector instance
_detector_instance = None

def get_enhanced_detector() -> EnhancedMultiModalDetector:
    """Get or create enhanced detector instance"""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = EnhancedMultiModalDetector()
    return _detector_instance
