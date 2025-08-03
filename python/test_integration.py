#!/usr/bin/env python3
"""
Integration Testing Script for YOLO Video Streaming Service
Tests all components: cameras, detection, MongoDB storage, and API endpoints
"""

import requests
import time
import json
import sys
from pymongo import MongoClient
import cv2
import os
from dotenv import load_dotenv

load_dotenv()

class IntegrationTester:
    def __init__(self):
        self.video_service_url = "http://localhost:5001"
        self.backend_url = "http://localhost:5000/api"
        self.mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hackathon')
        self.test_results = []
        
    def log_test(self, test_name, success, message=""):
        """Log test result"""
        status = "PASS" if success else "FAIL"
        print(f"[{status}] {test_name}: {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message
        })
        
    def test_video_service_connection(self):
        """Test connection to video streaming service"""
        try:
            response = requests.get(f"{self.video_service_url}/api/cameras", timeout=5)
            success = response.status_code == 200
            message = f"Status: {response.status_code}"
            if success:
                data = response.json()
                message += f", Cameras: {len(data.get('cameras', []))}"
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("Video Service Connection", success, message)
        return success
        
    def test_backend_connection(self):
        """Test connection to backend API"""
        try:
            response = requests.get(f"{self.backend_url}/video/cameras", timeout=5)
            success = response.status_code in [200, 401]  # 401 is OK (auth required)
            message = f"Status: {response.status_code}"
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("Backend API Connection", success, message)
        return success
        
    def test_mongodb_connection(self):
        """Test MongoDB connection"""
        try:
            client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            client.server_info()  # Force connection
            
            # Test database access
            db = client.get_default_database()
            collections = db.list_collection_names()
            
            success = True
            message = f"Connected, Collections: {len(collections)}"
            client.close()
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("MongoDB Connection", success, message)
        return success
        
    def test_camera_detection(self):
        """Test camera availability for detection"""
        try:
            # Test default camera (0)
            cap = cv2.VideoCapture(0)
            if cap.isOpened():
                ret, frame = cap.read()
                cap.release()
                
                if ret and frame is not None:
                    success = True
                    message = f"Camera 0 working, Frame shape: {frame.shape}"
                else:
                    success = False
                    message = "Camera 0 opened but no frame captured"
            else:
                success = False
                message = "Camera 0 not available"
                
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("Camera Detection", success, message)
        return success
        
    def test_yolo_model_loading(self):
        """Test YOLO model loading"""
        try:
            from ultralytics import YOLO
            model = YOLO("yolov8n.pt")
            
            # Test with a dummy image
            import numpy as np
            dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
            results = model(dummy_image)
            
            success = True
            message = f"Model loaded, Results: {len(results)}"
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("YOLO Model Loading", success, message)
        return success
        
    def test_camera_start_stop(self):
        """Test camera start/stop functionality"""
        try:
            # Try to start a camera
            response = requests.post(f"{self.video_service_url}/api/cameras/cam_east_01/start", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                start_success = data.get('success', False)
                
                if start_success:
                    time.sleep(2)  # Wait for camera to initialize
                    
                    # Try to stop the camera
                    stop_response = requests.post(f"{self.video_service_url}/api/cameras/cam_east_01/stop", timeout=5)
                    stop_success = stop_response.status_code == 200
                    
                    success = start_success and stop_success
                    message = f"Start: {start_success}, Stop: {stop_success}"
                else:
                    success = False
                    message = f"Failed to start camera: {data.get('message', 'Unknown error')}"
            else:
                success = False
                message = f"HTTP {response.status_code}: {response.text}"
                
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("Camera Start/Stop", success, message)
        return success
        
    def test_detection_storage(self):
        """Test detection result storage in MongoDB"""
        try:
            client = MongoClient(self.mongo_uri, serverSelectionTimeoutMS=5000)
            db = client.get_default_database()
            collection = db.videodetections
            
            # Count existing documents
            initial_count = collection.count_documents({})
            
            # Start a camera to generate some detections
            requests.post(f"{self.video_service_url}/api/cameras/cam_east_01/start", timeout=5)
            
            # Wait for some detections to be stored
            time.sleep(10)
            
            # Check if new documents were created
            final_count = collection.count_documents({})
            
            # Stop the camera
            requests.post(f"{self.video_service_url}/api/cameras/cam_east_01/stop", timeout=5)
            
            success = final_count > initial_count
            message = f"Initial: {initial_count}, Final: {final_count}, New: {final_count - initial_count}"
            
            client.close()
            
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("Detection Storage", success, message)
        return success
        
    def test_droidcam_configuration(self):
        """Test DroidCam configuration"""
        try:
            config_data = {
                "ip_address": "192.168.1.100",
                "camera_id": "droidcam_test"
            }
            
            response = requests.post(
                f"{self.video_service_url}/api/cameras/droidcam/configure",
                json=config_data,
                timeout=5
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                message = f"Config success: {data.get('success', False)}"
            else:
                message = f"HTTP {response.status_code}: {response.text}"
                
        except Exception as e:
            success = False
            message = str(e)
            
        self.log_test("DroidCam Configuration", success, message)
        return success
        
    def run_all_tests(self):
        """Run all integration tests"""
        print("Starting Integration Tests for YOLO Video Streaming Service")
        print("=" * 60)
        
        tests = [
            self.test_video_service_connection,
            self.test_backend_connection,
            self.test_mongodb_connection,
            self.test_camera_detection,
            self.test_yolo_model_loading,
            self.test_camera_start_stop,
            self.test_detection_storage,
            self.test_droidcam_configuration
        ]
        
        for test in tests:
            test()
            time.sleep(1)  # Brief pause between tests
            
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Tests Passed: {passed}/{total}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 All tests passed! System is ready for use.")
            return True
        else:
            print(f"\n⚠️  {total - passed} test(s) failed. Please check the issues above.")
            return False

def main():
    """Main testing function"""
    tester = IntegrationTester()
    
    print("YOLO Video Streaming Service - Integration Tests")
    print("Make sure the following services are running:")
    print("  1. Video Streaming Service (port 5001)")
    print("  2. Backend API (port 5000)")
    print("  3. MongoDB (default port 27017)")
    print("\nPress Enter to continue or Ctrl+C to cancel...")
    
    try:
        input()
    except KeyboardInterrupt:
        print("\nTests cancelled by user.")
        sys.exit(0)
    
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
