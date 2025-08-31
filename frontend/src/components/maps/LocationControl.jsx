import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

const LocationControl = ({ onLocationUpdate, className = "" }) => {
  const { location, error, loading, refreshLocation, isWatching } = useGeolocation({
    watch: true,
    enableHighAccuracy: true
  });

  const handleCenterOnLocation = () => {
    if (location && onLocationUpdate) {
      onLocationUpdate(location);
    } else if (!location) {
      refreshLocation();
    }
  };

  const getLocationStatus = () => {
    if (loading) return { icon: RefreshCw, color: 'text-blue-400', text: 'Getting location...' };
    if (error) return { icon: AlertCircle, color: 'text-red-400', text: 'Location unavailable' };
    if (location?.isFallback) return { icon: MapPin, color: 'text-yellow-400', text: 'Approximate location' };
    if (location) return { icon: Navigation, color: 'text-green-400', text: 'Location found' };
    return { icon: MapPin, color: 'text-gray-400', text: 'No location' };
  };

  const status = getLocationStatus();
  const StatusIcon = status.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Location Status Indicator */}
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
        <StatusIcon 
          className={`h-4 w-4 ${status.color} ${loading ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm text-gray-300">{status.text}</span>
      </div>

      {/* Center on Location Button */}
      <motion.button
        onClick={handleCenterOnLocation}
        disabled={loading || (!location && !error)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
          ${location 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }
        `}
        title={location ? 'Center map on your location' : 'Location not available'}
      >
        <div className="flex items-center space-x-2">
          <Navigation className="h-4 w-4" />
          <span>My Location</span>
        </div>
      </motion.button>

      {/* Refresh Location Button */}
      <motion.button
        onClick={refreshLocation}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors duration-200"
        title="Refresh location"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      </motion.button>

      {/* Location Details (when available) */}
      {location && !loading && (
        <div className="hidden lg:block px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400">
            <div>Lat: {location.lat.toFixed(6)}</div>
            <div>Lng: {location.lng.toFixed(6)}</div>
            {location.accuracy && (
              <div>±{Math.round(location.accuracy)}m</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationControl;
