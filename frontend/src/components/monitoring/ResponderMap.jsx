import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Map, 
  Navigation, 
  MapPin, 
  Target, 
  Users,
  AlertTriangle,
  Crosshair,
  Compass,
  Route,
  Zap
} from "lucide-react";
import MonitoringMap from "../maps/MonitoringMap";

const ResponderMap = ({ currentLocation }) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [useGoogleMaps, setUseGoogleMaps] = useState(false);

  // Mock incidents with both real coordinates (NYC area) and percentage positions for legacy view
  const incidents = [
    {
      id: 1,
      type: "crowd_surge",
      lat: 40.7128,
      lng: -74.0060,
      position: { x: 70, y: 40 }, // Legacy percentage position
      severity: "high",
      title: "Crowd Management",
      distance: "0.3 km",
      eta: "8 min"
    },
    {
      id: 2,
      type: "medical_emergency", 
      lat: 40.7589,
      lng: -73.9851,
      position: { x: 25, y: 45 }, // Legacy percentage position
      severity: "medium",
      title: "Medical Assistance",
      distance: "0.5 km",
      eta: "12 min"
    },
    {
      id: 3,
      type: "equipment_failure",
      lat: 40.7505,
      lng: -73.9934,
      position: { x: 45, y: 20 }, // Legacy percentage position
      severity: "low",
      title: "Equipment Check",
      distance: "0.7 km",
      eta: "15 min"
    }
  ];

  // Mock responder position (current user) with both coordinate systems
  const responderPosition = (() => {
    const defaultPosition = {
      lat: 40.7580,
      lng: -73.9855,
      x: 50, // Legacy percentage position
      y: 60  // Legacy percentage position
    };

    if (!currentLocation) {
      return defaultPosition;
    }

    // Handle different coordinate formats
    const lat = currentLocation.lat || currentLocation.latitude;
    const lng = currentLocation.lng || currentLocation.longitude;

    if (typeof lat === 'number' && typeof lng === 'number' && isFinite(lat) && isFinite(lng)) {
      return {
        lat,
        lng,
        x: currentLocation.x || 50, // Keep legacy position or default
        y: currentLocation.y || 60  // Keep legacy position or default
      };
    } else {
      return defaultPosition;
    }
  })();

  // Mock other responders with both coordinate systems
  const otherResponders = [
    { 
      id: 1, 
      name: "Team Alpha", 
      lat: 40.7614, 
      lng: -73.9776, 
      position: { x: 65, y: 35 }, // Legacy percentage position
      status: "responding" 
    },
    { 
      id: 2, 
      name: "Team Beta", 
      lat: 40.7505, 
      lng: -73.9934, 
      position: { x: 30, y: 50 }, // Legacy percentage position
      status: "active" 
    },
    { 
      id: 3, 
      name: "Team Gamma", 
      lat: 40.7282, 
      lng: -74.0776, 
      position: { x: 40, y: 25 }, // Legacy percentage position
      status: "busy" 
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "bg-red-500 border-red-400 animate-pulse";
      case "medium": return "bg-yellow-500 border-yellow-400";
      case "low": return "bg-green-500 border-green-400";
      default: return "bg-gray-500 border-gray-400";
    }
  };

  const getResponderStatusColor = (status) => {
    switch (status) {
      case "available": return "bg-green-500 border-green-400";
      case "responding": return "bg-blue-500 border-blue-400";
      case "busy": return "bg-yellow-500 border-yellow-400";
      default: return "bg-gray-500 border-gray-400";
    }
  };

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setShowRoute(true);
  };

  const handleNavigate = (incident) => {
    // In a real app, this would open device navigation
    console.log("Navigate to incident:", incident);
  };

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
  };

  const handleResponderSelect = (responder) => {
    console.log("Selected responder:", responder);
  };

  return (
    <div className="w-full h-[400px] lg:h-[500px] flex flex-col bg-gray-800/60 backdrop-blur-xl lg:rounded-xl lg:border lg:border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Area Map</h3>
              <p className="text-gray-400 text-sm">Real-time locations</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setUseGoogleMaps(!useGoogleMaps)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                useGoogleMaps
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {useGoogleMaps ? 'Google Maps' : 'Simple View'}
            </button>
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`p-2 rounded-lg transition-colors ${
                showRoute ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <Route className="h-4 w-4 text-white" />
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Compass className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {useGoogleMaps ? (
          <MonitoringMap
            currentLocation={responderPosition}
            incidents={incidents}
            responders={otherResponders}
            onIncidentSelect={handleIncidentSelect}
            onResponderSelect={handleResponderSelect}
            className="h-full"
          />
        ) : (
          <div className="w-full h-full relative bg-gray-900 overflow-hidden">
            <div className="w-full h-full relative">
              {/* Background Grid */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" className="text-gray-600">
                  <defs>
                    <pattern id="responder-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#responder-grid)" />
                </svg>
              </div>

              {/* Zone Boundaries */}
              <div className="absolute inset-4 border-2 border-dashed border-gray-600 rounded-lg opacity-30"></div>
              
              {/* Current Responder Position */}
              <motion.div
                className="absolute w-6 h-6 bg-cyan-500 border-2 border-cyan-400 rounded-full shadow-lg"
                style={{
                  left: `${responderPosition.x}%`,
                  top: `${responderPosition.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(6, 182, 212, 0.7)",
                    "0 0 0 10px rgba(6, 182, 212, 0)",
                    "0 0 0 0 rgba(6, 182, 212, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-cyan-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  You
                </div>
              </motion.div>

              {/* Other Responders */}
              {otherResponders.map((responder) => (
                <motion.div
                  key={responder.id}
                  className={`absolute w-4 h-4 rounded-full border-2 ${getResponderStatusColor(responder.status)}`}
                  style={{
                    left: `${responder.position.x}%`,
                    top: `${responder.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  animate={{
                    x: [0, 2, 0, -2, 0],
                    y: [0, -1, 0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  title={`${responder.name} - ${responder.status}`}
                />
              ))}

              {/* Incidents */}
              {incidents.map((incident) => (
                <motion.div
                  key={incident.id}
                  className={`absolute w-8 h-8 rounded-full border-2 cursor-pointer flex items-center justify-center ${getSeverityColor(incident.severity)} ${
                    selectedIncident?.id === incident.id ? 'ring-2 ring-white' : ''
                  }`}
                  style={{
                    left: `${incident.position.x}%`,
                    top: `${incident.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => handleIncidentClick(incident)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <AlertTriangle className="h-4 w-4 text-white" />
                </motion.div>
              ))}

              {/* Route Line */}
              {showRoute && selectedIncident && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.line
                    x1={`${responderPosition.x}%`}
                    y1={`${responderPosition.y}%`}
                    x2={`${selectedIncident.position.x}%`}
                    y2={`${selectedIncident.position.y}%`}
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Incident Details */}
      {selectedIncident && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-700/50 bg-gray-800/50"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold">{selectedIncident.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <span>Distance: {selectedIncident.distance}</span>
                <span>ETA: {selectedIncident.eta}</span>
                <span className={`font-medium ${
                  selectedIncident.severity === 'high' ? 'text-red-400' :
                  selectedIncident.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {selectedIncident.severity.toUpperCase()}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleNavigate(selectedIncident)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Navigation className="h-4 w-4" />
              <span>Navigate</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors">
              <Target className="h-4 w-4" />
              <span>Accept Task</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Available Team</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium Priority</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponderMap;
