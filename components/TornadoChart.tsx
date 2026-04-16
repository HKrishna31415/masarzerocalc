
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from 'recharts';

interface TornadoChartProps {
  data: {
    variable: string;
    low: number;
    high: number;
    base: number;
    range: number;
    lowLabel: string;
    highLabel: string;
  }[];
  currency: string;
}

const formatCurrencyCompact = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
};

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-900 border border-white/20 rounded-lg p-3 shadow-lg text-sm z-50 min-w-[200px]">
        <p className="font-bold text-white border-b border-white/10 pb-2 mb-2">{data.variable}</p>
        <div className="space-y-1">
            <div className="flex justify-between">
                <span className="text-danger text-xs">Low Case (-20%)</span>
                <span className="font-mono text-white">{formatCurrencyCompact(data.low, currency)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-navy-400 text-xs">Base Case</span>
                <span className="font-mono text-navy-300">{formatCurrencyCompact(data.base, currency)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-success text-xs">High Case (+20%)</span>
                <span className="font-mono text-white">{formatCurrencyCompact(data.high, currency)}</span>
            </div>
             <div className="flex justify-between pt-2 border-t border-white/5 mt-1">
                <span className="text-navy-400 text-xs font-bold uppercase">Impact Swing</span>
                <span className="font-mono text-primary font-bold">{formatCurrencyCompact(data.range, currency)}</span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

const TornadoChart: React.FC<TornadoChartProps> = ({ data, currency }) => {
  // Transform data for charting: 
  // We need bars that span from min to max. 
  // Recharts doesn't do "floating bars" easily without a tuple dataKey, but easier is to use a stacked bar with a transparent base.
  
  const chartData = data.map(d => ({
      ...d,
      start: Math.min(d.low, d.high),
      length: Math.abs(d.high - d.low),
      isPositiveCorrelation: d.high > d.low // True if increasing input increases profit
  }));

  const minValue = Math.min(...chartData.map(d => d.start)) * 0.9;
  const maxValue = Math.max(...chartData.map(d => d.start + d.length)) * 1.1;

  return (
    <div className="h-full w-full">
      <div className="flex justify-end mb-2">
          <div className="flex items-center space-x-4 text-xs text-navy-400">
              <div className="flex items-center"><div className="w-3 h-3 bg-success rounded mr-1"></div> Positive Impact</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-danger rounded mr-1"></div> Negative Impact</div>
          </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          barSize={24}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            type="number" 
            domain={[minValue, maxValue]} 
            tickFormatter={(v) => formatCurrencyCompact(v, currency)}
            stroke="#94a3b8"
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            type="category" 
            dataKey="variable" 
            stroke="#94a3b8" 
            width={120}
            tick={{ fontSize: 11, fill: '#cbd5e1' }}
          />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <ReferenceLine x={data[0]?.base || 0} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Base', position: 'top', fill: '#94a3b8', fontSize: 10 }} />
          
          {/* Transparent Bar to offset */}
          <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
          
          {/* Actual Range Bar */}
          <Bar dataKey="length" stackId="a" radius={[4, 4, 4, 4]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isPositiveCorrelation ? '#10B981' : '#EF4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TornadoChart;
