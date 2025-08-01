import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import RealTimeAlerts from "../../components/monitoring/RealTimeAlerts";
import { useState } from "react";
import { AlertTriangle, Filter, Bell, BellOff, Settings, Download } from "lucide-react";

const RealTimeAlertsPage = () => {
  const { sidebarOpen } = useSidebar();
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [filterSettings, setFilterSettings] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    zone: 'all'
  });

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
  };

  // Mock alert statistics
  const alertStats = [
    { label: "Active Alerts", value: "12", color: "from-red-500 to-red-600", change: "+3" },
    { label: "Critical", value: "3", color: "from-orange-500 to-orange-600", change: "+1" },
    { label: "High Priority", value: "5", color: "from-yellow-500 to-yellow-600", change: "+2" },
    { label: "Resolved Today", value: "28", color: "from-green-500 to-green-600", change: "+8" }
  ];

  const severityOptions = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'fire', label: 'Fire' },
    { value: 'medical_emergency', label: 'Medical Emergency' },
    { value: 'security_threat', label: 'Security Threat' },
    { value: 'crowd_surge', label: 'Crowd Surge' },
    { value: 'equipment_failure', label: 'Equipment Failure' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const zoneOptions = [
    { value: 'all', label: 'All Zones' },
    { value: 'east_zone', label: 'East Zone' },
    { value: 'west_zone', label: 'West Zone' },
    { value: 'north_zone', label: 'North Zone' },
    { value: 'south_zone', label: 'South Zone' },
    { value: 'central_zone', label: 'Central Zone' }
  ];

  return (
    <div className={`space-y-6 ${sidebarOpen ? 'p-4 lg:p-6' : 'p-4 lg:p-8 xl:px-12'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-600 text-transparent bg-clip-text mb-2">
            Real-Time Alerts
          </h1>
          <p className="text-gray-300">
            Monitor and manage all emergency alerts and incidents in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              alertsEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {alertsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>
          
          <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200">
            <Download size={20} />
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* Alert Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {alertStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} text-transparent bg-clip-text`}>
                  {stat.value}
                </p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
              <div className="text-right">
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
                <p className="text-gray-500 text-xs">vs yesterday</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Alert Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
            <select
              value={filterSettings.severity}
              onChange={(e) => setFilterSettings({...filterSettings, severity: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {severityOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={filterSettings.type}
              onChange={(e) => setFilterSettings({...filterSettings, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filterSettings.status}
              onChange={(e) => setFilterSettings({...filterSettings, status: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Zone</label>
            <select
              value={filterSettings.zone}
              onChange={(e) => setFilterSettings({...filterSettings, zone: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {zoneOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Auto-refresh</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Sound alerts</span>
            </label>
          </div>
          
          <button
            onClick={() => setFilterSettings({ severity: 'all', type: 'all', status: 'all', zone: 'all' })}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Main Alerts Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]"
      >
        <RealTimeAlerts onIncidentSelect={handleIncidentSelect} filterSettings={filterSettings} />
      </motion.div>

      {/* Selected Incident Details */}
      {selectedIncident && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Incident Details</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-white">{selectedIncident.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{selectedIncident.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Severity:</span>
                  <span className="text-white">{selectedIncident.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-white">{selectedIncident.status}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-2">Location & Time</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Zone:</span>
                  <span className="text-white">{selectedIncident.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{selectedIncident.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reported:</span>
                  <span className="text-white">{new Date(selectedIncident.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-white font-medium mb-2">Description</h4>
            <p className="text-gray-300 text-sm">{selectedIncident.description}</p>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
              Assign Responder
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
              Mark Resolved
            </button>
            <button
              onClick={() => setSelectedIncident(null)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RealTimeAlertsPage;
