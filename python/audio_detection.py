#!/usr/bin/env python3
"""
Audio Detection Module
Detects distress sounds, fire sounds, and emergency audio cues
"""

import cv2
import numpy as np
import pyaudio
import wave
import threading
import time
from collections import deque
import librosa
import soundfile as sf

class AudioDetector:
    """Audio-based emergency detection using sound analysis"""
    
    def __init__(self):
        # Audio parameters
        self.sample_rate = 44100
        self.chunk_size = 1024
        self.channels = 1
        self.format = pyaudio.paFloat32
        
        # Audio detection thresholds
        self.distress_threshold = 0.6
        self.fire_sound_threshold = 0.5
        self.crowd_panic_threshold = 0.7
        
        # Audio analysis parameters
        self.audio_buffer = deque(maxlen=50)  # Store recent audio chunks
        self.feature_history = deque(maxlen=20)  # Store audio features
        
        # Emergency sound patterns
        self.distress_patterns = {
            'help_calls': {'freq_range': (200, 800), 'duration': 1.0},
            'screams': {'freq_range': (800, 2000), 'duration': 0.5},
            'crying': {'freq_range': (100, 400), 'duration': 2.0}
        }
        
        self.fire_patterns = {
            'crackling': {'freq_range': (1000, 4000), 'duration': 0.3},
            'roaring': {'freq_range': (50, 200), 'duration': 1.0}
        }
        
        self.crowd_patterns = {
            'panic_screams': {'freq_range': (800, 1500), 'duration': 0.5},
            'chaotic_noise': {'freq_range': (200, 1000), 'duration': 1.0}
        }
        
        # Initialize audio stream
        self.audio = pyaudio.PyAudio()
        self.stream = None
        self.is_recording = False
        
    def start_audio_stream(self):
        """Start audio recording stream"""
        try:
            self.stream = self.audio.open(
                format=self.format,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size
            )
            self.is_recording = True
            print("✅ Audio stream started")
        except Exception as e:
            print(f"❌ Error starting audio stream: {e}")
    
    def stop_audio_stream(self):
        """Stop audio recording stream"""
        if self.stream:
            self.is_recording = False
            self.stream.stop_stream()
            self.stream.close()
            self.audio.terminate()
            print("✅ Audio stream stopped")
    
    def extract_audio_features(self, audio_data):
        """Extract audio features for analysis"""
        try:
            # Convert to numpy array
            audio_array = np.frombuffer(audio_data, dtype=np.float32)
            
            # Calculate basic features
            features = {}
            
            # 1. RMS (Root Mean Square) - Volume
            features['rms'] = np.sqrt(np.mean(audio_array**2))
            
            # 2. Spectral centroid - Brightness
            if len(audio_array) > 0:
                spectrum = np.abs(np.fft.fft(audio_array))
                freqs = np.fft.fftfreq(len(audio_array), 1/self.sample_rate)
                positive_freqs = freqs > 0
                if np.any(positive_freqs):
                    features['spectral_centroid'] = np.sum(spectrum[positive_freqs] * freqs[positive_freqs]) / np.sum(spectrum[positive_freqs])
                else:
                    features['spectral_centroid'] = 0
            else:
                features['spectral_centroid'] = 0
            
            # 3. Spectral rolloff - Frequency distribution
            if len(audio_array) > 0 and features['spectral_centroid'] > 0:
                rolloff_threshold = 0.85
                cumsum = np.cumsum(spectrum[positive_freqs])
                rolloff_idx = np.where(cumsum >= rolloff_threshold * cumsum[-1])[0]
                if len(rolloff_idx) > 0:
                    features['spectral_rolloff'] = freqs[positive_freqs][rolloff_idx[0]]
                else:
                    features['spectral_rolloff'] = 0
            else:
                features['spectral_rolloff'] = 0
            
            # 4. Zero crossing rate - Noise level
            features['zero_crossing_rate'] = np.sum(np.diff(np.sign(audio_array)) != 0) / len(audio_array)
            
            # 5. Spectral bandwidth
            if features['spectral_centroid'] > 0:
                features['spectral_bandwidth'] = np.sqrt(np.sum(spectrum[positive_freqs] * (freqs[positive_freqs] - features['spectral_centroid'])**2) / np.sum(spectrum[positive_freqs]))
            else:
                features['spectral_bandwidth'] = 0
            
            return features
        except Exception as e:
            print(f"Error extracting audio features: {e}")
            return {}
    
    def detect_distress_sounds(self, features):
        """Detect distress sounds based on audio features"""
        distress_score = 0.0
        distress_type = "none"
        
        # 1. High frequency analysis (screams, help calls)
        if features.get('spectral_centroid', 0) > 800:  # High frequency
            distress_score += 0.3
            distress_type = "high_frequency_sound"
        
        # 2. High RMS (loud sounds)
        if features.get('rms', 0) > 0.1:  # Loud volume
            distress_score += 0.2
            if distress_type == "none":
                distress_type = "loud_sound"
        
        # 3. High zero crossing rate (noisy/distressed sounds)
        if features.get('zero_crossing_rate', 0) > 0.1:  # High noise
            distress_score += 0.2
            if distress_type == "none":
                distress_type = "noisy_sound"
        
        # 4. Spectral bandwidth (complex sounds like screams)
        if features.get('spectral_bandwidth', 0) > 1000:  # Wide frequency range
            distress_score += 0.3
            if distress_type == "none":
                distress_type = "complex_sound"
        
        return {
            'detected': distress_score > self.distress_threshold,
            'confidence': min(distress_score, 1.0),
            'type': distress_type
        }
    
    def detect_fire_sounds(self, features):
        """Detect fire-related sounds"""
        fire_score = 0.0
        fire_type = "none"
        
        # 1. Low frequency analysis (fire roaring)
        if features.get('spectral_centroid', 0) < 200:  # Low frequency
            fire_score += 0.3
            fire_type = "low_frequency_sound"
        
        # 2. High spectral rolloff (crackling sounds)
        if features.get('spectral_rolloff', 0) > 3000:  # High frequency rolloff
            fire_score += 0.4
            fire_type = "crackling_sound"
        
        # 3. Moderate RMS (consistent fire sound)
        rms = features.get('rms', 0)
        if 0.05 < rms < 0.3:  # Moderate volume
            fire_score += 0.2
            if fire_type == "none":
                fire_type = "moderate_sound"
        
        return {
            'detected': fire_score > self.fire_sound_threshold,
            'confidence': min(fire_score, 1.0),
            'type': fire_type
        }
    
    def detect_crowd_panic(self, features):
        """Detect crowd panic sounds"""
        panic_score = 0.0
        panic_type = "none"
        
        # 1. High RMS (loud crowd)
        if features.get('rms', 0) > 0.15:  # Very loud
            panic_score += 0.3
            panic_type = "loud_crowd"
        
        # 2. High spectral centroid (screams)
        if features.get('spectral_centroid', 0) > 1000:  # High frequency screams
            panic_score += 0.4
            panic_type = "screams"
        
        # 3. High zero crossing rate (chaotic noise)
        if features.get('zero_crossing_rate', 0) > 0.15:  # Very noisy
            panic_score += 0.3
            if panic_type == "none":
                panic_type = "chaotic_noise"
        
        # 4. High spectral bandwidth (complex crowd sounds)
        if features.get('spectral_bandwidth', 0) > 1500:  # Wide frequency range
            panic_score += 0.2
            if panic_type == "none":
                panic_type = "complex_crowd"
        
        return {
            'detected': panic_score > self.crowd_panic_threshold,
            'confidence': min(panic_score, 1.0),
            'type': panic_type
        }
    
    def analyze_audio_chunk(self, audio_data):
        """Analyze a single audio chunk"""
        # Extract features
        features = self.extract_audio_features(audio_data)
        
        if not features:
            return {
                'distress': {'detected': False, 'confidence': 0.0, 'type': 'none'},
                'fire': {'detected': False, 'confidence': 0.0, 'type': 'none'},
                'panic': {'detected': False, 'confidence': 0.0, 'type': 'none'}
            }
        
        # Detect different types of sounds
        distress_result = self.detect_distress_sounds(features)
        fire_result = self.detect_fire_sounds(features)
        panic_result = self.detect_crowd_panic(features)
        
        # Store features for temporal analysis
        self.feature_history.append({
            'features': features,
            'distress': distress_result,
            'fire': fire_result,
            'panic': panic_result,
            'timestamp': time.time()
        })
        
        return {
            'distress': distress_result,
            'fire': fire_result,
            'panic': panic_result,
            'features': features
        }
    
    def temporal_consistency_check(self):
        """Check temporal consistency of audio detections"""
        if len(self.feature_history) < 5:
            return {}
        
        recent_results = list(self.feature_history)[-5:]
        
        # Calculate consistency scores
        distress_consistency = sum(1 for r in recent_results if r['distress']['detected']) / len(recent_results)
        fire_consistency = sum(1 for r in recent_results if r['fire']['detected']) / len(recent_results)
        panic_consistency = sum(1 for r in recent_results if r['panic']['detected']) / len(recent_results)
        
        # Boost confidence if consistently detected
        boosted_results = {}
        
        if distress_consistency > 0.6:
            boosted_results['distress_boosted'] = True
        if fire_consistency > 0.6:
            boosted_results['fire_boosted'] = True
        if panic_consistency > 0.6:
            boosted_results['panic_boosted'] = True
        
        return boosted_results
    
    def record_audio_loop(self):
        """Main audio recording and analysis loop"""
        if not self.stream:
            return
        
        try:
            while self.is_recording:
                # Read audio data
                audio_data = self.stream.read(self.chunk_size, exception_on_overflow=False)
                
                # Analyze audio chunk
                results = self.analyze_audio_chunk(audio_data)
                
                # Store in buffer
                self.audio_buffer.append({
                    'data': audio_data,
                    'results': results,
                    'timestamp': time.time()
                })
                
                # Small delay to prevent excessive CPU usage
                time.sleep(0.01)
                
        except Exception as e:
            print(f"Error in audio recording loop: {e}")
    
    def get_latest_audio_results(self):
        """Get the latest audio analysis results"""
        if not self.audio_buffer:
            return {
                'distress': {'detected': False, 'confidence': 0.0, 'type': 'none'},
                'fire': {'detected': False, 'confidence': 0.0, 'type': 'none'},
                'panic': {'detected': False, 'confidence': 0.0, 'type': 'none'}
            }
        
        # Get latest results
        latest = self.audio_buffer[-1]['results']
        
        # Apply temporal consistency boost
        consistency_boost = self.temporal_consistency_check()
        
        # Boost confidence if consistent
        if consistency_boost.get('distress_boosted'):
            latest['distress']['confidence'] = min(latest['distress']['confidence'] + 0.2, 1.0)
        if consistency_boost.get('fire_boosted'):
            latest['fire']['confidence'] = min(latest['fire']['confidence'] + 0.2, 1.0)
        if consistency_boost.get('panic_boosted'):
            latest['panic']['confidence'] = min(latest['panic']['confidence'] + 0.2, 1.0)
        
        return latest
    
    def start_audio_detection(self):
        """Start audio detection in a separate thread"""
        self.start_audio_stream()
        
        # Start recording thread
        audio_thread = threading.Thread(target=self.record_audio_loop)
        audio_thread.daemon = True
        audio_thread.start()
        
        print("✅ Audio detection started in background thread")

# Example usage
if __name__ == "__main__":
    # Test audio detector
    detector = AudioDetector()
    print("✅ Audio Detection Module initialized")
    print("Features:")
    print("- Distress sound detection")
    print("- Fire sound detection")
    print("- Crowd panic detection")
    print("- Real-time audio analysis")
    print("- Temporal consistency checking")
    print("- Multi-feature audio classification")
    
    # Note: Requires microphone access to run
    # detector.start_audio_detection() 