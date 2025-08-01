import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import InteractiveZoneMap from "../../components/monitoring/InteractiveZoneMap";
import { useState } from "react";
import { Map, Layers, ZoomIn, ZoomOut, RotateCcw, Settings } from "lucide-react";

const ZoneMapPage = () => {
  const { sidebarOpen } = useSidebar();
  const [selectedZone, setSelectedZone] = useState(null);
  const [mapView, setMapView] = useState('overview'); // overview, detailed, satellite
  const [showIncidents, setShowIncidents] = useState(true);
  const [showResponders, setShowResponders] = useState(true);
  const [showCameras, setShowCameras] = useState(true);

  // Mock zone statistics
  const zoneStats = [
    { label: "Total Zones", value: "6", color: "from-blue-500 to-blue-600" },
    { label: "Active Incidents", value: "3", color: "from-red-500 to-red-600" },
    { label: "Responders On Duty", value: "12", color: "from-green-500 to-green-600" },
    { label: "Cameras Online", value: "24", color: "from-purple-500 to-purple-600" }
  ];

  // Mock zone details
  const zones = [
    {
      id: 'east_zone',
      name: 'East Zone',
      capacity: 5000,
      currentOccupancy: 3200,
      status: 'normal',
      incidents: 1,
      responders: 3,
      cameras: 4
    },
    {
      id: 'west_zone',
      name: 'West Zone',
      capacity: 4500,
      currentOccupancy: 2800,
      status: 'warning',
      incidents: 2,
      responders: 2,
      cameras: 3
    },
    {
      id: 'north_zone',
      name: 'North Zone',
      capacity: 3000,
      currentOccupancy: 1500,
      status: 'normal',
      incidents: 0,
      responders: 2,
      cameras: 3
    },
    {
      id: 'south_zone',
      name: 'South Zone',
      capacity: 6000,
      currentOccupancy: 4200,
      status: 'critical',
      incidents: 0,
      responders: 3,
      cameras: 5
    },
    {
      id: 'central_zone',
      name: 'Central Zone',
      capacity: 2000,
      currentOccupancy: 800,
      status: 'normal',
      incidents: 0,
      responders: 2,
      cameras: 4
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      default: return 'bg-gray-600';
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-600 text-transparent bg-clip-text mb-2">
            Zone Map
          </h1>
          <p className="text-gray-300">
            Interactive map view of all zones with real-time status and incident tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={mapView}
            onChange={(e) => setMapView(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed</option>
            <option value="satellite">Satellite</option>
          </select>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <ZoomIn size={20} />
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <ZoomOut size={20} />
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <RotateCcw size={20} />
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Zone Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {zoneStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                <Map className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Zone List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Zone Status</h3>
              <p className="text-gray-400 text-sm">Click to focus on zone</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {zones.map((zone) => (
                <motion.div
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedZone?.id === zone.id
                      ? 'bg-gradient-to-r from-green-500 to-blue-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{zone.name}</h4>
                    <div className={`w-3 h-3 rounded-full ${getStatusBg(zone.status)}`}></div>
                  </div>
                  
                  <div className="text-xs text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span>Occupancy:</span>
                      <span>{zone.currentOccupancy}/{zone.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Incidents:</span>
                      <span className={zone.incidents > 0 ? 'text-red-400' : 'text-green-400'}>
                        {zone.incidents}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Responders:</span>
                      <span>{zone.responders}</span>
                    </div>
                  </div>
                  
                  {/* Occupancy bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          (zone.currentOccupancy / zone.capacity) > 0.8 ? 'bg-red-500' :
                          (zone.currentOccupancy / zone.capacity) > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(zone.currentOccupancy / zone.capacity) * 100}%` }}
                      ></div>
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
            <InteractiveZoneMap 
              selectedZone={selectedZone}
              showIncidents={showIncidents}
              showResponders={showResponders}
              showCameras={showCameras}
            />
          </div>
        </motion.div>
      </div>

      {/* Map Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Layers className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Map Layers</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-white font-medium">Visibility</h4>
            <div className="space-y-2">
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
                  checked={showResponders}
                  onChange={(e) => setShowResponders(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600" 
                />
                <span className="text-gray-300 text-sm">Show Responders</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={showCameras}
                  onChange={(e) => setShowCameras(e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600" 
                />
                <span className="text-gray-300 text-sm">Show Cameras</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white font-medium">Map Style</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="radio" name="mapStyle" defaultChecked className="text-green-500" />
                <span className="text-gray-300 text-sm">Standard</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input type="radio" name="mapStyle" className="text-green-500" />
                <span className="text-gray-300 text-sm">Satellite</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input type="radio" name="mapStyle" className="text-green-500" />
                <span className="text-gray-300 text-sm">Terrain</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-white font-medium">Actions</h4>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                Export Map
              </button>
              
              <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm">
                Print View
              </button>
              
              <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200 text-sm">
                Reset View
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{selectedZone.name} Details</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedZone.status)} ${getStatusBg(selectedZone.status)}`}>
              {selectedZone.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Capacity</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current:</span>
                  <span className="text-white">{selectedZone.currentOccupancy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Maximum:</span>
                  <span className="text-white">{selectedZone.capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Utilization:</span>
                  <span className="text-white">{Math.round((selectedZone.currentOccupancy / selectedZone.capacity) * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Resources</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Active Incidents:</span>
                  <span className={selectedZone.incidents > 0 ? 'text-red-400' : 'text-green-400'}>
                    {selectedZone.incidents}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Responders:</span>
                  <span className="text-white">{selectedZone.responders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Cameras:</span>
                  <span className="text-white">{selectedZone.cameras}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Actions</h4>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  Deploy Responder
                </button>
                <button className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  Issue Alert
                </button>
                <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  View Cameras
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ZoneMapPage;
