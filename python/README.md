# YOLO Video Streaming Service with Web Integration

A comprehensive real-time object detection system using YOLOv8, integrated with a web-based monitoring dashboard for emergency situation detection and incident management.

## 🚀 Features

### **Web Integration:**
- **Real-time Video Streaming**: Live video feeds with YOLO detection overlays
- **Multiple Camera Support**: Local cameras, IP cameras, and DroidCam integration
- **WebSocket Communication**: Real-time detection updates to web dashboard
- **REST API**: Full camera management and detection history access
- **MongoDB Storage**: Persistent storage of detection results and incidents

### **Advanced Detection Capabilities:**
- **Stampede Detection**: Person count + motion analysis
- **Fire Detection**: Research-based multi-color analysis + flame flicker detection
- **Smoke Detection**: Gray area detection + temporal analysis
- **Running Detection**: Person tracking + speed calculation
- **Fallen Person Detection**: Aspect ratio analysis
- **Medical Emergency Detection**: Gesture and pose analysis

### **Incident Management:**
- **Automatic Incident Creation**: AI detections automatically create incidents
- **Severity Assessment**: Intelligent severity classification based on confidence
- **Human Approval Workflow**: High-risk incidents require human approval
- **Cooldown Prevention**: Prevents duplicate incidents within time windows

### **Sophisticated Heuristics:**
- **Optical Flow Motion Detection**: Real-time motion magnitude calculation
- **Person Tracking**: Cross-frame person association with speed calculation
- **Temporal Analysis**: 5-second rolling window with 2+ frame requirement
- **Color-Based Detection**: HSV analysis for fire/smoke detection
- **Heuristic Confidence Scoring**: Normalized confidence based on detection strength

## 📁 Project Structure

```
python/
├── video_streaming_service.py  # Main Flask service with YOLO integration
├── incident_service.py         # Incident creation from detections
├── advanced_detection.py       # Standalone detection system
├── multi_camera_detection.py   # Multi-camera detection
├── detection_config.py         # Configuration settings
├── start_video_service.py      # Service startup script
├── test_integration.py         # Integration testing
├── requirements.txt            # Python dependencies
├── .env.example               # Environment configuration template
├── README.md                  # This file
├── yolov8n.pt                 # YOLOv8 model file
└── *.jsonl                    # Detection logs (generated)
```

## 🛠️ Installation

### **Prerequisites:**
- Python 3.8+
- MongoDB (running on localhost:27017)
- Backend API (running on localhost:5000)
- Camera access (webcam or IP camera)

### **Quick Start:**
1. **Clone and Navigate:**
   ```bash
   cd hackathon/Ai-model/python
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

4. **Start the Service:**
   ```bash
   python start_video_service.py
   ```

## 🎯 Usage

### **Web-Integrated Service:**
```bash
python start_video_service.py
```
- Starts Flask service on http://localhost:5001
- Provides REST API and WebSocket endpoints
- Integrates with web dashboard
- Automatically creates incidents from detections

### **Standalone Detection:**
```bash
python advanced_detection.py
```
- Real-time detection with visual display
- Console logging of detection events
- No web integration

### **Multi-Camera Detection:**
```bash
python multi_camera_detection.py
```
- Parallel processing of multiple cameras
- Combined detection output

### **Integration Testing:**
```bash
python test_integration.py
```
- Tests all system components
- Verifies camera, detection, and storage functionality

## 📱 DroidCam Setup

### **Install DroidCam:**
1. Install DroidCam app on your Android/iOS device
2. Connect your phone to the same WiFi network as your computer
3. Note the IP address shown in the DroidCam app (e.g., 192.168.1.100)

### **Configure in Web Dashboard:**
1. Open the web dashboard
2. Go to Live Video Feed page
3. Click the Settings button
4. Enter your DroidCam IP address
5. Click "Configure" to add the camera

### **Alternative Configuration:**
```bash
curl -X POST http://localhost:5001/api/cameras/droidcam/configure \
  -H "Content-Type: application/json" \
  -d '{"ip_address": "192.168.1.100", "camera_id": "droidcam_01"}'
