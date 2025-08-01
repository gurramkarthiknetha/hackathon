import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import ResponderMap from "../../components/monitoring/ResponderMap";
import { useState, useEffect } from "react";
import { Navigation, MapPin, Users, Target, Compass, Settings, Locate } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const ResponderMapPage = () => {
  const { sidebarOpen } = useSidebar();
  const { user } = useAuthStore();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [mapView, setMapView] = useState('standard'); // standard, satellite, terrain
  const [showOtherResponders, setShowOtherResponders] = useState(true);
  const [showIncidents, setShowIncidents] = useState(true);

  // Mock location statistics
  const locationStats = [
    { 
      label: "Current Zone", 
      value: user?.assignedZone || "East Zone", 
      color: "from-blue-500 to-blue-600",
      icon: MapPin
    },
    { 
      label: "Distance to HQ", 
      value: "0.8 km", 
      color: "from-green-500 to-green-600",
      icon: Target
    },
    { 
      label: "Nearby Responders", 
      value: "4", 
      color: "from-purple-500 to-purple-600",
      icon: Users
    },
    { 
      label: "GPS Accuracy", 
      value: "±3m", 
      color: "from-orange-500 to-orange-600",
      icon: Compass
    }
  ];

  // Mock nearby points of interest
  const pointsOfInterest = [
    {
      id: 1,
      name: "Emergency Exit A",
      type: "exit",
      distance: "50m",
      direction: "North",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    {
      id: 2,
      name: "Medical Station",
      type: "medical",
      distance: "120m",
      direction: "East",
      coordinates: { lat: 40.7130, lng: -74.0058 }
    },
    {
      id: 3,
      name: "Command Center",
      type: "command",
      distance: "200m",
      direction: "South",
      coordinates: { lat: 40.7125, lng: -74.0062 }
    },
    {
      id: 4,
      name: "Security Checkpoint",
      type: "security",
      distance: "80m",
      direction: "West",
      coordinates: { lat: 40.7127, lng: -74.0065 }
    }
  ];

  // Mock navigation routes
  const quickRoutes = [
    {
      id: 1,
      destination: "Main Entrance",
      estimatedTime: "3 min",
      distance: "250m",
      difficulty: "easy"
    },
    {
      id: 2,
      destination: "Emergency Assembly Point",
      estimatedTime: "5 min",
      distance: "400m",
      difficulty: "medium"
    },
    {
      id: 3,
      destination: "Parking Area",
      estimatedTime: "7 min",
      distance: "600m",
      difficulty: "easy"
    }
  ];

  // Get current location
  useEffect(() => {
    if (navigator.geolocation && trackingEnabled) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [trackingEnabled]);

  const getPoiIcon = (type) => {
    switch (type) {
      case 'exit': return '🚪';
      case 'medical': return '🏥';
      case 'command': return '🏢';
      case 'security': return '🛡️';
      default: return '📍';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
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
            Responder Map
          </h1>
          <p className="text-gray-300">
            Real-time location tracking and navigation for emergency response
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTrackingEnabled(!trackingEnabled)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              trackingEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Locate size={20} />
          </button>
          
          <select
            value={mapView}
            onChange={(e) => setMapView(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
          </select>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Location Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {locationStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Points of Interest */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Nearby Points</h3>
              <p className="text-gray-400 text-sm">Important locations</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {pointsOfInterest.map((poi, index) => (
                <motion.div
                  key={poi.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getPoiIcon(poi.type)}</span>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">{poi.name}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{poi.distance}</span>
                        <span>•</span>
                        <span>{poi.direction}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Map */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]">
            <ResponderMap 
              currentLocation={currentLocation}
              mapView={mapView}
              showOtherResponders={showOtherResponders}
              showIncidents={showIncidents}
            />
          </div>
        </motion.div>
      </div>

      {/* Quick Navigation Routes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Navigation</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {quickRoutes.map((route, index) => (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{route.destination}</h4>
                <Navigation className="h-4 w-4 text-blue-400" />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{route.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Distance:</span>
                  <span className="text-white">{route.distance}</span>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-xs font-medium ${getDifficultyColor(route.difficulty)}`}>
                  {route.difficulty.toUpperCase()}
                </span>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors duration-200">
                  Navigate
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Map Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Map Settings</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Display Options</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={showOtherResponders}
                  onChange={(e) => setShowOtherResponders(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600" 
                />
                <span className="text-gray-300 text-sm">Show Other Responders</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={showIncidents}
                  onChange={(e) => setShowIncidents(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600" 
                />
                <span className="text-gray-300 text-sm">Show Incidents</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={trackingEnabled}
                  onChange={(e) => setTrackingEnabled(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600" 
                />
                <span className="text-gray-300 text-sm">GPS Tracking</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Location Sharing</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
                <span className="text-gray-300 text-sm">Share with Team</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
                <span className="text-gray-300 text-sm">Share with Command</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                <span className="text-gray-300 text-sm">Emergency Broadcast</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                Share Location
              </button>
              
              <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm">
                Mark Safe Zone
              </button>
              
              <button className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 text-sm">
                Emergency Alert
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResponderMapPage;
