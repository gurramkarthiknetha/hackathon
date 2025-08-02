/**
 * Test utility to simulate advanced activity detection events
 * This helps test the enhanced UI without needing real camera input
 */

import io from 'socket.io-client';

class ActivityDetectionTester {
  constructor() {
    this.socket = null;
    this.isRunning = false;
    this.testScenarios = {
      normal: {
        fire: { confidence: 0.0, status: "not_detected" },
        smoke: { confidence: 0.0, status: "not_detected" },
        running: { confidence: 0.0, status: "not_detected" },
        fallen: { confidence: 0.0, status: "not_detected" },
        "medical emergency": { confidence: 0.0, status: "not_detected" },
        stampede: { confidence: 0.0, status: "not_detected" }
      },
      fallenPerson: {
        fire: { confidence: 0.0, status: "not_detected" },
        smoke: { confidence: 0.0, status: "not_detected" },
        running: { confidence: 0.2, status: "not_detected" },
        fallen: { confidence: 0.87, status: "detected" },
        "medical emergency": { confidence: 0.0, status: "not_detected" },
        stampede: { confidence: 0.0, status: "not_detected" }
      },
      medicalEmergency: {
        fire: { confidence: 0.0, status: "not_detected" },
        smoke: { confidence: 0.0, status: "not_detected" },
        running: { confidence: 0.3, status: "not_detected" },
        fallen: { confidence: 0.82, status: "detected" },
        "medical emergency": { confidence: 0.75, status: "detected" },
        stampede: { confidence: 0.0, status: "not_detected" }
      },
      fireEmergency: {
        fire: { confidence: 0.92, status: "detected" },
        smoke: { confidence: 0.78, status: "detected" },
        running: { confidence: 0.65, status: "detected" },
        fallen: { confidence: 0.0, status: "not_detected" },
        "medical emergency": { confidence: 0.0, status: "not_detected" },
        stampede: { confidence: 0.0, status: "not_detected" }
      },
      stampede: {
        fire: { confidence: 0.0, status: "not_detected" },
        smoke: { confidence: 0.0, status: "not_detected" },
        running: { confidence: 0.95, status: "detected" },
        fallen: { confidence: 0.45, status: "not_detected" },
        "medical emergency": { confidence: 0.0, status: "not_detected" },
        stampede: { confidence: 0.88, status: "detected" }
      },
      multipleActivities: {
        fire: { confidence: 0.0, status: "not_detected" },
        smoke: { confidence: 0.67, status: "detected" },
        running: { confidence: 0.72, status: "detected" },
        fallen: { confidence: 0.91, status: "detected" },
        "medical emergency": { confidence: 0.0, status: "not_detected" },
        stampede: { confidence: 0.0, status: "not_detected" }
      }
    };
  }

