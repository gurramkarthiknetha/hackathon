import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(user) {
    if (this.socket) {
      this.disconnect();
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.isConnected = true;
      
      // Join appropriate rooms based on user role
      this.socket.emit('join-room', {
        userId: user.id,
        role: user.role,
        zone: user.assignedZone
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
    });

    // Set up event listeners
    this.setupEventListeners();

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
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

  getSocketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
