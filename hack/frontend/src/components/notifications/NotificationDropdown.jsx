import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Settings,
  Archive,
  Trash2,
  MoreVertical,
  Filter,
  Search,
  Flame,
  Users,
  Heart,
  Shield,
  Zap
} from "lucide-react";
import { useSocket } from "../../hooks/useSocket";
import useNotificationStore from "../../store/notificationStore";
import { formatDistanceToNow } from "date-fns";

const NotificationDropdown = ({ isOpen, onClose, onToggle }) => {
  const { incidents, systemAlerts } = useSocket();
  const {
    notifications: storedNotifications,
    emailNotifications,
    unreadCount: storeUnreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    simulateEmailNotification
  } = useNotificationStore();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, incidents, system, email
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Combine different types of notifications
  useEffect(() => {
    const allNotifications = [
      // Real-time incidents
      ...incidents.map(incident => ({
        id: `incident-${incident.id}`,
        type: "incident",
        title: `${incident.type.replace('_', ' ')} Incident`,
        message: incident.description,
        severity: incident.severity,
        timestamp: new Date(incident.createdAt),
        read: false,
        icon: getIncidentIcon(incident.type),
        data: incident,
        actionUrl: `/dashboard/incidents/${incident.id}`
      })),

      // System alerts
      ...systemAlerts.map(alert => ({
        id: `system-${alert.id}`,
        type: "system",
        title: alert.title || "System Alert",
        message: alert.message,
        severity: alert.severity || "medium",
        timestamp: new Date(alert.timestamp),
        read: false,
        icon: AlertTriangle,
        data: alert
      })),

      // Stored notifications (including email notifications)
      ...storedNotifications
    ];

    // Sort by timestamp (newest first)
    allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setNotifications(allNotifications);

    // Calculate unread count from all sources
    const incidentUnread = incidents.length;
    const systemUnread = systemAlerts.length;
    const storedUnread = storedNotifications.filter(n => !n.read).length;
    setUnreadCount(incidentUnread + systemUnread + storedUnread);
  }, [incidents, systemAlerts, storedNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  // Simulate email notifications for demo purposes
  useEffect(() => {
    // Simulate email notifications when incidents are created/updated
    incidents.forEach(incident => {
      if (incident.status === 'active' && !storedNotifications.find(n => n.id === `email-created-${incident.id}`)) {
        simulateEmailNotification('incident_created', incident);
      }
      if (incident.assignedTo && !storedNotifications.find(n => n.id === `email-assigned-${incident.id}`)) {
        simulateEmailNotification('incident_assigned', incident);
      }
    });
  }, [incidents, simulateEmailNotification, storedNotifications]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "high": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "low": return "text-green-400 bg-green-500/10 border-green-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "incident": return "text-red-400";
      case "system": return "text-blue-400";
      case "email": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === "all" || notification.type === filter;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleMarkAsRead = (notificationId) => {
    // For stored notifications, use the store action
    if (storedNotifications.find(n => n.id === notificationId)) {
      markAsRead(notificationId);
    } else {
      // For real-time notifications, just update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDeleteNotification = (notificationId) => {
    if (storedNotifications.find(n => n.id === notificationId)) {
      removeNotification(notificationId);
    } else {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  const handleClearAllNotifications = () => {
    clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-12 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {["all", "incident", "system", "email"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === filterType
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => {
              const IconComponent = notification.icon;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                    !notification.read ? "bg-gray-700/20" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(notification.severity)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm truncate">
                            {notification.title}
                          </p>
                          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className={`text-xs ${getTypeColor(notification.type)}`}>
                              {notification.type.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Bell className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications found</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-700 flex justify-between items-center">
          <button
            onClick={handleClearAllNotifications}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear all</span>
          </button>
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1">
            <Settings className="h-3 w-3" />
            <span>Settings</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default NotificationDropdown;
