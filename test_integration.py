#!/usr/bin/env python3
"""
Integration Test Script
Tests the connection between Python AI service and Node.js backend
"""

import requests
import json
import time
import sys
from datetime import datetime

class IntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:5000"
        self.python_service_url = "http://localhost:5001"
        
    def test_backend_connection(self):
        """Test if backend server is running"""
        try:
            response = requests.get(f"{self.backend_url}/api/auth/check", timeout=5)
            print("✅ Backend server is running")
            return True
        except requests.exceptions.RequestException:
            try:
                # Try a simple health check
                response = requests.get(f"{self.backend_url}", timeout=5)
                print("✅ Backend server is running")
                return True
            except requests.exceptions.RequestException:
                print("❌ Backend server is not responding")
                return False
    
    def test_python_service_connection(self):
        """Test if Python AI service is running"""
        try:
            response = requests.get(f"{self.python_service_url}/api/cameras", timeout=5)
            if response.status_code == 200:
                print("✅ Python AI service is running")
                cameras = response.json()
                print(f"📹 Available cameras: {len(cameras.get('data', []))}")
                return True
            else:
                print("❌ Python AI service returned error")
                return False
        except requests.exceptions.RequestException:
            print("❌ Python AI service is not responding")
            return False
    
    def test_detection_alert_endpoint(self):
        """Test the detection alert integration"""
        try:
            # Sample detection alert data
            alert_data = {
                "timestamp": datetime.now().isoformat(),
                "camera_id": "test_camera_01",
                "events": {
                    "fire": {"confidence": 0.7, "status": "detected"},
                    "smoke": {"confidence": 0.0, "status": "not_detected"},
                    "running": {"confidence": 0.0, "status": "not_detected"},
                    "fallen": {"confidence": 0.0, "status": "not_detected"},
                    "medical emergency": {"confidence": 0.0, "status": "not_detected"},
                    "stampede": {"confidence": 0.0, "status": "not_detected"}
                },
                "camera_info": {
                    "id": "test_camera_01",
                    "name": "Test Camera",
                    "zone": "test_zone"
                }
            }
            
            response = requests.post(
                f"{self.backend_url}/api/detection-alert",
                json=alert_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Detection alert endpoint working")
                return True
            else:
                print(f"❌ Detection alert endpoint failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Detection alert test failed: {e}")
            return False
    
    def test_video_detection_storage(self):
        """Test video detection storage endpoint"""
        try:
            # Sample detection data
            detection_data = {
                "camera_id": "test_camera_01",
                "timestamp": time.time(),
                "detections": {
                    "fire": {"detected": True, "confidence": 0.8},
                    "smoke": {"detected": False, "confidence": 0.1}
                },
                "person_count": 3,
                "motion_level": 2.5
            }
            
            response = requests.post(
                f"{self.backend_url}/api/video-detection/store",
                json=detection_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                print("✅ Video detection storage working")
                return True
            else:
                print(f"❌ Video detection storage failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Video detection storage test failed: {e}")
            return False
    
    def test_camera_management(self):
        """Test camera management endpoints"""
        try:
            # Get cameras
            response = requests.get(f"{self.python_service_url}/api/cameras", timeout=5)
            if response.status_code == 200:
                cameras = response.json()
                print("✅ Camera management API working")
                
                # Try to start a camera if available
                if cameras.get('data') and len(cameras['data']) > 0:
                    camera_id = cameras['data'][0]['id']
                    start_response = requests.post(
                        f"{self.python_service_url}/api/cameras/{camera_id}/start",
                        timeout=10
                    )
                    if start_response.status_code == 200:
                        print(f"✅ Camera {camera_id} start command sent")
                        
                        # Stop the camera
                        time.sleep(2)
                        stop_response = requests.post(
                            f"{self.python_service_url}/api/cameras/{camera_id}/stop",
                            timeout=10
                        )
                        if stop_response.status_code == 200:
                            print(f"✅ Camera {camera_id} stop command sent")
                    else:
                        print(f"⚠️  Camera start failed (may be expected if no camera available)")
                
                return True
            else:
                print("❌ Camera management API failed")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Camera management test failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all integration tests"""
        print("🧪 INTEGRATION TEST SUITE")
        print("="*40)
        
        tests = [
            ("Backend Connection", self.test_backend_connection),
            ("Python AI Service", self.test_python_service_connection),
            ("Detection Alert Integration", self.test_detection_alert_endpoint),
            ("Video Detection Storage", self.test_video_detection_storage),
            ("Camera Management", self.test_camera_management)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n🔍 Testing {test_name}...")
            try:
                if test_func():
                    passed += 1
                else:
                    print(f"❌ {test_name} failed")
            except Exception as e:
                print(f"❌ {test_name} error: {e}")
        
        print("\n" + "="*40)
        print(f"📊 TEST RESULTS: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All integration tests passed!")
            print("\n✅ Your Python AI model is successfully integrated with your web application!")
            print("\n🚀 Next steps:")
            print("1. Start the integrated system: python start_integrated_system.py")
            print("2. Open http://localhost:5173 in your browser")
            print("3. Navigate to Live Video Feed to test AI detection")
        else:
            print("⚠️  Some tests failed. Check the services are running:")
            print("- Backend: npm run dev (in hack/backend/)")
            print("- Python AI: python start_video_service.py (in python/)")
        
        return passed == total

def main():
    """Main entry point"""
    tester = IntegrationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
