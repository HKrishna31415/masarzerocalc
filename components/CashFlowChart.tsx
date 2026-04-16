
import React, { useMemo, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CalculatedResults, InputParams } from '../types';
import { ChartBarIcon, PresentationChartLineIcon } from './icons';

interface CashFlowChartProps {
  results: CalculatedResults;
  currency: string;
  inputs: InputParams;
  darkMode?: boolean;
}

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
};

const CustomTooltip = ({ active, payload, label, currency, darkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`border rounded-lg p-4 shadow-lg text-sm w-60 z-50 ${darkMode ? 'bg-navy-900 border-white/20' : 'bg-white border-slate-200'}`}>
        <p className={`font-bold text-base mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{label}</p>
        {payload.map((pld: any, index: number) => (
          <div className={`flex items-center justify-between ${index > 0 ? 'mt-2' : ''}`} key={pld.dataKey}>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pld.fill || pld.stroke }} />
              <span className={darkMode ? 'text-navy-200' : 'text-slate-600'}>{pld.name}:</span>
            </div>
            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(pld.value, currency)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


const CashFlowChart: React.FC<CashFlowChartProps> = ({ results, currency, inputs, darkMode = true }) => {
  const [viewMode, setViewMode] = useState<'cumulative' | 'annual'>('cumulative');

  const data = useMemo(() => {
    let cumulativeFlow = 0;
    let cumulativeDiscountedFlow = 0;
    const discountRate = inputs.discountRate / 100;

    return results.cashFlow.map((flow, index) => {
      cumulativeFlow += flow;

      if (index === 0) { // Year 0 is initial investment
        cumulativeDiscountedFlow += flow;
      } else {
        cumulativeDiscountedFlow += flow / Math.pow(1 + discountRate, index);
      }
      
      const yearData: any = {
        name: index === 0 ? 'Start' : `Year ${index}`,
        'Annual Flow': flow,
        'Cumulative Flow': cumulativeFlow,
      };

      if (inputs.enableCashFlowDiscounting) {
        yearData['Discounted Cumulative'] = cumulativeDiscountedFlow;
      }
      
      return yearData;
    });
  }, [results.cashFlow, inputs.enableCashFlowDiscounting, inputs.discountRate]);
  
  if (results.cashFlow.length <= 1) {
    return <div className="flex items-center justify-center h-full text-navy-400">Cash flow is not applicable.</div>
  }

  const discountedLineName = `Discounted (${inputs.discountRate}%)`;

  return (
    <div className="h-full w-full flex flex-col">
       <div className="flex justify-end px-4 pt-2 mb-2">
            <div className={`p-1 rounded-lg border flex space-x-1 ${darkMode ? 'bg-navy-900 border-white/10' : 'bg-slate-200 border-slate-300'}`}>
                <button
                    onClick={() => setViewMode('cumulative')}
                    className={`p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${darkMode ? 'focus:ring-offset-navy-900' : 'focus:ring-offset-slate-200'} ${viewMode === 'cumulative' ? (darkMode ? 'bg-primary text-white' : 'bg-white text-slate-900 shadow-sm') : (darkMode ? 'text-navy-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
                    title="Cumulative View"
                >
                    <PresentationChartLineIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('annual')}
                    className={`p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${darkMode ? 'focus:ring-offset-navy-900' : 'focus:ring-offset-slate-200'} ${viewMode === 'annual' ? (darkMode ? 'bg-primary text-white' : 'bg-white text-slate-900 shadow-sm') : (darkMode ? 'text-navy-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
                    title="Annual View"
                >
                    <ChartBarIcon className="w-4 h-4" />
                </button>
            </div>
       </div>

      <div className="flex-1 w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        {viewMode === 'cumulative' ? (
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} />
            <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} tick={{fontSize: 12}} />
            <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} tickFormatter={(v) => formatCurrency(v, currency)} tick={{fontSize: 12}} />
            <Tooltip 
                cursor={{ stroke: darkMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.3)', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={<CustomTooltip currency={currency} darkMode={darkMode} />}
            />
            <Legend wrapperStyle={{ color: darkMode ? '#e2e8f0' : '#334155', paddingTop: '10px' }} />
            <ReferenceLine y={0} stroke={darkMode ? "#f1f5f9" : "#334155"} strokeWidth={1} strokeDasharray="3 3" />
            <Line 
                type="monotone" 
                dataKey="Cumulative Flow" 
                stroke="#2DD4BF"
                strokeWidth={3} 
                activeDot={{ r: 6, strokeWidth: 0, fill: '#2DD4BF' }} 
                dot={false}
            />
            {inputs.enableCashFlowDiscounting && (
                <Line 
                type="monotone" 
                dataKey="Discounted Cumulative"
                name={discountedLineName}
                stroke="#8B5CF6"
                strokeWidth={2} 
                strokeDasharray="5 5"
                activeDot={{ r: 6, strokeWidth: 0, fill: '#8B5CF6' }} 
                dot={false}
                />
            )}
            </LineChart>
        ) : (
             <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} vertical={false} />
                <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} tick={{fontSize: 12}} />
                <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} tickFormatter={(v) => formatCurrency(v, currency)} tick={{fontSize: 12}} />
                <Tooltip 
                    cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                    content={<CustomTooltip currency={currency} darkMode={darkMode} />}
                />
                <Legend wrapperStyle={{ color: darkMode ? '#e2e8f0' : '#334155', paddingTop: '10px' }} />
                <ReferenceLine y={0} stroke={darkMode ? "#f1f5f9" : "#334155"} strokeWidth={1} />
                <Bar 
                    dataKey="Annual Flow" 
                    fill="#14B8A6"
                    radius={[4, 4, 0, 0]}
                >
                    {data.map((entry: any, index: number) => (
                         <React.Fragment key={`cell-${index}`}>
                             {/* Color negative bars red, positive teal */}
                            <text x={0} y={0} dy={0} fill="none" /> 
                         </React.Fragment>
                    ))}
                </Bar>
            </BarChart>
        )}
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
