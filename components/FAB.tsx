
import React from 'react';

interface FABProps {
  unitSystem: 'gallons' | 'liters';
  onToggle: () => void;
}

const FAB: React.FC<FABProps> = ({ unitSystem, onToggle }) => {
  const isGallons = unitSystem === 'gallons';
  const text = isGallons ? 'GAL' : 'LTR';
  const label = `Switch to ${isGallons ? 'Liters' : 'Gallons'}`;
  
  return (
    <button
      id="unit-toggle-fab"
      onClick={onToggle}
      className="fixed bottom-6 right-6 bg-gradient-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 hover:shadow-glow hover:brightness-110 transition-all duration-200 ease-in-out font-black text-lg z-30 border border-white/10 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
      aria-label={label}
    >
      {text}
    </button>
  );
};

export default FAB;
