import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, AlertTriangle } from "lucide-react";

const AccuracyLevels = ({ selectedCamera }) => {
  const [detectionScores, setDetectionScores] = useState({
    person: 0,
    stampede: 0,
    medical_emergency: 0,
    fire: 0,
    smoke: 0,
    running: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (selectedCamera) {
      fetchAccuracyLevels();
      // Set up polling for real-time updates
      const interval = setInterval(fetchAccuracyLevels, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedCamera]);

  const fetchAccuracyLevels = async () => {
    if (!selectedCamera) return;
    
    setIsLoading(true);
    try {
      // Map frontend camera ID to backend expected format
      let backendCameraId = selectedCamera;
      if (selectedCamera.includes('FaceTime')) {
        backendCameraId = 'system_camera';
      } else if (selectedCamera.includes('IPhone') || selectedCamera.includes('iPhone')) {
        backendCameraId = 'iphone_camera';
      } else if (selectedCamera.startsWith('system_')) {
        // Use the system hash directly
        backendCameraId = selectedCamera;
      }
      
      console.log(`🎯 Fetching accuracy for frontend camera: ${selectedCamera} -> backend: ${backendCameraId}`);
      
      const response = await fetch(`${API_URL}/cameras/${backendCameraId}/detection-scores`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setDetectionScores(data.scores);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching detection scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-600';
  };

  const getConfidenceTextColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const detectionTypes = [
    { key: 'person', label: 'Person', icon: '👤' },
    { key: 'stampede', label: 'Stampede', icon: '🏃‍♂️' },
    { key: 'medical_emergency', label: 'Medical Emergency', icon: '🚑' },
    { key: 'fire', label: 'Fire', icon: '🔥' },
    { key: 'smoke', label: 'Smoke', icon: '💨' },
    { key: 'running', label: 'Running', icon: '🏃' },
    { key: 'fallen', label: 'Fallen', icon: '🤕' },
    { key: 'me', label: 'Me', icon: '🙋' },
    { key: 'violence', label: 'Violence', icon: '⚔️' },
    { key: 'crowd_density', label: 'Crowd Density', icon: '👥' },
    { key: 'weapon', label: 'Weapon', icon: '🔫' },
    { key: 'suspicious_activity', label: 'Suspicious Activity', icon: '🕵️' }
  ];

  if (!selectedCamera) {
    return (
      <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800 p-6">
        <div className="text-center">
          <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Accuracy Levels</h3>
          <p className="text-gray-400">Select a camera to view detection scores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Accuracy Levels</h3>
              <p className="text-gray-400 text-sm">Detection scores</p>
            </div>
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {detectionTypes.map((type, index) => {
          const score = Math.round(detectionScores[type.key] || 0);
          
          return (
            <motion.div
              key={type.key}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-white font-medium">{type.label}</span>
                </div>
                <span className={`text-lg font-bold ${getConfidenceTextColor(score)}`}>
                  {score}%
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${getConfidenceColor(score)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}

        {isLoading && (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 text-gray-400">
              <TrendingUp className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Updating detection scores...</span>
            </div>
          </div>
        )}

        {Object.values(detectionScores).every(score => score === 0) && !isLoading && (
          <div className="text-center py-6">
            <AlertTriangle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No detection data available</p>
            <p className="text-gray-500 text-xs">Start camera monitoring to see accuracy levels</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccuracyLevels;
