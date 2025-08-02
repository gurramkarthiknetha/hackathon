#!/usr/bin/env python3
"""
Test script for IP Webcam integration with local test
"""

import requests
import json
import time

# Configuration
VIDEO_SERVICE_URL = "http://localhost:5001"
# Use a test URL that should work locally
TEST_WEBCAM_URL = "http://localhost:8080/"

def test_configure_ip_webcam():
    """Test IP webcam configuration endpoint"""
    try:
        payload = {
            "webcam_url": TEST_WEBCAM_URL,
            "camera_id": "ipwebcam_01",
            "camera_name": "Test IP Webcam"
        }
        
        print(f"Configuring IP webcam with URL: {TEST_WEBCAM_URL}")
        response = requests.post(
            f"{VIDEO_SERVICE_URL}/api/cameras/ipwebcam/configure",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"JSON Response: {result}")
                return result.get("success", False)
            except json.JSONDecodeError:
                print("Response is not valid JSON")
                return False
        else:
            print(f"HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"Exception occurred: {e}")
        return False

def test_get_cameras():
    """Test getting camera list"""
    try:
        response = requests.get(f"{VIDEO_SERVICE_URL}/api/cameras")
        result = response.json()
        print(f"Get Cameras Status: {response.status_code}")
        
        if result.get("success", False):
            cameras = result.get("cameras", [])
            print(f"Found {len(cameras)} cameras:")
            for camera in cameras:
                print(f"  - {camera.get('name', 'Unknown')} ({camera.get('id', 'Unknown ID')}) - Status: {camera.get('status', 'Unknown')}")
                print(f"    Source: {camera.get('source', 'Unknown')}")
            
            # Check if our IP webcam is in the list
            ipwebcam = next((cam for cam in cameras if cam.get('id') == 'ipwebcam_01'), None)
            if ipwebcam:
                print(f"✓ IP Webcam found in camera list")
                print(f"  Source: {ipwebcam.get('source', 'Unknown')}")
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

def test_endpoints_exist():
    """Test if our new endpoints exist"""
    endpoints_to_test = [
        "/api/cameras/ipwebcam/configure",
    ]
    
    for endpoint in endpoints_to_test:
        try:
            # Test with GET to see if endpoint exists (should return 405 Method Not Allowed)
            response = requests.get(f"{VIDEO_SERVICE_URL}{endpoint}")
            print(f"Endpoint {endpoint}: Status {response.status_code}")
            
            if response.status_code == 405:  # Method not allowed means endpoint exists
                print(f"✓ Endpoint {endpoint} exists")
            elif response.status_code == 404:
                print(f"✗ Endpoint {endpoint} does not exist")
            else:
                print(f"? Endpoint {endpoint} returned unexpected status: {response.status_code}")
        except Exception as e:
            print(f"✗ Error testing endpoint {endpoint}: {e}")

def main():
    """Run tests"""
    print("=== IP Webcam Integration Test (Local) ===\n")
    
    print("--- Testing Endpoints ---")
    test_endpoints_exist()
    
    print("\n--- Testing Configuration ---")
    config_result = test_configure_ip_webcam()
    
    print("\n--- Testing Camera List ---")
    list_result = test_get_cameras()
    
    print(f"\n=== Results ===")
    print(f"Configuration: {'✓ PASS' if config_result else '✗ FAIL'}")
    print(f"Camera List: {'✓ PASS' if list_result else '✗ FAIL'}")

if __name__ == "__main__":
    main()
