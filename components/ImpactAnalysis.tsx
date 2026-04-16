import React from 'react';
import { CalculatedResults, InputParams } from '../types';
import Card from './Card';
import MetricDisplay from './MetricDisplay';
import { ShieldCheckIcon, TreeIcon, LightningIcon, LeafIcon, CarIcon } from './icons';
import BreakEvenChart from './BreakEvenChart';

interface ImpactAnalysisProps {
  results: CalculatedResults;
  inputs: InputParams;
  currency: string;
}

const formatCurrency = (val: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(val);

const formatCompact = (val: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact' }).format(val);

// Animated progress bar with threshold marker
const SafetyBar: React.FC<{ current: number; breakEven: number; label: string; unit: string }> = ({ current, breakEven, label, unit }) => {
  const max = Math.max(current, breakEven) * 1.4;
  const currentPct = Math.min(100, (current / max) * 100);
  const bePct = Math.min(100, (breakEven / max) * 100);
  const isSafe = current > breakEven;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-navy-300">{label}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSafe ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
          {isSafe ? 'Above Break-Even' : 'Below Break-Even'}
        </span>
      </div>
      <div className="relative h-3 bg-navy-950 rounded-full overflow-visible border border-white/10">
        {/* Fill */}
        <div
          className={`h-full rounded-full transition-all duration-700 ${isSafe ? 'bg-gradient-to-r from-primary to-success' : 'bg-gradient-to-r from-orange-500 to-danger'}`}
          style={{ width: `${currentPct}%` }}
        />
        {/* Break-even marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-warning shadow-[0_0_6px_#F59E0B] z-10"
          style={{ left: `${bePct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-navy-500 mt-1">
        <span>0</span>
        <span className="text-warning font-mono">BE: {Math.round(breakEven).toLocaleString()} {unit}</span>
        <span>{Math.round(current).toLocaleString()} {unit} (current)</span>
      </div>
    </div>
  );
};

// ESG stat tile
const EsgTile: React.FC<{ icon: React.ReactNode; value: string; label: string; color: string; bg: string }> = ({ icon, value, label, color, bg }) => (
  <div className={`flex items-center gap-4 p-4 rounded-xl border ${bg}`}>
    <div className={`p-3 rounded-full ${color} flex-shrink-0`}>{icon}</div>
    <div>
      <div className="text-2xl font-black text-white leading-none">{value}</div>
      <div className="text-xs text-navy-400 uppercase font-bold tracking-wider mt-1">{label}</div>
    </div>
  </div>
);

const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ results, inputs, currency }) => {
  const { impact } = results;
  const unitLabel = inputs.unitSystem === 'gallons' ? 'Gal' : 'L';
  const dailyVol = inputs.avgGasolineSold;

  const recoveryEfficiency = (inputs.recoveryRate / 100) * (inputs.machineUptime / 100) * 365;
  const revPerUnit = (inputs.gasolinePrice * (inputs.companyRevenueShare / 100)) +
    (inputs.enableCarbonCredits
      ? (inputs.unitSystem === 'gallons' ? inputs.co2TonnesPerGallon : inputs.co2TonnesPerGallon / 3.785) * inputs.pricePerCredit
      : 0);
  const variableRevenuePerUnit = recoveryEfficiency * revPerUnit;
  const estimatedFixedCost = impact.breakEvenTotalVolume * variableRevenuePerUnit;

  const safetyColor = impact.safetyMargin > 30
    ? 'text-success'
    : impact.safetyMargin > 10
    ? 'text-warning'
    : 'text-danger';

  const safetyBg = impact.safetyMargin > 30
    ? 'bg-success/10 border-success/20'
    : impact.safetyMargin > 10
    ? 'bg-warning/10 border-warning/20'
    : 'bg-danger/10 border-danger/20';

  return (
    <div className="p-6 lg:p-8 w-full max-w-6xl mx-auto overflow-y-auto custom-scrollbar pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-primary to-primary-dark rounded-xl shadow-glow">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white">Impact & Break-Even</h1>
          <p className="text-navy-400 mt-0.5">Operational thresholds, safety margins, and ESG performance.</p>
        </div>
      </div>

      {/* Top row: Safety margin + Break-even metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className={`col-span-1 flex flex-col items-center justify-center p-6 rounded-2xl border ${safetyBg}`}>
          <div className="text-xs text-navy-400 uppercase tracking-widest font-bold mb-1">Safety Margin</div>
          <div className={`text-6xl font-black ${safetyColor}`}>{impact.safetyMargin.toFixed(1)}%</div>
          <div className="text-xs text-navy-500 mt-2 text-center">Volume can drop this much before ROI turns negative</div>
        </div>
        <MetricDisplay label={`OpEx Break-Even (${unitLabel}/day)`} value={Math.round(impact.breakEvenDailyVolume).toLocaleString()} />
        <MetricDisplay label={`ROI Break-Even (${unitLabel}/day)`} value={Math.round(impact.breakEvenTotalVolume).toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Break-Even Chart */}
        <Card title="Break-Even Chart">
          <div className="h-[260px] w-full mb-6">
            <BreakEvenChart
              fixedCost={estimatedFixedCost}
              variableRevenuePerUnit={variableRevenuePerUnit}
              currentVolume={dailyVol}
              breakEvenVolume={impact.breakEvenTotalVolume}
              unitLabel={unitLabel}
              currency={currency}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center text-xs mb-4">
            <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-success inline-block rounded" />Revenue</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-danger inline-block rounded" />Total Cost</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-warning inline-block rounded border-dashed border-t border-warning" />Break-Even</div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-white inline-block rounded" />Current Volume</div>
          </div>

          {/* Volume safety bars */}
          <div className="space-y-5 pt-4 border-t border-white/10">
            <SafetyBar
              current={dailyVol}
              breakEven={impact.breakEvenDailyVolume}
              label="Daily Volume vs OpEx Break-Even"
              unit={unitLabel}
            />
            <SafetyBar
              current={dailyVol}
              breakEven={impact.breakEvenTotalVolume}
              label="Daily Volume vs ROI Break-Even"
              unit={unitLabel}
            />
          </div>
        </Card>

        {/* ESG Dashboard */}
        <div className="space-y-5">
          {inputs.enableCarbonCredits && (
            <Card title="Carbon Credit Revenue" className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-black text-primary-light">
                    {formatCompact(results.revenue.carbonCreditRevenue, currency)}
                  </div>
                  <div className="text-xs text-navy-400 mt-1">
                    {Math.round(impact.totalCo2Saved).toLocaleString()} credits × {formatCurrency(inputs.pricePerCredit, currency)}/credit
                  </div>
                </div>
                <div className="text-4xl">🌿</div>
              </div>
            </Card>
          )}

          <Card title="Environmental Impact (ESG)">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EsgTile
                icon={<LeafIcon className="w-5 h-5 text-emerald-400" />}
                value={Math.round(impact.totalCo2Saved).toLocaleString()}
                label="Tonnes CO₂ Saved"
                color="bg-emerald-500/20"
                bg="bg-emerald-500/5 border-emerald-500/20"
              />
              <EsgTile
                icon={<TreeIcon className="w-5 h-5 text-green-400" />}
                value={Math.round(impact.treesPlantedEquiv).toLocaleString()}
                label="Trees Equivalent"
                color="bg-green-500/20"
                bg="bg-green-500/5 border-green-500/20"
              />
              <EsgTile
                icon={<CarIcon className="w-5 h-5 text-blue-400" />}
                value={impact.carsOffRoadEquiv.toFixed(1)}
                label="Cars Off Road / Year"
                color="bg-blue-500/20"
                bg="bg-blue-500/5 border-blue-500/20"
              />
              <EsgTile
                icon={<LightningIcon className="w-5 h-5 text-yellow-400" />}
                value={Math.round(impact.homesPoweredEquiv).toLocaleString()}
                label="Homes Powered"
                color="bg-yellow-500/20"
                bg="bg-yellow-500/5 border-yellow-500/20"
              />
            </div>
          </Card>

          {/* Narrative summary */}
          <Card title="ESG Summary">
            <div className="space-y-3 text-sm text-navy-300 leading-relaxed">
              <p>
                Over <span className="text-white font-bold">{inputs.leaseTerm} years</span>, this project prevents{' '}
                <span className="text-success font-bold">{Math.round(impact.totalCo2Saved).toLocaleString()} metric tonnes</span> of CO₂ from entering the atmosphere.
              </p>
              <p>
                That's equivalent to the carbon sequestered by{' '}
                <span className="text-white font-bold">{Math.round(impact.treesPlantedEquiv).toLocaleString()} tree seedlings</span> grown for 10 years, or removing{' '}
                <span className="text-white font-bold">{Math.round(impact.carsOffRoadEquiv)} vehicles</span> from the road for a full year.
              </p>
              {inputs.enableCarbonCredits && (
                <p className="text-primary-light">
                  Carbon credits add{' '}
                  <span className="font-bold">{formatCompact(results.revenue.carbonCreditRevenue, currency)}</span> in additional revenue at{' '}
                  <span className="font-bold">{formatCurrency(inputs.pricePerCredit, currency)}/credit</span>.
                </p>
              )}
              <div className={`mt-3 p-3 rounded-lg border text-xs ${safetyBg} ${safetyColor}`}>
                <span className="font-bold">Safety Margin: {impact.safetyMargin.toFixed(1)}%</span>
                {impact.safetyMargin > 0
                  ? ` — Volume can fall ${impact.safetyMargin.toFixed(1)}% before the project stops being profitable.`
                  : ' — Current volume is below break-even. Consider adjusting parameters.'}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
