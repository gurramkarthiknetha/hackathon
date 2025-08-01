import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Users,
  AlertTriangle,
  Phone,
  MessageSquare,
  Settings,
  Send,
  Bell,
  Megaphone,
  Shield,
  Zap,
  X,
  Check,
  Clock,
  Target
} from "lucide-react";
import { toast } from "react-hot-toast";
import useNotificationStore from "../../store/notificationStore";
import notificationService from "../../services/notificationService";

const AdminQuickActions = () => {
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    type: 'general',
    title: '',
    message: '',
    severity: 'medium',
    recipients: 'all',
    sendEmail: true,
    sendInApp: true
  });
  const [sending, setSending] = useState(false);
  const [sendingEmergency, setSendingEmergency] = useState(false);
  
  const { addNotification, addEmailNotification } = useNotificationStore();

  const quickActions = [
    {
      id: 'send_notification',
      title: 'Send Notification',
      description: 'Send alerts to users',
      icon: Mail,
      color: 'from-blue-500 to-blue-600',
      action: () => setShowSendNotificationModal(true)
    },
    {
      id: 'bulk_actions',
      title: 'Bulk Actions',
      description: 'Manage multiple users',
      icon: Users,
      color: 'from-green-500 to-green-600',
      action: () => toast.success('Bulk actions panel opened!')
    },
    {
      id: 'role_management',
      title: 'Role Management',
      description: 'Assign user roles',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      action: () => toast.success('Role management opened!')
    },
    {
      id: 'emergency_contact',
      title: 'Emergency Contact',
      description: sendingEmergency ? 'Sending...' : 'Contact all responders',
      icon: sendingEmergency ? Clock : Phone,
      color: 'from-red-500 to-red-600',
      action: () => handleEmergencyContact(),
      disabled: sendingEmergency
    }
  ];

  const handleEmergencyContact = async () => {
    // Prevent multiple submissions
    if (sendingEmergency) {
      return;
    }

    setSendingEmergency(true);

    try {
      // Send emergency alert via service
      await notificationService.sendEmergencyAlert({
        message: 'Emergency contact initiated by admin. All responders please check in immediately.',
        metadata: {
          initiatedBy: 'admin_dashboard',
          contactType: 'emergency_checkin'
        }
      });

      // Add to local store for immediate UI feedback
      const emergencyNotification = {
        type: 'emergency',
        title: '🚨 Emergency Alert',
        message: 'Emergency contact initiated by admin. All responders please check in immediately.',
        severity: 'critical',
        icon: AlertTriangle
      };

      addNotification(emergencyNotification);
      addEmailNotification({
        ...emergencyNotification,
        title: 'Emergency Contact - All Responders'
      });

      toast.success('Emergency contact sent to all responders!');
    } catch (error) {
      console.error('Emergency contact error:', error);
      toast.error('Failed to send emergency contact');
    } finally {
      setSendingEmergency(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Prevent multiple submissions
    if (sending) {
      return;
    }

    setSending(true);

    try {
      // Send notification via service
      const result = await notificationService.sendNotification(notificationForm);

      const notification = {
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        severity: notificationForm.severity,
        icon: getNotificationIcon(notificationForm.type)
      };

      // Add to local store for immediate UI feedback
      if (notificationForm.sendInApp) {
        addNotification(notification);
      }

      if (notificationForm.sendEmail) {
        addEmailNotification({
          ...notification,
          title: `📧 ${notification.title}`
        });
      }

      toast.success(`Notification sent to ${notificationForm.recipients}! (${result.delivered || 0} delivered)`);
      setShowSendNotificationModal(false);
      setNotificationForm({
        type: 'general',
        title: '',
        message: '',
        severity: 'medium',
        recipients: 'all',
        sendEmail: true,
        sendInApp: true
      });
    } catch (error) {
      console.error('Notification send error:', error);
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'system': return Settings;
      case 'announcement': return Megaphone;
      case 'maintenance': return Zap;
      default: return Bell;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <>
      <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-blue-400" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={action.action}
              disabled={action.disabled}
              className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${action.color} ${
                action.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
              } transition-all duration-200 shadow-lg group`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{action.title}</h4>
                  <p className="text-white/80 text-xs mt-1">{action.description}</p>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Send Notification Modal */}
      <AnimatePresence>
        {showSendNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSendNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-400" />
                  Send Notification
                </h3>
                <button
                  onClick={() => setShowSendNotificationModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="emergency">Emergency</option>
                    <option value="system">System</option>
                    <option value="announcement">Announcement</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter notification title"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter notification message"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Severity
                  </label>
                  <select
                    value={notificationForm.severity}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipients
                  </label>
                  <select
                    value={notificationForm.recipients}
                    onChange={(e) => setNotificationForm(prev => ({ ...prev, recipients: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="admins">Admins Only</option>
                    <option value="operators">Operators Only</option>
                    <option value="responders">Responders Only</option>
                  </select>
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Delivery Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationForm.sendInApp}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, sendInApp: e.target.checked }))}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300 text-sm">Send in-app notification</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationForm.sendEmail}
                        onChange={(e) => setNotificationForm(prev => ({ ...prev, sendEmail: e.target.checked }))}
                        className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300 text-sm">Send email notification</span>
                    </label>
                  </div>
                </div>

                {/* Preview */}
                <div className={`p-3 rounded-lg border ${getSeverityColor(notificationForm.severity)}`}>
                  <p className="text-xs text-gray-400 mb-1">Preview:</p>
                  <p className="text-white font-medium text-sm">
                    {notificationForm.title || 'Notification Title'}
                  </p>
                  <p className="text-gray-300 text-xs mt-1">
                    {notificationForm.message || 'Notification message will appear here...'}
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowSendNotificationModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !notificationForm.title || !notificationForm.message}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {sending ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Notification</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminQuickActions;
