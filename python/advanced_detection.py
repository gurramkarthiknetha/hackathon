#!/usr/bin/env python3
"""
Advanced Real-Time Object Detection using YOLOv8
Implements sophisticated heuristics and tracking for emergency detection
"""

import cv2
import json
import time
import datetime
import numpy as np
from ultralytics import YOLO
from detection_config import TARGET_CLASSES, CLASS_MAPPING
import math
from collections import deque

class AdvancedDetector:
    """Advanced detection with tracking and heuristics"""
    
    def __init__(self):
        self.model = YOLO("yolov8n.pt")
        
        # Tracking variables
        self.person_tracks = {}  # Track people across frames
        self.frame_count = 0
        self.last_frame_time = time.time()
        
        # Detection thresholds
        self.STAMPEDE_THRESHOLD = 20  # Number of people for stampede
        self.RUNNING_SPEED_THRESHOLD = 1.5  # m/s
        self.FALL_ASPECT_RATIO_THRESHOLD = 1.3  # Lowered from 1.8 to detect more fallen people
        self.FIRE_CONFIDENCE_THRESHOLD = 0.5
        self.SMOKE_CONFIDENCE_THRESHOLD = 0.6  # Increased threshold for smoke detection
        
        # Temporal analysis windows
        self.temporal_window = deque(maxlen=5)  # 5-second window
        self.detection_history = {class_name: {"confidence": 0.0, "status": "not_detected"} 
                                 for class_name in TARGET_CLASSES}
        
        # Optical flow for motion detection
        self.prev_frame = None
        self.prev_points = None
        
        # Fire detection history for flicker analysis
        self.fire_history = deque(maxlen=10)  # Store last 10 frames
        self.flame_flicker_threshold = 0.3
        
        # Stampede detection history for temporal analysis
        self.stampede_history = deque(maxlen=5)  # Store last 5 frames
        
    def calculate_optical_flow(self, frame):
        """Calculate optical flow for motion detection"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        if self.prev_frame is None:
            self.prev_frame = gray
            return 0.0
        
        # Calculate optical flow
        flow = cv2.calcOpticalFlowFarneback(
            self.prev_frame, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0
        )
        
        # Calculate magnitude of flow
        magnitude = np.sqrt(flow[..., 0]**2 + flow[..., 1]**2)
        average_motion = np.mean(magnitude)
        
        self.prev_frame = gray
        return average_motion
    
    def detect_stampede(self, detections, motion_level):
        """Research-based optimal stampede detection using multiple criteria"""
        person_count = len([d for d in detections if d['class'] == 'person'])
        
        # Initialize stampede score
        stampede_score = 0.0
        
        # 1. Person Density Analysis (Research-based)
        if person_count >= 25:  # Critical density threshold
            stampede_score += 0.4
        elif person_count >= 20:  # High density
            stampede_score += 0.3
        elif person_count >= 15:  # Medium density
            stampede_score += 0.2
        elif person_count >= 10:  # Low density
            stampede_score += 0.1
        
        # 2. Motion Analysis (Optical Flow based)
        if motion_level > 3.0:  # Very high motion
            stampede_score += 0.3
        elif motion_level > 2.0:  # High motion
            stampede_score += 0.2
        elif motion_level > 1.5:  # Medium motion
            stampede_score += 0.1
        
        # 3. Advanced Person Distribution Analysis (Research-based)
        if person_count > 0:
            # Calculate spatial distribution of people
            person_positions = []
            for detection in detections:
                if detection['class'] == 'person':
                    bbox = detection['bbox']
                    centroid = ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
                    person_positions.append(centroid)
            
            if len(person_positions) > 1:
                # 3a. Average Distance Analysis
                total_distance = 0
                distance_count = 0
                
                for i in range(len(person_positions)):
                    for j in range(i + 1, len(person_positions)):
                        dist = math.sqrt((person_positions[i][0] - person_positions[j][0])**2 + 
                                       (person_positions[i][1] - person_positions[j][1])**2)
                        total_distance += dist
                        distance_count += 1
                
                if distance_count > 0:
                    avg_distance = total_distance / distance_count
                    
                    # Stampede: people are close together (crowded)
                    if avg_distance < 80:  # Very close (critical crowding)
                        stampede_score += 0.3
                    elif avg_distance < 120:  # Close (high crowding)
                        stampede_score += 0.2
                    elif avg_distance < 180:  # Medium crowding
                        stampede_score += 0.1
                
                # 3b. Grid-based Density Analysis (Research-based)
                frame_height, frame_width = self.current_frame.shape[:2]
                grid_size = 100  # 100x100 pixel grids
                
                # Create density grid
                grid_rows = frame_height // grid_size
                grid_cols = frame_width // grid_size
                density_grid = [[0 for _ in range(grid_cols)] for _ in range(grid_rows)]
                
                # Count people in each grid cell
                for pos in person_positions:
                    grid_x = int(pos[0] // grid_size)
                    grid_y = int(pos[1] // grid_size)
                    if 0 <= grid_x < grid_cols and 0 <= grid_y < grid_rows:
                        density_grid[grid_y][grid_x] += 1
                
                # Analyze grid density patterns
                high_density_cells = 0
                total_cells = grid_rows * grid_cols
                
                for row in density_grid:
                    for cell_count in row:
                        if cell_count >= 3:  # High density cell
                            high_density_cells += 1
                        elif cell_count >= 2:  # Medium density cell
                            high_density_cells += 0.5
                
                density_ratio = high_density_cells / total_cells
                
                if density_ratio > 0.3:  # High density ratio
                    stampede_score += 0.2
                elif density_ratio > 0.2:  # Medium density ratio
                    stampede_score += 0.1
                
                # 3c. Spatial Clustering Analysis
                # Find clusters of people (groups)
                clusters = self.find_person_clusters(person_positions, max_distance=150)
                
                if len(clusters) > 0:
                    # Calculate cluster sizes
                    cluster_sizes = [len(cluster) for cluster in clusters]
                    max_cluster_size = max(cluster_sizes)
                    
                    if max_cluster_size >= 8:  # Large cluster
                        stampede_score += 0.2
                    elif max_cluster_size >= 5:  # Medium cluster
                        stampede_score += 0.1
        
        # 4. Advanced Movement Pattern Analysis (Research-based)
        if len(self.person_tracks) > 0:
            # Analyze movement patterns
            chaotic_movement = 0
            high_velocity_count = 0
            total_tracks = len(self.person_tracks)
            
            for track_id, track in self.person_tracks.items():
                if len(track['positions']) >= 3:
                    # 4a. Direction Change Analysis
                    directions = []
                    velocities = []
                    
                    for i in range(1, len(track['positions'])):
                        dx = track['positions'][i][0] - track['positions'][i-1][0]
                        dy = track['positions'][i][1] - track['positions'][i-1][1]
                        if dx != 0 or dy != 0:
                            direction = math.atan2(dy, dx)
                            directions.append(direction)
                            
                            # Calculate velocity
                            velocity = math.sqrt(dx**2 + dy**2)
                            velocities.append(velocity)
                    
                    # Count direction changes (chaotic movement)
                    direction_changes = 0
                    for i in range(1, len(directions)):
                        angle_diff = abs(directions[i] - directions[i-1])
                        if angle_diff > math.pi/4:  # Significant direction change
                            direction_changes += 1
                    
                    if direction_changes > 2:  # Chaotic movement
                        chaotic_movement += 1
                    
                    # 4b. Velocity Analysis (Stampede: high velocity)
                    if velocities:
                        avg_velocity = sum(velocities) / len(velocities)
                        if avg_velocity > 50:  # High velocity threshold
                            high_velocity_count += 1
            
            # Calculate movement ratios
            if total_tracks > 0:
                chaotic_ratio = chaotic_movement / total_tracks
                velocity_ratio = high_velocity_count / total_tracks
                
                # Combined movement analysis
                if chaotic_ratio > 0.7 and velocity_ratio > 0.6:  # High chaotic + high velocity
                    stampede_score += 0.3
                elif chaotic_ratio > 0.5 and velocity_ratio > 0.4:  # Medium chaotic + medium velocity
                    stampede_score += 0.2
                elif chaotic_ratio > 0.3 or velocity_ratio > 0.3:  # Either chaotic or high velocity
                    stampede_score += 0.1
        
        # 5. Temporal Consistency Check
        # Add current detection to temporal window
        self.stampede_history.append({
            'person_count': person_count,
            'motion_level': motion_level,
            'stampede_score': stampede_score
        })
        
        # Analyze temporal pattern (last 5 frames)
        if len(self.stampede_history) >= 3:
            recent_scores = [h['stampede_score'] for h in list(self.stampede_history)[-3:]]
            avg_recent_score = sum(recent_scores) / len(recent_scores)
            
            # Boost score if consistently high
            if avg_recent_score > 0.5:
                stampede_score = min(stampede_score + 0.1, 1.0)
        
        # 6. Panic Behavior Analysis (Research-based)
        panic_indicators = 0
        
        # Check for sudden increase in person count
        if len(self.stampede_history) >= 2:
            recent_counts = [h['person_count'] for h in list(self.stampede_history)[-2:]]
            if len(recent_counts) >= 2:
                count_increase = recent_counts[-1] - recent_counts[0]
                if count_increase > 5:  # Sudden crowd increase
                    panic_indicators += 1
        
        # Check for sudden motion increase
        if len(self.stampede_history) >= 2:
            recent_motions = [h['motion_level'] for h in list(self.stampede_history)[-2:]]
            if len(recent_motions) >= 2:
                motion_increase = recent_motions[-1] - recent_motions[0]
                if motion_increase > 1.0:  # Sudden motion increase
                    panic_indicators += 1
        
        # Boost score for panic indicators
        if panic_indicators >= 2:
            stampede_score = min(stampede_score + 0.2, 1.0)
        elif panic_indicators >= 1:
            stampede_score = min(stampede_score + 0.1, 1.0)
        
        # 7. Research-based Thresholds with Confidence Levels
        if stampede_score >= 0.8:  # Critical stampede
            return True, stampede_score
        elif stampede_score >= 0.6:  # High confidence stampede
            return True, stampede_score
        elif stampede_score >= 0.4:  # Medium confidence stampede
            return True, stampede_score
        elif stampede_score >= 0.2:  # Low confidence stampede
            return True, stampede_score * 0.7  # Reduce confidence
        else:
            return False, 0.0
    
    def detect_running(self, person_tracks, current_time):
        """Detect running based on person movement speed"""
        running_detections = []
        
        for person_id, track in person_tracks.items():
            if len(track['positions']) < 2:
                continue
            
            # Calculate speed from recent positions
            recent_positions = track['positions'][-5:]  # Last 5 positions
            if len(recent_positions) < 2:
                continue
            
            # Calculate displacement and time
            start_pos = recent_positions[0]
            end_pos = recent_positions[-1]
            
            displacement = math.sqrt((end_pos[0] - start_pos[0])**2 + (end_pos[1] - start_pos[1])**2)
            time_elapsed = current_time - track['last_update']
            
            if time_elapsed > 0:
                speed = displacement / time_elapsed
                
                if speed > self.RUNNING_SPEED_THRESHOLD:
                    running_detections.append({
                        'person_id': person_id,
                        'speed': speed,
                        'confidence': min(speed / 3.0, 1.0)  # Normalize confidence
                    })
        
        return running_detections
    
    def detect_fallen(self, detections):
        """Detect fallen people based on bounding box aspect ratio"""
        fallen_detections = []

        for detection in detections:
            if detection['class'] == 'person':
                bbox = detection['bbox']
                width = bbox[2] - bbox[0]
                height = bbox[3] - bbox[1]

                if width > 0 and height > 0:
                    aspect_ratio = width / height

                    # Check if person is lying down (wide bounding box)
                    if aspect_ratio > self.FALL_ASPECT_RATIO_THRESHOLD:
                        # Improved confidence calculation for better sensitivity
                        # Base confidence starts at 0.6 for threshold ratio, scales up to 1.0
                        base_confidence = 0.6
                        ratio_bonus = (aspect_ratio - self.FALL_ASPECT_RATIO_THRESHOLD) * 0.4
                        confidence = min(base_confidence + ratio_bonus, 1.0)

                        fallen_detections.append({
                            'bbox': bbox,
                            'aspect_ratio': aspect_ratio,
                            'confidence': confidence
                        })

        return fallen_detections
    
    def detect_fire_smoke(self, detections):
        """Advanced fire and smoke detection using research-based methods"""
        fire_detections = []
        smoke_detections = []
        
        # Process entire frame for fire detection (not just detected objects)
        frame_hsv = cv2.cvtColor(self.current_frame, cv2.COLOR_BGR2HSV)
        
        # Research-based fire detection using multiple color ranges
        fire_masks = []
        
        # 1. Red-Orange fire colors (primary fire detection)
        lower_fire1 = np.array([0, 100, 100])    # Bright red-orange
        upper_fire1 = np.array([20, 255, 255])
        fire_mask1 = cv2.inRange(frame_hsv, lower_fire1, upper_fire1)
        fire_masks.append(fire_mask1)
        
        # 2. Yellow fire colors (flame tips)
        lower_fire2 = np.array([20, 100, 100])   # Yellow-orange
        upper_fire2 = np.array([30, 255, 255])
        fire_mask2 = cv2.inRange(frame_hsv, lower_fire2, upper_fire2)
        fire_masks.append(fire_mask2)
        
        # 3. Bright red fire colors (intense flames)
        lower_fire3 = np.array([170, 100, 100])  # Bright red
        upper_fire3 = np.array([180, 255, 255])
        fire_mask3 = cv2.inRange(frame_hsv, lower_fire3, upper_fire3)
        fire_masks.append(fire_mask3)
        
        # Combine all fire masks
        combined_fire_mask = np.zeros_like(fire_mask1)
        for mask in fire_masks:
            combined_fire_mask = cv2.bitwise_or(combined_fire_mask, mask)
        
        # Advanced fire detection using morphological operations
        kernel = np.ones((5,5), np.uint8)
        fire_mask_processed = cv2.morphologyEx(combined_fire_mask, cv2.MORPH_CLOSE, kernel)
        fire_mask_processed = cv2.morphologyEx(fire_mask_processed, cv2.MORPH_OPEN, kernel)
        
        # Find fire contours
        fire_contours, _ = cv2.findContours(fire_mask_processed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in fire_contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Minimum fire area threshold
                x, y, w, h = cv2.boundingRect(contour)
                bbox = [x, y, x + w, y + h]
                
                # Calculate fire characteristics
                fire_ratio = area / (w * h)
                aspect_ratio = w / h if h > 0 else 0
                
                # Research-based fire validation
                fire_confidence = self.validate_fire_detection(frame_hsv, x, y, w, h, fire_ratio, aspect_ratio)
                
                if fire_confidence > self.FIRE_CONFIDENCE_THRESHOLD:
                    fire_detections.append({
                        'bbox': bbox,
                        'color_ratio': fire_ratio,
                        'confidence': fire_confidence,
                        'area': area,
                        'aspect_ratio': aspect_ratio
                    })
        
        # Advanced smoke detection with stricter criteria
        # 1. Light gray smoke detection (more restrictive)
        lower_smoke1 = np.array([0, 0, 120])    # Brighter gray
        upper_smoke1 = np.array([180, 25, 180]) # Lower saturation
        smoke_mask1 = cv2.inRange(frame_hsv, lower_smoke1, upper_smoke1)
        
        # 2. Dark gray smoke detection (more restrictive)
        lower_smoke2 = np.array([0, 0, 60])     # Darker gray
        upper_smoke2 = np.array([180, 40, 140]) # Lower saturation
        smoke_mask2 = cv2.inRange(frame_hsv, lower_smoke2, upper_smoke2)
        
        # 3. Very light smoke detection (for thin smoke)
        lower_smoke3 = np.array([0, 0, 140])    # Very light gray
        upper_smoke3 = np.array([180, 20, 200]) # Very low saturation
        smoke_mask3 = cv2.inRange(frame_hsv, lower_smoke3, upper_smoke3)
        
        # Combine smoke masks
        combined_smoke_mask = cv2.bitwise_or(smoke_mask1, smoke_mask2)
        combined_smoke_mask = cv2.bitwise_or(combined_smoke_mask, smoke_mask3)
        
        # Process smoke mask
        smoke_mask_processed = cv2.morphologyEx(combined_smoke_mask, cv2.MORPH_CLOSE, kernel)
        smoke_mask_processed = cv2.morphologyEx(smoke_mask_processed, cv2.MORPH_OPEN, kernel)
        
        # Find smoke contours
        smoke_contours, _ = cv2.findContours(smoke_mask_processed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in smoke_contours:
            area = cv2.contourArea(contour)
            if area > 500:  # Increased minimum smoke area threshold
                x, y, w, h = cv2.boundingRect(contour)
                bbox = [x, y, x + w, y + h]
                
                # Calculate smoke characteristics
                smoke_ratio = area / (w * h)
                aspect_ratio = w / h if h > 0 else 0
                
                # Additional smoke validation checks
                if aspect_ratio < 0.3 or aspect_ratio > 3.0:  # Smoke should be reasonably shaped
                    continue
                
                if smoke_ratio < 0.4:  # Smoke should fill most of its bounding box
                    continue
                
                # Research-based smoke validation
                smoke_confidence = self.validate_smoke_detection(frame_hsv, x, y, w, h, smoke_ratio, aspect_ratio)
                
                if smoke_confidence > self.SMOKE_CONFIDENCE_THRESHOLD:
                    smoke_detections.append({
                        'bbox': bbox,
                        'color_ratio': smoke_ratio,
                        'confidence': smoke_confidence,
                        'area': area,
                        'aspect_ratio': aspect_ratio
                    })
        
        return fire_detections, smoke_detections
    
    def validate_fire_detection(self, hsv_frame, x, y, w, h, fire_ratio, aspect_ratio):
        """Research-based fire validation using multiple criteria"""
        roi = hsv_frame[y:y+h, x:x+w]
        if roi.size == 0:
            return 0.0
        
        # 1. Color distribution analysis
        h_channel = roi[:, :, 0]
        s_channel = roi[:, :, 1]
        v_channel = roi[:, :, 2]
        
        # Calculate color statistics
        h_mean = np.mean(h_channel)
        s_mean = np.mean(s_channel)
        v_mean = np.mean(v_channel)
        
        # 2. Fire color validation (research-based thresholds)
        fire_score = 0.0
        
        # Hue validation (fire colors: 0-30 and 170-180)
        if (0 <= h_mean <= 30) or (170 <= h_mean <= 180):
            fire_score += 0.3
        
        # Saturation validation (fire has high saturation)
        if s_mean > 100:
            fire_score += 0.2
        
        # Value validation (fire is bright)
        if v_mean > 150:
            fire_score += 0.2
        
        # 3. Shape analysis (fire tends to be irregular)
        if 0.5 < aspect_ratio < 2.0:
            fire_score += 0.1
        
        # 4. Area ratio validation
        if fire_ratio > 0.2:
            fire_score += 0.2
        
        # 5. Temporal consistency (if available)
        # This would require frame history - simplified for now
        fire_score += 0.1
        
        return min(fire_score, 1.0)
    
    def validate_smoke_detection(self, hsv_frame, x, y, w, h, smoke_ratio, aspect_ratio):
        """Research-based smoke validation using multiple criteria"""
        roi = hsv_frame[y:y+h, x:x+w]
        if roi.size == 0:
            return 0.0
        
        # 1. Color distribution analysis
        h_channel = roi[:, :, 0]
        s_channel = roi[:, :, 1]
        v_channel = roi[:, :, 2]
        
        # Calculate color statistics
        h_mean = np.mean(h_channel)
        s_mean = np.mean(s_channel)
        v_mean = np.mean(v_channel)
        
        # 2. Smoke color validation (stricter research-based thresholds)
        smoke_score = 0.0
        
        # Hue validation (smoke is grayish - very low saturation)
        if s_mean < 30:  # Much stricter saturation requirement
            smoke_score += 0.3
        elif s_mean < 50:
            smoke_score += 0.1  # Lower score for higher saturation
        
        # Value validation (smoke has specific brightness range)
        if 80 < v_mean < 180:  # More restrictive brightness range
            smoke_score += 0.2
        elif 60 < v_mean < 200:
            smoke_score += 0.1
        
        # 3. Shape analysis (smoke tends to be vertical/irregular)
        if 0.8 < aspect_ratio < 2.5:  # More restrictive aspect ratio
            smoke_score += 0.2
        elif aspect_ratio > 0.8:
            smoke_score += 0.1
        
        # 4. Area ratio validation (stricter)
        if smoke_ratio > 0.5:  # Higher ratio requirement
            smoke_score += 0.2
        elif smoke_ratio > 0.3:
            smoke_score += 0.1
        
        # 5. Texture analysis (smoke has very soft edges)
        # Calculate edge density
        gray_roi = cv2.cvtColor(roi, cv2.COLOR_HSV2BGR)
        gray_roi = cv2.cvtColor(gray_roi, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray_roi, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        if edge_density < 0.05:  # Much stricter edge requirement
            smoke_score += 0.2
        elif edge_density < 0.1:
            smoke_score += 0.1
        
        # 6. Additional validation: check for uniform color distribution
        # Smoke should have relatively uniform color
        s_std = np.std(s_channel)
        v_std = np.std(v_channel)
        
        if s_std < 15 and v_std < 25:  # Low color variation
            smoke_score += 0.1
        
        return min(smoke_score, 1.0)
    
    def find_person_clusters(self, positions, max_distance=150):
        """Find clusters of people using distance-based clustering"""
        if len(positions) < 2:
            return []
        
        clusters = []
        visited = set()
        
        for i, pos in enumerate(positions):
            if i in visited:
                continue
            
            # Start new cluster
            cluster = [pos]
            visited.add(i)
            
            # Find all nearby positions
            for j, other_pos in enumerate(positions):
                if j in visited:
                    continue
                
                distance = math.sqrt((pos[0] - other_pos[0])**2 + (pos[1] - other_pos[1])**2)
                if distance <= max_distance:
                    cluster.append(other_pos)
                    visited.add(j)
            
            if len(cluster) > 1:  # Only add clusters with multiple people
                clusters.append(cluster)
        
        return clusters
    
    def detect_flame_flicker(self, fire_detections):
        """Research-based flame flicker detection for improved fire validation"""
        if len(self.fire_history) < 5:  # Need at least 5 frames
            return fire_detections
        
        # Calculate flicker score based on temporal variation
        flicker_scores = []
        
        for fire_det in fire_detections:
            bbox = fire_det['bbox']
            x, y, w, h = bbox[0], bbox[1], bbox[2] - bbox[0], bbox[3] - bbox[1]
            
            # Calculate flicker in this region over time
            flicker_score = 0.0
            
            if len(self.fire_history) >= 3:
                # Compare with previous frames
                prev_frames = list(self.fire_history)[-3:]
                
                for prev_frame in prev_frames:
                    if prev_frame is not None:
                        # Extract same region from previous frame
                        if (y + h <= prev_frame.shape[0] and x + w <= prev_frame.shape[1]):
                            prev_roi = prev_frame[y:y+h, x:x+w]
                            curr_roi = self.current_frame[y:y+h, x:x+w]
                            
                            if prev_roi.size > 0 and curr_roi.size > 0:
                                # Calculate intensity variation (flicker)
                                prev_gray = cv2.cvtColor(prev_roi, cv2.COLOR_BGR2GRAY)
                                curr_gray = cv2.cvtColor(curr_roi, cv2.COLOR_BGR2GRAY)
                                
                                intensity_diff = np.mean(np.abs(curr_gray.astype(float) - prev_gray.astype(float)))
                                flicker_score += intensity_diff / 255.0
            
            # Normalize flicker score
            flicker_score = min(flicker_score / 3.0, 1.0)
            flicker_scores.append(flicker_score)
            
            # Boost confidence if flicker is detected (characteristic of real fire)
            if flicker_score > self.flame_flicker_threshold:
                fire_det['confidence'] = min(fire_det['confidence'] + 0.2, 1.0)
                fire_det['flicker_score'] = flicker_score
        
        return fire_detections
    
    def update_person_tracking(self, detections, current_time):
        """Update person tracking across frames"""
        current_persons = []
        
        for detection in detections:
            if detection['class'] == 'person':
                bbox = detection['bbox']
                centroid = ((bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2)
                current_persons.append({
                    'bbox': bbox,
                    'centroid': centroid,
                    'confidence': detection['confidence']
                })
        
        # Simple tracking: associate detections with existing tracks
        for person in current_persons:
            best_match = None
            best_distance = float('inf')
            
            for track_id, track in self.person_tracks.items():
                if len(track['positions']) > 0:
                    last_pos = track['positions'][-1]
                    distance = math.sqrt((person['centroid'][0] - last_pos[0])**2 + 
                                      (person['centroid'][1] - last_pos[1])**2)
                    
                    if distance < 50 and distance < best_distance:  # 50 pixel threshold
                        best_match = track_id
                        best_distance = distance
            
            if best_match is not None:
                # Update existing track
                self.person_tracks[best_match]['positions'].append(person['centroid'])
                self.person_tracks[best_match]['last_update'] = current_time
            else:
                # Create new track
                track_id = len(self.person_tracks)
                self.person_tracks[track_id] = {
                    'positions': [person['centroid']],
                    'last_update': current_time
                }
    
    def process_frame(self, frame):
        """Process a single frame with advanced detection"""
        self.current_frame = frame
        current_time = time.time()
        
        # Calculate optical flow for motion detection
        motion_level = self.calculate_optical_flow(frame)
        
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
                                'class': 'person',  # Simplified for demo
                                'bbox': bbox,
                                'confidence': confidence,
                                'class_id': class_id
                            })
        
        # Update person tracking
        self.update_person_tracking(detections, current_time)
        
        # Advanced detections
        stampede_detected, stampede_conf = self.detect_stampede(detections, motion_level)
        running_detections = self.detect_running(self.person_tracks, current_time)
        fallen_detections = self.detect_fallen(detections)
        fire_detections, smoke_detections = self.detect_fire_smoke(detections)
        
        # Apply flame flicker detection for improved fire validation
        fire_detections = self.detect_flame_flicker(fire_detections)
        
        # Update fire history for temporal analysis
        self.fire_history.append(self.current_frame.copy())
        
        # Update detection history with proper float conversion
        self.detection_history['stampede'] = {
            'confidence': float(stampede_conf),
            'status': 'detected' if stampede_detected else 'not_detected'
        }
        
        self.detection_history['running'] = {
            'confidence': float(max([d['confidence'] for d in running_detections], default=0.0)),
            'status': 'detected' if running_detections else 'not_detected'
        }
        
        self.detection_history['fallen'] = {
            'confidence': float(max([d['confidence'] for d in fallen_detections], default=0.0)),
            'status': 'detected' if fallen_detections else 'not_detected'
        }
        
        self.detection_history['fire'] = {
            'confidence': float(max([d['confidence'] for d in fire_detections], default=0.0)),
            'status': 'detected' if fire_detections else 'not_detected'
        }
        
        self.detection_history['smoke'] = {
            'confidence': float(max([d['confidence'] for d in smoke_detections], default=0.0)),
            'status': 'detected' if smoke_detections else 'not_detected'
        }
        
        # Medical emergency detection (simplified for now)
        self.detection_history['medical emergency'] = {
            'confidence': 0.0,  # Placeholder for medical emergency detection
            'status': 'not_detected'
        }
        
        # Add temporal analysis
        self.temporal_window.append({
            'stampede': stampede_detected,
            'running': len(running_detections) > 0,
            'fallen': len(fallen_detections) > 0,
            'fire': len(fire_detections) > 0,
            'smoke': len(smoke_detections) > 0,
            'medical emergency': False  # Placeholder
        })
        
        # Apply temporal filtering (require detection in multiple frames)
        if len(self.temporal_window) >= 3:
            recent_detections = list(self.temporal_window)[-3:]

            # Different temporal requirements for different event types
            for event_type in ['stampede', 'running', 'fallen', 'fire', 'smoke', 'medical emergency']:
                # Fallen detection is more responsive - only needs 1 detection in recent frames
                required_detections = 1 if event_type == 'fallen' else 2
                if sum(1 for frame in recent_detections if frame[event_type]) >= required_detections:
                    if self.detection_history[event_type]['confidence'] > 0:
                        self.detection_history[event_type]['status'] = 'detected'
        
        return results[0].plot() if results else frame

def main():
    """Main function for advanced detection"""
    print("🚀 Starting Advanced Real-Time Detection")
    print("=" * 50)
    
    # Initialize detector
    detector = AdvancedDetector()
    
    # Ask user for camera number
    print("🔍 Please select camera number:")
    print("0 - Default camera")
    print("1 - External camera")
    print("2 - Additional camera")
    
    while True:
        try:
            camera_input = input("Enter camera number (0, 1, or 2): ").strip()
            camera_source = int(camera_input)
            
            if camera_source in [0, 1, 2]:
                # Test the selected camera
                cap = cv2.VideoCapture(camera_source)
                if cap.isOpened():
                    ret, frame = cap.read()
                    if ret:
                        cap.release()
                        print(f"✅ Camera {camera_source} is working!")
                        break
                    else:
                        print(f"❌ Camera {camera_source} cannot read frames")
                        cap.release()
                else:
                    print(f"❌ Camera {camera_source} is not available")
            else:
                print("❌ Please enter 0, 1, or 2")
        except ValueError:
            print("❌ Please enter a valid number (0, 1, or 2)")
    
    print(f"🎥 Using camera {camera_source}")
    
    # Initialize video capture
    cap = cv2.VideoCapture(camera_source)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    last_log_time = time.time()
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame with advanced detection
            annotated_frame = detector.process_frame(frame)
            
            # Log every second
            current_time = time.time()
            if current_time - last_log_time >= 1.0:
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                log_entry = {
                    "timestamp": timestamp,
                    "events": detector.detection_history.copy()
                }
                print(json.dumps(log_entry, indent=2))
                
                # Save to file
                try:
                    with open("advanced_activity_log.jsonl", "a", encoding="utf-8") as f:
                        f.write(json.dumps(log_entry) + '\n')
                except Exception as e:
                    print(f"Error writing to log file: {e}")
                
                last_log_time = current_time
            
            # Show video
            cv2.imshow('Advanced Detection', annotated_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
    except KeyboardInterrupt:
        print("\n⏹️  Detection stopped by user")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("✅ Advanced detection stopped")

if __name__ == "__main__":
    main() 