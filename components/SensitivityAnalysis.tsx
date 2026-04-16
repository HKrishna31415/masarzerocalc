
import React, { useState, useMemo, useEffect } from 'react';
import { InputParams, AnalyzableVariable, AnalyzableMetric } from '../types';
import { calculateVaporRecovery } from '../utils/calculator';
import { SENSITIVITY_CONFIG, METRIC_CONFIG, CURRENCY_SYMBOLS } from '../utils/sensitivityConfig';
import SensitivityChart from './SensitivityChart';
import SensitivityHeatmap from './SensitivityHeatmap';
import TornadoChart from './TornadoChart';
import Card from './Card';
import Dropdown from './Dropdown';
import SliderInput from './SliderInput';
import ToggleSwitch from './ToggleSwitch';
import { AdjustmentsIcon, ChartBarIcon, TableIcon, SlidersIcon } from './icons';

interface SensitivityAnalysisProps {
  baseParams: InputParams;
  onBaseParamChange: (key: keyof InputParams, value: string | number | boolean) => void;
  currency: string;
}

type AnalysisMode = '1D' | '2D' | 'Tornado';

const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ baseParams, onBaseParamChange, currency }) => {
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('Tornado'); // Default to Tornado as it is high value
  
  const availableVariables = useMemo(() => {
    return (Object.keys(SENSITIVITY_CONFIG) as AnalyzableVariable[])
      .filter(key => SENSITIVITY_CONFIG[key].models.includes(baseParams.businessModel));
  }, [baseParams.businessModel]);

  const availableMetrics = useMemo(() => {
    const allMetrics = Object.keys(METRIC_CONFIG) as AnalyzableMetric[];
    if (baseParams.businessModel === 'Direct Sales') {
      return allMetrics.filter(m => m !== 'npv');
    }
    return allMetrics;
  }, [baseParams.businessModel]);
  
  const [analyzedVariableX, setAnalyzedVariableX] = useState<AnalyzableVariable>(availableVariables[0]);
  const [analyzedVariableY, setAnalyzedVariableY] = useState<AnalyzableVariable>(availableVariables[1] || availableVariables[0]);
  const [analyzedMetric, setAnalyzedMetric] = useState<AnalyzableMetric>(availableMetrics[0]);

  useEffect(() => {
    if (!availableVariables.includes(analyzedVariableX)) {
      setAnalyzedVariableX(availableVariables[0]);
    }
    if (!availableVariables.includes(analyzedVariableY)) {
      setAnalyzedVariableY(availableVariables[1] || availableVariables[0]);
    }
    if (!availableMetrics.includes(analyzedMetric)) {
        setAnalyzedMetric(availableMetrics[0]);
    }
  }, [availableVariables, availableMetrics, analyzedVariableX, analyzedVariableY, analyzedMetric]);

  const chartData = useMemo(() => {
    if (analysisMode === 'Tornado') {
        const baseResult = calculateVaporRecovery(baseParams);
        const baseMetricValue = baseResult.profitability.netProfit; // Force Net Profit for Tornado usually
        
        const tornadoData = availableVariables.map(variable => {
            const config = SENSITIVITY_CONFIG[variable];
            const baseVal = baseParams[variable] as number;
            
            // Perturb by +/- 20%
            const lowVal = baseVal * 0.8;
            const highVal = baseVal * 1.2;
            
            const lowParams = { ...baseParams, [variable]: lowVal };
            const highParams = { ...baseParams, [variable]: highVal };
            
            const lowRes = calculateVaporRecovery(lowParams);
            const highRes = calculateVaporRecovery(highParams);
            
            return {
                variable: config.label,
                low: lowRes.profitability.netProfit,
                high: highRes.profitability.netProfit,
                base: baseMetricValue,
                range: Math.abs(highRes.profitability.netProfit - lowRes.profitability.netProfit),
                lowLabel: '-20%',
                highLabel: '+20%'
            };
        });
        
        // Sort by range (impact) descending
        return tornadoData.sort((a, b) => b.range - a.range);
    }
    else if (analysisMode === '1D') {
      if (!analyzedVariableX) return [];
      const config = SENSITIVITY_CONFIG[analyzedVariableX];
      const data = [];
      const iterations = Math.min(100, Math.floor((config.max - config.min) / config.step) + 1);
      const step = (config.max - config.min) / (iterations - 1);

      for (let i = 0; i < iterations; i++) {
        const value = config.min + i * step;
        const modifiedParams: InputParams = { ...baseParams, [analyzedVariableX]: value };
        const results = calculateVaporRecovery(modifiedParams);
        const yValue = analyzedMetric === 'totalRevenue' ? results.revenue.totalRevenue : results.profitability[analyzedMetric];
        data.push({ xValue: value, yValue });
      }
      return data;
    } else { // 2D Mode
      if (!analyzedVariableX || !analyzedVariableY) return [];
      const xConfig = SENSITIVITY_CONFIG[analyzedVariableX];
      const yConfig = SENSITIVITY_CONFIG[analyzedVariableY];
      const data = [];
      const steps = 20; // Fixed steps for performance
      const xStep = (xConfig.max - xConfig.min) / (steps - 1);
      const yStep = (yConfig.max - yConfig.min) / (steps - 1);

      for (let i = 0; i < steps; i++) {
        const xValue = xConfig.min + i * xStep;
        for (let j = 0; j < steps; j++) {
          const yValue = yConfig.min + j * yStep;
          const modifiedParams: InputParams = { ...baseParams, [analyzedVariableX]: xValue, [analyzedVariableY]: yValue };
          const results = calculateVaporRecovery(modifiedParams);
          const zValue = analyzedMetric === 'totalRevenue' ? results.revenue.totalRevenue : results.profitability[analyzedMetric];
          data.push({ x: xValue, y: yValue, z: zValue, xLabel: xConfig.label, yLabel: yConfig.label, xUnit: xConfig.unit, yUnit: yConfig.unit });
        }
      }
      return data;
    }
  }, [analysisMode, analyzedVariableX, analyzedVariableY, analyzedMetric, baseParams, availableVariables]);

  const xConfig = SENSITIVITY_CONFIG[analyzedVariableX];
  const yConfig = SENSITIVITY_CONFIG[analyzedVariableY];
  const metricConfig = METRIC_CONFIG[analyzedMetric];

  return (
    <div className="w-full h-full flex flex-col p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      <div className="flex-shrink-0 flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
             {analysisMode === '1D' && <ChartBarIcon className="w-8 h-8 text-primary" />}
             {analysisMode === '2D' && <TableIcon className="w-8 h-8 text-primary" />}
             {analysisMode === 'Tornado' && <SlidersIcon className="w-8 h-8 text-primary" />}
             Sensitivity Analysis
          </h1>
          <p className="text-md text-navy-400 mt-1">
            {analysisMode === 'Tornado' ? 'Rank variables by their impact on Net Profit.' : 'Visualize variable correlations.'}
          </p>
        </div>
         <div className="flex items-center space-x-2">
           <button 
             className="flex items-center space-x-2 px-4 py-2 bg-primary text-navy-950 rounded-lg text-sm font-bold hover:bg-primary-light transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
             onClick={() => setIsControlsOpen(!isControlsOpen)}
           >
            <AdjustmentsIcon className="w-5 h-5"/>
            <span>Controls</span>
           </button>
        </div>
      </div>
      
      {isControlsOpen && (
         <div className="flex-shrink-0 my-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-navy-200 mb-2">Analysis Mode</label>
                    <div className="flex items-center p-1 space-x-1 bg-navy-900 rounded-lg">
                        {(['Tornado', '1D', '2D'] as AnalysisMode[]).map(mode => (
                            <button 
                                key={mode}
                                onClick={() => setAnalysisMode(mode)}
                                className={`w-full py-2 text-sm font-medium leading-5 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-navy-900
                                ${analysisMode === mode 
                                    ? 'bg-navy-950 shadow text-white border border-white/10' 
                                    : 'text-navy-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                {mode === 'Tornado' && <SlidersIcon className="w-4 h-4"/>}
                                {mode === '1D' && <ChartBarIcon className="w-4 h-4"/>}
                                {mode === '2D' && <TableIcon className="w-4 h-4" />}
                                <span>{mode}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {analysisMode !== 'Tornado' && (
                    <>
                        <div>
                            <Dropdown
                                label="Metric to Analyze"
                                options={availableMetrics.map(key => ({ value: key, label: METRIC_CONFIG[key].label }))}
                                value={analyzedMetric}
                                onChange={(val) => setAnalyzedMetric(val)}
                            />
                        </div>
                        <div>
                            <Dropdown
                                label={analysisMode === '1D' ? "Variable to Analyze" : "X-Axis Variable"}
                                options={availableVariables.map(key => ({ value: key, label: SENSITIVITY_CONFIG[key].label }))}
                                value={analyzedVariableX}
                                onChange={(val) => setAnalyzedVariableX(val)}
                            />
                        </div>
                        {analysisMode === '2D' && (
                            <div>
                                <Dropdown
                                    label="Y-Axis Variable"
                                    options={availableVariables.filter(v => v !== analyzedVariableX).map(key => ({ value: key, label: SENSITIVITY_CONFIG[key].label }))}
                                    value={analyzedVariableY}
                                    onChange={(val) => setAnalyzedVariableY(val)}
                                />
                            </div>
                        )}
                    </>
                )}
                {analysisMode === 'Tornado' && (
                     <div className="lg:col-span-2 flex items-center">
                         <p className="text-sm text-navy-400 italic">
                             The Tornado chart automatically analyzes all key inputs by varying them ±20% to determine which has the greatest impact on Net Profit.
                         </p>
                     </div>
                )}
            </div>
         </div>
      )}

      {/* Main Chart Area */}
      <div className="h-[500px] mb-8 shrink-0 bg-glass-200 border border-glass-border rounded-xl p-4">
        {analysisMode === 'Tornado' && (
            <TornadoChart data={chartData as any} currency={currency} />
        )}
        {analysisMode === '1D' && (
          <SensitivityChart 
            data={chartData}
            xKey="xValue"
            yKey="yValue"
            xLabel={`${xConfig?.label || ''} ${xConfig?.unit ? `(${xConfig.unit})` : ''}`}
            yLabel={metricConfig?.label || ''}
            currency={currency}
          />
        )}
        {analysisMode === '2D' && (
          <SensitivityHeatmap 
            data={chartData}
            xConfig={xConfig}
            yConfig={yConfig}
            metric={analyzedMetric}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
};

export default SensitivityAnalysis;
