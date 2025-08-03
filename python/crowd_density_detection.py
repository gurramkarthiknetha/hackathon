#!/usr/bin/env python3
"""
Crowd Density Detection Module
Detects stampede and overcrowding using density analysis
"""

import cv2
import numpy as np
import math
from collections import deque
import scipy.spatial.distance as distance

class CrowdDensityDetector:
    """Advanced crowd density and stampede detection"""
    
    def __init__(self):
        # Crowd density parameters
        self.critical_density_threshold = 0.8  # Critical crowd density
        self.high_density_threshold = 0.6      # High crowd density
        self.medium_density_threshold = 0.4    # Medium crowd density
        
        # Stampede detection parameters
        self.stampede_motion_threshold = 2.0   # High motion threshold
        self.chaotic_movement_threshold = 0.7  # Chaotic movement ratio
        self.velocity_threshold = 50.0         # High velocity threshold
        
        # Grid-based analysis
        self.grid_size = 100  # Grid cell size in pixels
        self.max_person_distance = 150  # Maximum distance for clustering
        
        # Temporal analysis
        self.density_history = deque(maxlen=10)
        self.motion_history = deque(maxlen=10)
        self.stampede_history = deque(maxlen=5)
        
        # Optical flow for motion detection
        self.prev_frame = None
        
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
    
    def analyze_person_distribution(self, person_bboxes, frame_shape):
        """Analyze spatial distribution of people"""
        if len(person_bboxes) < 2:
            return {
                'density_score': 0.0,
                'clustering_score': 0.0,
                'spread_score': 0.0
            }
        
        # Calculate person centroids
        centroids = []
        for bbox in person_bboxes:
            x1, y1, x2, y2 = bbox
            centroid = ((x1 + x2) / 2, (y1 + y2) / 2)
            centroids.append(centroid)
        
        # 1. Density Analysis
        frame_area = frame_shape[0] * frame_shape[1]
        person_area = sum([(bbox[2] - bbox[0]) * (bbox[3] - bbox[1]) for bbox in person_bboxes])
        density_ratio = person_area / frame_area
        density_score = min(density_ratio * 10, 1.0)  # Normalize
        
        # 2. Clustering Analysis
        clustering_score = 0.0
        if len(centroids) > 1:
            # Calculate pairwise distances
            distances = []
            for i in range(len(centroids)):
                for j in range(i + 1, len(centroids)):
                    dist = math.sqrt((centroids[i][0] - centroids[j][0])**2 + 
                                   (centroids[i][1] - centroids[j][1])**2)
                    distances.append(dist)
            
            # Calculate average distance
            avg_distance = sum(distances) / len(distances)
            
            # Clustering score (closer people = higher score)
            clustering_score = max(0, 1.0 - (avg_distance / self.max_person_distance))
        
        # 3. Spatial Spread Analysis
        spread_score = 0.0
        if len(centroids) > 1:
            # Calculate bounding box of all people
            x_coords = [c[0] for c in centroids]
            y_coords = [c[1] for c in centroids]
            
            spread_width = max(x_coords) - min(x_coords)
            spread_height = max(y_coords) - min(y_coords)
            spread_area = spread_width * spread_height
            
            # Spread ratio (how spread out people are)
            spread_ratio = spread_area / frame_area
            spread_score = min(spread_ratio * 5, 1.0)  # Normalize
        
        return {
            'density_score': density_score,
            'clustering_score': clustering_score,
            'spread_score': spread_score
        }
    
    def analyze_movement_patterns(self, person_bboxes, motion_level):
        """Analyze movement patterns for stampede detection"""
        if len(person_bboxes) < 3:
            return {
                'motion_score': 0.0,
                'chaotic_score': 0.0,
                'velocity_score': 0.0
            }
        
        # 1. Motion Level Analysis
        motion_score = min(motion_level / self.stampede_motion_threshold, 1.0)
        
        # 2. Chaotic Movement Analysis
        chaotic_score = 0.0
        if len(person_bboxes) > 2:
            # Calculate movement directions
            directions = []
            for i in range(len(person_bboxes) - 1):
                bbox1 = person_bboxes[i]
                bbox2 = person_bboxes[i + 1]
                
                center1 = ((bbox1[0] + bbox1[2]) / 2, (bbox1[1] + bbox1[3]) / 2)
                center2 = ((bbox2[0] + bbox2[2]) / 2, (bbox2[1] + bbox2[3]) / 2)
                
                direction = math.atan2(center2[1] - center1[1], center2[0] - center1[0])
                directions.append(direction)
            
            # Calculate direction changes (chaotic movement)
            direction_changes = 0
            for i in range(1, len(directions)):
                angle_diff = abs(directions[i] - directions[i-1])
                if angle_diff > math.pi/4:  # Significant direction change
                    direction_changes += 1
            
            chaotic_score = min(direction_changes / len(directions), 1.0)
        
        # 3. Velocity Analysis
        velocity_score = 0.0
        if len(person_bboxes) > 1:
            # Calculate average velocity
            velocities = []
            for i in range(len(person_bboxes) - 1):
                bbox1 = person_bboxes[i]
                bbox2 = person_bboxes[i + 1]
                
                center1 = ((bbox1[0] + bbox1[2]) / 2, (bbox1[1] + bbox1[3]) / 2)
                center2 = ((bbox2[0] + bbox2[2]) / 2, (bbox2[1] + bbox2[3]) / 2)
                
                velocity = math.sqrt((center2[0] - center1[0])**2 + (center2[1] - center1[1])**2)
                velocities.append(velocity)
            
            avg_velocity = sum(velocities) / len(velocities)
            velocity_score = min(avg_velocity / self.velocity_threshold, 1.0)
        
        return {
            'motion_score': motion_score,
            'chaotic_score': chaotic_score,
            'velocity_score': velocity_score
        }
    
    def grid_based_density_analysis(self, person_bboxes, frame_shape):
        """Grid-based density analysis for crowd detection"""
        h, w = frame_shape[:2]
        grid_rows = h // self.grid_size
        grid_cols = w // self.grid_size
        
        # Initialize density grid
        density_grid = [[0 for _ in range(grid_cols)] for _ in range(grid_rows)]
        
        # Count people in each grid cell
        for bbox in person_bboxes:
            x1, y1, x2, y2 = bbox
            center_x = (x1 + x2) / 2
            center_y = (y1 + y2) / 2
            
            grid_x = int(center_x // self.grid_size)
            grid_y = int(center_y // self.grid_size)
            
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
        
        return {
            'grid_density_ratio': density_ratio,
            'high_density_cells': high_density_cells,
            'total_cells': total_cells
        }
    
    def detect_stampede(self, person_bboxes, motion_level, frame_shape):
        """Detect stampede using multiple criteria"""
        if len(person_bboxes) < 5:  # Need minimum people for stampede
            return {
                'detected': False,
                'confidence': 0.0,
                'type': 'none'
            }
        
        # 1. Distribution Analysis
        distribution = self.analyze_person_distribution(person_bboxes, frame_shape)
        
        # 2. Movement Analysis
        movement = self.analyze_movement_patterns(person_bboxes, motion_level)
        
        # 3. Grid-based Analysis
        grid_analysis = self.grid_based_density_analysis(person_bboxes, frame_shape)
        
        # 4. Calculate stampede score
        stampede_score = 0.0
        
        # Density component
        density_component = (distribution['density_score'] * 0.3 + 
                           distribution['clustering_score'] * 0.2 + 
                           grid_analysis['grid_density_ratio'] * 0.3)
        stampede_score += density_component * 0.4
        
        # Motion component
        motion_component = (movement['motion_score'] * 0.4 + 
                          movement['chaotic_score'] * 0.3 + 
                          movement['velocity_score'] * 0.3)
        stampede_score += motion_component * 0.4
        
        # Person count component
        person_count_score = min(len(person_bboxes) / 20.0, 1.0)
        stampede_score += person_count_score * 0.2
        
        # 5. Temporal consistency
        self.stampede_history.append(stampede_score)
        if len(self.stampede_history) >= 3:
            recent_scores = list(self.stampede_history)[-3:]
            avg_score = sum(recent_scores) / len(recent_scores)
            
            # Boost score if consistently high
            if avg_score > 0.5:
                stampede_score = min(stampede_score + 0.2, 1.0)
        
        # 6. Determine stampede type
        stampede_type = 'none'
        if stampede_score > 0.8:
            stampede_type = 'critical_stampede'
        elif stampede_score > 0.6:
            stampede_type = 'high_stampede'
        elif stampede_score > 0.4:
            stampede_type = 'medium_stampede'
        elif stampede_score > 0.2:
            stampede_type = 'low_stampede'
        
        return {
            'detected': stampede_score > 0.4,
            'confidence': stampede_score,
            'type': stampede_type,
            'density_score': distribution['density_score'],
            'motion_score': movement['motion_score'],
            'person_count': len(person_bboxes)
        }
    
    def process_frame(self, frame, person_bboxes):
        """Process frame for crowd density and stampede detection"""
        # Calculate optical flow
        motion_level = self.calculate_optical_flow(frame)
        
        # Detect stampede
        stampede_result = self.detect_stampede(person_bboxes, motion_level, frame.shape)
        
        # Update history
        self.density_history.append(stampede_result.get('density_score', 0.0))
        self.motion_history.append(motion_level)
        
        return {
            'stampede_detected': stampede_result['detected'],
            'stampede_confidence': stampede_result['confidence'],
            'stampede_type': stampede_result['type'],
            'motion_level': motion_level,
            'person_count': len(person_bboxes),
            'density_score': stampede_result.get('density_score', 0.0),
            'motion_score': stampede_result.get('motion_score', 0.0)
        }
    
    def draw_crowd_analysis(self, frame, results):
        """Draw crowd analysis on frame"""
        annotated_frame = frame.copy()
        
        # Draw crowd statistics
        stats_text = [
            f"People: {results['person_count']}",
            f"Density: {results['density_score']:.2f}",
            f"Motion: {results['motion_level']:.2f}",
            f"Stampede: {results['stampede_type']}"
        ]
        
        for i, text in enumerate(stats_text):
            cv2.putText(annotated_frame, text, (10, 30 + i * 25),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Draw stampede alert
        if results['stampede_detected']:
            alert_text = f"STAMPEDE ALERT: {results['stampede_confidence']:.2f}"
            cv2.putText(annotated_frame, alert_text, (10, 150),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 3)
        
        return annotated_frame

# Example usage
if __name__ == "__main__":
    # Test crowd density detector
    detector = CrowdDensityDetector()
    print("✅ Crowd Density Detection Module initialized")
    print("Features:")
    print("- Grid-based density analysis")
    print("- Movement pattern analysis")
    print("- Optical flow motion detection")
    print("- Spatial distribution analysis")
    print("- Temporal consistency checking")
    print("- Multi-criteria stampede detection") 