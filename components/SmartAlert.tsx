
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LightningIcon, AdjustmentsIcon } from './icons';

interface SmartAlertProps {
  show: boolean;
  onGoalSeek: () => void;
  npv: number;
  roi: number;
  currency: string;
}

const SmartAlert: React.FC<SmartAlertProps> = ({ show, onGoalSeek, npv, roi, currency }) => {
  const handleOptimize = () => {
    onGoalSeek();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="mb-4"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-primary-50 dark:from-purple-950/20 dark:to-primary-950/20 border-2 border-purple-300 dark:border-purple-700/50 rounded-2xl p-5 shadow-lg">
            {/* Animated Background Pulse */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-primary-400/10"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative z-10 flex items-start gap-4">
              {/* Icon with Pulse */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-primary rounded-xl flex items-center justify-center shadow-lg"
              >
                <LightningIcon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black text-purple-900 dark:text-purple-200">
                    Optimization Opportunity Detected
                  </h3>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-purple-500 rounded-full"
                  />
                </div>
                
                <p className="text-sm text-purple-800 dark:text-purple-300 mb-3 leading-relaxed">
                  Your model shows <span className="font-bold">Negative NPV ({new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(npv)})</span> but <span className="font-bold">Positive ROI ({roi.toFixed(1)}%)</span>. 
                  This suggests your CAPEX structure may need optimization.
                </p>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={handleOptimize}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-primary hover:from-purple-600 hover:to-primary-dark text-white font-bold px-5 py-2.5 rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(168, 85, 247, 0.4)',
                        '0 0 0 10px rgba(168, 85, 247, 0)',
                        '0 0 0 0 rgba(168, 85, 247, 0.4)',
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <AdjustmentsIcon className="w-5 h-5" />
                    <span className="text-sm uppercase tracking-wider">Optimize Now</span>
                  </motion.button>

                  <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/30 px-3 py-2 rounded-lg">
                    <span className="font-semibold">Suggested:</span>
                    <span>Adjust Installation & CAC to one-time CAPEX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartAlert;
