# Emergency Alert System

This document describes the comprehensive emergency alert system that monitors AI detection confidence levels and sends real-time alerts to logged-in responders.

## Overview

The alert system automatically monitors detection events from the AI model and triggers emergency alerts when confidence levels exceed 50%. It provides:

- **Real-time alerts** via WebSocket connections
- **Push notifications** with persistent audio alarms
- **Email notifications** to all logged-in users
- **Modal alerts** with acknowledgment system
- **Audio notifications** using the security alarm sound

## System Architecture

```
AI Model Detection → Backend Alert Service → Frontend Emergency Modal
                                         ↓
                                   Email Notifications
                                         ↓
                                   Push Notifications
```

## Components

### Backend Components

1. **AlertService** (`hackathon/hack/backend/services/alertService.js`)
   - Processes detection events
   - Manages alert cooldowns
   - Sends notifications via multiple channels
   - Tracks logged-in users

2. **Detection Alert Endpoint** (`/api/detection-alert`)
   - Receives detection data from AI model
   - Triggers alert processing
   - Returns success/failure status

3. **Socket.IO Integration**
   - Real-time alert broadcasting
   - User room management
   - Push notification delivery

### Frontend Components

1. **EmergencyAlertModal** (`hackathon/hack/frontend/src/components/alerts/EmergencyAlertModal.jsx`)
   - Full-screen emergency alert modal
   - Audio alarm with loop playback
   - Alert acknowledgment system
   - Event details display

2. **useEmergencyAlerts Hook** (`hackathon/hack/frontend/src/hooks/useEmergencyAlerts.js`)
   - Manages alert state and queue
   - Handles socket events
   - Browser notification integration
   - Alert history tracking

3. **AlertTestButton** (`hackathon/hack/frontend/src/components/debug/AlertTestButton.jsx`)
   - Development testing interface
   - Manual alert triggering
   - Alert history display

## Alert Trigger Conditions

Alerts are triggered when:
- **Confidence Level** > 50% (0.5)
- **Event Status** = "detected"
- **Cooldown Period** has expired (30 seconds per event type per camera)

### Supported Event Types

| Event Type | Display Name | Icon |
|------------|--------------|------|
| `fire` | Fire | 🔥 |
| `smoke` | Smoke | 💨 |
| `stampede` | Stampede | 👥 |
| `fallen` | Person Down | 🚑 |
| `medical emergency` | Medical Emergency | 🏥 |
| `running` | Running/Movement | 🏃 |

## Detection Data Format

The AI model should send detection data in this format:

```json
{
  "timestamp": "2025-08-02T00:06:29",
  "camera_id": "camera-01",
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
      "confidence": 0.0,
      "status": "not_detected"
    },
    "stampede": {
      "confidence": 0.40,
      "status": "detected"
    }
  },
  "camera_info": {
    "location": "Building A - Floor 2",
    "zone": "Zone A"
  }
}
```

## Audio System

### Audio File
- **Location**: `hackathon/hack/frontend/public/audio/security-alarm-63578.mp3`
- **Behavior**: Continuous loop until user dismisses or acknowledges alert
- **Volume**: 80% by default, user controllable
- **Autoplay**: Attempts autoplay, falls back to user interaction if blocked

### Audio Controls
- **Mute/Unmute**: Toggle audio during alert
- **Volume Control**: Adjustable volume slider
- **Auto-stop**: Audio stops when alert is acknowledged or dismissed

## Testing the System

### 1. Python Test Script

Run the comprehensive test script:

```bash
cd hackathon
python test_alert_system.py
```

This script tests:
- Individual event type alerts
- Multiple simultaneous events
- Low confidence events (should not trigger)
- Various confidence levels

### 2. Frontend Test Interface

In development mode, use the AlertTestButton:
1. Look for the test tube icon in the bottom-right corner
2. Click to open the test panel
3. Click any event type to trigger a test alert
4. Observe the emergency modal with audio

### 3. Manual API Testing

Send a POST request to trigger an alert:

```bash
curl -X POST http://localhost:5000/api/detection-alert \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-08-02T00:06:29",
    "camera_id": "test-camera",
    "events": {
      "fire": {
        "confidence": 0.75,
        "status": "detected"
      }
    },
    "camera_info": {
      "location": "Test Location"
    }
  }'
```

## Configuration

### Alert Thresholds

Modify in `AlertService.js`:
```javascript
this.confidenceThreshold = 0.5; // 50% threshold
this.alertCooldown = 30000; // 30 seconds cooldown
```

### Audio Settings

Modify in `useNotificationAudio.js`:
```javascript
audioRef.current.volume = 0.7; // Default volume
audioRef.current.loop = true; // Continuous loop
```

## User Experience

### Alert Flow
1. **Detection**: AI model detects event with >50% confidence
2. **Backend Processing**: AlertService processes and validates alert
3. **Real-time Broadcast**: Alert sent via WebSocket to all connected users
4. **Frontend Display**: Emergency modal appears with audio alarm
5. **User Action**: User can acknowledge or dismiss alert
6. **Audio Control**: User can mute/unmute during alert
7. **History**: Alert logged in user's alert history

### Notification Channels
- **In-App Modal**: Full-screen emergency alert with audio
- **Browser Notification**: Native browser notification (if permitted)
- **Toast Notification**: Backup visual notification
- **Email**: Email sent to all logged-in users
- **Socket Events**: Real-time updates to all connected clients

## Troubleshooting

### Common Issues

1. **Audio Not Playing**
   - Check browser autoplay policies
   - Ensure user has interacted with page
   - Verify audio file exists and is accessible

2. **Alerts Not Triggering**
   - Check confidence levels (must be >50%)
   - Verify event status is "detected"
   - Check alert cooldown period
   - Ensure backend server is running

3. **No Users Receiving Alerts**
   - Verify users are logged in and active
   - Check Socket.IO connections
   - Verify user roles (responder, operator, admin)

### Debug Mode

Enable debug logging:
```javascript
// In AlertService.js
console.log('Alert processing:', alertData);

// In useEmergencyAlerts.js  
console.log('Emergency alert received:', alertData);
```

## Security Considerations

- Alerts are only sent to authenticated users
- Role-based access control for alert management
- Rate limiting via cooldown periods
- Input validation on detection data
- Secure WebSocket connections

## Future Enhancements

- SMS notifications integration
- Mobile push notifications
- Alert escalation system
- Geographic filtering
- Custom alert sounds per event type
- Alert analytics and reporting
