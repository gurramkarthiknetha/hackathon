"""
Configuration file for real-time object detection
"""

# Target classes for detection
TARGET_CLASSES = [
    "fire",
    "smoke", 
    "running",
    "fallen",
    "medical emergency",
    "stampede"
]

# Confidence threshold for detection
DEFAULT_CONFIDENCE_THRESHOLD = 0.3

# Logging interval in seconds
LOG_INTERVAL = 1.0

# Video settings
DEFAULT_VIDEO_SOURCE = "0"  # 0 for webcam
DEFAULT_MODEL_PATH = "yolov8n.pt"

# Custom class mapping for YOLOv8 COCO classes to our target classes
# This is a simplified mapping - for production, you'd need a custom trained model
CLASS_MAPPING = {
    # Person-related detections - let fallen detection be handled separately
    0: "person",      # person - will be analyzed for fallen detection separately

    # Vehicle movements (running/movement indicators)
    1: "bicycle",     # bicycle
    2: "car",         # car
    3: "motorcycle",  # motorcycle
    4: "airplane",    # airplane
    5: "bus",         # bus
    6: "train",       # train
    7: "truck",       # truck
    
    # Common objects - keep original names
    8: "boat",        # boat
    9: "traffic light", # traffic light
    10: "fire hydrant", # fire hydrant
    11: "stop sign",  # stop sign
    12: "parking meter", # parking meter
    13: "bench",      # bench
    14: "bird",       # bird
    15: "cat",        # cat
    16: "dog",        # dog
    17: "horse",      # horse
    18: "sheep",      # sheep
    19: "cow",        # cow
    20: "elephant",   # elephant
    21: "bear",       # bear
    22: "zebra",      # zebra
    23: "giraffe",    # giraffe
    
    # Personal items that could indicate medical emergency
    24: "medical emergency",  # backpack
    25: "medical emergency",  # umbrella
    26: "medical emergency",  # handbag
    27: "medical emergency",  # tie
    28: "medical emergency",  # suitcase
    29: "medical emergency",  # frisbee
    30: "medical emergency",  # skis
    31: "medical emergency",  # snowboard
    32: "medical emergency",  # sports ball
    33: "medical emergency",  # kite
    34: "medical emergency",  # baseball bat
    35: "medical emergency",  # baseball glove
    36: "medical emergency",  # skateboard
    37: "medical emergency",  # surfboard
    38: "medical emergency",  # tennis racket
    
    # Kitchen items and food - keep original names
    39: "bottle",     # bottle
    40: "wine glass", # wine glass
    41: "cup",        # cup
    42: "fork",       # fork
    43: "knife",      # knife
    44: "spoon",      # spoon
    45: "bowl",       # bowl
    46: "banana",     # banana
    47: "apple",      # apple
    48: "sandwich",   # sandwich
    49: "orange",     # orange
    50: "broccoli",   # broccoli
    51: "carrot",     # carrot
    52: "hot dog",    # hot dog
    53: "pizza",      # pizza
    54: "donut",      # donut
    55: "cake",       # cake
    
    # Furniture and electronics - keep original names
    56: "chair",      # chair
    57: "couch",      # couch
    58: "potted plant", # potted plant
    59: "bed",        # bed
    60: "dining table", # dining table
    61: "toilet",     # toilet
    62: "tv",         # tv
    63: "laptop",     # laptop
    64: "mouse",      # mouse
    65: "remote",     # remote
    66: "keyboard",   # keyboard
    67: "cell phone", # cell phone
    
    # Kitchen appliances - keep original names, some could indicate fire risk
    68: "microwave",  # microwave
    69: "oven",       # oven
    70: "toaster",    # toaster
    71: "sink",       # sink
    72: "refrigerator", # refrigerator
    
    # Other objects (removed fallen mapping - now using proper person detection)
    # 73: "book",     # book
    # 74: "clock",    # clock
    # 75: "vase",     # vase
    # 76: "scissors", # scissors
    # 77: "teddy bear", # teddy bear
    # 78: "hair drier", # hair drier
    # 79: "toothbrush", # toothbrush
}

# Emergency detection settings
EMERGENCY_SETTINGS = {
    "fire": {
        "min_confidence": 0.4,
        "description": "Fire detection"
    },
    "smoke": {
        "min_confidence": 0.4,
        "description": "Smoke detection"
    },
    "running": {
        "min_confidence": 0.3,
        "description": "Movement/running detection"
    },
    "fallen": {
        "min_confidence": 0.3,
        "description": "Fallen person/object detection"
    },
    "medical emergency": {
        "min_confidence": 0.5,
        "description": "Medical emergency indicators"
    },
    "stampede": {
        "min_confidence": 0.6,
        "description": "Crowd stampede detection"
    }
}

# Log file settings
LOG_SETTINGS = {
    "filename": "activity_log.jsonl",
    "max_file_size_mb": 100,
    "backup_count": 5
}

# Video display settings
DISPLAY_SETTINGS = {
    "window_name": "Real-time Detection",
    "show_fps": True,
    "show_confidence": True,
    "show_class_names": True
} 