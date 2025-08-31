import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Eye, AlertTriangle, Wifi, WifiOff } from "lucide-react";

const IPWebcamTest = () => {
  const [streamError, setStreamError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setStreamError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setStreamError('Failed to load IP Webcam stream. Please check if IP Webcam is running on http://10.100.15.86:8080/video');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-800"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">IP Webcam Direct Stream Test</h3>
                  <p className="text-gray-400 text-sm">Testing direct connection to http://10.100.15.86:8080/video</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-purple-400 text-xs font-medium">DIRECT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div className="relative bg-gray-900 h-96 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Loading IP Webcam stream...</p>
                </div>
              </div>
            )}

            {streamError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 mb-2">Stream Error</p>
                  <p className="text-gray-400 text-sm">{streamError}</p>
                  <button
                    onClick={() => {
                      setStreamError(null);
                      setIsLoading(true);
                      // Force reload by changing the src
                      const img = document.getElementById('test-stream');
                      if (img) {
                        img.src = img.src;
                      }
                    }}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                <img
                  id="test-stream"
                  src="http://10.100.15.86:8080/video"
                  alt="IP Webcam Direct Stream"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />

                {/* Stream Status Indicator */}
                <div className="absolute top-4 left-4 bg-purple-500/20 px-2 py-1 rounded">
                  <span className="text-purple-400 text-xs font-medium">DIRECT STREAM</span>
                </div>

                {/* Connection Status */}
                <div className="absolute top-4 right-4">
                  {!streamError ? (
                    <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded">
                      <Wifi className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-xs">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded">
                      <WifiOff className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-xs">Disconnected</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Info Panel */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-medium mb-2">Stream Information</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">URL: <span className="text-purple-400">http://10.100.15.86:8080/video</span></p>
                  <p className="text-gray-400">Type: <span className="text-purple-400">MJPEG Stream</span></p>
                  <p className="text-gray-400">Mode: <span className="text-purple-400">Direct (No AI Processing)</span></p>
                </div>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Instructions</h4>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>1. Make sure IP Webcam app is running on your phone</p>
                  <p>2. Ensure your phone is connected to the same network</p>
                  <p>3. The IP address should be accessible from this device</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IPWebcamTest;
