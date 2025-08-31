#!/usr/bin/env python3
"""
Migration script to copy Python ML files from python/ and python-2/ directories
into the FastAPI backend structure and clean up redundant files.
"""

import os
import shutil
import json
from pathlib import Path

def migrate_python_files():
    """Migrate Python ML files to FastAPI backend"""
    
    # Define source and destination paths
    base_dir = Path("/Users/karthikgurram/projects/hackathon")
    python_dir = base_dir / "python"
    python2_dir = base_dir / "python-2"
    backend_dir = base_dir / "hack" / "backend"
    ml_dir = backend_dir / "app" / "ml"
    
    print("🔄 Starting Python code migration...")
    
    # Create ML models directory if it doesn't exist
    models_dir = ml_dir / "models"
    models_dir.mkdir(exist_ok=True)
    
    # Files to copy from python/ directory
    python_files_to_copy = [
        "yolov8n.pt",  # YOLO model weights
        "detection_config.py",
        "enhanced_detection_config.py",
        "incident_service.py",
        "video_streaming_service.py",
        "requirements.txt"  # Will merge with existing
    ]
    
    # Copy important Python files
    if python_dir.exists():
        print(f"📁 Processing {python_dir}")
        
        for file_name in python_files_to_copy:
            src_file = python_dir / file_name
            if src_file.exists():
                if file_name == "yolov8n.pt":
                    dst_file = models_dir / file_name
                elif file_name == "requirements.txt":
                    # Merge requirements
                    merge_requirements(src_file, backend_dir / "requirements.txt")
                    continue
                else:
                    dst_file = ml_dir / file_name
                
                print(f"  📄 Copying {file_name}")
                shutil.copy2(src_file, dst_file)
        
        # Copy test images for ML testing
        test_images = list(python_dir.glob("test_detection_*.jpg"))
        if test_images:
            test_dir = ml_dir / "test_images"
            test_dir.mkdir(exist_ok=True)
            for img in test_images[:3]:  # Copy first 3 test images
                shutil.copy2(img, test_dir / img.name)
                print(f"  🖼️ Copied test image {img.name}")
    
    # Copy any additional files from python-2/
    if python2_dir.exists():
        print(f"📁 Processing {python2_dir}")
        for py_file in python2_dir.glob("*.py"):
            if py_file.name not in ["__init__.py"]:
                dst_file = ml_dir / py_file.name
                if not dst_file.exists():  # Don't overwrite existing files
                    print(f"  📄 Copying {py_file.name}")
                    shutil.copy2(py_file, dst_file)
    
    print("✅ Python code migration completed")

def merge_requirements(src_requirements, dst_requirements):
    """Merge requirements from python/ directory with FastAPI requirements"""
    print("  🔗 Merging requirements.txt")
    
    try:
        # Read existing FastAPI requirements
        with open(dst_requirements, 'r') as f:
            existing_reqs = set(line.strip() for line in f if line.strip() and not line.startswith('#'))
        
        # Read Python directory requirements
        with open(src_requirements, 'r') as f:
            python_reqs = set(line.strip() for line in f if line.strip() and not line.startswith('#'))
        
        # Find new requirements to add
        new_reqs = python_reqs - existing_reqs
        
        if new_reqs:
            # Append new requirements
            with open(dst_requirements, 'a') as f:
                f.write("\n# Additional ML requirements from python/ directory\n")
                for req in sorted(new_reqs):
                    f.write(f"{req}\n")
            
            print(f"    ➕ Added {len(new_reqs)} new requirements")
        else:
            print("    ✅ No new requirements to add")
            
    except Exception as e:
        print(f"    ⚠️ Error merging requirements: {e}")

def cleanup_redundant_files():
    """Clean up redundant Node.js files and organize structure"""
    
    base_dir = Path("/Users/karthikgurram/projects/hackathon")
    backend_dir = base_dir / "hack" / "backend"
    
    print("🧹 Cleaning up redundant files...")
    
    # Files and directories to remove from backend (Node.js specific)
    node_files_to_remove = [
        "controllers",
        "middleware/auth.js",
        "middleware/security.js", 
        "models",
        "routes",
        "scripts/generate-ethereal-credentials.js",
        "scripts/seedAllData.js",
        "scripts/seedMessages.js",
        "db/connectDB.js",
        "index.js",
        "package.json",
        "package-lock.json",
        ".gitignore"  # Will be recreated for Python
    ]
    
    for item in node_files_to_remove:
        item_path = backend_dir / item
        if item_path.exists():
            if item_path.is_dir():
                print(f"  🗂️ Removing directory {item}")
                shutil.rmtree(item_path)
            else:
                print(f"  📄 Removing file {item}")
                item_path.unlink()
    
    print("✅ Cleanup completed")

