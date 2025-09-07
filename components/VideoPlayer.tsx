'use client';

import { motion } from 'framer-motion';

interface VideoPlayerProps {
  videoFile?: string;
  animationDuration?: number;
}

export default function VideoPlayer({ videoFile, animationDuration = 0.5 }: VideoPlayerProps) {
  // Use specified video file or fallback to video1.mp4
  const videoSrc = videoFile ? `/videos/${videoFile}` : '/videos/video1.mp4';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: animationDuration, ease: 'easeOut' }}
      className="flex justify-center items-center my-8"
    >
      <div className="relative bg-black/10 backdrop-blur-sm rounded-lg shadow-2xl overflow-hidden border border-black/20">
        <div className="w-[400px] h-[225px] md:w-[480px] md:h-[270px] flex items-center justify-center">
          {/* Actual video element */}
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            src={videoSrc}
          >
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Subtle overlay for artistic effect */}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>
    </motion.div>
  );
}
