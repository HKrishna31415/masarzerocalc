import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputParams } from '../types';
import { SMART_PRESETS } from '../utils/presets';

interface QuickPresetsProps {
  onApplyPreset: (params: Partial<InputParams>) => void;
  currentParams: InputParams;
}

const QuickPresets: React.FC<QuickPresetsProps> = ({ onApplyPreset, currentParams }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const categories = ['All', ...Array.from(new Set(SMART_PRESETS.map(p => p.category)))];
  const filteredPresets = selectedCategory === 'All' 
    ? SMART_PRESETS 
    : SMART_PRESETS.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Risk Profile': return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
      case 'Regional': return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      case 'Station Size': return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
      case 'Business Model': return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
      default: return null;
    }
  };

  return (
    <div className="bg-white dark:bg-glass-200 backdrop-blur-xl border border-slate-200 dark:border-glass-border rounded-2xl shadow-glass overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-white">
            Quick Presets
          </h3>
          <span className="text-xs text-slate-500 dark:text-navy-400 font-medium">
            {filteredPresets.length} scenarios
          </span>
        </div>
        
        {/* Category Filter */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-primary text-white shadow-glow'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-navy-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-2 sm:p-3 max-h-[280px] sm:max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-navy-700">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {filteredPresets.map((preset) => (
              <motion.button
                key={preset.name}
                onClick={() => onApplyPreset(preset.params)}
                className="w-full flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all border border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 group text-left"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-light/20 dark:from-primary/10 dark:to-primary-light/10 flex items-center justify-center text-primary-dark dark:text-primary-light group-hover:scale-110 transition-transform">
                  {getCategoryIcon(preset.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors truncate">
                      {preset.name}
                    </div>
                    <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-navy-400 font-bold uppercase tracking-wider">
                      {preset.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-navy-400 leading-relaxed">
                    {preset.description}
                  </div>
                  <div className="flex gap-2 mt-2 text-[10px] text-slate-400 dark:text-navy-500">
                    <span>{preset.params.avgGasolineSold?.toLocaleString()} LPD</span>
                    <span>•</span>
                    <span>{preset.params.businessModel}</span>
                    {preset.params.enableMonthlyFees && (
                      <>
                        <span>•</span>
                        <span className="text-primary-dark dark:text-primary-light font-bold">SaaS</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuickPresets;
