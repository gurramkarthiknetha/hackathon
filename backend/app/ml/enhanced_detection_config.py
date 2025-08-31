#!/usr/bin/env python3
"""
Enhanced Detection Configuration
Configuration settings for the enhanced multimodal detection system
"""

# YOLO Detection Classes
TARGET_CLASSES = [
    "stampede", "running", "fallen", "fire", "smoke", 
    "medical emergency", "crowd_density", "audio_distress"
]

CLASS_MAPPING = {
    0: "person",
    1: "bicycle", 
    2: "car",
    3: "motorcycle",
    4: "airplane",
    5: "bus",
    6: "train",
    7: "truck",
    8: "boat",
    9: "traffic light",
    # ... (standard COCO classes)
}

# Enhanced Detection Thresholds
DETECTION_THRESHOLDS = {
    # YOLO-based thresholds
    'person_confidence': 0.3,
    'stampede_person_count': 15,
    'running_speed': 1.2,  # m/s
    'fallen_aspect_ratio': 1.3,
    
    # Fire/Smoke detection thresholds
    'fire_confidence': 0.4,
    'smoke_confidence': 0.5,
    'fire_color_threshold': 0.3,
    'smoke_color_threshold': 0.4,
    
    # Audio detection thresholds
    'audio_distress': 0.6,
    'audio_fire': 0.5,
    'audio_panic': 0.7,
    
    # Pose detection thresholds
    'pose_emergency': 0.3,
    'pose_fallen': 0.4,
    
    # Crowd analysis thresholds
    'crowd_density_high': 0.7,
    'crowd_motion_high': 2.0,
    
    # Fusion thresholds
    'fusion_stampede': 0.3,
    'fusion_medical': 0.25,
    'fusion_fire': 0.3,
    'fusion_smoke': 0.4,
    'fusion_fallen': 0.2,
    'fusion_running': 0.3
}

# Multi-modal Fusion Weights
FUSION_WEIGHTS = {
    'yolo': 0.3,        # YOLO object detection weight
    'pose': 0.2,        # Pose detection weight
    'fire_smoke': 0.2,  # Fire/smoke CNN detection weight
    'crowd': 0.2,       # Crowd density analysis weight
    'audio': 0.1        # Audio detection weight
}

# Temporal Analysis Settings
TEMPORAL_SETTINGS = {
    'window_size': 10,          # Number of frames to analyze
    'min_detection_frames': 3,  # Minimum frames for positive detection
    'confidence_decay': 0.9,    # Confidence decay factor over time
    'temporal_smoothing': True  # Enable temporal smoothing
}

# Camera and Video Settings
VIDEO_SETTINGS = {
    'default_camera': 0,
    'frame_width': 640,
    'frame_height': 480,
    'fps': 30,
    'buffer_size': 1
}

# Audio Processing Settings
AUDIO_SETTINGS = {
    'sample_rate': 44100,
    'chunk_size': 1024,
    'channels': 1,
    'buffer_duration': 2.0,  # seconds
    'analysis_window': 1.0,  # seconds
    'enable_audio': True
}

# Fire/Smoke Detection Settings
FIRE_SMOKE_SETTINGS = {
    'use_cnn': True,
    'cnn_model': 'MobileNetV2',
    'color_analysis': True,
    'flicker_detection': True,
    'min_region_size': 100,
    'temporal_validation': True
}

# Pose Detection Settings
POSE_SETTINGS = {
    'model_complexity': 1,  # MediaPipe model complexity (0, 1, 2)
    'min_detection_confidence': 0.5,
    'min_tracking_confidence': 0.5,
    'enable_segmentation': False,
    'smooth_landmarks': True
}

# Crowd Analysis Settings
CROWD_SETTINGS = {
    'density_grid_size': 50,
    'motion_analysis': True,
    'optical_flow': True,
    'tracking_enabled': True,
    'max_tracks': 100
}

# Logging Settings
LOGGING_SETTINGS = {
    'log_level': 'INFO',
    'log_to_file': True,
    'log_to_console': True,
    'log_interval': 1.0,  # seconds
    'log_file': 'enhanced_multimodal_activity_log.jsonl',
    'max_log_size': 100,  # MB
    'backup_count': 5
}

# Alert Settings
ALERT_SETTINGS = {
    'enable_alerts': True,
    'alert_cooldown': 5.0,  # seconds between same alert type
    'high_priority_events': ['fire', 'stampede', 'medical_emergency'],
    'medium_priority_events': ['fallen', 'smoke'],
    'low_priority_events': ['running', 'crowd_density']
}

