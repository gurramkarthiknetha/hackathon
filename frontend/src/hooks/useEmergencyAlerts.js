import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './useSocket';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing emergency alerts with audio notifications
 */
const useEmergencyAlerts = () => {
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { socket, isConnected } = useSocket();
  const alertQueueRef = useRef([]);
  const processingRef = useRef(false);

  // Request notification permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
      }
    };

    requestPermission();
  }, []);

  // Process alert queue
  const processAlertQueue = useCallback(() => {
    if (processingRef.current || alertQueueRef.current.length === 0) {
      return;
    }

    processingRef.current = true;
    const nextAlert = alertQueueRef.current.shift();
    
    setCurrentAlert(nextAlert);
    setIsAlertModalOpen(true);
    
    // Add to history
    setAlertHistory(prev => [nextAlert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    
    processingRef.current = false;
  }, []);

  // Handle emergency alert from socket
  const handleEmergencyAlert = useCallback((alertData) => {
    console.log('Emergency alert received:', alertData);
    
    // Add to queue
    alertQueueRef.current.push({
      ...alertData,
      id: alertData.id || Date.now(),
      receivedAt: new Date()
    });

    // Show browser notification if permission granted
    if (hasPermission && 'Notification' in window) {
      const notification = new Notification(alertData.title, {
        body: alertData.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `emergency-${alertData.metadata?.eventType}`,
        requireInteraction: true,
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close after 10 seconds
      setTimeout(() => {
        notification.close();
      }, 10000);
    }

    // Show toast notification as backup
    toast.error(alertData.title, {
      duration: 8000,
      position: 'top-center',
      style: {
        background: '#dc2626',
        color: 'white',
        fontWeight: 'bold'
      }
    });

    // Process the queue
    if (!processingRef.current) {
      setTimeout(processAlertQueue, 100);
    }
  }, [hasPermission, processAlertQueue]);

  // Handle push notification from socket
  const handlePushNotification = useCallback((notificationData) => {
    console.log('Push notification received:', notificationData);
    
    if (notificationData.requiresAudio) {
      handleEmergencyAlert(notificationData);
    }
  }, [handleEmergencyAlert]);

  // Set up socket listeners
  useEffect(() => {
    if (socket && isConnected) {
      socket.on('emergency-alert', handleEmergencyAlert);
      socket.on('push-notification', handlePushNotification);

      return () => {
        socket.off('emergency-alert', handleEmergencyAlert);
        socket.off('push-notification', handlePushNotification);
      };
    }
  }, [socket, isConnected, handleEmergencyAlert, handlePushNotification]);

  // Close alert modal
  const closeAlert = useCallback(() => {
    setIsAlertModalOpen(false);
    setCurrentAlert(null);
    
    // Process next alert in queue after a short delay
    setTimeout(() => {
      if (alertQueueRef.current.length > 0) {
        processAlertQueue();
      }
    }, 500);
  }, [processAlertQueue]);

  // Acknowledge alert
  const acknowledgeAlert = useCallback((alert) => {
    console.log('Alert acknowledged:', alert.id);
    
    // Mark as acknowledged in history
    setAlertHistory(prev => 
      prev.map(a => 
        a.id === alert.id 
          ? { ...a, acknowledgedAt: new Date(), acknowledged: true }
          : a
      )
    );

    // Close current alert
    closeAlert();

    // You could also send acknowledgment to server here
    if (socket && isConnected) {
      socket.emit('alert-acknowledged', {
        alertId: alert.id,
        acknowledgedAt: new Date(),
        userId: alert.userId
      });
    }
  }, [socket, isConnected, closeAlert]);

  // Clear alert history
  const clearAlertHistory = useCallback(() => {
    setAlertHistory([]);
  }, []);

  // Get unacknowledged alerts count
  const getUnacknowledgedCount = useCallback(() => {
    return alertHistory.filter(alert => !alert.acknowledged).length;
  }, [alertHistory]);

  // Test emergency alert (for development)
  const testEmergencyAlert = useCallback(() => {
    const testAlert = {
      id: `test-${Date.now()}`,
      type: 'emergency_detection',
      title: '🚨 Test Emergency Alert',
      message: 'This is a test emergency alert with audio notification.',
      severity: 'critical',
      timestamp: new Date(),
      metadata: {
        eventType: 'fire',
        confidence: 0.85,
        camera_id: 'test-camera',
        location: 'Test Location',
        requiresAudio: true,
        audioFile: '/audio/security-alarm-63578.mp3'
      },
      sender: {
        name: 'Test System',
        role: 'system'
      }
    };

    handleEmergencyAlert(testAlert);
  }, [handleEmergencyAlert]);

  return {
    // State
    currentAlert,
    alertHistory,
    isAlertModalOpen,
    hasPermission,
    
    // Actions
    closeAlert,
    acknowledgeAlert,
    clearAlertHistory,
    testEmergencyAlert,
    
    // Computed
    unacknowledgedCount: getUnacknowledgedCount(),
    hasActiveAlert: !!currentAlert,
    alertQueueLength: alertQueueRef.current.length
  };
};

export default useEmergencyAlerts;
