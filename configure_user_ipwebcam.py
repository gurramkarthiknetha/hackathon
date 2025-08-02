#!/usr/bin/env python3
"""
Configure the user's IP webcam
"""

import requests
import json

# Configuration
VIDEO_SERVICE_URL = "http://localhost:5001"
USER_WEBCAM_URL = "http://10.100.15.86:8080/video"

def configure_user_webcam():
    """Configure the user's IP webcam"""
    try:
        payload = {
            "webcam_url": USER_WEBCAM_URL,
            "camera_id": "ipwebcam_01",
            "camera_name": "User IP Webcam"
        }
        
        print(f"Configuring user's IP webcam: {USER_WEBCAM_URL}")
        response = requests.post(
            f"{VIDEO_SERVICE_URL}/api/cameras/ipwebcam/configure",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")
        
        if response.status_code == 200 and result.get("success"):
            print("✓ IP Webcam configured successfully!")
            return True
        else:
            print("✗ Failed to configure IP webcam")
            return False
            
    except Exception as e:
        print(f"✗ Error configuring IP webcam: {e}")
        return False

def get_cameras():
    """Get camera list to verify configuration"""
    try:
        response = requests.get(f"{VIDEO_SERVICE_URL}/api/cameras")
        result = response.json()
        
        if result.get("success"):
            cameras = result.get("cameras", [])
            print(f"\nConfigured cameras ({len(cameras)}):")
            for camera in cameras:
                status_icon = "🟢" if camera.get('status') == 'active' else "🔴"
                print(f"  {status_icon} {camera.get('name', 'Unknown')} ({camera.get('id', 'Unknown ID')})")
                print(f"     Source: {camera.get('source', 'Unknown')}")
                print(f"     Status: {camera.get('status', 'Unknown')}")
                print()
            return True
        else:
            print("✗ Failed to get cameras")
            return False
    except Exception as e:
        print(f"✗ Error getting cameras: {e}")
        return False

def main():
    print("=== Configuring User's IP Webcam ===\n")
    
    if configure_user_webcam():
        get_cameras()
        print("🎉 Your IP webcam has been configured!")
        print("\nNext steps:")
        print("1. Open the frontend application")
        print("2. Go to the Live Video Feed section")
        print("3. Click the blue camera icon to configure IP webcam")
        print("4. Use the URL: http://10.100.15.86:8080/")
        print("5. Start the camera to begin streaming")
    else:
        print("❌ Failed to configure IP webcam")

if __name__ == "__main__":
    main()
