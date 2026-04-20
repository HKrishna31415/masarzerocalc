
import React, { useState, useContext } from 'react';
import { InputParams } from '../types';
import ToggleSwitch from './ToggleSwitch';
import SliderInput from './SliderInput';
import TextInput from './TextInput';
import SegmentedControl from './SegmentedControl';
import SelectInput from './SelectInput';
import { CURRENCY_SYMBOLS } from '../utils/sensitivityConfig';
import { ChevronDownIcon, ChevronUpIcon, ShareIcon, CheckIcon, LightningIcon, CalculatorIcon, SlidersIcon, BriefcaseIcon, RefreshIcon } from './icons';
import { PRESETS } from '../utils/presets';
import { LangContext } from '../utils/langContext';

interface InputPanelProps {
  params: InputParams;
  onParamChange: (key: keyof InputParams, value: string | number | boolean) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

// Machine Hardware Presets (Base EXW costs - adjust for FOB/DDP)
const HARDWARE_PRESETS = [
    { name: 'KSM-5',    unitCost: 18000,  power: 2.2,  rate: 21,  maintenance: 500,  install: 1500  },
    { name: 'AWVR',     unitCost: 19000,  power: 3.0,  rate: 30,  maintenance: 750,  install: 2000  },
    { name: 'GEVLR-2',  unitCost: 15000,  power: 4.0,  rate: 42,  maintenance: 1000, install: 3000  },
    { name: 'GEVLR-3',  unitCost: 22000,  power: 12.0, rate: 126, maintenance: 1000, install: 5000  },
    { name: 'KSM-1000', unitCost: 500000, power: 50.0, rate: 1000, maintenance: 5000, install: 20000 },
    { name: 'MZ-1',     unitCost: 50000,  power: 24.0, rate: 252, maintenance: 1000, install: 8000  },
];

// Accordion Item Component
const AccordionItem: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  hidden?: boolean;
}> = ({ title, isOpen, onToggle, children, badge, hidden }) => {
  if (hidden) return null;
  return (
    <div className={`border border-slate-200 dark:border-glass-border rounded-xl overflow-hidden mb-3 transition-all duration-300 ${isOpen ? 'bg-white dark:bg-glass-200 shadow-lg' : 'bg-slate-50 dark:bg-glass-100 hover:bg-slate-100 dark:hover:bg-glass-200'}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-3">
             <span className={`font-bold text-sm ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-navy-200'}`}>{title}</span>
             {badge && <span className="text-[10px] uppercase font-bold bg-primary/10 dark:bg-white/10 text-primary-dark dark:text-primary-light px-2 py-0.5 rounded-full border border-primary/20 dark:border-white/10 tracking-wide shadow-sm">{badge}</span>}
        </div>
        {isOpen ? <ChevronUpIcon className="w-4 h-4 text-primary" /> : <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-navy-400" />}
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 pt-0 space-y-5 border-t border-slate-200 dark:border-glass-border bg-slate-50/50 dark:bg-black/10">
            <div className="h-2"></div> {/* Spacer */}
            {children}
        </div>
      </div>
    </div>
  );
};

const InputPanel: React.FC<InputPanelProps> = ({ params, onParamChange, currency, onCurrencyChange, darkMode, onToggleDarkMode }) => {
  const { t } = useContext(LangContext);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'client': true,
    'operations': false,
    'financials': true,
    'carbon': false,
    'advanced': false,
    'finance': false,
  });
  const [copied, setCopied] = useState(false);
  const [persona, setPersona] = useState<'sales' | 'analyst'>('sales');

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const applyPreset = (presetName: string) => {
      const preset = PRESETS.find(p => p.name === presetName);
      if (preset) {
          // Bulk update
          Object.entries(preset.params).forEach(([key, value]) => {
              onParamChange(key as keyof InputParams, value);
          });
      }
  };

  const applyHardwarePreset = (name: string) => {
      const hw = HARDWARE_PRESETS.find(h => h.name === name);
      if (hw) {
          onParamChange('unitCost', hw.unitCost);
          onParamChange('hardwarePowerRatingKw', hw.power);
          onParamChange('hardwareProcessingRateLph', hw.rate);
          onParamChange('unitElectricityConsumptionKwhDay', hw.power); // Set fixed fallback
          onParamChange('annualMaintenanceCost', hw.maintenance);
          onParamChange('installationCostPerUnit', hw.install);
          onParamChange('hardwareType', hw.name);
      }
  }
  
  const handleShare = () => {
    const dataStr = btoa(JSON.stringify({ params, currency }));
    const url = `${window.location.origin}${window.location.pathname}#config=${dataStr}`;
    navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all parameters to their default values?")) {
      const defaultPreset = PRESETS.find(p => p.name === 'Standard Hardware');
      if (defaultPreset) {
        Object.entries(defaultPreset.params).forEach(([key, value]) => {
            onParamChange(key as keyof InputParams, value);
        });
      }
    }
  };
  
  const installationPrice = params.installationCostPerUnit * (1 + (params.installationMargin || 0) / 100);

  return (
    // On Desktop: h-full flex flex-col to fill the sidebar pane.
    // On Mobile: h-auto block to allow natural page scrolling.
    <div id="input-panel-container" className="lg:h-full flex flex-col">
        {/* Header Config */}
        <div className="mb-4 space-y-4 p-1 flex-shrink-0">
             {/* Persona Toggle & Dark Mode */}
             <div className="flex gap-2 mb-2">
                 <div className="flex-1 flex bg-slate-200 dark:bg-navy-900 p-1 rounded-lg border border-slate-300 dark:border-white/10">
                    <button 
                        onClick={() => setPersona('sales')}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-900 ${persona === 'sales' ? 'bg-white dark:bg-primary text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <BriefcaseIcon className="w-3 h-3" />
                        {t('salesMode')}
                    </button>
                    <button 
                         onClick={() => setPersona('analyst')}
                         className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-900 ${persona === 'analyst' ? 'bg-white dark:bg-secondary text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <LightningIcon className="w-3 h-3" />
                        {t('analystMode')}
                    </button>
                 </div>
                 <button
                    onClick={onToggleDarkMode}
                    className="bg-slate-200 dark:bg-navy-900 hover:bg-slate-300 dark:hover:bg-navy-800 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 transition-colors flex items-center justify-center text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-900"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                 >
                     {darkMode ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                         </svg>
                     ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                         </svg>
                     )}
                 </button>
             </div>

            <div className="flex justify-between items-end gap-2">
                 <div className="flex-1">
                     <label htmlFor="smart-presets-select" className="block text-[10px] font-bold text-slate-500 dark:text-navy-400 uppercase tracking-widest mb-2">Smart Preset</label>
                     <select 
                        id="smart-presets-select"
                        onChange={(e) => applyPreset(e.target.value)}
                        className="w-full bg-white dark:bg-navy-900 border border-slate-300 dark:border-white/20 rounded-lg py-2 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
                        defaultValue=""
                     >
                         <option value="" disabled>Select a configuration...</option>
                         {PRESETS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                     </select>
                 </div>
                 <button 
                    onClick={handleShare}
                    className="bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 transition-colors flex items-center justify-center text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-900"
                    title="Share Configuration via URL"
                 >
                     {copied ? <CheckIcon className="w-5 h-5 text-success" /> : <ShareIcon className="w-5 h-5" />}
                 </button>
                 <button 
                    onClick={handleReset}
                    className="bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 border border-slate-300 dark:border-white/10 rounded-lg p-2.5 transition-colors flex items-center justify-center text-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-slate-200 dark:focus:ring-offset-navy-900"
                    title="Reset to Defaults"
                 >
                     <RefreshIcon className="w-5 h-5" />
                 </button>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-navy-400 uppercase tracking-widest mb-2">Business Model</label>
                <SegmentedControl
                    options={['Direct Sales', 'Leasing']}
                    selected={params.businessModel}
                    setSelected={(val) => onParamChange('businessModel', val)}
                />
            </div>
             <SelectInput 
                label="Currency"
                value={currency}
                onChange={onCurrencyChange}
                options={[
                    { value: 'USD', label: '$ USD — US Dollar' },
                    { value: 'EUR', label: '€ EUR — Euro' },
                    { value: 'GBP', label: '£ GBP — British Pound' },
                    { value: 'JPY', label: '¥ JPY — Japanese Yen' },
                    { value: 'CAD', label: '$ CAD — Canadian Dollar' },
                    { value: 'AUD', label: '$ AUD — Australian Dollar' },
                    { value: 'CHF', label: 'Fr CHF — Swiss Franc' },
                    { value: 'CNY', label: '¥ CNY — Chinese Yuan' },
                    { value: 'INR', label: '₹ INR — Indian Rupee' },
                    { value: 'BRL', label: 'R$ BRL — Brazilian Real' },
                    { value: 'SAR', label: '﷼ SAR — Saudi Riyal' },
                    { value: 'AED', label: 'د.إ AED — UAE Dirham' },
                    { value: 'KWD', label: 'KD KWD — Kuwaiti Dinar' },
                    { value: 'QAR', label: 'QR QAR — Qatari Riyal' },
                    { value: 'BHD', label: 'BD BHD — Bahraini Dinar' },
                    { value: 'OMR', label: 'OMR OMR — Omani Rial' },
                    { value: 'KRW', label: '₩ KRW — Korean Won' },
                    { value: 'THB', label: '฿ THB — Thai Baht' },
                    { value: 'MYR', label: 'RM MYR — Malaysian Ringgit' },
                ]}
            />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 pr-1 lg:overflow-y-auto custom-scrollbar space-y-1 pb-4">
             <label className="block text-[10px] font-bold text-slate-500 dark:text-navy-400 uppercase tracking-widest mb-2 pl-1">Input Parameters</label>
            
            <AccordionItem 
                title="Site & Client Info" 
                isOpen={openSections['client']} 
                onToggle={() => toggleSection('client')}
            >
                {persona === 'analyst' ? (
                    <div className="space-y-4">
                        <div className="bg-slate-100 dark:bg-white/5 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold uppercase text-slate-500 dark:text-navy-400">Client Configuration</span>
                            </div>
                            <div className="space-y-3">
                                <TextInput
                                    label="Number of Clients"
                                    value={params.numberOfClients}
                                    onChange={(v) => onParamChange('numberOfClients', v)}
                                />
                                <SliderInput darkMode={darkMode} 
                                    label="Avg Units per Client"
                                    value={params.unitsPerClient}
                                    min={1} max={200} step={1}
                                    onChange={(v) => onParamChange('unitsPerClient', v)}
                                />
                                <div className="flex justify-between text-xs pt-2 border-t border-slate-200 dark:border-white/10">
                                    <span className="text-slate-500 dark:text-navy-400">Total Fleet Size:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{params.numberOfClients * params.unitsPerClient} Units</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <SliderInput darkMode={darkMode} 
                            label="Units per Client"
                            value={params.unitsPerClient}
                            min={1} max={200} step={1}
                            onChange={(v) => onParamChange('unitsPerClient', v)}
                        />
                        <TextInput
                            label="Number of Clients"
                            value={params.numberOfClients}
                            onChange={(v) => onParamChange('numberOfClients', v)}
                        />
                    </>
                )}
                
                {/* Hardware Preset Selector */}
                <div className="mt-4 pt-2">
                    <label htmlFor="hardware-select" className="block text-[10px] font-bold text-slate-500 dark:text-navy-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <SlidersIcon className="w-3 h-3" /> Hardware Type
                    </label>
                    <select 
                        id="hardware-select"
                        className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/20 rounded-md py-2.5 px-3 text-xs sm:text-sm text-slate-900 dark:text-white mb-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm min-h-[44px]"
                        value={params.hardwareType || ''}
                        onChange={(e) => applyHardwarePreset(e.target.value)}
                    >
                         <option value="" disabled>Select hardware...</option>
                         {HARDWARE_PRESETS.map(h => <option key={h.name} value={h.name}>{h.name} — {new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(h.unitCost)}</option>)}
                    </select>
                    
                    {/* Show Unit Cost for both personas */}
                    <div className="flex justify-between items-center text-xs bg-slate-200 dark:bg-black/20 p-2 rounded mb-2">
                        <span className="text-slate-600 dark:text-navy-400">Unit Cost (COGS):</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(params.unitCost)}
                        </span>
                    </div>
                    
                    {persona === 'analyst' && (
                        <div className="mt-2 space-y-2 pl-2 border-l-2 border-slate-200 dark:border-white/10">
                             <TextInput
                                label="Unit Cost (COGS)"
                                value={params.unitCost}
                                onChange={(v) => onParamChange('unitCost', v)}
                                unit={CURRENCY_SYMBOLS[currency]}
                                description="EXW/FOB/DDP cost varies by shipping terms"
                            />
                             <TextInput
                                label="Power Rating (kW)"
                                value={params.hardwarePowerRatingKw}
                                onChange={(v) => onParamChange('hardwarePowerRatingKw', v)}
                                unit="kW"
                            />
                             <TextInput
                                label="Processing Rate (L/hr)"
                                value={params.hardwareProcessingRateLph}
                                onChange={(v) => onParamChange('hardwareProcessingRateLph', v)}
                                unit="L/hr"
                            />
                            <ToggleSwitch
                                label="Variable Electricity Cost"
                                enabled={params.electricityUsageType === 'Variable'}
                                onChange={(v) => onParamChange('electricityUsageType', v ? 'Variable' : 'Fixed')}
                            />
                        </div>
                    )}
                </div>

                {/* Installation Subsection */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <ToggleSwitch
                        label="Company Handles Installation?"
                        enabled={params.companyHandlesInstallation}
                        onChange={(v) => onParamChange('companyHandlesInstallation', v)}
                    />
                    {params.companyHandlesInstallation && (
                        <div className="mt-3 space-y-3 pl-3 border-l-2 border-primary/30">
                             <TextInput
                                label="Installation Cost (Expense)"
                                value={params.installationCostPerUnit}
                                onChange={(v) => onParamChange('installationCostPerUnit', v)}
                                unit={CURRENCY_SYMBOLS[currency]}
                            />
                            {persona === 'analyst' && (
                                <>
                                    <SliderInput darkMode={darkMode}                                     label="Installation Margin"
                                        value={params.installationMargin}
                                        min={-100} max={200} step={5}
                                        unit="%"
                                        onChange={(v) => onParamChange('installationMargin', v)}
                                        description="Set to 0% to break even, negative to bear cost"
                                    />
                                    <ToggleSwitch
                                        label="Client Pays Installation?"
                                        enabled={params.installationPaidByClient || false}
                                        onChange={(v) => onParamChange('installationPaidByClient', v)}
                                    />
                                </>
                            )}
                            <div className="flex justify-between items-center text-xs bg-slate-200 dark:bg-black/20 p-2 rounded">
                                <span className="text-slate-600 dark:text-navy-400">Client Price/Unit:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(installationPrice)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </AccordionItem>

            <AccordionItem 
                title="Operational Metrics" 
                isOpen={openSections['operations']} 
                onToggle={() => toggleSection('operations')}
            >
                <TextInput
                    label={`Avg. Gasoline Sold (${params.unitSystem === 'gallons' ? 'Gal' : 'L'}/Day)`}
                    value={params.avgGasolineSold}
                    onChange={(v) => onParamChange('avgGasolineSold', v)}
                />
                {persona === 'analyst' && (
                    <>
                        <SliderInput darkMode={darkMode}                             label="Volume Growth Rate"
                            value={params.volumeGrowthRate}
                            min={-5} max={20} step={0.5}
                            unit="%"
                            onChange={(v) => onParamChange('volumeGrowthRate', v)}
                        />
                        <SliderInput darkMode={darkMode}                             label="Inflation Rate (Costs)"
                            value={params.inflationRate || 0}
                            min={0} max={15} step={0.1}
                            unit="%"
                            onChange={(v) => onParamChange('inflationRate', v)}
                            description="Annual increase in operational expenses."
                        />
                    </>
                )}
                <SliderInput darkMode={darkMode}                     label="Recovery Rate"
                    value={params.recoveryRate}
                    min={0.05} max={1} step={0.05}
                    unit="%"
                    onChange={(v) => onParamChange('recoveryRate', v)}
                />
                {persona === 'analyst' && (
                    <>
                        <SliderInput darkMode={darkMode}                         label="Machine Uptime"
                            value={params.machineUptime}
                            min={90} max={100} step={0.1}
                            unit="%"
                            onChange={(v) => onParamChange('machineUptime', v)}
                        />
                        <div className="pt-3 border-t border-slate-200 dark:border-white/10">
                            <ToggleSwitch
                                label="Client Pays Electricity?"
                                enabled={params.electricityPaidByClient || false}
                                onChange={(v) => onParamChange('electricityPaidByClient', v)}
                            />
                        </div>
                    </>
                )}
            </AccordionItem>

            <AccordionItem 
                title="Pricing & Revenue Streams" 
                isOpen={openSections['financials']} 
                onToggle={() => toggleSection('financials')}
            >
                 {params.businessModel === 'Leasing' ? (
                    <>
                        <TextInput
                            label={`Gasoline Price (${CURRENCY_SYMBOLS[currency]}/${params.unitSystem === 'gallons' ? 'Gal' : 'L'})`}
                            value={params.gasolinePrice}
                            onChange={(v) => onParamChange('gasolinePrice', v)}
                        />
                        <SliderInput darkMode={darkMode}                             label="Revenue Share"
                            value={params.companyRevenueShare}
                            min={1} max={100} step={1}
                            unit="%"
                            onChange={(v) => onParamChange('companyRevenueShare', v)}
                        />
                    </>
                 ) : (
                    <>
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mb-3">
                            <TextInput
                                label="Unit Sale Price (Hardware)"
                                value={params.unitSalePrice}
                                onChange={(v) => onParamChange('unitSalePrice', v)}
                                unit={CURRENCY_SYMBOLS[currency]}
                            />
                        </div>

                        {persona === 'analyst' && (
                            <div className="pt-2 mt-2 space-y-3">
                                 <div className="text-xs font-bold text-slate-500 dark:text-navy-400 uppercase tracking-wider mb-2">Spare Parts & Service</div>
                                 <TextInput
                                    label="Annual Spare Parts Revenue"
                                    value={params.postWarrantyRevenuePerUnit}
                                    onChange={(v) => onParamChange('postWarrantyRevenuePerUnit', v)}
                                    unit={`${CURRENCY_SYMBOLS[currency]}/Unit`}
                                    description="Revenue per unit after warranty expires."
                                />
                                 <SliderInput darkMode={darkMode}                                     label="Warranty Period"
                                    value={params.warrantyDurationYears}
                                    min={0} max={5} step={1}
                                    unit="Yrs"
                                    onChange={(v) => onParamChange('warrantyDurationYears', v)}
                                    description="Delay before spare parts revenue begins."
                                />
                            </div>
                        )}
                    </>
                 )}
                 <div className="mt-4 pt-4 border-t border-white/10">
                    <TextInput
                        label="Contract/Lease Term (Years)"
                        value={params.leaseTerm}
                        onChange={(v) => onParamChange('leaseTerm', v)}
                    />
                 </div>
                 {/* SaaS Option */}
                {persona === 'analyst' && (
                    <div className="pt-4 border-t border-white/10 mt-4">
                        <ToggleSwitch
                            label="Enable Monthly SaaS Fee"
                            enabled={params.enableMonthlyFees}
                            onChange={(v) => onParamChange('enableMonthlyFees', v)}
                        />
                        {params.enableMonthlyFees && (
                            <div className="mt-3">
                                <TextInput
                                    label="Monthly Fee Per Unit"
                                    value={params.monthlyFeePerUnit}
                                    onChange={(v) => onParamChange('monthlyFeePerUnit', v)}
                                    unit={CURRENCY_SYMBOLS[currency]}
                                />
                            </div>
                        )}
                    </div>
                )}
            </AccordionItem>
            
            <AccordionItem 
                title="Project Finance & Tax" 
                isOpen={openSections['finance']} 
                onToggle={() => toggleSection('finance')}
                badge="Analyst"
                hidden={persona === 'sales'}
            >
                <ToggleSwitch
                    label="Enable Debt Financing"
                    enabled={params.enableFinancing}
                    onChange={(v) => onParamChange('enableFinancing', v)}
                />
                {params.enableFinancing && (
                    <div className="space-y-4 mt-3 pl-2 border-l-2 border-primary/30">
                        <SliderInput darkMode={darkMode}                             label="Down Payment"
                            value={params.loanDownPaymentPercent}
                            min={0} max={100} step={5}
                            unit="%"
                            onChange={(v) => onParamChange('loanDownPaymentPercent', v)}
                        />
                         <SliderInput darkMode={darkMode}                             label="Interest Rate (APR)"
                            value={params.loanInterestRate}
                            min={0} max={20} step={0.5}
                            unit="%"
                            onChange={(v) => onParamChange('loanInterestRate', v)}
                        />
                        <TextInput
                            label="Loan Term (Years)"
                            value={params.loanTermYears}
                            onChange={(v) => onParamChange('loanTermYears', v)}
                        />
                    </div>
                )}
                
                <div className="pt-4 border-t border-white/10 mt-4 space-y-4">
                     <SliderInput darkMode={darkMode}                         label="Corporate Tax Rate"
                        value={params.corporateTaxRate}
                        min={0} max={50} step={1}
                        unit="%"
                        onChange={(v) => onParamChange('corporateTaxRate', v)}
                    />
                    <div>
                        <SelectInput
                            label="Depreciation Method"
                            value={params.depreciationMethod || 'Straight Line'}
                            onChange={(v) => onParamChange('depreciationMethod', v)}
                            options={[
                                { value: 'Straight Line', label: 'Straight Line' },
                                { value: 'MACRS 5-Year', label: 'MACRS 5-Year' },
                                { value: 'MACRS 7-Year', label: 'MACRS 7-Year' },
                            ]}
                        />
                        {params.depreciationMethod === 'Straight Line' && (
                             <TextInput
                                label="Depreciation Period (Years)"
                                value={params.depreciationPeriod}
                                onChange={(v) => onParamChange('depreciationPeriod', v)}
                            />
                        )}
                    </div>
                </div>
            </AccordionItem>

            <AccordionItem 
                title="Carbon Credits" 
                isOpen={openSections['carbon']} 
                onToggle={() => toggleSection('carbon')}
                hidden={persona === 'sales'}
            >
                <ToggleSwitch
                    label="Enable Carbon Credits"
                    enabled={params.enableCarbonCredits}
                    onChange={(v) => onParamChange('enableCarbonCredits', v)}
                />
                {params.enableCarbonCredits && (
                    <SliderInput darkMode={darkMode}                         label="Price per Credit"
                        value={params.pricePerCredit}
                        min={5} max={100} step={1}
                        unit={CURRENCY_SYMBOLS[currency]}
                        onChange={(v) => onParamChange('pricePerCredit', v)}
                    />
                )}
            </AccordionItem>

            <AccordionItem 
                title="Analysis Settings" 
                isOpen={openSections['advanced']} 
                onToggle={() => toggleSection('advanced')}
                hidden={persona === 'sales'}
            >
                <ToggleSwitch
                    label="Discount Cash Flow"
                    enabled={params.enableCashFlowDiscounting}
                    onChange={(v) => onParamChange('enableCashFlowDiscounting', v)}
                />
                {params.enableCashFlowDiscounting && (
                    <SliderInput darkMode={darkMode}                         label="Discount Rate"
                        value={params.discountRate}
                        min={1} max={25} step={0.5}
                        unit="%"
                        onChange={(v) => onParamChange('discountRate', v)}
                    />
                )}
                
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                    <div className="text-xs font-bold text-slate-500 dark:text-navy-400 uppercase tracking-wider mb-3">Compliance & Regulatory</div>
                    <div className="space-y-3">
                        <TextInput
                            label="Annual Compliance Fee"
                            value={params.annualComplianceFee || 0}
                            onChange={(v) => onParamChange('annualComplianceFee', v)}
                            unit={`${CURRENCY_SYMBOLS[currency]}/unit`}
                            description="Regulatory fees, permits, inspections per unit"
                        />
                        <TextInput
                            label="Penalty Avoidance Savings"
                            value={params.penaltyAvoidanceSavings || 0}
                            onChange={(v) => onParamChange('penaltyAvoidanceSavings', v)}
                            unit={`${CURRENCY_SYMBOLS[currency]}/unit`}
                            description="Annual savings from avoiding environmental penalties"
                        />
                    </div>
                </div>
            </AccordionItem>
        </div>
    </div>
  );
};

export default InputPanel;
