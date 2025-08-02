#!/usr/bin/env python3
"""
Test script for the emergency alert system.
Sends detection events with confidence levels above 50% to trigger alerts.
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:5000"
DETECTION_ALERT_ENDPOINT = f"{BACKEND_URL}/api/detection-alert"

def send_detection_alert(event_data):
    """Send a detection alert to the backend"""
    try:
        response = requests.post(
            DETECTION_ALERT_ENDPOINT,
            json=event_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Alert sent successfully: {response.json()}")
            return True
        else:
            print(f"❌ Failed to send alert: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error sending alert: {e}")
        return False

def create_test_detection_data(event_type, confidence, camera_id="test-camera-01"):
    """Create test detection data"""
    return {
        "timestamp": datetime.now().isoformat(),
        "camera_id": camera_id,
        "events": {
            event_type: {
                "confidence": confidence,
                "status": "detected" if confidence > 0.5 else "not_detected"
            },
            # Add some background events with low confidence
            "running": {
                "confidence": 0.3,
                "status": "not_detected"
            },
            "medical emergency": {
                "confidence": 0.1,
                "status": "not_detected"
            }
        },
        "camera_info": {
            "location": f"Test Location - Camera {camera_id}",
            "zone": "Test Zone A"
        }
    }

def test_fire_alert():
    """Test fire detection alert"""
    print("\n🔥 Testing Fire Detection Alert...")
    data = create_test_detection_data("fire", 0.75)
    return send_detection_alert(data)

def test_smoke_alert():
    """Test smoke detection alert"""
    print("\n💨 Testing Smoke Detection Alert...")
    data = create_test_detection_data("smoke", 0.85)
    return send_detection_alert(data)

def test_stampede_alert():
    """Test stampede detection alert"""
    print("\n👥 Testing Stampede Detection Alert...")
    data = create_test_detection_data("stampede", 0.65)
    return send_detection_alert(data)

def test_fallen_person_alert():
    """Test fallen person detection alert"""
    print("\n🚑 Testing Fallen Person Alert...")
    data = create_test_detection_data("fallen", 0.90)
    return send_detection_alert(data)

def test_medical_emergency_alert():
    """Test medical emergency alert"""
    print("\n🏥 Testing Medical Emergency Alert...")
    data = create_test_detection_data("medical emergency", 0.80)
    return send_detection_alert(data)

def test_running_alert():
    """Test running/movement detection alert"""
    print("\n🏃 Testing Running/Movement Alert...")
    data = create_test_detection_data("running", 0.70)
    return send_detection_alert(data)

def test_multiple_events():
    """Test multiple events in one detection"""
    print("\n⚠️ Testing Multiple Events Alert...")
    data = {
        "timestamp": datetime.now().isoformat(),
        "camera_id": "multi-event-camera",
        "events": {
            "fire": {
                "confidence": 0.70,
                "status": "detected"
            },
            "smoke": {
                "confidence": 1.0,
                "status": "detected"
            },
            "running": {
                "confidence": 0.60,
                "status": "detected"
            },
            "fallen": {
                "confidence": 0.45,
                "status": "not_detected"
            },
            "medical emergency": {
                "confidence": 0.20,
                "status": "not_detected"
            },
            "stampede": {
                "confidence": 0.55,
                "status": "detected"
            }
        },
        "camera_info": {
            "location": "Multi-Event Test Location",
            "zone": "Critical Zone"
        }
    }
    return send_detection_alert(data)

def test_low_confidence_events():
    """Test events with confidence below threshold (should not trigger alerts)"""
    print("\n📊 Testing Low Confidence Events (should not trigger alerts)...")
    data = {
        "timestamp": datetime.now().isoformat(),
        "camera_id": "low-confidence-camera",
        "events": {
            "fire": {
                "confidence": 0.30,
                "status": "not_detected"
            },
            "smoke": {
                "confidence": 0.45,
                "status": "not_detected"
            },
            "running": {
                "confidence": 0.25,
                "status": "not_detected"
            },
            "fallen": {
                "confidence": 0.40,
                "status": "not_detected"
            }
        },
        "camera_info": {
            "location": "Low Confidence Test Location",
            "zone": "Safe Zone"
        }
    }
    return send_detection_alert(data)

def main():
    """Main test function"""
    print("🚨 Emergency Alert System Test")
    print("=" * 50)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Alert Endpoint: {DETECTION_ALERT_ENDPOINT}")
    print("\nMake sure your backend server is running and you have users logged in!")
    print("The alerts will be sent to all logged-in responders, operators, and admins.")
    
    # Wait for user confirmation
    input("\nPress Enter to start testing or Ctrl+C to cancel...")
    
    tests = [
        ("Fire Alert", test_fire_alert),
        ("Smoke Alert", test_smoke_alert),
        ("Stampede Alert", test_stampede_alert),
        ("Fallen Person Alert", test_fallen_person_alert),
        ("Medical Emergency Alert", test_medical_emergency_alert),
        ("Running/Movement Alert", test_running_alert),
        ("Multiple Events Alert", test_multiple_events),
        ("Low Confidence Events", test_low_confidence_events)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        success = test_func()
        results.append((test_name, success))
        
        # Wait between tests to avoid overwhelming the system
        if test_func != test_low_confidence_events:  # Don't wait after the last test
            print("⏳ Waiting 3 seconds before next test...")
            time.sleep(3)
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    successful_tests = 0
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name}: {status}")
        if success:
            successful_tests += 1
    
    print(f"\nTotal: {successful_tests}/{len(results)} tests passed")
    
    if successful_tests == len(results):
        print("🎉 All tests passed! The alert system is working correctly.")
    else:
        print("⚠️ Some tests failed. Check the backend logs for more details.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️ Test cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
