import React from 'react';
import InfoTooltip from './InfoTooltip';
import { TooltipInfo } from '../types';

interface ResultRowProps {
  label: string;
  value?: string;
  isHeader?: boolean;
  isSubtle?: boolean;
  highlight?: 'success' | 'danger' | 'secondary' | 'primary' | 'total-costs';
  tooltip?: TooltipInfo;
}

const ResultRow: React.FC<ResultRowProps> = ({ label, value, isHeader = false, isSubtle = false, highlight, tooltip }) => {
  const highlightClasses = {
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    secondary: 'bg-secondary-dark text-white',
    primary: 'bg-primary-darker text-white',
    'total-costs': 'bg-danger-dark text-danger',
  };
  
  const valueClasses = `font-semibold text-slate-900 dark:text-white ${
    highlight ? `px-2 py-1 rounded-md ${highlightClasses[highlight]}` : ''
  }`;

  if (isHeader) {
    return (
      <div className="py-3 px-4 bg-slate-100 dark:bg-white/5 rounded-t-lg">
        <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{label}</h4>
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-center py-3 px-4 ${isSubtle ? 'text-slate-500 dark:text-navy-400' : 'text-slate-700 dark:text-navy-100'} border-b border-slate-200 dark:border-white/10 last:border-b-0`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm">{label}</span>
        {tooltip && <InfoTooltip info={tooltip} />}
      </div>
      <span className={valueClasses}>{value}</span>
    </div>
  );
};

export default ResultRow;
