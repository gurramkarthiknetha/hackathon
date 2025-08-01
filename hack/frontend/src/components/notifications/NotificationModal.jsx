import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  Pause,
  Play,
  AlertTriangle,
  Bell,
  Shield,
  Zap,
  Info,
  CheckCircle
} from 'lucide-react';
import useNotificationAudio from '../../hooks/useNotificationAudio';

const NotificationModal = ({
  isOpen,
  onClose,
  notification,
  autoPlayAudio = true
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audio = useNotificationAudio();

  // Auto-play audio when modal opens
  useEffect(() => {
    if (isOpen && notification && autoPlayAudio) {
      console.log('Modal opened, attempting to play audio for notification:', notification.title);
      const playAudio = async () => {
        const success = await audio.play();
        console.log('Audio play result:', success);
        setIsAudioPlaying(success);
        if (!success) {
          setAudioBlocked(true);
        }
      };
      playAudio();
    }

    return () => {
      if (isOpen) {
        console.log('Modal closing, stopping audio');
        audio.stop();
        setIsAudioPlaying(false);
        setAudioBlocked(false);
      }
    };
  }, [isOpen, notification, autoPlayAudio, audio]);

  // Handle modal close
  const handleClose = () => {
    audio.stop();
    setIsAudioPlaying(false);
    onClose();
  };

  // Toggle audio playback
  const toggleAudio = async () => {
    if (isAudioPlaying) {
      audio.stop();
      setIsAudioPlaying(false);
    } else {
      const success = await audio.play();
      setIsAudioPlaying(success);
      if (success) {
        setAudioBlocked(false);
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    audio.setVolume(newVolume);
  };

  // Get notification icon based on type/severity
  const getNotificationIcon = () => {
    if (!notification) return Bell;
    
    switch (notification.severity) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Shield;
      case 'low':
        return Info;
      default:
        switch (notification.type) {
          case 'emergency':
            return AlertTriangle;
          case 'system':
            return Zap;
          case 'success':
            return CheckCircle;
          default:
            return Bell;
        }
    }
  };

  // Get severity-based styling
  const getSeverityStyles = () => {
    if (!notification) return 'from-blue-500 to-blue-600';
    
    switch (notification.severity) {
      case 'critical':
        return 'from-red-600 to-red-700';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'medium':
        return 'from-yellow-500 to-yellow-600';
      case 'low':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const IconComponent = getNotificationIcon();

  if (!notification) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${getSeverityStyles()} p-6 text-white relative`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {notification.title || 'Notification'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {notification.severity?.toUpperCase()} ALERT
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {notification.message || notification.description}
              </p>

              {/* Audio Controls */}
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-300">
                    Alert Sound
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleAudio}
                      className={`p-2 rounded-lg transition-colors ${
                        isAudioPlaying 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isAudioPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center space-x-3">
                  <VolumeX className="h-4 w-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                  <Volume2 className="h-4 w-4 text-gray-400" />
                </div>

                {/* Audio blocked warning */}
                {audioBlocked && (
                  <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                    <p className="text-yellow-300 text-xs text-center">
                      🔇 Audio blocked by browser. Click the play button to enable sound.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  Acknowledge
                </button>
                {notification.actionUrl && (
                  <button
                    onClick={() => {
                      window.location.href = notification.actionUrl;
                      handleClose();
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-700/30 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
                {notification.timestamp ? 
                  `Received: ${new Date(notification.timestamp).toLocaleString()}` :
                  'Just now'
                }
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;
