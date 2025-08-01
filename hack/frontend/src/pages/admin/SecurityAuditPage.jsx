import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { Shield, AlertTriangle, Eye, Lock, Activity, Download, Search, Filter, Clock, User, Globe } from "lucide-react";

const SecurityAuditPage = () => {
  const { sidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock security statistics
  const securityStats = [
    { 
      label: "Security Score", 
      value: "94%", 
      color: "from-green-500 to-green-600",
      change: "+2%",
      icon: Shield
    },
    { 
      label: "Active Threats", 
      value: "3", 
      color: "from-red-500 to-red-600",
      change: "-2",
      icon: AlertTriangle
    },
    { 
      label: "Failed Logins", 
      value: "12", 
      color: "from-yellow-500 to-yellow-600",
      change: "+5",
      icon: Lock
    },
    { 
      label: "Audit Events", 
      value: "1,247", 
      color: "from-blue-500 to-blue-600",
      change: "+156",
      icon: Activity
    }
  ];

  // Mock audit logs
  const auditLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      user: "admin@emergency.com",
      action: "User Login",
      resource: "Dashboard",
      ip: "192.168.1.100",
      status: "success",
      severity: "low"
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      user: "operator@emergency.com",
      action: "Incident Created",
      resource: "INC-2024-001",
      ip: "192.168.1.101",
      status: "success",
      severity: "medium"
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      user: "unknown",
      action: "Failed Login Attempt",
      resource: "Login Page",
      ip: "203.0.113.45",
      status: "failed",
      severity: "high"
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      user: "responder@emergency.com",
      action: "Report Submitted",
      resource: "RPT-2024-003",
      ip: "192.168.1.102",
      status: "success",
      severity: "low"
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      user: "admin@emergency.com",
      action: "System Settings Changed",
      resource: "Security Settings",
      ip: "192.168.1.100",
      status: "success",
      severity: "high"
    }
  ];

  // Mock security threats
  const securityThreats = [
    {
      id: 1,
      type: "Brute Force Attack",
      severity: "high",
      source: "203.0.113.45",
      target: "Login System",
      status: "blocked",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      attempts: 15
    },
    {
      id: 2,
      type: "Suspicious Activity",
      severity: "medium",
      source: "198.51.100.23",
      target: "API Endpoint",
      status: "monitoring",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      attempts: 3
    },
    {
      id: 3,
      type: "Rate Limit Exceeded",
      severity: "low",
      source: "192.168.1.150",
      target: "Dashboard API",
      status: "resolved",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      attempts: 1200
    }
  ];

  // Mock system health
  const systemHealth = [
    { component: "Authentication Service", status: "healthy", uptime: "99.9%" },
    { component: "Database", status: "healthy", uptime: "99.8%" },
    { component: "API Gateway", status: "warning", uptime: "98.5%" },
    { component: "File Storage", status: "healthy", uptime: "99.7%" },
    { component: "Notification Service", status: "healthy", uptime: "99.6%" }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: Eye },
    { id: 'threats', label: 'Security Threats', icon: AlertTriangle },
    { id: 'health', label: 'System Health', icon: Activity }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-600';
      case 'medium': return 'text-yellow-400 bg-yellow-600';
      case 'low': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'blocked': return 'text-red-400';
      case 'monitoring': return 'text-yellow-400';
      case 'resolved': return 'text-green-400';
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.severity === filterType;
    return matchesSearch && matchesFilter;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Recent Security Events</h4>
          <div className="space-y-3">
            {auditLogs.slice(0, 3).map((log, index) => (
              <div key={log.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{log.action}</p>
                  <p className="text-gray-400 text-xs">{log.user}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                  {log.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Active Threats</h4>
          <div className="space-y-3">
            {securityThreats.filter(t => t.status !== 'resolved').map((threat, index) => (
              <div key={threat.id} className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{threat.type}</p>
                  <p className="text-gray-400 text-xs">{threat.source}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                  {threat.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      
      <div className="space-y-2">
        {filteredLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-800 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                  {log.severity}
                </span>
                <h4 className="text-white font-medium">{log.action}</h4>
              </div>
              <span className={`text-sm ${getStatusColor(log.status)}`}>
                {log.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">User:</span>
                <span className="text-white">{log.user}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Resource:</span>
                <span className="text-white">{log.resource}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">IP:</span>
                <span className="text-white">{log.ip}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-400">Time:</span>
                <span className="text-white">{log.timestamp.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-4">
      {securityThreats.map((threat, index) => (
        <motion.div
          key={threat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-gray-800 rounded-lg border-l-4 border-red-500"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                {threat.severity}
              </span>
              <h4 className="text-white font-medium">{threat.type}</h4>
            </div>
            <span className={`text-sm ${getStatusColor(threat.status)}`}>
              {threat.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Source:</span>
              <span className="text-white ml-2">{threat.source}</span>
            </div>
            <div>
              <span className="text-gray-400">Target:</span>
              <span className="text-white ml-2">{threat.target}</span>
            </div>
            <div>
              <span className="text-gray-400">Attempts:</span>
              <span className="text-white ml-2">{threat.attempts}</span>
            </div>
            <div>
              <span className="text-gray-400">Time:</span>
              <span className="text-white ml-2">{threat.timestamp.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors duration-200">
              Block IP
            </button>
            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors duration-200">
              Investigate
            </button>
            <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded text-xs transition-colors duration-200">
              Mark Resolved
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-4">
      {systemHealth.map((component, index) => (
        <motion.div
          key={component.component}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 bg-gray-800 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">{component.component}</h4>
              <p className="text-gray-400 text-sm">Uptime: {component.uptime}</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                component.status === 'healthy' ? 'bg-green-500' :
                component.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${getStatusColor(component.status)}`}>
                {component.status.toUpperCase()}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'audit': return renderAuditLogs();
      case 'threats': return renderThreats();
      case 'health': return renderSystemHealth();
      default: return renderOverview();
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-600 text-transparent bg-clip-text mb-2">
            Security & Audit
          </h1>
          <p className="text-gray-300">
            Monitor security events, threats, and system integrity
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200">
            <Download size={20} />
            <span>Export Logs</span>
          </button>
        </div>
      </motion.div>

      {/* Security Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {securityStats.map((stat, index) => (
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
                <p className="text-gray-500 text-xs">24h</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Security Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
      >
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default SecurityAuditPage;
