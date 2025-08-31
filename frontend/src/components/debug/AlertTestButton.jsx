import { useState } from 'react';
import { AlertTriangle, Volume2, TestTube } from 'lucide-react';
import useEmergencyAlerts from '../../hooks/useEmergencyAlerts';

const AlertTestButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { testEmergencyAlert, alertHistory, unacknowledgedCount } = useEmergencyAlerts();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const testAlerts = [
    {
      type: 'fire',
      title: '🔥 Fire Detection Alert',
      message: 'Fire detected with 85% confidence in Building A, Floor 2. Immediate evacuation required.',
      confidence: 0.85
    },
    {
      type: 'smoke',
      title: '💨 Smoke Detection Alert', 
      message: 'Smoke detected with 92% confidence in Cafeteria Area. Please investigate immediately.',
      confidence: 0.92
    },
    {
      type: 'stampede',
      title: '👥 Stampede Alert',
      message: 'Crowd stampede detected with 78% confidence at Main Entrance. Deploy crowd control measures.',
      confidence: 0.78
    },
    {
      type: 'fallen',
      title: '🚑 Person Down Alert',
      message: 'Person fallen detected with 95% confidence in Corridor B. Medical assistance required.',
      confidence: 0.95
    },
    {
      type: 'medical emergency',
      title: '🏥 Medical Emergency Alert',
      message: 'Medical emergency detected with 88% confidence in Conference Room 3. Send medical team immediately.',
      confidence: 0.88
    }
  ];

  const sendTestAlert = (alertConfig) => {
    const testAlert = {
      id: `test-${Date.now()}`,
      type: 'emergency_detection',
      title: alertConfig.title,
      message: alertConfig.message,
      severity: 'critical',
      timestamp: new Date(),
      metadata: {
        eventType: alertConfig.type,
        confidence: alertConfig.confidence,
        camera_id: 'test-camera-01',
        location: 'Test Location - Debug Mode',
        requiresAudio: true,
        audioFile: '/audio/security-alarm-63578.mp3'
      },
      sender: {
        name: 'Debug Test System',
        role: 'system'
      }
    };

    testEmergencyAlert(testAlert);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Show Alert Test Panel (Dev Mode)"
        >
          <TestTube className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
            Alert Test Panel
          </h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Development Mode - Test Emergency Alerts
        </div>
        
        {unacknowledgedCount > 0 && (
          <div className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
            {unacknowledgedCount} unacknowledged alert{unacknowledgedCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {testAlerts.map((alert, index) => (
          <button
            key={index}
            onClick={() => sendTestAlert(alert)}
            className="w-full text-left p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded border text-sm transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {alert.title.split(' ')[0]} {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(alert.confidence * 100)}%
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Total Alerts: {alertHistory.length}</span>
          <div className="flex items-center space-x-1">
            <Volume2 className="w-3 h-3" />
            <span>Audio Enabled</span>
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        ⚠️ These are test alerts with audio notifications. 
        Make sure your volume is appropriate.
      </div>
    </div>
  );
};

export default AlertTestButton;
