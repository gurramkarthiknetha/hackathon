import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import IncidentTimeline from "../../components/monitoring/IncidentTimeline";
import { useState } from "react";
import { Clock, Calendar, Filter, Download, Search, RefreshCw } from "lucide-react";

const IncidentTimelinePage = () => {
  const { sidebarOpen } = useSidebar();
  const [timeRange, setTimeRange] = useState('24h'); // 1h, 6h, 24h, 7d, 30d
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSettings, setFilterSettings] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    zone: 'all'
  });

  // Mock timeline statistics
  const timelineStats = [
    { 
      label: "Total Incidents", 
      value: "47", 
      color: "from-blue-500 to-blue-600",
      change: "+12",
      period: "24h"
    },
    { 
      label: "Avg Response Time", 
      value: "3.2m", 
      color: "from-green-500 to-green-600",
      change: "-0.8m",
      period: "24h"
    },
    { 
      label: "Resolution Rate", 
      value: "94%", 
      color: "from-purple-500 to-purple-600",
      change: "+2%",
      period: "24h"
    },
    { 
      label: "Active Now", 
      value: "3", 
      color: "from-red-500 to-red-600",
      change: "-2",
      period: "current"
    }
  ];

  const timeRangeOptions = [
    { value: '1h', label: 'Last Hour' },
    { value: '6h', label: 'Last 6 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' }
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

  // Mock recent incidents summary
  const recentIncidents = [
    {
      id: 'INC-2024-001',
      type: 'medical_emergency',
      severity: 'high',
      zone: 'east_zone',
      status: 'resolved',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      responseTime: '2.5m',
      description: 'Person collapsed near main entrance'
    },
    {
      id: 'INC-2024-002',
      type: 'crowd_surge',
      severity: 'critical',
      zone: 'south_zone',
      status: 'active',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      responseTime: '1.2m',
      description: 'Crowd density exceeding safe limits'
    },
    {
      id: 'INC-2024-003',
      type: 'equipment_failure',
      severity: 'medium',
      zone: 'west_zone',
      status: 'in_progress',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      responseTime: '3.8m',
      description: 'Camera system malfunction'
    }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-600';
      case 'assigned': return 'text-blue-400 bg-blue-600';
      case 'in_progress': return 'text-yellow-400 bg-yellow-600';
      case 'resolved': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 text-transparent bg-clip-text mb-2">
            Incident Timeline
          </h1>
          <p className="text-gray-300">
            Comprehensive timeline view of all incidents with detailed tracking and analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-3 rounded-lg transition-all duration-200 ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <RefreshCw size={20} className={autoRefresh ? 'animate-spin' : ''} />
          </button>
          
          <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200">
            <Download size={20} />
          </button>
        </div>
      </motion.div>

      {/* Timeline Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {timelineStats.map((stat, index) => (
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
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-400' : 
                  stat.change.startsWith('-') ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </span>
                <p className="text-gray-500 text-xs">{stat.period}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Search & Filter</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Incidents</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, description, or location..."
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
            <select
              value={filterSettings.severity}
              onChange={(e) => setFilterSettings({...filterSettings, severity: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
              <span className="text-gray-300 text-sm">Show resolved incidents</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Group by zone</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterSettings({ severity: 'all', type: 'all', status: 'all', zone: 'all' });
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </motion.div>

      {/* Recent Incidents Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Incidents</h3>
        
        <div className="space-y-3">
          {recentIncidents.map((incident, index) => (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-4 bg-gray-800 rounded-lg border-l-4 border-cyan-500"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="text-white font-medium">{incident.id}</h4>
                    <p className="text-gray-300 text-sm">{incident.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="text-right text-sm">
                  <div className="text-gray-400">Response: {incident.responseTime}</div>
                  <div className="text-gray-500">{incident.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Timeline Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]"
      >
        <IncidentTimeline 
          timeRange={timeRange}
          filterSettings={filterSettings}
          searchTerm={searchTerm}
        />
      </motion.div>
    </div>
  );
};

export default IncidentTimelinePage;
