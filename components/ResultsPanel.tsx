
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatedResults, InputParams, TooltipInfo } from '../types';
import ResultRow from './ResultRow';
import ProfitWaterfallChart from './ProfitabilityChart';
import CashFlowChart from './CashFlowChart';
import RevenueBreakdownChart from './RevenueBreakdownChart';
import CostBreakdownChart from './CostBreakdownChart';
import MetricDisplay from './MetricDisplay';
import SmartInsights from './SmartInsights';
import SliderInput from './SliderInput';
import { DownloadIcon, TableIcon } from './icons';
import FlyoutPanel from './FlyoutPanel';
import SmartAlert from './SmartAlert';

interface ResultsPanelProps {
  results: CalculatedResults;
  inputs: InputParams;
  currency: string;
  darkMode?: boolean;
  onNavigate?: (page: string) => void;
}

type ChartView = 'Profit Waterfall' | 'Cash Flow' | 'Revenue' | 'Cost Structure' | 'Ledger';

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCurrencyCompact = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, inputs, currency, darkMode = true, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<ChartView>('Profit Waterfall');
  const [flyoutYear, setFlyoutYear] = useState<number | null>(null);
  const [prevResults, setPrevResults] = useState<CalculatedResults>(results);
  const [changedMetrics, setChangedMetrics] = useState<Set<string>>(new Set());
  
  const { revenue, costs, profitability } = results;
  const isLeasing = inputs.businessModel === 'Leasing';

  // Detect changes and trigger shimmer effect
  useEffect(() => {
    const changed = new Set<string>();
    
    if (prevResults.profitability.netProfit !== results.profitability.netProfit) {
      changed.add('netProfit');
    }
    if (prevResults.profitability.roi !== results.profitability.roi) {
      changed.add('roi');
    }
    if (prevResults.profitability.npv !== results.profitability.npv) {
      changed.add('npv');
    }
    if (prevResults.profitability.irr !== results.profitability.irr) {
      changed.add('irr');
    }
    
    if (changed.size > 0) {
      setChangedMetrics(changed);
      setTimeout(() => setChangedMetrics(new Set()), 1000);
    }
    
    setPrevResults(results);
  }, [results]);

  // Smart Alert Logic: Show when NPV < 0 (always show optimization opportunity when NPV is negative)
  const showSmartAlert = profitability.npv < 0;

  const handleGoalSeek = () => {
    if (onNavigate) {
      onNavigate('goal-seek');
    }
  };

  useEffect(() => {
    if (isLeasing && activeTab === 'Profit Waterfall') setActiveTab('Cash Flow');
    if (!isLeasing && activeTab === 'Cash Flow') setActiveTab('Profit Waterfall');
  }, [inputs.leaseTerm, inputs.businessModel]);
  
  const handlePrintPDF = () => {
      window.print();
  };

  // Generate Year-by-Year Data for Table
  const yearlyData = useMemo(() => {
      const years = [];
      const term = inputs.leaseTerm;
      const growthRate = inputs.volumeGrowthRate / 100;
      
      // Initial Investment (Year 0)
      years.push({
          year: 0,
          revenue: 0,
          opex: 0,
          capex: costs.cogs + costs.installationCost + costs.customerAcquisitionCost,
          tax: 0,
          net: -(costs.cogs + costs.installationCost + costs.customerAcquisitionCost)
      });

      for (let i = 1; i <= term; i++) {
          const net = results.cashFlow[i]; 
          years.push({
              year: i,
              net: net,
          });
      }
      return years;
  }, [results, inputs]);

  const handleExportCSV = () => {
      const header = ['Year', 'Net Cash Flow', 'Cumulative Cash Flow'];
      let cumulative = 0;
      const rows = yearlyData.map(y => {
          cumulative += y.net;
          return [y.year, y.net.toFixed(2), cumulative.toFixed(2)];
      });
      
      // Add Summary Stats at bottom
      rows.push([]);
      rows.push(['Total Net Profit', profitability.netProfit.toFixed(2)]);
      rows.push(['ROI', profitability.roi.toFixed(2) + '%']);
      rows.push(['NPV', profitability.npv.toFixed(2)]);

      const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Financial_Model_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-4 lg:space-y-6 w-full pb-24">
      
      {/* Smart Alert for NPV/ROI Conflict */}
      <SmartAlert 
        show={showSmartAlert}
        onGoalSeek={handleGoalSeek}
        npv={profitability.npv}
        roi={profitability.roi}
        currency={currency}
      />

      {/* 1. HERO METRICS SECTION */}
      <div id="hero-metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 flex-shrink-0">
         <motion.div
           animate={changedMetrics.has('netProfit') ? {
             backgroundColor: profitability.netProfit >= 0 
               ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.1)']
               : ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.1)']
           } : {}}
           transition={{ duration: 0.6 }}
           className="rounded-2xl"
         >
           <MetricDisplay 
              label="Net Profit" 
              value={formatCurrencyCompact(profitability.netProfit, currency)}
              highlight={profitability.netProfit >= 0 ? 'net-profit-gain' : 'net-profit-loss'}
              variant="hero"
              tooltip={{ title: "Net Profit", shortText: "Net Profit", details: "Total revenue minus all costs and taxes over the lifetime of the project." }}
            />
         </motion.div>
         <motion.div
           animate={changedMetrics.has('roi') ? {
             backgroundColor: ['rgba(5, 150, 105, 0.1)', 'rgba(5, 150, 105, 0.3)', 'rgba(5, 150, 105, 0.1)']
           } : {}}
           transition={{ duration: 0.6 }}
           className="rounded-2xl"
         >
           <MetricDisplay 
              label="Total ROI" 
              value={formatPercent(profitability.roi)}
              highlight="roi"
              variant="hero"
              tooltip={{ title: "Total ROI", shortText: "Total ROI", details: "Total Return on Investment = (Lifetime Net Profit / Total Costs) * 100." }}
            />
         </motion.div>
         <motion.div
           animate={changedMetrics.has('npv') ? {
             backgroundColor: ['rgba(5, 150, 105, 0.1)', 'rgba(5, 150, 105, 0.3)', 'rgba(5, 150, 105, 0.1)']
           } : {}}
           transition={{ duration: 0.6 }}
           className="rounded-2xl"
         >
           <MetricDisplay 
                label="NPV" 
                value={formatCurrencyCompact(profitability.npv, currency)}
                highlight="npv"
                variant="hero"
                tooltip={{ title: "Net Present Value", shortText: "NPV", details: "The value of all future cash flows discounted to today's dollars." }}
            />
         </motion.div>
         <motion.div
           animate={changedMetrics.has('irr') ? {
             backgroundColor: ['rgba(5, 150, 105, 0.1)', 'rgba(5, 150, 105, 0.3)', 'rgba(5, 150, 105, 0.1)']
           } : {}}
           transition={{ duration: 0.6 }}
           className="rounded-2xl"
         >
           <MetricDisplay 
              label="IRR" 
              value={formatPercent(profitability.irr)}
              variant="hero"
              highlight="profit-margin"
              tooltip={{ title: "Internal Rate of Return", shortText: "IRR", details: "The annual growth rate that the project is expected to generate." }}
            />
         </motion.div>
      </div>
      
      {/* 2. SMART INSIGHTS */}
      <SmartInsights results={results} inputs={inputs} currency={currency} />

      {/* 3. VISUALIZATION SECTION */}
      <div id="charts-container" className="flex-1 min-h-[300px] w-full bg-white dark:bg-glass-200 backdrop-blur-xl border border-slate-200 dark:border-glass-border rounded-2xl shadow-glass flex flex-col transition-all duration-300">
          <div className="p-3 lg:p-4 border-b border-slate-200 dark:border-glass-border flex flex-col sm:flex-row justify-between items-center gap-3 lg:gap-4 bg-slate-50 dark:bg-glass-100 flex-shrink-0 rounded-t-2xl">
             <div className="flex space-x-1 bg-slate-200 dark:bg-navy-950/50 p-1 rounded-lg border border-slate-300 dark:border-white/5 overflow-x-auto max-w-full no-scrollbar">
                  {(['Profit Waterfall', 'Cash Flow', 'Revenue', 'Cost Structure', 'Ledger'] as ChartView[])
                    .filter(tab => isLeasing ? true : tab !== 'Cash Flow')
                    .map(tab => (
                      <button 
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 lg:px-4 py-1.5 text-[10px] lg:text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-950 ${
                              activeTab === tab 
                              ? 'bg-white dark:bg-gradient-primary text-slate-900 dark:text-white shadow-sm dark:shadow-glow' 
                              : 'text-slate-500 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-300 dark:hover:bg-white/5'
                          }`}
                      >
                          {tab}
                      </button>
                  ))}
              </div>
              
              <div className="flex items-center space-x-2">
                 <button 
                    onClick={handleExportCSV}
                    className="flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-navy-200 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-100 dark:focus:ring-offset-navy-950"
                    title="Download raw data for Excel"
                  >
                      <TableIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">CSV</span>
                  </button>
                  <button 
                    id="executive-report-btn"
                    onClick={handlePrintPDF}
                    className="flex items-center space-x-2 text-xs font-bold text-white bg-gradient-primary hover:brightness-110 transition-colors uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-navy-950"
                  >
                      <DownloadIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Report</span>
                  </button>
              </div>
          </div>

          <div className="relative p-2 lg:p-4 h-[420px]">
              {activeTab === 'Profit Waterfall' && (
                  <div className="w-full h-full">
                      <ProfitWaterfallChart results={results} currency={currency} darkMode={darkMode} />
                  </div>
              )}
              {activeTab === 'Cash Flow' && (
                  <div className="w-full h-full">
                      <CashFlowChart results={results} currency={currency} inputs={inputs} darkMode={darkMode} />
                  </div>
              )}
              {activeTab === 'Revenue' && (
                  <div className="w-full h-full">
                      <RevenueBreakdownChart results={results} currency={currency} darkMode={darkMode} />
                  </div>
              )}
              {activeTab === 'Cost Structure' && (
                  <div className="w-full h-full">
                      <CostBreakdownChart results={results} currency={currency} darkMode={darkMode} />
                  </div>
              )}
              {activeTab === 'Ledger' && (
                   <div className="h-[380px] w-full overflow-hidden flex flex-col">
                        <div className="overflow-auto custom-scrollbar flex-1 w-full border border-slate-200 dark:border-white/10 rounded-lg">
                            <table className="w-full text-sm text-left text-slate-600 dark:text-navy-200 min-w-[400px]">
                                <thead className="text-xs text-slate-700 dark:text-white uppercase bg-slate-100 dark:bg-white/5 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">Year</th>
                                        <th className="px-6 py-3 font-bold text-right">Net Cash Flow</th>
                                        <th className="px-6 py-3 font-bold text-right">Cumulative</th>
                                        <th className="px-6 py-3 font-bold text-center">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {yearlyData.map((year, idx) => {
                                        // Calculate cumulative for display
                                        const cumulative = yearlyData.slice(0, idx + 1).reduce((sum, y) => sum + y.net, 0);
                                        return (
                                            <motion.tr 
                                                key={year.year} 
                                                className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                                whileHover={{ backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                            >
                                                <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{year.year === 0 ? 'Start' : `Year ${year.year}`}</td>
                                                <td className={`px-6 py-3 text-right font-mono ${year.net >= 0 ? 'text-emerald-600 dark:text-success' : 'text-red-600 dark:text-danger'}`}>
                                                    {formatCurrency(year.net, currency)}
                                                </td>
                                                <td className={`px-6 py-3 text-right font-mono font-bold ${cumulative >= 0 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-navy-400'}`}>
                                                    {formatCurrency(cumulative, currency)}
                                                </td>
                                                <td className="px-6 py-3 text-center">
                                                    <motion.button
                                                        onClick={() => setFlyoutYear(year.year)}
                                                        className="text-xs font-bold text-primary-dark dark:text-primary-light hover:underline opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        View Breakdown →
                                                    </motion.button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-xs text-slate-500 dark:text-navy-400 text-center">
                            * Click any row to see detailed formula breakdown. CSV export available above.
                        </div>
                   </div>
              )}
          </div>
      </div>

      {/* Flyout Panel */}
      <FlyoutPanel 
        isOpen={flyoutYear !== null}
        onClose={() => setFlyoutYear(null)}
        year={flyoutYear || 0}
        results={results}
        inputs={inputs}
        currency={currency}
      />
    </div>
  );
};

export default ResultsPanel;
