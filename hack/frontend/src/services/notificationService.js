import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request deduplication to prevent multiple identical calls
    this.pendingRequests = new Map();

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Generate a unique key for request deduplication
  generateRequestKey(method, url, data) {
    return `${method}:${url}:${JSON.stringify(data)}`;
  }

  // Deduplicated request wrapper
  async makeRequest(method, url, data = null) {
    const requestKey = this.generateRequestKey(method, url, data);

    // If the same request is already pending, return the existing promise
    if (this.pendingRequests.has(requestKey)) {
      console.log('Deduplicating request:', requestKey);
      return this.pendingRequests.get(requestKey);
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        let response;
        if (method === 'GET') {
          response = await this.api.get(url);
        } else if (method === 'POST') {
          response = await this.api.post(url, data);
        } else if (method === 'PUT') {
          response = await this.api.put(url, data);
        } else if (method === 'DELETE') {
          response = await this.api.delete(url);
        }
        return response;
      } finally {
        // Remove from pending requests when done
        this.pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise
    this.pendingRequests.set(requestKey, requestPromise);

    return requestPromise;
  }

  // Send notification to users
  async sendNotification(notificationData) {
    try {
      const requestData = {
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        severity: notificationData.severity,
        recipients: notificationData.recipients,
        sendEmail: notificationData.sendEmail,
        sendInApp: notificationData.sendInApp,
        metadata: {
          sentBy: 'admin',
          timestamp: new Date().toISOString(),
          ...notificationData.metadata
        }
      };

      const response = await this.makeRequest('POST', '/notifications/send', requestData);
      return response.data;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to send notification');
    }
  }

  // Send bulk notification
  async sendBulkNotification(notifications) {
    try {
      const response = await this.api.post('/notifications/bulk', {
        notifications: notifications.map(notification => ({
          ...notification,
          metadata: {
            sentBy: 'admin',
            timestamp: new Date().toISOString(),
            ...notification.metadata
          }
        }))
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to send bulk notifications:', error);
      throw new Error(error.response?.data?.message || 'Failed to send bulk notifications');
    }
  }

  // Send emergency alert
  async sendEmergencyAlert(alertData) {
    try {
      const requestData = {
        title: alertData.title || '🚨 Emergency Alert',
        message: alertData.message,
        severity: 'critical',
        recipients: 'all',
        sendEmail: true,
        sendInApp: true,
        sendSMS: true, // Emergency alerts should use all channels
        metadata: {
          sentBy: 'admin',
          alertType: 'emergency',
          timestamp: new Date().toISOString(),
          ...alertData.metadata
        }
      };

      const response = await this.makeRequest('POST', '/notifications/emergency', requestData);
      return response.data;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      throw new Error(error.response?.data?.message || 'Failed to send emergency alert');
    }
  }

  // Send modal notification with audio alert
  async sendModalNotification(notificationData) {
    try {
      console.log('Sending modal notification:', notificationData);
      // Import the store dynamically to avoid circular dependencies
      const { default: useNotificationStore } = await import('../store/notificationStore');
      const store = useNotificationStore.getState();

      const modalNotification = {
        type: notificationData.type || 'alert',
        severity: notificationData.severity || 'high',
        title: notificationData.title || 'Alert',
        message: notificationData.message,
        timestamp: new Date(),
        actionUrl: notificationData.actionUrl,
        metadata: {
          sentBy: 'system',
          withAudio: true,
          ...notificationData.metadata
        }
      };

      console.log('Showing modal notification:', modalNotification);
      // Show the modal notification
      store.showModalNotification(modalNotification);

      // Also send to backend if needed
      if (notificationData.sendToBackend !== false) {
        const requestData = {
          ...modalNotification,
          sendInApp: true,
          sendModal: true
        };

        try {
          await this.makeRequest('POST', '/notifications/send', requestData);
        } catch (error) {
          console.warn('Failed to send modal notification to backend:', error);
          // Don't throw error here as the modal is already shown
        }
      }

      return { success: true, notification: modalNotification };
    } catch (error) {
      console.error('Failed to send modal notification:', error);
      throw new Error('Failed to send modal notification');
    }
  }

  // Send emergency modal alert (high priority with audio)
  async sendEmergencyModal(title, message, options = {}) {
    return this.sendModalNotification({
      type: 'emergency',
      severity: 'critical',
      title: title || '🚨 Emergency Alert',
      message,
      ...options
    });
  }

  // Get notification history
  async getNotificationHistory(filters = {}) {
    try {
      const response = await this.api.get('/notifications/history', {
        params: {
          page: filters.page || 1,
          limit: filters.limit || 50,
          type: filters.type,
          severity: filters.severity,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          sentBy: filters.sentBy
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notification history');
    }
  }

  // Get notification templates
  async getNotificationTemplates() {
    try {
      const response = await this.api.get('/notifications/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification templates:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notification templates');
    }
  }

  // Create notification template
  async createNotificationTemplate(templateData) {
    try {
      const response = await this.api.post('/notifications/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification template:', error);
      throw new Error(error.response?.data?.message || 'Failed to create notification template');
    }
  }

  // Get notification statistics
  async getNotificationStats(timeRange = '7d') {
    try {
      const response = await this.api.get('/notifications/stats', {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch notification stats');
    }
  }

  // Get user notification preferences
  async getUserNotificationPreferences(userId) {
    try {
      const response = await this.api.get(`/users/${userId}/notification-preferences`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user notification preferences:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user notification preferences');
    }
  }

  // Update user notification preferences
  async updateUserNotificationPreferences(userId, preferences) {
    try {
      const response = await this.api.put(`/users/${userId}/notification-preferences`, preferences);
      return response.data;
    } catch (error) {
      console.error('Failed to update user notification preferences:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user notification preferences');
    }
  }

  // Test notification delivery
  async testNotification(testData) {
    try {
      const response = await this.api.post('/notifications/test', {
        type: testData.type || 'test',
        title: testData.title || 'Test Notification',
        message: testData.message || 'This is a test notification from the admin panel.',
        recipients: testData.recipients || 'admins',
        sendEmail: testData.sendEmail || false,
        sendInApp: testData.sendInApp || true
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to send test notification');
    }
  }

  // Schedule notification
  async scheduleNotification(notificationData, scheduleTime) {
    try {
      const response = await this.api.post('/notifications/schedule', {
        ...notificationData,
        scheduleTime: scheduleTime,
        metadata: {
          sentBy: 'admin',
          scheduled: true,
          ...notificationData.metadata
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to schedule notification');
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      const response = await this.api.delete(`/notifications/scheduled/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel scheduled notification:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel scheduled notification');
    }
  }

  // Get delivery status
  async getDeliveryStatus(notificationId) {
    try {
      const response = await this.api.get(`/notifications/${notificationId}/delivery-status`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch delivery status:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch delivery status');
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;

// Export the class for testing or custom instances
export { NotificationService };

// Utility functions for notification formatting
export const formatNotificationForDisplay = (notification) => {
  return {
    ...notification,
    formattedTime: new Date(notification.timestamp).toLocaleString(),
    severityColor: getSeverityColor(notification.severity),
    typeIcon: getNotificationTypeIcon(notification.type)
  };
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
    case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
    case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
    case 'low': return 'text-green-400 bg-green-500/10 border-green-500';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500';
  }
};

export const getNotificationTypeIcon = (type) => {
  const iconMap = {
    emergency: '🚨',
    system: '⚙️',
    announcement: '📢',
    maintenance: '🔧',
    general: '📝',
    test: '🧪'
  };
  return iconMap[type] || '📝';
};

// Predefined notification templates
export const NOTIFICATION_TEMPLATES = {
  systemMaintenance: {
    type: 'maintenance',
    title: 'Scheduled System Maintenance',
    message: 'The system will undergo scheduled maintenance from {startTime} to {endTime}. Some features may be temporarily unavailable.',
    severity: 'medium'
  },
  emergencyAlert: {
    type: 'emergency',
    title: 'Emergency Alert',
    message: 'Emergency situation detected. All personnel please follow emergency protocols.',
    severity: 'critical'
  },
  systemUpdate: {
    type: 'system',
    title: 'System Update Available',
    message: 'A new system update is available. Please update your application at your earliest convenience.',
    severity: 'low'
  },
  welcomeMessage: {
    type: 'general',
    title: 'Welcome to the System',
    message: 'Welcome! Your account has been successfully created. Please complete your profile setup.',
    severity: 'low'
  }
};
