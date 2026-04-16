
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { CalculatedResults } from '../types';

interface ProfitabilityChartProps {
  results: CalculatedResults;
  currency: string;
  darkMode?: boolean;
}

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
};

const CustomTooltip = ({ active, payload, currency, darkMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className={`border rounded-lg p-3 shadow-lg text-sm z-50 ${darkMode ? 'bg-navy-900 border-white/10' : 'bg-white border-slate-200'}`}>
        <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{data.name}</p>
        <p className={darkMode ? 'text-navy-200' : 'text-slate-600'}>{formatCurrency(data.value, currency)}</p>
      </div>
    );
  }
  return null;
};


const ProfitWaterfallChart: React.FC<ProfitabilityChartProps> = ({ results, currency, darkMode = true }) => {
  const { revenue, costs, profitability } = results;

  const chartData = useMemo(() => {
    const data = [
      { name: 'Leasing Rev', value: revenue.leasingRevenue },
      { name: 'Sales Rev', value: revenue.salesRevenue },
      { name: 'Install Rev', value: revenue.installationRevenue },
      { name: 'Spare Parts', value: revenue.sparePartsRevenue },
      { name: 'SaaS Fees', value: revenue.monthlyFeeRevenue },
      { name: 'Carbon Credits', value: revenue.carbonCreditRevenue },
      { name: 'COGS', value: -costs.cogs },
      { name: 'Install Cost', value: -costs.installationCost },
      { name: 'Maintenance', value: -costs.maintenanceCost },
      { name: 'Warranty', value: -costs.warrantyCost },
      { name: 'Consumables', value: -costs.consumablesCost },
      { name: 'Operations', value: -costs.operationalCost },
      { name: 'Electricity', value: -costs.electricityCost },
      { name: 'CAC', value: -costs.customerAcquisitionCost },
    ]
    .filter(d => Math.abs(d.value) > 1); // Filter out trivial values

    // Add Net Profit as the final bar (representing the total)
    data.push({ name: 'Net Profit', value: profitability.netProfit });

    return data;

  }, [results]);
  
  const COLORS = {
    revenue: '#10B981',
    cost: '#EF4444',
    profit: '#10B981', // Green for the final total
  };

  return (
    <div className="h-full w-full flex-1 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          barCategoryGap="15%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
          <XAxis type="number" stroke={darkMode ? "#94a3b8" : "#64748b"} tickFormatter={(v) => formatCurrency(v, currency)} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke={darkMode ? "#94a3b8" : "#64748b"} 
            width={100}
            interval={0}
            tick={{fontSize: 11}}
          />
          <Tooltip 
            cursor={{ fill: darkMode ? 'rgba(20, 184, 166, 0.05)' : 'rgba(20, 184, 166, 0.1)' }}
            content={<CustomTooltip currency={currency} darkMode={darkMode} />}
          />
          <ReferenceLine x={0} stroke={darkMode ? "#f1f5f9" : "#334155"} strokeWidth={2} />
          <Bar dataKey="value" radius={[4, 4, 4, 4]}>
            {chartData.map((entry, index) => {
                let color = entry.value >= 0 ? COLORS.revenue : COLORS.cost;
                if (entry.name === 'Net Profit') color = COLORS.profit;
                return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProfitWaterfallChart;
