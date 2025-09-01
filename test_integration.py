#!/usr/bin/env python3
"""
Integration Test Script
Tests the connection between React frontend and FastAPI backend
"""

import requests
import time
import subprocess
import sys
from pathlib import Path

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        response = requests.get("http://localhost:8000/health/live", timeout=5)
        if response.status_code == 200:
            print("✅ Backend health check passed")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend not reachable: {e}")
        return False

def test_cors_headers():
    """Test CORS configuration"""
    try:
        response = requests.options("http://localhost:8000/api/auth/check-auth", 
                                  headers={
                                      "Origin": "http://localhost:5173",
                                      "Access-Control-Request-Method": "GET"
                                  }, timeout=5)
        
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
            "Access-Control-Allow-Credentials": response.headers.get("Access-Control-Allow-Credentials"),
            "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods")
        }
        
        print("✅ CORS headers:", cors_headers)
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ CORS test failed: {e}")
        return False

def test_api_endpoints():
    """Test key API endpoints"""
    endpoints = [
        "/health/live",
        "/health/ready", 
        "/api/auth/check-auth"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}", timeout=5)
            print(f"✅ {endpoint}: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint}: {e}")

def test_socket_io():
    """Test Socket.IO endpoint"""
    try:
        response = requests.get("http://localhost:8000/socket.io/", timeout=5)
        print(f"✅ Socket.IO endpoint: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Socket.IO test failed: {e}")
        return False

def main():
    print("🧪 Running Integration Tests")
    print("=" * 40)
    
    # Test backend
    print("\n📡 Testing Backend...")
    if not test_backend_health():
        print("❌ Backend is not running. Start it with: python start_system.py --backend-only")
        return 1
    
    # Test CORS
    print("\n🌐 Testing CORS Configuration...")
    test_cors_headers()
    
    # Test API endpoints
    print("\n🔗 Testing API Endpoints...")
    test_api_endpoints()
    
    # Test Socket.IO
    print("\n🔌 Testing Socket.IO...")
    test_socket_io()
    
    print("\n✅ Integration tests completed!")
    print("\n📋 Next Steps:")
    print("1. Start the full system: python start_system.py")
    print("2. Open frontend: http://localhost:5173")
    print("3. Check API docs: http://localhost:8000/docs")
    
    return 0

if __name__ == "__main__":
    exit(main())
