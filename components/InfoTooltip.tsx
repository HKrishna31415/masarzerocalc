
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { InfoIcon } from './icons';
import { TooltipInfo } from '../types';

interface InfoTooltipProps {
  info: TooltipInfo;
}

const InfoTooltip: React.FC<InfoTooltipProps> = ({ info }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);

  // Handle modal escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
        window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Handle hover positioning
  const updatePosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8, // Offset slightly above
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isHovered) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    updatePosition();
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsModalOpen(true);
      }
  };

  // Portal for the modal
  const modalPortal = isModalOpen ? ReactDOM.createPortal(
    <div 
      className={`tooltip-modal-overlay ${isModalOpen ? 'open' : ''}`}
      onClick={() => setIsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tooltip-modal-title"
    >
      <div 
        className="tooltip-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="tooltip-modal-title" className="text-xl font-bold text-slate-900 dark:text-white mb-2">{info.title}</h3>
        <div className="text-slate-600 dark:text-navy-200 text-sm leading-relaxed">{info.details}</div>
        <button 
            onClick={() => setIsModalOpen(false)}
            className="mt-6 bg-gradient-primary text-white font-bold py-2 px-4 rounded-lg w-full hover:brightness-110 transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-white dark:focus:ring-offset-navy-900"
            autoFocus
        >
            Close
        </button>
      </div>
    </div>,
    document.body
  ) : null;

  // Portal for the hover text (prevents clipping)
  const hoverPortal = isHovered && !isModalOpen ? ReactDOM.createPortal(
    <div 
        className="fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full"
        style={{ top: coords.top, left: coords.left }}
        role="tooltip"
    >
        <div className="bg-slate-800 dark:bg-navy-800 text-white dark:text-navy-200 text-xs font-medium rounded-md px-3 py-1.5 border border-slate-700 dark:border-navy-600 shadow-xl whitespace-nowrap mb-1">
             {info.shortText}
             {/* Tiny triangle pointer */}
             <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-slate-800 dark:border-t-navy-600"></div>
        </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div 
        ref={iconRef}
        className="group relative flex items-center inline-block ml-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-navy-950 rounded-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`More information about ${info.title}`}
      >
        <InfoIcon 
          className="w-4 h-4 text-slate-400 dark:text-navy-500 hover:text-primary-dark dark:hover:text-primary-light transition-colors cursor-pointer outline-none focus:text-primary-dark dark:focus:text-primary-light"
        />
      </div>
      {hoverPortal}
      {modalPortal}
    </>
  );
};

export default InfoTooltip;
