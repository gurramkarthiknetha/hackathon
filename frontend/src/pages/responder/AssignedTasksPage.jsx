import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import AssignedTasks from "../../components/monitoring/AssignedTasks";
import { useState, useEffect } from "react";
import { Target, Clock, CheckCircle, AlertTriangle, Filter, Plus, Search } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const AssignedTasksPage = () => {
  const { sidebarOpen } = useSidebar();
  const { user } = useAuthStore();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [taskFilter, setTaskFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock task statistics
  const taskStats = [
    { 
      label: "Active Tasks", 
      value: "8", 
      color: "from-blue-500 to-blue-600",
      change: "+2",
      icon: Target
    },
    { 
      label: "Completed Today", 
      value: "12", 
      color: "from-green-500 to-green-600",
      change: "+4",
      icon: CheckCircle
    },
    { 
      label: "Avg Response Time", 
      value: "3.2m", 
      color: "from-purple-500 to-purple-600",
      change: "-0.5m",
      icon: Clock
    },
    { 
      label: "High Priority", 
      value: "3", 
      color: "from-red-500 to-red-600",
      change: "+1",
      icon: AlertTriangle
    }
  ];

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      action: "Task Completed",
      task: "Medical Emergency Response",
      location: "East Zone - Main Entrance",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: "completed"
    },
    {
      id: 2,
      action: "Task Started",
      task: "Crowd Control Support",
      location: "South Zone - Stage Area",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: "started"
    },
    {
      id: 3,
      action: "Task Assigned",
      task: "Equipment Check",
      location: "West Zone - Security Post",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      type: "assigned"
    }
  ];

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const getActivityColor = (type) => {
    switch (type) {
      case 'completed': return 'text-green-400 bg-green-600';
      case 'started': return 'text-blue-400 bg-blue-600';
      case 'assigned': return 'text-yellow-400 bg-yellow-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'active', label: 'Active Tasks' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'completed', label: 'Completed' }
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-600 text-transparent bg-clip-text mb-2">
            Assigned Tasks
          </h1>
          <p className="text-gray-300">
            Manage and track your assigned emergency response tasks
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200">
            <Plus size={20} />
          </button>
        </div>
      </motion.div>

      {/* Task Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {taskStats.map((stat, index) => (
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
                <p className="text-gray-500 text-xs">today</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Task Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Tasks</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by task description, location, or ID..."
                className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Status</label>
            <select
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Show completed tasks</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded bg-gray-700 border-gray-600" />
              <span className="text-gray-300 text-sm">Auto-refresh</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              setSearchTerm('');
              setTaskFilter('all');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Tasks Component */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]">
            <AssignedTasks currentLocation={currentLocation} filter={taskFilter} searchTerm={searchTerm} />
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <p className="text-gray-400 text-sm">Your latest task updates</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                      {activity.action}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-medium mt-2 text-sm">{activity.task}</h4>
                  <p className="text-gray-400 text-xs mt-1">{activity.location}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {activity.timestamp.toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Task Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Mark Complete</span>
          </button>
          
          <button className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Request Extension</span>
          </button>
          
          <button className="p-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 text-center">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Report Issue</span>
          </button>
          
          <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-center">
            <Plus className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Request Backup</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AssignedTasksPage;
