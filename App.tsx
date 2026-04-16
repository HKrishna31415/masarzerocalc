
import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { InputParams, CalculatedResults } from './types';
import Sidebar from './components/Sidebar';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import { useVaporRecoveryCalculator } from './hooks/useVaporRecoveryCalculator';
import { useHistory } from './hooks/useHistory';
import FAB from './components/FAB';
import Assumptions from './components/Assumptions';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import ScenarioManager from './components/ScenarioManager';
import LeaseAnalysis from './components/LeaseAnalysis';
import MonteCarloAnalysis from './components/MonteCarloAnalysis';
import ScenarioComparison from './components/ScenarioComparison';
import GoalSeekAnalysis from './components/GoalSeekAnalysis';
import ImpactAnalysis from './components/ImpactAnalysis';
import PresentationMode from './components/PresentationMode';
import DataExportHub from './components/DataExportHub';
import QuickPresets from './components/QuickPresets';
import { EXCHANGE_RATES, MONETARY_PARAMS } from './utils/sensitivityConfig';
import { OnboardingTour } from './components/OnboardingTour';
import { DEFAULT_PARAMS } from './utils/presets';
import { MenuIcon, CalculatorIcon, UndoIcon, RedoIcon, DocumentDownloadIcon } from './components/icons';

type ActivePage = 'model' | 'assumptions' | 'sensitivity' | 'scenarios' | 'lease-analysis' | 'monte-carlo' | 'comparison' | 'goal-seek' | 'impact' | 'presentation';

