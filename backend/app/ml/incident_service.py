#!/usr/bin/env python3
"""
Incident Service for creating incidents from YOLO detection results
Integrates with the backend API to create incidents when emergencies are detected
"""

import requests
import json
import time
import datetime
from typing import Dict, List, Any
import os
from dotenv import load_dotenv

load_dotenv()

class IncidentService:
    def __init__(self):
        self.backend_url = os.getenv('BACKEND_URL', 'http://localhost:5000/api')
        self.incident_thresholds = {
            'fire': 0.8,
            'smoke': 0.7,
            'stampede': 0.9,
            'medical emergency': 0.7,
            'fallen': 0.6  # Lowered threshold to improve fallen detection sensitivity
        }
        self.recent_incidents = {}  # Track recent incidents to avoid duplicates
        self.incident_cooldown = 600  # 10 minutes cooldown between similar incidents
        
    def should_create_incident(self, detection_type: str, confidence: float, camera_id: str) -> bool:
        """Determine if an incident should be created based on detection"""

        # Don't create incidents for regular person detection
        if detection_type == 'person':
            return False

        # Check confidence threshold
        if confidence < self.incident_thresholds.get(detection_type, 0.5):
            return False

        # Check cooldown period
        incident_key = f"{camera_id}_{detection_type}"
        current_time = time.time()

        if incident_key in self.recent_incidents:
            last_incident_time = self.recent_incidents[incident_key]
            if current_time - last_incident_time < self.incident_cooldown:
                return False

        return True
        
    def create_incident(self, detection_data: Dict[str, Any], camera_info: Dict[str, Any]) -> bool:
        """Create an incident from detection data"""
        
        try:
            # Determine incident type and severity
            incident_type = self.map_detection_to_incident_type(detection_data)
            severity = self.determine_severity(detection_data)
            
            # Prepare incident data
            incident_payload = {
                'type': incident_type,
                'zone': camera_info.get('zone', 'unknown_zone'),
                'location': camera_info.get('location', 'Unknown Location'),
                'severity': severity,
                'confidence': detection_data.get('confidence', 0.0),
                'description': self.generate_description(detection_data, camera_info),
                'videoSnapshot': f"camera_{camera_info.get('id', 'unknown')}_{int(time.time())}",
                'boundingBoxes': self.format_bounding_boxes(detection_data.get('raw_detections', [])),
                'humanApprovalRequired': self.requires_human_approval(incident_type, detection_data.get('confidence', 0.0))
            }
            
            # Send to backend API
            response = requests.post(
                f"{self.backend_url}/monitoring/incidents",
                json=incident_payload,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 201:
                print(f"Incident created successfully: {incident_type} in {camera_info.get('zone')}")
                
                # Update recent incidents tracker
                incident_key = f"{camera_info.get('id')}_{detection_data.get('label', incident_type)}"
                self.recent_incidents[incident_key] = time.time()
                
                return True
            else:
                print(f"Failed to create incident: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Error creating incident: {e}")
            return False
            
    def map_detection_to_incident_type(self, detection_data: Dict[str, Any]) -> str:
        """Map detection type to incident type"""
        detection_type = detection_data.get('label', '').lower()
        
        mapping = {
            'fire': 'fire',
            'smoke': 'fire',  # Smoke often indicates fire
            'stampede': 'crowd_control',
            'medical emergency': 'medical_emergency',
            'fallen': 'medical_emergency',  # Fallen person could be medical
            'running': 'security_threat'  # Running could indicate security issue
        }
        
        return mapping.get(detection_type, 'other')
        
    def determine_severity(self, detection_data: Dict[str, Any]) -> str:
        """Determine incident severity based on detection data"""
        confidence = detection_data.get('confidence', 0.0)
        detection_type = detection_data.get('label', '').lower()
        
        # High-risk detections
        if detection_type in ['fire', 'stampede']:
            if confidence > 0.8:
                return 'critical'
            elif confidence > 0.6:
                return 'high'
            else:
                return 'medium'
                
        # Medium-risk detections
        elif detection_type in ['smoke', 'medical emergency']:
            if confidence > 0.7:
                return 'high'
            elif confidence > 0.5:
                return 'medium'
            else:
                return 'low'
                
        # Lower-risk detections
        else:
            if confidence > 0.8:
                return 'medium'
            else:
                return 'low'
                
    def generate_description(self, detection_data: Dict[str, Any], camera_info: Dict[str, Any]) -> str:
        """Generate incident description"""
        detection_type = detection_data.get('label', 'Unknown')
        confidence = detection_data.get('confidence', 0.0)
        camera_name = camera_info.get('name', 'Unknown Camera')
        location = camera_info.get('location', 'Unknown Location')
        
        description = f"AI Detection: {detection_type.title()} detected by {camera_name} "
        description += f"at {location} with {confidence:.1%} confidence. "
        
        # Add specific details based on detection type
        if detection_type.lower() == 'fire':
            description += "Immediate evacuation and fire suppression may be required."
        elif detection_type.lower() == 'smoke':
            description += "Potential fire hazard detected. Investigation recommended."
        elif detection_type.lower() == 'stampede':
            description += "Crowd control measures may be needed immediately."
        elif detection_type.lower() == 'medical emergency':
            description += "Medical assistance may be required."
        elif detection_type.lower() == 'fallen':
            description += "Person appears to have fallen. Medical check recommended."
            
        return description
        
    def format_bounding_boxes(self, raw_detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format bounding boxes for incident storage"""
        formatted_boxes = []
        
        for detection in raw_detections:
            if 'bbox' in detection:
                bbox = detection['bbox']
                formatted_box = {
                    'x': bbox[0],
                    'y': bbox[1], 
                    'width': bbox[2],
                    'height': bbox[3],
                    'label': detection.get('label', 'Unknown'),
                    'confidence': detection.get('confidence', 0.0)
                }
                formatted_boxes.append(formatted_box)
                
        return formatted_boxes
        
    def requires_human_approval(self, incident_type: str, confidence: float) -> bool:
        """Determine if incident requires human approval"""
        
        # High-risk incidents always require approval
        high_risk_types = ['fire', 'medical_emergency', 'security_threat']
        if incident_type in high_risk_types:
            return True
            
        # Low confidence detections require approval
        if confidence < 0.7:
            return True
            
        return False
        
    def process_detection_update(self, detection_data: Dict[str, Any]) -> None:
        """Process a detection update and create incidents if necessary"""

        # Temporarily disabled to prevent rate limiting
        return

        camera_id = detection_data.get('camera_id')
        camera_info = detection_data.get('camera_info', {})
        events = detection_data.get('events', {})
        raw_detections = detection_data.get('raw_detections', [])
        
        # Check each event type for incident creation
        for event_type, event_data in events.items():
            if event_data.get('status') == 'detected':
                confidence = event_data.get('confidence', 0.0)
                
                if self.should_create_incident(event_type, confidence, camera_id):
                    # Create detection data for incident
                    incident_detection_data = {
                        'label': event_type,
                        'confidence': confidence,
                        'raw_detections': [d for d in raw_detections if d.get('label') == event_type]
                    }
                    
                    self.create_incident(incident_detection_data, camera_info)
                    
    def cleanup_old_incidents(self) -> None:
        """Clean up old incident tracking data"""
        current_time = time.time()
        cutoff_time = current_time - (self.incident_cooldown * 2)  # Keep data for 2x cooldown period
        
        keys_to_remove = []
        for key, timestamp in self.recent_incidents.items():
            if timestamp < cutoff_time:
                keys_to_remove.append(key)
                
        for key in keys_to_remove:
            del self.recent_incidents[key]

# Global incident service instance
incident_service = IncidentService()
