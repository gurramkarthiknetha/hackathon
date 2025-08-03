#!/usr/bin/env python3
"""
Pose Detection Module using MediaPipe
Detects medical emergency gestures and poses
"""

import cv2
import mediapipe as mp
import numpy as np
import math
from collections import deque

class PoseDetector:
    """Medical emergency pose detection using MediaPipe"""
    
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            smooth_landmarks=True,
            enable_segmentation=False,
            smooth_segmentation=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Medical emergency detection parameters
        self.lying_threshold = 0.7  # Person lying down
        self.raised_hands_threshold = 0.6  # Hands raised for help
        self.collapsed_threshold = 0.8  # Person collapsed
        self.inactivity_threshold = 5.0  # Seconds of inactivity
        
        # Temporal analysis
        self.pose_history = deque(maxlen=30)  # 30 frames history
        self.inactivity_timers = {}  # Track inactivity per person
        
    def calculate_pose_angles(self, landmarks):
        """Calculate key angles for pose analysis"""
        angles = {}
        
        if landmarks is None:
            return angles
        
        # Get key landmarks
        left_shoulder = landmarks[self.mp_pose.PoseLandmark.LEFT_SHOULDER]
        right_shoulder = landmarks[self.mp_pose.PoseLandmark.RIGHT_SHOULDER]
        left_hip = landmarks[self.mp_pose.PoseLandmark.LEFT_HIP]
        right_hip = landmarks[self.mp_pose.PoseLandmark.RIGHT_HIP]
        left_knee = landmarks[self.mp_pose.PoseLandmark.LEFT_KNEE]
        right_knee = landmarks[self.mp_pose.PoseLandmark.RIGHT_KNEE]
        left_ankle = landmarks[self.mp_pose.PoseLandmark.LEFT_ANKLE]
        right_ankle = landmarks[self.mp_pose.PoseLandmark.RIGHT_ANKLE]
        left_wrist = landmarks[self.mp_pose.PoseLandmark.LEFT_WRIST]
        right_wrist = landmarks[self.mp_pose.PoseLandmark.RIGHT_WRIST]
        left_elbow = landmarks[self.mp_pose.PoseLandmark.LEFT_ELBOW]
        right_elbow = landmarks[self.mp_pose.PoseLandmark.RIGHT_ELBOW]
        
        # Calculate body orientation (lying vs standing)
        if left_shoulder and right_shoulder and left_hip and right_hip:
            # Body orientation angle
            shoulder_center = ((left_shoulder.x + right_shoulder.x) / 2,
                             (left_shoulder.y + right_shoulder.y) / 2)
            hip_center = ((left_hip.x + right_hip.x) / 2,
                         (left_hip.y + right_hip.y) / 2)
            
            body_angle = math.atan2(hip_center[1] - shoulder_center[1],
                                   hip_center[0] - shoulder_center[0])
            angles['body_orientation'] = abs(math.degrees(body_angle))
        
        # Calculate if person is lying down
        if left_shoulder and right_shoulder and left_hip and right_hip:
            shoulder_width = abs(left_shoulder.x - right_shoulder.x)
            shoulder_height = abs(left_shoulder.y - right_shoulder.y)
            hip_width = abs(left_hip.x - right_hip.x)
            hip_height = abs(left_hip.y - right_hip.y)
            
            # If body is more horizontal than vertical
            body_ratio = (shoulder_width + hip_width) / (shoulder_height + hip_height)
            angles['lying_ratio'] = body_ratio
        
        # Calculate raised hands
        if left_wrist and right_wrist and left_shoulder and right_shoulder:
            left_hand_raised = left_wrist.y < left_shoulder.y
            right_hand_raised = right_wrist.y < right_shoulder.y
            angles['hands_raised'] = (left_hand_raised, right_hand_raised)
        
        # Calculate collapsed pose (head below shoulders)
        nose = landmarks[self.mp_pose.PoseLandmark.NOSE]
        if nose and left_shoulder and right_shoulder:
            shoulder_y = (left_shoulder.y + right_shoulder.y) / 2
            head_below_shoulders = nose.y > shoulder_y
            angles['collapsed'] = head_below_shoulders
        
        return angles
    
    def detect_medical_emergency(self, landmarks, person_id, timestamp):
        """Detect medical emergency based on pose analysis"""
        if landmarks is None:
            return {"detected": False, "confidence": 0.0, "type": "none"}
        
        angles = self.calculate_pose_angles(landmarks)
        emergency_score = 0.0
        emergency_type = "none"
        
        # 1. Lying down detection
        if 'lying_ratio' in angles:
            lying_ratio = angles['lying_ratio']
            if lying_ratio > self.lying_threshold:
                emergency_score += 0.4
                emergency_type = "lying_down"
        
        # 2. Raised hands detection (help signal)
        if 'hands_raised' in angles:
            left_raised, right_raised = angles['hands_raised']
            if left_raised and right_raised:
                emergency_score += 0.6
                emergency_type = "raised_hands"
            elif left_raised or right_raised:
                emergency_score += 0.3
                emergency_type = "partial_raised_hands"
        
        # 3. Collapsed pose detection
        if 'collapsed' in angles and angles['collapsed']:
            emergency_score += 0.5
            emergency_type = "collapsed"
        
        # 4. Inactivity detection
        if person_id not in self.inactivity_timers:
            self.inactivity_timers[person_id] = timestamp
        
        inactivity_duration = timestamp - self.inactivity_timers[person_id]
        if inactivity_duration > self.inactivity_threshold:
            emergency_score += 0.3
            emergency_type = "inactive"
        
        # 5. Body orientation analysis
        if 'body_orientation' in angles:
            body_angle = angles['body_orientation']
            # If body is horizontal (lying down)
            if 45 < body_angle < 135:
                emergency_score += 0.2
                if emergency_type == "none":
                    emergency_type = "horizontal_pose"
        
        # Update inactivity timer if movement detected
        if emergency_score < 0.3:  # No significant emergency
            self.inactivity_timers[person_id] = timestamp
        
        # Store pose history for temporal analysis
        pose_data = {
            'timestamp': timestamp,
            'emergency_score': emergency_score,
            'emergency_type': emergency_type,
            'angles': angles
        }
        self.pose_history.append(pose_data)
        
        # Temporal consistency check
        if len(self.pose_history) >= 10:
            recent_scores = [p['emergency_score'] for p in list(self.pose_history)[-10:]]
            avg_score = sum(recent_scores) / len(recent_scores)
            
            # Boost score if consistently high
            if avg_score > 0.3:
                emergency_score = min(emergency_score + 0.2, 1.0)
        
        return {
            "detected": emergency_score > 0.4,
            "confidence": min(emergency_score, 1.0),
            "type": emergency_type,
            "angles": angles
        }
    
    def process_frame(self, frame, person_bboxes):
        """Process frame for pose detection on detected persons"""
        results = []
        
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process each detected person
        for i, bbox in enumerate(person_bboxes):
            x1, y1, x2, y2 = bbox
            
            # Extract person region
            person_region = rgb_frame[int(y1):int(y2), int(x1):int(x2)]
            
            if person_region.size == 0:
                continue
            
            # Process pose detection
            pose_results = self.pose.process(person_region)
            
            if pose_results.pose_landmarks:
                # Detect medical emergency
                emergency_result = self.detect_medical_emergency(
                    pose_results.pose_landmarks.landmark, 
                    i, 
                    cv2.getTickCount() / cv2.getTickFrequency()
                )
                
                results.append({
                    'person_id': i,
                    'bbox': bbox,
                    'emergency_detected': emergency_result['detected'],
                    'confidence': emergency_result['confidence'],
                    'emergency_type': emergency_result['type'],
                    'landmarks': pose_results.pose_landmarks
                })
        
        return results
    
    def draw_pose_analysis(self, frame, pose_results):
        """Draw pose analysis on frame"""
        annotated_frame = frame.copy()
        
        for result in pose_results:
            bbox = result['bbox']
            x1, y1, x2, y2 = bbox
            
            # Draw bounding box
            color = (0, 0, 255) if result['emergency_detected'] else (0, 255, 0)
            cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            
            # Draw pose landmarks
            if result['landmarks']:
                # Convert landmarks to image coordinates
                h, w = frame.shape[:2]
                landmarks = []
                for landmark in result['landmarks'].landmark:
                    x = int(landmark.x * (x2 - x1) + x1)
                    y = int(landmark.y * (y2 - y1) + y1)
                    landmarks.append((x, y))
                
                # Draw key landmarks
                for i, (x, y) in enumerate(landmarks):
                    if i in [0, 11, 12, 13, 14, 15, 16]:  # Key points
                        cv2.circle(annotated_frame, (x, y), 3, (255, 0, 0), -1)
            
            # Draw emergency info
            if result['emergency_detected']:
                text = f"EMERGENCY: {result['emergency_type']}"
                cv2.putText(annotated_frame, text, (int(x1), int(y1) - 10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
            
            # Draw confidence
            conf_text = f"Conf: {result['confidence']:.2f}"
            cv2.putText(annotated_frame, conf_text, (int(x1), int(y2) + 20),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        return annotated_frame

# Example usage
if __name__ == "__main__":
    # Test pose detector
    detector = PoseDetector()
    print("✅ Pose Detection Module initialized")
    print("Features:")
    print("- Medical emergency gesture detection")
    print("- Lying down detection")
    print("- Raised hands detection")
    print("- Collapsed pose detection")
    print("- Inactivity monitoring")
    print("- Temporal analysis") 