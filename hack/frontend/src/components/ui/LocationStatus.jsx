import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, MapPin, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

const LocationStatus = ({ className = "", showDetails = false }) => {
  const { location, error, loading, isWatching, isStale, refreshLocation } = useGeolocation();

  const getStatusInfo = () => {
    if (loading) {
      return {
        icon: RefreshCw,
        color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
        text: 'Getting location...',
        status: 'loading'
      };
    }

    if (error && !location) {
      return {
        icon: AlertCircle,
        color: 'text-red-400 bg-red-400/10 border-red-400/20',
        text: 'Location unavailable',
        status: 'error'
      };
    }

    if (location?.isFallback) {
      return {
        icon: MapPin,
        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        text: 'Approximate location',
        status: 'fallback'
      };
    }

    if (location && isStale) {
      return {
        icon: WifiOff,
        color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        text: 'Location outdated',
        status: 'stale'
      };
    }

    if (location) {
      return {
        icon: isWatching ? Wifi : Navigation,
        color: 'text-green-400 bg-green-400/10 border-green-400/20',
        text: isWatching ? 'Live tracking' : 'Location found',
        status: 'active'
      };
    }

    return {
      icon: MapPin,
      color: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      text: 'No location',
      status: 'none'
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg border
        ${statusInfo.color} ${className}
      `}
    >
      <StatusIcon 
        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
      />
      
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {statusInfo.text}
        </span>
        
        {showDetails && location && (
          <div className="text-xs opacity-75 mt-1">
            <div>
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
            {location.accuracy && (
              <div>±{Math.round(location.accuracy)}m accuracy</div>
            )}
            {location.timestamp && (
              <div>
                Updated: {location.timestamp.toLocaleTimeString()}
              </div>
            )}
          </div>
        )}
      </div>

      {(error || isStale) && (
        <motion.button
          onClick={refreshLocation}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title="Refresh location"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
        </motion.button>
      )}
    </motion.div>
  );
};

export default LocationStatus;
