import { useEffect, useRef, useState } from 'react';
import { Loader } from 'lucide-react';

const GoogleMap = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 15,
  markers = [],
  onMapClick,
  onMarkerClick,
  className = "w-full h-full",
  mapOptions = {}
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Validate center coordinates
  const validateCenter = (centerCoords) => {
    const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC default

    if (!centerCoords || typeof centerCoords !== 'object') {
      return defaultCenter;
    }

    const lat = typeof centerCoords.lat === 'number' ? centerCoords.lat :
                typeof centerCoords.latitude === 'number' ? centerCoords.latitude : null;
    const lng = typeof centerCoords.lng === 'number' ? centerCoords.lng :
                typeof centerCoords.longitude === 'number' ? centerCoords.longitude : null;

    if (lat !== null && lng !== null && isFinite(lat) && isFinite(lng)) {
      return { lat, lng };
    } else {
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

  // Update markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstanceRef.current,
        title: markerData.title || '',
        icon: markerData.icon || undefined,
        animation: markerData.animation ? window.google.maps.Animation[markerData.animation] : undefined
      });

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
  }, [markers, onMarkerClick]);

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
