#!/usr/bin/env python3
"""
Test script to generate real-time alerts for the AI Event Monitor system.
"""

import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000/api"

def login():
    """Login and get authentication cookie"""
    login_data = {
        "email": "test@example.com",
        "password": "Test12345!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        print("✅ Login successful")
        return response.cookies
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def create_user():
    """Create a test user"""
    user_data = {
        "email": "test@example.com",
        "password": "Test12345!",
        "name": "Test User",
        "role": "operator"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=user_data)
    if response.status_code == 200:
        print("✅ User created successfully")
        return response.cookies
    else:
        print(f"❌ User creation failed: {response.text}")
        return None

def generate_test_incident(cookies):
    """Generate a single test incident"""
    response = requests.post(f"{BASE_URL}/test/generate-incident", cookies=cookies)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Generated incident: {data['incident']['type']} in {data['incident']['zone']}")
        return True
    else:
        print(f"❌ Failed to generate incident: {response.text}")
        return False

def generate_multiple_incidents(cookies, count=5):
    """Generate multiple test incidents"""
    response = requests.post(f"{BASE_URL}/test/generate-multiple-incidents?count={count}", cookies=cookies)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Generated {len(data['incidents'])} incidents")
        return True
    else:
        print(f"❌ Failed to generate incidents: {response.text}")
        return False

def simulate_ml_detection(cookies):
    """Simulate ML detection system"""
    response = requests.post(f"{BASE_URL}/test/simulate-ml-detection", cookies=cookies)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ ML Detection: {data['incident']['type']} ({data['incident']['confidence']}% confidence)")
        return True
    else:
        print(f"❌ Failed to simulate ML detection: {response.text}")
        return False

def main():
    print("🚀 Testing Real-Time Alerts System")
    print("=" * 50)
    
    # Try to login first
    cookies = login()
    
    # If login fails, create user
    if not cookies:
        print("Creating test user...")
        cookies = create_user()
    
    if not cookies:
        print("❌ Authentication failed. Cannot proceed with tests.")
        return
    
    print("\n📡 Generating test incidents...")
    
    # Generate single incident
    generate_test_incident(cookies)
    time.sleep(1)
    
    # Generate multiple incidents
    generate_multiple_incidents(cookies, 3)
    time.sleep(1)
    
    # Simulate ML detection
    simulate_ml_detection(cookies)
    time.sleep(1)
    
    # Generate a few more for demo
    print("\n🎭 Generating demo scenarios...")
    for i in range(3):
        if i % 2 == 0:
            generate_test_incident(cookies)
        else:
            simulate_ml_detection(cookies)
        time.sleep(2)
    
    print("\n✅ Test completed! Check your Real-Time Alerts page to see the incidents.")

if __name__ == "__main__":
    main()
