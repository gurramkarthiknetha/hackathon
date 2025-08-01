import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Generate a Google Maps Static API URL
 * @param {Object} options - Map options
 * @param {string} options.center - Center coordinates (lat,lng)
 * @param {number} options.zoom - Zoom level (1-20)
 * @param {string} options.size - Image size (widthxheight, max 640x640)
 * @param {Array} options.markers - Array of marker objects
 * @param {string} options.maptype - Map type (roadmap, satellite, terrain, hybrid)
 * @returns {string} Google Maps Static API URL
 */
export const generateStaticMapUrl = (options = {}) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const {
    center = '40.7128,-74.0060', // Default to NYC
    zoom = 15,
    size = '600x400',
    markers = [],
    maptype = 'roadmap',
    style = 'default'
  } = options;

  let url = `https://maps.googleapis.com/maps/api/staticmap?`;
  url += `center=${encodeURIComponent(center)}`;
  url += `&zoom=${zoom}`;
  url += `&size=${size}`;
  url += `&maptype=${maptype}`;

  // Add markers
  markers.forEach(marker => {
    const {
      location,
      color = 'red',
      size: markerSize = 'mid',
      label,
      icon
    } = marker;

    let markerParam = `&markers=`;
    
    if (icon) {
      markerParam += `icon:${encodeURIComponent(icon)}`;
    } else {
      markerParam += `color:${color}|size:${markerSize}`;
      if (label) {
        markerParam += `|label:${label}`;
      }
    }
    
    markerParam += `|${location}`;
    url += markerParam;
  });

  // Add dark style for monitoring dashboard
  if (style === 'dark') {
    const darkStyle = [
      'feature:all|element:labels.text.fill|color:0x9ca3af',
      'feature:all|element:labels.text.stroke|color:0x1f2937',
      'feature:all|element:geometry.fill|color:0x1f2937',
      'feature:road|element:geometry|color:0x374151',
      'feature:water|element:geometry|color:0x1e40af'
    ];
    
    darkStyle.forEach(styleRule => {
      url += `&style=${encodeURIComponent(styleRule)}`;
    });
  }

  url += `&key=${GOOGLE_MAPS_API_KEY}`;
  
  return url;
};

/**
 * Generate a Google Maps embed URL for iframe
 * @param {Object} options - Map options
 * @param {string} options.center - Center coordinates (lat,lng)
 * @param {number} options.zoom - Zoom level
 * @param {string} options.maptype - Map type
 * @returns {string} Google Maps embed URL
 */
export const generateEmbedMapUrl = (options = {}) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const {
    center = '40.7128,-74.0060',
    zoom = 15,
    maptype = 'roadmap'
  } = options;

  return `https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${center}&zoom=${zoom}&maptype=${maptype}`;
};

/**
 * Geocode an address to coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} Geocoding result
 */
export const geocodeAddress = async (address) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        success: true,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formatted_address: result.formatted_address,
        place_id: result.place_id
      };
    } else {
      return {
        success: false,
        error: data.status,
        message: 'No results found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message
    };
  }
};

/**
 * Reverse geocode coordinates to address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Reverse geocoding result
 */
export const reverseGeocode = async (lat, lng) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return {
        success: true,
        address: data.results[0].formatted_address,
        components: data.results[0].address_components,
        place_id: data.results[0].place_id
      };
    } else {
      return {
        success: false,
        error: data.status,
        message: 'No results found'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message
    };
  }
};

/**
 * Calculate distance between two points using Google Maps Distance Matrix API
 * @param {Object} origin - Origin coordinates {lat, lng}
 * @param {Object} destination - Destination coordinates {lat, lng}
 * @returns {Promise<Object>} Distance calculation result
 */
export const calculateDistance = async (origin, destination) => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    const originStr = `${origin.lat},${origin.lng}`;
    const destinationStr = `${destination.lat},${destination.lng}`;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationStr}&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        success: true,
        distance: {
          text: element.distance.text,
          value: element.distance.value // in meters
        },
        duration: {
          text: element.duration.text,
          value: element.duration.value // in seconds
        }
      };
    } else {
      return {
        success: false,
        error: data.status,
        message: 'Could not calculate distance'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message
    };
  }
};

export default {
  generateStaticMapUrl,
  generateEmbedMapUrl,
  geocodeAddress,
  reverseGeocode,
  calculateDistance
};
