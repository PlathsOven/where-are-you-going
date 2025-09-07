'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import VideoPlayer from './VideoPlayer';

interface MessageItemProps {
  role: 'bot' | 'user';
  text: string;
  animationDuration?: number; // Duration in seconds
  videoFile?: string; // Optional video file for [Show video] messages
}

// Basic markdown parsing for bold text and bullets
function parseBasicMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '• $1');
}

// Determine CSS classes based on content
function getLineClasses(line: string): string {
  if (line.includes('**') || line.includes('Education:') || line.includes('Career:')) {
    return 'font-semibold text-black/95';
  }
  if (line.startsWith('- ') || line.startsWith('• ')) {
    return 'text-black/80 ml-4';
  }
  return 'text-black/90';
}

export default function MessageItem({ role, text, animationDuration = 0.5, videoFile }: MessageItemProps) {
  const isVideoMessage = text.trim().toLowerCase() === '[show video]';
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Common animation props
  const animationProps = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: animationDuration, ease: 'easeOut' as const }
  };
  
  if (isVideoMessage) {
    return (
      <motion.div {...animationProps} className="my-6 md:my-8">
        <VideoPlayer videoFile={videoFile} animationDuration={animationDuration} />
      </motion.div>
    );
  }

  // Check if user message should be truncated
  const lines = text.split('\n');
  const shouldTruncate = role === 'user' && (lines.length > 3 || text.length > 180);
  const isLongSingleLine = lines.length <= 3 && text.length > 180;
  
  const displayLines = shouldTruncate && !isExpanded
    ? isLongSingleLine 
      ? [text.substring(0, 180) + '...']
      : lines.slice(0, 3)
    : lines;
  
  const handleToggleExpand = () => {
    if (shouldTruncate) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      {...animationProps}
      className={`my-3 md:my-4 ${
        role === 'bot' 
          ? 'mr-auto pr-12 md:pr-16' 
          : 'ml-auto pl-12 md:pl-16 max-w-[85%]'
      }`}
    >
      <div 
        className={`${
          role === 'bot' 
            ? 'text-black/90 italic leading-relaxed tracking-tight' 
            : 'text-black/80 leading-relaxed tracking-tight text-right'
        } space-y-2 ${
          shouldTruncate ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
        }`}
        onClick={handleToggleExpand}
      >
        {displayLines.map((line, i) => (
          <p key={i} className={getLineClasses(line)} dangerouslySetInnerHTML={{__html: parseBasicMarkdown(line)}} />
        ))}
        {shouldTruncate && (
          <div className="text-xs text-black/50 mt-2">
            {isExpanded ? (
              <span>click to collapse</span>
            ) : (
              <span>
                ... click to expand
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
