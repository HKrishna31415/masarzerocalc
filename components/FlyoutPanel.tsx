
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons';
import { CalculatedResults, InputParams } from '../types';

interface FlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  results: CalculatedResults;
  inputs: InputParams;
  currency: string;
}

const formatCurrency = (value: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const FlyoutPanel: React.FC<FlyoutPanelProps> = ({ isOpen, onClose, year, results, inputs, currency }) => {
  const netCashFlow = results.cashFlow[year] || 0;
  const totalUnits = inputs.unitsPerClient * inputs.numberOfClients;
  const isLeasing = inputs.businessModel === 'Leasing';
  
  // Calculate year-specific values with growth/inflation
  const growthFactor = Math.pow(1 + (inputs.volumeGrowthRate / 100), year - 1);
  const inflationFactor = Math.pow(1 + (inputs.inflationRate || 0) / 100, year - 1);
  
  // Year-specific volume
  const yearlyVolume = year > 0 ? inputs.avgGasolineSold * growthFactor : 0;
  const recoveredVolume = year > 0 ? yearlyVolume * totalUnits * (inputs.recoveryRate / 100) * 365 * (inputs.machineUptime / 100) : 0;
  
  // Revenue breakdown
  const yearLeasingRevenue = year > 0 && isLeasing ? recoveredVolume * inputs.gasolinePrice * (inputs.companyRevenueShare / 100) : 0;
  const yearSalesRevenue = year === 1 && !isLeasing ? totalUnits * inputs.unitSalePrice : 0;
  const yearInstallRevenue = year === 1 && inputs.companyHandlesInstallation ? totalUnits * inputs.installationCostPerUnit * (1 + (inputs.installationMargin || 0) / 100) : 0;
  const yearCarbonRevenue = year > 0 && inputs.enableCarbonCredits && isLeasing ? (recoveredVolume * inputs.co2TonnesPerGallon / (inputs.unitSystem === 'gallons' ? 1 : 3.78541)) * inputs.pricePerCredit : 0;
  const yearSaasRevenue = year > 0 && inputs.enableMonthlyFees ? totalUnits * inputs.monthlyFeePerUnit * 12 : 0;
  const yearSparePartsRevenue = year > 0 && !isLeasing && year > inputs.warrantyDurationYears ? totalUnits * inputs.postWarrantyRevenuePerUnit * inflationFactor : 0;
  
  const yearRevenue = yearLeasingRevenue + yearSalesRevenue + yearInstallRevenue + yearCarbonRevenue + yearSaasRevenue + yearSparePartsRevenue;
  
  // OPEX breakdown
  const yearMaintenance = year > 0 && isLeasing ? totalUnits * inputs.annualMaintenanceCost * inflationFactor : 0;
  const yearElectricity = year > 0 && isLeasing && !inputs.electricityPaidByClient ? totalUnits * inputs.unitElectricityConsumptionKwhDay * 365 * inputs.electricityPrice * inflationFactor : 0;
  const yearConsumables = year > 0 && isLeasing ? totalUnits * inputs.annualConsumablesCost * inflationFactor : 0;
  const yearWarranty = year > 0 && isLeasing ? totalUnits * inputs.annualWarrantyCost : 0;
  const yearOperations = year > 0 && isLeasing ? totalUnits * inputs.dailyOperationalCost * 365 * inflationFactor : 0;
  
  const yearOpex = yearMaintenance + yearElectricity + yearConsumables + yearWarranty + yearOperations;
  
  // CAPEX breakdown
  const yearCogs = year === 0 ? totalUnits * inputs.unitCost : 0;
  const yearInstallCost = year === 0 && inputs.companyHandlesInstallation && !inputs.installationPaidByClient ? totalUnits * inputs.installationCostPerUnit : 0;
  const yearCAC = year === 0 ? inputs.customerAcquisitionCost * inputs.numberOfClients : 0;
  
  const yearCapex = yearCogs + yearInstallCost + yearCAC;
  
  const yearTax = year === 0 ? 0 : results.costs.totalTaxes / inputs.leaseTerm;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-navy-950/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Flyout Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8
            }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white dark:bg-navy-950 border-l border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-50 to-white dark:from-navy-900 dark:to-navy-950 border-b border-slate-200 dark:border-white/10 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {year === 0 ? 'Initial Investment' : `Year ${year}`}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-navy-400 mt-1">
                    Detailed Cash Flow Breakdown
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Net Cash Flow - Hero */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-2xl border-2 ${
                  netCashFlow >= 0 
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800/30' 
                    : 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800/30'
                }`}
              >
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-navy-400 mb-2">
                  Net Cash Flow
                </div>
                <div className={`text-4xl font-black ${
                  netCashFlow >= 0 
                    ? 'text-emerald-700 dark:text-emerald-400' 
                    : 'text-red-700 dark:text-red-400'
                }`}>
                  {formatCurrency(netCashFlow, currency)}
                </div>
              </motion.div>

              {/* Formula Breakdown */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-navy-300 border-b border-slate-200 dark:border-white/10 pb-2">
                  Formula Breakdown
                </h3>
                
                {/* Revenue */}
                {year > 0 && yearRevenue > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/20 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        + Gross Revenue
                      </span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(yearRevenue, currency)}
                      </span>
                    </div>
                    <div className="space-y-3 text-xs text-slate-600 dark:text-navy-400 pl-4 border-l-2 border-emerald-300 dark:border-emerald-700">
                      {yearLeasingRevenue > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Leasing Revenue</span>
                            <span className="font-mono">{formatCurrency(yearLeasingRevenue, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {yearlyVolume.toFixed(0)} L/day × {totalUnits} units × {inputs.recoveryRate}% recovery × {inputs.machineUptime}% uptime × 365 days × ${inputs.gasolinePrice.toFixed(2)}/L × {inputs.companyRevenueShare}% share
                          </div>
                        </div>
                      )}
                      {yearSalesRevenue > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Hardware Sales</span>
                            <span className="font-mono">{formatCurrency(yearSalesRevenue, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.unitSalePrice, currency)}/unit
                          </div>
                        </div>
                      )}
                      {yearInstallRevenue > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Installation Revenue</span>
                            <span className="font-mono">{formatCurrency(yearInstallRevenue, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.installationCostPerUnit, currency)} cost × (1 + {inputs.installationMargin}% margin)
                          </div>
                        </div>
                      )}
                      {yearCarbonRevenue > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Carbon Credits</span>
                            <span className="font-mono">{formatCurrency(yearCarbonRevenue, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {recoveredVolume.toFixed(0)} L × {inputs.co2TonnesPerGallon.toFixed(6)} tonnes/gal × ${inputs.pricePerCredit}/credit
                          </div>
                        </div>
                      )}
                      {yearSaasRevenue > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>SaaS Fees</span>
                            <span className="font-mono">{formatCurrency(yearSaasRevenue, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.monthlyFeePerUnit, currency)}/month × 12 months
                          </div>
                        </div>
                      )}
                      {yearSparePartsRevenue > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Spare Parts</span>
                            <span className="font-mono">{formatCurrency(yearSparePartsRevenue, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.postWarrantyRevenuePerUnit, currency)}/unit × {inflationFactor.toFixed(3)} inflation
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* OPEX */}
                {year > 0 && yearOpex > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-orange-50 dark:bg-orange-950/10 border border-orange-200 dark:border-orange-800/20 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                        - Operating Expenses
                      </span>
                      <span className="text-lg font-black text-orange-700 dark:text-orange-400">
                        {formatCurrency(yearOpex, currency)}
                      </span>
                    </div>
                    <div className="space-y-3 text-xs text-slate-600 dark:text-navy-400 pl-4 border-l-2 border-orange-300 dark:border-orange-700">
                      {yearMaintenance > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Maintenance</span>
                            <span className="font-mono">{formatCurrency(yearMaintenance, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.annualMaintenanceCost, currency)}/unit × {inflationFactor.toFixed(3)} inflation
                          </div>
                        </div>
                      )}
                      {yearElectricity > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Electricity</span>
                            <span className="font-mono">{formatCurrency(yearElectricity, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {inputs.unitElectricityConsumptionKwhDay} kWh/day × 365 days × ${inputs.electricityPrice.toFixed(3)}/kWh × {inflationFactor.toFixed(3)} inflation
                          </div>
                        </div>
                      )}
                      {yearConsumables > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Consumables</span>
                            <span className="font-mono">{formatCurrency(yearConsumables, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.annualConsumablesCost, currency)}/unit × {inflationFactor.toFixed(3)} inflation
                          </div>
                        </div>
                      )}
                      {yearWarranty > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Warranty Reserve</span>
                            <span className="font-mono">{formatCurrency(yearWarranty, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.annualWarrantyCost, currency)}/unit
                          </div>
                        </div>
                      )}
                      {yearOperations > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Daily Operations</span>
                            <span className="font-mono">{formatCurrency(yearOperations, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.dailyOperationalCost, currency)}/day × 365 days × {inflationFactor.toFixed(3)} inflation
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* CAPEX */}
                {year === 0 && yearCapex > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-purple-50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-800/20 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                        - Capital Expenditure
                      </span>
                      <span className="text-lg font-black text-purple-700 dark:text-purple-400">
                        {formatCurrency(yearCapex, currency)}
                      </span>
                    </div>
                    <div className="space-y-3 text-xs text-slate-600 dark:text-navy-400 pl-4 border-l-2 border-purple-300 dark:border-purple-700">
                      {yearCogs > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Unit Cost (COGS)</span>
                            <span className="font-mono">{formatCurrency(yearCogs, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.unitCost, currency)}/unit
                          </div>
                        </div>
                      )}
                      {yearInstallCost > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Installation Cost</span>
                            <span className="font-mono">{formatCurrency(yearInstallCost, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {totalUnits} units × {formatCurrency(inputs.installationCostPerUnit, currency)}/unit (company bears cost)
                          </div>
                        </div>
                      )}
                      {yearCAC > 0 && (
                        <div>
                          <div className="flex justify-between font-semibold mb-1">
                            <span>Customer Acquisition</span>
                            <span className="font-mono">{formatCurrency(yearCAC, currency)}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-navy-500 font-mono bg-white dark:bg-navy-900 p-2 rounded">
                            {inputs.numberOfClients} clients × {formatCurrency(inputs.customerAcquisitionCost, currency)}/client
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Tax */}
                {year > 0 && yearTax > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-50 dark:bg-slate-950/10 border border-slate-200 dark:border-slate-800/20 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                        - Corporate Tax
                      </span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-400">
                        {formatCurrency(yearTax, currency)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Formula Display */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-100 dark:bg-navy-900/50 border border-slate-300 dark:border-white/10 rounded-xl p-4"
              >
                <div className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-navy-400 mb-3">
                  Calculation
                </div>
                <div className="font-mono text-xs text-slate-700 dark:text-navy-300 space-y-1">
                  {year === 0 ? (
                    <div>Net Cash Flow = -{formatCurrency(yearCapex, currency)}</div>
                  ) : (
                    <>
                      <div>Net Cash Flow = Revenue - OPEX - Tax</div>
                      <div className="text-[10px] text-slate-500 dark:text-navy-500 mt-2">
                        = {formatCurrency(yearRevenue, currency)} - {formatCurrency(yearOpex, currency)} - {formatCurrency(yearTax, currency)}
                      </div>
                      <div className="text-[10px] font-bold text-primary-dark dark:text-primary-light mt-2">
                        = {formatCurrency(netCashFlow, currency)}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FlyoutPanel;
