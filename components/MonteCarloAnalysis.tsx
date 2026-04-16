
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell, CartesianGrid } from 'recharts';
import { InputParams, CalculatedResults } from '../types';
import { calculateVaporRecovery } from '../utils/calculator';
import Card from './Card';
import SliderInput from './SliderInput';
import { CURRENCY_SYMBOLS } from '../utils/sensitivityConfig';

interface MonteCarloAnalysisProps {
  baseParams: InputParams;
  currency: string;
}

interface SimulationResult {
  netProfit: number;
  params: {
    avgGasolineSold: number;
    gasolinePrice: number;
    recoveryRate: number;
    companyRevenueShare: number;
    leaseTerm: number;
  };
}

const formatCurrency = (val: number, currency: string) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(val);

const MonteCarloAnalysis: React.FC<MonteCarloAnalysisProps> = ({ baseParams, currency }) => {
  const [uncertainty, setUncertainty] = useState(15); // +/- %
  const [simulationCount, setSimulationCount] = useState(500);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [selectedBin, setSelectedBin] = useState<any>(null);
  
  // Parameter variation toggles
  const [varyVolume, setVaryVolume] = useState(true);
  const [varyPrice, setVaryPrice] = useState(true);
  const [varyRecovery, setVaryRecovery] = useState(true);
  const [varyRevenueShare, setVaryRevenueShare] = useState(false);
  const [varyLeaseTerm, setVaryLeaseTerm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const runSimulation = () => {
      setIsSimulating(true);
      setSelectedBin(null); // Clear selection when running new simulation
      
      // Use setTimeout to allow UI to render loading state
      setTimeout(() => {
          const newResults: SimulationResult[] = [];
          
          for(let i=0; i<simulationCount; i++) {
              // Perturb key inputs based on toggles
              // Using Uniform Distribution: Base * (1 + (Math.random() - 0.5) * 2 * uncertainty/100)
              
              const vary = (val: number) => val * (1 + (Math.random() - 0.5) * 2 * (uncertainty / 100));
              
              const simParams = { ...baseParams };
              
              // Variables to perturb (only if enabled)
              const volumeUsed = varyVolume ? vary(baseParams.avgGasolineSold) : baseParams.avgGasolineSold;
              const priceUsed = varyPrice ? vary(baseParams.gasolinePrice) : baseParams.gasolinePrice;
              const recoveryUsed = varyRecovery ? Math.min(100, Math.max(0, vary(baseParams.recoveryRate))) : baseParams.recoveryRate;
              const revenueShareUsed = varyRevenueShare ? Math.min(100, Math.max(0, vary(baseParams.companyRevenueShare))) : baseParams.companyRevenueShare;
              const leaseTermUsed = varyLeaseTerm ? Math.max(1, Math.round(vary(baseParams.leaseTerm))) : baseParams.leaseTerm;
              
              simParams.avgGasolineSold = volumeUsed;
              simParams.gasolinePrice = priceUsed;
              simParams.recoveryRate = recoveryUsed;
              simParams.companyRevenueShare = revenueShareUsed;
              simParams.leaseTerm = leaseTermUsed;
              
              const res = calculateVaporRecovery(simParams);
              
              newResults.push({
                  netProfit: res.profitability.netProfit,
                  params: {
                      avgGasolineSold: volumeUsed,
                      gasolinePrice: priceUsed,
                      recoveryRate: recoveryUsed,
                      companyRevenueShare: revenueShareUsed,
                      leaseTerm: leaseTermUsed
                  }
              });
          }
          
          // Sort by net profit
          newResults.sort((a, b) => a.netProfit - b.netProfit);
          setResults(newResults);
          setIsSimulating(false);
      }, 50);
  };

  const histogramData = useMemo(() => {
      if (results.length === 0) return [];
      
      const min = results[0].netProfit;
      const max = results[results.length - 1].netProfit;
      const binCount = 20;
      const binSize = (max - min) / binCount;
      
      const bins = Array.from({ length: binCount }, (_, i) => ({
          rangeStart: min + i * binSize,
          rangeEnd: min + (i + 1) * binSize,
          name: formatCurrency(min + i * binSize + binSize/2, currency), // Label center
          count: 0,
          examples: [] as SimulationResult[] // Store examples from this bin
      }));
      
      results.forEach(result => {
          const binIndex = Math.min(binCount - 1, Math.floor((result.netProfit - min) / binSize));
          bins[binIndex].count++;
          // Store first few examples from each bin
          if (bins[binIndex].examples.length < 5) {
              bins[binIndex].examples.push(result);
          }
      });
      
      return bins;
  }, [results, currency]);

  const stats = useMemo(() => {
      if (results.length === 0) return null;
      const sum = results.reduce((a, b) => a + b.netProfit, 0);
      const avg = sum / results.length;
      const positiveCount = results.filter(r => r.netProfit > 0).length;
      const probSuccess = (positiveCount / results.length) * 100;
      
      return {
          avg,
          min: results[0].netProfit,
          max: results[results.length - 1].netProfit,
          probSuccess
      };
  }, [results]);

  return (
    <div className="p-6 lg:p-8 w-full max-w-6xl mx-auto h-full overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Monte Carlo Simulation</h1>
                <p className="text-navy-400 mt-1">Probabilistic risk assessment based on input uncertainty.</p>
            </div>
            <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="bg-primary hover:bg-primary-dark text-navy-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
            >
                {isSimulating ? 'Running...' : 'Run Simulation'}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
                <Card title="Configuration">
                    <SliderInput 
                        label="Uncertainty Range (+/- %)"
                        value={uncertainty}
                        min={5} max={50} step={5}
                        unit="%"
                        onChange={setUncertainty}
                        description="Variability applied to enabled parameters."
                    />
                     <div className="mt-4">
                        <label htmlFor="simulation-count-select" className="text-xs text-navy-400 font-bold uppercase">Iterations</label>
                        <select 
                            id="simulation-count-select"
                            value={simulationCount}
                            onChange={(e) => setSimulationCount(parseInt(e.target.value))}
                            className="w-full bg-navy-900 border border-white/20 rounded mt-2 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                        >
                            <option value="100">100 Runs (Fast)</option>
                            <option value="500">500 Runs (Balanced)</option>
                            <option value="1000">1000 Runs (Precise)</option>
                        </select>
                     </div>
                     
                     {/* Advanced Settings Toggle */}
                     <div className="mt-4 pt-4 border-t border-white/10">
                         <button
                             onClick={() => setShowAdvanced(!showAdvanced)}
                             className="w-full flex items-center justify-between text-sm font-semibold text-navy-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                         >
                             <span>Advanced Settings</span>
                             <span className="text-xs">{showAdvanced ? '▼' : '▶'}</span>
                         </button>
                         
                         {showAdvanced && (
                             <div className="mt-3 space-y-3 bg-navy-950/50 p-3 rounded-lg border border-white/5">
                                 <div className="text-xs text-navy-400 uppercase tracking-wider mb-2">Parameters to Vary</div>
                                 
                                 <label className="flex items-center justify-between cursor-pointer group">
                                     <span className="text-sm text-navy-300 group-hover:text-white transition-colors">Gasoline Volume</span>
                                     <input 
                                         type="checkbox" 
                                         checked={varyVolume}
                                         onChange={(e) => setVaryVolume(e.target.checked)}
                                         className="w-4 h-4 rounded border-white/20 bg-navy-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                                     />
                                 </label>
                                 
                                 <label className="flex items-center justify-between cursor-pointer group">
                                     <span className="text-sm text-navy-300 group-hover:text-white transition-colors">Gasoline Price</span>
                                     <input 
                                         type="checkbox" 
                                         checked={varyPrice}
                                         onChange={(e) => setVaryPrice(e.target.checked)}
                                         className="w-4 h-4 rounded border-white/20 bg-navy-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                                     />
                                 </label>
                                 
                                 <label className="flex items-center justify-between cursor-pointer group">
                                     <span className="text-sm text-navy-300 group-hover:text-white transition-colors">Recovery Rate</span>
                                     <input 
                                         type="checkbox" 
                                         checked={varyRecovery}
                                         onChange={(e) => setVaryRecovery(e.target.checked)}
                                         className="w-4 h-4 rounded border-white/20 bg-navy-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                                     />
                                 </label>
                                 
                                 <label className="flex items-center justify-between cursor-pointer group">
                                     <span className="text-sm text-navy-300 group-hover:text-white transition-colors">Revenue Share</span>
                                     <input 
                                         type="checkbox" 
                                         checked={varyRevenueShare}
                                         onChange={(e) => setVaryRevenueShare(e.target.checked)}
                                         className="w-4 h-4 rounded border-white/20 bg-navy-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                                     />
                                 </label>
                                 
                                 <label className="flex items-center justify-between cursor-pointer group">
                                     <span className="text-sm text-navy-300 group-hover:text-white transition-colors">Lease Term</span>
                                     <input 
                                         type="checkbox" 
                                         checked={varyLeaseTerm}
                                         onChange={(e) => setVaryLeaseTerm(e.target.checked)}
                                         className="w-4 h-4 rounded border-white/20 bg-navy-900 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                                     />
                                 </label>
                                 
                                 {!varyVolume && !varyPrice && !varyRecovery && !varyRevenueShare && !varyLeaseTerm && (
                                     <div className="text-xs text-warning mt-2 p-2 bg-warning/10 rounded border border-warning/20">
                                         ⚠ At least one parameter must be varied
                                     </div>
                                 )}
                             </div>
                         )}
                     </div>
                </Card>

                {stats && (
                    <Card title="Results Summary" className="bg-gradient-to-br from-navy-900 to-navy-950">
                        <div className="space-y-4">
                            <div>
                                <div className="text-navy-400 text-xs uppercase tracking-wider">Probability of Profit</div>
                                <div className={`text-4xl font-black ${stats.probSuccess > 80 ? 'text-success' : stats.probSuccess > 50 ? 'text-warning' : 'text-danger'}`}>
                                    {stats.probSuccess.toFixed(1)}%
                                </div>
                            </div>
                             <div>
                                <div className="text-navy-400 text-xs uppercase tracking-wider">Average Net Outcome</div>
                                <div className="text-xl font-bold text-white">
                                    {formatCurrency(stats.avg, currency)}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
                                <div>
                                    <div className="text-navy-500 text-[10px] uppercase">Worst Case</div>
                                    <div className="text-danger font-mono font-bold">{formatCurrency(stats.min, currency)}</div>
                                </div>
                                <div>
                                    <div className="text-navy-500 text-[10px] uppercase">Best Case</div>
                                    <div className="text-success font-mono font-bold">{formatCurrency(stats.max, currency)}</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <div className="lg:col-span-2 h-[500px] bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
                {results.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ top: 20, right: 10, left: 10, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                tick={{fontSize: 10}}
                                interval={Math.floor(histogramData.length / 5)} // Prevent overlapping
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip 
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}}
                            />
                            <ReferenceLine x={0} stroke="white" />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} onClick={(data) => setSelectedBin(data)} style={{ cursor: 'pointer' }}>
                                {histogramData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.rangeStart < 0 ? '#ef4444' : '#10b981'}
                                        opacity={selectedBin && selectedBin.name === entry.name ? 1 : 0.8}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-navy-500">
                        <p>No simulation data.</p>
                        <button onClick={runSimulation} className="text-primary hover:underline mt-2 focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1">Run Simulation</button>
                    </div>
                )}
            </div>
        </div>
        
        {/* Selected Bin Details */}
        {selectedBin && selectedBin.examples && selectedBin.examples.length > 0 && (
            <Card title="Selected Range Details" className="mb-8 border-2 border-primary/30">
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                        <div>
                            <div className="text-xs text-navy-400 uppercase tracking-wider">Profit Range</div>
                            <div className="text-xl font-bold text-white">
                                {formatCurrency(selectedBin.rangeStart, currency)} to {formatCurrency(selectedBin.rangeEnd, currency)}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-navy-400 uppercase tracking-wider">Occurrences</div>
                            <div className="text-2xl font-black text-primary">{selectedBin.count}</div>
                            <div className="text-xs text-navy-500">({((selectedBin.count / results.length) * 100).toFixed(1)}% of simulations)</div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Example from This Range</h4>
                        <div className="bg-navy-950/50 p-4 rounded-lg border border-primary/20">
                            <div className="text-xs text-navy-400 mb-3">One simulation that produced {formatCurrency(selectedBin.examples[0].netProfit, currency)} profit:</div>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                <div className="bg-navy-900/50 p-3 rounded border border-white/5">
                                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Gasoline Volume</div>
                                    <div className={`text-white font-mono text-lg mb-1 ${varyVolume ? 'font-bold' : ''}`}>
                                        {selectedBin.examples[0].params.avgGasolineSold.toFixed(0)} L/day
                                    </div>
                                    <div className="text-xs text-navy-500">Baseline: {baseParams.avgGasolineSold.toLocaleString()} L/day</div>
                                    {varyVolume ? (
                                        <div className="text-xs text-warning mt-1">
                                            {((selectedBin.examples[0].params.avgGasolineSold / baseParams.avgGasolineSold - 1) * 100).toFixed(1)}% from baseline
                                        </div>
                                    ) : (
                                        <div className="text-xs text-navy-500 mt-1">Held constant</div>
                                    )}
                                </div>
                                
                                <div className="bg-navy-900/50 p-3 rounded border border-white/5">
                                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Gasoline Price</div>
                                    <div className={`text-white font-mono text-lg mb-1 ${varyPrice ? 'font-bold' : ''}`}>
                                        {formatCurrency(selectedBin.examples[0].params.gasolinePrice, currency)}/L
                                    </div>
                                    <div className="text-xs text-navy-500">Baseline: {formatCurrency(baseParams.gasolinePrice, currency)}/L</div>
                                    {varyPrice ? (
                                        <div className="text-xs text-warning mt-1">
                                            {((selectedBin.examples[0].params.gasolinePrice / baseParams.gasolinePrice - 1) * 100).toFixed(1)}% from baseline
                                        </div>
                                    ) : (
                                        <div className="text-xs text-navy-500 mt-1">Held constant</div>
                                    )}
                                </div>
                                
                                <div className="bg-navy-900/50 p-3 rounded border border-white/5">
                                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Recovery Rate</div>
                                    <div className={`text-white font-mono text-lg mb-1 ${varyRecovery ? 'font-bold' : ''}`}>
                                        {selectedBin.examples[0].params.recoveryRate.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-navy-500">Baseline: {baseParams.recoveryRate.toFixed(1)}%</div>
                                    {varyRecovery ? (
                                        <div className="text-xs text-warning mt-1">
                                            {((selectedBin.examples[0].params.recoveryRate / baseParams.recoveryRate - 1) * 100).toFixed(1)}% from baseline
                                        </div>
                                    ) : (
                                        <div className="text-xs text-navy-500 mt-1">Held constant</div>
                                    )}
                                </div>
                                
                                <div className="bg-navy-900/50 p-3 rounded border border-white/5">
                                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Revenue Share</div>
                                    <div className={`text-white font-mono text-lg mb-1 ${varyRevenueShare ? 'font-bold' : ''}`}>
                                        {selectedBin.examples[0].params.companyRevenueShare.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-navy-500">Baseline: {baseParams.companyRevenueShare.toFixed(1)}%</div>
                                    {varyRevenueShare ? (
                                        <div className="text-xs text-warning mt-1">
                                            {((selectedBin.examples[0].params.companyRevenueShare / baseParams.companyRevenueShare - 1) * 100).toFixed(1)}% from baseline
                                        </div>
                                    ) : (
                                        <div className="text-xs text-navy-500 mt-1">Held constant</div>
                                    )}
                                </div>
                                
                                <div className="bg-navy-900/50 p-3 rounded border border-white/5">
                                    <div className="text-xs text-navy-400 uppercase tracking-wider mb-1">Lease Term</div>
                                    <div className={`text-white font-mono text-lg mb-1 ${varyLeaseTerm ? 'font-bold' : ''}`}>
                                        {selectedBin.examples[0].params.leaseTerm} years
                                    </div>
                                    <div className="text-xs text-navy-500">Baseline: {baseParams.leaseTerm} years</div>
                                    {varyLeaseTerm ? (
                                        <div className="text-xs text-warning mt-1">
                                            {selectedBin.examples[0].params.leaseTerm - baseParams.leaseTerm > 0 ? '+' : ''}{selectedBin.examples[0].params.leaseTerm - baseParams.leaseTerm} years
                                        </div>
                                    ) : (
                                        <div className="text-xs text-navy-500 mt-1">Held constant</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Parameters Varied in Simulation</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                            <div className={`p-3 rounded border ${varyVolume ? 'bg-navy-950/50 border-warning/20' : 'bg-navy-950/20 border-white/5 opacity-50'}`}>
                                <div className="text-navy-400 mb-1 flex items-center justify-between">
                                    <span>Gasoline Volume</span>
                                    {varyVolume && <span className="text-warning">●</span>}
                                </div>
                                {varyVolume ? (
                                    <>
                                        <div className="text-white font-mono">
                                            {(baseParams.avgGasolineSold * (1 - uncertainty/100)).toFixed(0)} - {(baseParams.avgGasolineSold * (1 + uncertainty/100)).toFixed(0)} L/day
                                        </div>
                                        <div className="text-warning mt-1">±{uncertainty}% variation</div>
                                    </>
                                ) : (
                                    <div className="text-navy-500">Held constant at {baseParams.avgGasolineSold.toLocaleString()} L/day</div>
                                )}
                            </div>
                            
                            <div className={`p-3 rounded border ${varyPrice ? 'bg-navy-950/50 border-warning/20' : 'bg-navy-950/20 border-white/5 opacity-50'}`}>
                                <div className="text-navy-400 mb-1 flex items-center justify-between">
                                    <span>Gasoline Price</span>
                                    {varyPrice && <span className="text-warning">●</span>}
                                </div>
                                {varyPrice ? (
                                    <>
                                        <div className="text-white font-mono">
                                            {formatCurrency(baseParams.gasolinePrice * (1 - uncertainty/100), currency)}/L - {formatCurrency(baseParams.gasolinePrice * (1 + uncertainty/100), currency)}/L
                                        </div>
                                        <div className="text-warning mt-1">±{uncertainty}% variation</div>
                                    </>
                                ) : (
                                    <div className="text-navy-500">Held constant at {formatCurrency(baseParams.gasolinePrice, currency)}/L</div>
                                )}
                            </div>
                            
                            <div className={`p-3 rounded border ${varyRecovery ? 'bg-navy-950/50 border-warning/20' : 'bg-navy-950/20 border-white/5 opacity-50'}`}>
                                <div className="text-navy-400 mb-1 flex items-center justify-between">
                                    <span>Recovery Rate</span>
                                    {varyRecovery && <span className="text-warning">●</span>}
                                </div>
                                {varyRecovery ? (
                                    <>
                                        <div className="text-white font-mono">
                                            {Math.max(0, baseParams.recoveryRate * (1 - uncertainty/100)).toFixed(1)}% - {Math.min(100, baseParams.recoveryRate * (1 + uncertainty/100)).toFixed(1)}%
                                        </div>
                                        <div className="text-warning mt-1">±{uncertainty}% (clamped 0-100%)</div>
                                    </>
                                ) : (
                                    <div className="text-navy-500">Held constant at {baseParams.recoveryRate.toFixed(1)}%</div>
                                )}
                            </div>
                            
                            <div className={`p-3 rounded border ${varyRevenueShare ? 'bg-navy-950/50 border-warning/20' : 'bg-navy-950/20 border-white/5 opacity-50'}`}>
                                <div className="text-navy-400 mb-1 flex items-center justify-between">
                                    <span>Revenue Share</span>
                                    {varyRevenueShare && <span className="text-warning">●</span>}
                                </div>
                                {varyRevenueShare ? (
                                    <>
                                        <div className="text-white font-mono">
                                            {Math.max(0, baseParams.companyRevenueShare * (1 - uncertainty/100)).toFixed(1)}% - {Math.min(100, baseParams.companyRevenueShare * (1 + uncertainty/100)).toFixed(1)}%
                                        </div>
                                        <div className="text-warning mt-1">±{uncertainty}% (clamped 0-100%)</div>
                                    </>
                                ) : (
                                    <div className="text-navy-500">Held constant at {baseParams.companyRevenueShare.toFixed(1)}%</div>
                                )}
                            </div>
                            
                            <div className={`p-3 rounded border ${varyLeaseTerm ? 'bg-navy-950/50 border-warning/20' : 'bg-navy-950/20 border-white/5 opacity-50'}`}>
                                <div className="text-navy-400 mb-1 flex items-center justify-between">
                                    <span>Lease Term</span>
                                    {varyLeaseTerm && <span className="text-warning">●</span>}
                                </div>
                                {varyLeaseTerm ? (
                                    <>
                                        <div className="text-white font-mono">
                                            {Math.max(1, Math.round(baseParams.leaseTerm * (1 - uncertainty/100)))} - {Math.round(baseParams.leaseTerm * (1 + uncertainty/100))} years
                                        </div>
                                        <div className="text-warning mt-1">±{uncertainty}% (min 1 year)</div>
                                    </>
                                ) : (
                                    <div className="text-navy-500">Held constant at {baseParams.leaseTerm} years</div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Baseline Assumptions (Always Fixed)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Unit Cost</div>
                                <div className="text-white font-mono">{formatCurrency(baseParams.unitCost, currency)}</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Discount Rate</div>
                                <div className="text-white font-mono">{baseParams.discountRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Maintenance</div>
                                <div className="text-white font-mono">{formatCurrency(baseParams.annualMaintenanceCost, currency)}/yr</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Electricity</div>
                                <div className="text-white font-mono">{formatCurrency(baseParams.electricityPrice, currency)}/kWh</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Inflation</div>
                                <div className="text-white font-mono">{baseParams.inflationRate.toFixed(1)}%</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Units/Client</div>
                                <div className="text-white font-mono">{baseParams.unitsPerClient}</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Install Cost</div>
                                <div className="text-white font-mono">{formatCurrency(baseParams.installationCostPerUnit, currency)}</div>
                            </div>
                            <div className="bg-navy-950/30 p-3 rounded border border-white/5">
                                <div className="text-navy-400 mb-1">Volume Growth</div>
                                <div className="text-white font-mono">{baseParams.volumeGrowthRate.toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setSelectedBin(null)}
                        className="w-full bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-semibold transition-all border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        Close Details
                    </button>
                </div>
            </Card>
        )}
        
        {/* Methodology Explanation */}
        <div className="bg-navy-900/50 p-6 rounded-xl border border-white/5 mb-12">
            <h3 className="text-lg font-bold text-white mb-2">Methodology</h3>
            <p className="text-sm text-navy-300 leading-relaxed">
                This Monte Carlo simulation performs {simulationCount} random iterations to estimate the probability distribution of your project's Net Profit.
                For each iteration, the calculator randomly varies the enabled parameters—<strong>Gasoline Volume</strong>, <strong>Gasoline Price</strong>, and/or <strong>Recovery Rate</strong>—within the specified "Uncertainty Range" (Uniform Distribution).
                Click on any bar in the histogram to see a specific example from that profit range, including the exact parameter values used in that simulation.
            </p>
        </div>
    </div>
  );
};

export default MonteCarloAnalysis;
