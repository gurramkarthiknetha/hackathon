import { useState, useEffect, useRef } from "react";

const LiveVideoFeed = ({ selectedIncident, currentCamera: propCurrentCamera }) => {
  console.log('LiveVideoFeed rendering with props:', { selectedIncident, propCurrentCamera });

  const [currentCamera, setCurrentCamera] = useState(propCurrentCamera || "iphone_camera");
  const [cameras, setCameras] = useState([]);
  const [videoError, setVideoError] = useState(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isUsingDeviceCamera, setIsUsingDeviceCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle');
  const videoRef = useRef(null);

  // Video streaming service URLs
  const VIDEO_SERVICE_URL = import.meta.env.VITE_VIDEO_SERVICE_URL || 'http://localhost:5001';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // iPhone camera functions
  const startDeviceCamera = async () => {
    try {
      setIsStartingCamera(true);
      setVideoError(null);

      // Request camera access with iPhone-optimized constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera by default
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsUsingDeviceCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      console.log('iPhone camera started successfully');
    } catch (error) {
      console.error('Error accessing iPhone camera:', error);
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

  // Fetch detection results from AI service
  const fetchDetectionResults = async (cameraId) => {
    if (cameraId === 'iphone_camera') return;
    
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

  // Fetch cameras on mount and add iPhone camera option
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log('Fetching cameras...');
        const response = await fetch(`${API_URL}/cameras`, {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Cameras response:', data);

        // Add iPhone camera as an option
        const iPhoneCamera = {
          id: 'iphone_camera',
          name: 'iPhone Camera',
          status: 'available',
          location: 'Device Camera',
          source: 'device'
        };

        if (data.success) {
          setCameras([iPhoneCamera, ...data.data]);
        } else {
          // If API fails, still show iPhone camera option
          setCameras([iPhoneCamera]);
          setVideoError(`Failed to fetch remote cameras: ${data.message}`);
        }
      } catch (error) {
        console.error('Error fetching cameras:', error);
        // Fallback to iPhone camera only
        const iPhoneCamera = {
          id: 'iphone_camera',
          name: 'iPhone Camera',
          status: 'available',
          location: 'Device Camera',
          source: 'device'
        };
        setCameras([iPhoneCamera]);
        setVideoError(`Network error: ${error.message}`);
      }
    };

    fetchCameras();
  }, [API_URL]);

  // Fetch detection results periodically for active cameras
  useEffect(() => {
    if (currentCamera && currentCamera !== 'iphone_camera') {
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

  // Start camera function - handles both iPhone camera and remote cameras
  const startCamera = async (cameraId) => {
    try {
      setIsStartingCamera(true);
      console.log(`Starting camera: ${cameraId}`);

      // Handle iPhone camera
      if (cameraId === 'iphone_camera') {
        await startDeviceCamera();
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
          // Keep iPhone camera in the list
          const iPhoneCamera = {
            id: 'iphone_camera',
            name: 'iPhone Camera',
            status: 'available',
            location: 'Device Camera',
            source: 'device'
          };
          setCameras([iPhoneCamera, ...camerasData.data]);
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
    if (currentCamera === 'iphone_camera') {
      return (
        <div className="absolute top-4 left-4 bg-blue-500/20 px-3 py-2 rounded">
          <span className="text-blue-400 text-sm font-medium">DEVICE CAMERA - AI Ready</span>
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
    if (!detectionResults || currentCamera === 'iphone_camera') return null;

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
                  // Stop current device camera if switching away from iPhone camera
                  if (currentCamera === 'iphone_camera' && isUsingDeviceCamera) {
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
        ) : currentCamera === 'iphone_camera' && isUsingDeviceCamera ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => setVideoError(null)}
              onError={() => setVideoError('Failed to load iPhone camera stream')}
            />

            {/* AI Status for iPhone Camera */}
            <AIDetectionStatus />
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
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              {currentCamera === 'iphone_camera' ? 'iPhone Camera Ready' : 'Camera Inactive'}
            </h3>
            <p className="text-gray-500">
              {currentCamera === 'iphone_camera'
                ? 'Click "Start Camera" to access your iPhone camera'
                : 'Please start the camera to view the feed'
              }
            </p>
            {currentCameraInfo && (
              <div className="mt-4">
                <p className="text-sm text-gray-400">Camera ID: {currentCamera}</p>
                <p className="text-sm text-gray-400">Location: {currentCameraInfo.location}</p>
                <button
                  onClick={() => startCamera(currentCamera)}
                  disabled={isStartingCamera}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                >
                  {isStartingCamera ? 'Starting...' :
                   currentCamera === 'iphone_camera' ? 'Start iPhone Camera' : 'Start Camera'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVideoFeed;