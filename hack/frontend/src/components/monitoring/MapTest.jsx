import React from 'react';
import GoogleMap from '../maps/GoogleMap';

const MapTest = () => {
  const testMarkers = [
    {
      id: 'test-1',
      position: { lat: 40.7128, lng: -74.0060 },
      title: 'Test Marker 1',
      icon: {
        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
        fillColor: 'red',
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 15
      }
    },
    {
      id: 'test-2',
      position: { lat: 40.7138, lng: -74.0050 },
      title: 'Test Marker 2',
      icon: {
        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
        fillColor: 'blue',
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 2,
        scale: 15
      }
    }
  ];

  const handleMarkerClick = (marker) => {
    console.log('Marker clicked:', marker);
  };

  return (
    <div className="w-full h-96 bg-gray-900 rounded-lg overflow-hidden">
      <GoogleMap
        center={{ lat: 40.7128, lng: -74.0060 }}
        zoom={15}
        markers={testMarkers}
        onMarkerClick={handleMarkerClick}
        showUserLocation={true}
        centerOnUserLocation={true}
        className="w-full h-full"
        mapOptions={{
          styles: [
            {
              featureType: "all",
              elementType: "geometry.fill",
              stylers: [{ color: "#1f2937" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca3af" }]
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#374151" }]
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#1e40af" }]
            }
          ]
        }}
      />
    </div>
  );
};

export default MapTest;
