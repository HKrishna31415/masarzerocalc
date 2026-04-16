
import React, { useState, useEffect } from 'react';
import { InputParams } from '../types';
import { CURRENCY_SYMBOLS } from '../utils/sensitivityConfig';

interface AssumptionsProps {
  params: InputParams;
  onParamChange: (key: keyof InputParams, value: string | number | boolean) => void;
  currency: string;
}

type AssumptionCategory = 'Pricing' | 'Costs' | 'Operations' | 'Sustainability';

interface AssumptionField {
  key: keyof InputParams;
  label: string;
  description: string;
  type: 'currency' | 'percent' | 'number';
  unit?: string;
  step?: number;
}

const CATEGORY_MAPPING: Record<AssumptionCategory, AssumptionField[]> = {
  Pricing: [
    { key: 'unitSalePrice', label: 'Unit Sales Price', description: 'Default selling price per unit for Direct Sales Model.', type: 'currency' },
    { key: 'gasolinePrice', label: 'Gasoline Price', description: 'Average market price for leasing revenue calculations.', type: 'currency' },
  ],
  Costs: [
    { key: 'unitCost', label: 'Unit Cost (COGS)', description: 'Cost of Goods Sold for a single vapor recovery unit.', type: 'currency' },
    // installationCostPerUnit moved to InputPanel for better UX as per user request
    { key: 'annualMaintenanceCost', label: 'Annual Maintenance', description: 'Yearly cost to maintain a single leased unit.', type: 'currency' },
    { key: 'maintenanceInflationRate', label: 'Maintenance Inflation', description: 'Annual % increase in maintenance costs (separate from general inflation).', type: 'percent' },
    { key: 'maintenanceEscalationYear', label: 'Maintenance Escalation Year', description: 'Year when maintenance costs increase significantly (e.g., warranty expiry).', type: 'number', unit: 'Year' },
    { key: 'annualWarrantyCost', label: 'Annual Warranty', description: 'Yearly warranty reserve or cost per unit.', type: 'currency' },
    { key: 'annualConsumablesCost', label: 'Annual Consumables', description: 'Cost of filters, fluids, or parts per year.', type: 'currency' },
    { key: 'consumablesInflationRate', label: 'Consumables Inflation', description: 'Annual % increase in consumables costs.', type: 'percent' },
    { key: 'dailyOperationalCost', label: 'Daily Ops Cost', description: 'General operational overhead per unit per day.', type: 'currency' },
    { key: 'customerAcquisitionCost', label: 'CAC', description: 'One-time cost to acquire a new client.', type: 'currency' },
  ],
  Operations: [
    { key: 'unitElectricityConsumptionKwhDay', label: 'Power Usage', description: 'Average daily electricity consumption per unit.', type: 'number', unit: 'kWh/Day' },
    { key: 'electricityPrice', label: 'Electricity Price', description: 'Cost per kWh for operational calculations.', type: 'currency', unit: '/kWh' },
    { key: 'electricityInflationRate', label: 'Electricity Inflation', description: 'Annual % increase in electricity costs.', type: 'percent' },
    { key: 'leaseTerm', label: 'Lease/Contract Term', description: 'Duration of lease or carbon management agreement.', type: 'number', unit: 'Years' },
    { key: 'discountRate', label: 'Discount Rate', description: 'Annual rate for NPV calculations.', type: 'percent' },
    { key: 'machineUptime', label: 'Machine Uptime', description: 'Percentage of time the machine is operational.', type: 'percent' },
    { key: 'volumeGrowthRate', label: 'Volume Growth Rate', description: 'Annual % increase in gasoline throughput.', type: 'percent' },
    { key: 'seasonalVolumeVariation', label: 'Seasonal Volume Swing', description: 'Percentage variation in volume due to seasonal demand (±).', type: 'percent' },
    { key: 'equipmentDegradationRate', label: 'Equipment Degradation', description: 'Annual % decline in equipment efficiency/recovery rate.', type: 'percent' },
  ],
  Sustainability: [
    { key: 'co2TonnesPerGallon', label: 'Emissions Factor', description: 'CO2 tonnes avoided per gallon recovered.', type: 'number', step: 0.000001, unit: 'Tonnes/Gal' },
    { key: 'pricePerCredit', label: 'Carbon Credit Price', description: 'Market price per ton of CO2 equivalent.', type: 'currency' },
    { key: 'recoveryRate', label: 'Recovery Rate', description: 'Efficiency of gasoline vapor recovery.', type: 'percent', step: 0.1 },
    { key: 'companyRevenueShare', label: 'Revenue Share', description: 'Percentage of recovered gasoline value shared with the company.', type: 'percent' },
  ],
};

