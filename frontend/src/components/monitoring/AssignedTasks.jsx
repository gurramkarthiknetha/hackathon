import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Navigation,
  Phone,
  MessageSquare,
  User,
  Flame,
  Users,
  Heart,
  Shield,
  Zap
} from "lucide-react";

const AssignedTasks = ({ currentLocation }) => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  // Mock assigned tasks
  const mockTasks = [
    {
      id: 1,
      type: "crowd_surge",
      title: "Crowd Management - East Zone",
      description: "High crowd density detected near main stage. Immediate intervention required.",
      priority: "high",
      status: "assigned",
      assignedAt: new Date(Date.now() - 5 * 60 * 1000),
      location: {
        name: "East Zone - Main Stage",
        coordinates: { latitude: 40.7132, longitude: -74.0055 }
      },
      estimatedTime: "8 min",
      distance: "0.3 km"
    },
    {
      id: 2,
      type: "medical_emergency",
      title: "Medical Assistance Required",
      description: "Person requiring medical attention in food court area.",
      priority: "medium",
      status: "in_progress",
      assignedAt: new Date(Date.now() - 15 * 60 * 1000),
      startedAt: new Date(Date.now() - 8 * 60 * 1000),
      location: {
        name: "West Zone - Food Court",
        coordinates: { latitude: 40.7131, longitude: -74.0075 }
      },
      estimatedTime: "12 min",
      distance: "0.5 km"
    },
    {
      id: 3,
      type: "equipment_failure",
      title: "Sound System Check",
      description: "Routine check of backup sound equipment after earlier malfunction.",
      priority: "low",
      status: "pending",
      assignedAt: new Date(Date.now() - 30 * 60 * 1000),
      location: {
        name: "North Zone - Technical Area",
        coordinates: { latitude: 40.7151, longitude: -74.0065 }
      },
      estimatedTime: "15 min",
      distance: "0.7 km"
    }
  ];

  useEffect(() => {
    setTasks(mockTasks);
  }, []);

  const getTaskIcon = (type) => {
    switch (type) {
      case "fire": return Flame;
      case "crowd_surge": return Users;
      case "medical_emergency": return Heart;
      case "security_threat": return Shield;
      case "equipment_failure": return Zap;
      default: return AlertTriangle;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-red-500 bg-red-900/20 text-red-400";
      case "medium": return "border-yellow-500 bg-yellow-900/20 text-yellow-400";
      case "low": return "border-green-500 bg-green-900/20 text-green-400";
      default: return "border-gray-500 bg-gray-900/20 text-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "assigned": return "text-blue-400";
      case "in_progress": return "text-yellow-400";
      case "pending": return "text-gray-400";
      case "completed": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  const handleTaskAction = (taskId, action) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        switch (action) {
          case "start":
            return { ...task, status: "in_progress", startedAt: new Date() };
          case "complete":
            return { ...task, status: "completed", completedAt: new Date() };
          case "navigate":
            // In a real app, this would open navigation
            console.log("Navigate to:", task.location);
            break;
          default:
            return task;
        }
      }
      return task;
    }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "active") return ["assigned", "in_progress"].includes(task.status);
    return task.priority === filter;
  });

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60));
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/60 backdrop-blur-xl lg:rounded-xl lg:border lg:border-gray-700/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Assigned Tasks</h3>
              <p className="text-gray-400 text-sm">{filteredTasks.length} tasks</p>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto">
          {["all", "active", "high", "medium", "low"].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
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

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredTasks.map((task, index) => {
            const IconComponent = getTaskIcon(task.type);
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 border-l-4 border-b border-gray-700/30 ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      task.priority === "high" ? "bg-red-600" :
                      task.priority === "medium" ? "bg-yellow-600" : "bg-green-600"
                    }`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-medium text-sm">{task.title}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        {task.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400 mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{task.location.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(task.assignedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span>ETA: {task.estimatedTime}</span>
                        <span>Distance: {task.distance}</span>
                        <span className={`font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-3">
                  {task.status === "assigned" && (
                    <button
                      onClick={() => handleTaskAction(task.id, "start")}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <ArrowRight className="h-3 w-3" />
                      <span>Start Task</span>
                    </button>
                  )}
                  
                  {task.status === "in_progress" && (
                    <button
                      onClick={() => handleTaskAction(task.id, "complete")}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Complete</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleTaskAction(task.id, "navigate")}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Navigate</span>
                  </button>
                  
                  <button className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors">
                    <MessageSquare className="h-3 w-3" />
                    <span>Contact</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <CheckCircle className="h-8 w-8 mb-2" />
            <p className="text-sm">No tasks matching current filter</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <div className="flex items-center space-x-4">
            <span>{tasks.filter(t => t.status === "assigned").length} Assigned</span>
            <span>{tasks.filter(t => t.status === "in_progress").length} Active</span>
            <span>{tasks.filter(t => t.status === "completed").length} Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignedTasks;
