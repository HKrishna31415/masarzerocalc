
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { InputParams, Scenario } from '../types';
import { calculateVaporRecovery } from '../utils/calculator';

interface FootballFieldChartProps {
  scenarios: { name: string; params: InputParams; isCurrent?: boolean }[];
  currency: string;
}

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload; // The colored bar payload
    if (!data) return null;
    
    const fmt = (val: number) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(val);

    return (
      <div className="bg-navy-900 border border-white/20 rounded-lg p-4 shadow-lg text-sm w-64 z-50">
        <p className="font-bold text-white text-base mb-2 border-b border-white/10 pb-2">{data.name}</p>
        
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="text-danger font-bold text-xs">Pessimistic</span>
                <span className="text-white font-mono">{fmt(data.low)}</span>
            </div>
            <div className="flex justify-between">
                 <span className="text-navy-300 font-bold text-xs">Base Case</span>
                 <span className="text-white font-mono border-b border-primary/50">{fmt(data.base)}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-success font-bold text-xs">Optimistic</span>
                <span className="text-white font-mono">{fmt(data.high)}</span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

const FootballFieldChart: React.FC<FootballFieldChartProps> = ({ scenarios, currency }) => {
  const chartData = useMemo(() => {
    return scenarios.map(scenario => {
        // Base Calculation
        const baseRes = calculateVaporRecovery(scenario.params);
        const baseVal = baseRes.profitability.netProfit;

        // Pessimistic (-15% on drivers: Price, Recovery, Volume)
        const pessParams = { 
            ...scenario.params,
            gasolinePrice: scenario.params.gasolinePrice * 0.85,
            avgGasolineSold: scenario.params.avgGasolineSold * 0.85,
            recoveryRate: Math.max(0, scenario.params.recoveryRate * 0.85)
        };
        const pessRes = calculateVaporRecovery(pessParams);
        const lowVal = pessRes.profitability.netProfit;

        // Optimistic (+15% on drivers)
        const optParams = { 
            ...scenario.params,
            gasolinePrice: scenario.params.gasolinePrice * 1.15,
            avgGasolineSold: scenario.params.avgGasolineSold * 1.15,
            recoveryRate: Math.min(1, scenario.params.recoveryRate * 1.15)
        };
        const optRes = calculateVaporRecovery(optParams);
        const highVal = optRes.profitability.netProfit;

        const spread = highVal - lowVal;

        return {
            name: scenario.name,
            low: lowVal,
            base: baseVal,
            high: highVal,
            start: lowVal, // Start of the bar (transparent)
            spread: spread, // Visible width
            isCurrent: scenario.isCurrent
        };
    }).sort((a, b) => b.base - a.base); // Sort by Base Value

  }, [scenarios]);

  const allValues = chartData.flatMap(d => [d.low, d.high]);
  const minDomain = Math.min(...allValues) * (Math.min(...allValues) < 0 ? 1.1 : 0.9);
  const maxDomain = Math.max(...allValues) * 1.1;

  const formatTick = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(val);

  return (
    <div className="h-full w-full min-h-[400px]">
        <div className="mb-2 text-center">
            <p className="text-xs text-navy-400 italic">
               Range based on ±15% sensitivity on Price, Volume, and Recovery.
            </p>
        </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            type="number" 
            domain={[minDomain, maxDomain]} 
            tickFormatter={formatTick}
            stroke="#94a3b8"
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="#94a3b8" 
            width={140}
            tick={({ x, y, payload }) => {
                 const isCurrent = chartData.find(c => c.name === payload.value)?.isCurrent;
                 return (
                     <g transform={`translate(${x},${y})`}>
                         <text x={-10} y={4} textAnchor="end" fill={isCurrent ? '#14B8A6' : '#94a3b8'} fontSize={11} fontWeight={isCurrent ? 700 : 400}>
                             {payload.value}
                         </text>
                     </g>
                 )
            }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
            content={<CustomTooltip currency={currency} />} 
          />
          
          {/* Invisible Bar to offset start */}
          <Bar dataKey="start" stackId="a" fill="transparent" isAnimationActive={false} />
          
          {/* Visible Range Bar */}
          <Bar dataKey="spread" stackId="a" radius={[4, 4, 4, 4]}>
            {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="url(#scenarioGradient)" stroke={entry.isCurrent ? '#14B8A6' : 'none'} strokeWidth={1} />
            ))}
          </Bar>

          {/* Reference Line for "Zero" */}
          <ReferenceLine x={0} stroke="#475569" />

          <defs>
            <linearGradient id="scenarioGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#EF4444" stopOpacity={0.7} />
              <stop offset="50%" stopColor="#14B8A6" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.7} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FootballFieldChart;
