import express from 'express';
import { 
  generateStaticMapUrl, 
  generateEmbedMapUrl, 
  geocodeAddress, 
  reverseGeocode, 
  calculateDistance 
} from '../utils/googleMaps.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Get Google Maps API key for frontend (only return if user is authenticated)
router.get('/api-key', verifyToken, (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'Google Maps API key not configured'
      });
    }
    
    res.json({
      success: true,
      apiKey: apiKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve API key'
    });
  }
});

// Generate static map URL
router.post('/static-map', verifyToken, (req, res) => {
  try {
    const { center, zoom, size, markers, maptype, style } = req.body;
    
    const mapUrl = generateStaticMapUrl({
      center,
      zoom,
      size,
      markers,
      maptype,
      style
    });
    
    res.json({
      success: true,
      mapUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Generate embed map URL
router.post('/embed-map', verifyToken, (req, res) => {
  try {
    const { center, zoom, maptype } = req.body;
    
    const embedUrl = generateEmbedMapUrl({
      center,
      zoom,
      maptype
    });
    
    res.json({
      success: true,
      embedUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Geocode address
router.post('/geocode', verifyToken, async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    const result = await geocodeAddress(address);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reverse geocode coordinates
router.post('/reverse-geocode', verifyToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const result = await reverseGeocode(lat, lng);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Calculate distance between two points
router.post('/distance', verifyToken, async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required'
      });
    }
    
    const result = await calculateDistance(origin, destination);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get incident locations with map data
router.get('/incidents', verifyToken, async (req, res) => {
  try {
    // This would typically fetch from your database
    // For now, returning mock data with map integration
    const incidents = [
      {
        id: 1,
        type: "crowd_surge",
        location: {
          lat: 40.7128,
          lng: -74.0060,
          address: "New York, NY"
        },
        severity: "high",
        title: "Crowd Management",
        description: "Large crowd gathering requiring immediate attention",
        timestamp: new Date().toISOString(),
        status: "active"
      },
      {
        id: 2,
        type: "medical_emergency",
        location: {
          lat: 40.7589,
          lng: -73.9851,
          address: "Times Square, New York, NY"
        },
        severity: "medium",
        title: "Medical Assistance",
        description: "Person requiring medical attention",
        timestamp: new Date().toISOString(),
        status: "responding"
      }
    ];

    // Generate static map URLs for each incident
    const incidentsWithMaps = incidents.map(incident => ({
      ...incident,
      staticMapUrl: generateStaticMapUrl({
        center: `${incident.location.lat},${incident.location.lng}`,
        zoom: 16,
        size: '300x200',
        markers: [{
          location: `${incident.location.lat},${incident.location.lng}`,
          color: incident.severity === 'high' ? 'red' : incident.severity === 'medium' ? 'yellow' : 'green',
          size: 'mid'
        }],
        style: 'dark'
      })
    }));

    res.json({
      success: true,
      incidents: incidentsWithMaps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
