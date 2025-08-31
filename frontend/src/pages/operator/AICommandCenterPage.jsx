import { motion } from "framer-motion";
import { useSidebar } from "../../components/layout/DashboardLayout";
import CommandCenter from "../../components/monitoring/CommandCenter";
import { useState } from "react";
import { Brain, Cpu, Zap, TrendingUp, Activity, Settings, Download } from "lucide-react";

const AICommandCenterPage = () => {
  const { sidebarOpen } = useSidebar();
  const [aiMode, setAiMode] = useState('auto'); // auto, manual, learning
  const [predictionAccuracy, setPredictionAccuracy] = useState(94.2);
  const [processingLoad, setProcessingLoad] = useState(67);

  // Mock AI statistics
  const aiStats = [
    { 
      label: "Prediction Accuracy", 
      value: `${predictionAccuracy}%`, 
      color: "from-green-500 to-green-600",
      trend: "+2.1%",
      icon: TrendingUp
    },
    { 
      label: "Processing Load", 
      value: `${processingLoad}%`, 
      color: "from-blue-500 to-blue-600",
      trend: "-5.3%",
      icon: Cpu
    },
    { 
      label: "Active Models", 
      value: "8", 
      color: "from-purple-500 to-purple-600",
      trend: "+1",
      icon: Brain
    },
    { 
      label: "Decisions/Min", 
      value: "142", 
      color: "from-orange-500 to-orange-600",
      trend: "+18",
      icon: Activity
    }
  ];

  // Mock AI models
  const aiModels = [
    {
      name: "Crowd Density Predictor",
      status: "active",
      accuracy: 96.8,
      lastUpdate: "2 min ago",
      description: "Predicts crowd density patterns and potential surge areas"
    },
    {
      name: "Incident Classifier",
      status: "active",
      accuracy: 94.2,
      lastUpdate: "1 min ago",
      description: "Automatically classifies and prioritizes incoming incidents"
    },
    {
      name: "Resource Optimizer",
      status: "active",
      accuracy: 91.5,
      lastUpdate: "3 min ago",
      description: "Optimizes responder deployment and resource allocation"
    },
    {
      name: "Risk Assessment Engine",
      status: "active",
      accuracy: 89.7,
      lastUpdate: "5 min ago",
      description: "Evaluates risk levels and suggests preventive measures"
    },
    {
      name: "Anomaly Detector",
      status: "learning",
      accuracy: 87.3,
      lastUpdate: "1 min ago",
      description: "Detects unusual patterns in crowd behavior and system metrics"
    },
    {
      name: "Response Time Predictor",
      status: "active",
      accuracy: 93.1,
      lastUpdate: "4 min ago",
      description: "Predicts optimal response times based on current conditions"
    }
  ];

  // Mock AI recommendations
  const recommendations = [
    {
      id: 1,
      priority: "high",
      type: "resource_allocation",
      title: "Deploy Additional Responders to East Zone",
      description: "AI predicts 85% chance of crowd surge in East Zone within next 30 minutes based on current density patterns.",
      confidence: 85,
      timeframe: "30 minutes",
      action: "Deploy 2 additional responders"
    },
    {
      id: 2,
      priority: "medium",
      type: "preventive",
      title: "Increase Monitoring in West Zone",
      description: "Unusual crowd movement patterns detected. Recommend increased camera monitoring and alert readiness.",
      confidence: 72,
      timeframe: "15 minutes",
      action: "Activate additional cameras"
    },
    {
      id: 3,
      priority: "low",
      type: "optimization",
      title: "Optimize Camera Angles",
      description: "AI suggests adjusting camera angles in North Zone for better coverage of blind spots.",
      confidence: 68,
      timeframe: "1 hour",
      action: "Adjust 3 camera positions"
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-600';
      case 'medium': return 'text-yellow-400 bg-yellow-600';
      case 'low': return 'text-green-400 bg-green-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'learning': return 'text-blue-400';
      case 'inactive': return 'text-gray-400';
      default: return 'text-gray-400';
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-2">
            AI Command Center
          </h1>
          <p className="text-gray-300">
            Intelligent decision support system with predictive analytics and automated recommendations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={aiMode}
            onChange={(e) => setAiMode(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="auto">Auto Mode</option>
            <option value="manual">Manual Mode</option>
            <option value="learning">Learning Mode</option>
          </select>
          
          <button className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200">
            <Download size={20} />
          </button>
          
          <button className="p-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
            <Settings size={20} />
          </button>
        </div>
      </motion.div>

      {/* AI Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {aiStats.map((stat, index) => (
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
                <span className="text-green-400 text-sm font-medium">{stat.trend}</span>
                <p className="text-gray-500 text-xs">vs last hour</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Models Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-700/50">
              <h3 className="text-lg font-semibold text-white">AI Models</h3>
              <p className="text-gray-400 text-sm">Active learning systems</p>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {aiModels.map((model, index) => (
                <motion.div
                  key={model.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">{model.name}</h4>
                    <span className={`text-xs font-medium ${getStatusColor(model.status)}`}>
                      {model.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-xs mb-2">{model.description}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Accuracy: {model.accuracy}%</span>
                    <span className="text-gray-500">{model.lastUpdate}</span>
                  </div>
                  
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div
                        className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${model.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Command Center */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 h-[600px]">
            <CommandCenter aiMode={aiMode} />
          </div>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
            <p className="text-gray-400 text-sm">Intelligent suggestions based on current analysis</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">Auto-apply:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                    <h4 className="text-white font-medium">{rec.title}</h4>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                  
                  <div className="flex items-center space-x-6 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <span>Confidence:</span>
                      <span className="text-white font-medium">{rec.confidence}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Timeframe:</span>
                      <span className="text-white font-medium">{rec.timeframe}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Action:</span>
                      <span className="text-white font-medium">{rec.action}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors duration-200">
                    Accept
                  </button>
                  <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded text-xs transition-colors duration-200">
                    Dismiss
                  </button>
                </div>
              </div>
              
              {/* Confidence bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${rec.confidence}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* AI Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-800"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-white font-medium mb-3">Processing Load</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">CPU Usage:</span>
                <span className="text-white">{processingLoad}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${processingLoad}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Model Accuracy</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Average:</span>
                <span className="text-white">{predictionAccuracy}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                  style={{ width: `${predictionAccuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">System Health</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AICommandCenterPage;
