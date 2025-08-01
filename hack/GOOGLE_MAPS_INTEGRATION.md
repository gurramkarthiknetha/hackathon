# Google Maps Integration

This document explains how to use the Google Maps API integration in your monitoring application.

## Setup

### 1. API Key Configuration

The Google Maps API key has been added to your environment files:

**Backend (.env):**
```
GOOGLE_MAPS_API_KEY=AIzaSyC6zSUlV1nOcJ0EU3_i3VmdTbaVgH3k9gU
```

**Frontend (.env):**
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC6zSUlV1nOcJ0EU3_i3VmdTbaVgH3k9gU
```

### 2. Components Created

#### Frontend Components:
- `src/components/maps/GoogleMap.jsx` - Base Google Maps component
- `src/components/maps/MonitoringMap.jsx` - Specialized monitoring map with incidents and responders
- Updated `src/components/monitoring/ResponderMap.jsx` - Now supports both Google Maps and legacy view

#### Backend Utilities:
- `backend/utils/googleMaps.js` - Google Maps API utilities
- `backend/routes/maps.route.js` - API endpoints for map services

## Usage

### Frontend Integration

#### Basic Google Map
```jsx
import GoogleMap from '../components/maps/GoogleMap';

const MyComponent = () => {
  const markers = [
    {
      lat: 40.7128,
      lng: -74.0060,
      title: "New York City",
      infoWindow: "<div>Hello NYC!</div>"
    }
  ];

  return (
    <GoogleMap
      center={{ lat: 40.7128, lng: -74.0060 }}
      zoom={15}
      markers={markers}
      onMarkerClick={(marker, index) => console.log('Clicked:', marker)}
      className="w-full h-96"
    />
  );
};
```

#### Monitoring Map with Incidents
```jsx
import MonitoringMap from '../components/maps/MonitoringMap';

const MonitoringComponent = () => {
  const incidents = [
    {
      id: 1,
      lat: 40.7128,
      lng: -74.0060,
      title: "Emergency Incident",
      type: "medical_emergency",
      severity: "high"
    }
  ];

  const responders = [
    {
      id: 1,
      name: "Team Alpha",
      lat: 40.7150,
      lng: -74.0070,
      status: "active"
    }
  ];

  return (
    <MonitoringMap
      currentLocation={{ lat: 40.7128, lng: -74.0060 }}
      incidents={incidents}
      responders={responders}
      onIncidentSelect={(incident) => console.log('Selected incident:', incident)}
      onResponderSelect={(responder) => console.log('Selected responder:', responder)}
    />
  );
};
```

### Backend API Endpoints

#### Get API Key (Protected)
```
GET /api/maps/api-key
```

#### Generate Static Map URL
```
POST /api/maps/static-map
Content-Type: application/json

{
  "center": "40.7128,-74.0060",
  "zoom": 15,
  "size": "600x400",
  "markers": [
    {
      "location": "40.7128,-74.0060",
      "color": "red",
      "size": "mid"
    }
  ],
  "style": "dark"
}
```

#### Geocode Address
```
POST /api/maps/geocode
Content-Type: application/json

{
  "address": "Times Square, New York, NY"
}
```

#### Calculate Distance
```
POST /api/maps/distance
Content-Type: application/json

{
  "origin": { "lat": 40.7128, "lng": -74.0060 },
  "destination": { "lat": 40.7589, "lng": -73.9851 }
}
```

## Features

### ResponderMap Component
The ResponderMap component now includes a toggle button to switch between:
- **Google Maps View**: Real interactive Google Maps with markers
- **Simple View**: Original SVG-based visualization

### Map Styling
The Google Maps integration includes:
- Dark theme styling for monitoring dashboards
- Custom markers for different incident severities
- Info windows with incident/responder details
- Real-time marker updates

### API Utilities
Backend utilities provide:
- Static map URL generation
- Geocoding and reverse geocoding
- Distance calculations
- Embed map URL generation

## Customization

### Custom Markers
You can customize markers by providing icon URLs or using the built-in color/size options:

```jsx
const markers = [
  {
    lat: 40.7128,
    lng: -74.0060,
    title: "Custom Marker",
    icon: {
      url: "path/to/custom-icon.png",
      scaledSize: { width: 32, height: 32 }
    }
  }
];
```

### Map Styling
Customize the map appearance using the `mapOptions` prop:

```jsx
<GoogleMap
  mapOptions={{
    styles: [
      {
        featureType: "all",
        elementType: "geometry.fill",
        stylers: [{ color: "#1f2937" }]
      }
    ],
    disableDefaultUI: true,
    zoomControl: true
  }}
/>
```

## Error Handling

The components include built-in error handling for:
- Missing API key
- Failed API loads
- Network errors
- Invalid coordinates

## Performance Considerations

- The Google Maps API is loaded only once per page
- Markers are efficiently updated when data changes
- Map instances are reused when possible
- Static maps are used for thumbnails to reduce API calls

## Testing

To test the integration:
1. Start your development server
2. Navigate to the monitoring dashboard
3. Use the toggle button in ResponderMap to switch between views
4. Verify that markers appear correctly
5. Test clicking on markers to see info windows

## Troubleshooting

### Common Issues:

1. **Map not loading**: Check that the API key is correctly set in environment variables
2. **Markers not appearing**: Verify that latitude/longitude values are valid numbers
3. **API quota exceeded**: Monitor your Google Maps API usage in the Google Cloud Console
4. **CORS errors**: Ensure your domain is authorized in the Google Cloud Console

### Debug Mode:
Set `VITE_DEV_MODE=true` in your frontend .env file to enable console logging for API requests.
