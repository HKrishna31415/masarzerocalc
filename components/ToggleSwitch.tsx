
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700 dark:text-navy-200" id={`switch-label-${label.replace(/\s+/g, '-')}`}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={`switch-label-${label.replace(/\s+/g, '-')}`}
        className={`${
          enabled ? 'bg-gradient-primary' : 'bg-slate-300 dark:bg-navy-700'
        } relative inline-flex items-center h-6 rounded-full w-11 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-navy-950 focus:ring-primary border border-transparent`}
        onClick={() => onChange(!enabled)}
      >
        <span className="sr-only">{enabled ? 'Enabled' : 'Disabled'}</span>
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
