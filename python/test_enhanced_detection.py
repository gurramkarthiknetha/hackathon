#!/usr/bin/env python3
"""
Test Enhanced Multi-Modal Detection System
Comprehensive testing for all detection modules
"""

import cv2
import numpy as np
import time
import json
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_basic_imports():
    """Test basic imports and dependencies"""
    print("🧪 Testing Basic Imports...")
    
    try:
        import cv2
        print("✅ OpenCV imported successfully")
    except ImportError as e:
        print(f"❌ OpenCV import failed: {e}")
        return False
    
    try:
        from ultralytics import YOLO
        print("✅ YOLO imported successfully")
    except ImportError as e:
        print(f"❌ YOLO import failed: {e}")
        return False
    
    try:
        import numpy as np
        print("✅ NumPy imported successfully")
    except ImportError as e:
        print(f"❌ NumPy import failed: {e}")
        return False
    
    return True

def test_multimodal_imports():
    """Test multimodal detection module imports"""
    print("\n🧪 Testing Multi-Modal Imports...")
    
    modules_status = {}
    
    # Test pose detection
    try:
        from pose_detection import PoseDetector
        modules_status['pose'] = True
        print("✅ Pose detection module imported")
    except ImportError as e:
        modules_status['pose'] = False
        print(f"⚠️ Pose detection import failed: {e}")
    
    # Test fire/smoke detection
    try:
        from fire_smoke_detection import FireSmokeDetector
        modules_status['fire_smoke'] = True
        print("✅ Fire/Smoke detection module imported")
    except ImportError as e:
        modules_status['fire_smoke'] = False
        print(f"⚠️ Fire/Smoke detection import failed: {e}")
    
    # Test crowd detection
    try:
        from crowd_density_detection import CrowdDensityDetector
        modules_status['crowd'] = True
        print("✅ Crowd density detection module imported")
    except ImportError as e:
        modules_status['crowd'] = False
        print(f"⚠️ Crowd density detection import failed: {e}")
    
    # Test audio detection
    try:
        from audio_detection import AudioDetector
        modules_status['audio'] = True
        print("✅ Audio detection module imported")
    except ImportError as e:
        modules_status['audio'] = False
        print(f"⚠️ Audio detection import failed: {e}")
    
    return modules_status

def test_enhanced_detector():
    """Test the enhanced multimodal detector"""
    print("\n🧪 Testing Enhanced Multi-Modal Detector...")
    
    try:
        from enhanced_multimodal_detection import EnhancedMultiModalDetector
        print("✅ Enhanced detector imported successfully")
        
        # Initialize detector
        detector = EnhancedMultiModalDetector()
        print("✅ Enhanced detector initialized successfully")
        
        return detector
    except Exception as e:
        print(f"❌ Enhanced detector test failed: {e}")
        return None

def test_yolo_model():
    """Test YOLO model loading"""
    print("\n🧪 Testing YOLO Model...")
    
    try:
        from ultralytics import YOLO
        
        # Check if model file exists
        if not os.path.exists("yolov8n.pt"):
            print("⚠️ yolov8n.pt not found, YOLO will download it automatically")
        
        model = YOLO("yolov8n.pt")
        print("✅ YOLO model loaded successfully")
        
        # Test with dummy image
        dummy_image = np.zeros((640, 480, 3), dtype=np.uint8)
        results = model(dummy_image, verbose=False)
        print("✅ YOLO inference test successful")
        
        return True
    except Exception as e:
        print(f"❌ YOLO model test failed: {e}")
        return False

def test_camera_access():
    """Test camera access"""
    print("\n🧪 Testing Camera Access...")
    
    # Try different camera indices
    for camera_id in [0, 1, 2]:
        try:
            cap = cv2.VideoCapture(camera_id)
            if cap.isOpened():
                ret, frame = cap.read()
                if ret:
                    print(f"✅ Camera {camera_id} accessible and working")
                    cap.release()
                    return camera_id
                else:
                    print(f"⚠️ Camera {camera_id} opened but no frame received")
            else:
                print(f"⚠️ Camera {camera_id} not accessible")
            cap.release()
        except Exception as e:
            print(f"❌ Error testing camera {camera_id}: {e}")
    
    print("❌ No working camera found")
    return None

