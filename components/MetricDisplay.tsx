
import React from 'react';
import InfoTooltip from './InfoTooltip';
import { TooltipInfo } from '../types';

interface MetricDisplayProps {
  label: string;
  value: string;
  highlight?: 'total-costs' | 'net-profit-loss' | 'net-profit-gain' | 'roi' | 'npv' | 'profit-margin';
  tooltip?: TooltipInfo;
  variant?: 'standard' | 'hero';
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({ label, value, highlight, tooltip, variant = 'standard' }) => {
  const highlightClasses = {
    'total-costs': 'text-red-600 dark:text-danger-light drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    'net-profit-loss': 'text-red-600 dark:text-danger-light drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    'net-profit-gain': 'text-emerald-600 dark:text-success-light drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    'roi': 'text-emerald-600 dark:text-primary-light drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(5,150,105,0.5)]',
    'npv': 'text-emerald-600 dark:text-primary-light drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(5,150,105,0.5)]', 
    'profit-margin': 'text-emerald-600 dark:text-primary-light drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(5,150,105,0.5)]',
  };
  
  const textColor = highlight ? highlightClasses[highlight] : 'text-slate-900 dark:text-white';
 
  if (variant === 'hero') {
      return (
        <div className="bg-white dark:bg-glass-200 backdrop-blur-md border border-slate-200 dark:border-glass-border p-3 sm:p-4 lg:p-5 rounded-2xl shadow-sm dark:shadow-glass relative group transition-all duration-300 hover:border-primary/30 dark:hover:border-glass-highlight hover:translate-y-[-2px] overflow-hidden">
            {/* Ambient Glow Background - contained within overflow-hidden */}
            {highlight === 'net-profit-gain' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 dark:bg-success/10 blur-3xl rounded-full transition-opacity opacity-60 group-hover:opacity-100 pointer-events-none" />}
            {highlight === 'roi' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 dark:bg-primary/10 blur-3xl rounded-full transition-opacity opacity-60 group-hover:opacity-100 pointer-events-none" />}
            {highlight === 'npv' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 dark:bg-primary/10 blur-3xl rounded-full transition-opacity opacity-60 group-hover:opacity-100 pointer-events-none" />}
            {highlight === 'profit-margin' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 dark:bg-primary/10 blur-3xl rounded-full transition-opacity opacity-60 group-hover:opacity-100 pointer-events-none" />}
            {highlight === 'net-profit-loss' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 dark:bg-danger/10 blur-3xl rounded-full transition-opacity opacity-60 group-hover:opacity-100 pointer-events-none" />}

            <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-navy-400">{label}</span>
                {tooltip && <InfoTooltip info={tooltip} />}
            </div>
            <div className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight ${textColor} relative z-10 truncate`}>
                {value}
            </div>
        </div>
      );
  }

  return (
    <div className="bg-slate-50 dark:bg-glass-100 border border-slate-200 dark:border-glass-border p-3 rounded-xl backdrop-blur-sm hover:bg-white dark:hover:bg-glass-200 transition-colors shadow-sm dark:shadow-none">
      <div className="flex items-center space-x-2 mb-1">
        <span className="text-xs font-medium text-slate-500 dark:text-navy-400">{label}</span>
        {tooltip && <InfoTooltip info={tooltip} />}
      </div>
      <div>
        <span className={`text-lg font-bold ${textColor}`}>
            {value}
        </span>
      </div>
    </div>
  );
};

export default MetricDisplay;
