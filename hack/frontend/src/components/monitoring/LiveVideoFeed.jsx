import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Camera, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  AlertTriangle,
  Eye,
  Zap
} from "lucide-react";

const LiveVideoFeed = ({ selectedIncident }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentCamera, setCurrentCamera] = useState("cam_east_01");
  const [detectionOverlay, setDetectionOverlay] = useState(true);

  // Mock camera feeds
  const cameras = [
    { id: "cam_east_01", name: "East Zone Cam 1", zone: "east_zone", status: "active" },
    { id: "cam_east_02", name: "East Zone Cam 2", zone: "east_zone", status: "active" },
    { id: "cam_west_01", name: "West Zone Cam 1", zone: "west_zone", status: "active" },
    { id: "cam_north_01", name: "North Zone Cam 1", zone: "north_zone", status: "active" },
    { id: "cam_south_01", name: "South Zone Cam 1", zone: "south_zone", status: "active" }
  ];

  // Mock bounding boxes for AI detection
  const [boundingBoxes, setBoundingBoxes] = useState([]);

  useEffect(() => {
    // Simulate AI detection updates
    const interval = setInterval(() => {
      if (detectionOverlay) {
        // Generate random bounding boxes for demo
        const boxes = [];
        const numBoxes = Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numBoxes; i++) {
          boxes.push({
            id: i,
            x: Math.random() * 60 + 10, // 10-70% from left
            y: Math.random() * 60 + 10, // 10-70% from top
            width: Math.random() * 15 + 10, // 10-25% width
            height: Math.random() * 20 + 15, // 15-35% height
            label: ["person", "crowd", "vehicle", "object"][Math.floor(Math.random() * 4)],
            confidence: Math.floor(Math.random() * 30 + 70), // 70-100%
            color: ["border-green-400", "border-yellow-400", "border-red-400"][Math.floor(Math.random() * 3)]
          });
        }
        setBoundingBoxes(boxes);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [detectionOverlay]);

  // Switch camera when incident is selected
  useEffect(() => {
    if (selectedIncident && selectedIncident.zone) {
      const zoneCamera = cameras.find(cam => cam.zone === selectedIncident.zone);
      if (zoneCamera) {
        setCurrentCamera(zoneCamera.id);
      }
    }
  }, [selectedIncident]);

  const currentCameraInfo = cameras.find(cam => cam.id === currentCamera);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Live Video Feed</h3>
              <p className="text-gray-400 text-sm">{currentCameraInfo?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-xs font-medium">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        {/* Mock Video Feed */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
          {/* Simulated video background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
          
          {/* Camera feed placeholder */}
          <div className="text-center z-10">
            <Eye className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Camera Feed: {currentCameraInfo?.name}</p>
            <p className="text-gray-500 text-sm mt-1">Streaming at 1080p • 30fps</p>
          </div>

          {/* AI Detection Overlay */}
          {detectionOverlay && boundingBoxes.map((box) => (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute border-2 ${box.color} bg-black/20 backdrop-blur-sm`}
              style={{
                left: `${box.x}%`,
                top: `${box.y}%`,
                width: `${box.width}%`,
                height: `${box.height}%`,
              }}
            >
              <div className={`absolute -top-6 left-0 px-2 py-1 text-xs font-medium rounded ${
                box.color.includes('red') ? 'bg-red-500' : 
                box.color.includes('yellow') ? 'bg-yellow-500' : 'bg-green-500'
              } text-white`}>
                {box.label} {box.confidence}%
              </div>
            </motion.div>
          ))}

          {/* Incident Alert Overlay */}
          {selectedIncident && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-red-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-medium">{selectedIncident.type?.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-red-200 text-sm">{selectedIncident.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-300 text-sm">Confidence: {selectedIncident.confidence}%</p>
                  <p className="text-red-400 text-xs">{selectedIncident.zone?.replace('_', ' ')}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          {/* Playback Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 text-white" />
              ) : (
                <Play className="h-4 w-4 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </button>
          </div>

          {/* Camera Selector */}
          <div className="flex items-center space-x-2">
            <select
              value={currentCamera}
              onChange={(e) => setCurrentCamera(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-cyan-500 focus:outline-none"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.name}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDetectionOverlay(!detectionOverlay)}
              className={`p-2 rounded-lg transition-colors ${
                detectionOverlay 
                  ? 'bg-cyan-600 hover:bg-cyan-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Zap className="h-4 w-4 text-white" />
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Maximize className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Detection Toggle Info */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            AI Detection: {detectionOverlay ? 'ON' : 'OFF'}
          </span>
          <span className="text-gray-400">
            {boundingBoxes.length} objects detected
          </span>
        </div>
      </div>
    </div>
  );
};

export default LiveVideoFeed;