```

## 🔌 API Endpoints

### **Camera Management:**
- `GET /api/cameras` - List all cameras
- `POST /api/cameras/{id}/start` - Start camera
- `POST /api/cameras/{id}/stop` - Stop camera
- `GET /api/cameras/{id}/detections` - Get latest detections

### **Video Streaming:**
- `GET /api/video_feed/{id}` - Live video stream (MJPEG)

### **Detection History:**
- `GET /api/detection_history/{id}` - Get detection history
- Query parameters: `limit`, `start_time`, `end_time`

### **DroidCam Configuration:**
- `POST /api/cameras/droidcam/configure` - Configure DroidCam IP

### **WebSocket Events:**
- `detection_update` - Real-time detection results
- `connect/disconnect` - Connection status

## 📊 Output Format

The system generates structured JSON logs:

```json
{
  "timestamp": "2025-08-01 22:58:28",
  "camera_id": "cam_east_01",
  "events": {
    "fire": { "confidence": 0.0, "status": "not_detected" },
    "smoke": { "confidence": 0.416, "status": "detected" },
    "running": { "confidence": 1.0, "status": "detected" },
    "fallen": { "confidence": 0.615, "status": "detected" },
    "medical emergency": { "confidence": 0.0, "status": "not_detected" },
    "stampede": { "confidence": 0.0, "status": "not_detected" }
  },
  "raw_detections": [
    {
      "label": "smoke",
      "confidence": 0.416,
      "bbox": [100, 150, 200, 180],
      "camera_id": "cam_east_01",
      "timestamp": 1704151108.5
    }
  ]
}
```

## 🔧 Configuration

Edit `detection_config.py` to customize:
- Detection thresholds
- Temporal analysis settings
- Tracking parameters
- Optical flow settings
- Heuristic rules

## 🎥 Visual Features

- **Real-time video window** with detection overlays
- **Motion visualization** showing optical flow
- **Tracking display** with person trajectories
- **Confidence indicators** for each detection type
- **FPS counter** and performance metrics

## 🚨 Emergency Detection Logic

### **Stampede Detection:**
```python
if person_count > 20 and motion_level > 2.0:
    stampede = True
```

### **Running Detection:**
```python
if speed > 1.5 m/s:
    running = True
```

### **Fallen Detection:**
```python
if aspect_ratio > 1.8:
    fallen = True
```

### **Fire/Smoke Detection:**
```python
# Multi-color range analysis
if (red_orange_detected or yellow_orange_detected or bright_red_detected) and confidence > 0.5:
    fire = True

# Flame flicker validation
if flicker_score > 0.3:
    fire_confidence += 0.2

# Research-based validation
if color_distribution_valid and shape_analysis_valid and area_ratio_valid:
    fire = True
```

## 📈 Performance

- **Real-time processing** at 30 FPS
- **Temporal filtering** reduces false alarms
- **Memory efficient** tracking system
- **Robust error handling** for camera issues

## 🔍 Troubleshooting

1. **Camera Issues**: The system automatically finds working cameras
2. **Model Loading**: Ensure `yolov8n.pt` is in the project directory
3. **Dependencies**: Install all requirements from `requirements.txt`

## 📝 Logs

Detection logs are saved to:
- **Console output**: Real-time JSON logs
- **File**: `activity_log.jsonl` (one JSON per line)

## 🎯 Advanced Features

- **Optical Flow Analysis**: Motion magnitude calculation
- **Person Tracking**: Cross-frame person association
- **Temporal Analysis**: 5-second rolling window
- **Color-Based Detection**: HSV analysis for fire/smoke
- **Heuristic Confidence**: Normalized scoring system

---

**Press 'q' to quit the detection system** 