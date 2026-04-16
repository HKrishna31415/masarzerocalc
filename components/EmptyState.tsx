import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {icon && (
        <div className="mb-4 text-slate-300 dark:text-navy-600 opacity-50">
          {icon}
        </div>
      )}
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-navy-400 mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <motion.button
          onClick={action.onClick}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
