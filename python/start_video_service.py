#!/usr/bin/env python3
"""
Startup script for the Video Streaming Service
Handles initialization, dependency checks, and service startup
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_dependencies():
    """Check if all required dependencies are installed"""
    print("Checking dependencies...")
    
    required_packages = [
        'opencv-python',
        'ultralytics', 
        'flask',
        'flask-cors',
        'flask-socketio',
        'pymongo',
        'python-dotenv',
        'requests'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Installing missing packages...")
        
        try:
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install'
            ] + missing_packages)
            print("Dependencies installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install dependencies: {e}")
            return False
    else:
        print("All dependencies are installed!")
    
    return True

def check_yolo_model():
    """Check if YOLO model file exists"""
    model_path = Path("yolov8n.pt")
    
    if not model_path.exists():
        print("YOLO model file (yolov8n.pt) not found!")
        print("The model will be downloaded automatically on first run.")
        return True
    else:
        print("YOLO model file found!")
        return True

def check_environment():
    """Check environment configuration"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("Creating .env file from template...")
        try:
            with open(".env.example", "r") as example:
                content = example.read()
            
            with open(".env", "w") as env:
                env.write(content)
            
            print(".env file created! Please review and update the configuration.")
        except FileNotFoundError:
            print("Warning: .env.example not found. Creating basic .env file...")
            with open(".env", "w") as env:
                env.write("MONGODB_URI=mongodb://localhost:27017/hackathon\n")
                env.write("VIDEO_SERVICE_PORT=5001\n")
                env.write("BACKEND_URL=http://localhost:5000/api\n")
    else:
        print(".env file found!")
    
    return True

def start_service():
    """Start the video streaming service"""
    print("\n" + "="*50)
    print("Starting Video Streaming Service with YOLO Integration")
    print("="*50)
    
    try:
        # Import and run the service
        from video_streaming_service import app, socketio
        
        print("\nService starting on http://localhost:5001")
        print("WebSocket endpoint: ws://localhost:5001")
        print("\nPress Ctrl+C to stop the service")
        print("-"*50)
        
        socketio.run(
            app, 
            host='0.0.0.0', 
            port=5001, 
            debug=False,
            allow_unsafe_werkzeug=True
        )
        
    except KeyboardInterrupt:
        print("\n\nService stopped by user")
    except Exception as e:
        print(f"\nError starting service: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    print("YOLO Video Streaming Service Startup")
    print("="*40)
    
    # Check all prerequisites
    if not check_dependencies():
        print("Failed to install dependencies. Exiting.")
        sys.exit(1)
    
    if not check_yolo_model():
        print("YOLO model check failed. Exiting.")
        sys.exit(1)
    
    if not check_environment():
        print("Environment setup failed. Exiting.")
        sys.exit(1)
    
    print("\nAll checks passed! Starting service...")
    time.sleep(1)
    
    # Start the service
    if not start_service():
        print("Failed to start service. Exiting.")
        sys.exit(1)

if __name__ == "__main__":
    main()
