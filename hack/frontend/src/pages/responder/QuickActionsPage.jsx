import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import QuickActions from "../../components/monitoring/QuickActions";
import { useState } from "react";
import { Zap, Phone, MessageSquare, Camera, Shield, Heart, Flame, AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const QuickActionsPage = () => {
  const { sidebarOpen } = useSidebar();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('emergency');

  // Mock action statistics
  const actionStats = [
    { 
      label: "Actions Today", 
      value: "23", 
      color: "from-blue-500 to-blue-600",
      change: "+5",
      icon: Zap
    },
    { 
      label: "Emergency Calls", 
      value: "8", 
      color: "from-red-500 to-red-600",
      change: "+2",
      icon: Phone
    },
    { 
      label: "Photos Taken", 
      value: "15", 
      color: "from-green-500 to-green-600",
      change: "+7",
      icon: Camera
    },
    { 
      label: "Avg Response", 
      value: "45s", 
      color: "from-purple-500 to-purple-600",
      change: "-5s",
      icon: Clock
    }
  ];

  // Emergency actions
  const emergencyActions = [
    {
      id: "medical_emergency",
      title: "Medical Emergency",
      description: "Request immediate medical assistance",
      icon: Heart,
      color: "bg-red-600 hover:bg-red-700",
      urgent: true,
      shortcut: "M"
    },
    {
      id: "fire_alert",
      title: "Fire Alert",
      description: "Report fire or smoke detection",
      icon: Flame,
      color: "bg-orange-600 hover:bg-orange-700",
      urgent: true,
      shortcut: "F"
    },
    {
      id: "security_threat",
      title: "Security Threat",
      description: "Report security incident",
      icon: Shield,
      color: "bg-purple-600 hover:bg-purple-700",
      urgent: true,
      shortcut: "S"
    },
    {
      id: "general_emergency",
      title: "General Emergency",
      description: "Other emergency situation",
      icon: AlertTriangle,
      color: "bg-yellow-600 hover:bg-yellow-700",
      urgent: true,
      shortcut: "E"
    }
  ];

  // Communication actions
  const communicationActions = [
    {
      id: "contact_dispatch",
      title: "Contact Dispatch",
      description: "Call command center",
      icon: Phone,
      color: "bg-blue-600 hover:bg-blue-700",
      shortcut: "D"
    },
    {
      id: "team_message",
      title: "Team Message",
      description: "Send message to team",
      icon: MessageSquare,
      color: "bg-green-600 hover:bg-green-700",
      shortcut: "T"
    },
    {
      id: "photo_report",
      title: "Photo Report",
      description: "Take and send photo",
      icon: Camera,
      color: "bg-indigo-600 hover:bg-indigo-700",
      shortcut: "P"
    },
    {
      id: "status_update",
      title: "Status Update",
      description: "Update your status",
      icon: CheckCircle,
      color: "bg-teal-600 hover:bg-teal-700",
      shortcut: "U"
    }
  ];

  // Recent actions
  const recentActions = [
    {
      id: 1,
      action: "Medical Emergency",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: "completed",
      location: "East Zone - Main Entrance"
    },
    {
      id: 2,
      action: "Photo Report",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: "completed",
      location: "South Zone - Stage Area"
    },
    {
      id: 3,
      action: "Team Message",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: "completed",
      location: "West Zone - Security Post"
    },
    {
      id: 4,
      action: "Contact Dispatch",
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      status: "completed",
      location: "North Zone - Emergency Exit"
    }
  ];

  const categories = [
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'communication', label: 'Communication', icon: MessageSquare },
    { id: 'all', label: 'All Actions', icon: Zap }
  ];

  const handleQuickAction = (action) => {
    console.log("Quick action triggered:", action.id);
    // In a real app, this would trigger the actual action
    alert(`${action.title} action triggered!`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-600';
      case 'pending': return 'text-yellow-400 bg-yellow-600';
      case 'failed': return 'text-red-400 bg-red-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getCurrentActions = () => {
    switch (selectedCategory) {
      case 'emergency': return emergencyActions;
      case 'communication': return communicationActions;
      case 'all': return [...emergencyActions, ...communicationActions];
      default: return emergencyActions;
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-600 text-transparent bg-clip-text mb-2">
            Quick Actions
          </h1>
          <p className="text-gray-300">
            Instant access to emergency actions and communication tools
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-gray-400 text-sm">Keyboard shortcuts enabled</p>
            <p className="text-gray-500 text-xs">Press Alt + letter to trigger</p>
          </div>
        </div>
      </motion.div>

      {/* Action Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {actionStats.map((stat, index) => (
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

      {/* Category Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Action Categories</h3>
        
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span className="font-medium">{category.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">
              {selectedCategory === 'all' ? 'All Actions' : 
               selectedCategory === 'emergency' ? 'Emergency Actions' : 'Communication Actions'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getCurrentActions().map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => handleQuickAction(action)}
                  className={`${action.color} text-white rounded-xl p-6 transition-all duration-200 shadow-lg ${
                    action.urgent ? "ring-2 ring-red-400/50 animate-pulse" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <action.icon className="h-8 w-8 text-white" />
                    {action.shortcut && (
                      <span className="text-xs bg-black/20 px-2 py-1 rounded">
                        Alt+{action.shortcut}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <h4 className="font-semibold text-lg mb-1">{action.title}</h4>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">Recent Actions</h3>
              <p className="text-gray-400 text-sm">Your latest activities</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {recentActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">{action.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-1">{action.location}</p>
                  <p className="text-gray-500 text-xs">
                    {action.timestamp.toLocaleTimeString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Quick Actions Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[400px]"
      >
        <QuickActions />
      </motion.div>

      {/* Emergency Protocols */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Emergency Protocols</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="h-5 w-5 text-red-400" />
              <h4 className="text-white font-medium">Medical Emergency</h4>
            </div>
            <p className="text-gray-300 text-sm">
              1. Assess the situation<br/>
              2. Call for medical backup<br/>
              3. Provide first aid if trained<br/>
              4. Document the incident
            </p>
          </div>
          
          <div className="p-4 bg-orange-900/20 border border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <h4 className="text-white font-medium">Fire Emergency</h4>
            </div>
            <p className="text-gray-300 text-sm">
              1. Sound the alarm<br/>
              2. Evacuate the area<br/>
              3. Call fire department<br/>
              4. Use extinguisher if safe
            </p>
          </div>
          
          <div className="p-4 bg-purple-900/20 border border-purple-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <h4 className="text-white font-medium">Security Threat</h4>
            </div>
            <p className="text-gray-300 text-sm">
              1. Ensure personal safety<br/>
              2. Alert security team<br/>
              3. Isolate the threat<br/>
              4. Coordinate with authorities
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickActionsPage;
