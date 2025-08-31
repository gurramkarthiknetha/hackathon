import { useState, useEffect, useCallback } from 'react';
import locationService from '../services/locationService';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to location service
  useEffect(() => {
    setLoading(true);

    const unsubscribe = locationService.subscribe((newLocation) => {
      setLocation(newLocation);
      setError(newLocation.error || null);
      setLoading(false);
    });

    // Get initial status
    const status = locationService.getStatus();
    if (status.hasLocation) {
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  // Refresh location manually
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    try {
      const newLocation = await locationService.getCurrentLocation();
      setLocation(newLocation);
      setError(newLocation.error || null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start/stop watching
  const startWatching = useCallback(() => {
    locationService.startWatching();
  }, []);

  const stopWatching = useCallback(() => {
    locationService.stopWatching();
  }, []);

  const status = locationService.getStatus();

  return {
    location,
    error,
    loading,
    refreshLocation,
    startWatching,
    stopWatching,
    isWatching: status.isWatching,
    isStale: status.isStale
  };
};

export default useGeolocation;
