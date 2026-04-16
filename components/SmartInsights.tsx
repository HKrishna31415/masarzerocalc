
import React, { useMemo } from 'react';
import { CalculatedResults, InputParams } from '../types';
import { ShieldCheckIcon, TreeIcon, LightningIcon, AdjustmentsIcon } from './icons';

interface SmartInsightsProps {
  results: CalculatedResults;
  inputs: InputParams;
  currency: string;
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ results, inputs, currency }) => {
  const insights = useMemo(() => {
    const list = [];
    const { profitability, impact, costs } = results;

    const formatPaybackPeriod = (period: number): string => {
        if (period < 0) return 'Never';
        return `${period.toFixed(1)}y`;
    };

    // 1. Payback Insight
    if (profitability.paybackPeriod < 0) {
        list.push({
            type: 'danger',
            title: 'No Payback',
            message: `This project never breaks even. Revenue is insufficient to cover costs. Consider adjusting pricing or reducing expenses.`
        });
    } else if (profitability.paybackPeriod > inputs.leaseTerm) {
        list.push({
            type: 'danger',
            title: 'ROI Risk',
            message: `Payback period (${formatPaybackPeriod(profitability.paybackPeriod)}) exceeds lease term. Consider increasing revenue share or extending the contract.`
        });
    } else if (profitability.paybackPeriod < 2) {
         list.push({
            type: 'success',
            title: 'High Velocity',
            message: `Exceptional payback period of ${formatPaybackPeriod(profitability.paybackPeriod)}. This is a highly compelling sales argument.`
        });
    }

    // 2. OpEx Warning
    const opexRatio = (costs.maintenanceCost + costs.operationalCost + costs.electricityCost) / results.revenue.totalRevenue;
    if (opexRatio > 0.3) {
        list.push({
            type: 'warning',
            title: 'High Operational Costs',
            message: `OpEx is consuming ${(opexRatio * 100).toFixed(0)}% of revenue. Check electricity rates or maintenance assumptions.`
        });
    }

    // 3. Volume Sensitivity
    if (impact.safetyMargin < 10) {
        list.push({
            type: 'warning',
            title: 'Volume Sensitivity',
            message: `Safety margin is only ${impact.safetyMargin.toFixed(1)}%. A small drop in gasoline volume could turn ROI negative.`
        });
    }

    // 4. Pricing / Revenue Share
    if (inputs.businessModel === 'Leasing' && inputs.companyRevenueShare < 30) {
        list.push({
            type: 'info',
            title: 'Revenue Share Opportunity',
            message: `Current revenue share ( ${inputs.companyRevenueShare}%) is below industry standard. Increasing to 35% improves NPV by significant margin.`
        });
    }

    return list.slice(0, 3); // Top 3 insights
  }, [results, inputs]);

  if (insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        {insights.map((insight, idx) => (
            <div 
                key={idx} 
                className={`p-4 rounded-xl border flex items-start space-x-3 backdrop-blur-md transition-colors
                    ${insight.type === 'success' ? 'bg-emerald-50 dark:bg-success/10 border-emerald-200 dark:border-success/30' : 
                      insight.type === 'danger' ? 'bg-red-50 dark:bg-danger/10 border-red-200 dark:border-danger/30' : 
                      insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30' :
                      'bg-emerald-50 dark:bg-primary/10 border-emerald-200 dark:border-primary/30'
                    }
                `}
            >
                <div className={`mt-0.5 ${
                      insight.type === 'success' ? 'text-emerald-600 dark:text-success' : 
                      insight.type === 'danger' ? 'text-red-600 dark:text-danger' : 
                      insight.type === 'warning' ? 'text-yellow-600 dark:text-yellow-500' :
                      'text-emerald-600 dark:text-primary'
                }`}>
                    {insight.type === 'success' ? <ShieldCheckIcon className="w-5 h-5"/> : 
                     insight.type === 'warning' ? <LightningIcon className="w-5 h-5"/> :
                     <AdjustmentsIcon className="w-5 h-5"/>
                    }
                </div>
                <div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                        insight.type === 'success' ? 'text-emerald-800 dark:text-success-light' : 
                        insight.type === 'danger' ? 'text-red-800 dark:text-danger-light' : 
                        insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                        'text-emerald-800 dark:text-primary-light'
                    }`}>{insight.title}</h4>
                    <p className="text-sm text-slate-700 dark:text-white/90 leading-snug">{insight.message}</p>
                </div>
            </div>
        ))}
    </div>
  );
};

export default SmartInsights;
