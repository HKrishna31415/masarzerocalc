
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InputParams, CalculatedResults } from '../types';
import { calculateVaporRecovery } from '../utils/calculator';
import Card from './Card';
import { AdjustmentsIcon, CheckIcon, XIcon } from './icons';
import { LangContext } from '../utils/langContext';

interface GoalSeekAnalysisProps {
  currentParams: InputParams;
  onUpdateParams: (params: InputParams) => void;
  currency: string;
  onNavigate?: (page: string) => void;
}

type GoalMetric = 'irr' | 'npv' | 'netProfit' | 'roi';
type AdjustableVariable = 'gasolinePrice' | 'companyRevenueShare' | 'avgGasolineSold' | 'unitSalePrice' | 'installationMargin' | 'unitCost' | 'annualMaintenanceCost' | 'leaseTerm' | 'recoveryRate' | 'electricityPrice' | 'volumeGrowthRate';

const GoalSeekAnalysis: React.FC<GoalSeekAnalysisProps> = ({ currentParams, onUpdateParams, currency, onNavigate }) => {
  const { t } = React.useContext(LangContext);
  const [targetMetric, setTargetMetric] = useState<GoalMetric>('irr');
  const [targetValue, setTargetValue] = useState<number>(25); // Default target 25% IRR
  const [adjustableVariable, setAdjustableVariable] = useState<AdjustableVariable>('gasolinePrice');
  const [isSolving, setIsSolving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ found: boolean, value: number, steps: number } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const formatTargetValue = (val: number) => {
      if (targetMetric === 'irr' || targetMetric === 'roi') return val + '%';
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(val);
  };

  const getMetricValue = (res: CalculatedResults, metric: GoalMetric) => {
      return res.profitability[metric];
  };

  const solve = () => {
      setIsSolving(true);
      setResult(null);
      setProgress(0);

      // Wrap in setTimeout to allow UI to render the "Solving" state
      setTimeout(() => {
          let low = 0;
          let high = 0;
          
          // Set reasonable bounds based on variable
          if (adjustableVariable === 'gasolinePrice') { high = 20; }
          else if (adjustableVariable === 'companyRevenueShare') { high = 100; }
          else if (adjustableVariable === 'avgGasolineSold') { low = 1000; high = 500000; }
          else if (adjustableVariable === 'unitSalePrice') { high = 500000; }
          else if (adjustableVariable === 'installationMargin') { low = -100; high = 500; }
          else if (adjustableVariable === 'unitCost') { low = 10000; high = 200000; }
          else if (adjustableVariable === 'annualMaintenanceCost') { high = 50000; }
          else if (adjustableVariable === 'leaseTerm') { low = 1; high = 20; }
          else if (adjustableVariable === 'recoveryRate') { low = 5; high = 100; }
          else if (adjustableVariable === 'electricityPrice') { low = 0.01; high = 1; }
          else if (adjustableVariable === 'volumeGrowthRate') { low = -10; high = 30; }

          const finish = (val: number, isFound: boolean, steps: number) => {
              setResult({ found: isFound, value: val, steps: steps });
              setIsSolving(false);
              setProgress(100);
          };

          // Special handling for integer parameters (lease term)
          if (adjustableVariable === 'leaseTerm') {
              // Async linear search for integers
              let bestValue = -Infinity;
              let bestYear = low;
              let currentYear = low;
              
              const testNextYear = () => {
                  if (currentYear > high) {
                      // Finished all years
                      finish(bestYear, false, currentYear - low);
                      return;
                  }
                  
                  const testParams = { ...currentParams, [adjustableVariable]: currentYear };
                  const res = calculateVaporRecovery(testParams);
                  const val = getMetricValue(res, targetMetric);
                  
                  // Check if we hit the target
                  const tolerance = (targetMetric === 'irr' || targetMetric === 'roi') ? 0.5 : 1000;
                  if (Math.abs(val - targetValue) < tolerance) {
                      finish(currentYear, true, currentYear - low + 1);
                      return;
                  }
                  
                  // Track best
                  if (Math.abs(val - targetValue) < Math.abs(bestValue - targetValue)) {
                      bestValue = val;
                      bestYear = currentYear;
                  }
                  
                  // Check if we passed the target (for monotonic functions)
                  if (currentYear > low) {
                      const prevParams = { ...currentParams, [adjustableVariable]: currentYear - 1 };
                      const prevRes = calculateVaporRecovery(prevParams);
                      const prevVal = getMetricValue(prevRes, targetMetric);
                      
                      // If we crossed the target, return the ceiling (current year)
                      if ((prevVal < targetValue && val > targetValue) || (prevVal > targetValue && val < targetValue)) {
                          // For lease term, always use ceiling (current year) since you need the full year
                          finish(currentYear, true, currentYear - low + 1);
                          return;
                      }
                  }
                  
                  setProgress(Math.round(((currentYear - low + 1) / (high - low + 1)) * 100));
                  currentYear++;
                  
                  // Continue with next year (async)
                  setTimeout(testNextYear, 10);
              };
              
              testNextYear();
              return;
          }

          // Binary search for continuous parameters
          let iterations = 0;
          const maxIterations = 100;
          let bestGuess = low;
          let bestValue = -Infinity;

          // First, test if target is achievable at bounds
          const testLow = { ...currentParams, [adjustableVariable]: low };
          const testHigh = { ...currentParams, [adjustableVariable]: high };
          const resLow = calculateVaporRecovery(testLow);
          const resHigh = calculateVaporRecovery(testHigh);
          const valLow = getMetricValue(resLow, targetMetric);
          const valHigh = getMetricValue(resHigh, targetMetric);
          
          // Check if target is within achievable range
          const minVal = Math.min(valLow, valHigh);
          const maxVal = Math.max(valLow, valHigh);
          
          if (targetValue < minVal || targetValue > maxVal) {
              // Target not achievable - return best attempt
              if (Math.abs(targetValue - valLow) < Math.abs(targetValue - valHigh)) {
                  finish(low, false, 1);
              } else {
                  finish(high, false, 1);
              }
              return;
          }

          // Binary Search with Progress Emulation
          const interval = setInterval(() => {
              if (iterations >= maxIterations) {
                  clearInterval(interval);
                  finish(bestGuess, false, iterations);
                  return;
              }

              iterations++;
              const mid = (low + high) / 2;
              const testParams = { ...currentParams, [adjustableVariable]: mid };
              const res = calculateVaporRecovery(testParams);
              const val = getMetricValue(res, targetMetric);

              // Track best guess
              if (Math.abs(val - targetValue) < Math.abs(bestValue - targetValue)) {
                  bestValue = val;
                  bestGuess = mid;
              }

              // Check if close enough (within 1% or 100 units)
              const tolerance = (targetMetric === 'irr' || targetMetric === 'roi') ? 0.1 : 100;
              
              if (Math.abs(val - targetValue) < tolerance) {
                  clearInterval(interval);
                  finish(mid, true, iterations);
                  return;
              }

              // Determine direction (assuming monotonic functions which most of these are)
              // Test a small delta to determine slope
              const delta = (high - low) * 0.01 || 0.01;
              const deltaParams = { ...currentParams, [adjustableVariable]: mid + delta };
              const deltaRes = calculateVaporRecovery(deltaParams);
              const deltaVal = getMetricValue(deltaRes, targetMetric);
              const increasing = deltaVal > val;

              if (val < targetValue) {
                  if (increasing) low = mid;
                  else high = mid;
              } else {
                  if (increasing) high = mid;
                  else low = mid;
              }
              
              setProgress(Math.round((iterations / maxIterations) * 100));

          }, 5); // Fast interval

      }, 100);
  };

  const applySolution = () => {
      if (result) {
          onUpdateParams({ ...currentParams, [adjustableVariable]: result.value });
          setShowConfirmation(true);
          
          // Auto-navigate back to model after 2 seconds
          setTimeout(() => {
              if (onNavigate) {
                  onNavigate('model');
              }
          }, 2000);
      }
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-4xl mx-auto overflow-y-auto custom-scrollbar pb-16">
        {/* Success Confirmation Modal */}
        <AnimatePresence>
            {showConfirmation && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 dark:bg-navy-950/90 backdrop-blur-sm z-50"
                        onClick={() => setShowConfirmation(false)}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-navy-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-emerald-500"
                    >
                        <div className="flex flex-col items-center text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
                            >
                                <CheckIcon className="w-8 h-8 text-white" />
                            </motion.div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                Parameters Updated!
                            </h3>
                            <p className="text-slate-600 dark:text-navy-300 mb-6">
                                Your model has been updated with the optimized value. Redirecting to dashboard...
                            </p>
                            <div className="flex gap-3 w-full">
                                <motion.button
                                    onClick={() => {
                                        setShowConfirmation(false);
                                        if (onNavigate) onNavigate('model');
                                    }}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-lg shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Go to Dashboard
                                </motion.button>
                                <motion.button
                                    onClick={() => setShowConfirmation(false)}
                                    className="px-4 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <XIcon className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-secondary rounded-xl shadow-glow">
                <AdjustmentsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('goalSeek')}</h1>
                <p className="text-navy-400 mt-1 text-sm">Reverse engineer your model to find the required inputs for a target outcome.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <Card title="Target Configuration">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="target-metric-select" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2">{t('targetMetric')}</label>
                        <select 
                            id="target-metric-select"
                            value={targetMetric}
                            onChange={(e) => setTargetMetric(e.target.value as GoalMetric)}
                            className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="irr">IRR (Internal Rate of Return)</option>
                            <option value="npv">NPV (Net Present Value)</option>
                            <option value="netProfit">Net Profit (Lifetime)</option>
                            <option value="roi">ROI (Return on Investment)</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="target-value-input" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2">Of...</label>
                        <div className="flex items-center">
                            <input 
                                id="target-value-input"
                                type="number" 
                                value={targetValue}
                                onChange={(e) => setTargetValue(parseFloat(e.target.value))}
                                className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <span className="ml-3 font-bold text-white w-12">{targetMetric === 'irr' || targetMetric === 'roi' ? '%' : ''}</span>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 mt-4">
                        <label htmlFor="adjustable-variable-select" className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2">{t('adjustVariable')}</label>
                         <select 
                            id="adjustable-variable-select"
                            value={adjustableVariable}
                            onChange={(e) => setAdjustableVariable(e.target.value as AdjustableVariable)}
                            className="w-full bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="gasolinePrice">Gasoline Price</option>
                            <option value="companyRevenueShare">Revenue Share %</option>
                            <option value="avgGasolineSold">Daily Volume</option>
                            <option value="unitSalePrice">Unit Sale Price</option>
                            <option value="installationMargin">Installation Margin</option>
                            <option value="unitCost">Unit COGS</option>
                            <option value="annualMaintenanceCost">Annual Maintenance Cost</option>
                            <option value="leaseTerm">Lease Term (Years)</option>
                            <option value="recoveryRate">Recovery Rate %</option>
                            <option value="electricityPrice">Electricity Price</option>
                            <option value="volumeGrowthRate">Volume Growth Rate %</option>
                        </select>
                    </div>

                    <button 
                        onClick={solve}
                        disabled={isSolving}
                        className="w-full bg-primary hover:bg-primary-dark text-navy-950 font-bold py-3 rounded-lg shadow-lg transition-all mt-2 disabled:opacity-50 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                    >
                        {isSolving && (
                            <div className="absolute inset-0 bg-primary-dark/20">
                                <div className="h-full bg-primary-light/30 transition-all duration-100" style={{ width: `${progress}%` }}></div>
                            </div>
                        )}
                        <span className="relative z-10">{isSolving ? t('solving') : t('findSolution')}</span>
                    </button>
                </div>
            </Card>

            <div className="space-y-6">
                <Card title="Results" className={result ? 'border-primary/50' : ''}>
                    {result ? (
                        <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="text-navy-400 text-sm mb-2">Required Value for {adjustableVariable}</div>
                            <div className="text-4xl font-black text-white mb-2">
                                {['companyRevenueShare', 'installationMargin', 'recoveryRate', 'volumeGrowthRate'].includes(adjustableVariable) 
                                    ? result.value.toFixed(1) + '%' 
                                    : adjustableVariable === 'avgGasolineSold'
                                        ? Math.round(result.value).toLocaleString()
                                        : adjustableVariable === 'leaseTerm'
                                            ? Math.round(result.value) + ' years'
                                            : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(result.value)
                                }
                            </div>
                            <div className="text-xs text-navy-500 mb-6">
                                {result.found 
                                    ? `Exact solution found in ${result.steps} ${adjustableVariable === 'leaseTerm' ? 'years tested' : 'iterations'}.`
                                    : adjustableVariable === 'leaseTerm' && result.value === 20
                                        ? 'Target not feasible within 20 years - best attempt shown.'
                                        : 'Target not achievable within bounds - best attempt shown.'
                                }
                            </div>
                            
                            <button 
                                onClick={applySolution}
                                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                            >
                                {t('applyToModel')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-navy-500">
                            <AdjustmentsIcon className="w-12 h-12 mb-3 opacity-20" />
                            <p>Run the solver to see results.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    </div>
  );
};

export default GoalSeekAnalysis;
