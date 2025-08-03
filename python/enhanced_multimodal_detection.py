#!/usr/bin/env python3
"""
Enhanced Multi-Modal Detection System
Combines YOLO + Pose + Fire/Smoke + Crowd + Audio detection with your existing system
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
import sys

# Import specialized detection modules
try:
    from pose_detection import PoseDetector
    from fire_smoke_detection import FireSmokeDetector
    from crowd_density_detection import CrowdDensityDetector
    from audio_detection import AudioDetector
    MULTIMODAL_AVAILABLE = True
    print("✅ All multimodal detection modules loaded successfully")
except ImportError as e:
    print(f"⚠️ Some multimodal modules not available: {e}")
    print("📝 Running in basic mode with YOLO detection only")
    MULTIMODAL_AVAILABLE = False

# Import existing detection config
from detection_config import TARGET_CLASSES, CLASS_MAPPING

class EnhancedMultiModalDetector:
    """Enhanced multi-modal emergency detection system"""
    
    def __init__(self):
        # Initialize YOLO model
        self.yolo_model = YOLO("yolov8n.pt")

        # Initialize specialized detectors if available
        self.multimodal_available = MULTIMODAL_AVAILABLE
        if self.multimodal_available:
            try:
                self.pose_detector = PoseDetector()
                self.fire_smoke_detector = FireSmokeDetector()
                self.crowd_detector = CrowdDensityDetector()
                self.audio_detector = AudioDetector()
                print("✅ All specialized detectors initialized")
            except Exception as e:
                print(f"⚠️ Error initializing specialized detectors: {e}")
                self.multimodal_available = False
                self.pose_detector = None
                self.fire_smoke_detector = None
                self.crowd_detector = None
                self.audio_detector = None
        else:
            print("⚠️ Some multimodal modules not available")
            print("📝 Running in basic mode with YOLO detection only")
            self.pose_detector = None
            self.fire_smoke_detector = None
            self.crowd_detector = None
            self.audio_detector = None
        
        # System parameters
        self.running = False
        self.log_interval = 1.0  # Log every second
        
        # Detection history
        self.detection_history = {
            "stampede": {"confidence": 0.0, "status": "not_detected"},
            "running": {"confidence": 0.0, "status": "not_detected"},
            "fallen": {"confidence": 0.0, "status": "not_detected"},
            "fire": {"confidence": 0.0, "status": "not_detected"},
            "smoke": {"confidence": 0.0, "status": "not_detected"},
            "medical_emergency": {"confidence": 0.0, "status": "not_detected"},
            "crowd_density": {"confidence": 0.0, "status": "not_detected"},
            "audio_distress": {"confidence": 0.0, "status": "not_detected"}
        }
        
        # Multi-modal fusion weights
        self.fusion_weights = {
            'yolo': 0.3,
            'pose': 0.2,
            'fire_smoke': 0.2,
            'crowd': 0.2,
            'audio': 0.1
        }
        
        # Temporal analysis
        self.temporal_window = deque(maxlen=10)
        
        # Tracking variables (from your existing system)
        self.person_tracks = {}
        self.frame_count = 0
        self.last_frame_time = time.time()
        
        # Detection thresholds
        self.STAMPEDE_THRESHOLD = 15  # Reduced for better sensitivity
        self.RUNNING_SPEED_THRESHOLD = 1.2  # m/s
        self.FALL_ASPECT_RATIO_THRESHOLD = 1.3
        self.FIRE_CONFIDENCE_THRESHOLD = 0.4
        self.SMOKE_CONFIDENCE_THRESHOLD = 0.5
        
        # Optical flow for motion detection
        self.prev_frame = None
        self.prev_points = None
        
    def extract_person_bboxes(self, yolo_results):
        """Extract person bounding boxes from YOLO results"""
        person_bboxes = []
        
        if yolo_results and len(yolo_results) > 0:
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
        
        return person_bboxes
    
    def basic_yolo_detection(self, frame, person_bboxes):
        """Basic YOLO-based detection (fallback when multimodal not available)"""
        results = {
            'stampede': {'detected': False, 'confidence': 0.0},
            'running': {'detected': False, 'confidence': 0.0},
            'fallen': {'detected': False, 'confidence': 0.0},
            'fire': {'detected': False, 'confidence': 0.0},
            'smoke': {'detected': False, 'confidence': 0.0},
            'medical_emergency': {'detected': False, 'confidence': 0.0}
        }
        
        person_count = len(person_bboxes)
        
        # Stampede detection based on person count
        if person_count > self.STAMPEDE_THRESHOLD:
            results['stampede'] = {
                'detected': True,
                'confidence': min(person_count / 30.0, 1.0)
            }
        
        # Fallen person detection based on aspect ratio
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
            results['fallen'] = {
                'detected': True,
                'confidence': min(fallen_count / 3.0, 1.0)
            }
        
        return results
    
    def fuse_detections(self, yolo_results, pose_results=None, fire_smoke_results=None,
                       crowd_results=None, audio_results=None, person_bboxes=None):
        """Fuse results from all detection modules"""
        if not self.multimodal_available:
            return self.basic_yolo_detection(None, person_bboxes or [])
        
        fused_results = {}
        
        # 1. Stampede Detection (Crowd + Audio + YOLO)
        stampede_score = 0.0
        person_count = len(person_bboxes) if person_bboxes else 0
        
        if crowd_results and crowd_results.get('stampede_detected', False):
            stampede_score += crowd_results.get('stampede_confidence', 0) * self.fusion_weights['crowd']
        
        if audio_results and audio_results.get('panic', {}).get('detected', False):
            stampede_score += audio_results['panic']['confidence'] * self.fusion_weights['audio']
        
        # Add YOLO person count contribution
        if person_count > self.STAMPEDE_THRESHOLD:
            stampede_score += min(person_count / 30.0, 1.0) * self.fusion_weights['yolo']
        
        fused_results['stampede'] = {
            'detected': stampede_score > 0.3,
            'confidence': min(stampede_score, 1.0)
        }
        
        # 2. Medical Emergency Detection (Pose + Audio)
        medical_score = 0.0
        if pose_results:
            for pose_result in pose_results:
                if pose_result.get('emergency_detected', False):
                    medical_score += pose_result.get('confidence', 0) * self.fusion_weights['pose']
        
        if audio_results and audio_results.get('distress', {}).get('detected', False):
            medical_score += audio_results['distress']['confidence'] * self.fusion_weights['audio']
        
        fused_results['medical_emergency'] = {
            'detected': medical_score > 0.25,
            'confidence': min(medical_score, 1.0)
        }
        
        # 3. Fire Detection (Fire/Smoke + Audio)
        fire_score = 0.0
        if fire_smoke_results and fire_smoke_results.get('fire_detected', False):
            fire_score += fire_smoke_results.get('max_fire_confidence', 0) * self.fusion_weights['fire_smoke']
        
        if audio_results and audio_results.get('fire', {}).get('detected', False):
            fire_score += audio_results['fire']['confidence'] * self.fusion_weights['audio']
        
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
        
        # 5. Fallen Person Detection (YOLO + Pose)
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
        
        # 6. Running Detection (Motion + Pose)
        running_score = 0.0
        if crowd_results:
            motion_level = crowd_results.get('motion_level', 0)
            if motion_level > 1.5:
                running_score += min(motion_level / 3.0, 1.0) * self.fusion_weights['crowd']
        
        fused_results['running'] = {
            'detected': running_score > 0.3,
            'confidence': min(running_score, 1.0)
        }
        
        return fused_results

    def process_frame(self, frame):
        """Process a single frame with all detection methods"""
        self.frame_count += 1
        current_time = time.time()

        # Run YOLO detection
        yolo_results = self.yolo_model(frame, verbose=False)
        person_bboxes = self.extract_person_bboxes(yolo_results)

        # Initialize results
        pose_results = None
        fire_smoke_results = None
        crowd_results = None
        audio_results = None

        if self.multimodal_available:
            try:
                # Run pose detection
                if self.pose_detector:
                    pose_results = self.pose_detector.detect_poses(frame, person_bboxes)

                # Run fire/smoke detection
                if self.fire_smoke_detector:
                    fire_smoke_results = self.fire_smoke_detector.detect_fire_smoke(frame)

                # Run crowd density detection
                if self.crowd_detector:
                    crowd_results = self.crowd_detector.analyze_crowd(frame, person_bboxes)

                # Get audio results (if audio stream is active)
                if self.audio_detector and hasattr(self.audio_detector, 'get_latest_results'):
                    audio_results = self.audio_detector.get_latest_results()

            except Exception as e:
                print(f"⚠️ Error in multimodal detection: {e}")

        # Fuse all detection results
        fused_results = self.fuse_detections(
            yolo_results, pose_results, fire_smoke_results,
            crowd_results, audio_results, person_bboxes
        )

        # Update detection history
        for event_type, result in fused_results.items():
            self.detection_history[event_type] = {
                "confidence": result['confidence'],
                "status": "detected" if result['detected'] else "not_detected"
            }

        # Add temporal analysis
        self.temporal_window.append(fused_results)

        return fused_results, person_bboxes

    def draw_detections(self, frame, fused_results, person_bboxes):
        """Draw detection results on frame"""
        # Draw person bounding boxes
        for person in person_bboxes:
            bbox = person['bbox']
            x1, y1, x2, y2 = map(int, bbox)
            confidence = person['confidence']

            # Color based on detection status
            color = (0, 255, 0)  # Green by default

            # Check if person is fallen
            width = x2 - x1
            height = y2 - y1
            if height > 0:
                aspect_ratio = width / height
                if aspect_ratio > self.FALL_ASPECT_RATIO_THRESHOLD:
                    color = (0, 0, 255)  # Red for fallen person

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, f'Person {confidence:.2f}', (x1, y1-10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Draw detection status
        y_offset = 30
        for event_type, result in fused_results.items():
            if result['detected']:
                color = (0, 0, 255)  # Red for detected
                status = f"🚨 {event_type.upper()}: {result['confidence']:.2f}"
            else:
                color = (0, 255, 0)  # Green for not detected
                status = f"✅ {event_type}: {result['confidence']:.2f}"

            cv2.putText(frame, status, (10, y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            y_offset += 25

        # Add person count
        person_count = len(person_bboxes)
        cv2.putText(frame, f"People: {person_count}", (10, frame.shape[0] - 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        return frame

    def log_detections(self, fused_results):
        """Log detection results to console and file"""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        log_entry = {
            "timestamp": timestamp,
            "events": {}
        }

        for event_type, result in fused_results.items():
            log_entry["events"][event_type] = {
                "confidence": round(result['confidence'], 3),
                "status": "detected" if result['detected'] else "not_detected"
            }

        # Print to console
        print(json.dumps(log_entry, indent=2))

        # Save to file
        try:
            with open("enhanced_multimodal_activity_log.jsonl", "a") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            print(f"Error writing to log file: {e}")

    def start_detection(self, camera_source=0):
        """Start the enhanced multimodal detection system"""
        print("🚀 Starting Enhanced Multi-Modal Detection System...")

        # Start audio detection if available
        if self.multimodal_available and self.audio_detector and hasattr(self.audio_detector, 'start_audio_stream'):
            try:
                self.audio_detector.start_audio_stream()
                print("🎤 Audio detection started")
            except Exception as e:
                print(f"⚠️ Could not start audio detection: {e}")

        # Initialize camera
        cap = cv2.VideoCapture(camera_source)
        if not cap.isOpened():
            print(f"❌ Error: Could not open camera {camera_source}")
            return

        print(f"📹 Camera {camera_source} opened successfully")
        print("📝 Press 'q' to quit")

        self.running = True
        last_log_time = time.time()

        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    print("❌ Error: Could not read frame")
                    break

                # Process frame
                fused_results, person_bboxes = self.process_frame(frame)

                # Draw detections
                annotated_frame = self.draw_detections(frame, fused_results, person_bboxes)

                # Log detections every second
                current_time = time.time()
                if current_time - last_log_time >= self.log_interval:
                    self.log_detections(fused_results)
                    last_log_time = current_time

                # Display frame
                cv2.imshow('Enhanced Multi-Modal Detection', annotated_frame)

                # Check for quit
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

        except KeyboardInterrupt:
            print("\n🛑 Detection stopped by user")

        finally:
            # Cleanup
            self.running = False
            cap.release()
            cv2.destroyAllWindows()

            # Stop audio detection
            if self.multimodal_available and self.audio_detector and hasattr(self.audio_detector, 'stop_audio_stream'):
                try:
                    self.audio_detector.stop_audio_stream()
                    print("🎤 Audio detection stopped")
                except Exception as e:
                    print(f"⚠️ Error stopping audio detection: {e}")

            print("✅ Enhanced Multi-Modal Detection System stopped")

def main():
    """Main function to run the enhanced detection system"""
    detector = EnhancedMultiModalDetector()

    # Start detection with default camera (0)
    # You can change this to use different camera sources
    detector.start_detection(camera_source=0)

if __name__ == "__main__":
    main()
