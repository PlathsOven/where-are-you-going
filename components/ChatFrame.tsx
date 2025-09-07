'use client';

import { ReactNode } from 'react';

interface ChatFrameProps {
  children: ReactNode;
}

export default function ChatFrame({ 
  children
}: ChatFrameProps) {
  return (
    <div className="min-h-screen bg-white font-serif flex items-center justify-center">
      <div className="relative w-full max-w-2xl h-[85vh] overflow-hidden">
        {/* Top gradient mask */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
        
        {/* Bottom gradient mask */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />
        
        
        {/* Main content */}
        <div className="relative h-full flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
