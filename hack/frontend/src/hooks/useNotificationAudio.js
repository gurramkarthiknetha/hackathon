import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling notification audio playback
 * Supports continuous looping, volume control, and proper cleanup
 */
const useNotificationAudio = (audioSrc = '/audio/security-alarm-63578.mp3') => {
  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.loop = true; // Enable continuous looping
      audioRef.current.preload = 'auto';

      // Set default volume
      audioRef.current.volume = 0.7;

      // Handle audio events
      const handleEnded = () => {
        isPlayingRef.current = false;
      };

      const handleError = (e) => {
        console.error('Audio playback error:', e);
        isPlayingRef.current = false;
      };

      const handlePlay = () => {
        isPlayingRef.current = true;
      };

      const handlePause = () => {
        isPlayingRef.current = false;
      };

      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
      audioRef.current.addEventListener('play', handlePlay);
      audioRef.current.addEventListener('pause', handlePause);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.removeEventListener('ended', () => {});
        audioRef.current.removeEventListener('error', () => {});
        audioRef.current.removeEventListener('play', () => {});
        audioRef.current.removeEventListener('pause', () => {});
      }
    };
  }, [audioSrc]);

  // Play audio
  const play = useCallback(async () => {
    if (audioRef.current && !isPlayingRef.current) {
      try {
        console.log('Attempting to play notification audio:', audioRef.current.src);
        audioRef.current.currentTime = 0; // Start from beginning

        // Try to play the audio
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          await playPromise;
          isPlayingRef.current = true;
          console.log('Audio playback started successfully');
          return true;
        }
      } catch (error) {
        console.error('Failed to play notification audio:', error);
        console.error('Audio src:', audioRef.current?.src);
        console.error('Audio readyState:', audioRef.current?.readyState);

        // Check if it's an autoplay policy error
        if (error.name === 'NotAllowedError') {
          console.warn('Audio autoplay blocked by browser. User interaction required.');
        }

        isPlayingRef.current = false;
        return false;
      }
    }
    return false;
  }, []);

  // Stop audio
  const stop = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      isPlayingRef.current = false;
    }
  }, []);

  // Pause audio (without resetting position)
  const pause = useCallback(() => {
    if (audioRef.current && isPlayingRef.current) {
      audioRef.current.pause();
      isPlayingRef.current = false;
    }
  }, []);

  // Resume audio
  const resume = useCallback(async () => {
    if (audioRef.current && !isPlayingRef.current) {
      try {
        await audioRef.current.play();
        isPlayingRef.current = true;
        return true;
      } catch (error) {
        console.error('Failed to resume notification audio:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Set volume (0.0 to 1.0)
  const setVolume = useCallback((volume) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  // Get current volume
  const getVolume = useCallback(() => {
    return audioRef.current ? audioRef.current.volume : 0.7;
  }, []);

  // Check if audio is currently playing
  const isPlaying = useCallback(() => {
    return isPlayingRef.current;
  }, []);

  // Cleanup function to be called when component unmounts
  const cleanup = useCallback(() => {
    stop();
  }, [stop]);

  return {
    play,
    stop,
    pause,
    resume,
    setVolume,
    getVolume,
    isPlaying,
    cleanup
  };
};

export default useNotificationAudio;
