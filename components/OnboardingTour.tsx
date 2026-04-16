
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Step {
  target: string;
  title: string;
  content: string;
  preferredPosition: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps: Step[] = [
  {
    target: 'body',
    title: 'Welcome to the Economics Engine',
    content: 'We have updated the tool with advanced financial capabilities including SaaS modeling, Monte Carlo simulations, and Comparison tools.',
    preferredPosition: 'bottom'
  },
  {
    target: '#smart-presets-select',
    title: 'Smart Presets',
    content: 'Start quickly by selecting a pre-configured business scenario like "SaaS + Hardware" or "Leveraged Buyout".',
    preferredPosition: 'right'
  },
  {
    target: '#input-panel-container',
    title: 'Input Parameters',
    content: 'Fine-tune every aspect of your model here. We added new sections for Monthly Fees (SaaS) and Project Finance (Debt/Tax).',
    preferredPosition: 'right'
  },
  {
    target: '#nav-item-comparison',
    title: 'Scenario Comparison',
    content: 'Navigate here to compare your current model against a baseline or another saved scenario side-by-side.',
    preferredPosition: 'right'
  },
  {
    target: '#nav-item-monte-carlo',
    title: 'Monte Carlo Simulation',
    content: 'Run 1000+ iterations to understand the probability of success and risk profile of your project.',
    preferredPosition: 'right'
  },
  {
    target: '#hero-metrics',
    title: 'Key Financial Metrics',
    content: 'Instant view of Net Profit, ROI, and NPV. These update in real-time as you adjust inputs.',
    preferredPosition: 'bottom'
  },
  {
    target: '#charts-container',
    title: 'Interactive Visualization',
    content: 'Analyze Profit Waterfalls, Cash Flows, and Revenue Breakdowns. Use the tabs to view the Detailed Ledger.',
    preferredPosition: 'top'
  },
  {
    target: '#executive-report-btn',
    title: 'Executive Report',
    content: 'Ready to share? Generate a professional PDF summary of your current model and results.',
    preferredPosition: 'left'
  },
  {
    target: '#unit-toggle-fab',
    title: 'Unit Conversion',
    content: 'Toggle between Gallons and Liters globally with one click.',
    preferredPosition: 'left'
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [rect, setRect] = useState<DOMRect | null>(null);

  const calculatePosition = useCallback(() => {
    const step = steps[currentStep];
    if (step.target === 'body') {
      setRect(null);
      setTooltipStyle({
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'fixed'
      });
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const newRect = element.getBoundingClientRect();
      setRect(newRect);

      // Smart Positioning Logic
      const TOOLTIP_WIDTH = 320; 
      const TOOLTIP_HEIGHT = 200; // Estimated height including padding/arrows
      const GAP = 16;
      const VIEWPORT_WIDTH = window.innerWidth;
      const VIEWPORT_HEIGHT = window.innerHeight;

      // Helper to check if a position fits
      const checkFit = (pos: string): boolean => {
        switch (pos) {
          case 'right': return newRect.right + TOOLTIP_WIDTH + GAP <= VIEWPORT_WIDTH;
          case 'left': return newRect.left - TOOLTIP_WIDTH - GAP >= 0;
          case 'bottom': return newRect.bottom + TOOLTIP_HEIGHT + GAP <= VIEWPORT_HEIGHT;
          case 'top': return newRect.top - TOOLTIP_HEIGHT - GAP >= 0;
          default: return false;
        }
      };

      let pos = step.preferredPosition;
      
      // Auto-flip logic
      if (!checkFit(pos)) {
        if (pos === 'left' || pos === 'right') {
          // Try opposite side first, then bottom, then top
          if (checkFit(pos === 'left' ? 'right' : 'left')) pos = pos === 'left' ? 'right' : 'left';
          else if (checkFit('bottom')) pos = 'bottom';
          else if (checkFit('top')) pos = 'top';
        } else {
          // Try opposite side first, then right, then left
          if (checkFit(pos === 'top' ? 'bottom' : 'top')) pos = pos === 'top' ? 'bottom' : 'top';
          else if (checkFit('right')) pos = 'right';
          else if (checkFit('left')) pos = 'left';
        }
      }

      // Final fallback if nothing fits cleanly: clamp to screen inside the safest side (usually bottom or top)
      if (!checkFit(pos)) {
          // If we are here, screen is likely too small. Default to bottom or top depending on vertical space
          if (newRect.top > VIEWPORT_HEIGHT / 2) pos = 'top';
          else pos = 'bottom';
      }

      let style: React.CSSProperties = { position: 'fixed', zIndex: 110 };

      const getHorizontalCenter = () => Math.min(Math.max(GAP, newRect.left + (newRect.width/2) - (TOOLTIP_WIDTH/2)), VIEWPORT_WIDTH - TOOLTIP_WIDTH - GAP);

      switch (pos) {
        case 'right':
          style.top = Math.min(Math.max(GAP, newRect.top), VIEWPORT_HEIGHT - TOOLTIP_HEIGHT - GAP);
          style.left = newRect.right + GAP;
          break;
        case 'left':
          style.top = Math.min(Math.max(GAP, newRect.top), VIEWPORT_HEIGHT - TOOLTIP_HEIGHT - GAP);
          style.left = newRect.left - TOOLTIP_WIDTH - GAP;
          break;
        case 'bottom':
          style.top = newRect.bottom + GAP;
          style.left = getHorizontalCenter();
          break;
        case 'top':
          style.top = newRect.top - GAP; 
          style.transform = 'translateY(-100%)';
          style.left = getHorizontalCenter();
          break;
      }
      
      setTooltipStyle(style);
      
      // Smooth scroll to target if it's way off screen
      const isVisible = (
         newRect.top >= 0 &&
         newRect.left >= 0 &&
         newRect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
         newRect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (!isVisible) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    } else {
        // Fallback if element not found (e.g. mobile hidden sidebar)
        setRect(null);
        setTooltipStyle({
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'fixed'
        });
    }
  }, [currentStep]);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow DOM updates or transitions to settle before measuring
      const timer = setTimeout(calculatePosition, 100);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, { capture: true }); // Capture needed for nested scrolling
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, { capture: true });
      };
    }
  }, [isOpen, currentStep, calculatePosition]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  // Determine if we are in "spotlight" mode (element exists) or "modal" mode (center screen)
  const isTargetVisible = step.target !== 'body' && document.querySelector(step.target);

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Dimmed Overlay - pointer events auto to block clicks behind */}
      <div className="absolute inset-0 bg-navy-950/60 pointer-events-auto transition-opacity duration-300" onClick={onClose} />
      
      {/* Spotlight Cutout Effect */}
      {isTargetVisible && rect && (
        <div 
          className="absolute transition-all duration-300 ease-out rounded-xl border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(2,6,23,0.85),0_0_15px_rgba(5,150,105,0.3)] box-content pointer-events-none"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}
      
      {/* Tooltip Card - pointer events auto to allow interaction */}
      <div 
        className="pointer-events-auto transition-all duration-300 ease-out w-[320px] max-w-[90vw]"
        style={tooltipStyle}
      >
        <div className="bg-glass-200 border border-glass-border backdrop-blur-xl p-6 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-bold text-primary-light tracking-widest uppercase">
                Step {currentStep + 1} / {steps.length}
            </span>
            <button onClick={handleSkip} className="text-navy-400 hover:text-white text-[10px] font-bold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">
              Skip
            </button>
          </div>
          
          {currentStep === 0 && (
              <div className="flex justify-center mb-4">
                  <img src="https://www.masarzero.com/masarzerologo.png" alt="MasarZero Logo" className="h-12 w-auto object-contain" referrerPolicy="no-referrer" />
              </div>
          )}
          
          <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
          <p className="text-navy-200 text-sm leading-relaxed mb-6">
            {step.content}
          </p>

          <div className="flex justify-between items-center">
            <div className="flex space-x-1.5">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep ? 'w-6 bg-gradient-primary' : 'w-1.5 bg-navy-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="bg-gradient-primary hover:brightness-110 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-glow transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950 animate-pulse-primary"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