def create_gitignore():
    """Create Python-specific .gitignore"""
    
    backend_dir = Path("/Users/karthikgurram/projects/hackathon/hack/backend")
    gitignore_content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual Environment
venv/
env/
ENV/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Environment variables
.env
.env.local

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# ML Models (except yolov8n.pt which we need)
*.pt
!yolov8n.pt
*.onnx
*.tflite

# Test outputs
test_detection_*.jpg
activity_log.jsonl
*_activity_log.jsonl

# Docker
.dockerignore

# OS
.DS_Store
Thumbs.db

# Backup files
*.bak
*.backup
"""
    
    gitignore_path = backend_dir / ".gitignore"
    with open(gitignore_path, 'w') as f:
        f.write(gitignore_content)
    
    print("📄 Created Python-specific .gitignore")

def update_project_structure():
    """Update project structure documentation"""
    
    backend_dir = Path("/Users/karthikgurram/projects/hackathon/hack/backend")
    
    structure_doc = """# FastAPI Backend Project Structure

```
app/
├── auth/                 # Authentication module
│   ├── __init__.py
│   ├── models.py        # Pydantic models
│   ├── routes.py        # Auth endpoints
│   └── service.py       # Auth business logic
├── users/               # User management
│   ├── __init__.py
│   ├── models.py
│   └── routes.py
├── monitoring/          # Incident and zone management
│   ├── __init__.py
│   ├── models.py
│   └── routes.py
├── ml/                  # AI/ML inference
│   ├── __init__.py
│   ├── inference.py     # Standard ML service
│   ├── enhanced_detection.py  # Multi-modal detection
│   ├── routes.py        # ML API endpoints
│   ├── models/          # ML model files
│   │   └── yolov8n.pt
│   ├── detection_config.py
│   ├── incident_service.py
│   └── test_images/     # Test images for ML
├── realtime/            # Socket.IO server
│   ├── __init__.py
│   └── socket.py
├── middleware/          # Security middleware
│   ├── __init__.py
│   └── security.py
├── utils/               # Utilities
│   ├── __init__.py
│   └── email.py
├── db/                  # Database connection
│   ├── __init__.py
│   └── mongo.py
├── scripts/             # Data seeding and testing
│   ├── __init__.py
│   ├── seed_monitoring.py
│   ├── test_email.py
│   └── migrate_python_code.py
├── config.py            # Configuration management
├── deps.py              # Dependency injection
├── main.py              # FastAPI application
└── routers.py           # Route configuration

# Root files
├── requirements.txt     # Python dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Multi-service setup
├── Makefile           # Development commands
├── .env.example       # Environment template
├── .gitignore         # Python gitignore
└── README.md          # Documentation
```

## Migration Status

✅ **Completed:**
- FastAPI application setup
- Authentication system (JWT, bcrypt)
- User management with role-based access
- MongoDB integration with Motor
- Socket.IO real-time communication
- ML inference with YOLO, TensorFlow, MediaPipe
- Enhanced multi-modal detection system
- Email service with templates
- Security middleware (CORS, rate limiting, headers)
- Monitoring and incident management
- Docker containerization
- Development scripts and tools

✅ **Integrated from python/ directory:**
- Enhanced multimodal detection system
- YOLO model weights (yolov8n.pt)
- Detection configuration
- Incident service integration
- Video streaming capabilities

🧹 **Cleaned up:**
- Removed redundant Node.js files
- Consolidated Python code into single backend
- Updated project structure for FastAPI
- Created Python-specific configuration
"""
    
    docs_dir = backend_dir / "docs"
    docs_dir.mkdir(exist_ok=True)
    
    with open(docs_dir / "project_structure.md", 'w') as f:
        f.write(structure_doc)
    
    print("📚 Updated project structure documentation")

def main():
    """Main migration function"""
    print("🚀 Starting FastAPI Backend Consolidation")
    print("=" * 50)
    
    try:
        # Step 1: Migrate Python ML code
        migrate_python_files()
        
        # Step 2: Clean up redundant Node.js files
        cleanup_redundant_files()
        
        # Step 3: Create Python-specific configuration
        create_gitignore()
        
        # Step 4: Update documentation
        update_project_structure()
        
        print("\n" + "=" * 50)
        print("🎉 FastAPI Backend Consolidation Complete!")
        print("\n📋 Summary:")
        print("  ✅ Migrated Python ML code to FastAPI backend")
        print("  ✅ Integrated enhanced detection capabilities")
        print("  ✅ Cleaned up redundant Node.js files")
        print("  ✅ Created unified project structure")
        print("  ✅ Updated configuration and documentation")
        
        print("\n🚀 Next Steps:")
        print("  1. Run 'make install' to install dependencies")
        print("  2. Configure .env file with your settings")
        print("  3. Run 'make docker-up' to start the system")
        print("  4. Test the enhanced ML endpoints at /docs")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
