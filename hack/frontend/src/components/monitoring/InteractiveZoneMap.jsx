import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Map, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Navigation, 
  Zap,
  Shield,
  Camera,
  Radio,
  Activity
} from "lucide-react";

const InteractiveZoneMap = ({ onIncidentSelect, selectedIncident }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [showResponders, setShowResponders] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Mock zones data
  const zones = [
    {
      id: "east_zone",
      name: "East Zone",
      center: { x: 70, y: 40 },
      size: { width: 25, height: 20 },
      capacity: 5000,
      currentOccupancy: 3200,
      riskLevel: "medium",
      color: "border-yellow-500 bg-yellow-500/10"
    },
    {
      id: "west_zone", 
      name: "West Zone",
      center: { x: 20, y: 40 },
      size: { width: 25, height: 20 },
      capacity: 2000,
      currentOccupancy: 800,
      riskLevel: "low",
      color: "border-green-500 bg-green-500/10"
    },
    {
      id: "north_zone",
      name: "North Zone", 
      center: { x: 45, y: 15 },
      size: { width: 20, height: 15 },
      capacity: 500,
      currentOccupancy: 120,
      riskLevel: "low",
      color: "border-green-500 bg-green-500/10"
    },
    {
      id: "south_zone",
      name: "South Zone",
      center: { x: 45, y: 75 },
      size: { width: 20, height: 15 },
      capacity: 1000,
      currentOccupancy: 450,
      riskLevel: "low", 
      color: "border-green-500 bg-green-500/10"
    }
  ];

  // Mock responders data
  const [responders, setResponders] = useState([
    { id: 1, name: "Team Alpha", position: { x: 65, y: 35 }, status: "active", zone: "east_zone" },
    { id: 2, name: "Team Beta", position: { x: 25, y: 45 }, status: "active", zone: "west_zone" },
    { id: 3, name: "Team Gamma", position: { x: 50, y: 20 }, status: "responding", zone: "north_zone" },
    { id: 4, name: "Team Delta", position: { x: 40, y: 70 }, status: "active", zone: "south_zone" },
    { id: 5, name: "Team Echo", position: { x: 75, y: 50 }, status: "responding", zone: "east_zone" }
  ]);

  // Mock incidents data
  const incidents = [
    { 
      id: 1, 
      type: "fire", 
      position: { x: 48, y: 18 }, 
      severity: "critical", 
      zone: "north_zone",
      description: "Equipment fire detected"
    },
    { 
      id: 2, 
      type: "crowd_surge", 
      position: { x: 72, y: 42 }, 
      severity: "high", 
      zone: "east_zone",
      description: "Crowd density critical"
    },
    { 
      id: 3, 
      type: "medical_emergency", 
      position: { x: 22, y: 38 }, 
      severity: "medium", 
      zone: "west_zone",
      description: "Medical assistance needed"
    }
  ];

  // Simulate responder movement
  useEffect(() => {
    const interval = setInterval(() => {
      setResponders(prev => prev.map(responder => ({
        ...responder,
        position: {
          x: Math.max(5, Math.min(95, responder.position.x + (Math.random() - 0.5) * 2)),
          y: Math.max(5, Math.min(95, responder.position.y + (Math.random() - 0.5) * 2))
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIncidentIcon = (type) => {
    switch (type) {
      case "fire": return "🔥";
      case "crowd_surge": return "👥";
      case "medical_emergency": return "🚑";
      case "security_threat": return "🛡️";
      default: return "⚠️";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "bg-red-500 border-red-400";
      case "high": return "bg-orange-500 border-orange-400";
      case "medium": return "bg-yellow-500 border-yellow-400";
      case "low": return "bg-green-500 border-green-400";
      default: return "bg-gray-500 border-gray-400";
    }
  };

  const getResponderStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-500 border-green-400";
      case "responding": return "bg-blue-500 border-blue-400";
      case "offline": return "bg-gray-500 border-gray-400";
      default: return "bg-yellow-500 border-yellow-400";
    }
  };

  const handleZoneClick = (zone) => {
    setSelectedZone(zone);
  };

  const handleIncidentClick = (incident) => {
    onIncidentSelect && onIncidentSelect(incident);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Zone Map</h3>
              <p className="text-gray-400 text-sm">Interactive event monitoring</p>
            </div>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResponders}
              onChange={(e) => setShowResponders(e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-gray-300 text-sm">Show Responders</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showIncidents}
              onChange={(e) => setShowIncidents(e.target.checked)}
              className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
            />
            <span className="text-gray-300 text-sm">Show Incidents</span>
          </label>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        <div className="w-full h-full relative">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" className="text-gray-600">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Zones */}
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-300 ${zone.color} ${
                selectedZone?.id === zone.id ? 'ring-2 ring-cyan-500' : ''
              } ${selectedIncident?.zone === zone.id ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
              style={{
                left: `${zone.center.x - zone.size.width/2}%`,
                top: `${zone.center.y - zone.size.height/2}%`,
                width: `${zone.size.width}%`,
                height: `${zone.size.height}%`,
              }}
              onClick={() => handleZoneClick(zone)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="p-2 h-full flex flex-col justify-center items-center text-center">
                <h4 className="text-white font-medium text-sm mb-1">{zone.name}</h4>
                <div className="text-xs text-gray-300">
                  <div>{zone.currentOccupancy}/{zone.capacity}</div>
                  <div className="text-xs text-gray-400">
                    {Math.round((zone.currentOccupancy / zone.capacity) * 100)}% capacity
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Incidents */}
          {showIncidents && incidents.map((incident) => (
            <motion.div
              key={incident.id}
              className={`absolute w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center text-xs ${getSeverityColor(incident.severity)} animate-pulse`}
              style={{
                left: `${incident.position.x}%`,
                top: `${incident.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleIncidentClick(incident)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              title={`${incident.type}: ${incident.description}`}
            >
              <span className="text-white font-bold">!</span>
            </motion.div>
          ))}

          {/* Responders */}
          {showResponders && responders.map((responder) => (
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
        </div>
      </div>

      {/* Zone Details Panel */}
      {selectedZone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-700/50 bg-gray-800/50"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-semibold">{selectedZone.name}</h4>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Capacity</div>
              <div className="text-white font-medium">
                {selectedZone.currentOccupancy} / {selectedZone.capacity}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Risk Level</div>
              <div className={`font-medium ${
                selectedZone.riskLevel === 'high' ? 'text-red-400' :
                selectedZone.riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {selectedZone.riskLevel.toUpperCase()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Active Responder</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Responding</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Critical Incident</span>
            </div>
          </div>
          <div className="text-gray-500">
            {responders.filter(r => r.status === 'active').length} Active • {incidents.length} Incidents
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveZoneMap;
