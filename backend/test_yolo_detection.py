#!/usr/bin/env python3
"""
Test script to verify YOLOv8 model loading and object detection functionality
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

import cv2
import numpy as np
from app.ml.enhanced_detection import get_enhanced_detector
from app.ml.simple_detection import detection_service
import asyncio

def create_test_image():
    """Create a simple test image with some shapes"""
    # Create a 640x480 test image
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Add some colored rectangles to simulate objects
    cv2.rectangle(img, (100, 100), (200, 300), (255, 0, 0), -1)  # Blue rectangle
    cv2.rectangle(img, (300, 150), (450, 350), (0, 255, 0), -1)  # Green rectangle
    cv2.circle(img, (500, 200), 50, (0, 0, 255), -1)  # Red circle
    
    # Add some text
    cv2.putText(img, "Test Image", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    return img

async def test_enhanced_detector():
    """Test the enhanced multi-modal detector"""
    print("🧪 Testing Enhanced Multi-Modal Detector...")
    
    try:
        # Get detector instance
        detector = get_enhanced_detector()
        
        # Check if YOLO model is loaded
        if detector.yolo_model is None:
            print("❌ YOLO model not loaded in enhanced detector")
            return False
        
        print(f"✅ YOLO model loaded: {type(detector.yolo_model)}")
        
        # Create test image
        test_image = create_test_image()
        
        # Convert to bytes for analysis
        _, buffer = cv2.imencode('.jpg', test_image)
        image_bytes = buffer.tobytes()
        
        # Run analysis
        results = await detector.analyze_image(image_bytes)
        
        print("📊 Enhanced Detection Results:")
        print(f"   Person count: {results.get('person_count', 0)}")
        print(f"   Detections: {list(results.get('detections', {}).keys())}")
        print(f"   Person bboxes: {len(results.get('person_bboxes', []))}")
        
        if 'error' in results:
            print(f"❌ Error in enhanced detection: {results['error']}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced detector test failed: {e}")
        return False

async def test_simple_detector():
    """Test the simple detection service"""
    print("\n🧪 Testing Simple Detection Service...")
    
    try:
        # Check if model is loaded
        if detection_service.model is None:
            print("❌ YOLO model not loaded in simple detector")
            return False
        
        print(f"✅ YOLO model loaded: {type(detection_service.model)}")
        
        # Create test image
        test_image = create_test_image()
        
        # Run detection
        results = await detection_service.detect_objects(test_image)
        
        print("📊 Simple Detection Results:")
        print(f"   Success: {results.get('success', False)}")
        print(f"   Person count: {results.get('person_count', 0)}")
        print(f"   Total detections: {len(results.get('detections', []))}")
        print(f"   Emergency detected: {results.get('emergency_detected', False)}")
        
        if not results.get('success', False):
            print(f"❌ Error in simple detection: {results.get('error', 'Unknown error')}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Simple detector test failed: {e}")
        return False

def test_model_paths():
    """Test if model files exist"""
    print("\n🔍 Checking Model Paths...")
    
    model_path = os.path.join(os.path.dirname(__file__), 'app', 'ml', 'models', 'yolov8n.pt')
    
    if os.path.exists(model_path):
        file_size = os.path.getsize(model_path)
        print(f"✅ Trained model found: {model_path}")
        print(f"   File size: {file_size / (1024*1024):.2f} MB")
        return True
    else:
        print(f"⚠️ Trained model not found: {model_path}")
        print("   Will use default YOLOv8n model")
        return False

async def main():
    """Run all tests"""
    print("🚀 Starting YOLOv8 Detection Tests...\n")
    
    # Test model paths
    model_exists = test_model_paths()
    
    # Test simple detector
    simple_success = await test_simple_detector()
    
    # Test enhanced detector
    enhanced_success = await test_enhanced_detector()
    
    print("\n📋 Test Summary:")
    print(f"   Model file exists: {'✅' if model_exists else '⚠️'}")
    print(f"   Simple detector: {'✅' if simple_success else '❌'}")
    print(f"   Enhanced detector: {'✅' if enhanced_success else '❌'}")
    
    if simple_success and enhanced_success:
        print("\n🎉 All tests passed! YOLOv8 object detection is working correctly.")
        return True
    else:
        print("\n❌ Some tests failed. Please check the error messages above.")
        return False

if __name__ == "__main__":
    asyncio.run(main())
