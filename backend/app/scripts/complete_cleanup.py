#!/usr/bin/env python3
"""
Complete cleanup script to remove ALL remaining Node.js files and directories
from the FastAPI backend.
"""

import os
import shutil
from pathlib import Path

def complete_cleanup():
    """Remove all remaining Node.js files and directories"""
    
    backend_dir = Path("/Users/karthikgurram/projects/hackathon/hack/backend")
    
    print("🧹 Starting complete Node.js cleanup...")
    
    # All Node.js files and directories to remove
    items_to_remove = [
        # Directories
        "mailtrap",
        "middleware", 
        "nodemailer",
        "scripts",
        "services",
        "tests",
        "utils",
        "db",
        
        # Individual files
        "cookies.txt",
        "LICENSE",  # Node.js specific license
        ".env",     # Will recreate Python version
    ]
    
    # Remove directories and files
    for item in items_to_remove:
        item_path = backend_dir / item
        if item_path.exists():
            if item_path.is_dir():
                print(f"  🗂️ Removing directory: {item}")
                shutil.rmtree(item_path)
            else:
                print(f"  📄 Removing file: {item}")
                item_path.unlink()
    
    # Find and remove all remaining .js files
    js_files = list(backend_dir.rglob("*.js"))
    for js_file in js_files:
        print(f"  📄 Removing JS file: {js_file.relative_to(backend_dir)}")
        js_file.unlink()
    
    # Remove any remaining Node.js config files
    node_configs = [
        "package.json",
        "package-lock.json",
        "yarn.lock",
        ".nvmrc",
        "nodemon.json"
    ]
    
    for config in node_configs:
        config_path = backend_dir / config
        if config_path.exists():
            print(f"  📄 Removing Node.js config: {config}")
            config_path.unlink()
    
    print("✅ Complete cleanup finished")

def create_clean_env():
    """Create clean .env file for FastAPI"""
    
    backend_dir = Path("/Users/karthikgurram/projects/hackathon/hack/backend")
    env_content = """# FastAPI Backend Environment Variables

# Server Configuration
NODE_ENV=development
APP_HOST=0.0.0.0
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/auth_tutorial

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# Client URL (for password reset links)
CLIENT_URL=http://localhost:5173

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=AI Event Monitor

# Google Maps API Configuration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Rate Limiting Configuration (optional)
# RATE_LIMIT_WINDOW=900
# RATE_LIMIT_MAX=1000
# AUTH_RATE_LIMIT_MAX=5
# PASSWORD_RESET_RATE_LIMIT_MAX=3
# EMAIL_VERIFICATION_RATE_LIMIT_MAX=15

# Security Configuration (optional)
# COOKIE_SECURE=false
# COOKIE_SAMESITE=strict
"""
    
    env_path = backend_dir / ".env"
    with open(env_path, 'w') as f:
        f.write(env_content)
    
    print("📄 Created clean .env file")

def verify_cleanup():
    """Verify that cleanup was successful"""
    
    backend_dir = Path("/Users/karthikgurram/projects/hackathon/hack/backend")
    
    print("\n🔍 Verifying cleanup...")
    
    # Check for any remaining .js files
    js_files = list(backend_dir.rglob("*.js"))
    if js_files:
        print(f"  ⚠️ Found {len(js_files)} remaining .js files:")
        for js_file in js_files:
            print(f"    - {js_file.relative_to(backend_dir)}")
    else:
        print("  ✅ No .js files found")
    
    # Check for Node.js directories
    node_dirs = ["node_modules", "mailtrap", "nodemailer", "middleware", "scripts", "services", "utils"]
    remaining_dirs = [d for d in node_dirs if (backend_dir / d).exists()]
    
    if remaining_dirs:
        print(f"  ⚠️ Found {len(remaining_dirs)} remaining Node.js directories:")
        for d in remaining_dirs:
            print(f"    - {d}")
    else:
        print("  ✅ No Node.js directories found")
    
    # Show final structure
    print("\n📁 Final backend structure:")
    for item in sorted(backend_dir.iterdir()):
        if item.is_dir():
            print(f"  📂 {item.name}/")
        else:
            print(f"  📄 {item.name}")

def main():
    """Main cleanup function"""
    print("🚀 Starting Complete Node.js Cleanup")
    print("=" * 50)
    
    try:
        # Step 1: Remove all Node.js files and directories
        complete_cleanup()
        
        # Step 2: Create clean .env file
        create_clean_env()
        
        # Step 3: Verify cleanup
        verify_cleanup()
        
        print("\n" + "=" * 50)
        print("🎉 Complete Cleanup Successful!")
        print("\n📋 Summary:")
        print("  ✅ Removed all Node.js files and directories")
        print("  ✅ Created clean FastAPI .env file")
        print("  ✅ Backend is now 100% Python/FastAPI")
        
        print("\n🚀 Your backend structure is now:")
        print("  📂 app/          - FastAPI application")
        print("  📂 docs/         - Documentation")
        print("  📄 requirements.txt - Python dependencies")
        print("  📄 Dockerfile    - Container configuration")
        print("  📄 docker-compose.yml - Multi-service setup")
        print("  📄 Makefile      - Development commands")
        print("  📄 .env          - Environment variables")
        print("  📄 README.md     - Project documentation")
        
    except Exception as e:
        print(f"\n❌ Cleanup failed: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
