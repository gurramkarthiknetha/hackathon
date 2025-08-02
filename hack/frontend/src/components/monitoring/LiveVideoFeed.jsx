import { useState, useEffect } from "react";

const LiveVideoFeed = ({ selectedIncident, currentCamera: propCurrentCamera }) => {
  console.log('LiveVideoFeed rendering with props:', { selectedIncident, propCurrentCamera });

  const [currentCamera, setCurrentCamera] = useState(propCurrentCamera || "cam_east_01");
  const [cameras, setCameras] = useState([]);
  const [videoError, setVideoError] = useState(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  // Video streaming service URLs
  const VIDEO_SERVICE_URL = import.meta.env.VITE_VIDEO_SERVICE_URL || 'http://localhost:5001';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Update current camera when prop changes
  useEffect(() => {
    if (propCurrentCamera) {
      setCurrentCamera(propCurrentCamera);
    }
  }, [propCurrentCamera]);

  // Fetch cameras on mount
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        console.log('Fetching cameras...');
        const response = await fetch(`${API_URL}/video/cameras`, {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Cameras response:', data);

        if (data.success) {
          setCameras(data.data);
        } else {
          setVideoError(`Failed to fetch cameras: ${data.message}`);
        }
      } catch (error) {
        console.error('Error fetching cameras:', error);
        setVideoError(`Network error: ${error.message}`);
      }
    };

    fetchCameras();
  }, [API_URL]);

  // Start camera function
  const startCamera = async (cameraId) => {
    try {
      setIsStartingCamera(true);
      console.log(`Starting camera: ${cameraId}`);

      const response = await fetch(`${API_URL}/video/cameras/${cameraId}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Start camera response:', data);

      if (data.success) {
        // Refresh cameras list to get updated status
        const camerasResponse = await fetch(`${API_URL}/video/cameras`, {
          credentials: 'include'
        });
        const camerasData = await camerasResponse.json();
        if (camerasData.success) {
          setCameras(camerasData.data);
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

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Live Video Feed</h2>
            <p className="text-gray-300">Camera: {currentCameraInfo?.name || currentCamera}</p>
            {cameras.length > 0 && (
              <p className="text-sm text-gray-400">
                Status: {currentCameraInfo?.status || 'Unknown'} |
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
                onChange={(e) => setCurrentCamera(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name} ({camera.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
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
        ) : currentCameraInfo?.status === 'active' ? (
          <div className="w-full h-full relative">
            <img
              src={`${VIDEO_SERVICE_URL}/api/video_feed/${currentCamera}?t=${Date.now()}`}
              alt={`${currentCameraInfo?.name} feed`}
              className="w-full h-full object-cover"
              onError={() => setVideoError('Failed to load video stream')}
              onLoad={() => setVideoError(null)}
            />
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Camera Inactive</h3>
            <p className="text-gray-500">Please start the camera to view the feed</p>
            {currentCameraInfo && (
              <div className="mt-4">
                <p className="text-sm text-gray-400">Camera ID: {currentCamera}</p>
                <p className="text-sm text-gray-400">Location: {currentCameraInfo.location}</p>
                <button
                  onClick={() => startCamera(currentCamera)}
                  disabled={isStartingCamera}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
                >
                  {isStartingCamera ? 'Starting...' : 'Start Camera'}
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