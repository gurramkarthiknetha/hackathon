import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Camera, 
  Play, 
  Square,
  Settings,
  Wifi,
  WifiOff,
  Plus,
  Trash2,
  RefreshCw
} from "lucide-react";

const CameraManager = ({ onCameraSelect, selectedCamera }) => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddCamera, setShowAddCamera] = useState(false);
  const [cameraType, setCameraType] = useState("droidcam"); // "droidcam" or "ipwebcam"
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [newCameraConfig, setNewCameraConfig] = useState({
    name: "",
    ip_address: "",
    webcam_url: "",
    zone: "",
    location: ""
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/video/cameras`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setCameras(data.data);
      }
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async (cameraId) => {
    try {
      const response = await fetch(`${API_URL}/video/cameras/${cameraId}/start`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchCameras();
      }
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const stopCamera = async (cameraId) => {
    try {
      const response = await fetch(`${API_URL}/video/cameras/${cameraId}/stop`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchCameras();
      }
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
  };

  const addDroidCam = async () => {
    if (isConfiguring) return; // Prevent duplicate requests

    setIsConfiguring(true);
    try {
      const response = await fetch(`${API_URL}/video/cameras/droidcam/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          ip_address: newCameraConfig.ip_address,
          camera_id: `droidcam_${Date.now()}`,
          camera_name: newCameraConfig.name
        })
      });
      const data = await response.json();

      if (data.success) {
        await fetchCameras();
        setShowAddCamera(false);
        resetCameraConfig();
      }
    } catch (error) {
      console.error('Error adding DroidCam:', error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const addIPWebcam = async () => {
    if (isConfiguring) return; // Prevent duplicate requests

    setIsConfiguring(true);
    try {
      const response = await fetch(`${API_URL}/video/cameras/ipwebcam/configure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          webcam_url: newCameraConfig.webcam_url,
          camera_id: `ipwebcam_${Date.now()}`,
          camera_name: newCameraConfig.name
        })
      });
      const data = await response.json();

      if (data.success) {
        await fetchCameras();
        setShowAddCamera(false);
        resetCameraConfig();
      }
    } catch (error) {
      console.error('Error adding IP Webcam:', error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const resetCameraConfig = () => {
    setNewCameraConfig({
      name: "",
      ip_address: "",
      webcam_url: "",
      zone: "",
      location: ""
    });
    setCameraType("droidcam");
  };

  const handleAddCamera = async () => {
    if (isConfiguring) return; // Prevent duplicate requests

    setIsConfiguring(true);
    try {
      if (cameraType === "droidcam") {
        await addDroidCam();
      } else {
        await addIPWebcam();
      }
    } finally {
      setIsConfiguring(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-400';
      case 'inactive':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-400';
      default:
        return 'bg-yellow-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Wifi className="h-4 w-4 text-green-400" />;
      case 'inactive':
        return <WifiOff className="h-4 w-4 text-gray-400" />;
      default:
        return <WifiOff className="h-4 w-4 text-yellow-400" />;
    }
  };

  return (
    <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Camera Feeds</h3>
            <p className="text-gray-400 text-sm">Select a camera to view</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchCameras}
              disabled={loading}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddCamera(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
        {cameras.map((camera) => (
          <motion.div
            key={camera.id}
            className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedCamera === camera.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-blue-400'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
            }`}
            onClick={() => onCameraSelect(camera.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5" />
                <div>
                  <p className="font-medium">{camera.name}</p>
                  <p className="text-xs opacity-75">{camera.location}</p>
                  <p className="text-xs opacity-60">{camera.zone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Status Indicator */}
                <div className="flex items-center space-x-1">
                  {getStatusIcon(camera.status)}
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(camera.status)}`}></div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center space-x-1">
                  {camera.status === 'active' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        stopCamera(camera.id);
                      }}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      <Square className="h-3 w-3 text-white" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera(camera.id);
                      }}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
                    >
                      <Play className="h-3 w-3 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {cameras.length === 0 && !loading && (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No cameras available</p>
            <p className="text-gray-500 text-sm">Add a camera to get started</p>
          </div>
        )}
      </div>
      
      {/* Add Camera Modal */}
      {showAddCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-white text-lg font-semibold mb-4">Add Camera</h3>

            <div className="space-y-4">
              {/* Camera Type Selection */}
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Camera Type
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCameraType("droidcam")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      cameraType === "droidcam"
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    DroidCam
                  </button>
                  <button
                    onClick={() => setCameraType("ipwebcam")}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      cameraType === "ipwebcam"
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    IP Webcam
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Camera Name
                </label>
                <input
                  type="text"
                  value={newCameraConfig.name}
                  onChange={(e) => setNewCameraConfig({...newCameraConfig, name: e.target.value})}
                  placeholder={cameraType === "droidcam" ? "My DroidCam" : "My IP Webcam"}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {cameraType === "droidcam" ? (
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={newCameraConfig.ip_address}
                    onChange={(e) => setNewCameraConfig({...newCameraConfig, ip_address: e.target.value})}
                    placeholder="192.168.1.100"
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Enter the IP address shown in your DroidCam app
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Webcam URL
                  </label>
                  <input
                    type="text"
                    value={newCameraConfig.webcam_url}
                    onChange={(e) => setNewCameraConfig({...newCameraConfig, webcam_url: e.target.value})}
                    placeholder="http://10.100.15.86:8080/"
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Enter the full URL of your IP webcam
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddCamera(false);
                    resetCameraConfig();
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCamera}
                  disabled={isConfiguring || (cameraType === "droidcam" ? !newCameraConfig.ip_address : !newCameraConfig.webcam_url)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isConfiguring ? 'Adding...' : 'Add Camera'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraManager;
