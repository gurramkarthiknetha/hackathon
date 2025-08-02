import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square, 
  Zap, 
  AlertTriangle, 
  Activity,
  Flame,
  Users,
  Heart,
  Eye,
  Wind
} from 'lucide-react';

const ActivityTestPanel = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const connectToService = async () => {
    try {
      if (window.testActivityDetection) {
        await window.testActivityDetection.connect();
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const disconnect = () => {
    if (window.testActivityDetection) {
      window.testActivityDetection.disconnect();
      setIsConnected(false);
      setIsRunning(false);
    }
  };

  const runTestSequence = () => {
    if (window.testActivityDetection && isConnected) {
      window.testActivityDetection.runSequence();
      setIsRunning(true);
      
      // Auto-stop after sequence completes (approximately 20 seconds)
      setTimeout(() => setIsRunning(false), 22000);
    }
  };

  const stopTestSequence = () => {
    if (window.testActivityDetection) {
      window.testActivityDetection.stopSequence();
      setIsRunning(false);
    }
  };

  const testScenarios = [
    {
      name: 'Fallen Person',
      icon: AlertTriangle,
      color: 'bg-yellow-600 hover:bg-yellow-700',
      action: () => window.testActivityDetection?.fallen()
    },
    {
      name: 'Fire Emergency',
      icon: Flame,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => window.testActivityDetection?.fire()
    },
    {
      name: 'Medical Emergency',
      icon: Heart,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => window.testActivityDetection?.medical()
    },
    {
      name: 'Stampede',
      icon: Users,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => window.testActivityDetection?.stampede()
    },
    {
      name: 'Normal State',
      icon: Eye,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => window.testActivityDetection?.normal()
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-xl z-50"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="h-5 w-5 text-cyan-400" />
        <h3 className="text-white font-semibold">Activity Detection Tester</h3>
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      </div>

      {/* Connection Controls */}
      <div className="flex space-x-2 mb-3">
        {!isConnected ? (
          <button
            onClick={connectToService}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
          >
            Connect
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Test Sequence Controls */}
      {isConnected && (
        <>
          <div className="flex space-x-2 mb-3">
            {!isRunning ? (
              <button
                onClick={runTestSequence}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                <Play className="h-3 w-3" />
                <span>Run Sequence</span>
              </button>
            ) : (
              <button
                onClick={stopTestSequence}
                className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
              >
                <Square className="h-3 w-3" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {/* Individual Test Buttons */}
          <div className="space-y-1">
            <p className="text-gray-400 text-xs mb-2">Quick Tests:</p>
            {testScenarios.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <button
                  key={scenario.name}
                  onClick={scenario.action}
                  disabled={isRunning}
                  className={`w-full flex items-center space-x-2 px-2 py-1 ${scenario.color} text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <IconComponent className="h-3 w-3" />
                  <span>{scenario.name}</span>
                </button>
              );
            })}
          </div>

          {/* Status */}
          {isRunning && (
            <div className="mt-3 p-2 bg-blue-900/30 border border-blue-500/50 rounded">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-xs">Running test sequence...</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <p className="text-gray-400 text-xs">
          {!isConnected 
            ? "Connect to test advanced activity detection features"
            : "Use buttons above to simulate different emergency scenarios"
          }
        </p>
      </div>
    </motion.div>
  );
};

export default ActivityTestPanel;
