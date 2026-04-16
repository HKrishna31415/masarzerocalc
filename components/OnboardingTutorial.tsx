import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ChevronRightIcon, ChevronLeftIcon } from './icons';

interface OnboardingTutorialProps {
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
  image?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to MasarZero Economics Calculator",
    description: "A comprehensive financial modeling tool for vapor recovery systems. Let's take a quick tour of the key features.",
  },
  {
    title: "Quick Start with Presets",
    description: "Start with one of 17 pre-configured scenarios covering different regions and business models. Click 'Quick Presets' in the dashboard to explore options like Direct Sales, Leasing, or regional configurations.",
    target: "quick-presets-button"
  },
  {
    title: "Adjust Your Parameters",
    description: "Fine-tune your model using the input panel. Adjust volume, pricing, costs, and more. Changes update calculations in real-time.",
    target: "input-panel"
  },
  {
    title: "Analyze Your Results",
    description: "View comprehensive metrics including NPV, IRR, ROI, and payback period. Charts show cash flow, profitability, and break-even analysis.",
    target: "results-panel"
  },
  {
    title: "Advanced Analysis Tools",
    description: "Use the sidebar to access powerful tools: Sensitivity Analysis, Monte Carlo Simulation, Goal Seek, Scenario Comparison, and Lease Analysis.",
    target: "sidebar-nav"
  },
  {
    title: "Goal Seek",
    description: "Reverse engineer your model. Set a target (like 25% IRR) and let the calculator find the required input value (like gasoline price or lease term).",
  },
  {
    title: "Monte Carlo Simulation",
    description: "Test your model under uncertainty. Vary parameters randomly to see the probability distribution of outcomes and assess risk.",
  },
  {
    title: "Save & Compare Scenarios",
    description: "Save multiple scenarios and compare them side-by-side. Export data to CSV, JSON, or PDF for presentations.",
  },
  {
    title: "You're Ready!",
    description: "Start by loading a preset that matches your use case, then adjust parameters to fit your specific situation. Use the help icons (?) throughout the app for more guidance.",
  }
];

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/90 dark:bg-navy-950/95 backdrop-blur-md z-[100]"
            onClick={handleSkip}
          />

          {/* Tutorial Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-white dark:bg-navy-900 rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 border-2 border-primary/30"
          >
            {/* Close Button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:text-navy-400 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
              aria-label="Close tutorial"
            >
              <XIcon className="w-6 h-6" />
            </button>

            {/* Progress Indicator */}
            <div className="flex gap-2 mb-6">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    index <= currentStep
                      ? 'bg-primary'
                      : 'bg-slate-200 dark:bg-navy-800'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
                {step.title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-navy-300 leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-navy-400">
                Step {currentStep + 1} of {tutorialSteps.length}
              </div>

              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-white rounded-lg transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Previous
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-white rounded-lg transition-all font-bold shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  {currentStep < tutorialSteps.length - 1 ? (
                    <>
                      Next
                      <ChevronRightIcon className="w-4 h-4" />
                    </>
                  ) : (
                    "Get Started"
                  )}
                </button>
              </div>
            </div>

            {/* Skip Button */}
            {currentStep < tutorialSteps.length - 1 && (
              <button
                onClick={handleSkip}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-slate-400 hover:text-slate-600 dark:text-navy-500 dark:hover:text-navy-300 transition-colors focus:outline-none"
              >
                Skip tutorial
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTutorial;
