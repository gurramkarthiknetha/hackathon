import React from 'react';
import MapTest from '../components/monitoring/MapTest';

const MapTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Google Map Test</h1>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Map Component Test</h2>
          <MapTest />
        </div>
      </div>
    </div>
  );
};

export default MapTestPage;
