#!/usr/bin/env python3
"""
Test script to verify the video service API is working
"""

import requests
import json

def test_video_service_api():
    """Test the video service API endpoints"""
    base_url = "http://localhost:5001"
    
    print("Testing Video Service API")
    print("=" * 40)
    
    # Test 1: Get cameras
    print("\n1. Testing GET /api/cameras")
    try:
        response = requests.get(f"{base_url}/api/cameras")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Configure IP Webcam
    print("\n2. Testing POST /api/cameras/ipwebcam/configure")
    try:
        data = {
            "webcam_url": "http://10.100.15.86:8080/video",
            "camera_id": "ipwebcam_test",
            "camera_name": "Test IP Webcam"
        }
        response = requests.post(
            f"{base_url}/api/cameras/ipwebcam/configure",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Start camera
    print("\n3. Testing POST /api/cameras/ipwebcam_01/start")
    try:
        response = requests.post(f"{base_url}/api/cameras/ipwebcam_01/start")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")

def test_backend_api():
    """Test the backend API endpoints"""
    base_url = "http://localhost:5000"
    
    print("\n" + "=" * 40)
    print("Testing Backend API")
    print("=" * 40)
    
    # Test 1: Get cameras through backend
    print("\n1. Testing GET /api/video/cameras")
    try:
        response = requests.get(f"{base_url}/api/video/cameras")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
    except Exception as e:
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_video_service_api()
    test_backend_api()
