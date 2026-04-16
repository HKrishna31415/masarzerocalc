import React from 'react';

interface SegmentedControlProps {
  options: string[];
  selected: string;
  setSelected: (option: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ options, selected, setSelected }) => {
  const selectedIndex = options.indexOf(selected);
  
  return (
    <div className="relative flex w-full p-1 bg-slate-200 dark:bg-navy-900 rounded-lg">
      <div
        className="absolute top-1 left-1 h-[calc(100%-8px)] bg-white dark:bg-navy-800 border border-slate-300 dark:border-white/20 rounded-md shadow-lg transition-transform duration-300 ease-in-out"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setSelected(option)}
          className={`relative z-10 w-full py-2 text-sm font-semibold transition-colors duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-900
            ${selected === option ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-navy-400 hover:text-slate-700 dark:hover:text-white'}`}
        >
          <span className="block">{option}</span>
          <span className="block text-xs font-normal">
            {option === 'Direct Sales' ? 'One Time Purchase' : 'Revenue Sharing'}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SegmentedControl;