
import React, { useState } from 'react';
import { InputParams, CalculatedResults } from '../types';
import CashFlowChart from './CashFlowChart';
import ProfitWaterfallChart from './ProfitabilityChart';
import { LeafIcon, ShieldCheckIcon, TreeIcon, CalculatorIcon, ChevronDownIcon, ChevronUpIcon, SlidersIcon } from './icons';
import SliderInput from './SliderInput';

interface PresentationModeProps {
  inputs: InputParams;
  onParamChange: (key: keyof InputParams, value: string | number | boolean) => void;
  results: CalculatedResults;
  currency: string;
  onExit: () => void;
}

const formatCurrency = (val: number, currency: string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(val);

const formatPercent = (val: number) => `${val.toFixed(1)}%`;

const Slide: React.FC<{ children: React.ReactNode; isActive: boolean }> = ({ children, isActive }) => {
    return (
        <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${isActive ? 'opacity-100 translate-x-0 z-10 pointer-events-auto' : 'opacity-0 translate-x-12 z-0 pointer-events-none'}`}>
            {/* Scrollable Container covering full screen */}
            <div className="w-full h-full overflow-y-auto custom-scrollbar">
                {/* Centering Wrapper with Padding for Header/Footer clearance */}
                <div className="min-h-full w-full flex flex-col items-center justify-center py-24 px-4 md:px-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

const PresentationMode: React.FC<PresentationModeProps> = ({ inputs, onParamChange, results, currency, onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const totalSlides = 4;

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const { profitability, impact } = results;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-navy-950 flex flex-col text-slate-900 dark:text-white overflow-hidden">
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-navy-950/90 to-transparent backdrop-blur-sm pointer-events-none">
            <div className="flex items-center space-x-4 pointer-events-auto">
                <button onClick={onExit} className="bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-bold backdrop-blur-md transition-colors border border-slate-300 dark:border-white/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-navy-950">
                    Exit
                </button>
                <button 
                    onClick={() => setIsControlsOpen(!isControlsOpen)}
                    className={`p-2 rounded-lg transition-colors border border-white/5 focus:outline-none focus:ring-2 focus:ring-primary ${isControlsOpen ? 'bg-primary text-navy-950' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    <SlidersIcon className="w-5 h-5" />
                </button>
            </div>
            
            <div className="flex items-center space-x-2 pointer-events-auto">
                 <div className="flex space-x-1">
                     {Array.from({length: totalSlides}).map((_, i) => (
                         <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 md:w-8 bg-primary' : 'w-2 bg-white/20'}`} />
                     ))}
                 </div>
            </div>
        </div>

        {/* Quick Adjust Panel */}
        <div className={`absolute top-20 left-4 md:left-6 w-80 bg-navy-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl z-[60] transition-all duration-300 origin-top-left ${isControlsOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <SlidersIcon className="w-4 h-4 text-primary" />
                Quick Adjust
            </h3>
            <div className="space-y-6">
                <SliderInput 
                    label="Daily Volume"
                    value={inputs.avgGasolineSold}
                    min={1000} max={500000} step={1000}
                    unit={inputs.unitSystem === 'gallons' ? 'gal' : 'L'}
                    onChange={(val) => onParamChange('avgGasolineSold', val)}
                />
                <SliderInput 
                    label="Gasoline Price"
                    value={inputs.gasolinePrice}
                    min={0.1} max={5.0} step={0.01}
                    unit={currency}
                    isCurrency
                    onChange={(val) => onParamChange('gasolinePrice', val)}
                />
                <SliderInput 
                    label="Recovery Rate"
                    value={inputs.recoveryRate}
                    min={0} max={100} step={0.1}
                    unit="%"
                    onChange={(val) => onParamChange('recoveryRate', val)}
                />
            </div>
        </div>

        {/* Slides Container */}
        <div className="flex-1 relative w-full h-full max-w-7xl mx-auto">
            
            {/* Slide 1: The Executive Summary */}
            <Slide isActive={currentSlide === 0}>
                <div className="text-center space-y-6 md:space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
                    <div className="inline-flex items-center justify-center p-3 md:p-4 bg-white/5 rounded-2xl shadow-glow mb-2 md:mb-4 border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                        <img src="https://www.masarzero.com/masarzerologo.png" alt="MasarZero Logo" className="w-16 h-16 md:w-24 md:h-24 object-contain relative z-10 drop-shadow-glow" referrerPolicy="no-referrer" />
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-white leading-tight drop-shadow-sm">
                        Project Economics
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-navy-300 max-w-2xl mx-auto leading-relaxed">
                        A comprehensive analysis of profitability, environmental impact, and return on investment.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 w-full">
                        <div className="bg-glass-200 border border-glass-border p-6 md:p-8 rounded-2xl backdrop-blur-xl shadow-lg hover:shadow-glow transition-shadow duration-300">
                            <div className="text-navy-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-2">Net Profit</div>
                            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white">{formatCurrency(profitability.netProfit, currency)}</div>
                        </div>
                        <div className="bg-glass-200 border border-glass-border p-6 md:p-8 rounded-2xl backdrop-blur-xl shadow-lg hover:shadow-glow transition-shadow duration-300">
                             <div className="text-navy-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-2">ROI</div>
                            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-secondary-light">{formatPercent(profitability.roi)}</div>
                        </div>
                         <div className="bg-glass-200 border border-glass-border p-6 md:p-8 rounded-2xl backdrop-blur-xl shadow-lg hover:shadow-glow transition-shadow duration-300">
                             <div className="text-navy-400 text-xs md:text-sm font-bold uppercase tracking-widest mb-2">Payback Period</div>
                            <div className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-light">
                              {profitability.paybackPeriod < 0 
                                ? <span className="text-red-400">Never</span>
                                : <>{profitability.paybackPeriod.toFixed(1)} <span className="text-sm md:text-lg text-navy-400 font-medium">Years</span></>
                              }
                            </div>
                        </div>
                    </div>
                </div>
            </Slide>

            {/* Slide 2: Environmental Impact */}
            <Slide isActive={currentSlide === 1}>
                <div className="w-full max-w-5xl">
                    <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12 text-center">Environmental Impact</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
                        <div className="space-y-6 md:space-y-8">
                             <div className="bg-emerald-900/20 border border-emerald-500/30 p-6 md:p-8 rounded-3xl flex items-center space-x-4 md:space-x-6">
                                <div className="bg-emerald-500/20 p-4 md:p-5 rounded-full flex-shrink-0">
                                    <LeafIcon className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">{Math.round(impact.totalCo2Saved).toLocaleString()}</div>
                                    <div className="text-sm md:text-lg text-emerald-200 uppercase font-bold tracking-wider mt-1">Tonnes CO2 Saved</div>
                                </div>
                            </div>
                             <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-sm md:text-lg leading-relaxed text-navy-200">
                                    Over the <strong>{inputs.leaseTerm} year</strong> term, this project significantly reduces your carbon footprint, aligning with corporate sustainability goals (ESG) and generating <strong>{formatCurrency(results.revenue.carbonCreditRevenue, currency)}</strong> in potential carbon credit revenue.
                                </p>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 p-4 md:p-6 rounded-2xl flex items-center space-x-4">
                                <TreeIcon className="w-6 h-6 md:w-8 md:h-8 text-green-400 flex-shrink-0" />
                                <div>
                                    <div className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">{Math.round(impact.treesPlantedEquiv).toLocaleString()}</div>
                                    <div className="text-[10px] md:text-xs text-navy-400 uppercase">Trees Planted Equivalent</div>
                                </div>
                            </div>
                             <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 p-4 md:p-6 rounded-2xl flex items-center space-x-4">
                                <ShieldCheckIcon className="w-6 h-6 md:w-8 md:h-8 text-primary-light flex-shrink-0" />
                                <div>
                                    <div className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">{Math.round(impact.carsOffRoadEquiv).toLocaleString()}</div>
                                    <div className="text-[10px] md:text-xs text-navy-400 uppercase">Cars Taken Off Road</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Slide>

             {/* Slide 3: Financial Trajectory */}
             <Slide isActive={currentSlide === 2}>
                <div className="w-full flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Cumulative Cash Flow</h2>
                    <div className="w-full bg-white/50 dark:bg-navy-900/50 border border-slate-200 dark:border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl h-[300px] md:h-[400px]">
                        <CashFlowChart results={results} currency={currency} inputs={inputs} />
                    </div>
                    <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-8 text-center w-full">
                         <div>
                            <div className="text-navy-400 text-[10px] md:text-xs uppercase font-bold">Total Revenue</div>
                            <div className="text-sm md:text-2xl font-bold text-slate-900 dark:text-white truncate">{formatCurrency(results.revenue.totalRevenue, currency)}</div>
                        </div>
                         <div>
                            <div className="text-navy-400 text-[10px] md:text-xs uppercase font-bold">Total Costs</div>
                            <div className="text-sm md:text-2xl font-bold text-slate-900 dark:text-white truncate">{formatCurrency(results.costs.totalCosts, currency)}</div>
                        </div>
                         <div>
                            <div className="text-navy-400 text-[10px] md:text-xs uppercase font-bold">Net Present Value</div>
                            <div className="text-sm md:text-2xl font-bold text-primary-light truncate">{formatCurrency(profitability.npv, currency)}</div>
                        </div>
                    </div>
                </div>
            </Slide>

            {/* Slide 4: Closing */}
            <Slide isActive={currentSlide === 3}>
                 <div className="w-full max-w-4xl text-center">
                     <h2 className="text-2xl md:text-4xl font-bold mb-8 md:mb-12">Profit Waterfall</h2>
                     <div className="h-[300px] md:h-[400px] w-full mb-8 md:mb-12">
                         <ProfitWaterfallChart results={results} currency={currency} />
                     </div>
                     <div className="bg-gradient-to-r from-navy-900 to-navy-800 p-6 md:p-8 rounded-2xl border border-white/10">
                         <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 md:mb-4">Proposed Next Steps</h3>
                         <p className="text-sm md:text-base text-navy-300">
                             Based on the input parameters ({inputs.numberOfClients} clients, {inputs.unitsPerClient} units each), this project {profitability.paybackPeriod < 0 ? 'does not break even under current assumptions' : `achieves break-even in <strong>${profitability.paybackPeriod.toFixed(1)} years</strong>`}. We recommend {profitability.paybackPeriod < 0 ? 'reviewing the financial model and adjusting key parameters' : 'proceeding to the site survey phase to validate installation costs'}.
                         </p>
                     </div>
                 </div>
            </Slide>

        </div>

        {/* Footer Navigation */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex justify-between items-center z-50 bg-gradient-to-t from-navy-950/90 to-transparent pointer-events-none">
             <button 
                onClick={prevSlide}
                className={`flex items-center space-x-2 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors pointer-events-auto focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : ''}`}
             >
                 <ChevronDownIcon className="w-5 h-5 md:w-6 md:h-6 rotate-90" />
                 <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Previous</span>
             </button>

             <div className="text-navy-600 text-[10px] md:text-xs font-mono hidden md:block">
                 Use Arrow Keys to Navigate
             </div>

             <button 
                onClick={nextSlide}
                className={`flex items-center space-x-2 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors pointer-events-auto focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 ${currentSlide === totalSlides - 1 ? 'opacity-0 pointer-events-none' : ''}`}
             >
                 <span className="text-xs md:text-sm font-bold uppercase tracking-wider">Next</span>
                 <ChevronUpIcon className="w-5 h-5 md:w-6 md:h-6 rotate-90" />
             </button>
        </div>
    </div>
  );
};

export default PresentationMode;
