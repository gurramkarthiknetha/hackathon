#!/usr/bin/env python3
"""
Camera Testing Script
Test different camera devices to help debug Camo Studio integration
"""

import cv2
import time
import sys

def test_camera_device(device_index, backend=cv2.CAP_ANY):
    """Test a specific camera device with a given backend"""
    print(f"\n--- Testing Device {device_index} with Backend {backend} ---")
    
    try:
        cap = cv2.VideoCapture(device_index, backend)
        
        if not cap.isOpened():
            print(f"❌ Failed to open device {device_index}")
            return False
        
        # Get camera properties
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        print(f"📹 Camera opened successfully!")
        print(f"   Resolution: {width}x{height}")
        print(f"   FPS: {fps}")
        
        # Try to read frames
        success_count = 0
        for attempt in range(10):
            ret, frame = cap.read()
            if ret and frame is not None:
                success_count += 1
                if attempt == 0:
                    print(f"✅ First frame read successfully")
            else:
                print(f"❌ Failed to read frame on attempt {attempt + 1}")
            
            time.sleep(0.1)
        
        print(f"📊 Successfully read {success_count}/10 frames")
        
        cap.release()
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Error testing device {device_index}: {e}")
        return False

def detect_all_cameras():
    """Detect all available camera devices"""
    print("🔍 Detecting available camera devices...")
    
    available_devices = []
    backends = [
        (cv2.CAP_ANY, "CAP_ANY"),
        (cv2.CAP_DSHOW, "CAP_DSHOW"),
        (cv2.CAP_MSMF, "CAP_MSMF")
    ]
    
    for device_index in range(10):  # Test devices 0-9
        print(f"\n🎥 Testing Device {device_index}:")
        
        device_working = False
        for backend_id, backend_name in backends:
            print(f"  Trying {backend_name}...")
            if test_camera_device(device_index, backend_id):
                device_working = True
                available_devices.append({
                    'index': device_index,
                    'backend': backend_name,
                    'backend_id': backend_id
                })
                break  # Found working backend for this device
        
        if not device_working:
            print(f"  ❌ Device {device_index} not available")
    
    return available_devices

def test_camo_studio_specifically():
    """Test specifically for Camo Studio cameras (usually device 3 or 4)"""
    print("\n🎯 Testing specifically for Camo Studio cameras...")
    
    camo_devices = [3, 4, 5, 6]  # Common Camo Studio device indices
    
    for device_index in camo_devices:
        print(f"\n--- Testing potential Camo Studio device {device_index} ---")
        
        # Try with different backends
        backends = [
            (cv2.CAP_DSHOW, "DirectShow"),
            (cv2.CAP_MSMF, "Media Foundation"),
            (cv2.CAP_ANY, "Default")
        ]
        
        for backend_id, backend_name in backends:
            print(f"Trying {backend_name} backend...")
            
            try:
                cap = cv2.VideoCapture(device_index, backend_id)
                
                if cap.isOpened():
                    # Set properties that work well with virtual cameras
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    cap.set(cv2.CAP_PROP_FPS, 30)
                    
                    # Get properties
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    fps = int(cap.get(cv2.CAP_PROP_FPS))
                    
                    print(f"  ✅ Opened with {backend_name}: {width}x{height} @ {fps}fps")
                    
                    # Test frame reading
                    frame_count = 0
                    for i in range(5):
                        ret, frame = cap.read()
                        if ret and frame is not None:
                            frame_count += 1
                        time.sleep(0.2)
                    
                    print(f"  📊 Read {frame_count}/5 test frames")
                    
                    if frame_count > 0:
                        print(f"  🎉 Device {device_index} with {backend_name} appears to be working!")
                        
                        # Show a preview window for 3 seconds
                        print("  📺 Showing preview for 3 seconds...")
                        start_time = time.time()
                        while time.time() - start_time < 3:
                            ret, frame = cap.read()
                            if ret:
                                cv2.imshow(f'Camo Studio Test - Device {device_index}', frame)
                                if cv2.waitKey(1) & 0xFF == ord('q'):
                                    break
                        
                        cv2.destroyAllWindows()
                    
                    cap.release()
                    
                    if frame_count > 0:
                        return device_index, backend_id
                
            except Exception as e:
                print(f"  ❌ Error with {backend_name}: {e}")
    
    return None, None

def main():
    print("🎬 Camera Detection and Testing Tool")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        # Test specific device
        device_index = int(sys.argv[1])
        print(f"Testing specific device: {device_index}")
        test_camera_device(device_index)
    else:
        # Full detection
        print("Running full camera detection...")
        
        # Detect all cameras
        available = detect_all_cameras()
        
        print(f"\n📋 Summary: Found {len(available)} working camera devices:")
        for device in available:
            print(f"  - Device {device['index']} (Backend: {device['backend']})")
        
        # Test specifically for Camo Studio
        camo_device, camo_backend = test_camo_studio_specifically()
        
        if camo_device is not None:
            print(f"\n🎯 Recommended Camo Studio settings:")
            print(f"   Device Index: {camo_device}")
            print(f"   Backend: {camo_backend}")
        else:
            print(f"\n❌ No working Camo Studio camera found")
            print("   Make sure Camo Studio is running and connected to your phone")

if __name__ == "__main__":
    main()
