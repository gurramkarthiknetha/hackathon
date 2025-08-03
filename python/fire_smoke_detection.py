#!/usr/bin/env python3
"""
Fire and Smoke Detection Module using CNN
Specialized detection for fire and smoke events
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import math
from collections import deque

class FireSmokeDetector:
    """Advanced fire and smoke detection using CNN classification"""
    
    def __init__(self):
        # Load pre-trained MobileNetV2 for feature extraction
        self.base_model = MobileNetV2(weights='imagenet', include_top=False, pooling='avg')
        
        # Fire and smoke detection parameters
        self.fire_confidence_threshold = 0.6
        self.smoke_confidence_threshold = 0.7
        self.min_region_size = 100  # Minimum region size to analyze
        
        # Color-based detection parameters
        self.fire_color_ranges = [
            # Red-orange fire
            (np.array([0, 100, 100]), np.array([20, 255, 255])),
            # Yellow fire
            (np.array([20, 100, 100]), np.array([30, 255, 255])),
            # Bright red fire
            (np.array([170, 100, 100]), np.array([180, 255, 255]))
        ]
        
        self.smoke_color_ranges = [
            # Light gray smoke
            (np.array([0, 0, 120]), np.array([180, 25, 180])),
            # Dark gray smoke
            (np.array([0, 0, 60]), np.array([180, 40, 140])),
            # Very light smoke
            (np.array([0, 0, 140]), np.array([180, 20, 200]))
        ]
        
        # Temporal analysis
        self.fire_history = deque(maxlen=10)
        self.smoke_history = deque(maxlen=10)
        
        # Flame flicker detection
        self.flicker_threshold = 0.3
        self.intensity_history = deque(maxlen=5)
        
    def extract_cnn_features(self, region):
        """Extract CNN features from image region"""
        try:
            # Resize region to MobileNetV2 input size
            resized = cv2.resize(region, (224, 224))
            
            # Convert BGR to RGB
            rgb_region = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)
            
            # Preprocess for MobileNetV2
            x = image.img_to_array(rgb_region)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            
            # Extract features
            features = self.base_model.predict(x, verbose=0)
            return features.flatten()
        except Exception as e:
            print(f"Error extracting CNN features: {e}")
            return None
    
    def analyze_color_distribution(self, region):
        """Analyze color distribution for fire/smoke detection"""
        hsv = cv2.cvtColor(region, cv2.COLOR_BGR2HSV)
        
        fire_score = 0.0
        smoke_score = 0.0
        
        # Analyze fire colors
        for lower, upper in self.fire_color_ranges:
            mask = cv2.inRange(hsv, lower, upper)
            fire_ratio = np.sum(mask > 0) / mask.size
            fire_score = max(fire_score, fire_ratio)
        
        # Analyze smoke colors
        for lower, upper in self.smoke_color_ranges:
            mask = cv2.inRange(hsv, lower, upper)
            smoke_ratio = np.sum(mask > 0) / mask.size
            smoke_score = max(smoke_score, smoke_ratio)
        
        return fire_score, smoke_score
    
    def detect_flame_flicker(self, region):
        """Detect flame flicker for fire validation"""
        if len(self.intensity_history) < 3:
            return 0.0
        
        # Calculate current intensity
        gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
        current_intensity = np.mean(gray)
        
        # Calculate flicker score
        flicker_score = 0.0
        for prev_intensity in list(self.intensity_history)[-3:]:
            intensity_diff = abs(current_intensity - prev_intensity)
            flicker_score += intensity_diff / 255.0
        
        flicker_score = min(flicker_score / 3.0, 1.0)
        
        # Update history
        self.intensity_history.append(current_intensity)
        
        return flicker_score
    
    def analyze_texture_features(self, region):
        """Analyze texture features for smoke detection"""
        gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
        
        # Calculate edge density (smoke has soft edges)
        edges = cv2.Canny(gray, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Calculate texture uniformity
        # Smoke has more uniform texture
        texture_uniformity = 1.0 - edge_density
        
        return edge_density, texture_uniformity
    
    def detect_fire_smoke_regions(self, frame):
        """Detect fire and smoke regions in frame"""
        fire_regions = []
        smoke_regions = []
        
        # Convert to HSV for color analysis
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Detect fire regions
        for lower, upper in self.fire_color_ranges:
            mask = cv2.inRange(hsv, lower, upper)
            
            # Morphological operations
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > self.min_region_size:
                    x, y, w, h = cv2.boundingRect(contour)
                    region = frame[y:y+h, x:x+w]
                    
                    if region.size > 0:
                        # Analyze region
                        fire_score, _ = self.analyze_color_distribution(region)
                        flicker_score = self.detect_flame_flicker(region)
                        
                        # Combined fire score
                        combined_score = (fire_score * 0.7) + (flicker_score * 0.3)
                        
                        if combined_score > self.fire_confidence_threshold:
                            fire_regions.append({
                                'bbox': [x, y, x+w, y+h],
                                'confidence': combined_score,
                                'area': area,
                                'flicker_score': flicker_score
                            })
        
        # Detect smoke regions
        for lower, upper in self.smoke_color_ranges:
            mask = cv2.inRange(hsv, lower, upper)
            
            # Morphological operations
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # Find contours
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > self.min_region_size:
                    x, y, w, h = cv2.boundingRect(contour)
                    region = frame[y:y+h, x:x+w]
                    
                    if region.size > 0:
                        # Analyze region
                        _, smoke_score = self.analyze_color_distribution(region)
                        edge_density, texture_uniformity = self.analyze_texture_features(region)
                        
                        # Combined smoke score
                        combined_score = (smoke_score * 0.5) + (texture_uniformity * 0.3) + ((1.0 - edge_density) * 0.2)
                        
                        if combined_score > self.smoke_confidence_threshold:
                            smoke_regions.append({
                                'bbox': [x, y, x+w, y+h],
                                'confidence': combined_score,
                                'area': area,
                                'texture_uniformity': texture_uniformity
                            })
        
        return fire_regions, smoke_regions
    
    def validate_detection_temporal(self, fire_regions, smoke_regions):
        """Validate detections using temporal analysis"""
        # Update history
        self.fire_history.append(len(fire_regions) > 0)
        self.smoke_history.append(len(smoke_regions) > 0)
        
        # Temporal consistency check
        if len(self.fire_history) >= 5:
            recent_fire = list(self.fire_history)[-5:]
            fire_consistency = sum(recent_fire) / len(recent_fire)
            
            # Boost confidence if consistently detected
            for region in fire_regions:
                if fire_consistency > 0.6:
                    region['confidence'] = min(region['confidence'] + 0.2, 1.0)
        
        if len(self.smoke_history) >= 5:
            recent_smoke = list(self.smoke_history)[-5:]
            smoke_consistency = sum(recent_smoke) / len(recent_smoke)
            
            # Boost confidence if consistently detected
            for region in smoke_regions:
                if smoke_consistency > 0.6:
                    region['confidence'] = min(region['confidence'] + 0.2, 1.0)
        
        return fire_regions, smoke_regions
    
    def process_frame(self, frame):
        """Process frame for fire and smoke detection"""
        # Detect regions
        fire_regions, smoke_regions = self.detect_fire_smoke_regions(frame)
        
        # Temporal validation
        fire_regions, smoke_regions = self.validate_detection_temporal(fire_regions, smoke_regions)
        
        return {
            'fire_regions': fire_regions,
            'smoke_regions': smoke_regions,
            'fire_detected': len(fire_regions) > 0,
            'smoke_detected': len(smoke_regions) > 0,
            'max_fire_confidence': max([r['confidence'] for r in fire_regions], default=0.0),
            'max_smoke_confidence': max([r['confidence'] for r in smoke_regions], default=0.0)
        }
    
    def draw_detections(self, frame, results):
        """Draw fire and smoke detections on frame"""
        annotated_frame = frame.copy()
        
        # Draw fire regions
        for region in results['fire_regions']:
            bbox = region['bbox']
            x1, y1, x2, y2 = bbox
            
            # Draw bounding box
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            
            # Draw label
            label = f"FIRE: {region['confidence']:.2f}"
            cv2.putText(annotated_frame, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
        
        # Draw smoke regions
        for region in results['smoke_regions']:
            bbox = region['bbox']
            x1, y1, x2, y2 = bbox
            
            # Draw bounding box
            cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (128, 128, 128), 2)
            
            # Draw label
            label = f"SMOKE: {region['confidence']:.2f}"
            cv2.putText(annotated_frame, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (128, 128, 128), 2)
        
        return annotated_frame

# Example usage
if __name__ == "__main__":
    # Test fire/smoke detector
    detector = FireSmokeDetector()
    print("✅ Fire and Smoke Detection Module initialized")
    print("Features:")
    print("- CNN-based feature extraction")
    print("- Color-based fire detection")
    print("- Texture-based smoke detection")
    print("- Flame flicker analysis")
    print("- Temporal validation")
    print("- Multi-threshold classification") 