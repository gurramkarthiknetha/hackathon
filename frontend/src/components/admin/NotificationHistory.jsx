import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Filter,
  Search,
  Mail,
  Bell,
  AlertTriangle,
  Settings,
  Megaphone,
  Zap,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "react-hot-toast";
import notificationService from "../../services/notificationService";

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotificationHistory();
  }, [currentPage, filterType, filterSeverity]);

  const loadNotificationHistory = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotificationHistory({
        page: currentPage,
        limit: 20,
        type: filterType !== 'all' ? filterType : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined
      });
      
      setNotifications(response.notifications || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to load notification history:', error);
      toast.error('Failed to load notification history');
      // Fallback to mock data for demo
      setNotifications(getMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const getMockNotifications = () => [
    {
      id: '1',
      type: 'emergency',
      title: '🚨 Emergency Alert',
      message: 'Emergency contact initiated by admin. All responders please check in immediately.',
      severity: 'critical',
      recipients: 'all',
      sentBy: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      delivered: 45,
      failed: 2,
      status: 'completed'
    },
    {
      id: '2',
      type: 'system',
      title: 'System Maintenance Notice',
      message: 'Scheduled maintenance will occur tonight from 2 AM to 4 AM EST.',
      severity: 'medium',
      recipients: 'all',
      sentBy: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      delivered: 52,
      failed: 0,
      status: 'completed'
    },
    {
      id: '3',
      type: 'announcement',
      title: 'New Feature Release',
      message: 'We have released new monitoring features. Check out the updated dashboard!',
      severity: 'low',
      recipients: 'operators',
      sentBy: 'admin',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      delivered: 28,
      failed: 1,
      status: 'completed'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'system': return Settings;
      case 'announcement': return Megaphone;
      case 'maintenance': return Zap;
      default: return Bell;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    loadNotificationHistory();
    toast.success('Notification history refreshed');
  };

  const handleExport = () => {
    // In a real app, this would export to CSV/Excel
    toast.success('Export functionality would be implemented here');
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-400" />
          Notification History
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            title="Export"
          >
            <Download className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="emergency">Emergency</option>
          <option value="system">System</option>
          <option value="announcement">Announcement</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <div className="flex items-center space-x-2 text-gray-300">
          <Filter className="h-4 w-4" />
          <span className="text-sm">
            {filteredNotifications.length} of {notifications.length}
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
            <span className="ml-2 text-gray-300">Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => {
            const TypeIcon = getTypeIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-lg border ${getSeverityColor(notification.severity)} hover:bg-opacity-20 transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-gray-700">
                      <TypeIcon className="h-4 w-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium">{notification.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(notification.severity)}`}>
                          {notification.severity}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>To: {notification.recipients}</span>
                        <span>By: {notification.sentBy}</span>
                        <span>{new Date(notification.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-400 font-medium">{notification.delivered || 0}</div>
                      <div className="text-gray-400 text-xs">Delivered</div>
                    </div>
                    {notification.failed > 0 && (
                      <div className="text-center">
                        <div className="text-red-400 font-medium">{notification.failed}</div>
                        <div className="text-gray-400 text-xs">Failed</div>
                      </div>
                    )}
                    <div className={`text-center ${getStatusColor(notification.status)}`}>
                      <div className="font-medium capitalize">{notification.status}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm"
          >
            Previous
          </button>
          <span className="text-gray-300 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationHistory;