# Performance Settings
PERFORMANCE_SETTINGS = {
    'max_fps': 30,
    'skip_frames': 0,  # Skip every N frames for performance
    'resize_factor': 1.0,  # Resize input frames (1.0 = no resize)
    'enable_gpu': True,
    'batch_processing': False
}

# Emergency Response Settings
EMERGENCY_SETTINGS = {
    'auto_alert': True,
    'alert_threshold': {
        'fire': 0.7,
        'stampede': 0.6,
        'medical_emergency': 0.5
    },
    'escalation_time': 30,  # seconds before escalating alert
    'contact_authorities': False,  # Set to True for production
    'emergency_contacts': [
        # Add emergency contact information here
    ]
}

# System Integration Settings
INTEGRATION_SETTINGS = {
    'mongodb_enabled': True,
    'api_enabled': True,
    'websocket_enabled': True,
    'streaming_enabled': True,
    'backup_enabled': True
}

# Model Paths
MODEL_PATHS = {
    'yolo_model': 'yolov8n.pt',
    'fire_model': None,  # Will use MobileNetV2 from tensorflow
    'pose_model': None,  # Will use MediaPipe
    'audio_model': None  # Custom audio analysis
}

# Color Ranges for Fire/Smoke Detection (HSV)
FIRE_COLOR_RANGES = [
    # Red-orange fire
    ([0, 100, 100], [20, 255, 255]),
    # Yellow fire  
    ([20, 100, 100], [30, 255, 255]),
    # Bright red fire
    ([170, 100, 100], [180, 255, 255])
]

SMOKE_COLOR_RANGES = [
    # Light gray smoke
    ([0, 0, 120], [180, 25, 180]),
    # Dark gray smoke
    ([0, 0, 60], [180, 40, 140]),
    # Very light smoke
    ([0, 0, 140], [180, 20, 200])
]

# Audio Frequency Patterns for Emergency Detection
AUDIO_PATTERNS = {
    'distress': {
        'help_calls': {'freq_range': (200, 800), 'duration': 1.0},
        'screams': {'freq_range': (800, 2000), 'duration': 0.5},
        'crying': {'freq_range': (100, 400), 'duration': 2.0}
    },
    'fire': {
        'crackling': {'freq_range': (1000, 4000), 'duration': 0.3},
        'roaring': {'freq_range': (50, 200), 'duration': 1.0}
    },
    'panic': {
        'panic_screams': {'freq_range': (800, 1500), 'duration': 0.5},
        'chaotic_noise': {'freq_range': (200, 1000), 'duration': 1.0}
    }
}

# Validation Settings
VALIDATION_SETTINGS = {
    'enable_validation': True,
    'cross_validation': True,
    'confidence_validation': True,
    'temporal_validation': True,
    'spatial_validation': True
}

def get_config():
    """Get complete configuration dictionary"""
    return {
        'detection_thresholds': DETECTION_THRESHOLDS,
        'fusion_weights': FUSION_WEIGHTS,
        'temporal_settings': TEMPORAL_SETTINGS,
        'video_settings': VIDEO_SETTINGS,
        'audio_settings': AUDIO_SETTINGS,
        'fire_smoke_settings': FIRE_SMOKE_SETTINGS,
        'pose_settings': POSE_SETTINGS,
        'crowd_settings': CROWD_SETTINGS,
        'logging_settings': LOGGING_SETTINGS,
        'alert_settings': ALERT_SETTINGS,
        'performance_settings': PERFORMANCE_SETTINGS,
        'emergency_settings': EMERGENCY_SETTINGS,
        'integration_settings': INTEGRATION_SETTINGS,
        'model_paths': MODEL_PATHS,
        'fire_color_ranges': FIRE_COLOR_RANGES,
        'smoke_color_ranges': SMOKE_COLOR_RANGES,
        'audio_patterns': AUDIO_PATTERNS,
        'validation_settings': VALIDATION_SETTINGS
    }

def print_config():
    """Print current configuration"""
    config = get_config()
    print("🔧 Enhanced Multi-Modal Detection Configuration:")
    print("=" * 50)
    for section, settings in config.items():
        print(f"\n📋 {section.upper().replace('_', ' ')}:")
        for key, value in settings.items():
            print(f"  {key}: {value}")
    print("=" * 50)

if __name__ == "__main__":
    print_config()
