import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import LiveVideoFeed from "../../components/monitoring/LiveVideoFeed";
import CameraManager from "../../components/monitoring/CameraManager";
import { useState } from "react";
import { Camera, Eye, Settings, Maximize2, Volume2, VolumeX, Target, AlertTriangle, Activity } from "lucide-react";

const LiveVideoFeedPage = () => {
  const { sidebarOpen } = useSidebar();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState("cam_east_01");

  // Mock data for maximum accuracy levels - replace with real data from your backend
  const maxAccuracyLevels = {
    person: 0.94,
    stampede: 0.00,
    medicalEmergency: 0.20,
    fire: 0.00,
    smoke: 0.20,
    running: 0.30,
    fallen: 0.00,
    ke: 1.00, // Additional detection category
    violence: 0.85,
    crowdDensity: 0.78,
    weapon: 0.92,
    suspiciousActivity: 0.67
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 0.8) return "text-green-400";
    if (accuracy >= 0.6) return "text-yellow-400";
    if (accuracy >= 0.4) return "text-orange-400";
    return "text-red-400";
  };

  const getAccuracyBarColor = (accuracy) => {
    if (accuracy >= 0.8) return "bg-green-500";
    if (accuracy >= 0.6) return "bg-yellow-500";
    if (accuracy >= 0.4) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 text-transparent bg-clip-text mb-2">
            Live Video Feed
          </h1>
          <p className="text-gray-300">
            Monitor all zones with real-time video surveillance and AI-powered detection
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              audioEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            <Maximize2 size={20} />
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Camera Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">-</p>
              <p className="text-gray-400 text-sm">Active Cameras</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">24/7</p>
              <p className="text-gray-400 text-sm">Monitoring</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">1080p</p>
              <p className="text-gray-400 text-sm">Resolution</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Volume2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">30fps</p>
              <p className="text-gray-400 text-sm">Frame Rate</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Maximum Accuracy Levels Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Maximum Accuracy Levels</h2>
            <p className="text-gray-400 text-sm">Real-time detection confidence scores</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Object.entries(maxAccuracyLevels).map(([key, accuracy]) => (
            <div key={key} className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`text-sm font-bold ${getAccuracyColor(accuracy)}`}>
                  {(accuracy * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getAccuracyBarColor(accuracy)}`}
                  style={{ width: `${accuracy * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Maximum Accuracy Levels - Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Accuracy Levels</h2>
                <p className="text-gray-400 text-xs">Detection scores</p>
              </div>
            </div>

            <div className="space-y-3">
              {Object.entries(maxAccuracyLevels).map(([key, accuracy]) => (
                <div key={key} className="bg-gray-800 bg-opacity-50 rounded-lg p-2 border border-gray-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-300 capitalize truncate">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`text-xs font-bold ${getAccuracyColor(accuracy)}`}>
                      {(accuracy * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${getAccuracyBarColor(accuracy)}`}
                      style={{ width: `${accuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Camera List - Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-full">
            <CameraManager
              onCameraSelect={setSelectedCamera}
              selectedCamera={selectedCamera}
            />
          </div>
        </motion.div>

        {/* Main Video Feed - Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-6"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]">
            <LiveVideoFeed selectedIncident={selectedIncident} currentCamera={selectedCamera} />
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default LiveVideoFeedPage;
