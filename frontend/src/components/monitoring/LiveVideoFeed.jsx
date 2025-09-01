import { useState, useEffect, useRef } from "react";

const LiveVideoFeed = ({ selectedIncident, currentCamera: propCurrentCamera }) => {
  console.log('LiveVideoFeed rendering with props:', { selectedIncident, propCurrentCamera });

  const [currentCamera, setCurrentCamera] = useState(propCurrentCamera);
  const [cameras, setCameras] = useState([]);
  const [videoError, setVideoError] = useState(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isUsingDeviceCamera, setIsUsingDeviceCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle');
  const videoRef = useRef(null);

  // Debug logging
  console.log('LiveVideoFeed state:', { 
    currentCamera, 
    isUsingDeviceCamera, 
    hasStream: !!stream,
    videoRef: !!videoRef.current 
  });

  // Video streaming service URLs
  const VIDEO_SERVICE_URL = import.meta.env.VITE_VIDEO_SERVICE_URL || 'http://localhost:5001';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // iPhone camera functions
  const startDeviceCamera = async (deviceId = null) => {
    try {
      setIsStartingCamera(true);
      setVideoError(null);

      // Build video constraints
      const videoConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };

      // If specific device ID is provided, use it; otherwise use default camera
      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        videoConstraints.facingMode = 'environment'; // Use back camera by default
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      setStream(mediaStream);
      setIsUsingDeviceCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element srcObject set:', videoRef.current.srcObject);
      }

      console.log('System camera started successfully', { 
        streamActive: mediaStream.active,
        tracks: mediaStream.getTracks().length 
      });
    } catch (error) {
      console.error('Error accessing system camera:', error);
      setVideoError(`Camera access denied: ${error.message}`);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopDeviceCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsUsingDeviceCamera(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const switchCamera = async () => {
    if (stream) {
      stopDeviceCamera();
      // Wait a moment before starting new camera
      setTimeout(async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isUsingDeviceCamera ? 'user' : 'environment', // Switch between front and back
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });

          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          setVideoError(`Error switching camera: ${error.message}`);
        }
      }, 100);
    }
  };

  // Capture frame and send to ML model for analysis
  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !stream) return;

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      context.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        
        try {
          setAiStatus('analyzing');
          const response = await fetch(`${API_URL}/ml/analyze/enhanced`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setDetectionResults(data);
            setAiStatus('active');
            console.log('Detection results:', data);
          } else {
            setAiStatus('error');
          }
        } catch (error) {
          console.error('Error analyzing frame:', error);
          setAiStatus('error');
        }
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('Error capturing frame:', error);
      setAiStatus('error');
    }
  };

  // Fetch detection results from AI service (for remote cameras)
  const fetchDetectionResults = async (cameraId) => {
    if (cameraId === 'iphone_camera' || (cameraId && cameraId.startsWith('system_'))) return;
    
    try {
      const response = await fetch(`${VIDEO_SERVICE_URL}/api/cameras/${cameraId}/detections`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDetectionResults(data.data);
          setAiStatus('active');
        }
      }
    } catch (error) {
      console.error('Error fetching detection results:', error);
      setAiStatus('error');
    }
  };

  // Update current camera when prop changes
  useEffect(() => {
    if (propCurrentCamera) {
      setCurrentCamera(propCurrentCamera);
    }
  }, [propCurrentCamera]);

  // Ensure video element gets stream when both are available
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      console.log('Setting srcObject on video element');
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Start AI analysis when camera is active
  useEffect(() => {
    let analysisInterval;
    
    if (stream && videoRef.current && videoRef.current.videoWidth > 0) {
      console.log('Starting AI analysis interval');
      setAiStatus('active');
      
      // Analyze frame every 2 seconds
      analysisInterval = setInterval(() => {
        captureAndAnalyzeFrame();
      }, 2000);
    }
    
    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [stream, videoRef.current?.videoWidth]);

  // Fetch cameras on mount and detect system cameras
  useEffect(() => {
    const fetchAllCameras = async () => {
      try {
        console.log('Fetching cameras...');
        
        // Detect system cameras
        let systemCameras = [];
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          
          systemCameras = videoDevices.map((device, index) => ({
            id: `system_${device.deviceId || index}`,
            name: device.label || `System Camera ${index + 1}`,
            type: 'system',
            deviceId: device.deviceId,
            status: 'available',
            location: 'Local System',
            source: 'device'
          }));
        }
        
        // Add fallback iPhone camera if no system cameras detected
        if (systemCameras.length === 0) {
          systemCameras = [{
            id: 'iphone_camera',
            name: 'iPhone Camera',
            status: 'available',
            location: 'Device Camera',
            source: 'device'
          }];
        }
        
        // Auto-select first system camera if no current camera is set
        if (!propCurrentCamera && systemCameras.length > 0) {
          setCurrentCamera(systemCameras[0].id);
        }
        
        // Fetch remote cameras
        try {
          const response = await fetch(`${API_URL}/cameras`, {
            credentials: 'include'
          });
          const data = await response.json();
          console.log('Remote cameras response:', data);

          if (data.success) {
            setCameras([...systemCameras, ...data.data]);
          } else {
            setCameras(systemCameras);
            // Only show error if no system cameras are available
            if (systemCameras.length === 0) {
              setVideoError(`Failed to fetch remote cameras: ${data.message}`);
            }
          }
          
          // Auto-select first system camera if no current camera is set
          if (!propCurrentCamera && systemCameras.length > 0) {
            setCurrentCamera(systemCameras[0].id);
          }
        } catch (error) {
          console.error('Error fetching remote cameras:', error);
          setCameras(systemCameras);
          // Only show error if no system cameras are available
          if (systemCameras.length === 0) {
            setVideoError(`Network error: ${error.message}`);
          }
          
          // Auto-select first system camera if no current camera is set
          if (!propCurrentCamera && systemCameras.length > 0) {
            setCurrentCamera(systemCameras[0].id);
          }
        }
      } catch (error) {
        console.error('Error detecting cameras:', error);
        // Ultimate fallback
        const fallbackCamera = {
          id: 'iphone_camera',
          name: 'iPhone Camera',
          status: 'available',
          location: 'Device Camera',
          source: 'device'
        };
        setCameras([fallbackCamera]);
        setVideoError(`Camera detection failed: ${error.message}`);
      }
    };

    fetchAllCameras();
  }, [API_URL]);

  // Fetch detection results periodically for active cameras
  useEffect(() => {
    if (currentCamera && currentCamera !== 'iphone_camera' && !(currentCamera && currentCamera.startsWith('system_'))) {
      const interval = setInterval(() => {
        fetchDetectionResults(currentCamera);
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDeviceCamera();
    };
  }, []);

  // Start camera function - handles both system cameras and remote cameras
  const startCamera = async (cameraId) => {
    try {
      setIsStartingCamera(true);
      console.log(`Starting camera: ${cameraId}`);

      // Handle system cameras (including iPhone camera)
      if (cameraId === 'iphone_camera' || (cameraId && cameraId.startsWith('system_'))) {
        // Extract device ID for system cameras
        let deviceId = null;
        if (cameraId && cameraId.startsWith('system_')) {
          const systemCamera = cameras.find(cam => cam.id === cameraId);
          deviceId = systemCamera?.deviceId;
        }
        await startDeviceCamera(deviceId);
        return;
      }

      // Handle remote cameras
      const response = await fetch(`${API_URL}/cameras/${cameraId}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Start camera response:', data);

      if (data.success) {
        // Stop device camera if it's running
        if (isUsingDeviceCamera) {
          stopDeviceCamera();
        }

        // Refresh cameras list to get updated status
        const camerasResponse = await fetch(`${API_URL}/cameras`, {
          credentials: 'include'
        });
        const camerasData = await camerasResponse.json();
        if (camerasData.success) {
          // Keep system cameras in the list
          const systemCameras = cameras.filter(cam => cam.source === 'device');
          setCameras([...systemCameras, ...camerasData.data]);
        }
        setVideoError(null);
      } else {
        setVideoError(`Failed to start camera: ${data.message}`);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setVideoError(`Error starting camera: ${error.message}`);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const currentCameraInfo = cameras.find(cam => cam.id === currentCamera);

  // AI Detection Status Component
  const AIDetectionStatus = () => {
    if (currentCamera === 'iphone_camera' || (currentCamera && currentCamera.startsWith('system_'))) {
      return (
        <div className="absolute top-4 left-4 bg-blue-500/20 px-3 py-2 rounded">
          <span className="text-blue-400 text-sm font-medium">SYSTEM CAMERA - AI Ready</span>
        </div>
      );
    }

    if (!detectionResults) {
      return (
        <div className="absolute top-4 left-4 bg-gray-500/20 px-3 py-2 rounded">
          <span className="text-gray-400 text-sm font-medium">AI: {aiStatus}</span>
        </div>
      );
    }

    const hasDetections = detectionResults.detections && 
      Object.values(detectionResults.detections).some(detection => detection.detected);

    return (
      <div className="absolute top-4 left-4 bg-green-500/20 px-3 py-2 rounded">
        <span className="text-green-400 text-sm font-medium">
          AI ACTIVE - {hasDetections ? 'DETECTIONS' : 'CLEAR'}
        </span>
      </div>
    );
  };

  // AI Detection Results Component
  const AIDetectionResults = () => {
    if (!detectionResults || currentCamera === 'iphone_camera' || (currentCamera && currentCamera.startsWith('system_'))) return null;

    const detections = detectionResults.detections || {};
    const activeDetections = Object.entries(detections).filter(([_, detection]) => detection.detected);

    if (activeDetections.length === 0) return null;

    return (
      <div className="absolute bottom-4 left-4 bg-red-600/90 px-4 py-3 rounded-lg max-w-sm">
        <h4 className="text-white font-bold mb-2">🚨 AI DETECTIONS</h4>
        <div className="space-y-1">
          {activeDetections.map(([eventType, detection]) => (
            <div key={eventType} className="flex justify-between items-center">
              <span className="text-white text-sm capitalize">{eventType}</span>
              <span className="text-yellow-300 text-sm font-bold">
                {(detection.confidence * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
        {detectionResults.person_count > 0 && (
          <div className="mt-2 pt-2 border-t border-red-400">
            <span className="text-white text-sm">
              👥 {detectionResults.person_count} people detected
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Live Video Feed</h2>
            <p className="text-gray-300">Camera: {currentCameraInfo?.name || currentCamera}</p>
            {cameras.length > 0 && (
              <p className="text-sm text-gray-400">
                Status: {currentCamera === 'iphone_camera' ?
                  (isUsingDeviceCamera ? 'active' : 'available') :
                  (currentCameraInfo?.status || 'Unknown')
                } |
                Total Cameras: {cameras.length}
              </p>
            )}
          </div>

          {/* Camera Selector */}
          {cameras.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Camera:</label>
              <select
                value={currentCamera}
                onChange={(e) => {
                  const newCamera = e.target.value;
                  // Stop current device camera if switching away from system camera
                  if ((currentCamera === 'iphone_camera' || (currentCamera && currentCamera.startsWith('system_'))) && isUsingDeviceCamera) {
                    stopDeviceCamera();
                  }
                  setCurrentCamera(newCamera);
                }}
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name} ({camera.id === 'iphone_camera' ?
                      (isUsingDeviceCamera ? 'active' : 'available') :
                      camera.status
                    })
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {videoError ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300">{videoError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        ) : stream ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => setVideoError(null)}
              onError={() => setVideoError('Failed to load camera stream')}
            />

            {/* AI Status for System Camera */}
            <AIDetectionStatus />
            
            {/* Detection Results Overlay */}
            {detectionResults && detectionResults.detections && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
                <h4 className="font-semibold mb-2">AI Detection Results</h4>
                <p>Objects: {detectionResults.detections.length}</p>
                <p>Persons: {detectionResults.person_count || 0}</p>
                {detectionResults.emergency_detected && (
                  <p className="text-red-400 font-bold">⚠️ {detectionResults.emergency_type}</p>
                )}
                <div className="text-xs mt-2">
                  {detectionResults.detected_objects?.slice(0, 3).map((obj, i) => (
                    <span key={i} className="bg-blue-600 px-2 py-1 rounded mr-1">{obj}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : currentCameraInfo?.status === 'active' && currentCamera !== 'iphone_camera' ? (
          <div className="w-full h-full relative">
            <img
              src={`${VIDEO_SERVICE_URL}/api/video_feed/${currentCamera}?t=${Date.now()}`}
              alt={`${currentCameraInfo?.name} feed`}
              className="w-full h-full object-cover"
              onError={() => setVideoError('Failed to load video stream')}
              onLoad={() => setVideoError(null)}
            />

            {/* AI Detection Status */}
            <AIDetectionStatus />

            {/* AI Detection Results */}
            <AIDetectionResults />
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              System Camera Ready
            </h3>
            <p className="text-gray-500 mb-4">
              Click "Start Camera" to access your system camera
            </p>
            
            {currentCamera && <p className="text-sm text-gray-400 mb-2">Camera ID: {currentCamera}</p>}
            {currentCameraInfo && <p className="text-sm text-gray-400 mb-4">Location: {currentCameraInfo.location}</p>}
            
            <button
              onClick={() => startCamera(currentCamera || 'iphone_camera')}
              disabled={isStartingCamera}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              {isStartingCamera ? 'Starting Camera...' : 'Start System Camera'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVideoFeed;