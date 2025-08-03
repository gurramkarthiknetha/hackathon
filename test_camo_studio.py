#!/usr/bin/env python3
"""
Quick Camo Studio Camera Test
Run this script to test if your Camo Studio camera is working
"""

import cv2
import time
import sys
import os

# Add the AI model directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Ai-model', 'python'))

def test_camo_studio():
    """Test Camo Studio camera with different device indices and backends"""
    print("🎬 Camo Studio Camera Test")
    print("=" * 40)
    
    # Common Camo Studio device indices
    device_indices = [3, 4, 5, 6, 2, 1, 0]
    
    # Different backends to try
    backends = [
        (cv2.CAP_DSHOW, "DirectShow (Windows)"),
        (cv2.CAP_MSMF, "Media Foundation (Windows)"),
        (cv2.CAP_ANY, "Default Backend")
    ]
    
    working_configs = []
    
    for device_index in device_indices:
        print(f"\n🎥 Testing Device Index: {device_index}")
        
        for backend_id, backend_name in backends:
            print(f"  Trying {backend_name}...")
            
            try:
                cap = cv2.VideoCapture(device_index, backend_id)
                
                if cap.isOpened():
                    # Set properties for virtual cameras
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    cap.set(cv2.CAP_PROP_FPS, 30)
                    
                    # Get camera info
                    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                    fps = int(cap.get(cv2.CAP_PROP_FPS))
                    
                    print(f"    ✅ Camera opened: {width}x{height} @ {fps}fps")
                    
                    # Test frame reading
                    frames_read = 0
                    for i in range(5):
                        ret, frame = cap.read()
                        if ret and frame is not None:
                            frames_read += 1
                        time.sleep(0.1)
                    
                    print(f"    📊 Successfully read {frames_read}/5 frames")
                    
                    if frames_read >= 3:  # At least 3 out of 5 frames
                        working_configs.append({
                            'device': device_index,
                            'backend': backend_name,
                            'backend_id': backend_id,
                            'resolution': f"{width}x{height}",
                            'fps': fps,
                            'frames_read': frames_read
                        })
                        print(f"    🎉 This configuration works!")
                        
                        # Show preview for 2 seconds
                        print(f"    📺 Showing 2-second preview...")
                        start_time = time.time()
                        while time.time() - start_time < 2:
                            ret, frame = cap.read()
                            if ret:
                                cv2.imshow(f'Camo Studio - Device {device_index}', frame)
                                if cv2.waitKey(1) & 0xFF == ord('q'):
                                    break
                        cv2.destroyAllWindows()
                    
                    cap.release()
                    
                    if frames_read >= 3:
                        break  # Found working config for this device
                        
                else:
                    print(f"    ❌ Failed to open camera")
                    
            except Exception as e:
                print(f"    ❌ Error: {e}")
    
    # Summary
    print(f"\n📋 Test Results:")
    print("=" * 40)
    
    if working_configs:
        print(f"✅ Found {len(working_configs)} working configuration(s):")
        
        for i, config in enumerate(working_configs, 1):
            print(f"\n{i}. Device Index: {config['device']}")
            print(f"   Backend: {config['backend']}")
            print(f"   Resolution: {config['resolution']}")
            print(f"   FPS: {config['fps']}")
            print(f"   Frame Success Rate: {config['frames_read']}/5")
        
        # Recommend the best config
        best_config = max(working_configs, key=lambda x: x['frames_read'])
        print(f"\n🎯 RECOMMENDED CONFIGURATION:")
        print(f"   Device Index: {best_config['device']}")
        print(f"   Use this in your Camo Studio camera setup!")
        
        return best_config['device']
    else:
        print("❌ No working Camo Studio camera found!")
        print("\n🔧 Troubleshooting Tips:")
        print("1. Make sure Camo Studio app is running on your phone")
        print("2. Ensure your phone is connected via USB or WiFi")
        print("3. Check that Camo Studio virtual camera is installed")
        print("4. Try restarting the Camo Studio app")
        print("5. Make sure no other apps are using the camera")
        
        return None

def quick_test(device_index):
    """Quick test of a specific device index"""
    print(f"🎯 Quick test of device {device_index}")
    
    try:
        cap = cv2.VideoCapture(device_index, cv2.CAP_DSHOW)
        
        if cap.isOpened():
            ret, frame = cap.read()
            if ret:
                print("✅ Camera is working!")
                cv2.imshow(f'Camera Test - Device {device_index}', frame)
                print("Press any key to close...")
                cv2.waitKey(0)
                cv2.destroyAllWindows()
            else:
                print("❌ Camera opened but can't read frames")
            cap.release()
        else:
            print("❌ Failed to open camera")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🎬 Camo Studio Camera Tester")
    print("This tool will help you find the correct device index for your Camo Studio camera")
    print()
    
    if len(sys.argv) > 1:
        # Test specific device
        device_index = int(sys.argv[1])
        quick_test(device_index)
    else:
        # Full test
        recommended_device = test_camo_studio()
        
        if recommended_device is not None:
            print(f"\n🚀 To use this camera in the application:")
            print(f"1. Go to the Camera Manager in the web interface")
            print(f"2. Click 'Add Camera' and select 'Camo Studio'")
            print(f"3. Set Device Index to: {recommended_device}")
            print(f"4. Click 'Add Camera'")

if __name__ == "__main__":
    main()
