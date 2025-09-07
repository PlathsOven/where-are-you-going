'use client';

import { motion } from 'framer-motion';

interface CenteredBoxProps {
  text: string;
  animationDuration?: number;
}

// Basic markdown parsing for bold text and bullets
function parseBasicMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.*)/gm, '• $1');
}

// Check if line is a centered name
function isCenteredName(line: string): boolean {
  return line.includes('[CENTERED]') && line.includes('[/CENTERED]');
}

// Extract name from centered markers
function extractCenteredName(line: string): string {
  return line.replace(/\[CENTERED\](.*?)\[\/CENTERED\]/, '$1');
}

// Determine CSS classes based on content
function getLineClasses(line: string): string {
  if (isCenteredName(line)) {
    return 'text-lg font-bold text-black text-center mb-3';
  }
  if (line.includes('**') || line.includes('Education:') || line.includes('Career:')) {
    return 'text-sm font-semibold text-black/95';
  }
  if (line.startsWith('- ') || line.startsWith('• ')) {
    return 'text-xs text-black/80 ml-4';
  }
  return 'text-xs text-black/90';
}

export default function CenteredBox({ 
  text, 
  animationDuration = 0.5 
}: CenteredBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: animationDuration, ease: 'easeOut' }}
      className="my-3 md:my-4 flex justify-center"
    >
      <div className="max-w-md p-4 md:p-6 border border-black/10 rounded-lg bg-white/50 backdrop-blur-sm">
        <div className="text-black/90 leading-snug tracking-tight text-left space-y-1">
          {text.split('\n').map((line, i) => {
            if (isCenteredName(line)) {
              const name = extractCenteredName(line);
              return (
                <p key={i} className={getLineClasses(line)}>
                  {name}
                </p>
              );
            }
            return (
              <p key={i} className={getLineClasses(line)} dangerouslySetInnerHTML={{__html: parseBasicMarkdown(line)}} />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
