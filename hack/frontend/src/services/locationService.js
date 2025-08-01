/**
 * Location Service - Centralized location management for the application
 */

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
    this.subscribers = new Set();
    this.isWatching = false;
    this.lastUpdate = null;
    this.options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000 // 30 seconds
    };
  }

  /**
   * Subscribe to location updates
   * @param {Function} callback - Function to call when location updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // If we have a current location, immediately call the callback
    if (this.currentLocation) {
      callback(this.currentLocation);
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of location update
   * @param {Object} location - Location object
   */
  notifySubscribers(location) {
    this.subscribers.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location subscriber:', error);
      }
    });
  }

  /**
   * Handle successful geolocation
   * @param {GeolocationPosition} position 
   */
  handleLocationSuccess(position) {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: new Date(position.timestamp),
      isFallback: false
    };

    this.currentLocation = location;
    this.lastUpdate = Date.now();
    this.notifySubscribers(location);
  }

  /**
   * Handle geolocation error
   * @param {GeolocationPositionError} error 
   */
  handleLocationError(error) {
    console.warn('Geolocation error:', error.message);
    
    // Use fallback location (NYC)
    const fallbackLocation = {
      lat: 40.7128,
      lng: -74.0060,
      accuracy: null,
      heading: null,
      speed: null,
      timestamp: new Date(),
      isFallback: true,
      error: {
        code: error.code,
        message: error.message
      }
    };

    this.currentLocation = fallbackLocation;
    this.notifySubscribers(fallbackLocation);
  }

  /**
   * Start watching user location
   */
  startWatching() {
    if (!navigator.geolocation) {
      this.handleLocationError({ 
        code: 0, 
        message: 'Geolocation not supported by this browser' 
      });
      return;
    }

    if (this.isWatching) {
      return; // Already watching
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => this.handleLocationSuccess(position),
      (error) => this.handleLocationError(error),
      this.options
    );

    // Start watching position
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handleLocationSuccess(position),
      (error) => this.handleLocationError(error),
      this.options
    );

    this.isWatching = true;
  }

  /**
   * Stop watching user location
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isWatching = false;
  }

  /**
   * Get current location (one-time request)
   * @returns {Promise<Object>} Location object
   */
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const fallback = {
          lat: 40.7128,
          lng: -74.0060,
          accuracy: null,
          timestamp: new Date(),
          isFallback: true
        };
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp),
            isFallback: false
          };
          resolve(location);
        },
        (error) => {
          const fallback = {
            lat: 40.7128,
            lng: -74.0060,
            accuracy: null,
            timestamp: new Date(),
            isFallback: true,
            error: {
              code: error.code,
              message: error.message
            }
          };
          resolve(fallback);
        },
        this.options
      );
    });
  }

  /**
   * Calculate distance between two points in meters
   * @param {Object} point1 - {lat, lng}
   * @param {Object} point2 - {lat, lng}
   * @returns {number} Distance in meters
   */
  calculateDistance(point1, point2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = point1.lat * Math.PI / 180;
    const φ2 = point2.lat * Math.PI / 180;
    const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
    const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Check if location is stale (older than maxAge)
   * @param {number} maxAge - Maximum age in milliseconds
   * @returns {boolean}
   */
  isLocationStale(maxAge = 60000) { // Default 1 minute
    if (!this.lastUpdate) return true;
    return (Date.now() - this.lastUpdate) > maxAge;
  }

  /**
   * Get location status
   * @returns {Object} Status object
   */
  getStatus() {
    return {
      isWatching: this.isWatching,
      hasLocation: !!this.currentLocation,
      isFallback: this.currentLocation?.isFallback || false,
      lastUpdate: this.lastUpdate,
      isStale: this.isLocationStale(),
      subscriberCount: this.subscribers.size
    };
  }

  /**
   * Cleanup - stop watching and clear subscribers
   */
  cleanup() {
    this.stopWatching();
    this.subscribers.clear();
    this.currentLocation = null;
    this.lastUpdate = null;
  }
}

// Create singleton instance
const locationService = new LocationService();

// Auto-start watching when service is imported
locationService.startWatching();

export default locationService;
