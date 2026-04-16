
import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { VariableConfig, METRIC_CONFIG } from '../utils/sensitivityConfig';
import { AnalyzableMetric } from '../types';

interface SensitivityHeatmapProps {
  data: any[];
  xConfig: VariableConfig;
  yConfig: VariableConfig;
  metric: AnalyzableMetric;
  currency: string;
}

const CustomTooltip = ({ active, payload, currency, metric }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const metricConfig = METRIC_CONFIG[metric];
    return (
      <div className="bg-navy-900 border border-white/20 rounded-lg p-4 shadow-lg text-sm w-64 z-50">
        <div className="flex justify-between items-center">
          <span className="text-navy-300">{data.xLabel}:</span>
          <span className="font-bold text-white">{data.x.toLocaleString()} {data.xUnit}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-navy-300">{data.yLabel}:</span>
          <span className="font-bold text-white">{data.y.toLocaleString()} {data.yUnit}</span>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
          <span className="text-navy-300">{metricConfig.label}:</span>
          <span className="font-bold text-primary">{metricConfig.format(data.z, currency)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const HeatmapLegend: React.FC<{ min: number; max: number; metric: AnalyzableMetric; currency: string; }> = ({ min, max, metric, currency }) => {
    const metricConfig = METRIC_CONFIG[metric];
    return (
        <div className="flex items-center space-x-2 text-xs text-navy-300">
            <span className="text-danger">{metricConfig.format(min, currency)}</span>
            <div className="w-32 h-4 rounded" style={{ background: 'linear-gradient(to right, rgb(239, 68, 68), rgb(71, 85, 105), rgb(20, 184, 166))' }} />
            <span className="text-primary">{metricConfig.format(max, currency)}</span>
        </div>
    );
};

const SensitivityHeatmap: React.FC<SensitivityHeatmapProps> = ({ data, xConfig, yConfig, metric, currency }) => {
  const { minZ, maxZ } = useMemo(() => {
    if (!data || data.length === 0) return { minZ: 0, maxZ: 0 };
    const values = data.map(p => p.z);
    return { minZ: Math.min(...values), maxZ: Math.max(...values) };
  }, [data]);

  const getColor = (value: number) => {
    const absMax = Math.max(Math.abs(minZ), Math.abs(maxZ));
    if (absMax === 0) return 'rgb(71, 85, 105)'; // Neutral slate color

    const red = { r: 239, g: 68, b: 68 };     // #ef4444
    const neutral = { r: 71, g: 85, b: 105 }; // slate-600
    const primary = { r: 20, g: 184, b: 166 }; // Teal-500 (#14B8A6)

    let ratio;
    let r, g, b;

    if (value < 0) {
        ratio = value / -absMax; // ratio from 0 to 1 as value goes from 0 to -absMax
        r = Math.round(neutral.r + (red.r - neutral.r) * ratio);
        g = Math.round(neutral.g + (red.g - neutral.g) * ratio);
        b = Math.round(neutral.b + (red.b - neutral.b) * ratio);
    } else {
        ratio = value / absMax; // ratio from 0 to 1 as value goes from 0 to absMax
        r = Math.round(neutral.r + (primary.r - neutral.r) * ratio);
        g = Math.round(neutral.g + (primary.g - neutral.g) * ratio);
        b = Math.round(neutral.b + (primary.b - neutral.b) * ratio);
    }
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-navy-400">Select variables to generate heatmap.</div>;
  }
  
  return (
    <div className="h-full w-full">
       <div className="flex justify-end mb-4">
          <HeatmapLegend min={minZ} max={maxZ} metric={metric} currency={currency} />
       </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 10, right: 30, bottom: 20, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name={xConfig.label} 
            domain={['dataMin', 'dataMax']}
            stroke="#94a3b8"
            label={{ value: `${xConfig.label} (${xConfig.unit || ''})`, position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name={yConfig.label} 
            domain={['dataMin', 'dataMax']}
            stroke="#94a3b8"
            label={{ value: yConfig.label, angle: -90, position: 'left', offset: -25, fill: '#94a3b8' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.4)' }}
            content={<CustomTooltip currency={currency} metric={metric} />}
          />
          <Scatter data={data} shape="square">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.z)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensitivityHeatmap;
