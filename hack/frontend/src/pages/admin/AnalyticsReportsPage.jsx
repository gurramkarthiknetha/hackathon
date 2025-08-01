import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, Activity, Clock, Users, AlertTriangle } from "lucide-react";

const AnalyticsReportsPage = () => {
  const { sidebarOpen } = useSidebar();
  const [timeRange, setTimeRange] = useState('7d');
  const [reportType, setReportType] = useState('overview');

  // Mock analytics data
  const analyticsStats = [
    { 
      label: "Total Incidents", 
      value: "1,247", 
      color: "from-blue-500 to-blue-600",
      change: "+12.5%",
      trend: "up",
      icon: AlertTriangle
    },
    { 
      label: "Avg Response Time", 
      value: "3.2m", 
      color: "from-green-500 to-green-600",
      change: "-8.3%",
      trend: "down",
      icon: Clock
    },
    { 
      label: "Active Users", 
      value: "156", 
      color: "from-purple-500 to-purple-600",
      change: "+5.7%",
      trend: "up",
      icon: Users
    },
    { 
      label: "System Uptime", 
      value: "99.8%", 
      color: "from-orange-500 to-orange-600",
      change: "+0.2%",
      trend: "up",
      icon: Activity
    }
  ];

  // Mock incident data by type
  const incidentsByType = [
    { type: "Medical Emergency", count: 342, percentage: 27.4, color: "bg-red-500" },
    { type: "Fire Incident", count: 156, percentage: 12.5, color: "bg-orange-500" },
    { type: "Security Threat", count: 234, percentage: 18.8, color: "bg-purple-500" },
    { type: "Crowd Control", count: 298, percentage: 23.9, color: "bg-blue-500" },
    { type: "Equipment Issue", count: 127, percentage: 10.2, color: "bg-yellow-500" },
    { type: "Other", count: 90, percentage: 7.2, color: "bg-gray-500" }
  ];

  // Mock response time data
  const responseTimeData = [
    { zone: "East Zone", avgTime: "2.8m", incidents: 312, efficiency: 94 },
    { zone: "West Zone", avgTime: "3.1m", incidents: 287, efficiency: 91 },
    { zone: "North Zone", avgTime: "3.5m", incidents: 198, efficiency: 87 },
    { zone: "South Zone", avgTime: "2.9m", incidents: 334, efficiency: 93 },
    { zone: "Central Zone", avgTime: "2.6m", incidents: 116, efficiency: 96 }
  ];

  // Mock user activity data
  const userActivity = [
    { role: "Responders", active: 89, total: 98, percentage: 90.8 },
    { role: "Operators", active: 23, total: 25, percentage: 92.0 },
    { role: "Admins", active: 7, total: 8, percentage: 87.5 }
  ];

  const timeRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'System Overview' },
    { value: 'incidents', label: 'Incident Reports' },
    { value: 'performance', label: 'Performance Metrics' },
    { value: 'users', label: 'User Analytics' },
    { value: 'zones', label: 'Zone Analysis' }
  ];

  const getTrendIcon = (trend) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend) => {
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 95) return 'text-green-400';
    if (efficiency >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleExportReport = () => {
    console.log("Exporting report:", reportType, timeRange);
    // In a real app, this would generate and download the report
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
            Analytics & Reports
          </h1>
          <p className="text-gray-300">
            Comprehensive system analytics and performance reports
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
          
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
          >
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {analyticsStats.map((stat, index) => {
          const TrendIcon = getTrendIcon(stat.trend);
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-4 border border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(stat.trend)}`}>
                  <TrendIcon size={16} />
                  <span className="text-sm font-medium">{stat.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Report Type Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Report Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
        >
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-lg font-semibold text-white">Incidents by Type</h3>
            <p className="text-gray-400 text-sm">Distribution of incident types</p>
          </div>
          
          <div className="p-4 space-y-4">
            {incidentsByType.map((incident, index) => (
              <motion.div
                key={incident.type}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded ${incident.color}`}></div>
                  <span className="text-white text-sm">{incident.type}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-medium">{incident.count}</span>
                  <span className="text-gray-400 text-sm ml-2">({incident.percentage}%)</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Response Time by Zone */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
        >
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-lg font-semibold text-white">Response Time by Zone</h3>
            <p className="text-gray-400 text-sm">Average response times and efficiency</p>
          </div>
          
          <div className="p-4 space-y-4">
            {responseTimeData.map((zone, index) => (
              <motion.div
                key={zone.zone}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{zone.zone}</h4>
                  <span className={`text-sm font-medium ${getEfficiencyColor(zone.efficiency)}`}>
                    {zone.efficiency}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Avg Time: {zone.avgTime}</span>
                  <span className="text-gray-400">Incidents: {zone.incidents}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        zone.efficiency >= 95 ? 'bg-green-500' :
                        zone.efficiency >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${zone.efficiency}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* User Activity Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
      >
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white">User Activity Overview</h3>
          <p className="text-gray-400 text-sm">Active users by role</p>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {userActivity.map((activity, index) => (
              <motion.div
                key={activity.role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-gray-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-green-500"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${activity.percentage}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{activity.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <h4 className="text-white font-medium mb-1">{activity.role}</h4>
                <p className="text-gray-400 text-sm">{activity.active}/{activity.total} active</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick Report Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Report Actions</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Performance Report</span>
          </button>
          
          <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Users className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">User Activity</span>
          </button>
          
          <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Incident Summary</span>
          </button>
          
          <button className="p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Monthly Report</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsReportsPage;
