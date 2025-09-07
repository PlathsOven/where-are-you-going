'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ArtworkLabelProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ArtworkLabel({ isVisible, onClose }: ArtworkLabelProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
          >
            {/* Label Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-300 shadow-lg max-w-md w-full mx-4"
            >
              {/* Museum Label Content */}
              <div className="p-6 space-y-4 font-serif">
                {/* Artist Name */}
                <div className="text-black font-semibold text-lg tracking-wide">
                  Sean Gong
                </div>
                
                {/* Artwork Title */}
                <div className="text-black italic text-base">
                  where are you going?
                </div>
                
                {/* Year and Medium */}
                <div className="text-black text-sm space-y-1">
                  <div>2025</div>
                  <div>Interactive digital work</div>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>
                
                {/* Description */}
                <div className="text-black text-sm leading-relaxed text-justify">
                  You can see it all over LinkedIn. Our world today cares more about how fast you are, than where you are going. This piece offers a personal escape from comparison culture: a conversation with your future self about the cost of chasing others' dreams and the power of pursuing your own.
                </div>
              </div>
              
              {/* Close Button */}
              <div className="border-t border-gray-200 px-6 py-3 bg-gray-50">
                <button
                  onClick={onClose}
                  className="text-sm text-gray-600 hover:text-black transition-colors font-serif"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
