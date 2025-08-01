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
import GoogleMap from "../maps/GoogleMap";
import LocationControl from "../maps/LocationControl";

const InteractiveZoneMap = ({ onIncidentSelect, selectedIncident }) => {
  const [selectedZone, setSelectedZone] = useState(null);
  const [showResponders, setShowResponders] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [centerOnUser, setCenterOnUser] = useState(false);

  // Mock zones data with real coordinates
  const zones = [
    {
      id: "east_zone",
      name: "East Zone",
      center: { lat: 40.7138, lng: -74.0050 },
      capacity: 5000,
      currentOccupancy: 3200,
      riskLevel: "medium",
      color: "border-yellow-500 bg-yellow-500/10",
      radius: 100 // meters
    },
    {
      id: "west_zone",
      name: "West Zone",
      center: { lat: 40.7118, lng: -74.0070 },
      capacity: 2000,
      currentOccupancy: 800,
      riskLevel: "low",
      color: "border-green-500 bg-green-500/10",
      radius: 80
    },
    {
      id: "north_zone",
      name: "North Zone",
      center: { lat: 40.7148, lng: -74.0060 },
      capacity: 500,
      currentOccupancy: 120,
      riskLevel: "low",
      color: "border-green-500 bg-green-500/10",
      radius: 60
    },
    {
      id: "south_zone",
      name: "South Zone",
      center: { lat: 40.7108, lng: -74.0060 },
      capacity: 1000,
      currentOccupancy: 450,
      riskLevel: "low",
      color: "border-green-500 bg-green-500/10",
      radius: 70
    }
  ];

  // Mock responders data with real coordinates
  const [responders, setResponders] = useState([
    { id: 1, name: "Team Alpha", position: { lat: 40.7135, lng: -74.0052 }, status: "active", zone: "east_zone" },
    { id: 2, name: "Team Beta", position: { lat: 40.7120, lng: -74.0068 }, status: "active", zone: "west_zone" },
    { id: 3, name: "Team Gamma", position: { lat: 40.7145, lng: -74.0062 }, status: "responding", zone: "north_zone" },
    { id: 4, name: "Team Delta", position: { lat: 40.7110, lng: -74.0058 }, status: "active", zone: "south_zone" },
    { id: 5, name: "Team Echo", position: { lat: 40.7140, lng: -74.0048 }, status: "responding", zone: "east_zone" }
  ]);

  // Mock incidents data with real coordinates
  const incidents = [
    {
      id: 1,
      type: "fire",
      position: { lat: 40.7146, lng: -74.0061 },
      severity: "critical",
      zone: "north_zone",
      description: "Equipment fire detected"
    },
    {
      id: 2,
      type: "crowd_surge",
      position: { lat: 40.7136, lng: -74.0051 },
      severity: "high",
      zone: "east_zone",
      description: "Crowd density critical"
    },
    {
      id: 3,
      type: "medical_emergency",
      position: { lat: 40.7116, lng: -74.0069 },
      severity: "medium",
      zone: "west_zone",
      description: "Medical assistance needed"
    }
  ];

  // Simulate responder movement with real coordinates
  useEffect(() => {
    const interval = setInterval(() => {
      setResponders(prev => prev.map(responder => ({
        ...responder,
        position: {
          lat: Math.max(40.7100, Math.min(40.7160, responder.position.lat + (Math.random() - 0.5) * 0.0005)),
          lng: Math.max(-74.0080, Math.min(-74.0040, responder.position.lng + (Math.random() - 0.5) * 0.0005))
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

  // Create markers for Google Map
  const createMapMarkers = () => {
    const markers = [];

    // Add zone markers
    zones.forEach(zone => {
      const color = zone.riskLevel === 'high' ? 'red' : zone.riskLevel === 'medium' ? 'orange' : 'green';
      markers.push({
        id: `zone-${zone.id}`,
        position: zone.center,
        title: `${zone.name} - ${zone.currentOccupancy}/${zone.capacity}`,
        icon: {
          path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
          fillColor: color,
          fillOpacity: 0.8,
          strokeColor: 'white',
          strokeWeight: 2,
          scale: 20
        },
        type: 'zone',
        data: zone
      });
    });

    // Add incident markers
    if (showIncidents) {
      incidents.forEach(incident => {
        const color = incident.severity === 'critical' ? '#dc2626' :
                     incident.severity === 'high' ? '#ea580c' :
                     incident.severity === 'medium' ? '#d97706' : '#16a34a';
        markers.push({
          id: `incident-${incident.id}`,
          position: incident.position,
          title: `${incident.type}: ${incident.description}`,
          icon: {
            path: window.google?.maps?.SymbolPath?.BACKWARD_CLOSED_ARROW || 3,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
            scale: 8,
            rotation: 180
          },
          type: 'incident',
          data: incident
        });
      });
    }

    // Add responder markers
    if (showResponders) {
      responders.forEach(responder => {
        const color = responder.status === 'active' ? '#10b981' :
                     responder.status === 'responding' ? '#3b82f6' : '#6b7280';
        markers.push({
          id: `responder-${responder.id}`,
          position: responder.position,
          title: `${responder.name} - ${responder.status}`,
          icon: {
            path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
            scale: 8
          },
          type: 'responder',
          data: responder
        });
      });
    }

    return markers;
  };

  const handleMarkerClick = (marker) => {
    if (marker.type === 'zone') {
      handleZoneClick(marker.data);
    } else if (marker.type === 'incident') {
      handleIncidentClick(marker.data);
    }
  };

  const handleLocationUpdate = (location) => {
    setMapCenter({ lat: location.lat, lng: location.lng });
    setCenterOnUser(true);
    // Reset centerOnUser after a short delay to allow for manual map movement
    setTimeout(() => setCenterOnUser(false), 1000);
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

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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

          {/* Location Control */}
          <LocationControl onLocationUpdate={handleLocationUpdate} />
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden">
        <GoogleMap
          center={mapCenter}
          zoom={16}
          markers={createMapMarkers()}
          onMarkerClick={handleMarkerClick}
          showUserLocation={true}
          centerOnUserLocation={centerOnUser}
          className="w-full h-full"
          mapOptions={{
            styles: [
              {
                featureType: "all",
                elementType: "geometry.fill",
                stylers: [{ color: "#1f2937" }]
              },
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [{ color: "#9ca3af" }]
              },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#374151" }]
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#1e40af" }]
              },
              {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#374151" }]
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#065f46" }]
              }
            ],
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: true
          }}
        />
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
