import React from 'react';

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options }) => {
  const inputId = `select-input-${label.replace(/\s+/g, '-')}`;
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={inputId} className="text-xs sm:text-sm font-medium text-slate-500 dark:text-navy-200 flex-shrink-0">{label}</label>
      <div className="relative">
        <select
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/20 rounded-md py-2.5 pl-3 pr-8 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition shadow-sm min-h-[44px]"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-navy-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectInput;