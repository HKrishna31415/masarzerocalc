
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
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-cyan-950/40 dark:from-emerald-950/60 dark:via-teal-950/60 dark:to-cyan-950/60 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-lg">
            {/* Animated Background Pulse */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10"
              animate={{
                opacity: [0.3, 0.7, 0.3],
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
                className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30"
              >
                <LightningIcon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black text-emerald-100">
                    Optimization Opportunity Detected
                  </h3>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-400 rounded-full"
                  />
                </div>
                
                <p className="text-sm text-emerald-200/80 mb-3 leading-relaxed">
                  Your model shows <span className="font-bold">Negative NPV ({new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(npv)})</span> but <span className="font-bold">Positive ROI ({roi.toFixed(1)}%)</span>. 
                  This suggests your CAPEX structure may need optimization.
                </p>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    onClick={handleOptimize}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold px-5 py-2.5 rounded-lg shadow-lg shadow-emerald-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-navy-950"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(16, 185, 129, 0.5)',
                        '0 0 0 12px rgba(16, 185, 129, 0)',
                        '0 0 0 0 rgba(16, 185, 129, 0.5)',
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

                  <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-700/30 px-3 py-2 rounded-lg">
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
