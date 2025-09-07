#!/usr/bin/env python3
"""
Integrated System Startup Script
Starts both FastAPI backend and React frontend together
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

class SystemManager:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = False
        
    def check_dependencies(self):
        """Check if all required dependencies are available"""
        print("🔍 Checking system dependencies...")
        
        # Check Python
        try:
            result = subprocess.run(['python3', '--version'], capture_output=True, text=True)
            print(f"✅ Python: {result.stdout.strip()}")
        except Exception as e:
            print(f"❌ Python check failed: {e}")
            return False
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            print(f"✅ Node.js: {result.stdout.strip()}")
        except Exception as e:
            print(f"❌ Node.js not found: {e}")
            return False
        
        # Check npm
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ npm: {result.stdout.strip()}")
            else:
                print(f"❌ npm not found: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ npm check failed: {e}")
            return False
        
        return True
        
    def install_backend_deps(self):
        """Install Python backend dependencies"""
        print("📦 Installing backend dependencies...")
        
        backend_dir = Path(__file__).parent / "backend"
        
        try:
            result = subprocess.run([
                "python3", "-m", "pip", "install", "-r", "requirements.txt"
            ], cwd=backend_dir, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Backend dependencies installed")
                return True
            else:
                print(f"❌ Backend dependency installation failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Backend dependency installation error: {e}")
            return False
    
    def install_frontend_deps(self):
        """Install Node.js frontend dependencies using WSL"""
        print("📦 Installing frontend dependencies...")
        
        frontend_dir = Path(__file__).parent / "frontend"
        
        try:
            result = subprocess.run([
                'npm', 'install'
            ], cwd=frontend_dir, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Frontend dependencies installed")
                return True
            else:
                print(f"❌ Frontend dependency installation failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Frontend dependency installation error: {e}")
            return False
    
    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting FastAPI backend...")
        
        backend_dir = Path(__file__).parent / "backend"
        
        try:
            # Start FastAPI with uvicorn
            self.backend_process = subprocess.Popen([
                "python3", "-m", "uvicorn", 
                "app.main:app", 
                "--host", "0.0.0.0", 
                "--port", "8000", 
                "--reload"
            ], cwd=backend_dir)
            
            print("✅ FastAPI backend started on http://localhost:8000")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False
    
    def start_frontend(self):
        """Start the React frontend"""
        print("🎨 Starting React frontend...")
        
        frontend_dir = Path(__file__).parent / "frontend"
        
        try:
            # Start React dev server
            self.frontend_process = subprocess.Popen([
                'npm', 'run', 'dev'
            ], cwd=frontend_dir)
            
            print("✅ React frontend started on http://localhost:5173")
            return True
            
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False
    
    def start_system(self, install_deps=True):
        """Start the complete system"""
        print("🚀 Starting AI Event Monitor System")
        print("=" * 50)
        
        # Check dependencies
        if not self.check_dependencies():
            print("❌ Dependency check failed")
            return False
        
        # Install dependencies if requested
        if install_deps:
            if not self.install_backend_deps():
                return False
            if not self.install_frontend_deps():
                return False
        
        # Start backend
        if not self.start_backend():
            return False
        
        # Wait for backend to start
        print("⏳ Waiting for backend to initialize...")
        time.sleep(5)
        
        # Start frontend
        if not self.start_frontend():
            return False
        
        # Wait for frontend to start
        print("⏳ Waiting for frontend to initialize...")
        time.sleep(3)
        
        self.running = True
        print("\n🎉 System started successfully!")
        print("📊 Backend API: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
        print("🎨 Frontend: http://localhost:5173")
        print("🔌 Socket.IO: http://localhost:8000/socket.io")
        
        return True
    
    def stop_system(self):
        """Stop all processes"""
        print("\n🛑 Stopping system...")
        
        if self.backend_process:
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
            print("✅ Backend stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            try:
                self.frontend_process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.frontend_process.kill()
            print("✅ Frontend stopped")
        
        self.running = False
        print("✅ System stopped")
    
    def run(self, install_deps=True):
        """Run the system with graceful shutdown"""
        try:
            if self.start_system(install_deps):
                print("\n⌨️ Press Ctrl+C to stop the system")
                
                # Keep running until interrupted
                while self.running:
                    time.sleep(1)
                    
                    # Check if processes are still running
                    if self.backend_process and self.backend_process.poll() is not None:
                        print("❌ Backend process died unexpectedly")
                        break
                    
                    if self.frontend_process and self.frontend_process.poll() is not None:
                        print("❌ Frontend process died unexpectedly")
                        break
                        
        except KeyboardInterrupt:
            print("\n🛑 Shutdown signal received...")
        finally:
            self.stop_system()

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Start AI Event Monitor System")
    parser.add_argument("--backend-only", action="store_true", 
                       help="Start only the backend server")
    parser.add_argument("--no-install", action="store_true",
                       help="Skip dependency installation")
    
    args = parser.parse_args()
    
    manager = SystemManager()
    
    if args.backend_only:
        # Start only backend
        print("🚀 Starting Backend Only Mode")
        print("=" * 30)
        
        if not manager.check_dependencies():
            return 1
        
        if not args.no_install and not manager.install_backend_deps():
            return 1
            
        if manager.start_backend():
            try:
                print("\n⌨️ Press Ctrl+C to stop the backend")
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                manager.stop_system()
        return 0
    else:
        # Start full system
        manager.run(install_deps=not args.no_install)
        return 0

if __name__ == "__main__":
    exit(main())