const App: React.FC = () => {
  // Use history hook for undo/redo
  const {
    state: inputParams,
    set: setInputParams,
    undo,
    redo,
    canUndo,
    canRedo,
    historySize,
  } = useHistory<InputParams>(DEFAULT_PARAMS);
  
  const [currency, setCurrency] = useState('USD');
  const [activePage, setActivePage] = useState<ActivePage>('model');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showExportHub, setShowExportHub] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z (Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y (Cmd+Shift+Z or Cmd+Y on Mac)
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) redo();
      }
      // Export: Ctrl+E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportHub(true);
      }
      // Save Scenario: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setActivePage('scenarios');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // Check for onboarding status on mount
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('vapor_calc_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    
    // Initialize Dark Mode
    if (localStorage.getItem('theme') === 'light') {
        setDarkMode(false);
        document.documentElement.classList.remove('dark');
    } else {
        setDarkMode(true);
        document.documentElement.classList.add('dark');
    }

    // Check URL Hash for config loading
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
        try {
            const encoded = hash.split('=')[1];
            const decoded = atob(encoded);
            const data = JSON.parse(decoded);
            if (data.params) setInputParams(data.params);
            if (data.currency) setCurrency(data.currency);
            
            // Clear hash after loading to clean up URL
            window.history.replaceState(null, '', window.location.pathname);
        } catch (e) {
            console.error("Failed to load config from URL", e);
        }
    }
  }, []);

  const toggleDarkMode = () => {
      setDarkMode(prev => {
          const newVal = !prev;
          if (newVal) {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
          } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
          }
          return newVal;
      });
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('vapor_calc_onboarding_seen', 'true');
  };

  const calculatedResults: CalculatedResults = useVaporRecoveryCalculator(inputParams);
  
  const handleInputChange = useCallback((key: keyof InputParams, value: string | number | boolean) => {
    setInputParams({ ...inputParams, [key]: value });
  }, [inputParams, setInputParams]);

  const handleApplyPreset = useCallback((presetParams: Partial<InputParams>) => {
    setInputParams({ ...inputParams, ...presetParams });
  }, [inputParams, setInputParams]);

  const handleCurrencyChange = (newCurrency: string) => {
    const oldRate = EXCHANGE_RATES[currency];
    const newRate = EXCHANGE_RATES[newCurrency];
    if (!oldRate || !newRate) return;
    const conversionFactor = newRate / oldRate;

    const newParams = { ...inputParams };
    MONETARY_PARAMS.forEach(key => {
      const currentValue = newParams[key] as number;
      if (typeof currentValue === 'number') {
        (newParams[key] as number) = parseFloat((currentValue * conversionFactor).toFixed(4));
      }
    });
    setInputParams(newParams);
    setCurrency(newCurrency);
  };

  const handleUnitSystemToggle = () => {
    const LITER_PER_GALLON = 3.78541;
    const isGallons = inputParams.unitSystem === 'gallons';
    const newUnitSystem = isGallons ? 'liters' : 'gallons';
    
    const newAvgGasolineSold = isGallons
      ? inputParams.avgGasolineSold * LITER_PER_GALLON
      : inputParams.avgGasolineSold / LITER_PER_GALLON;

    const newGasolinePrice = isGallons
      ? inputParams.gasolinePrice / LITER_PER_GALLON
      : inputParams.gasolinePrice * LITER_PER_GALLON;

    setInputParams({
      ...inputParams,
      unitSystem: newUnitSystem,
      avgGasolineSold: parseFloat(newAvgGasolineSold.toFixed(2)),
      gasolinePrice: parseFloat(newGasolinePrice.toFixed(2)),
    });
  };

  const handleNavigate = (page: ActivePage) => {
    setActivePage(page);
    setIsSidebarOpen(false); // Close sidebar on nav (mobile)
  };

  const handleLoadScenario = (params: InputParams) => {
    setInputParams(params);
    setActivePage('model');
  };

  const renderPage = () => {
    // Special full-screen mode for presentation
    if (activePage === 'presentation') {
        return <PresentationMode inputs={inputParams} onParamChange={handleInputChange} results={calculatedResults} currency={currency} onExit={() => setActivePage('model')} />;
    }

    switch (activePage) {
      case 'model':
        return (
          // Fixed Layout for Model Dashboard - both panels scroll independently
          <div className="flex flex-col lg:flex-row w-full h-full min-h-0">
            {/* Left Panel - Input */}
            <div className="w-full lg:w-[340px] xl:w-[380px] bg-slate-100 dark:bg-navy-950/50 border-r border-slate-200 dark:border-white/5 flex-shrink-0 p-4 lg:p-6 overflow-y-auto transition-colors duration-300 space-y-4">
              {/* Quick Presets */}
              <QuickPresets onApplyPreset={handleApplyPreset} currentParams={inputParams} />
              
              {/* Undo/Redo Controls */}
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-slate-200 dark:border-white/10 transition-all text-xs font-bold text-slate-700 dark:text-white"
                  title="Undo (Ctrl+Z)"
                >
                  <UndoIcon className="w-4 h-4" />
                  <span>Undo</span>
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg border border-slate-200 dark:border-white/10 transition-all text-xs font-bold text-slate-700 dark:text-white"
                  title="Redo (Ctrl+Y)"
                >
                  <RedoIcon className="w-4 h-4" />
                  <span>Redo</span>
                </button>
                <button
                  onClick={() => setShowExportHub(true)}
                  className="px-3 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg transition-all text-xs font-bold shadow-lg flex items-center justify-center"
                  title="Export Data (Ctrl+E)"
                >
                  <DocumentDownloadIcon className="w-4 h-4" />
                </button>
              </div>
              
              {historySize > 0 && (
                <div className="text-[10px] text-slate-500 dark:text-navy-500 text-center">
                  {historySize} change{historySize !== 1 ? 's' : ''} in history
                </div>
              )}
              
              <InputPanel 
                params={inputParams} 
                onParamChange={handleInputChange} 
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            </div>
            
            {/* Right Panel - Results, scrolls independently */}
            <div className="w-full flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 relative">
              <ResultsPanel results={calculatedResults} inputs={inputParams} currency={currency} darkMode={darkMode} onNavigate={handleNavigate} />
            </div>
          </div>
        );
      case 'assumptions':
        return <Assumptions params={inputParams} onParamChange={handleInputChange} currency={currency} />;
      case 'sensitivity':
        return <SensitivityAnalysis baseParams={inputParams} onBaseParamChange={handleInputChange} currency={currency} />;
      case 'scenarios':
        return <ScenarioManager currentParams={inputParams} onLoad={handleLoadScenario} />;
      case 'lease-analysis':
        return <LeaseAnalysis globalParams={inputParams} currency={currency} />;
      case 'monte-carlo':
        return <MonteCarloAnalysis baseParams={inputParams} currency={currency} />;
      case 'comparison':
        return <ScenarioComparison currentParams={inputParams} currency={currency} />;
      case 'goal-seek':
        return <GoalSeekAnalysis currentParams={inputParams} onUpdateParams={setInputParams} currency={currency} onNavigate={handleNavigate} />;
      case 'impact':
        return <ImpactAnalysis results={calculatedResults} inputs={inputParams} currency={currency} />;
      default:
        return null;
    }
  }

  return (
    // Outer container: h-screen fixed to viewport. 
    <div className="flex h-screen w-full bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-navy-200 font-sans overflow-hidden print:bg-white print:text-black">
      <OnboardingTour isOpen={showOnboarding} onClose={handleCloseOnboarding} />
      
      {/* Hide Sidebar in Presentation Mode or Print Mode */}
      {activePage !== 'presentation' && (
        <div className="print:hidden h-full flex w-full">
            <Sidebar activePage={activePage} onNavigate={handleNavigate} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            {/* Main Content Area */}
            <main className="flex-1 h-full flex flex-col relative bg-slate-50 dark:bg-[#020617] dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-primary/5 dark:via-[#020617] dark:to-[#020617] overflow-hidden transition-colors duration-300">
                {/* Mobile Header - Sticky */}
                <div className="lg:hidden sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-navy-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-navy-950/60">
                    <button aria-label="Open menu" onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-700 dark:text-white -ml-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-navy-950 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="https://www.masarzero.com/masarzerologo.png" alt="MasarZero Logo" className="h-8 w-auto object-contain drop-shadow-glow animate-pulse-glow" referrerPolicy="no-referrer" />
                    </div>
                    <div className="w-8"></div> {/* Spacer */}
                </div>

                <div className="flex-1 w-full relative h-full">
                    {renderPage()}
                </div>
            </main>
        </div>
      )}

      {/* Render Presentation Mode directly if active (it handles its own layout) */}
      {activePage === 'presentation' && renderPage()}
      
      {activePage === 'model' && <FAB unitSystem={inputParams.unitSystem} onToggle={handleUnitSystemToggle} />}

      {/* Data Export Hub */}
      <DataExportHub 
        isOpen={showExportHub}
        onClose={() => setShowExportHub(false)}
        results={calculatedResults}
        inputs={inputParams}
        currency={currency}
      />

      {/* --- PROFESSIONAL PRINT / PDF REPORT LAYOUT --- */}
      <div className="hidden print:block min-h-screen bg-white text-slate-900 p-10 font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b-4 border-primary pb-6 mb-8">
              <div className="flex items-center gap-3">
                   <img src="https://www.masarzero.com/masarzerologo.png" alt="MasarZero Logo" className="h-16 w-auto object-contain print-color-adjust animate-pulse-glow" referrerPolicy="no-referrer" />
              </div>
              <div className="text-right">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Date Generated</div>
                  <div className="text-xl font-bold text-slate-900">{new Date().toLocaleDateString()}</div>
              </div>
          </div>

          {/* Executive Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 print-color-adjust shadow-sm">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Net Profit (Lifetime)</div>
                  <div className="text-4xl font-black text-primary-dark">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(calculatedResults.profitability.netProfit)}</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 print-color-adjust shadow-sm">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Return on Investment</div>
                  <div className="text-4xl font-black text-primary">{calculatedResults.profitability.roi.toFixed(1)}%</div>
              </div>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 print-color-adjust shadow-sm">
                  <div className="text-xs text-slate-500 uppercase font-bold mb-2 tracking-wide">Payback Period</div>
                  <div className="text-4xl font-black text-slate-800">
                    {calculatedResults.profitability.paybackPeriod < 0 
                      ? <span className="text-red-600">Never</span>
                      : <>{calculatedResults.profitability.paybackPeriod.toFixed(1)} <span className="text-xl font-medium text-slate-400">Years</span></>
                    }
                  </div>
              </div>
          </div>

          {/* Configuration Summary */}
          <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 uppercase tracking-wide">Project Configuration</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Business Model</span>
                      <span className="font-bold">{inputParams.businessModel}</span>
                  </div>
                   <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Lease Term</span>
                      <span className="font-bold">{inputParams.leaseTerm} Years</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Total Units</span>
                      <span className="font-bold">{inputParams.unitsPerClient * inputParams.numberOfClients}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Daily Volume</span>
                      <span className="font-bold">{inputParams.avgGasolineSold.toLocaleString()} {inputParams.unitSystem === 'gallons' ? 'gal' : 'L'}/day</span>
                  </div>
                   <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Gasoline Price</span>
                      <span className="font-bold">{new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(inputParams.gasolinePrice)}</span>
                  </div>
                   <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-500">Recovery Rate</span>
                      <span className="font-bold">{inputParams.recoveryRate}%</span>
                  </div>
              </div>
          </div>

          {/* Cash Flow Table */}
          <div className="mb-10 page-break-inside-avoid">
               <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 uppercase tracking-wide">Financial Projection (Year 1-5)</h2>
               <table className="w-full text-sm text-left border-collapse">
                  <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                          <th className="py-2 px-3 font-bold text-slate-600">Year</th>
                          <th className="py-2 px-3 font-bold text-slate-600 text-right">Revenue</th>
                          <th className="py-2 px-3 font-bold text-slate-600 text-right">Costs</th>
                          <th className="py-2 px-3 font-bold text-slate-600 text-right">Net Cash Flow</th>
                          <th className="py-2 px-3 font-bold text-slate-600 text-right">Cumulative</th>
                      </tr>
                  </thead>
                  <tbody>
                      {calculatedResults.cashFlow.slice(0, 6).map((cf, idx) => {
                          const cumulative = calculatedResults.cashFlow.slice(0, idx + 1).reduce((a, b) => a + b, 0);
                          return (
                            <tr key={idx} className="border-b border-slate-100">
                                <td className="py-2 px-3 font-medium">{idx}</td>
                                <td className="py-2 px-3 text-right text-slate-500">-</td>
                                <td className="py-2 px-3 text-right text-slate-500">-</td>
                                <td className={`py-2 px-3 text-right font-bold ${cf >= 0 ? 'text-teal-600' : 'text-red-500'}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cf)}
                                </td>
                                 <td className={`py-2 px-3 text-right font-mono ${cumulative >= 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cumulative)}
                                </td>
                            </tr>
                          );
                      })}
                  </tbody>
              </table>
              <div className="mt-2 text-xs text-slate-400 italic text-center">Full ledger available in digital export.</div>
          </div>

          {/* Impact Section */}
          <div className="border-t-2 border-slate-100 pt-8 mt-auto">
               <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100 print-color-adjust">
                   <div className="text-3xl">🌱</div>
                   <div>
                       <div className="text-emerald-800 font-bold text-lg">Environmental Impact</div>
                       <div className="text-emerald-600 text-sm">
                           This project will prevent <strong className="text-emerald-800">{Math.round(calculatedResults.impact.totalCo2Saved).toLocaleString()} tonnes</strong> of CO2 emissions, 
                           equivalent to planting <strong className="text-emerald-800">{Math.round(calculatedResults.impact.treesPlantedEquiv).toLocaleString()} trees</strong>.
                       </div>
                   </div>
               </div>
          </div>

          <div className="mt-12 text-center text-xs text-slate-300">
              Generated by Economics Engine • Confidential
          </div>
      </div>
    </div>
  );
};

export default App;
