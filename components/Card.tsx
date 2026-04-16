import React from 'react';

interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ title, description, children, className = '', noPadding = false }) => {
  return (
    <div className={`bg-glass-200 backdrop-blur-xl border border-glass-border rounded-2xl shadow-glass overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="p-5 border-b border-glass-border bg-white/5">
          {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>}
          {description && <p className="text-xs text-slate-500 dark:text-navy-400 mt-1 font-medium">{description}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};

export default Card;