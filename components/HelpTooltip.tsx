import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionMarkCircleIcon } from './icons';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  title,
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="text-slate-400 hover:text-primary dark:text-navy-500 dark:hover:text-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
        aria-label="Help"
        type="button"
      >
        <QuestionMarkCircleIcon className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
          >
            <div className="bg-slate-900 dark:bg-navy-950 text-white rounded-lg shadow-2xl p-3 max-w-xs border border-white/10">
              {title && (
                <div className="font-bold text-sm mb-1">{title}</div>
              )}
              <div className="text-xs leading-relaxed text-slate-300 dark:text-navy-300">
                {content}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HelpTooltip;
