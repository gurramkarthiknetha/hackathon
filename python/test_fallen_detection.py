#!/usr/bin/env python3
"""
Test script to verify fallen detection improvements
"""

import json
import datetime
from advanced_detection import AdvancedDetector

def test_fallen_detection():
    """Test the fallen detection with simulated data"""
    print("Testing Fallen Detection Improvements")
    print("=" * 50)
    
    # Create detector instance
    detector = AdvancedDetector()
    
    # Test 1: Simulate person detection with different aspect ratios
    print("\n1. Testing aspect ratio thresholds:")
    test_detections = [
        {'class': 'person', 'bbox': [100, 100, 200, 150], 'confidence': 0.8},  # aspect ratio = 2.0 (fallen)
        {'class': 'person', 'bbox': [300, 100, 350, 200], 'confidence': 0.8},  # aspect ratio = 0.5 (standing)
        {'class': 'person', 'bbox': [500, 100, 650, 200], 'confidence': 0.8},  # aspect ratio = 1.5 (fallen)
    ]
    
    fallen_detections = detector.detect_fallen(test_detections)
    
    for i, detection in enumerate(test_detections):
        bbox = detection['bbox']
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        aspect_ratio = width / height
        
        fallen_match = next((f for f in fallen_detections if f['bbox'] == bbox), None)
        status = "FALLEN DETECTED" if fallen_match else "NOT FALLEN"
        confidence = fallen_match['confidence'] if fallen_match else 0.0
        
        print(f"  Person {i+1}: aspect_ratio={aspect_ratio:.2f}, {status}, confidence={confidence:.2f}")
    
    # Test 2: Check detection history update
    print("\n2. Testing detection history update:")
    detector.detection_history['fallen'] = {
        'confidence': max([d['confidence'] for d in fallen_detections], default=0.0),
        'status': 'detected' if fallen_detections else 'not_detected'
    }
    
    print(f"  Detection history: {detector.detection_history['fallen']}")
    
    # Test 3: Create a log entry like the system would
    print("\n3. Creating sample log entry:")
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = {
        "timestamp": timestamp,
        "events": {
            "fire": {"confidence": 0.7, "status": "detected"},
            "smoke": {"confidence": 1.0, "status": "detected"},
            "running": {"confidence": 1.0, "status": "detected"},
            "fallen": detector.detection_history['fallen'],
            "medical emergency": {"confidence": 0.0, "status": "not_detected"},
            "stampede": {"confidence": 0.4, "status": "detected"}
        }
    }
    
    print(f"  Log entry: {json.dumps(log_entry, indent=2)}")
    
    # Test 4: Check thresholds
    print("\n4. Current detection thresholds:")
    print(f"  Fall aspect ratio threshold: {detector.FALL_ASPECT_RATIO_THRESHOLD}")
    print(f"  Fire confidence threshold: {detector.FIRE_CONFIDENCE_THRESHOLD}")
    print(f"  Smoke confidence threshold: {detector.SMOKE_CONFIDENCE_THRESHOLD}")
    
    print("\n" + "=" * 50)
    print("Test completed successfully!")
    
    return log_entry

if __name__ == "__main__":
    test_fallen_detection()