const EditableCell: React.FC<{
  value: number;
  onChange: (val: number) => void;
  type: 'currency' | 'percent' | 'number';
  currencySymbol: string;
  unit?: string;
  step?: number;
}> = ({ value, onChange, type, currencySymbol, unit, step }) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    let num = parseFloat(localValue);
    if (isNaN(num)) num = 0;
    onChange(num);
    setLocalValue(num.toString());
  };

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-slate-500 dark:text-navy-400 font-medium">
          {type === 'currency' ? currencySymbol : ''}
        </span>
      </div>
      <input
        type="number"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        step={step || (type === 'percent' ? 0.1 : 1)}
        className={`bg-white dark:bg-navy-950/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-primary focus:border-primary block w-full p-2.5 outline-none transition-all
          ${type === 'currency' ? 'pl-7' : 'pl-3'}
          ${(type === 'percent' || unit) ? 'pr-12' : 'pr-3'}
        `}
      />
      {(type === 'percent' || unit) && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-500 dark:text-navy-400 font-medium text-xs">
            {type === 'percent' ? '%' : unit}
          </span>
        </div>
      )}
    </div>
  );
};

const Assumptions: React.FC<AssumptionsProps> = ({ params, onParamChange, currency }) => {
  const [activeTab, setActiveTab] = useState<AssumptionCategory>('Pricing');
  const tabs: AssumptionCategory[] = ['Pricing', 'Costs', 'Operations', 'Sustainability'];
  const currentFields = CATEGORY_MAPPING[activeTab];

  return (
    <div className="w-full p-6 lg:p-8 overflow-y-auto pb-24">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Model Assumptions</h1>
          <p className="text-md text-slate-500 dark:text-navy-400 mt-1">Configure global constants and default values used in the model.</p>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center p-1 space-x-1 bg-slate-200 dark:bg-navy-900 rounded-lg max-w-2xl">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-sm font-medium leading-5 rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset
                ${activeTab === tab 
                  ? 'bg-gradient-primary shadow-glow text-slate-900 dark:text-white' 
                  : 'text-slate-500 dark:text-navy-400 hover:bg-slate-50 dark:bg-white/5 hover:text-slate-900 dark:text-white'
                }`
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-lg animate-in fade-in duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-navy-200">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider w-1/4">Parameter</th>
                <th scope="col" className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider w-1/4">Value</th>
                <th scope="col" className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-wider w-1/2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {currentFields.map((field) => (
                <tr key={field.key} className="hover:bg-slate-50 dark:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap align-middle">
                    {field.label}
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <EditableCell 
                      value={params[field.key] as number}
                      onChange={(val) => onParamChange(field.key, val)}
                      type={field.type}
                      currencySymbol={CURRENCY_SYMBOLS[currency]}
                      unit={field.unit}
                      step={field.step}
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-navy-400 align-middle leading-relaxed">
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 dark:text-navy-400 bg-slate-200 dark:bg-navy-900/50 p-4 rounded-lg border border-white/5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Changes made here immediately affect the calculation model and sensitivity analysis results.</p>
      </div>
    </div>
  );
};

export default Assumptions;
