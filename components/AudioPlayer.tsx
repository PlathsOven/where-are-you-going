'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  audioFile?: string;
  volume?: number; // 0.0 to 1.0
}

export default function AudioPlayer({ audioFile = 'ambient.mp3', volume = 0.3 }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      // Auto-play with user interaction fallback
      audio.play().catch(error => {
        console.log('Auto-play prevented, will start on user interaction:', error);
      });
    };

    const handleError = () => {
      console.warn(`Failed to load audio file: ${audioFile}`);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Set initial volume
    audio.volume = volume;

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [audioFile, volume]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
      // If audio was paused due to muting, resume it
      if (audio.paused && isLoaded) {
        audio.play().catch(console.error);
      }
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Handle user interaction to start audio (for browsers that block autoplay)
  const handleUserInteraction = () => {
    const audio = audioRef.current;
    if (audio && audio.paused && isLoaded && !isMuted) {
      audio.play().catch(console.error);
    }
  };

  useEffect(() => {
    // Add global click listener to handle autoplay restrictions
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [isLoaded, isMuted]);

  return (
    <>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        src={`/audio/${audioFile}`}
      />
      
      {/* Mute/Unmute Control */}
      <div className="fixed top-4 left-4 z-30">
        <button
          onClick={toggleMute}
          className="p-2 bg-white/90 backdrop-blur-sm border border-black/10 rounded-full text-sm font-serif hover:bg-black/5 transition-colors"
          aria-label={isMuted ? 'Unmute ambient music' : 'Mute ambient music'}
          title={isMuted ? 'Unmute ambient music' : 'Mute ambient music'}
        >
          {isMuted ? (
            // Muted icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          ) : (
            // Unmuted icon
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
