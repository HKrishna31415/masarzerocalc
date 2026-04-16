
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SensitivityChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  xLabel: string;
  yLabel: string;
  currency: string;
  darkMode?: boolean;
}

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
};

const CustomTooltip = ({ active, payload, label, xLabel, yLabel, currency, darkMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`${darkMode ? 'bg-navy-900 border-white/20' : 'bg-white border-slate-200'} border rounded-lg p-4 shadow-lg text-sm w-64 z-50`}>
        <div className="flex justify-between items-center">
            <span className={darkMode ? 'text-navy-300' : 'text-slate-600'}>{xLabel}:</span>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.xValue.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
            <span className={darkMode ? 'text-navy-300' : 'text-slate-600'}>{yLabel}:</span>
            <span className="font-bold text-primary">{formatCurrency(data.yValue, currency)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const SensitivityChart: React.FC<SensitivityChartProps> = ({ data, xKey, yKey, xLabel, yLabel, currency, darkMode = true }) => {
  if (!data || data.length === 0) {
    return <div className={`flex items-center justify-center h-full ${darkMode ? 'text-navy-400' : 'text-slate-400'}`}>Select a variable to analyze.</div>;
  }
  
  const axisColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 40,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey={xKey} 
            stroke={axisColor} 
            tick={{ fontSize: 12, fill: axisColor }}
            label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: axisColor }}
          />
          <YAxis 
            stroke={axisColor} 
            tickFormatter={(v) => formatCurrency(v, currency)} 
            tick={{ fontSize: 12, fill: axisColor }}
            label={{ value: yLabel, angle: -90, position: 'left', offset: -25, fill: axisColor }}
          />
          <Tooltip 
             cursor={{ stroke: 'rgba(20, 184, 166, 0.2)', strokeWidth: 1 }}
             content={<CustomTooltip xLabel={xLabel} yLabel={yLabel} currency={currency} darkMode={darkMode} />}
          />
          <Line 
            type="monotone" 
            dataKey={yKey} 
            name={yLabel}
            stroke="#14B8A6" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#14B8A6', stroke: darkMode ? '#0A0A0A' : '#FFFFFF', strokeWidth: 2 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensitivityChart;
