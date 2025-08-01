import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import LiveVideoFeed from "../../components/monitoring/LiveVideoFeed";
import { useState } from "react";
import { Camera, Eye, Settings, Maximize2, Volume2, VolumeX } from "lucide-react";

const LiveVideoFeedPage = () => {
  const { sidebarOpen } = useSidebar();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Mock camera data
  const cameras = [
    { id: "cam_east_01", name: "East Zone Cam 1", zone: "east_zone", status: "active", location: "Main Entrance" },
    { id: "cam_east_02", name: "East Zone Cam 2", zone: "east_zone", status: "active", location: "Food Court" },
    { id: "cam_west_01", name: "West Zone Cam 1", zone: "west_zone", status: "active", location: "Parking Area" },
    { id: "cam_north_01", name: "North Zone Cam 1", zone: "north_zone", status: "active", location: "Emergency Exit" },
    { id: "cam_south_01", name: "South Zone Cam 1", zone: "south_zone", status: "active", location: "Stage Area" },
  ];

  const [selectedCamera, setSelectedCamera] = useState(cameras[0]);

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
              <p className="text-2xl font-bold text-white">{cameras.filter(c => c.status === 'active').length}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Camera List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Camera Feeds</h3>
              <p className="text-gray-400 text-sm">Select a camera to view</p>
            </div>
            
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {cameras.map((camera) => (
                <motion.button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera)}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedCamera.id === camera.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{camera.name}</p>
                      <p className="text-xs opacity-75">{camera.location}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      camera.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Video Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]">
            <LiveVideoFeed selectedIncident={selectedIncident} selectedCamera={selectedCamera} />
          </div>
        </motion.div>
      </div>

      {/* Camera Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Camera Controls</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Zoom Level</label>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue="1"
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Brightness</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contrast</label>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">AI Detection Overlay</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Motion Detection</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Night Vision</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
              Record
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
              Snapshot
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveVideoFeedPage;
