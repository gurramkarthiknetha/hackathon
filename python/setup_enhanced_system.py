#!/usr/bin/env python3
"""
Setup Enhanced Multi-Modal Detection System
Handles dependency installation and system setup
"""

import subprocess
import sys
import os
import platform

def check_python_version():
    """Check if Python version is compatible"""
    print("🐍 Checking Python version...")
    
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not compatible")
        print("📝 Please use Python 3.8 or higher")
        return False

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    
    try:
        # Upgrade pip first
        print("⬆️ Upgrading pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        
        # Install requirements
        print("📋 Installing requirements from requirements.txt...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        
        print("✅ Dependencies installed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False
    except FileNotFoundError:
        print("❌ requirements.txt not found")
        return False

def install_optional_dependencies():
    """Install optional dependencies for better performance"""
    print("\n🔧 Installing optional dependencies...")
    
    optional_packages = [
        "opencv-contrib-python",  # Additional OpenCV modules
        "torch-audio",            # Audio processing for PyTorch
        "torchaudio",            # Audio processing
    ]
    
    for package in optional_packages:
        try:
            print(f"📦 Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package], 
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"✅ {package} installed")
        except subprocess.CalledProcessError:
            print(f"⚠️ {package} installation failed (optional)")

def check_system_requirements():
    """Check system requirements"""
    print("\n🖥️ Checking system requirements...")
    
    # Check operating system
    os_name = platform.system()
    print(f"💻 Operating System: {os_name}")
    
    # Check if running on supported OS
    if os_name in ["Windows", "Darwin", "Linux"]:
        print("✅ Operating system is supported")
    else:
        print("⚠️ Operating system may not be fully supported")
    
    # Check available memory (basic check)
    try:
        import psutil
        memory = psutil.virtual_memory()
        memory_gb = memory.total / (1024**3)
        print(f"💾 Available RAM: {memory_gb:.1f} GB")
        
        if memory_gb >= 4:
            print("✅ Sufficient memory available")
        else:
            print("⚠️ Low memory - system may run slowly")
    except ImportError:
        print("⚠️ Cannot check memory (psutil not available)")
    
    return True

def setup_directories():
    """Setup required directories"""
    print("\n📁 Setting up directories...")
    
    directories = [
        "logs",
        "models",
        "temp",
        "output"
    ]
    
    for directory in directories:
        try:
            os.makedirs(directory, exist_ok=True)
            print(f"✅ Directory '{directory}' ready")
        except Exception as e:
            print(f"⚠️ Could not create directory '{directory}': {e}")

def download_models():
    """Download required models"""
    print("\n🤖 Checking models...")
    
    # Check YOLO model
    if os.path.exists("yolov8n.pt"):
        print("✅ YOLOv8 model found")
    else:
        print("📥 YOLOv8 model will be downloaded automatically on first run")
    
    # Note about other models
    print("📝 Other models (MediaPipe, TensorFlow) will be downloaded automatically")

def create_config_files():
    """Create configuration files if they don't exist"""
    print("\n⚙️ Setting up configuration...")
    
    # Check if .env file exists
    if not os.path.exists(".env"):
        print("📝 Creating .env file...")
        env_content = """# Enhanced Multi-Modal Detection Configuration
MONGODB_URI=mongodb+srv://hackergkn:karthik@hackathon.xkjyqhh.mongodb.net/?retryWrites=true&w=majority&appName=hackathon
VIDEO_SERVICE_PORT=5001
VIDEO_SERVICE_HOST=0.0.0.0
YOLO_MODEL_PATH=yolov8n.pt
CONFIDENCE_THRESHOLD=0.3
DEFAULT_CAMERA_SOURCE=0
DROIDCAM_DEFAULT_IP=192.168.1.100
LOG_LEVEL=INFO
LOG_FILE=enhanced_multimodal_activity_log.jsonl

# Enhanced Detection Settings
ENABLE_MULTIMODAL=true
ENABLE_AUDIO_DETECTION=true
ENABLE_POSE_DETECTION=true
ENABLE_FIRE_SMOKE_DETECTION=true
ENABLE_CROWD_ANALYSIS=true

# Performance Settings
MAX_FPS=30
RESIZE_FACTOR=1.0
ENABLE_GPU=true
"""
        try:
            with open(".env", "w") as f:
                f.write(env_content)
            print("✅ .env file created")
        except Exception as e:
            print(f"⚠️ Could not create .env file: {e}")
    else:
        print("✅ .env file already exists")

def run_tests():
    """Run system tests"""
    print("\n🧪 Running system tests...")
    
    try:
        # Run the test script
        result = subprocess.run([sys.executable, "test_enhanced_detection.py"], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ System tests completed successfully")
            return True
        else:
            print("⚠️ Some tests failed, but system may still work")
            print("📋 Test output:")
            print(result.stdout)
            if result.stderr:
                print("❌ Errors:")
                print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️ Tests timed out")
        return False
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def print_usage_instructions():
    """Print usage instructions"""
    print("\n" + "="*60)
    print("🚀 ENHANCED MULTI-MODAL DETECTION SYSTEM READY!")
    print("="*60)
    print("\n📋 Available Scripts:")
    print("1. enhanced_multimodal_detection.py - Main detection system")
    print("2. test_enhanced_detection.py - Test all components")
    print("3. enhanced_detection_config.py - View/modify configuration")
    print("\n🎯 Quick Start:")
    print("python enhanced_multimodal_detection.py")
    print("\n🧪 Run Tests:")
    print("python test_enhanced_detection.py")
    print("\n⚙️ View Configuration:")
    print("python enhanced_detection_config.py")
    print("\n📝 Features Available:")
    print("• YOLO object detection")
    print("• Pose-based emergency detection")
    print("• Fire and smoke detection")
    print("• Audio distress detection")
    print("• Crowd density analysis")
    print("• Multi-modal fusion")
    print("• Real-time logging")
    print("• Web streaming integration")
    print("\n💡 Tips:")
    print("• Press 'q' to quit detection")
    print("• Check logs in enhanced_multimodal_activity_log.jsonl")
    print("• Adjust settings in enhanced_detection_config.py")
    print("="*60)

def main():
    """Main setup function"""
    print("🔧 Enhanced Multi-Modal Detection System Setup")
    print("="*50)
    
    setup_success = True
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Check system requirements
    check_system_requirements()
    
    # Setup directories
    setup_directories()
    
    # Install dependencies
    if not install_dependencies():
        setup_success = False
    
    # Install optional dependencies
    install_optional_dependencies()
    
    # Download models
    download_models()
    
    # Create config files
    create_config_files()
    
    # Run tests
    if setup_success:
        test_success = run_tests()
        if not test_success:
            print("⚠️ Some tests failed, but you can still try running the system")
    
    # Print usage instructions
    print_usage_instructions()
    
    if setup_success:
        print("\n🎉 Setup completed successfully!")
        print("🚀 You can now run: python enhanced_multimodal_detection.py")
    else:
        print("\n⚠️ Setup completed with some issues")
        print("📝 Please check the error messages above and try again")
    
    return setup_success

if __name__ == "__main__":
    main()
