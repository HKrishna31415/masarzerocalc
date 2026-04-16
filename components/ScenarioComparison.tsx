
import React, { useState, useEffect } from 'react';
import { InputParams, Scenario, CalculatedResults } from '../types';
import { calculateVaporRecovery } from '../utils/calculator';
import { PRESETS } from '../utils/presets';
import { CURRENCY_SYMBOLS } from '../utils/sensitivityConfig';
import Card from './Card';
import FootballFieldChart from './FootballFieldChart';

interface ScenarioComparisonProps {
  currentParams: InputParams;
  currency: string;
}

const formatCurrency = (val: number, currency: string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(val);

const formatPercent = (val: number) => `${val.toFixed(1)}%`;

const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({ currentParams, currency }) => {
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>(['preset-standard']);
  const [viewMode, setViewMode] = useState<'table' | 'split'>('table');
  
  // Combine Presets and User Scenarios for the dropdown
  const allOptions = [
      ...PRESETS.map((p, idx) => ({ id: `preset-${idx}`, name: `[Preset] ${p.name}`, params: { ...currentParams, ...p.params } })),
      ...savedScenarios
  ];

  useEffect(() => {
      const saved = localStorage.getItem('masarzero_scenarios');
      if (saved) {
          try { setSavedScenarios(JSON.parse(saved)); } catch(e) {}
      }
  }, []);

  const toggleScenario = (id: string) => {
    if (selectedScenarioIds.includes(id)) {
      if (selectedScenarioIds.length > 1) {
        setSelectedScenarioIds(selectedScenarioIds.filter(sid => sid !== id));
      }
    } else {
      if (selectedScenarioIds.length < 4) {
        setSelectedScenarioIds([...selectedScenarioIds, id]);
      }
    }
  };

  const compareScenarios = selectedScenarioIds.map(id => {
    const scenario = allOptions.find(s => s.id === id) || allOptions[0];
    return {
      id,
      name: scenario.name,
      params: scenario.params,
      results: calculateVaporRecovery(scenario.params)
    };
  });

  const currentScenario = {
    id: 'current',
    name: 'Current Configuration',
    params: currentParams,
    results: calculateVaporRecovery(currentParams)
  };

  const scenarioB = allOptions.find(s => s.id === selectedScenarioIds[0]) || allOptions[0];
  const paramsA = currentParams;
  const paramsB = scenarioB.params;

  const resultsA = calculateVaporRecovery(paramsA);
  const resultsB = calculateVaporRecovery(paramsB);

  // Prepare data for the football field comparison
  // We include Current, Selected Comparison, and top 2 presets to fill the chart
  const footballFieldScenarios = [
      { name: 'Current Configuration', params: currentParams, isCurrent: true },
      { name: scenarioB.name, params: paramsB },
      ...PRESETS.slice(0, 3).filter(p => `[Preset] ${p.name}` !== scenarioB.name).map(p => ({
          name: p.name,
          params: { ...currentParams, ...p.params }
      }))
  ];

  const getDelta = (valA: number, valB: number, type: 'currency' | 'percent' = 'currency', higherIsBetter: boolean = true) => {
      const diff = valA - valB; // Current - Baseline
      const format = type === 'currency' ? (v: number) => formatCurrency(v, currency) : formatPercent;
      
      let isGood = diff > 0;
      if (!higherIsBetter) isGood = diff < 0;
      if (diff === 0) return <span className="text-xs font-bold text-navy-400">-</span>;

      const color = isGood ? 'text-success' : 'text-danger';
      const sign = diff > 0 ? '+' : '';
      return <span className={`text-xs font-bold ${color}`}>{sign}{format(diff)}</span>;
  };

  const getBestScenario = (metric: keyof CalculatedResults['profitability'], higherIsBetter: boolean = true) => {
    const allScenarios = [currentScenario, ...compareScenarios];
    const values = allScenarios.map(s => s.results.profitability[metric] as number);
    const bestValue = higherIsBetter ? Math.max(...values) : Math.min(...values);
    return allScenarios.find(s => s.results.profitability[metric] === bestValue)?.id;
  };

  const MetricRow = ({ label, valA, valB, type = 'currency', higherIsBetter = true }: { label: string, valA: number, valB: number, type?: 'currency'|'percent', higherIsBetter?: boolean }) => {
      const diff = valA - valB;
      let isGood = diff > 0;
      if (!higherIsBetter) isGood = diff < 0;
      
      const bgClass = diff !== 0 
        ? (isGood ? 'bg-success/5 border-l-2 border-success' : 'bg-danger/5 border-l-2 border-danger')
        : 'border-l-2 border-transparent';

      return (
      <div className={`grid grid-cols-3 gap-4 py-4 border-b border-white/5 hover:bg-white/10 transition-colors px-4 ${bgClass}`}>
          <div className="text-navy-200 font-medium flex flex-col justify-center">
             {label}
          </div>
          <div className="bg-primary/5 rounded p-2 text-right">
              <div className="font-bold text-white text-lg">{type === 'currency' ? formatCurrency(valA, currency) : formatPercent(valA)}</div>
              <div className="text-[10px] text-navy-400 uppercase tracking-wider mt-1">Current</div>
          </div>
          <div className="bg-navy-900 rounded p-2 text-right relative overflow-hidden">
               <div className="font-bold text-navy-100 text-lg">{type === 'currency' ? formatCurrency(valB, currency) : formatPercent(valB)}</div>
               <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-navy-500 uppercase tracking-wider">Baseline</span>
                  {getDelta(valA, valB, type, higherIsBetter)}
               </div>
          </div>
      </div>
      );
  };

  return (
    <div className="w-full h-full p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Scenario Comparison</h1>
                <p className="text-navy-400 mt-1">Evaluate your current model against saved scenarios and presets.</p>
            </div>
            <div className="flex gap-3">
                <div className="flex items-center p-1 space-x-1 bg-navy-900 rounded-lg">
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'table' ? 'bg-gradient-primary text-white shadow-glow' : 'text-navy-400 hover:text-white'}`}
                  >
                    Table
                  </button>
                  <button 
                    onClick={() => setViewMode('split')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'split' ? 'bg-gradient-primary text-white shadow-glow' : 'text-navy-400 hover:text-white'}`}
                  >
                    Split View
                  </button>
                </div>
            </div>
        </div>

        {viewMode === 'table' ? (
          <>
            <div className="mb-6">
                <label htmlFor="compare-scenario-select" className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-2">Compare Against</label>
                <select 
                    id="compare-scenario-select"
                    className="w-full md:w-64 bg-navy-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    value={selectedScenarioIds[0]}
                    onChange={(e) => setSelectedScenarioIds([e.target.value])}
                >
                    {allOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
            </div>
            
            {/* Comparison Football Field */}
            <div className="mb-8">
                <Card title="Net Profit Comparison (Scenario Range)" description="Comparing the Net Profit range (Pessimistic vs Optimistic) across different scenarios.">
                    <div className="h-[400px] w-full">
                        <FootballFieldChart scenarios={footballFieldScenarios} currency={currency} />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-primary p-4 rounded-xl shadow-lg border border-white/10">
                    <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Current Active Scenario</div>
                    <div className="text-2xl font-black text-white">Scenario A</div>
                </div>
                <div className="bg-navy-800 p-4 rounded-xl shadow-lg border border-white/10">
                    <div className="text-navy-400 text-xs font-bold uppercase tracking-widest mb-1">Baseline Comparison</div>
                    <div className="text-2xl font-black text-navy-100 truncate">{scenarioB.name}</div>
                </div>
            </div>

            <Card title="Financial Performance" noPadding>
                <MetricRow label="Net Profit (Lifetime)" valA={resultsA.profitability.netProfit} valB={resultsB.profitability.netProfit} />
                <MetricRow label="Net Present Value (NPV)" valA={resultsA.profitability.npv} valB={resultsB.profitability.npv} />
                <MetricRow label="Return on Investment (ROI)" valA={resultsA.profitability.roi} valB={resultsB.profitability.roi} type="percent" />
                <MetricRow label="Total Revenue" valA={resultsA.revenue.totalRevenue} valB={resultsB.revenue.totalRevenue} />
                <MetricRow label="Total Costs" valA={resultsA.costs.totalCosts} valB={resultsB.costs.totalCosts} higherIsBetter={false} />
                <MetricRow label="Total Taxes" valA={resultsA.costs.totalTaxes} valB={resultsB.costs.totalTaxes} higherIsBetter={false} />
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-12">
                <Card title="Operational Differences">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-navy-400">Model</span> <span className="text-white">{paramsA.businessModel} vs {paramsB.businessModel}</span></div>
                        <div className="flex justify-between"><span className="text-navy-400">Total Units</span> <span className="text-white">{(paramsA.unitsPerClient * paramsA.numberOfClients)} vs {(paramsB.unitsPerClient * paramsB.numberOfClients)}</span></div>
                        <div className="flex justify-between"><span className="text-navy-400">Term</span> <span className="text-white">{paramsA.leaseTerm}y vs {paramsB.leaseTerm}y</span></div>
                    </div>
                </Card>
                <Card title="Key Assumptions">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-navy-400">Gas Price</span> <span className="text-white">{formatCurrency(paramsA.gasolinePrice, currency)} vs {formatCurrency(paramsB.gasolinePrice, currency)}</span></div>
                        <div className="flex justify-between"><span className="text-navy-400">Recovery Rate</span> <span className="text-white">{paramsA.recoveryRate}% vs {paramsB.recoveryRate}%</span></div>
                        <div className="flex justify-between"><span className="text-navy-400">SaaS Enabled</span> <span className="text-white">{paramsA.enableMonthlyFees ? 'Yes' : 'No'} vs {paramsB.enableMonthlyFees ? 'Yes' : 'No'}</span></div>
                    </div>
                </Card>
            </div>
          </>
        ) : (
          <>
            {/* Split View Mode */}
            <div className="mb-6">
                <label className="block text-[10px] font-bold text-navy-400 uppercase tracking-widest mb-3">Select Scenarios to Compare (Max 4)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {allOptions.slice(0, 8).map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => toggleScenario(opt.id)}
                            className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                                selectedScenarioIds.includes(opt.id)
                                    ? 'bg-primary border-primary text-white shadow-glow'
                                    : 'bg-navy-900 border-white/10 text-navy-300 hover:border-primary/50'
                            }`}
                        >
                            {opt.name.replace('[Preset] ', '')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Current Scenario */}
                <div className="bg-gradient-primary rounded-xl p-5 border border-white/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-sm">Current</h3>
                        {getBestScenario('npv') === 'current' && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/50 font-bold">
                                👑 Winner
                            </span>
                        )}
                    </div>
                    <div className="space-y-3">
                        <div>
                            <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">NPV</div>
                            <div className="text-xl font-black text-white">{formatCurrency(currentScenario.results.profitability.npv, currency)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">ROI</div>
                            <div className="text-lg font-bold text-white">{formatPercent(currentScenario.results.profitability.roi)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Net Profit</div>
                            <div className="text-lg font-bold text-white">{formatCurrency(currentScenario.results.profitability.netProfit, currency)}</div>
                        </div>
                        <div>
                            <div className="text-[10px] text-white/60 uppercase tracking-wider mb-1">Payback</div>
                            <div className="text-sm font-medium text-white">
                                {currentScenario.results.profitability.paybackPeriod < 0 ? 'Never' : `${currentScenario.results.profitability.paybackPeriod.toFixed(1)}y`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Scenarios */}
                {compareScenarios.map((scenario, idx) => {
                    const isWinner = getBestScenario('npv') === scenario.id;
                    const npvDiff = currentScenario.results.profitability.npv - scenario.results.profitability.npv;
                    const roiDiff = currentScenario.results.profitability.roi - scenario.results.profitability.roi;
                    
                    return (
                        <div key={scenario.id} className="bg-navy-900 rounded-xl p-5 border border-white/10 hover:border-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white text-sm truncate pr-2" title={scenario.name}>
                                    {scenario.name.replace('[Preset] ', '')}
                                </h3>
                                {isWinner && (
                                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/50 font-bold whitespace-nowrap">
                                        👑 Winner
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">NPV</div>
                                    <div className="text-xl font-black text-white">{formatCurrency(scenario.results.profitability.npv, currency)}</div>
                                    <div className={`text-xs font-bold mt-1 ${npvDiff > 0 ? 'text-success' : npvDiff < 0 ? 'text-danger' : 'text-navy-400'}`}>
                                        {npvDiff > 0 ? '▼' : npvDiff < 0 ? '▲' : '='} {Math.abs(npvDiff) > 0 ? formatCurrency(Math.abs(npvDiff), currency) : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">ROI</div>
                                    <div className="text-lg font-bold text-white">{formatPercent(scenario.results.profitability.roi)}</div>
                                    <div className={`text-xs font-bold mt-1 ${roiDiff > 0 ? 'text-success' : roiDiff < 0 ? 'text-danger' : 'text-navy-400'}`}>
                                        {roiDiff > 0 ? '▼' : roiDiff < 0 ? '▲' : '='} {Math.abs(roiDiff) > 0 ? formatPercent(Math.abs(roiDiff)) : '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Net Profit</div>
                                    <div className="text-lg font-bold text-white">{formatCurrency(scenario.results.profitability.netProfit, currency)}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-navy-400 uppercase tracking-wider mb-1">Payback</div>
                                    <div className="text-sm font-medium text-white">
                                        {scenario.results.profitability.paybackPeriod < 0 ? 'Never' : `${scenario.results.profitability.paybackPeriod.toFixed(1)}y`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Metrics Table */}
            <Card title="Detailed Comparison" noPadding>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-navy-400 uppercase tracking-wider">Metric</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Current</th>
                                {compareScenarios.map(s => (
                                    <th key={s.id} className="px-4 py-3 text-right text-xs font-bold text-navy-200 uppercase tracking-wider truncate" title={s.name}>
                                        {s.name.replace('[Preset] ', '').substring(0, 12)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {[
                                { label: 'Total Revenue', key: 'totalRevenue', path: 'revenue' },
                                { label: 'Total Costs', key: 'totalCosts', path: 'costs' },
                                { label: 'EBITDA', key: 'ebitda', path: 'profitability' },
                                { label: 'IRR', key: 'irr', path: 'profitability', type: 'percent' },
                            ].map(metric => (
                                <tr key={metric.key} className="hover:bg-white/5">
                                    <td className="px-4 py-3 text-navy-300 font-medium">{metric.label}</td>
                                    <td className="px-4 py-3 text-right text-white font-bold">
                                        {metric.type === 'percent' 
                                            ? formatPercent((currentScenario.results as any)[metric.path][metric.key])
                                            : formatCurrency((currentScenario.results as any)[metric.path][metric.key], currency)
                                        }
                                    </td>
                                    {compareScenarios.map(s => (
                                        <td key={s.id} className="px-4 py-3 text-right text-navy-200">
                                            {metric.type === 'percent' 
                                                ? formatPercent((s.results as any)[metric.path][metric.key])
                                                : formatCurrency((s.results as any)[metric.path][metric.key], currency)
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
          </>
        )}
    </div>
  );
};

export default ScenarioComparison;
