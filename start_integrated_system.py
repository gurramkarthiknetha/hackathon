#!/usr/bin/env python3
"""
Integrated System Startup Script
Starts both the Node.js backend and Python AI service together
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

class IntegratedSystemManager:
    def __init__(self):
        self.backend_process = None
        self.python_service_process = None
        self.running = False
        
    def check_dependencies(self):
        """Check if all required dependencies are available"""
        print("🔍 Checking system dependencies...")
        
        # Check Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Node.js: {result.stdout.strip()}")
            else:
                print("❌ Node.js not found")
                return False
        except FileNotFoundError:
            print("❌ Node.js not found")
            return False
            
        # Check Python
        try:
            result = subprocess.run([sys.executable, '--version'], capture_output=True, text=True)
            print(f"✅ Python: {result.stdout.strip()}")
        except:
            print("❌ Python not found")
            return False
            
        # Check MongoDB (optional check)
        try:
            result = subprocess.run(['mongod', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ MongoDB available")
            else:
                print("⚠️  MongoDB not found - make sure it's running")
        except FileNotFoundError:
            print("⚠️  MongoDB not found - make sure it's running")
            
        return True
    
    def start_backend(self):
        """Start the Node.js backend server"""
        print("🚀 Starting Node.js backend server...")
        
        backend_dir = Path("hack/backend")
        if not backend_dir.exists():
            print("❌ Backend directory not found")
            return False
            
        try:
            # Change to backend directory and start server
            self.backend_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Give it a moment to start
            time.sleep(3)
            
            if self.backend_process.poll() is None:
                print("✅ Backend server started on http://localhost:3000")
                return True
            else:
                print("❌ Backend server failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting backend: {e}")
            return False
    
    def start_python_service(self):
        """Start the Python AI detection service"""
        print("🤖 Starting Python AI detection service...")
        
        python_dir = Path("python")
        if not python_dir.exists():
            print("❌ Python service directory not found")
            return False
            
        try:
            # Start Python service
            self.python_service_process = subprocess.Popen(
                [sys.executable, 'start_video_service.py'],
                cwd=python_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            
            # Give it a moment to start
            time.sleep(5)
            
            if self.python_service_process.poll() is None:
                print("✅ Python AI service started on http://localhost:5001")
                return True
            else:
                print("❌ Python AI service failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting Python service: {e}")
            return False
    
    def start_frontend(self):
        """Start the frontend development server"""
        print("🎨 Starting frontend development server...")
        
        frontend_dir = Path("hack/frontend")
        if not frontend_dir.exists():
            print("❌ Frontend directory not found")
            return False
            
        try:
            # Start frontend in background
            frontend_process = subprocess.Popen(
                ['npm', 'run', 'dev'],
                cwd=frontend_dir,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            
            time.sleep(3)
            
            if frontend_process.poll() is None:
                print("✅ Frontend server started on http://localhost:5173")
                return True
            else:
                print("❌ Frontend server failed to start")
                return False
                
        except Exception as e:
            print(f"❌ Error starting frontend: {e}")
            return False
    
    def monitor_services(self):
        """Monitor running services and display status"""
        print("\n" + "="*60)
        print("🎯 INTEGRATED AI MONITORING SYSTEM RUNNING")
        print("="*60)
        print("📊 Backend API:        http://localhost:3000")
        print("🤖 AI Detection API:   http://localhost:5001")
        print("🎨 Frontend Dashboard: http://localhost:5173")
        print("="*60)
        print("\n📱 To test the system:")
        print("1. Open the frontend dashboard in your browser")
        print("2. Navigate to Live Video Feed")
        print("3. Start a camera to begin AI detection")
        print("4. View real-time detection results and alerts")
        print("\n⚠️  Press Ctrl+C to stop all services")
        print("-"*60)
        
        self.running = True
        
        try:
            while self.running:
                # Check if processes are still running
                if self.backend_process and self.backend_process.poll() is not None:
                    print("❌ Backend process stopped unexpectedly")
                    break
                    
                if self.python_service_process and self.python_service_process.poll() is not None:
                    print("❌ Python service stopped unexpectedly")
                    break
                
                time.sleep(5)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Shutdown signal received...")
            self.stop_services()
    
    def stop_services(self):
        """Stop all running services"""
        print("🔄 Stopping all services...")
        
        self.running = False
        
        if self.backend_process:
            print("🛑 Stopping backend server...")
            self.backend_process.terminate()
            try:
                self.backend_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.backend_process.kill()
        
        if self.python_service_process:
            print("🛑 Stopping Python AI service...")
            self.python_service_process.terminate()
            try:
                self.python_service_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.python_service_process.kill()
        
        print("✅ All services stopped")
    
    def run(self):
        """Main execution method"""
        print("🚀 INTEGRATED AI MONITORING SYSTEM STARTUP")
        print("="*50)
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, lambda s, f: self.stop_services())
        signal.signal(signal.SIGTERM, lambda s, f: self.stop_services())
        
        # Check dependencies
        if not self.check_dependencies():
            print("❌ Dependency check failed")
            return False
        
        print("\n📦 Installing/updating dependencies...")
        
        # Install backend dependencies
        backend_dir = Path("hack/backend")
        if backend_dir.exists():
            subprocess.run(['npm', 'install'], cwd=backend_dir, capture_output=True)
        
        # Install frontend dependencies
        frontend_dir = Path("hack/frontend")
        if frontend_dir.exists():
            subprocess.run(['npm', 'install'], cwd=frontend_dir, capture_output=True)
        
        # Install Python dependencies
        python_dir = Path("python")
        if python_dir.exists():
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                         cwd=python_dir, capture_output=True)
        
        print("✅ Dependencies updated")
        
        # Start services in order
        if not self.start_backend():
            return False
            
        if not self.start_python_service():
            self.stop_services()
            return False
        
        # Optionally start frontend
        self.start_frontend()
        
        # Monitor services
        self.monitor_services()
        
        return True

def main():
    """Main entry point"""
    manager = IntegratedSystemManager()
    
    try:
        success = manager.run()
        if not success:
            print("❌ Failed to start integrated system")
            sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        manager.stop_services()
        sys.exit(1)

if __name__ == "__main__":
    main()
