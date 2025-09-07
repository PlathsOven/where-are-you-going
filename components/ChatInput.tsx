'use client';

import { FormEvent, useEffect, useRef } from 'react';
import ChoiceButtons from './ChoiceButtons';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  disabled?: boolean;
  choices?: string[];
  onChoice?: (choice: string, index: number) => void;
}

export default function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  placeholder, 
  disabled = false,
  choices,
  onChoice
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when it becomes available
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSubmit();
      }
    }
  };

  // If choices are provided, render choice buttons instead
  if (choices && choices.length > 0 && onChoice) {
    return (
      <ChoiceButtons
        choices={choices}
        onChoice={onChoice}
        disabled={disabled}
      />
    );
  }

  // Otherwise render regular text input
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-black/5">
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 bg-transparent font-serif text-black/90 placeholder-black/40
              border border-black/10 rounded-lg px-4 py-3
              focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
            `}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={disabled || !value.trim()}
            className={`
              px-6 py-3 border border-black/10 rounded-lg font-serif
              hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
              transition-all duration-200
            `}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