def test_detection_with_sample_image():
    """Test detection with a sample image"""
    print("\n🧪 Testing Detection with Sample Image...")
    
    try:
        # Create a sample image with some people-like shapes
        sample_image = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Add some rectangular shapes that might be detected as people
        cv2.rectangle(sample_image, (100, 200), (150, 400), (255, 255, 255), -1)
        cv2.rectangle(sample_image, (200, 180), (250, 420), (255, 255, 255), -1)
        cv2.rectangle(sample_image, (300, 190), (350, 410), (255, 255, 255), -1)
        
        # Test with enhanced detector
        from enhanced_multimodal_detection import EnhancedMultiModalDetector
        detector = EnhancedMultiModalDetector()
        
        # Process the sample image
        fused_results, person_bboxes = detector.process_frame(sample_image)
        
        print(f"✅ Detection completed successfully")
        print(f"📊 Detected {len(person_bboxes)} person bounding boxes")
        print(f"📋 Detection results:")
        
        for event_type, result in fused_results.items():
            status = "🚨 DETECTED" if result['detected'] else "✅ Clear"
            print(f"  {event_type}: {status} (confidence: {result['confidence']:.3f})")
        
        return True
    except Exception as e:
        print(f"❌ Sample image detection test failed: {e}")
        return False

def test_logging():
    """Test logging functionality"""
    print("\n🧪 Testing Logging Functionality...")
    
    try:
        # Test log file creation
        test_log_entry = {
            "timestamp": "2025-08-02 12:00:00",
            "events": {
                "fire": {"confidence": 0.1, "status": "not_detected"},
                "smoke": {"confidence": 0.2, "status": "not_detected"},
                "stampede": {"confidence": 0.0, "status": "not_detected"}
            }
        }
        
        # Write test log
        with open("test_log.jsonl", "w") as f:
            f.write(json.dumps(test_log_entry) + "\n")
        
        # Read test log
        with open("test_log.jsonl", "r") as f:
            loaded_entry = json.loads(f.readline().strip())
        
        # Verify log content
        if loaded_entry["timestamp"] == test_log_entry["timestamp"]:
            print("✅ Logging functionality working correctly")
            
            # Clean up test file
            os.remove("test_log.jsonl")
            return True
        else:
            print("❌ Log content verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Logging test failed: {e}")
        return False

def run_comprehensive_test():
    """Run comprehensive test suite"""
    print("🚀 Starting Enhanced Multi-Modal Detection System Tests")
    print("=" * 60)
    
    test_results = {}
    
    # Test 1: Basic imports
    test_results['basic_imports'] = test_basic_imports()
    
    # Test 2: Multimodal imports
    test_results['multimodal_imports'] = test_multimodal_imports()
    
    # Test 3: Enhanced detector
    detector = test_enhanced_detector()
    test_results['enhanced_detector'] = detector is not None
    
    # Test 4: YOLO model
    test_results['yolo_model'] = test_yolo_model()
    
    # Test 5: Camera access
    working_camera = test_camera_access()
    test_results['camera_access'] = working_camera is not None
    
    # Test 6: Detection with sample image
    test_results['sample_detection'] = test_detection_with_sample_image()
    
    # Test 7: Logging
    test_results['logging'] = test_logging()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed_tests = 0
    total_tests = len(test_results)
    
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
        if result:
            passed_tests += 1
    
    print(f"\n📈 Overall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests passed! System is ready to use.")
    elif passed_tests >= total_tests * 0.7:
        print("⚠️ Most tests passed. System should work with some limitations.")
    else:
        print("❌ Many tests failed. Please check dependencies and setup.")
    
    # Provide recommendations
    print("\n💡 RECOMMENDATIONS:")
    if not test_results['basic_imports']:
        print("- Install basic dependencies: pip install opencv-python ultralytics numpy")
    
    if not test_results['multimodal_imports']:
        print("- Install multimodal dependencies: pip install -r requirements.txt")
    
    if not test_results['camera_access']:
        print("- Check camera permissions and connections")
        print("- Try running with different camera indices")
    
    if not test_results['yolo_model']:
        print("- Ensure yolov8n.pt is available or will be downloaded")
    
    print("\n🚀 To start the enhanced detection system:")
    print("python enhanced_multimodal_detection.py")
    
    return test_results

def quick_demo():
    """Run a quick demo of the system"""
    print("\n🎬 Running Quick Demo...")
    
    try:
        from enhanced_multimodal_detection import EnhancedMultiModalDetector
        
        detector = EnhancedMultiModalDetector()
        
        # Create a demo image
        demo_image = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Add some demo content
        cv2.putText(demo_image, "ENHANCED MULTIMODAL DETECTION", (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(demo_image, "Demo Mode - Press 'q' to exit", (50, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Process and display
        fused_results, person_bboxes = detector.process_frame(demo_image)
        annotated_frame = detector.draw_detections(demo_image, fused_results, person_bboxes)
        
        cv2.imshow('Enhanced Detection Demo', annotated_frame)
        cv2.waitKey(3000)  # Show for 3 seconds
        cv2.destroyAllWindows()
        
        print("✅ Demo completed successfully")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")

if __name__ == "__main__":
    # Run comprehensive tests
    test_results = run_comprehensive_test()
    
    # Run quick demo if basic tests pass
    if test_results.get('enhanced_detector', False):
        quick_demo()
    
    print("\n🏁 Testing completed!")
