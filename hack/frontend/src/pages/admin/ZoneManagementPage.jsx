import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { Map, Plus, Edit, Trash2, Users, Camera, AlertTriangle, Settings, MapPin, Activity } from "lucide-react";

const ZoneManagementPage = () => {
  const { sidebarOpen } = useSidebar();
  const [selectedZone, setSelectedZone] = useState(null);
  const [showAddZoneForm, setShowAddZoneForm] = useState(false);

  // Mock zone statistics
  const zoneStats = [
    { 
      label: "Total Zones", 
      value: "6", 
      color: "from-blue-500 to-blue-600",
      change: "+1",
      icon: Map
    },
    { 
      label: "Active Incidents", 
      value: "8", 
      color: "from-red-500 to-red-600",
      change: "+3",
      icon: AlertTriangle
    },
    { 
      label: "Total Capacity", 
      value: "25,000", 
      color: "from-green-500 to-green-600",
      change: "+2,000",
      icon: Users
    },
    { 
      label: "Cameras Online", 
      value: "47", 
      color: "from-purple-500 to-purple-600",
      change: "+2",
      icon: Camera
    }
  ];

  // Mock zones data
  const zones = [
    {
      id: 'east_zone',
      name: 'East Zone',
      description: 'Main entrance and registration area',
      capacity: 5000,
      currentOccupancy: 3200,
      status: 'normal',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      responders: 3,
      cameras: 8,
      incidents: 1,
      manager: 'Sarah Johnson',
      created: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'west_zone',
      name: 'West Zone',
      description: 'Food court and vendor area',
      capacity: 4500,
      currentOccupancy: 2800,
      status: 'warning',
      coordinates: { lat: 40.7130, lng: -74.0065 },
      responders: 2,
      cameras: 6,
      incidents: 2,
      manager: 'Mike Chen',
      created: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 'north_zone',
      name: 'North Zone',
      description: 'Emergency exits and medical stations',
      capacity: 3000,
      currentOccupancy: 1500,
      status: 'normal',
      coordinates: { lat: 40.7135, lng: -74.0062 },
      responders: 2,
      cameras: 5,
      incidents: 0,
      manager: 'Emily Davis',
      created: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'south_zone',
      name: 'South Zone',
      description: 'Main stage and performance area',
      capacity: 6000,
      currentOccupancy: 4200,
      status: 'critical',
      coordinates: { lat: 40.7125, lng: -74.0058 },
      responders: 4,
      cameras: 10,
      incidents: 0,
      manager: 'Alex Rodriguez',
      created: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: 'central_zone',
      name: 'Central Zone',
      description: 'Command center and administration',
      capacity: 2000,
      currentOccupancy: 800,
      status: 'normal',
      coordinates: { lat: 40.7128, lng: -74.0062 },
      responders: 2,
      cameras: 6,
      incidents: 0,
      manager: 'John Smith',
      created: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: 'parking_zone',
      name: 'Parking Zone',
      description: 'Vehicle parking and transportation hub',
      capacity: 4500,
      currentOccupancy: 2100,
      status: 'normal',
      coordinates: { lat: 40.7120, lng: -74.0070 },
      responders: 1,
      cameras: 12,
      incidents: 0,
      manager: 'Lisa Wang',
      created: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date(Date.now() - 60 * 60 * 1000)
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-400 bg-green-600';
      case 'warning': return 'text-yellow-400 bg-yellow-600';
      case 'critical': return 'text-red-400 bg-red-600';
      case 'maintenance': return 'text-gray-400 bg-gray-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      case 'maintenance': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getOccupancyColor = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleEditZone = (zoneId) => {
    console.log("Edit zone:", zoneId);
  };

  const handleDeleteZone = (zoneId) => {
    console.log("Delete zone:", zoneId);
  };

  const handleAddZone = () => {
    setShowAddZoneForm(true);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text mb-2">
            Zone Management
          </h1>
          <p className="text-gray-300">
            Configure and monitor emergency response zones
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddZone}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200"
          >
            <Plus size={20} />
            <span>Add Zone</span>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-400' : 
                  stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </span>
                <p className="text-gray-500 text-xs">this month</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Zones Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {zones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 cursor-pointer hover:border-cyan-500 transition-colors duration-200"
            onClick={() => setSelectedZone(zone)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{zone.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
                  {zone.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-4">{zone.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Occupancy</span>
                  <span className="text-white font-medium">
                    {zone.currentOccupancy.toLocaleString()}/{zone.capacity.toLocaleString()}
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getOccupancyColor(zone.currentOccupancy, zone.capacity)}`}
                    style={{ width: `${(zone.currentOccupancy / zone.capacity) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">{zone.responders}</p>
                    <p className="text-gray-400 text-xs">Responders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{zone.cameras}</p>
                    <p className="text-gray-400 text-xs">Cameras</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${zone.incidents > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {zone.incidents}
                    </p>
                    <p className="text-gray-400 text-xs">Incidents</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Manager:</span>
                    <span className="text-white">{zone.manager}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-800/50 rounded-b-xl flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditZone(zone.id);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors duration-200"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteZone(zone.id);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors duration-200"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Selected Zone Details */}
      {selectedZone && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">{selectedZone.name} - Detailed View</h3>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">Zone Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white">{selectedZone.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedZone.status)}`}>
                    {selectedZone.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Manager:</span>
                  <span className="text-white">{selectedZone.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{selectedZone.created.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">{selectedZone.lastUpdated.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Capacity & Resources</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Capacity:</span>
                  <span className="text-white">{selectedZone.capacity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Occupancy:</span>
                  <span className="text-white">{selectedZone.currentOccupancy.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Utilization:</span>
                  <span className="text-white">
                    {Math.round((selectedZone.currentOccupancy / selectedZone.capacity) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Responders:</span>
                  <span className="text-white">{selectedZone.responders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cameras:</span>
                  <span className="text-white">{selectedZone.cameras}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Location & Coordinates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Latitude:</span>
                  <span className="text-white">{selectedZone.coordinates.lat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Longitude:</span>
                  <span className="text-white">{selectedZone.coordinates.lng}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Incidents:</span>
                  <span className={selectedZone.incidents > 0 ? 'text-red-400' : 'text-green-400'}>
                    {selectedZone.incidents}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  View on Map
                </button>
                <button className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  Deploy Responder
                </button>
                <button className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm">
                  View Cameras
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Zone Management Actions</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-center">
            <MapPin className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View All Zones</span>
          </button>
          
          <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Activity className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Zone Analytics</span>
          </button>
          
          <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Settings className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Bulk Settings</span>
          </button>
          
          <button className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Emergency Mode</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ZoneManagementPage;
