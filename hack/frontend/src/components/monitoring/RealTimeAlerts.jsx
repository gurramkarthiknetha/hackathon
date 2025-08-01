import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  MapPin,
  User,
  X,
  Archive,
  CheckCircle,
  AlertCircle,
  Flame,
  Users,
  Heart,
  Shield,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";
import { useSocket } from "../../hooks/useSocket";

const RealTimeAlerts = ({ onIncidentSelect }) => {
  const { incidents, isConnected, removeIncident } = useSocket();
  const [filter, setFilter] = useState("all");

  // Use real-time incidents from WebSocket
  const alerts = incidents;

  const getIncidentIcon = (type) => {
    switch (type) {
      case "fire": return Flame;
      case "crowd_surge": return Users;
      case "medical_emergency": return Heart;
      case "unconscious_person": return Heart;
      case "security_threat": return Shield;
      case "equipment_failure": return Zap;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "border-red-500 bg-red-900/20 text-red-400";
      case "high": return "border-orange-500 bg-orange-900/20 text-orange-400";
      case "medium": return "border-yellow-500 bg-yellow-900/20 text-yellow-400";
      case "low": return "border-green-500 bg-green-900/20 text-green-400";
      default: return "border-gray-500 bg-gray-900/20 text-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "text-red-400";
      case "assigned": return "text-yellow-400";
      case "in_progress": return "text-blue-400";
      case "resolved": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === "all") return true;
    if (filter === "active") return ["active", "assigned", "in_progress"].includes(alert.status);
    return alert.severity === filter;
  });

  const handleDismissAlert = (alertId) => {
    removeIncident(alertId);
  };

  const handleAlertClick = (alert) => {
    onIncidentSelect && onIncidentSelect(alert);
  };

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Real-Time Alerts</h3>
              <p className="text-gray-400 text-sm">{filteredAlerts.length} incidents</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-400" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">LIVE</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-xs font-medium">OFFLINE</span>
              </>
            )}
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {["all", "active", "critical", "high", "medium"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === filterType
                  ? "bg-cyan-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const IconComponent = getIncidentIcon(alert.type);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 border-l-4 border-b border-gray-700/30 cursor-pointer hover:bg-gray-700/20 transition-colors ${getSeverityColor(alert.severity)}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === "critical" ? "bg-red-600" :
                      alert.severity === "high" ? "bg-orange-600" :
                      alert.severity === "medium" ? "bg-yellow-600" : "bg-green-600"
                    }`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium text-sm">
                          {alert.type.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.zone.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{alert.confidence}%</span>
                        </div>
                      </div>
                      
                      {alert.assignedTo && (
                        <div className="flex items-center space-x-1 mt-1 text-xs text-blue-400">
                          <User className="h-3 w-3" />
                          <span>Assigned to {alert.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-2">
                    <div className={`text-xs font-medium ${getStatusColor(alert.status)}`}>
                      {alert.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismissAlert(alert.id);
                      }}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <CheckCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">No alerts matching current filter</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center space-x-4">
            <span>{alerts.filter(a => a.status === "active").length} Active</span>
            <span>{alerts.filter(a => a.status === "resolved").length} Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAlerts;
