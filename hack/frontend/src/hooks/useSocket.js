import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import socketService from '../services/socketService';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [responderLocations, setResponderLocations] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const listenersRef = useRef(new Map());

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      socketService.connect(user);
      setIsConnected(socketService.isSocketConnected());

      // Set up event listeners
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

      // Register listeners
      socketService.on('newIncident', handleNewIncident);
      socketService.on('incidentUpdated', handleIncidentUpdated);
      socketService.on('responderLocationUpdate', handleResponderLocationUpdate);
      socketService.on('responderStatusUpdate', handleResponderStatusUpdate);
      socketService.on('systemAlert', handleSystemAlert);

      // Store listeners for cleanup
      listenersRef.current.set('newIncident', handleNewIncident);
      listenersRef.current.set('incidentUpdated', handleIncidentUpdated);
      listenersRef.current.set('responderLocationUpdate', handleResponderLocationUpdate);
      listenersRef.current.set('responderStatusUpdate', handleResponderStatusUpdate);
      listenersRef.current.set('systemAlert', handleSystemAlert);

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
      };
    } else {
      // Disconnect if not authenticated
      socketService.disconnect();
      setIsConnected(false);
      setIncidents([]);
      setResponderLocations([]);
      setSystemAlerts([]);
    }
  }, [isAuthenticated, user]);

  // Update connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(socketService.isSocketConnected());
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

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
    updateLocation,
    updateStatus,
    reportIncident,
    updateIncident,
    sendMessage,
    clearSystemAlerts,
    removeIncident,
    socketId: socketService.getSocketId()
  };
};

export default useSocket;
