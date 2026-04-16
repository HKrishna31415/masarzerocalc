import React, { useState, useRef, useEffect } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from './icons';

interface DropdownProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

const Dropdown = <T extends string>({ options, value, onChange, label, className = '' }: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const id = React.useId();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-navy-200 mb-2">{label}</label>}
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/20 rounded-md py-2 px-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition flex items-center justify-between shadow-sm"
      >
        <span className="text-sm font-medium">{selectedOption?.label}</span>
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-400 dark:text-navy-400" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400 dark:text-navy-400" />}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-card border border-slate-200 dark:border-white/20 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === option.value
                    ? 'bg-primary/10 text-primary-dark dark:text-primary'
                    : 'text-slate-700 dark:text-navy-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
