import { useState } from "react";
import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import {
  Bell,
  Send,
  Clock,
  Users,
  BarChart3,
  Plus,
  FileText,
  Calendar,
  AlertTriangle
} from "lucide-react";
import AdminQuickActions from "../../components/admin/AdminQuickActions";
import NotificationHistory from "../../components/admin/NotificationHistory";

const NotificationManagementPage = () => {
  const { sidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('quick-actions');

  const tabs = [
    {
      id: 'quick-actions',
      label: 'Quick Actions',
      icon: Send,
      description: 'Send notifications instantly'
    },
    {
      id: 'history',
      label: 'History',
      icon: Clock,
      description: 'View sent notifications'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      description: 'Manage notification templates'
    },
    {
      id: 'scheduled',
      label: 'Scheduled',
      icon: Calendar,
      description: 'Manage scheduled notifications'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View notification statistics'
    }
  ];

  const notificationStats = [
    {
      label: "Total Sent",
      value: "1,247",
      change: "+18%",
      color: "from-blue-500 to-blue-600",
      icon: Send
    },
    {
      label: "Delivered",
      value: "1,198",
      change: "+16%",
      color: "from-green-500 to-green-600",
      icon: Users
    },
    {
      label: "Failed",
      value: "49",
      change: "-12%",
      color: "from-red-500 to-red-600",
      icon: AlertTriangle
    },
    {
      label: "Scheduled",
      value: "23",
      change: "+5%",
      color: "from-purple-500 to-purple-600",
      icon: Calendar
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quick-actions':
        return (
          <div className="space-y-6">
            <AdminQuickActions />
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-400" />
                Quick Templates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "System Maintenance", type: "maintenance", severity: "medium" },
                  { title: "Emergency Alert", type: "emergency", severity: "critical" },
                  { title: "Welcome Message", type: "general", severity: "low" }
                ].map((template, index) => (
                  <motion.div
                    key={template.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors cursor-pointer"
                  >
                    <h4 className="text-white font-medium mb-2">{template.title}</h4>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        template.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        template.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {template.severity}
                      </span>
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Use Template
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'history':
        return <NotificationHistory />;
      
      case 'templates':
        return (
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-400" />
                Notification Templates
              </h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                <span>New Template</span>
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Template Management</p>
              <p className="text-sm">Create and manage reusable notification templates</p>
            </div>
          </div>
        );
      
      case 'scheduled':
        return (
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-400" />
                Scheduled Notifications
              </h3>
              <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors">
                <Plus className="h-4 w-4" />
                <span>Schedule New</span>
              </button>
            </div>
            <div className="text-center py-12 text-gray-400">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Scheduled Notifications</p>
              <p className="text-sm">Manage notifications scheduled for future delivery</p>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                Notification Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {notificationStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gray-700 bg-opacity-50 rounded-xl p-6 border border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        <p className="text-green-400 text-sm mt-1">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
              <h4 className="text-lg font-semibold text-white mb-4">Delivery Performance</h4>
              <div className="text-center py-8 text-gray-400">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed analytics charts would be implemented here</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`p-6 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Bell className="h-8 w-8 mr-3 text-blue-400" />
          Notification Management
        </h1>
        <p className="text-gray-300">
          Send, schedule, and manage notifications across your system
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-2 border border-gray-700">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default NotificationManagementPage;
