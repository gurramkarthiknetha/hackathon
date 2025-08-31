#!/usr/bin/env python3
"""
Test Video Detection with Sample Images
Creates mock detection results to test the web integration
"""

import cv2
import numpy as np
import requests
import json
import time
from datetime import datetime
import threading

class TestVideoDetection:
    def __init__(self):
        self.backend_url = "http://localhost:5002/api/detection-alert"
        self.running = False
        
    def create_test_image(self, width=640, height=480):
        """Create a test image with some objects"""
        # Create a black image
        img = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Add some colored rectangles to simulate objects
        cv2.rectangle(img, (50, 50), (150, 150), (0, 0, 255), -1)  # Red rectangle (fire)
        cv2.rectangle(img, (200, 100), (300, 200), (128, 128, 128), -1)  # Gray rectangle (smoke)
        cv2.rectangle(img, (400, 300), (600, 350), (0, 255, 0), -1)  # Green rectangle (person lying down)
        
        # Add text labels
        cv2.putText(img, "FIRE DETECTED", (50, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(img, "SMOKE", (200, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(img, "FALLEN PERSON", (400, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        return img
    
    def generate_mock_detection(self):
        """Generate mock detection data"""
        return {
            "timestamp": datetime.now().isoformat(),
            "camera_id": "test_camera_01",
            "events": {
                "fire": {"confidence": 0.85, "status": "detected"},
                "smoke": {"confidence": 0.72, "status": "detected"},
                "running": {"confidence": 0.0, "status": "not_detected"},
                "fallen": {"confidence": 0.91, "status": "detected"},
                "medical emergency": {"confidence": 0.0, "status": "not_detected"},
                "stampede": {"confidence": 0.0, "status": "not_detected"}
            },
            "raw_detections": [
                {
                    "label": "fire",
                    "confidence": 0.85,
                    "bbox": [50, 50, 100, 100],
                    "camera_id": "test_camera_01",
                    "timestamp": time.time()
                },
                {
                    "label": "smoke", 
                    "confidence": 0.72,
                    "bbox": [200, 100, 100, 100],
                    "camera_id": "test_camera_01",
                    "timestamp": time.time()
                },
                {
                    "label": "fallen",
                    "confidence": 0.91,
                    "bbox": [400, 300, 200, 50],
                    "camera_id": "test_camera_01",
                    "timestamp": time.time()
                }
            ],
            "camera_info": {
                "id": "test_camera_01",
                "name": "Test Camera",
                "zone": "test_zone",
                "location": "Test Location"
            }
        }
    
    def send_detection_alert(self, detection_data):
        """Send detection alert to backend"""
        try:
            response = requests.post(
                self.backend_url,
                json=detection_data,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 200:
                print(f"✅ Alert sent successfully: {detection_data['events']}")
                return True
            else:
                print(f"❌ Alert failed: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error sending alert: {e}")
            return False
    
    def run_test_detection(self, duration=60, interval=10):
        """Run test detection for specified duration"""
        print(f"🧪 Starting test detection for {duration} seconds...")
        print(f"📡 Sending alerts every {interval} seconds to {self.backend_url}")
        
        self.running = True
        start_time = time.time()
        
        while self.running and (time.time() - start_time) < duration:
            # Generate and send mock detection
            detection_data = self.generate_mock_detection()
            self.send_detection_alert(detection_data)
            
            # Create and save test image
            test_img = self.create_test_image()
            cv2.imwrite(f"test_detection_{int(time.time())}.jpg", test_img)
            
            print(f"🔍 Detection sent at {datetime.now().strftime('%H:%M:%S')}")
            
            # Wait for next detection
            time.sleep(interval)
        
        print("✅ Test detection completed")
    
    def stop(self):
        """Stop the test detection"""
        self.running = False

def main():
    """Main function"""
    print("🚀 AI DETECTION TEST SYSTEM")
    print("="*40)
    
    tester = TestVideoDetection()
    
    try:
        # Run test for 2 minutes, sending alerts every 15 seconds
        tester.run_test_detection(duration=120, interval=15)
    except KeyboardInterrupt:
        print("\n🛑 Test stopped by user")
        tester.stop()

if __name__ == "__main__":
    main()
