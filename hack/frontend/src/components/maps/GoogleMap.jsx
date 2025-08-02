import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

const GoogleMap = ({
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 15,
  markers = [],
  onMapClick,
  onMarkerClick,
  className = "w-full h-full",
  mapOptions = {},
  showUserLocation = true, // New prop to control user location display
  centerOnUserLocation = false // New prop to center map on user location
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userLocationMarkerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user's current location
  const { location: userLocation, error: locationError, loading: locationLoading } = useGeolocation({
    watch: true,
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000 // Cache for 30 seconds for better performance
  });

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          initializeMap();
          return;
        }

        // Wait for Google Maps to load (since it's loaded via HTML script tag)
        const checkGoogleMaps = () => {
          if (window.google && window.google.maps) {
            initializeMap();
          } else {
            setTimeout(checkGoogleMaps, 100);
          }
        };

        checkGoogleMaps();
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, []);

  // Create or update user location marker
  const updateUserLocationMarker = () => {
    if (!mapInstanceRef.current || !showUserLocation || !userLocation) return;

    // Validate user location coordinates
    const lat = typeof userLocation.lat === 'number' ? userLocation.lat : null;
    const lng = typeof userLocation.lng === 'number' ? userLocation.lng : null;

    if (lat === null || lng === null ||
        !isFinite(lat) || !isFinite(lng) ||
        isNaN(lat) || isNaN(lng) ||
        lat < -90 || lat > 90 ||
        lng < -180 || lng > 180) {
      console.warn('Invalid user location coordinates:', userLocation);
      return;
    }

    // Remove existing user location marker
    if (userLocationMarkerRef.current) {
      if (userLocationMarkerRef.current.setMap) {
        userLocationMarkerRef.current.setMap(null);
      }
      if (userLocationMarkerRef.current.accuracyCircle) {
        userLocationMarkerRef.current.accuracyCircle.setMap(null);
      }
    }

    // Create user location marker with a distinctive style
    const userMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: userLocation.isFallback ? 'Your Location (Approximate)' : 'Your Current Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: userLocation.isFallback ? '#fbbf24' : '#3b82f6', // Yellow for fallback, blue for real
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 12
      },
      zIndex: 1000 // Ensure user location is always on top
    });

    // Add accuracy circle if available
    if (userLocation.accuracy && !userLocation.isFallback && userLocation.accuracy < 1000) {
      const accuracyCircle = new window.google.maps.Circle({
        strokeColor: '#3b82f6',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        map: mapInstanceRef.current,
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: userLocation.accuracy
      });

      // Store reference to clean up later
      userMarker.accuracyCircle = accuracyCircle;
    }

    // Add info window with location details
    const infoContent = `
      <div style="padding: 8px; font-family: Arial, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937;">📍 Your Location</h3>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          ${userLocation.isFallback ? 'Approximate location' : 'Current location'}
        </p>
        ${userLocation.accuracy ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">Accuracy: ±${Math.round(userLocation.accuracy)}m</p>` : ''}
        ${userLocation.timestamp ? `<p style="margin: 4px 0 0 0; color: #6b7280; font-size: 11px;">Updated: ${userLocation.timestamp.toLocaleTimeString()}</p>` : ''}
      </div>
    `;

    const infoWindow = new window.google.maps.InfoWindow({
      content: infoContent
    });

    userMarker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, userMarker);
    });

    userLocationMarkerRef.current = userMarker;
  };

  // Validate center coordinates
  const validateCenter = (centerCoords) => {
    const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC default

    if (!centerCoords || typeof centerCoords !== 'object') {
      console.warn('Invalid center coordinates provided, using default:', centerCoords);
      return defaultCenter;
    }

    const lat = typeof centerCoords.lat === 'number' ? centerCoords.lat :
                typeof centerCoords.latitude === 'number' ? centerCoords.latitude : null;
    const lng = typeof centerCoords.lng === 'number' ? centerCoords.lng :
                typeof centerCoords.longitude === 'number' ? centerCoords.longitude : null;

    // More strict validation for lat/lng values
    if (lat !== null && lng !== null &&
        isFinite(lat) && isFinite(lng) &&
        !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180) {
      return { lat, lng };
    } else {
      console.warn('Invalid lat/lng values, using default:', { lat, lng });
      return defaultCenter;
    }
  };

  // Initialize map
  const initializeMap = () => {
    try {
      if (!mapRef.current) {
        return;
      }

      // Validate center coordinates
      const validCenter = validateCenter(center);

      const defaultOptions = {
        center: validCenter,
        zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        ...mapOptions
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, defaultOptions);

      // Add click listener
      if (onMapClick) {
        mapInstanceRef.current.addListener('click', (event) => {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          });
        });
      }

      setIsLoading(false);
    } catch (err) {
      setError('Failed to initialize map');
      setIsLoading(false);
    }
  };

  // Validate marker coordinates
  const validateMarkerPosition = (markerData) => {
    const lat = typeof markerData.lat === 'number' ? markerData.lat :
                typeof markerData.latitude === 'number' ? markerData.latitude : null;
    const lng = typeof markerData.lng === 'number' ? markerData.lng :
                typeof markerData.longitude === 'number' ? markerData.longitude : null;

    if (lat !== null && lng !== null &&
        isFinite(lat) && isFinite(lng) &&
        !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
    return null;
  };

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.setMap) {
        marker.setMap(null);
      } else if (marker.map) {
        marker.map = null;
      }
    });
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      // Validate marker position first
      const position = validateMarkerPosition(markerData);
      if (!position) {
        console.warn(`Invalid marker position for marker ${index}:`, markerData);
        return; // Skip this marker
      }

      let marker;

      // Use AdvancedMarkerElement if available, fallback to Marker
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        // Create content for AdvancedMarkerElement
        const markerContent = document.createElement('div');
        markerContent.style.cssText = `
          width: 24px;
          height: 24px;
          background-color: #dc2626;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
        `;

        if (markerData.icon && typeof markerData.icon === 'string') {
          markerContent.innerHTML = `<img src="${markerData.icon}" style="width: 100%; height: 100%; border-radius: 50%;" />`;
        }

        marker = new window.google.maps.marker.AdvancedMarkerElement({
          position,
          map: mapInstanceRef.current,
          title: markerData.title || '',
          content: markerContent
        });
      } else {
        // Fallback to deprecated Marker for compatibility
        marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: markerData.title || '',
          icon: markerData.icon || undefined,
          animation: markerData.animation ? window.google.maps.Animation[markerData.animation] : undefined
        });
      }

      // Add click listener to marker
      if (onMarkerClick) {
        marker.addListener('click', () => {
          onMarkerClick(markerData, index);
        });
      }

      // Add info window if content is provided
      if (markerData.infoWindow) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: markerData.infoWindow
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });

    // Add user location marker if enabled
    if (showUserLocation && userLocation && !userLocation.loading) {
      updateUserLocationMarker();
    }
  }, [markers, onMarkerClick, showUserLocation, userLocation]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center]);

  // Update map zoom when zoom prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [zoom]);

  // Center map on user location if requested
  useEffect(() => {
    if (mapInstanceRef.current && centerOnUserLocation && userLocation && !userLocation.loading) {
      const lat = typeof userLocation.lat === 'number' ? userLocation.lat : null;
      const lng = typeof userLocation.lng === 'number' ? userLocation.lng : null;

      if (lat !== null && lng !== null &&
          isFinite(lat) && isFinite(lng) &&
          !isNaN(lat) && !isNaN(lng) &&
          lat >= -90 && lat <= 90 &&
          lng >= -180 && lng <= 180) {
        mapInstanceRef.current.setCenter({ lat, lng });
      }
    }
  }, [centerOnUserLocation, userLocation]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800 text-white`}>
        <div className="text-center">
          <div className="text-red-400 mb-2">⚠️</div>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white z-10">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMap;
