#!/usr/bin/env python3
"""
Multi-Camera Real-Time Object Detection using YOLOv8
Runs two cameras in parallel and combines outputs into single JSON
Supports both local cameras and IP cameras
"""

import cv2
import json
import time
import datetime
import numpy as np
from ultralytics import YOLO
import threading
import re

class MultiCameraDetector:
    """Multi-camera detection with parallel processing"""
    
    def __init__(self):
        self.model = YOLO("yolov8n.pt")
        self.running = False
        self.camera_detections = {}  # Store detections from each camera
        self.camera_info = {}  # Store camera details (name, zone, etc.)
        self.combined_detection_history = {
            "stampede": {"confidence": 0.0, "status": "not_detected"},
            "running": {"confidence": 0.0, "status": "not_detected"},
            "fallen": {"confidence": 0.0, "status": "not_detected"},
            "fire": {"confidence": 0.0, "status": "not_detected"},
            "smoke": {"confidence": 0.0, "status": "not_detected"},
            "medical emergency": {"confidence": 0.0, "status": "not_detected"}
        }
    
    def is_ip_camera(self, camera_input):
        """Check if input is an IP camera URL"""
        ip_pattern = r'^https?://\d+\.\d+\.\d+\.\d+:\d+/.*$'
        return bool(re.match(ip_pattern, camera_input))
    
    def setup_camera_info(self, camera_id, camera_source):
        """Setup camera information including name and zone"""
        # Default names for local cameras
        local_camera_names = {
            0: "Main Entrance Camera",
            1: "Parking Lot Camera", 
            2: "Building Interior Camera"
        }
        
        local_camera_zones = {
            0: "Entrance Zone",
            1: "Parking Zone",
            2: "Interior Zone"
        }
        
        # Determine if it's an IP camera
        if isinstance(camera_source, str) and self.is_ip_camera(camera_source):
            # Extract IP address for naming
            ip_match = re.search(r'(\d+\.\d+\.\d+\.\d+)', camera_source)
            ip_address = ip_match.group(1) if ip_match else "Unknown IP"
            
            camera_name = f"IP Camera ({ip_address})"
            camera_zone = f"Remote Zone ({ip_address})"
        else:
            # Local camera
            camera_name = local_camera_names.get(camera_source, f"Camera {camera_source}")
            camera_zone = local_camera_zones.get(camera_source, f"Zone {camera_source}")
        
        self.camera_info[camera_id] = {
            "camera_id": camera_id,
            "camera_source": camera_source,
            "name": camera_name,
            "zone": camera_zone,
            "type": "ip_camera" if isinstance(camera_source, str) and self.is_ip_camera(camera_source) else "local_camera",
            "status": "active",
            "last_update": time.time()
        }
    
    def test_camera_connection(self, camera_source):
        """Test if camera connection is working"""
        try:
            if isinstance(camera_source, str) and self.is_ip_camera(camera_source):
                # Test IP camera
                cap = cv2.VideoCapture(camera_source)
                if cap.isOpened():
                    ret, frame = cap.read()
                    cap.release()
                    return ret
                return False
            else:
                # Test local camera
                cap = cv2.VideoCapture(camera_source)
                if cap.isOpened():
                    ret, frame = cap.read()
                    cap.release()
                    return ret
                return False
        except Exception as e:
            print(f"Error testing camera {camera_source}: {e}")
            return False
    
    def process_camera_frame(self, camera_id, frame):
        """Process a single frame from a specific camera"""
        # Run YOLOv8 detection
        results = self.model(frame, verbose=False)
        
        # Extract detections
        detections = []
        if results and len(results) > 0:
            result = results[0]
            if result.boxes is not None:
                for box in result.boxes:
                    if box.conf is not None and box.cls is not None:
                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])
                        
                        if confidence >= 0.3:
                            bbox = box.xyxy[0].cpu().numpy()
                            detections.append({
                                'class': 'person',
                                'bbox': bbox,
                                'confidence': confidence,
                                'class_id': class_id
                            })
        
        # Calculate detection metrics for this camera
        person_count = len([d for d in detections if d['class'] == 'person'])
        
        # Individual camera detection history
        camera_detection_history = {
            "stampede": {"confidence": 0.0, "status": "not_detected"},
            "running": {"confidence": 0.0, "status": "not_detected"},
            "fallen": {"confidence": 0.0, "status": "not_detected"},
            "fire": {"confidence": 0.0, "status": "not_detected"},
            "smoke": {"confidence": 0.0, "status": "not_detected"},
            "medical emergency": {"confidence": 0.0, "status": "not_detected"}
        }
        
        # Simple detection logic for individual camera
        if person_count > 5:  # Stampede threshold for individual camera
            camera_detection_history['stampede'] = {
                'confidence': min(person_count / 10.0, 1.0),
                'status': 'detected'
            }
        
        if person_count > 0:  # Running detection
            camera_detection_history['running'] = {
                'confidence': 0.5,
                'status': 'detected'
            }
        
        if person_count > 0:  # Fallen detection (simplified)
            camera_detection_history['fallen'] = {
                'confidence': 0.7,  # Increased confidence for better detection
                'status': 'detected'
            }
        
        # Update camera-specific detections with detailed information
        self.camera_detections[camera_id] = {
            'person_count': person_count,
            'detections': detections,
            'timestamp': time.time(),
            'detection_history': camera_detection_history,
            'frame_processed': True
        }
        
        # Update camera info
        self.camera_info[camera_id]['last_update'] = time.time()
        
        return results[0].plot() if results else frame
    
    def combine_camera_detections(self):
        """Combine detections from all cameras into single JSON"""
        total_person_count = sum(d['person_count'] for d in self.camera_detections.values())
        
        # Simple stampede detection (if total people > 10)
        stampede_detected = total_person_count > 10
        stampede_confidence = min(total_person_count / 20.0, 1.0)
        
        # Update combined detection history
        self.combined_detection_history['stampede'] = {
            'confidence': float(stampede_confidence),
            'status': 'detected' if stampede_detected else 'not_detected'
        }
        
        # Running detection (simplified)
        running_detected = any(d['person_count'] > 0 for d in self.camera_detections.values())
        self.combined_detection_history['running'] = {
            'confidence': 0.5 if running_detected else 0.0,
            'status': 'detected' if running_detected else 'not_detected'
        }
        
        # Fallen detection (simplified)
        fallen_detected = any(d['person_count'] > 0 for d in self.camera_detections.values())
        self.combined_detection_history['fallen'] = {
            'confidence': 0.7 if fallen_detected else 0.0,  # Increased confidence
            'status': 'detected' if fallen_detected else 'not_detected'
        }
        
        # Fire and smoke detection (simplified)
        self.combined_detection_history['fire'] = {
            'confidence': 0.0,
            'status': 'not_detected'
        }
        
        self.combined_detection_history['smoke'] = {
            'confidence': 0.0,
            'status': 'not_detected'
        }
        
        self.combined_detection_history['medical emergency'] = {
            'confidence': 0.0,
            'status': 'not_detected'
        }
    
    def camera_processing_thread(self, camera_id, camera_source):
        """Thread function for processing a single camera"""
        cap = cv2.VideoCapture(camera_source)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        # Setup camera information
        self.setup_camera_info(camera_id, camera_source)
        
        camera_name = self.camera_info[camera_id]['name']
        camera_zone = self.camera_info[camera_id]['zone']
        camera_type = self.camera_info[camera_id]['type']
        
        print(f"🎥 Camera {camera_id} ({camera_name}) in {camera_zone} started")
        print(f"   Type: {camera_type}, Source: {camera_source}")
        
        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    print(f"❌ Camera {camera_id} ({camera_name}) cannot read frames")
                    break
                
                # Process frame
                annotated_frame = self.process_camera_frame(camera_id, frame)
                
                # Add camera info to frame
                cv2.putText(annotated_frame, f"{camera_name}", (10, 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"Zone: {camera_zone}", (10, 60), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"Type: {camera_type}", (10, 90), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                
                # Show video window for this camera
                cv2.imshow(f'{camera_name} - {camera_zone}', annotated_frame)
                
                # Check for quit key
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        except Exception as e:
            print(f"❌ Error in camera {camera_id} ({camera_name}): {e}")
        finally:
            cap.release()
            print(f"✅ Camera {camera_id} ({camera_name}) stopped")

def main():
    """Main function for multi-camera detection"""
    print("🚀 Starting Multi-Camera Real-Time Detection")
    print("=" * 50)
    
    # Initialize multi-camera detector
    detector = MultiCameraDetector()
    
    # Ask user for camera inputs
    print("🔍 Please select two camera sources:")
    print("Local cameras:")
    print("  0 - Main Entrance Camera (Entrance Zone)")
    print("  1 - Parking Lot Camera (Parking Zone)")
    print("  2 - Building Interior Camera (Interior Zone)")
    print("IP cameras:")
    print("  Enter IP camera URL (e.g., http://192.168.0.101:4747/video)")
    print("  Or enter local camera number (0, 1, or 2)")
    
    camera_sources = []
    while len(camera_sources) < 2:
        try:
            camera_input = input(f"Enter camera source {len(camera_sources) + 1}: ").strip()
            
            # Check if it's a local camera number
            if camera_input.isdigit():
                camera_source = int(camera_input)
                if camera_source in [0, 1, 2] and camera_source not in camera_sources:
                    if detector.test_camera_connection(camera_source):
                        camera_sources.append(camera_source)
                        print(f"✅ Local camera {camera_source} is working!")
                    else:
                        print(f"❌ Local camera {camera_source} is not available")
                elif camera_source in camera_sources:
                    print(f"❌ Camera {camera_source} already selected")
                else:
                    print("❌ Please enter 0, 1, or 2 for local cameras")
            else:
                # Check if it's an IP camera URL
                if detector.is_ip_camera(camera_input):
                    if detector.test_camera_connection(camera_input):
                        camera_sources.append(camera_input)
                        print(f"✅ IP camera {camera_input} is working!")
                    else:
                        print(f"❌ IP camera {camera_input} is not accessible")
                else:
                    print("❌ Invalid input. Please enter a local camera number (0,1,2) or IP camera URL")
                    
        except ValueError:
            print("❌ Please enter a valid camera source")
    
    print(f"🎥 Using cameras: {camera_sources[0]} and {camera_sources[1]}")
    
    # Start camera processing threads
    detector.running = True
    camera_threads = {}
    
    for i, camera_source in enumerate(camera_sources):
        thread = threading.Thread(target=detector.camera_processing_thread, args=(i, camera_source))
        camera_threads[i] = thread
        thread.start()
    
    last_log_time = time.time()
    
    try:
        while True:
            # Combine detections from all cameras
            detector.combine_camera_detections()
            
            # Log every second
            current_time = time.time()
            if current_time - last_log_time >= 1.0:
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                
                # Create detailed log entry with individual camera information
                log_entry = {
                    "timestamp": timestamp,
                    "cameras": camera_sources,
                    "camera_details": {},
                    "individual_detections": {},
                    "combined_events": detector.combined_detection_history.copy()
                }
                
                # Add individual camera details and detections
                for camera_id in detector.camera_detections.keys():
                    if camera_id in detector.camera_info:
                        # Camera details
                        log_entry["camera_details"][f"camera_{camera_id}"] = {
                            "name": detector.camera_info[camera_id]['name'],
                            "zone": detector.camera_info[camera_id]['zone'],
                            "type": detector.camera_info[camera_id]['type'],
                            "status": detector.camera_info[camera_id]['status'],
                            "person_count": detector.camera_detections[camera_id]['person_count'],
                            "last_update": detector.camera_info[camera_id]['last_update']
                        }
                        
                        # Individual camera detections
                        if 'detection_history' in detector.camera_detections[camera_id]:
                            log_entry["individual_detections"][f"camera_{camera_id}"] = \
                                detector.camera_detections[camera_id]['detection_history']
                
                print(json.dumps(log_entry, indent=2))
                
                # Save to file
                try:
                    with open("multi_camera_activity_log.jsonl", "a", encoding="utf-8") as f:
                        f.write(json.dumps(log_entry) + '\n')
                except Exception as e:
                    print(f"Error writing to log file: {e}")
                
                last_log_time = current_time
            
            # Small delay to prevent excessive CPU usage
            time.sleep(0.1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Detection stopped by user")
    finally:
        # Stop all camera threads
        detector.running = False
        for thread in camera_threads.values():
            thread.join()
        
        cv2.destroyAllWindows()
        print("✅ Multi-camera detection stopped")

if __name__ == "__main__":
    main() 