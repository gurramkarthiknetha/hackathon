#!/usr/bin/env python3
"""
Integration test for the complete alert system.
Tests the flow from AI detection to frontend alert display.
"""

import requests
import json
import time
import sys
from datetime import datetime

def test_detection_alert_integration():
    """Test the complete detection alert flow"""
    
    print("🧪 Integration Test: Detection Alert System")
    print("=" * 60)
    
    # Test data matching your example
    test_data = {
        "timestamp": "2025-08-02 00:06:29",
        "events": {
            "fire": {
                "confidence": 0.7,
                "status": "detected"
            },
            "smoke": {
                "confidence": 1.0,
                "status": "detected"
            },
            "running": {
                "confidence": 1.0,
                "status": "detected"
            },
            "fallen": {
                "confidence": 0.9,
                "status": "detected"
            },
            "medical emergency": {
                "confidence": 0.0,
                "status": "not_detected"
            },
            "stampede": {
                "confidence": 0.4,
                "status": "detected"
            }
        },
        "camera_id": "integration-test-camera",
        "camera_info": {
            "location": "Integration Test Location",
            "zone": "Test Zone"
        }
    }
    
    print("📊 Test Data:")
    print(json.dumps(test_data, indent=2))
    
    print("\n🎯 Expected Alerts (confidence > 50%):")
    for event, data in test_data["events"].items():
        confidence = data["confidence"]
        status = data["status"]
        if confidence > 0.5 and status == "detected":
            print(f"  ✅ {event}: {confidence*100:.0f}% confidence")
        else:
            print(f"  ❌ {event}: {confidence*100:.0f}% confidence (below threshold or not detected)")
    
    print("\n🚀 Sending alert to backend...")
    
    try:
        response = requests.post(
            "http://localhost:5000/api/detection-alert",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Backend received alert successfully!")
            print(f"Response: {response.json()}")
            
            print("\n📱 Expected Frontend Behavior:")
            print("  1. Emergency modal should appear")
            print("  2. Security alarm should play continuously")
            print("  3. Browser notification should appear (if permitted)")
            print("  4. Toast notification should appear")
            print("  5. Email notifications should be sent")
            
            print("\n🔊 Audio Alert:")
            print("  - File: /audio/security-alarm-63578.mp3")
            print("  - Behavior: Continuous loop until dismissed")
            print("  - Controls: Mute/unmute button available")
            
            print("\n👥 Target Recipients:")
            print("  - All logged-in responders")
            print("  - All logged-in operators") 
            print("  - All logged-in admins")
            
            print("\n✅ Integration test completed successfully!")
            print("Check your frontend application for the emergency alert modal.")
            
            return True
            
        else:
            print(f"❌ Backend error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("Make sure the backend server is running on http://localhost:5000")
        return False
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False

def test_multiple_scenarios():
    """Test multiple alert scenarios"""
    
    scenarios = [
        {
            "name": "High Priority Fire Alert",
            "data": {
                "timestamp": datetime.now().isoformat(),
                "camera_id": "fire-test-camera",
                "events": {
                    "fire": {"confidence": 0.95, "status": "detected"},
                    "smoke": {"confidence": 0.85, "status": "detected"}
                },
                "camera_info": {"location": "Kitchen Area", "zone": "Building A"}
            }
        },
        {
            "name": "Medical Emergency",
            "data": {
                "timestamp": datetime.now().isoformat(),
                "camera_id": "medical-test-camera", 
                "events": {
                    "medical emergency": {"confidence": 0.88, "status": "detected"},
                    "fallen": {"confidence": 0.75, "status": "detected"}
                },
                "camera_info": {"location": "Lobby", "zone": "Building B"}
            }
        },
        {
            "name": "Crowd Control Situation",
            "data": {
                "timestamp": datetime.now().isoformat(),
                "camera_id": "crowd-test-camera",
                "events": {
                    "stampede": {"confidence": 0.72, "status": "detected"},
                    "running": {"confidence": 0.68, "status": "detected"}
                },
                "camera_info": {"location": "Main Entrance", "zone": "Entrance Hall"}
            }
        }
    ]
    
    print("\n🎭 Testing Multiple Scenarios")
    print("=" * 40)
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n📋 Scenario {i}: {scenario['name']}")
        
        try:
            response = requests.post(
                "http://localhost:5000/api/detection-alert",
                json=scenario['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"  ✅ Alert sent successfully")
            else:
                print(f"  ❌ Failed: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
        
        # Wait between scenarios to avoid overwhelming the system
        if i < len(scenarios):
            print("  ⏳ Waiting 5 seconds before next scenario...")
            time.sleep(5)

def main():
    """Main test function"""
    print("🚨 Emergency Alert System - Integration Test")
    print("=" * 60)
    print("This test will send detection alerts to your backend server.")
    print("Make sure you have:")
    print("  1. Backend server running (http://localhost:5000)")
    print("  2. Frontend application open in browser")
    print("  3. At least one user logged in")
    print("  4. Audio enabled in browser")
    
    choice = input("\nChoose test type:\n1. Single alert test\n2. Multiple scenarios\n3. Both\nEnter choice (1-3): ")
    
    if choice in ['1', '3']:
        print("\n" + "="*60)
        success = test_detection_alert_integration()
        if not success:
            print("❌ Single alert test failed")
            return
    
    if choice in ['2', '3']:
        print("\n" + "="*60)
        test_multiple_scenarios()
    
    print("\n🎉 All tests completed!")
    print("Check your frontend application for emergency alert modals.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️ Test cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