  connect() {
    this.socket = io('http://localhost:5001', {
      transports: ['polling'],
      reconnection: true
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to video streaming service for testing');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from video streaming service');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isRunning = false;
  }

  simulateDetection(scenario = 'normal', cameraId = 'ipwebcam_01') {
    if (!this.socket || !this.socket.connected) {
      console.error('❌ Socket not connected. Call connect() first.');
      return;
    }

    const events = this.testScenarios[scenario] || this.testScenarios.normal;
    
    // Generate some fake raw detections for bounding boxes
    const rawDetections = [];
    
    Object.entries(events).forEach(([activity, data]) => {
      if (data.status === 'detected') {
        rawDetections.push({
          label: activity,
          confidence: data.confidence,
          bbox: [
            Math.random() * 400 + 100, // x
            Math.random() * 300 + 100, // y
            Math.random() * 100 + 50,  // width
            Math.random() * 100 + 50   // height
          ],
          camera_id: cameraId,
          timestamp: Date.now() / 1000
        });
      }
    });

    const detectionUpdate = {
      camera_id: cameraId,
      timestamp: new Date().toISOString(),
      events: events,
      raw_detections: rawDetections,
      camera_info: {
        id: cameraId,
        name: 'IP Webcam 1',
        status: 'active'
      }
    };

    console.log(`🎯 Simulating ${scenario} detection:`, detectionUpdate);
    this.socket.emit('detection_update', detectionUpdate);
  }

  runTestSequence(cameraId = 'ipwebcam_01') {
    if (this.isRunning) {
      console.log('⚠️ Test sequence already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting advanced activity detection test sequence...');

    const sequence = [
      { scenario: 'normal', delay: 1000, description: 'Normal state - no activities' },
      { scenario: 'fallenPerson', delay: 3000, description: 'Person fallen detected' },
      { scenario: 'medicalEmergency', delay: 3000, description: 'Medical emergency escalation' },
      { scenario: 'normal', delay: 2000, description: 'Back to normal' },
      { scenario: 'fireEmergency', delay: 3000, description: 'Fire emergency!' },
      { scenario: 'normal', delay: 2000, description: 'Fire cleared' },
      { scenario: 'stampede', delay: 3000, description: 'Stampede situation' },
      { scenario: 'multipleActivities', delay: 3000, description: 'Multiple activities detected' },
      { scenario: 'normal', delay: 2000, description: 'All clear' }
    ];

    let currentStep = 0;

    const runNextStep = () => {
      if (!this.isRunning || currentStep >= sequence.length) {
        console.log('✅ Test sequence completed');
        this.isRunning = false;
        return;
      }

      const step = sequence[currentStep];
      console.log(`📋 Step ${currentStep + 1}/${sequence.length}: ${step.description}`);
      
      this.simulateDetection(step.scenario, cameraId);
      currentStep++;

      setTimeout(runNextStep, step.delay);
    };

    // Start the sequence
    setTimeout(runNextStep, 1000);
  }

  stopTestSequence() {
    this.isRunning = false;
    console.log('🛑 Test sequence stopped');
  }

  // Quick test methods for individual scenarios
  testFallenPerson(cameraId = 'ipwebcam_01') {
    this.simulateDetection('fallenPerson', cameraId);
  }

  testFireEmergency(cameraId = 'ipwebcam_01') {
    this.simulateDetection('fireEmergency', cameraId);
  }

  testMedicalEmergency(cameraId = 'ipwebcam_01') {
    this.simulateDetection('medicalEmergency', cameraId);
  }

  testStampede(cameraId = 'ipwebcam_01') {
    this.simulateDetection('stampede', cameraId);
  }

  testNormal(cameraId = 'ipwebcam_01') {
    this.simulateDetection('normal', cameraId);
  }
}

// Export for use in browser console or components
window.ActivityDetectionTester = ActivityDetectionTester;

// Create a global instance for easy testing
window.activityTester = new ActivityDetectionTester();

// Helper functions for quick testing
window.testActivityDetection = {
  connect: () => window.activityTester.connect(),
  disconnect: () => window.activityTester.disconnect(),
  runSequence: () => window.activityTester.runTestSequence(),
  stopSequence: () => window.activityTester.stopTestSequence(),
  fallen: () => window.activityTester.testFallenPerson(),
  fire: () => window.activityTester.testFireEmergency(),
  medical: () => window.activityTester.testMedicalEmergency(),
  stampede: () => window.activityTester.testStampede(),
  normal: () => window.activityTester.testNormal()
};

console.log('🧪 Activity Detection Tester loaded!');
console.log('Usage:');
console.log('  testActivityDetection.connect()     - Connect to service');
console.log('  testActivityDetection.runSequence() - Run full test sequence');
console.log('  testActivityDetection.fallen()      - Test fallen person');
console.log('  testActivityDetection.fire()        - Test fire emergency');
console.log('  testActivityDetection.medical()     - Test medical emergency');
console.log('  testActivityDetection.stampede()    - Test stampede');
console.log('  testActivityDetection.normal()      - Reset to normal');

export default ActivityDetectionTester;
