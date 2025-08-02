#!/usr/bin/env python3
"""
Test script for IP Webcam integration
"""

import requests
import json
import time

# Configuration
VIDEO_SERVICE_URL = "http://localhost:5001"
BACKEND_API_URL = "http://localhost:5000/api"
IP_WEBCAM_URL = "http://10.100.15.86:8080/"

def test_video_service_health():
    """Test if video streaming service is running"""
    try:
        response = requests.get(f"{VIDEO_SERVICE_URL}/api/cameras")
        print(f"✓ Video service is running: {response.status_code}")
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print("✗ Video service is not running")
        return False

def test_ip_webcam_accessibility():
    """Test if IP webcam is accessible"""
    try:
        response = requests.get(IP_WEBCAM_URL, timeout=5)
        print(f"✓ IP Webcam is accessible: {response.status_code}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"✗ IP Webcam is not accessible: {e}")
        return False

def test_configure_ip_webcam():
    """Test IP webcam configuration endpoint"""
    try:
        payload = {
            "webcam_url": IP_WEBCAM_URL,
            "camera_id": "ipwebcam_01",
            "camera_name": "Test IP Webcam"
        }
        
        response = requests.post(
            f"{VIDEO_SERVICE_URL}/api/cameras/ipwebcam/configure",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        result = response.json()
        print(f"Configure IP Webcam: {response.status_code}")
        print(f"Response: {result}")
        
        return response.status_code == 200 and result.get("success", False)
    except Exception as e:
        print(f"✗ Failed to configure IP webcam: {e}")
        return False

def test_start_ip_webcam():
    """Test starting IP webcam"""
    try:
        response = requests.post(f"{VIDEO_SERVICE_URL}/api/cameras/ipwebcam_01/start")
        result = response.json()
        print(f"Start IP Webcam: {response.status_code}")
        print(f"Response: {result}")
        
        return response.status_code == 200 and result.get("success", False)
    except Exception as e:
        print(f"✗ Failed to start IP webcam: {e}")
        return False

def test_get_cameras():
    """Test getting camera list"""
    try:
        response = requests.get(f"{VIDEO_SERVICE_URL}/api/cameras")
        result = response.json()
        print(f"Get Cameras: {response.status_code}")
        
        if result.get("success", False):
            cameras = result.get("cameras", [])
            print(f"Found {len(cameras)} cameras:")
            for camera in cameras:
                print(f"  - {camera.get('name', 'Unknown')} ({camera.get('id', 'Unknown ID')}) - Status: {camera.get('status', 'Unknown')}")
            
            # Check if our IP webcam is in the list
            ipwebcam = next((cam for cam in cameras if cam.get('id') == 'ipwebcam_01'), None)
            if ipwebcam:
                print(f"✓ IP Webcam found in camera list")
                return True
            else:
                print(f"✗ IP Webcam not found in camera list")
                return False
        else:
            print(f"✗ Failed to get cameras: {result}")
            return False
    except Exception as e:
        print(f"✗ Failed to get cameras: {e}")
        return False

def test_video_feed():
    """Test video feed endpoint"""
    try:
        response = requests.get(f"{VIDEO_SERVICE_URL}/api/video_feed/ipwebcam_01", timeout=10)
        print(f"Video Feed: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✓ Video feed is working (Content-Type: {response.headers.get('Content-Type', 'Unknown')})")
            return True
        else:
            print(f"✗ Video feed failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Failed to get video feed: {e}")
        return False

def main():
    """Run all tests"""
    print("=== IP Webcam Integration Test ===\n")
    
    tests = [
        ("Video Service Health", test_video_service_health),
        ("IP Webcam Accessibility", test_ip_webcam_accessibility),
        ("Configure IP Webcam", test_configure_ip_webcam),
        ("Get Cameras List", test_get_cameras),
        ("Start IP Webcam", test_start_ip_webcam),
        ("Video Feed", test_video_feed),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"✗ Test failed with exception: {e}")
            results.append((test_name, False))
        
        time.sleep(1)  # Brief pause between tests
    
    print("\n=== Test Results ===")
    passed = 0
    for test_name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nPassed: {passed}/{len(results)} tests")
    
    if passed == len(results):
        print("🎉 All tests passed! IP Webcam integration is working.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
