'use client';

import { motion } from 'framer-motion';

interface SideBySideDisplayProps {
  leftText: string;
  rightText: string;
  animationDuration?: number;
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

export default function SideBySideDisplay({ 
  leftText, 
  rightText, 
  animationDuration = 0.5 
}: SideBySideDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animationDuration, ease: 'easeOut' }}
      className="my-3 md:my-4 mr-auto pr-12 md:pr-16"
    >
      <div className="flex gap-4 md:gap-6">
        <div className="flex-1 p-4 md:p-6 border border-black/10 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="text-black/90 leading-relaxed tracking-tight text-sm md:text-base space-y-2">
            {leftText.split('\n').map((line, i) => (
              <p key={i} className={getLineClasses(line)} dangerouslySetInnerHTML={{__html: parseBasicMarkdown(line)}} />
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 md:p-6 border border-black/10 rounded-lg bg-white/50 backdrop-blur-sm">
          <div className="text-black/90 leading-relaxed tracking-tight text-sm md:text-base space-y-2">
            {rightText.split('\n').map((line, i) => (
              <p key={i} className={getLineClasses(line)} dangerouslySetInnerHTML={{__html: parseBasicMarkdown(line)}} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
