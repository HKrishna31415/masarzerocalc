
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalculatedResults } from '../types';

interface CostBreakdownChartProps {
  results: CalculatedResults;
  currency: string;
  darkMode?: boolean;
}

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
};

const CustomTooltip = ({ active, payload, currency, darkMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={`border rounded-lg p-3 shadow-lg text-sm z-50 ${darkMode ? 'bg-navy-900 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.payload.fill }}></div>
            <span className={darkMode ? 'text-navy-400' : 'text-slate-600'}>{data.name}:</span>
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(data.value, currency)}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CostBreakdownChart: React.FC<CostBreakdownChartProps> = ({ results, currency, darkMode = true }) => {
  const { costs } = results;
  
  const data = [
    { name: 'Hardware (COGS)', value: costs.cogs },
    { name: 'Installation', value: costs.installationCost },
    { name: 'Maintenance', value: costs.maintenanceCost },
    { name: 'Operations & Power', value: costs.operationalCost + costs.electricityCost },
    { name: 'Warranty & Consumables', value: costs.warrantyCost + costs.consumablesCost },
    { name: 'Taxes', value: costs.totalTaxes },
    { name: 'Loan Interest', value: costs.loanInterestCost },
  ].filter(d => d.value > 0);

  // Red/Orange/Pink Palette for Costs
  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EC4899', '#8B5CF6', '#64748B', '#94A3B8']; 
  
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-navy-400">No cost data available.</div>
  }

  return (
    <div className="h-full w-full flex-1 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip currency={currency} darkMode={darkMode} />} />
          <Legend wrapperStyle={{ color: darkMode ? '#e2e8f0' : '#334155', fontSize: '12px' }} />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60} // Donut style
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostBreakdownChart;
