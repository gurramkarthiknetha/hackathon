#!/usr/bin/env python3
"""
FastAPI System Startup Script
Starts the FastAPI backend and optionally the frontend
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

class FastAPISystemManager:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = False
        
    def check_dependencies(self):
        """Check if all required dependencies are available"""
        print("🔍 Checking system dependencies...")
        
        # Check Python
        try:
            result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
            print(f"✅ Python: {result.stdout.strip()}")
        except Exception as e:
            print(f"❌ Python check failed: {e}")
            return False
        
        # Check FastAPI dependencies
        try:
            import fastapi
            import uvicorn
            print(f"✅ FastAPI: {fastapi.__version__}")
            print(f"✅ Uvicorn available")
        except ImportError as e:
            print(f"❌ FastAPI dependencies missing: {e}")
            return False
        
        return True
        
    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting FastAPI backend...")
        
        backend_dir = Path(__file__).parent.parent
        os.chdir(backend_dir)
        
        try:
            # Start FastAPI with uvicorn
            self.backend_process = subprocess.Popen([
                sys.executable, "-m", "uvicorn", 
                "app.main:app", 
                "--host", "0.0.0.0", 
                "--port", "5000", 
                "--reload"
            ], cwd=backend_dir)
            
            print("✅ FastAPI backend started on http://localhost:5000")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the React frontend (optional)"""
        print("🎨 Starting React frontend...")
        
        frontend_dir = Path(__file__).parent.parent.parent / "frontend"
        
        if not frontend_dir.exists():
            print("⚠️ Frontend directory not found, skipping...")
            return True
        
        try:
            # Check if npm is available
            subprocess.run(['npm', '--version'], capture_output=True, check=True)
            
            # Start React dev server
            self.frontend_process = subprocess.Popen([
                'npm', 'run', 'dev'
            ], cwd=frontend_dir)
            
            print("✅ React frontend started on http://localhost:5173")
            return True
            
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️ npm not available or frontend setup incomplete")
            return True
    
    def start_system(self, include_frontend=True):
        """Start the complete system"""
        print("🚀 Starting Integrated AI Event Monitor System")
        print("=" * 50)
        
        # Check dependencies
        if not self.check_dependencies():
            print("❌ Dependency check failed")
            return False
        
        # Start backend
        if not self.start_backend():
            return False
        
        # Wait for backend to start
        time.sleep(3)
        
        # Start frontend if requested
        if include_frontend:
            self.start_frontend()
        
        self.running = True
        print("\n🎉 System started successfully!")
        print("📊 Backend API: http://localhost:5000")
        print("📚 API Docs: http://localhost:5000/docs")
        if include_frontend:
            print("🎨 Frontend: http://localhost:5173")
        
        return True
    
    def stop_system(self):
        """Stop all processes"""
        print("\n🛑 Stopping system...")
        
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process.wait()
            print("✅ Backend stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate() 
            self.frontend_process.wait()
            print("✅ Frontend stopped")
        
        self.running = False
        print("✅ System stopped")
    
    def run(self):
        """Run the system with graceful shutdown"""
        try:
            if self.start_system():
                print("\n⌨️ Press Ctrl+C to stop the system")
                
                # Keep running until interrupted
                while self.running:
                    time.sleep(1)
                    
                    # Check if processes are still running
                    if self.backend_process and self.backend_process.poll() is not None:
                        print("❌ Backend process died unexpectedly")
                        break
                        
        except KeyboardInterrupt:
            print("\n🛑 Shutdown signal received...")
        finally:
            self.stop_system()

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Start FastAPI AI Event Monitor System")
    parser.add_argument("--backend-only", action="store_true", 
                       help="Start only the backend server")
    
    args = parser.parse_args()
    
    manager = FastAPISystemManager()
    
    if args.backend_only:
        # Start only backend
        if manager.start_backend():
            try:
                print("\n⌨️ Press Ctrl+C to stop the backend")
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                manager.stop_system()
    else:
        # Start full system
        manager.run()

if __name__ == "__main__":
    main()
