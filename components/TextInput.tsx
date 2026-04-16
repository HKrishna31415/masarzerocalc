
import React, { useState, useEffect } from 'react';

interface TextInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, unit, description }) => {
  const [displayValue, setDisplayValue] = useState(new Intl.NumberFormat().format(value));

  const inputId = `text-input-${label.replace(/\s+/g, '-')}`;

  useEffect(() => {
    if (document.activeElement?.id !== inputId) {
      setDisplayValue(new Intl.NumberFormat().format(value));
    }
  }, [value, inputId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits, commas, and one decimal point
    const val = e.target.value;
    if (/^[\d,]*\.?[\d]*$/.test(val)) {
        setDisplayValue(val);
    }
  };

  const handleBlur = () => {
    const sanitizedValue = displayValue.replace(/,/g, '');
    let numericValue = parseFloat(sanitizedValue);
    
    if (isNaN(numericValue)) {
      numericValue = 0;
    }
    
    onChange(numericValue);
    setDisplayValue(new Intl.NumberFormat().format(numericValue));
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Remove formatting on focus for easier editing
    setDisplayValue(String(value));
    e.target.select();
  }

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">{label}</label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode="decimal" // Critical for Mobile UX
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/20 rounded-md py-2 px-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition font-mono text-right shadow-sm"
        />
        {unit && <span className="absolute inset-y-0 left-3 flex items-center text-sm text-slate-400 dark:text-navy-500 pointer-events-none">{unit}</span>}
      </div>
      {description && <p className="text-xs text-slate-500 dark:text-navy-400 mt-2">{description}</p>}
    </div>
  );
};

export default TextInput;
