'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import MessageItem from './MessageItem';
import SideBySideDisplay from './SideBySideDisplay';
import CenteredBox from './CenteredBox';
import { Message, Script } from '@/lib/script';

interface ChatFeedProps {
  messages: Message[];
  script?: Script | null;
}

export default function ChatFeed({ messages, script }: ChatFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added with ethereal timing
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const targetScrollTop = scrollElement.scrollHeight - scrollElement.clientHeight;
      const startScrollTop = scrollElement.scrollTop;
      const scrollDistance = targetScrollTop - startScrollTop;
      
      // Only scroll if there's actually distance to scroll
      if (Math.abs(scrollDistance) < 10) return;
      
      // Custom ethereal scroll animation - slower and more graceful
      const duration = 1200; // 1.2 seconds for ethereal feel
      const startTime = performance.now();
      
      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ethereal easing function - starts slow, peaks in middle, ends slow
        const easeInOutQuart = progress < 0.5 
          ? 8 * progress * progress * progress * progress
          : 1 - 8 * (progress - 1) * (progress - 1) * (progress - 1) * (progress - 1);
        
        scrollElement.scrollTop = startScrollTop + (scrollDistance * easeInOutQuart);
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };
      
      // Small delay before starting scroll for more organic feel
      setTimeout(() => {
        requestAnimationFrame(animateScroll);
      }, 150);
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 md:px-8 pt-24 pb-32"
    >
      <div className="max-w-2xl mx-auto">
        <AnimatePresence>
          {(() => {
            const defaultDuration = script?.meta?.defaultAnimationDuration ?? 0.5;
            const renderedItems: JSX.Element[] = [];
            
            const renderMessage = (message: Message, index: number): { element: JSX.Element; skipNext: boolean } => {
              const duration = message.animationDuration ?? defaultDuration;
              
              // Side-by-side display
              if (
                message.displayType === 'side-by-side' &&
                message.groupId &&
                index + 1 < messages.length &&
                messages[index + 1].displayType === 'side-by-side' &&
                messages[index + 1].groupId === message.groupId
              ) {
                const nextMessage = messages[index + 1];
                return {
                  element: (
                    <SideBySideDisplay
                      key={`${message.id}-${nextMessage.id}`}
                      leftText={message.text}
                      rightText={nextMessage.text}
                      animationDuration={duration}
                    />
                  ),
                  skipNext: true
                };
              }
              
              // Centered box display
              if (message.displayType === 'centered-box') {
                return {
                  element: (
                    <CenteredBox
                      key={message.id}
                      text={message.text}
                      animationDuration={duration}
                    />
                  ),
                  skipNext: false
                };
              }
              
              // Regular message display
              return {
                element: (
                  <MessageItem
                    key={message.id}
                    role={message.role}
                    text={message.text}
                    animationDuration={duration}
                    videoFile={message.videoFile}
                  />
                ),
                skipNext: false
              };
            };
            
            let i = 0;
            while (i < messages.length) {
              const { element, skipNext } = renderMessage(messages[i], i);
              renderedItems.push(element);
              i += skipNext ? 2 : 1;
            }
            
            return renderedItems;
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
