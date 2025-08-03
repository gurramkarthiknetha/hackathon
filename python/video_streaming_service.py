#!/usr/bin/env python3
"""
Video Streaming Service with YOLO Integration
Provides real-time video streaming with object detection for the web application
"""

import cv2
import json
import time
import datetime
import numpy as np
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import threading
import queue
import os
from ultralytics import YOLO
from detection_config import TARGET_CLASSES, CLASS_MAPPING
from pymongo import MongoClient
from dotenv import load_dotenv
import requests
import re
from incident_service import incident_service

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"], supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"])

class VideoStreamingService:
    def __init__(self):
        self.model = YOLO("yolov8n.pt")
        self.cameras = {}
        self.detection_results = {}
        self.running = False
        
        # MongoDB connection
        self.setup_mongodb()

        # Camera configurations - Only Camo Studio
        self.camera_configs = {
            "camo_studio_01": {
                "id": "camo_studio_01",
                "name": "Camo Studio Camera",
                "zone": "studio_zone",
                "location": "Camo Studio Virtual Camera",
                "source": None,  # Will be set when Camo Studio is detected
                "status": "inactive"
            }
        }
        
        # Detection thresholds
        self.CONFIDENCE_THRESHOLD = 0.3
        self.STAMPEDE_THRESHOLD = 20
        self.RUNNING_SPEED_THRESHOLD = 1.5
        self.FALL_ASPECT_RATIO_THRESHOLD = 1.3  # Lowered from 1.8 to detect more fallen people

        # Auto-configure Camo Studio on startup
        self.auto_configure_camo_studio()
        
    def setup_mongodb(self):
        """Setup MongoDB connection"""
        try:
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/hackathon')
            self.mongo_client = MongoClient(mongo_uri)
            self.db = self.mongo_client.get_default_database()
            self.video_detections = self.db.videodetections
            print("MongoDB connected successfully")
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            self.mongo_client = None

    def auto_configure_camo_studio(self):
        """Automatically detect and configure Camo Studio camera"""
        print("🔍 Auto-detecting Camo Studio camera...")

        camo_device = self.detect_camo_studio_device()
        if camo_device:
            self.camera_configs["camo_studio_01"]["source"] = camo_device["index"]
            self.camera_configs["camo_studio_01"]["name"] = camo_device["name"]
            print(f"✅ Camo Studio auto-configured: {camo_device['name']} at device {camo_device['index']}")
        else:
            print("❌ No Camo Studio camera detected. Please ensure:")
            print("   1. Camo Studio app is running on your phone")
            print("   2. Phone is connected via USB or WiFi")
            print("   3. Camo Studio virtual camera is installed")
            self.camera_configs["camo_studio_01"]["status"] = "error"
            
    def test_camera_connection(self, source):
        """Test if camera source is accessible"""
        try:
            if isinstance(source, str) and source.startswith('http'):
                # Test IP camera/DroidCam
                response = requests.get(source, timeout=5)
                return response.status_code == 200
            else:
                # Test local camera with improved handling for virtual cameras
                cap = cv2.VideoCapture(source)
                if cap.isOpened():
                    # Set a timeout for reading frames
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                    # Try to read a frame with timeout
                    for attempt in range(3):  # Try 3 times
                        ret, frame = cap.read()
                        if ret and frame is not None:
                            cap.release()
                            return True
                        time.sleep(0.1)  # Small delay between attempts

                    cap.release()
                    return False
                return False
        except Exception as e:
            print(f"Error testing camera {source}: {e}")
            return False

    def detect_available_cameras(self, max_devices=10):
        """Detect available camera devices, prioritizing Camo Studio"""
        available_devices = []

        # First, try to find Camo Studio specifically
        camo_device = self.detect_camo_studio_device()
        if camo_device:
            available_devices.append(camo_device)
            return available_devices

        # If no Camo Studio found, scan all devices but exclude device 0 (built-in camera)
        for device_index in range(1, max_devices):  # Start from 1 to skip built-in camera
            try:
                cap = cv2.VideoCapture(device_index)
                if cap.isOpened():
                    # Try to read a frame to verify the camera works
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        # Get camera properties
                        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                        fps = int(cap.get(cv2.CAP_PROP_FPS))

                        device_info = {
                            "index": device_index,
                            "name": f"Camera Device {device_index}",
                            "resolution": f"{width}x{height}",
                            "fps": fps,
                            "working": True
                        }

                        # Try to identify virtual cameras (likely Camo Studio)
                        if width >= 1280 and height >= 720:
                            device_info["name"] = f"Virtual Camera {device_index} (Possibly Camo Studio)"

                        available_devices.append(device_info)

                    cap.release()

            except Exception as e:
                print(f"Error testing device {device_index}: {e}")
                continue

        return available_devices

    def detect_camo_studio_device(self):
        """Specifically detect Camo Studio virtual camera"""
        # Common Camo Studio device indices (including 0 which might be Camo Studio)
        camo_indices = [3, 4, 5, 6, 2, 1, 0]

        for device_index in camo_indices:
            try:
                # Try different backends that work well with virtual cameras
                backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]

                for backend in backends:
                    try:
                        cap = cv2.VideoCapture(device_index, backend)
                        if cap.isOpened():
                            # Set properties for virtual cameras
                            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

                            # Test frame reading
                            ret, frame = cap.read()
                            if ret and frame is not None:
                                # Get properties
                                width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                                height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                                fps = int(cap.get(cv2.CAP_PROP_FPS))

                                # Check if this looks like Camo Studio
                                if width >= 1280 and height >= 720:  # HD resolution
                                    cap.release()
                                    print(f"Found Camo Studio camera at device {device_index}")
                                    return {
                                        "index": device_index,
                                        "name": f"Camo Studio Camera (Device {device_index})",
                                        "resolution": f"{width}x{height}",
                                        "fps": fps,
                                        "working": True,
                                        "backend": backend
                                    }

                            cap.release()

                    except Exception as e:
                        continue

            except Exception as e:
                continue

        return None
            
    def start_camera(self, camera_id):
        """Start a specific camera stream"""
        if camera_id not in self.camera_configs:
            print(f"Camera {camera_id} not found in configurations")
            return False

        config = self.camera_configs[camera_id]
        print(f"Starting camera {camera_id} with source: {config['source']}")

        # For Camo Studio cameras, try multiple approaches
        if "camo" in camera_id.lower():
            return self.start_camo_studio_camera(camera_id, config)

        # Test connection first for other cameras
        if not self.test_camera_connection(config["source"]):
            print(f"Camera {camera_id} connection test failed")
            return False

        try:
            # Create VideoCapture with specific parameters for IP cameras
            cap = cv2.VideoCapture(config["source"])

            # Set buffer size to reduce latency for IP cameras
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

            # Set timeout for network streams
            if isinstance(config["source"], str) and config["source"].startswith("http"):
                cap.set(cv2.CAP_PROP_OPEN_TIMEOUT_MSEC, 10000)  # 10 second timeout
                cap.set(cv2.CAP_PROP_READ_TIMEOUT_MSEC, 5000)   # 5 second read timeout

            if cap.isOpened():
                self.cameras[camera_id] = {
                    "capture": cap,
                    "config": config,
                    "thread": None,
                    "frame_queue": queue.Queue(maxsize=2)
                }

                # Start processing thread
                thread = threading.Thread(target=self.process_camera_stream, args=(camera_id,))
                thread.daemon = True
                thread.start()
                self.cameras[camera_id]["thread"] = thread

                config["status"] = "active"
                print(f"Camera {camera_id} started successfully")
                return True
        except Exception as e:
            print(f"Error starting camera {camera_id}: {e}")

        config["status"] = "error"
        return False

    def start_camo_studio_camera(self, camera_id, config):
        """Special handling for Camo Studio cameras"""
        source = config["source"]
        print(f"Attempting to start Camo Studio camera with device index: {source}")

        try:
            # Try different backends for virtual cameras
            backends = [cv2.CAP_ANY, cv2.CAP_DSHOW, cv2.CAP_MSMF]

            for backend in backends:
                try:
                    print(f"Trying backend: {backend}")
                    cap = cv2.VideoCapture(source, backend)

                    if cap.isOpened():
                        # Set properties for better compatibility
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                        cap.set(cv2.CAP_PROP_FPS, 30)

                        # Test if we can actually read frames
                        for attempt in range(5):  # Try 5 times
                            ret, frame = cap.read()
                            if ret and frame is not None:
                                print(f"Successfully connected to Camo Studio camera with backend {backend}")

                                self.cameras[camera_id] = {
                                    "capture": cap,
                                    "config": config,
                                    "thread": None,
                                    "frame_queue": queue.Queue(maxsize=2)
                                }

                                # Start processing thread
                                thread = threading.Thread(target=self.process_camera_stream, args=(camera_id,))
                                thread.daemon = True
                                thread.start()
                                self.cameras[camera_id]["thread"] = thread

                                config["status"] = "active"
                                return True

                            time.sleep(0.2)  # Wait a bit between attempts

                    cap.release()

                except Exception as e:
                    print(f"Backend {backend} failed: {e}")
                    continue

            print(f"All backends failed for Camo Studio camera {camera_id}")
            config["status"] = "error"
            return False

        except Exception as e:
            print(f"Error starting Camo Studio camera {camera_id}: {e}")
            config["status"] = "error"
            return False
        
    def stop_camera(self, camera_id):
        """Stop a specific camera stream"""
        if camera_id in self.cameras:
            camera = self.cameras[camera_id]
            if camera["capture"]:
                camera["capture"].release()
            self.camera_configs[camera_id]["status"] = "inactive"
            del self.cameras[camera_id]
            print(f"Camera {camera_id} stopped")
            
    def process_camera_stream(self, camera_id):
        """Process video stream from a specific camera"""
        camera = self.cameras[camera_id]
        cap = camera["capture"]
        config = camera["config"]
        
        while camera_id in self.cameras:
            ret, frame = cap.read()
            if not ret:
                print(f"Failed to read from camera {camera_id}")
                break
                
            # Run YOLO detection
            results = self.model(frame, conf=self.CONFIDENCE_THRESHOLD)
            
            # Process detections
            detections = self.process_detections(results, frame, camera_id)
            
            # Store detection results
            self.detection_results[camera_id] = {
                "timestamp": time.time(),
                "detections": detections,
                "camera_info": config
            }
            
            # Draw bounding boxes on frame
            print(f"DEBUG: Drawing {len(detections)} detections on frame for camera {camera_id}")
            annotated_frame = self.draw_detections(frame, detections)
            
            # Add frame to queue for streaming
            if not camera["frame_queue"].full():
                try:
                    camera["frame_queue"].put_nowait(annotated_frame)
                except queue.Full:
                    pass
                    
            # Store in MongoDB
            self.store_detection_results(camera_id, detections)
            
            # Emit real-time detection data via WebSocket
            self.emit_detection_data(camera_id, detections)
            
            time.sleep(0.033)  # ~30 FPS
            
    def process_detections(self, results, frame, camera_id):
        """Process YOLO detection results"""
        detections = []
        raw_detections_count = 0

        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    raw_detections_count += 1

                    # Debug: Print what YOLO is actually detecting
                    if raw_detections_count <= 5:  # Only print first 5 to avoid spam
                        print(f"YOLO detected: class_id={class_id}, confidence={confidence:.2f}")

                    # For now, let's detect ALL objects above confidence threshold, not just mapped ones
                    if confidence >= self.CONFIDENCE_THRESHOLD:
                        # Get class name from YOLO model
                        class_name = self.model.names.get(class_id, f"class_{class_id}")

                        # Use mapped label if available, otherwise use original class name
                        label = CLASS_MAPPING.get(class_id, class_name)

                        detection = {
                            "label": label,
                            "confidence": float(confidence),
                            "bbox": [float(x1), float(y1), float(x2-x1), float(y2-y1)],
                            "camera_id": camera_id,
                            "timestamp": time.time(),
                            "original_class": class_name,
                            "class_id": class_id
                        }
                        detections.append(detection)

        # Add fallen person detection based on person bounding boxes
        fallen_detections = self.detect_fallen_people(results)
        for fallen_det in fallen_detections:
            fallen_det["camera_id"] = camera_id
        detections.extend(fallen_detections)

        # Debug: Print detection summary
        if raw_detections_count > 0:
            print(f"Camera {camera_id}: {raw_detections_count} raw detections, {len(detections)} processed detections")

        return detections

    def detect_fallen_people(self, results):
        """Detect fallen people based on bounding box aspect ratio"""
        fallen_detections = []

        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    class_id = int(box.cls[0].cpu().numpy())

                    # Only check person class (class_id = 0 in COCO)
                    if class_id == 0:  # person class
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()

                        width = x2 - x1
                        height = y2 - y1

                        if width > 0 and height > 0:
                            aspect_ratio = width / height

                            # Check if person is lying down (wide bounding box)
                            if aspect_ratio > self.FALL_ASPECT_RATIO_THRESHOLD:
                                # Improved confidence calculation for better sensitivity
                                base_confidence = 0.6
                                ratio_bonus = (aspect_ratio - self.FALL_ASPECT_RATIO_THRESHOLD) * 0.4
                                fallen_confidence = min(base_confidence + ratio_bonus, 1.0)

                                fallen_detection = {
                                    "label": "fallen",
                                    "confidence": float(fallen_confidence),
                                    "bbox": [float(x1), float(y1), float(width), float(height)],
                                    "camera_id": "unknown",  # Will be set by caller
                                    "timestamp": time.time(),
                                    "aspect_ratio": float(aspect_ratio)
                                }
                                fallen_detections.append(fallen_detection)

        return fallen_detections

    def draw_detections(self, frame, detections):
        """Draw bounding boxes and labels on frame"""
        annotated_frame = frame.copy()
        
        for detection in detections:
            x, y, w, h = detection["bbox"]
            x, y, w, h = int(x), int(y), int(w), int(h)
            
            # Choose color based on detection type
            color_map = {
                "fire": (0, 0, 255),      # Red
                "smoke": (128, 128, 128),  # Gray
                "running": (0, 255, 0),    # Green
                "fallen": (255, 0, 0),     # Blue
                "medical emergency": (255, 0, 255),  # Magenta
                "stampede": (0, 255, 255), # Cyan
                "person": (0, 255, 0),     # Green for people
                "laptop": (255, 255, 0),   # Yellow for laptops
                "chair": (128, 255, 128),  # Light green for furniture
                "tv": (255, 128, 0),       # Orange for electronics
            }

            color = color_map.get(detection["label"], (255, 255, 255))  # White for unknown
            
            # Draw bounding box
            cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), color, 2)
            
            # Draw label
            label = f"{detection['label']}: {detection['confidence']:.2f}"
            cv2.putText(annotated_frame, label, (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        return annotated_frame

    def store_detection_results(self, camera_id, detections):
        """Store detection results in MongoDB"""
        if not self.mongo_client or not detections:
            return

        try:
            # Prepare frame result
            frame_result = {
                "timestamp": time.time(),
                "frame": f"{camera_id}_{int(time.time())}",
                "detections": detections
            }

            # Find or create video detection document
            video_doc = self.video_detections.find_one({"videoId": camera_id})

            if video_doc:
                # Update existing document
                self.video_detections.update_one(
                    {"videoId": camera_id},
                    {
                        "$push": {"results": frame_result},
                        "$set": {"processedAt": datetime.datetime.utcnow()}
                    }
                )
            else:
                # Create new document
                new_doc = {
                    "videoId": camera_id,
                    "results": [frame_result],
                    "sourceFilename": f"camera_{camera_id}",
                    "processedAt": datetime.datetime.utcnow()
                }
                self.video_detections.insert_one(new_doc)

        except Exception as e:
            print(f"Error storing detection results: {e}")

    def emit_detection_data(self, camera_id, detections):
        """Emit real-time detection data via WebSocket"""
        try:
            # Prepare detection summary
            detection_summary = {
                "fire": {"confidence": 0.0, "status": "not_detected"},
                "smoke": {"confidence": 0.0, "status": "not_detected"},
                "running": {"confidence": 0.0, "status": "not_detected"},
                "fallen": {"confidence": 0.0, "status": "not_detected"},
                "medical emergency": {"confidence": 0.0, "status": "not_detected"},
                "stampede": {"confidence": 0.0, "status": "not_detected"}
            }

            # Process detections
            person_count = 0
            for detection in detections:
                label = detection["label"]
                confidence = detection["confidence"]

                if label == "fallen" and "person" in str(detection).lower():
                    person_count += 1

                if label in detection_summary:
                    if confidence > detection_summary[label]["confidence"]:
                        detection_summary[label]["confidence"] = confidence
                        # Lower threshold for fallen detection to improve sensitivity
                        threshold = 0.3 if label == "fallen" else 0.5
                        detection_summary[label]["status"] = "detected" if confidence > threshold else "not_detected"

            # Check for stampede based on person count
            if person_count >= self.STAMPEDE_THRESHOLD:
                detection_summary["stampede"]["confidence"] = min(1.0, person_count / 30.0)
                detection_summary["stampede"]["status"] = "detected"

            # Prepare detection update data
            detection_update = {
                "camera_id": camera_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "events": detection_summary,
                "raw_detections": detections,
                "camera_info": self.camera_configs.get(camera_id, {})
            }

            # Emit to connected clients
            print(f"DEBUG: Emitting detection_update for camera {camera_id}: {len(detections)} detections")
            socketio.emit('detection_update', detection_update)

            # Process for incident creation
            incident_service.process_detection_update(detection_update)

            # Send alert to backend if any event has confidence > 50%
            self.send_alert_to_backend(detection_update)

        except Exception as e:
            print(f"Error emitting detection data: {e}")

    def update_droidcam_ip(self, camera_id, ip_address, camera_name=None):
        """Update DroidCam IP address and optionally name"""
        if camera_id in self.camera_configs and "droidcam" in camera_id:
            self.camera_configs[camera_id]["source"] = f"http://{ip_address}:4747/video"
            if camera_name:
                self.camera_configs[camera_id]["name"] = camera_name
            return True
        return False

    def update_ipwebcam_url(self, camera_id, webcam_url, camera_name=None):
        """Update IP Webcam URL and optionally name"""
        if camera_id in self.camera_configs and ("ipwebcam" in camera_id or "webcam" in camera_id):
            # Ensure the URL has the proper format
            if not webcam_url.startswith('http'):
                webcam_url = f"http://{webcam_url}"

            # For IP webcams, we might need to append /video or use the URL as-is
            if not webcam_url.endswith('/video') and not webcam_url.endswith('.mjpg'):
                # Try common IP webcam endpoints
                if webcam_url.endswith('/'):
                    webcam_url = webcam_url + "video"
                else:
                    webcam_url = webcam_url + "/video"

            self.camera_configs[camera_id]["source"] = webcam_url
            if camera_name:
                self.camera_configs[camera_id]["name"] = camera_name
            return True
        return False

    def update_camo_studio_device(self, camera_id, device_index=None, camera_name=None):
        """Update Camo Studio camera device index and optionally name"""
        if camera_id not in self.camera_configs or "camo" not in camera_id:
            return False

        # If no device index provided, try to auto-detect Camo Studio
        if device_index is None:
            camo_device = self.detect_camo_studio_device()
            if camo_device:
                device_index = camo_device["index"]
                print(f"Auto-detected Camo Studio at device {device_index}")
            else:
                print("No Camo Studio camera detected")
                return False

        # Ensure device_index is an integer
        try:
            device_index = int(device_index)

            # Verify this is actually Camo Studio by testing the camera
            if device_index == 0:
                print("Device index 0 detected - verifying this is Camo Studio...")
                # Test if device 0 has HD resolution (indicates Camo Studio)
                test_cap = cv2.VideoCapture(device_index)
                if test_cap.isOpened():
                    width = int(test_cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(test_cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    test_cap.release()

                    if width >= 1280 and height >= 720:
                        print(f"✅ Device 0 confirmed as Camo Studio: {width}x{height}")
                    else:
                        print(f"⚠️  Device 0 appears to be built-in camera: {width}x{height}")
                        print("Proceeding anyway as requested...")
                else:
                    print("❌ Could not test device 0")
                    return False

            self.camera_configs[camera_id]["source"] = device_index
            if camera_name:
                self.camera_configs[camera_id]["name"] = camera_name

            print(f"Camo Studio configured: device {device_index}")
            return True

        except ValueError:
            print(f"Invalid device index: {device_index}")
            return False

    def send_alert_to_backend(self, detection_update):
        """Send alert to backend if any event has confidence > 50%"""
        try:
            events = detection_update.get('events', {})
            confidence_threshold = 0.5

            # Check if any event exceeds the confidence threshold
            high_confidence_events = []
            for event_type, event_data in events.items():
                if isinstance(event_data, dict):
                    confidence = event_data.get('confidence', 0)
                    status = event_data.get('status', 'not_detected')

                    if confidence > confidence_threshold and status == 'detected':
                        high_confidence_events.append((event_type, confidence))

            # Send alert if we have high confidence events
            if high_confidence_events:
                backend_url = "http://localhost:5000/api/detection-alert"

                # Prepare alert data
                alert_data = {
                    "timestamp": detection_update.get('timestamp'),
                    "camera_id": detection_update.get('camera_id'),
                    "events": events,
                    "camera_info": detection_update.get('camera_info', {})
                }

                # Send POST request to backend
                response = requests.post(
                    backend_url,
                    json=alert_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=5
                )

                if response.status_code == 200:
                    print(f"✅ Alert sent to backend for events: {[event[0] for event in high_confidence_events]}")
                else:
                    print(f"❌ Failed to send alert to backend: {response.status_code}")

        except requests.exceptions.RequestException as e:
            print(f"❌ Error sending alert to backend: {e}")
        except Exception as e:
            print(f"❌ Unexpected error sending alert: {e}")

# Global service instance
video_service = VideoStreamingService()

@app.route('/api/cameras', methods=['GET'])
def get_cameras():
    """Get list of available cameras"""
    print("DEBUG: GET /api/cameras called")
    return jsonify({
        "success": True,
        "data": list(video_service.camera_configs.values())
    })

@app.route('/api/cameras/<camera_id>/start', methods=['POST'])
def start_camera(camera_id):
    """Start a specific camera"""
    success = video_service.start_camera(camera_id)
    return jsonify({
        "success": success,
        "message": f"Camera {camera_id} {'started' if success else 'failed to start'}"
    })

@app.route('/api/cameras/<camera_id>/stop', methods=['POST'])
def stop_camera(camera_id):
    """Stop a specific camera"""
    video_service.stop_camera(camera_id)
    return jsonify({
        "success": True,
        "message": f"Camera {camera_id} stopped"
    })

def generate_video_stream(camera_id):
    """Generate video stream for a specific camera"""
    while camera_id in video_service.cameras:
        camera = video_service.cameras[camera_id]
        try:
            frame = camera["frame_queue"].get(timeout=1)
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            if ret:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        except queue.Empty:
            continue
        except Exception as e:
            print(f"Error in video stream for {camera_id}: {e}")
            break

@app.route('/api/video_feed/<camera_id>')
def video_feed(camera_id):
    """Video streaming route"""
    if camera_id not in video_service.cameras:
        return jsonify({"error": "Camera not found or not active"}), 404

    return Response(generate_video_stream(camera_id),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/cameras/<camera_id>/detections', methods=['GET'])
def get_camera_detections(camera_id):
    """Get latest detection results for a camera"""
    if camera_id in video_service.detection_results:
        return jsonify({
            "success": True,
            "data": video_service.detection_results[camera_id]
        })
    return jsonify({
        "success": False,
        "message": "No detection data available for this camera"
    })

@app.route('/api/cameras/droidcam/configure', methods=['POST'])
def configure_droidcam():
    """Configure DroidCam IP address"""
    data = request.get_json()
    ip_address = data.get('ip_address')
    camera_id = data.get('camera_id', 'droidcam_01')
    camera_name = data.get('camera_name')

    if not ip_address:
        return jsonify({
            "success": False,
            "message": "IP address is required"
        })

    success = video_service.update_droidcam_ip(camera_id, ip_address, camera_name)
    return jsonify({
        "success": success,
        "message": f"DroidCam {'configured successfully' if success else 'configuration failed'}"
    })

@app.route('/api/cameras/ipwebcam/configure', methods=['POST'])
def configure_ipwebcam():
    """Configure IP Webcam URL"""
    print("DEBUG: POST /api/cameras/ipwebcam/configure called")
    data = request.get_json()
    print(f"DEBUG: Request data: {data}")
    webcam_url = data.get('webcam_url')
    camera_id = data.get('camera_id', 'ipwebcam_01')
    camera_name = data.get('camera_name')

    if not webcam_url:
        return jsonify({
            "success": False,
            "message": "Webcam URL is required"
        })

    success = video_service.update_ipwebcam_url(camera_id, webcam_url, camera_name)
    return jsonify({
        "success": success,
        "message": f"IP Webcam {'configured successfully' if success else 'configuration failed'}"
    })

@app.route('/api/cameras/camo-studio/configure', methods=['POST'])
def configure_camo_studio():
    """Configure Camo Studio camera device"""
    print("DEBUG: POST /api/cameras/camo-studio/configure called")
    data = request.get_json() or {}
    print(f"DEBUG: Request data: {data}")

    device_index = data.get('device_index')  # None means auto-detect
    camera_id = data.get('camera_id', 'camo_studio_01')
    camera_name = data.get('camera_name')

    success = video_service.update_camo_studio_device(camera_id, device_index, camera_name)

    if success:
        # Get the configured device info
        config = video_service.camera_configs.get(camera_id, {})
        message = f"Camo Studio configured successfully at device {config.get('source', 'unknown')}"
    else:
        message = "Camo Studio configuration failed. Please ensure Camo Studio is running and connected."

    return jsonify({
        "success": success,
        "message": message
    })

@app.route('/api/cameras/detect-devices', methods=['POST'])
def detect_camera_devices():
    """Detect available camera devices"""
    print("DEBUG: POST /api/cameras/detect-devices called")
    try:
        devices = video_service.detect_available_cameras()
        return jsonify({
            "success": True,
            "devices": devices,
            "message": f"Found {len(devices)} available camera devices"
        })
    except Exception as e:
        print(f"Error detecting camera devices: {e}")
        return jsonify({
            "success": False,
            "devices": [],
            "message": f"Failed to detect camera devices: {str(e)}"
        })

@app.route('/api/detection_history/<camera_id>', methods=['GET'])
def get_detection_history(camera_id):
    """Get detection history from MongoDB"""
    if not video_service.mongo_client:
        return jsonify({
            "success": False,
            "message": "Database not available"
        })

    try:
        # Get query parameters
        limit = int(request.args.get('limit', 100))
        start_time = request.args.get('start_time')
        end_time = request.args.get('end_time')

        # Build query
        query = {"videoId": camera_id}

        # Find detection history
        video_doc = video_service.video_detections.find_one(query)

        if not video_doc:
            return jsonify({
                "success": True,
                "data": []
            })

        # Filter results by time if specified
        results = video_doc.get("results", [])

        if start_time:
            start_timestamp = float(start_time)
            results = [r for r in results if r["timestamp"] >= start_timestamp]

        if end_time:
            end_timestamp = float(end_time)
            results = [r for r in results if r["timestamp"] <= end_timestamp]

        # Limit results
        results = results[-limit:] if len(results) > limit else results

        return jsonify({
            "success": True,
            "data": results
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error retrieving detection history: {str(e)}"
        })

@socketio.on('connect')
def handle_connect():
    """Handle WebSocket connection"""
    print(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to video streaming service'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    print(f"Client disconnected: {request.sid}")

@socketio.on('subscribe_camera')
def handle_camera_subscription(data):
    """Handle camera subscription for real-time updates"""
    camera_id = data.get('camera_id')
    print(f"Client {request.sid} subscribed to camera {camera_id}")
    # Join room for camera-specific updates
    # socketio.join_room(camera_id)

@socketio.on('cleanup_incidents')
def cleanup_old_incidents():
    """Periodic cleanup of old incident tracking data"""
    incident_service.cleanup_old_incidents()

# Authentication endpoints (simplified for demo)
@app.route('/api/auth/check-auth', methods=['GET'])
def check_auth():
    """Check authentication status - simplified for demo"""
    return jsonify({
        "success": True,
        "authenticated": True,
        "user": {
            "id": "demo_user",
            "name": "Demo User",
            "role": "admin"
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint - simplified for demo"""
    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": "demo_user",
            "name": "Demo User",
            "role": "admin"
        }
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout endpoint - simplified for demo"""
    return jsonify({
        "success": True,
        "message": "Logout successful"
    })

if __name__ == '__main__':
    print("Starting Video Streaming Service...")
    print("Available endpoints:")
    print("  GET  /api/cameras - List all cameras")
    print("  POST /api/cameras/<id>/start - Start camera")
    print("  POST /api/cameras/<id>/stop - Stop camera")
    print("  GET  /api/video_feed/<id> - Video stream")
    print("  GET  /api/cameras/<id>/detections - Latest detections")
    print("  POST /api/cameras/droidcam/configure - Configure DroidCam")
    print("  GET  /api/detection_history/<id> - Detection history")
    print("  GET  /api/auth/check-auth - Check authentication")
    print("  POST /api/auth/login - Login")
    print("  POST /api/auth/logout - Logout")
    print("\nIntegrated with:")
    print("  - YOLO object detection")
    print("  - MongoDB storage")
    print("  - Incident creation system")
    print("  - Real-time WebSocket updates")
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
