import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.isConnecting = false;
    this.currentUser = null;
    this.connectionTimeout = null;
  }

  connect(user) {
    // Prevent multiple connections or connection attempts
    if (this.isConnecting) {
      console.log('Connection already in progress, skipping...');
      return this.socket;
    }

    // Check if we're already connected with the same user
    if (this.currentUser && this.currentUser.id === user.id && this.socket && this.socket.connected) {
      console.log('Already connected with the same user, skipping...');
      return this.socket;
    }

    // If socket exists and is connected but different user, disconnect first
    if (this.socket && this.socket.connected && this.currentUser && this.currentUser.id !== user.id) {
      console.log('Switching user, disconnecting current connection...');
      this.disconnect();
    }

    this.isConnecting = true;
    this.currentUser = user;

    // Clear any existing connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    // Clean up existing socket if any
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    // Remove /api from the URL for socket connection
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiUrl.replace('/api', '');

    this.socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 3,
      timeout: 10000,
      forceNew: false
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.isConnected = true;
      this.isConnecting = false;

      // Join appropriate rooms based on user role
      this.socket.emit('join-room', {
        userId: user.id,
        role: user.role,
        zone: user.assignedZone
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      this.isConnecting = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.isConnecting = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.isConnecting = false;
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server');
      this.isConnected = false;
      this.isConnecting = false;
    });

    // Set up event listeners
    this.setupEventListeners();

    // Set a timeout to reset connecting state if connection takes too long
    this.connectionTimeout = setTimeout(() => {
      if (this.isConnecting) {
        console.warn('Connection timeout, resetting connecting state');
        this.isConnecting = false;
      }
    }, 15000);

    return this.socket;
  }

  disconnect() {
    // Clear connection timeout
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.currentUser = null;
    this.listeners.clear();
  }

  setupEventListeners() {
    // Incident-related events
    this.socket.on('new-incident', (data) => {
      this.emit('newIncident', data);
    });

    this.socket.on('incident-updated', (data) => {
      this.emit('incidentUpdated', data);
    });

    // Responder-related events
    this.socket.on('responder-location-update', (data) => {
      this.emit('responderLocationUpdate', data);
    });

    this.socket.on('responder-status-update', (data) => {
      this.emit('responderStatusUpdate', data);
    });

    // System events
    this.socket.on('system-alert', (data) => {
      this.emit('systemAlert', data);
    });
  }

  // Event emitter methods
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket event callback:', error);
        }
      });
    }
  }

  // Methods to send data to server
  updateLocation(location) {
    if (this.socket && this.isConnected) {
      this.socket.emit('location-update', { location });
    }
  }

  updateStatus(status) {
    if (this.socket && this.isConnected) {
      this.socket.emit('status-update', { status });
    }
  }

  reportIncident(incident) {
    if (this.socket && this.isConnected) {
      this.socket.emit('new-incident', incident);
    }
  }

  updateIncident(incident) {
    if (this.socket && this.isConnected) {
      this.socket.emit('incident-update', incident);
    }
  }

  sendMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message', message);
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  isSocketConnecting() {
    return this.isConnecting;
  }

  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance with global reference to prevent React StrictMode issues
let socketServiceInstance = null;

const getSocketService = () => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService();
  }
  return socketServiceInstance;
};

// Store reference globally to persist across React re-renders
if (typeof window !== 'undefined') {
  if (!window.__socketService) {
    window.__socketService = getSocketService();
  }
  socketServiceInstance = window.__socketService;
}

const socketService = getSocketService();

export default socketService;
