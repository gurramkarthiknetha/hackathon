import { useState, useEffect, useRef } from "react";

const LiveVideoFeed = ({ selectedIncident, currentCamera: propCurrentCamera }) => {
  console.log('LiveVideoFeed rendering with props:', { selectedIncident, propCurrentCamera });

  const [currentCamera, setCurrentCamera] = useState(propCurrentCamera);
  const [cameras, setCameras] = useState([]);
  const [videoError, setVideoError] = useState(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isUsingDeviceCamera, setIsUsingDeviceCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Debug logging
  console.log('LiveVideoFeed state:', { 
    currentCamera, 
    isUsingDeviceCamera, 
    hasStream: !!stream,
    videoRef: !!videoRef.current 
  });

  // Video streaming service URLs
  const VIDEO_SERVICE_URL = import.meta.env.VITE_VIDEO_SERVICE_URL || 'http://localhost:5001';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // iPhone camera functions
  const startDeviceCamera = async (deviceId = null) => {
    try {
      setIsStartingCamera(true);
      setVideoError(null);

      // Build video constraints
      const videoConstraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      };

      // If specific device ID is provided, use it; otherwise use default camera
      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      } else {
        videoConstraints.facingMode = 'environment'; // Use back camera by default
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      setStream(mediaStream);
      setIsUsingDeviceCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        console.log('Video element srcObject set:', videoRef.current.srcObject);
      }

      console.log('System camera started successfully', { 
        streamActive: mediaStream.active,
        tracks: mediaStream.getTracks().length 
      });
    } catch (error) {
      console.error('Error accessing system camera:', error);
      setVideoError(`Camera access denied: ${error.message}`);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopDeviceCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsUsingDeviceCamera(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const switchCamera = async () => {
    if (stream) {
      stopDeviceCamera();
      // Wait a moment before starting new camera
      setTimeout(async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: isUsingDeviceCamera ? 'user' : 'environment', // Switch between front and back
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });

          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          setVideoError(`Error switching camera: ${error.message}`);
        }
      }, 100);
    }
  };

  // Capture frame and send to ML model for analysis
  const captureAndAnalyzeFrame = async () => {
    if (!videoRef.current || !stream) return;

    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      context.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const formData = new FormData();
        formData.append('file', blob, 'frame.jpg');
        
        try {
          console.log('📤 Sending frame to ML API...');
          setAiStatus('analyzing');
          const response = await fetch(`${API_URL}/ml/analyze/enhanced`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          console.log('📥 ML API response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            setDetectionResults(data);
            setAiStatus('active');
            console.log('🎯 Detection results received:', data);
            console.log('📊 Person count:', data.enhanced_multimodal?.person_count || 0);
            console.log('📦 All objects:', data.standard_ml?.objects?.length || 0);
            console.log('📦 Person bounding boxes:', data.enhanced_multimodal?.person_bboxes?.length || 0);
            
            // Draw bounding boxes on canvas
            drawBoundingBoxes(data);
          } else {
            setAiStatus('error');
          }
        } catch (error) {
          console.error('Error analyzing frame:', error);
          setAiStatus('error');
        }
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('Error capturing frame:', error);
      setAiStatus('error');
    }
  };

  // Draw bounding boxes on canvas overlay
  const drawBoundingBoxes = (data) => {
    if (!canvasRef.current || !videoRef.current) {
      console.log('Canvas or video ref not available for drawing');
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    console.log('Drawing bounding boxes:', data);
    console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    // Set canvas size to match video dimensions
    const videoWidth = video.videoWidth || 1280;
    const videoHeight = video.videoHeight || 720;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all object detections from standard ML
    if (data.standard_ml?.objects && data.standard_ml.objects.length > 0) {
      console.log(`Drawing ${data.standard_ml.objects.length} object bounding boxes`);
      
      data.standard_ml.objects.forEach((detection, index) => {
        const { bbox, class_name, confidence } = detection;
        const { x, y, width, height } = bbox;
        
        console.log(`Object ${index + 1}: ${class_name} bbox=[${x}, ${y}, ${width}, ${height}], confidence=${confidence}`);
        
        // Color coding for different object types
        let strokeColor = '#00ff00'; // Default green
        if (class_name === 'person') strokeColor = '#00ff00'; // Green for persons
        else if (['car', 'truck', 'bus', 'motorcycle'].includes(class_name)) strokeColor = '#ff6600'; // Orange for vehicles
        else if (['chair', 'couch', 'bed', 'table'].includes(class_name)) strokeColor = '#6600ff'; // Purple for furniture
        else if (['laptop', 'tv', 'cell phone', 'keyboard'].includes(class_name)) strokeColor = '#00ffff'; // Cyan for electronics
        else strokeColor = '#ffff00'; // Yellow for other objects
        
        // Draw bounding box
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const label = `${class_name} ${(confidence * 100).toFixed(0)}%`;
        ctx.font = '16px Arial';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = strokeColor + '80'; // Semi-transparent background
        ctx.fillRect(x, y - 25, textWidth + 10, 25);
        
        // Draw label text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + 5, y - 8);
      });
    }
    
    // Draw person bounding boxes from enhanced detection (if available)
    if (data.enhanced_multimodal?.person_bboxes && data.enhanced_multimodal.person_bboxes.length > 0) {
      console.log(`Drawing ${data.enhanced_multimodal.person_bboxes.length} enhanced person bounding boxes`);
      
      data.enhanced_multimodal.person_bboxes.forEach((bbox, index) => {
        const [x, y, width, height] = bbox.bbox;
        console.log(`Enhanced Person ${index + 1}: bbox=[${x}, ${y}, ${width}, ${height}], confidence=${bbox.confidence}`);
        
        // Draw enhanced person box with thicker border
        ctx.strokeStyle = '#00ff00'; // Green for persons
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const label = `Person ${bbox.confidence.toFixed(2)}`;
        ctx.font = '16px Arial';
        const textWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.fillRect(x, y - 25, textWidth + 10, 25);
        
        // Draw label text
        ctx.fillStyle = '#000000';
        ctx.fillText(label, x + 5, y - 8);
      });
    }
    
    // Draw detection indicators for emergencies
    const emergencyDetections = data.enhanced_multimodal?.detections || data.detections;
    if (emergencyDetections) {
      let yOffset = 30;
      Object.entries(emergencyDetections).forEach(([category, detection]) => {
        if (detection.detected) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.fillRect(10, yOffset, 200, 30);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px Arial';
          ctx.fillText(`⚠️ ${category.toUpperCase()}`, 15, yOffset + 20);
          
          yOffset += 35;
        }
      });
    }
  };

  // Fetch detection results from AI service (for remote cameras)
  const fetchDetectionResults = async (cameraId) => {
    if (cameraId === 'iphone_camera' || (cameraId && cameraId.startsWith('system_'))) return;
    
    try {
      const response = await fetch(`${VIDEO_SERVICE_URL}/api/cameras/${cameraId}/detections`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setDetectionResults(data.data);
          setAiStatus('active');
        }
      }
    } catch (error) {
      console.error('Error fetching detection results:', error);
      setAiStatus('error');
    }
  };

  // Update current camera when prop changes
  useEffect(() => {
    if (propCurrentCamera) {
      setCurrentCamera(propCurrentCamera);
    }
  }, [propCurrentCamera]);

  // Ensure video element gets stream when both are available
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      console.log('Setting srcObject on video element');
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Update canvas size when video dimensions change
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && videoRef.current && videoRef.current.videoWidth > 0) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Set canvas size to match video display size
        const rect = video.getBoundingClientRect();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', updateCanvasSize);
      videoRef.current.addEventListener('resize', updateCanvasSize);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', updateCanvasSize);
          videoRef.current.removeEventListener('resize', updateCanvasSize);
        }
      };
    }
  }, [stream]);

  // Start AI analysis when camera is active
  useEffect(() => {
    let analysisInterval;
    let retryCount = 0;
    const maxRetries = 10;
    
    console.log('AI analysis effect triggered:', {
      hasStream: !!stream,
      hasVideoRef: !!videoRef.current,
      videoWidth: videoRef.current?.videoWidth,
      videoHeight: videoRef.current?.videoHeight
    });
    
    if (stream && videoRef.current) {
      // Wait for video metadata to load or start immediately
      const startAnalysis = () => {
        if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          console.log('✅ Starting AI analysis interval - video ready:', {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          });
          setAiStatus('active');
          
          // Analyze frame every 3 seconds
          analysisInterval = setInterval(() => {
            console.log('🔍 Triggering automatic frame analysis...');
            captureAndAnalyzeFrame();
          }, 3000);
        } else if (retryCount < maxRetries) {
          retryCount++;
          console.log(`⏳ Video not ready yet (attempt ${retryCount}/${maxRetries}), retrying in 1s`);
          setTimeout(startAnalysis, 1000);
        } else {
          console.log('❌ Failed to start AI analysis - video dimensions not available');
        }
      };
      
      // Start analysis with a delay to ensure video is ready
      setTimeout(startAnalysis, 2000);
    }
    
    return () => {
      if (analysisInterval) {
        console.log('🛑 Clearing AI analysis interval');
        clearInterval(analysisInterval);
      }
    };
  }, [stream]);

  // Fetch cameras on mount and detect system cameras
  useEffect(() => {
    const fetchAllCameras = async () => {
      try {
        console.log('Fetching cameras...');
        
        // Detect system cameras
        let systemCameras = [];
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          
          systemCameras = videoDevices.map((device, index) => ({
            id: `system_${device.deviceId || index}`,
            name: device.label || `System Camera ${index + 1}`,
            type: 'system',
            deviceId: device.deviceId,
            status: 'available',
            location: 'Local System',
            source: 'device'
          }));
        }
        
        // Add fallback iPhone camera if no system cameras detected
        if (systemCameras.length === 0) {
          systemCameras = [{
            id: 'iphone_camera',
            name: 'iPhone Camera',
            status: 'available',
            location: 'Device Camera',
            source: 'device'
          }];
        }
        
        // Auto-select first system camera if no current camera is set
        if (!propCurrentCamera && systemCameras.length > 0) {
          setCurrentCamera(systemCameras[0].id);
        }
        
        // Fetch remote cameras
        try {
          const response = await fetch(`${API_URL}/cameras`, {
            credentials: 'include'
          });
          const data = await response.json();
          console.log('Remote cameras response:', data);

          if (data.success) {
            setCameras([...systemCameras, ...data.data]);
          } else {
            setCameras(systemCameras);
            // Only show error if no system cameras are available
            if (systemCameras.length === 0) {
              setVideoError(`Failed to fetch remote cameras: ${data.message}`);
            }
          }
          
          // Auto-select first system camera if no current camera is set
          if (!propCurrentCamera && systemCameras.length > 0) {
            setCurrentCamera(systemCameras[0].id);
          }
        } catch (error) {
          console.error('Error fetching remote cameras:', error);
          setCameras(systemCameras);
          // Only show error if no system cameras are available
          if (systemCameras.length === 0) {
            setVideoError(`Network error: ${error.message}`);
          }
          
          // Auto-select first system camera if no current camera is set
          if (!propCurrentCamera && systemCameras.length > 0) {
            setCurrentCamera(systemCameras[0].id);
          }
        }
      } catch (error) {
        console.error('Error detecting cameras:', error);
        // Ultimate fallback
        const fallbackCamera = {
          id: 'iphone_camera',
          name: 'iPhone Camera',
          status: 'available',
          location: 'Device Camera',
          source: 'device'
        };
        setCameras([fallbackCamera]);
        setVideoError(`Camera detection failed: ${error.message}`);
      }
    };

    fetchAllCameras();
  }, [API_URL]);

  // Fetch detection results periodically for active cameras
  useEffect(() => {
    if (currentCamera && currentCamera !== 'iphone_camera' && !(currentCamera && currentCamera.startsWith('system_'))) {
      const interval = setInterval(() => {
        fetchDetectionResults(currentCamera);
      }, 2000); // Update every 2 seconds

      return () => clearInterval(interval);
    }
  }, [currentCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDeviceCamera();
    };
  }, []);

  // Start camera function - handles both system cameras and remote cameras
  const startCamera = async (cameraId) => {
    try {
      setIsStartingCamera(true);
      console.log(`Starting camera: ${cameraId}`);

      // Handle system cameras (including iPhone camera)
      if (cameraId === 'iphone_camera' || (cameraId && cameraId.startsWith('system_'))) {
        // Extract device ID for system cameras
        let deviceId = null;
        if (cameraId && cameraId.startsWith('system_')) {
          const systemCamera = cameras.find(cam => cam.id === cameraId);
          deviceId = systemCamera?.deviceId;
        }
        await startDeviceCamera(deviceId);
        return;
      }

      // Handle remote cameras
      const response = await fetch(`${API_URL}/cameras/${cameraId}/start`, {
        method: 'POST',
        credentials: 'include'
      });

      const data = await response.json();
      console.log('Start camera response:', data);

      if (data.success) {
        // Stop device camera if it's running
        if (isUsingDeviceCamera) {
          stopDeviceCamera();
        }

        // Refresh cameras list to get updated status
        const camerasResponse = await fetch(`${API_URL}/cameras`, {
          credentials: 'include'
        });
        const camerasData = await camerasResponse.json();
        if (camerasData.success) {
          // Keep system cameras in the list
          const systemCameras = cameras.filter(cam => cam.source === 'device');
          setCameras([...systemCameras, ...camerasData.data]);
        }
        setVideoError(null);
      } else {
        setVideoError(`Failed to start camera: ${data.message}`);
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setVideoError(`Error starting camera: ${error.message}`);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const currentCameraInfo = cameras.find(cam => cam.id === currentCamera);

  // AI Detection Status Component
  const AIDetectionStatus = () => {
    if (currentCamera === 'iphone_camera' || (currentCamera && currentCamera.startsWith('system_'))) {
      return (
        <div className="absolute top-4 left-4 bg-blue-500/20 px-3 py-2 rounded">
          <span className="text-blue-400 text-sm font-medium">SYSTEM CAMERA - AI Ready</span>
        </div>
      );
    }

    if (!detectionResults) {
      return (
        <div className="absolute top-4 left-4 bg-gray-500/20 px-3 py-2 rounded">
          <span className="text-gray-400 text-sm font-medium">AI: {aiStatus}</span>
        </div>
      );
    }

    const hasDetections = (detectionResults.enhanced_multimodal?.detections && 
      Object.values(detectionResults.enhanced_multimodal.detections).some(detection => detection.detected)) ||
      (detectionResults.standard_ml?.objects && detectionResults.standard_ml.objects.length > 0);

    return (
      <div className="absolute top-4 left-4 bg-green-500/20 px-3 py-2 rounded">
        <span className="text-green-400 text-sm font-medium">
          AI ACTIVE - {hasDetections ? 'DETECTIONS' : 'CLEAR'}
        </span>
      </div>
    );
  };

  // // AI Detection Results Component
  // const AIDetectionResults = () => {
  //   if (!detectionResults || currentCamera === 'iphone_camera' || (currentCamera && currentCamera.startsWith('system_'))) return null;

  //   const detections = detectionResults.detections || {};
  //   const activeDetections = Object.entries(detections).filter(([_, detection]) => detection.detected);

  //   if (activeDetections.length === 0) return null;

  //   return (
  //     <div className="absolute bottom-4 left-4 bg-red-600/90 px-4 py-3 rounded-lg max-w-sm">
  //       <h4 className="text-white font-bold mb-2">🚨 AI DETECTIONS</h4>
  //       <div className="space-y-1">
  //         {activeDetections.map(([eventType, detection]) => (
  //           <div key={eventType} className="flex justify-between items-center">
  //             <span className="text-white text-sm capitalize">{eventType}</span>
  //             <span className="text-yellow-300 text-sm font-bold">
  //               {(detection.confidence * 100).toFixed(1)}%
  //             </span>
  //           </div>
  //         ))}
  //       </div>
  //       {detectionResults.person_count > 0 && (
  //         <div className="mt-2 pt-2 border-t border-red-400">
  //           <span className="text-white text-sm">
  //             👥 {detectionResults.person_count} people detected
  //           </span>
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Live Video Feed</h2>
            <p className="text-gray-300">Camera: {currentCameraInfo?.name || currentCamera}</p>
            {cameras.length > 0 && (
              <p className="text-sm text-gray-400">
                Status: {currentCamera === 'iphone_camera' ?
                  (isUsingDeviceCamera ? 'active' : 'available') :
                  (currentCameraInfo?.status || 'Unknown')
                } |
                Total Cameras: {cameras.length}
              </p>
            )}
          </div>

          {/* Camera Selector */}
          {cameras.length > 0 && (
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-300">Camera:</label>
              <select
                value={currentCamera}
                onChange={(e) => {
                  const newCamera = e.target.value;
                  // Stop current device camera if switching away from system camera
                  if ((currentCamera === 'iphone_camera' || (currentCamera && currentCamera.startsWith('system_'))) && isUsingDeviceCamera) {
                    stopDeviceCamera();
                  }
                  setCurrentCamera(newCamera);
                }}
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm"
              >
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name} ({camera.id === 'iphone_camera' ?
                      (isUsingDeviceCamera ? 'active' : 'available') :
                      camera.status
                    })
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {videoError ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
            <p className="text-red-300">{videoError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              Reload Page
            </button>
          </div>
        ) : stream ? (
          <div className="w-full h-full relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              onLoadedMetadata={() => setVideoError(null)}
              onError={() => setVideoError('Failed to load camera stream')}
            />

            {/* Canvas overlay for bounding boxes */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 10 }}
            />

            {/* AI Status for System Camera */}
            <AIDetectionStatus />
            
            {/* Manual Test Button */}
            <button
              onClick={captureAndAnalyzeFrame}
              className="absolute bottom-4 left-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              🔍 Test Detection
            </button>
            
            {/* Detection Results Overlay - Compact Bottom Right */}
            {detectionResults && (
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-90 text-white p-3 rounded-lg max-w-xs max-h-64 overflow-y-auto text-xs">
                <h4 className="font-bold mb-2 text-green-400 text-sm">🤖 AI Results</h4>
                
                {/* Compact Counts */}
                <div className="flex justify-between mb-2 text-xs">
                  <span className="text-blue-400">📦 Objects: <span className="text-white font-bold">{detectionResults.standard_ml?.objects?.length || 0}</span></span>
                  <span className="text-blue-400">👥 Persons: <span className="text-white font-bold">{detectionResults.enhanced_multimodal?.person_count || 0}</span></span>
                </div>

                {/* Compact Object List */}
                {detectionResults.standard_ml?.objects && detectionResults.standard_ml.objects.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-cyan-400 font-semibold text-xs mb-1">Objects:</h5>
                    <div className="max-h-20 overflow-y-auto space-y-0.5">
                      {detectionResults.standard_ml.objects.slice(0, 5).map((obj, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="capitalize text-gray-300 truncate text-xs">
                            {obj.class_name}
                          </span>
                          <span className="text-yellow-300 font-bold ml-1 text-xs">
                            {(obj.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                      {detectionResults.standard_ml.objects.length > 5 && (
                        <div className="text-gray-400 text-xs">+{detectionResults.standard_ml.objects.length - 5} more...</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compact Emergency Status - Only show active alerts */}
                {detectionResults.enhanced_multimodal?.detections && (
                  <div className="mb-2">
                    {Object.entries(detectionResults.enhanced_multimodal.detections)
                      .filter(([_, detection]) => detection.detected)
                      .map(([category, detection]) => (
                        <div key={category} className="flex justify-between items-center mb-1">
                          <span className="capitalize text-red-400 text-xs font-bold">
                            ⚠️ {category.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-yellow-300 text-xs">
                            {(detection.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))
                    }
                    {!Object.values(detectionResults.enhanced_multimodal.detections).some(d => d.detected) && (
                      <div className="text-green-400 text-xs">✅ All Clear</div>
                    )}
                  </div>
                )}

                {/* Compact Timestamp */}
                <div className="mt-2 pt-1 border-t border-gray-600 text-xs text-gray-400">
                  {new Date(detectionResults.enhanced_multimodal?.timestamp || detectionResults.timestamp || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        ) : currentCameraInfo?.status === 'active' && currentCamera !== 'iphone_camera' ? (
          <div className="w-full h-full relative">
            <img
              src={`${VIDEO_SERVICE_URL}/api/video_feed/${currentCamera}?t=${Date.now()}`}
              alt={`${currentCameraInfo?.name} feed`}
              className="w-full h-full object-cover"
              onError={() => setVideoError('Failed to load video stream')}
              onLoad={() => setVideoError(null)}
            />

            {/* AI Detection Status */}
            <AIDetectionStatus />

            {/* AI Detection Results */}
            {/* <AIDetectionResults /> */}
          </div>
        ) : (
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              System Camera Ready
            </h3>
            <p className="text-gray-500 mb-4">
              Click "Start Camera" to access your system camera
            </p>
            
            {currentCamera && <p className="text-sm text-gray-400 mb-2">Camera ID: {currentCamera}</p>}
            {currentCameraInfo && <p className="text-sm text-gray-400 mb-4">Location: {currentCameraInfo.location}</p>}
            
            <button
              onClick={() => startCamera(currentCamera || 'iphone_camera')}
              disabled={isStartingCamera}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
            >
              {isStartingCamera ? 'Starting Camera...' : 'Start System Camera'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveVideoFeed;