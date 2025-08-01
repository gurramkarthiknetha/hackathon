import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Navigation, AlertTriangle, Users, MapPin } from 'lucide-react';
import GoogleMap from './GoogleMap';

const MonitoringMap = ({ 
  currentLocation,
  incidents = [],
  responders = [],
  zones = [],
  onIncidentSelect,
  onResponderSelect,
  className = "h-full"
}) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedResponder, setSelectedResponder] = useState(null);
  const [mapCenter, setMapCenter] = useState(() => {
    // Ensure we have valid coordinates
    const defaultCenter = { lat: 40.7128, lng: -74.0060 };

    if (!currentLocation) {
      console.log('MonitoringMap: No currentLocation provided, using default center:', defaultCenter);
      return defaultCenter;
    }

    // Validate currentLocation coordinates
    const lat = typeof currentLocation.lat === 'number' ? currentLocation.lat :
                typeof currentLocation.latitude === 'number' ? currentLocation.latitude : null;
    const lng = typeof currentLocation.lng === 'number' ? currentLocation.lng :
                typeof currentLocation.longitude === 'number' ? currentLocation.longitude : null;

    if (lat !== null && lng !== null && isFinite(lat) && isFinite(lng)) {
      const validCenter = { lat, lng };
      console.log('MonitoringMap: Using valid currentLocation:', validCenter);
      return validCenter;
    } else {
      console.log('MonitoringMap: Invalid currentLocation coordinates:', currentLocation, 'using default center:', defaultCenter);
      return defaultCenter;
    }
  });

  // Convert incidents to map markers
  const incidentMarkers = incidents.map((incident, index) => ({
    lat: incident.location?.latitude || incident.lat || 40.7128 + (Math.random() - 0.5) * 0.01,
    lng: incident.location?.longitude || incident.lng || -74.0060 + (Math.random() - 0.5) * 0.01,
    title: incident.title || `Incident ${incident.id}`,
    icon: {
      url: getIncidentIcon(incident.severity || incident.type),
      scaledSize: window.google && window.google.maps ? new window.google.maps.Size(32, 32) : { width: 32, height: 32 }
    },
    infoWindow: `
      <div class="p-2">
        <h3 class="font-semibold text-gray-800">${incident.title || 'Incident'}</h3>
        <p class="text-sm text-gray-600">Type: ${incident.type || 'Unknown'}</p>
        <p class="text-sm text-gray-600">Severity: ${incident.severity || 'Unknown'}</p>
        ${incident.distance ? `<p class="text-sm text-gray-600">Distance: ${incident.distance}</p>` : ''}
        ${incident.eta ? `<p class="text-sm text-gray-600">ETA: ${incident.eta}</p>` : ''}
      </div>
    `,
    data: incident
  }));

  // Convert responders to map markers
  const responderMarkers = responders.map((responder, index) => ({
    lat: responder.location?.latitude || responder.lat || 40.7128 + (Math.random() - 0.5) * 0.01,
    lng: responder.location?.longitude || responder.lng || -74.0060 + (Math.random() - 0.5) * 0.01,
    title: responder.name || `Responder ${responder.id}`,
    icon: {
      url: getResponderIcon(responder.status),
      scaledSize: window.google && window.google.maps ? new window.google.maps.Size(24, 24) : { width: 24, height: 24 }
    },
    infoWindow: `
      <div class="p-2">
        <h3 class="font-semibold text-gray-800">${responder.name || 'Responder'}</h3>
        <p class="text-sm text-gray-600">Status: ${responder.status || 'Unknown'}</p>
        ${responder.zone ? `<p class="text-sm text-gray-600">Zone: ${responder.zone}</p>` : ''}
      </div>
    `,
    data: responder
  }));

  // Combine all markers
  const allMarkers = [...incidentMarkers, ...responderMarkers];

  // Add current location marker if available
  if (currentLocation) {
    allMarkers.push({
      lat: currentLocation.lat || currentLocation.latitude,
      lng: currentLocation.lng || currentLocation.longitude,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" fill="#06b6d4" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#ffffff"/>
          </svg>
        `),
        scaledSize: window.google && window.google.maps ? new window.google.maps.Size(24, 24) : { width: 24, height: 24 }
      },
      infoWindow: '<div class="p-2"><h3 class="font-semibold text-gray-800">Your Location</h3></div>'
    });
  }

  function getIncidentIcon(severity) {
    const color = severity === 'high' ? '#ef4444' : 
                  severity === 'medium' ? '#f59e0b' : '#10b981';
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <path d="M12 8v4m0 4h.01" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  function getResponderIcon(status) {
    const color = status === 'active' ? '#10b981' : 
                  status === 'responding' ? '#3b82f6' : '#6b7280';
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" fill="${color}" stroke="#ffffff" stroke-width="2"/>
        <path d="M12 6v6l4 2" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `);
  }

  const handleMarkerClick = (markerData, index) => {
    if (markerData.data) {
      if (markerData.data.type || markerData.data.severity) {
        // It's an incident
        setSelectedIncident(markerData.data);
        onIncidentSelect && onIncidentSelect(markerData.data);
      } else if (markerData.data.status) {
        // It's a responder
        setSelectedResponder(markerData.data);
        onResponderSelect && onResponderSelect(markerData.data);
      }
    }
  };

  const handleMapClick = (location) => {
    // Clear selections when clicking on empty map area
    setSelectedIncident(null);
    setSelectedResponder(null);
  };

  return (
    <div className={`${className} flex flex-col bg-gray-800/60 backdrop-blur-xl lg:rounded-xl lg:border lg:border-gray-700/50`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <Map className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Live Map</h3>
              <p className="text-gray-400 text-sm">Real-time monitoring</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>High</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Medium</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMap
          center={mapCenter}
          zoom={15}
          markers={allMarkers}
          onMarkerClick={handleMarkerClick}
          onMapClick={handleMapClick}
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
              }
            ]
          }}
        />
      </div>

      {/* Selected Item Info */}
      {(selectedIncident || selectedResponder) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-700/50 bg-gray-800/80"
        >
          {selectedIncident && (
            <div>
              <h4 className="text-white font-semibold mb-2">Selected Incident</h4>
              <p className="text-gray-300 text-sm">{selectedIncident.title}</p>
              <p className="text-gray-400 text-xs">Type: {selectedIncident.type}</p>
              <p className="text-gray-400 text-xs">Severity: {selectedIncident.severity}</p>
            </div>
          )}
          {selectedResponder && (
            <div>
              <h4 className="text-white font-semibold mb-2">Selected Responder</h4>
              <p className="text-gray-300 text-sm">{selectedResponder.name}</p>
              <p className="text-gray-400 text-xs">Status: {selectedResponder.status}</p>
              {selectedResponder.zone && (
                <p className="text-gray-400 text-xs">Zone: {selectedResponder.zone}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MonitoringMap;
