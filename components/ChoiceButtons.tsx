'use client';

import { motion } from 'framer-motion';

interface ChoiceButtonsProps {
  choices: string[];
  onChoice: (choice: string, index: number) => void;
  disabled?: boolean;
}

export default function ChoiceButtons({ choices, onChoice, disabled = false }: ChoiceButtonsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-black/5"
    >
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-4">
        <div className="flex gap-4 justify-center">
          {choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => !disabled && onChoice(choice, index)}
              disabled={disabled}
              className={`
                px-8 py-3 border border-black/10 rounded-lg font-serif text-black/90
                hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/20
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
                transition-all duration-200 min-w-[120px]
              `}
              aria-label={`Choose ${choice}`}
            >
              {choice}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
