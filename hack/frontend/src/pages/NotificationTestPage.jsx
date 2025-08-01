import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Shield,
  Zap,
  Info,
  CheckCircle,
  Volume2,
  Play
} from "lucide-react";
import { toast } from "react-hot-toast";
import notificationService from "../services/notificationService";
import useNotificationStore from "../store/notificationStore";

const NotificationTestPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { sendEmergencyModal } = useNotificationStore();

  const testNotifications = [
    {
      id: 'emergency',
      title: '🚨 Emergency Alert',
      message: 'Critical emergency situation detected. Immediate response required from all available personnel.',
      type: 'emergency',
      severity: 'critical',
      icon: AlertTriangle,
      color: 'from-red-600 to-red-700'
    },
    {
      id: 'security',
      title: '🛡️ Security Breach',
      message: 'Unauthorized access detected in Zone A. Security team has been notified and is responding.',
      type: 'security',
      severity: 'high',
      icon: Shield,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'system',
      title: '⚡ System Alert',
      message: 'System maintenance will begin in 15 minutes. Please save your work and prepare for temporary downtime.',
      type: 'system',
      severity: 'medium',
      icon: Zap,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'info',
      title: 'ℹ️ Information',
      message: 'New safety protocols have been updated. Please review the latest guidelines in your dashboard.',
      type: 'info',
      severity: 'low',
      icon: Info,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'success',
      title: '✅ Task Complete',
      message: 'All security checks have been completed successfully. System is operating normally.',
      type: 'success',
      severity: 'low',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    }
  ];

  const handleTestNotification = async (notification) => {
    setIsLoading(true);
    try {
      await notificationService.sendModalNotification({
        type: notification.type,
        severity: notification.severity,
        title: notification.title,
        message: notification.message,
        actionUrl: '/dashboard',
        metadata: {
          testMode: true,
          triggeredBy: 'test_page'
        }
      });
      
      toast.success(`${notification.title} triggered!`);
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to trigger notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoreEmergencyTest = () => {
    sendEmergencyModal(
      '🚨 Store Emergency Test',
      'This is a test using the store emergency modal function. Audio should play continuously until acknowledged.'
    );
    toast.success('Store emergency modal triggered!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Bell className="h-10 w-10 mr-3 text-blue-400" />
            Notification Modal Test
          </h1>
          <p className="text-gray-300 text-lg">
            Test the notification modal system with different alert types and audio playback
          </p>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Volume2 className="h-5 w-5 mr-2 text-green-400" />
            How to Test
          </h2>
          <ul className="text-gray-300 space-y-2">
            <li>• Click any notification button below to trigger a modal with audio</li>
            <li>• The security alarm will play continuously until you acknowledge the alert</li>
            <li>• Use the volume control in the modal to adjust audio level</li>
            <li>• Press Escape key or click outside to close the modal</li>
            <li>• Audio will automatically stop when modal is closed</li>
          </ul>
        </motion.div>

        {/* Test Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testNotifications.map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <motion.button
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleTestNotification(notification)}
                disabled={isLoading}
                className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${notification.color} ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } transition-all duration-200 shadow-lg group`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-white/20 rounded-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {notification.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {notification.message.substring(0, 80)}...
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Play className="h-4 w-4 text-white/70" />
                    <span className="text-white/70 text-xs uppercase font-medium">
                      {notification.severity}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Store Emergency Test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            onClick={handleStoreEmergencyTest}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:scale-105 flex items-center space-x-3 mx-auto"
          >
            <AlertTriangle className="h-6 w-6" />
            <span>Test Store Emergency Modal</span>
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Tests the emergency modal function from the notification store
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12 text-gray-400 text-sm"
        >
          <p>Audio file: /audio/security-alarm-63578.mp3</p>
          <p>Modal notifications will appear over all content with continuous audio playback</p>
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationTestPage;
