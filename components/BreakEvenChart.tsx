
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

interface BreakEvenChartProps {
  fixedCost: number; // Annualized Fixed OpEx + CapEx Amortization
  variableRevenuePerUnit: number; // Revenue per unit volume
  currentVolume: number;
  breakEvenVolume: number;
  unitLabel: string;
  currency: string;
  darkMode?: boolean;
}

const formatCurrencyCompact = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
};

const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ fixedCost, variableRevenuePerUnit, currentVolume, breakEvenVolume, unitLabel, currency, darkMode = true }) => {
  
  // Generate data points
  // Range: 0 to 1.5x of max(current, breakeven)
  const maxVol = Math.max(currentVolume, breakEvenVolume) * 1.5;
  const steps = 10;
  const data = [];
  
  for(let i=0; i<=steps; i++) {
      const vol = (maxVol / steps) * i;
      data.push({
          volume: vol,
          revenue: vol * variableRevenuePerUnit,
          cost: fixedCost, // Simplified: Assuming mostly fixed costs for the visualization context (Machine Leasing)
      });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
          return (
              <div className={`${darkMode ? 'bg-navy-900 border-white/20' : 'bg-white border-slate-200'} border rounded-lg p-3 shadow-lg text-sm`}>
                  <div className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-2`}>{Math.round(label).toLocaleString()} {unitLabel}</div>
                  <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                          <span className="text-success">Revenue:</span>
                          <span className={`font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrencyCompact(payload[0].value, currency)}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                          <span className="text-danger">Cost:</span>
                          <span className={`font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrencyCompact(payload[1].value, currency)}</span>
                      </div>
                  </div>
              </div>
          )
      }
      return null;
  };

  const axisColor = darkMode ? '#94a3b8' : '#64748b';
  const gridColor = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 50, left: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="volume" 
            type="number"
            domain={[0, maxVol]}
            tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 11 }}
            label={{ value: `Daily Volume (${unitLabel})`, position: 'insideBottom', offset: -15, fill: axisColor, fontSize: 11 }}
          />
          <YAxis 
            tickFormatter={(v) => formatCurrencyCompact(v, currency)}
            stroke={axisColor}
            tick={{ fill: axisColor, fontSize: 11 }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Lines */}
          <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={false} name="Revenue" />
          <Line type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={3} dot={false} name="Total Cost" />
          
          {/* Break Even Point */}
          <ReferenceLine 
            x={breakEvenVolume} 
            stroke="#F59E0B" 
            strokeDasharray="5 5" 
            label={{ value: 'BE', position: 'top', fill: '#F59E0B', fontSize: 11, fontWeight: 'bold' }} 
          />
          
          {/* Current Volume */}
          <ReferenceLine 
            x={currentVolume} 
            stroke="#fff" 
            strokeWidth={2} 
            label={{ value: 'Now', position: 'top', fill: '#fff', fontSize: 11, fontWeight: 'bold' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BreakEvenChart;
