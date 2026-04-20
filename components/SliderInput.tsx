
import React from 'react';

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  description?: string;
  darkMode?: boolean;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step, onChange, unit = '', description, darkMode = true }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Teal Gradient: Teal-500 (#14B8A6) to Teal-900 (#134E4A) range
  const sliderStyle = {
    background: darkMode 
      ? `linear-gradient(to right, #14B8A6 0%, #115E59 ${percentage}%, rgba(51, 65, 85, 0.5) ${percentage}%, rgba(51, 65, 85, 0.5) 100%)`
      : `linear-gradient(to right, #0D9488 0%, #0F766E ${percentage}%, rgba(203, 213, 225, 0.8) ${percentage}%, rgba(203, 213, 225, 0.8) 100%)`
  };

  const inputId = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="group relative">
      <div className="flex justify-between items-center mb-3">
        <label htmlFor={inputId} className="text-[10px] font-bold text-slate-500 dark:text-navy-300 uppercase tracking-wider">
            {label}
        </label>
        
        {/* Editable Number Input */}
        <div className="flex items-center bg-teal-50 dark:bg-primary-dim rounded border border-teal-200 dark:border-primary/20 shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all duration-200">
            <input
                id={`${inputId}-number`}
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="w-16 bg-transparent text-xs font-bold text-teal-700 dark:text-primary-light text-right outline-none py-1 px-1 appearance-none m-0"
                step={step}
                aria-label={`${label} value`}
            />
             <span className="text-[10px] text-teal-700 dark:text-primary-light font-bold pr-2">{unit}</span>
        </div>
      </div>
      <div className="relative h-7 flex items-center">
        <input
            id={inputId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={sliderStyle}
            className={`w-full h-2 rounded-full appearance-none cursor-pointer slider-thumb transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-navy-900 slider-thumb-dark' : 'focus:ring-offset-white slider-thumb-light'}`}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={`${value} ${unit}`}
            aria-label={label}
        />
      </div>
      {description && <p className="text-[10px] text-slate-500 dark:text-navy-400 mt-1 opacity-70 group-hover:opacity-100 transition-opacity duration-200">{description}</p>}
      
      <style>{`
        /* Chrome/Safari/Edge */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        /* Firefox */
        input[type=number] {
            -moz-appearance: textfield;
        }

        .slider-thumb-dark::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #020617;
          border: 2px solid #14B8A6; /* Teal-500 */
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(20, 184, 166, 0.6), inset 0 0 4px rgba(20, 184, 166, 0.4);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .slider-thumb-dark::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            background: #14B8A6;
            box-shadow: 0 0 15px rgba(20, 184, 166, 0.8);
        }
        .slider-thumb-dark::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #020617;
          border: 2px solid #14B8A6;
          border-radius: 50%;
          cursor: pointer;
           box-shadow: 0 0 10px rgba(20, 184, 166, 0.6);
           transition: all 0.2s;
        }
        .slider-thumb-dark::-moz-range-thumb:hover {
             transform: scale(1.2);
             background: #14B8A6;
        }

        .slider-thumb-light::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border: 2px solid #0D9488; /* Teal-600 */
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 0 2px rgba(13, 148, 136, 0.2);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .slider-thumb-light::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            background: #0D9488;
            box-shadow: 0 2px 5px rgba(13, 148, 136, 0.4);
        }
        .slider-thumb-light::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #ffffff;
          border: 2px solid #0D9488;
          border-radius: 50%;
          cursor: pointer;
           box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
           transition: all 0.2s;
        }
        .slider-thumb-light::-moz-range-thumb:hover {
             transform: scale(1.2);
             background: #0D9488;
        }
      `}</style>
    </div>
  );
};

export default SliderInput;
