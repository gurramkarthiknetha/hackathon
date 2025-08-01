import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socketService';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [responderLocations, setResponderLocations] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const listenersRef = useRef(new Map());
  const connectionAttemptedRef = useRef(false);
  const userIdRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Only connect if we haven't attempted for this user or if it's a different user
      const shouldConnect = !connectionAttemptedRef.current || userIdRef.current !== user.id;

      if (shouldConnect && !socketService.isSocketConnecting()) {
        connectionAttemptedRef.current = true;
        userIdRef.current = user.id;

        // Add a small delay to prevent rapid reconnections in development
        setTimeout(() => {
          socketService.connect(user);
          setIsConnected(socketService.isSocketConnected());
        }, 100);
      } else if (socketService.isSocketConnected()) {
        setIsConnected(true);
      }

      // Set up event listeners (always set up when authenticated)
      const handleNewIncident = (incident) => {
        setIncidents(prev => [incident, ...prev.slice(0, 49)]); // Keep last 50

        // Show notification for high priority incidents
        if (incident.severity === 'critical' || incident.severity === 'high') {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New ${incident.severity} incident`, {
              body: incident.description,
              icon: '/favicon.ico'
            });
          }
        }
      };

      const handleIncidentUpdated = (incident) => {
        setIncidents(prev =>
          prev.map(item => item.id === incident.id ? incident : item)
        );
      };

      const handleResponderLocationUpdate = (data) => {
        setResponderLocations(prev => {
          const existing = prev.find(r => r.userId === data.userId);
          if (existing) {
            return prev.map(r =>
              r.userId === data.userId
                ? { ...r, location: data.location, timestamp: data.timestamp }
                : r
            );
          } else {
            return [...prev, data];
          }
        });
      };

      const handleResponderStatusUpdate = (data) => {
        setResponderLocations(prev =>
          prev.map(r =>
            r.userId === data.userId
              ? { ...r, status: data.status, timestamp: data.timestamp }
              : r
          )
        );
      };

      const handleSystemAlert = (alert) => {
        setSystemAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10
      };

      // Message handlers
      const handleNewMessage = (data) => {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => (msg.id || msg._id) === (data.id || data._id));
          if (exists) {
            return prev;
          }
          return [data, ...prev.slice(0, 49)]; // Keep last 50 messages
        });

        // Update unread count if message is not from current user
        if (data.sender.id !== user.id) {
          setUnreadCount(prev => prev + 1);

          // Show browser notification for high priority messages
          if (data.priority === 'high' || data.priority === 'critical') {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${data.type === 'broadcast' ? 'Broadcast' : 'Team Message'} - ${data.priority.toUpperCase()}`, {
                body: `${data.sender.name}: ${data.content}`,
                icon: '/favicon.ico'
              });
            }
          }
        }
      };

      const handleMessageSent = (data) => {
        console.log('Message sent successfully:', data);
      };

      const handleMessageError = (data) => {
        console.error('Message error:', data.error);
      };

      const handleMessageRead = (data) => {
        // Update message read status if needed
        setMessages(prev => prev.map(msg =>
          (msg.id || msg._id) === data.messageId
            ? { ...msg, readBy: [...(msg.readBy || []), { user: data.readBy, readAt: data.readAt }] }
            : msg
        ));
      };

      // Register listeners
      socketService.on('newIncident', handleNewIncident);
      socketService.on('incidentUpdated', handleIncidentUpdated);
      socketService.on('responderLocationUpdate', handleResponderLocationUpdate);
      socketService.on('responderStatusUpdate', handleResponderStatusUpdate);
      socketService.on('systemAlert', handleSystemAlert);
      socketService.on('newMessage', handleNewMessage);
      socketService.on('messageSent', handleMessageSent);
      socketService.on('messageError', handleMessageError);
      socketService.on('messageRead', handleMessageRead);

      // Store listeners for cleanup
      listenersRef.current.set('newIncident', handleNewIncident);
      listenersRef.current.set('incidentUpdated', handleIncidentUpdated);
      listenersRef.current.set('responderLocationUpdate', handleResponderLocationUpdate);
      listenersRef.current.set('responderStatusUpdate', handleResponderStatusUpdate);
      listenersRef.current.set('systemAlert', handleSystemAlert);
      listenersRef.current.set('newMessage', handleNewMessage);
      listenersRef.current.set('messageSent', handleMessageSent);
      listenersRef.current.set('messageError', handleMessageError);
      listenersRef.current.set('messageRead', handleMessageRead);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => {
        // Clean up listeners
        listenersRef.current.forEach((callback, event) => {
          socketService.off(event, callback);
        });
        listenersRef.current.clear();
        connectionAttemptedRef.current = false;
        userIdRef.current = null;
      };
    } else if (!isAuthenticated) {
      // Reset connection attempt flag when not authenticated
      connectionAttemptedRef.current = false;
      userIdRef.current = null;

      // Disconnect if not authenticated
      socketService.disconnect();
      setIsConnected(false);
      setIncidents([]);
      setResponderLocations([]);
      setSystemAlerts([]);
      setMessages([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user]);

  // Update connection status less frequently and only when needed
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkConnection = () => {
      const currentConnectionState = socketService.isSocketConnected();
      if (currentConnectionState !== isConnected) {
        setIsConnected(currentConnectionState);
      }
    };

    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, user, isConnected]);

  const updateLocation = (location) => {
    socketService.updateLocation(location);
  };

  const updateStatus = (status) => {
    socketService.updateStatus(status);
  };

  const reportIncident = (incident) => {
    socketService.reportIncident(incident);
  };

  const updateIncident = (incident) => {
    socketService.updateIncident(incident);
  };

  const sendMessage = (message) => {
    socketService.sendMessage(message);
  };

  // Team communication methods
  const sendTeamMessage = (messageData) => {
    socketService.sendTeamMessage(messageData);
  };

  const broadcastMessage = (messageData) => {
    socketService.broadcastMessage(messageData);
  };

  const markMessageAsRead = (messageId) => {
    socketService.markMessageAsRead(messageId);
    // Also update local unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const clearSystemAlerts = () => {
    setSystemAlerts([]);
  };

  const removeIncident = (incidentId) => {
    setIncidents(prev => prev.filter(incident => incident.id !== incidentId));
  };

  return {
    isConnected,
    incidents,
    responderLocations,
    systemAlerts,
    messages,
    unreadCount,
    updateLocation,
    updateStatus,
    reportIncident,
    updateIncident,
    sendMessage,
    sendTeamMessage,
    broadcastMessage,
    markMessageAsRead,
    clearSystemAlerts,
    removeIncident,
    socketId: socketService.getSocketId()
  };
};

export default useSocket;
