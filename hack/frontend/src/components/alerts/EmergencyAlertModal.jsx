import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  MapPin,
  Clock,
  Camera,
  Activity
} from 'lucide-react';

const EmergencyAlertModal = ({ alert, isOpen, onClose, onAcknowledge }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    if (alert?.metadata?.audioFile) {
      audioRef.current = new Audio(alert.metadata.audioFile);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.8;
      
      audioRef.current.addEventListener('play', () => setIsAudioPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsAudioPlaying(false));
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        setIsAudioPlaying(false);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [alert]);

  // Auto-play audio when modal opens
  useEffect(() => {
    if (isOpen && alert && !audioMuted && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current.play();
          setIsAudioPlaying(true);
        } catch (error) {
          console.error('Failed to auto-play alert audio:', error);
          // Browser might block autoplay, user will need to manually enable
        }
      };
      playAudio();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    };
  }, [isOpen, alert, audioMuted]);

  // Timer for elapsed time
  useEffect(() => {
    if (isOpen && alert) {
      const startTime = new Date(alert.timestamp).getTime();
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, alert]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setAudioMuted(true);
      } else {
        audioRef.current.play().catch(console.error);
        setAudioMuted(false);
      }
    }
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsAudioPlaying(false);
    setTimeElapsed(0);
    onClose();
  };

  const handleAcknowledge = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsAudioPlaying(false);
    if (onAcknowledge) {
      onAcknowledge(alert);
    }
    handleClose();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'fire':
        return '🔥';
      case 'smoke':
        return '💨';
      case 'stampede':
        return '👥';
      case 'fallen':
        return '🚑';
      case 'medical emergency':
        return '🏥';
      case 'running':
        return '🏃';
      default:
        return '⚠️';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 border-red-500';
      case 'high':
        return 'bg-orange-600 border-orange-500';
      case 'medium':
        return 'bg-yellow-600 border-yellow-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  if (!alert) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-4 ${getSeverityColor(alert.severity)} overflow-hidden`}>
              {/* Header */}
              <div className={`${getSeverityColor(alert.severity)} text-white p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl animate-pulse">
                      {getEventIcon(alert.metadata?.eventType)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{alert.title}</h2>
                      <div className="flex items-center space-x-2 text-sm opacity-90">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(timeElapsed)} elapsed</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleAudio}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      title={isAudioPlaying ? 'Mute Alert' : 'Unmute Alert'}
                    >
                      {isAudioPlaying ? (
                        <Volume2 className="w-5 h-5" />
                      ) : (
                        <VolumeX className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-gray-800 dark:text-gray-200">
                  <p className="text-base leading-relaxed">{alert.message}</p>
                </div>

                {/* Alert Details */}
                <div className="space-y-3 text-sm">
                  {alert.metadata?.confidence && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {Math.round(alert.metadata.confidence * 100)}%
                      </span>
                    </div>
                  )}

                  {alert.metadata?.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {alert.metadata.location}
                      </span>
                    </div>
                  )}

                  {alert.metadata?.camera_id && (
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Camera {alert.metadata.camera_id}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleAcknowledge}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    Acknowledge Alert
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyAlertModal;
