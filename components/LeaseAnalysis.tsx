
import React, { useState, useMemo, useContext } from 'react';
import { motion } from 'framer-motion';
import { InputParams, Station } from '../types';
import Card from './Card';
import { TrashIcon, DownloadIcon, PencilIcon, CheckIcon, XIcon, SlidersIcon, ChartBarIcon, TableIcon } from './icons';
import SliderInput from './SliderInput';
import MetricDisplay from './MetricDisplay';
import { CURRENCY_SYMBOLS } from '../utils/sensitivityConfig';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { LangContext } from '../utils/langContext';
import { KSM1000_REFERENCE_INSTALLATIONS } from '../utils/referenceInstallations';

interface LeaseAnalysisProps {
  globalParams: InputParams;
  currency: string;
}

const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

const CustomScatterTooltip = ({ active, payload, currency }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-100 dark:bg-navy-900 border border-slate-300 dark:border-white/20 rounded-lg p-3 shadow-lg text-sm">
                <div className="font-bold text-white mb-1">{data.name}</div>
                <div className="text-navy-300">Volume: <span className="text-white font-mono">{data.dailyVolume.toLocaleString()}</span></div>
                <div className="text-navy-300">Profit: <span className="text-white font-mono">{formatCurrency(data.netProfit, currency)}</span></div>
            </div>
        )
    }
    return null;
}

const LeaseAnalysis: React.FC<LeaseAnalysisProps> = ({ globalParams, currency }) => {
  const { t } = useContext(LangContext);
  const [stations, setStations] = useState<Station[]>([
      { id: '1', name: 'Station A', dailyVolume: 35000, recoveryRate: 0.5, uptime: 99.5, installCost: 5000, localCurrency: currency, exchangeRateToGlobal: 1 },
      { id: '2', name: 'Station B', dailyVolume: 50000, recoveryRate: 0.5, uptime: 99.0, installCost: 5000, localCurrency: currency, exchangeRateToGlobal: 1 },
  ]);

  const loadReferenceInstallations = () => {
    const refStations: Station[] = KSM1000_REFERENCE_INSTALLATIONS.map((s, i) => ({
      ...s,
      id: `ref-${Date.now()}-${i}`,
    }));
    setStations(refStations);
  };
  // Local overrides for analysis
  const [growthRate, setGrowthRate] = useState(globalParams.volumeGrowthRate);
  const [dailyOpsCost, setDailyOpsCost] = useState(globalParams.dailyOperationalCost);
  const [viewMode, setViewMode] = useState<'table' | 'matrix'>('table');
  
  // Bulk Gen State
  const [showBulkGen, setShowBulkGen] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkVariance, setBulkVariance] = useState(20);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Station>>({});

  const [newStation, setNewStation] = useState<Partial<Station>>({
      name: '',
      dailyVolume: 40000,
      recoveryRate: 0.5,
      uptime: 99.5,
      installCost: 5000,
      localCurrency: currency,
      exchangeRateToGlobal: 1
  });

  const addStation = () => {
      if (!newStation.name) return;
      setStations([...stations, { 
          id: Date.now().toString(),
          name: newStation.name,
          dailyVolume: newStation.dailyVolume || 0,
          recoveryRate: newStation.recoveryRate || 0.5,
          uptime: newStation.uptime || 99.5,
          installCost: newStation.installCost || 5000,
          localCurrency: newStation.localCurrency || currency,
          exchangeRateToGlobal: newStation.exchangeRateToGlobal || 1
      } as Station]);
      setNewStation({ ...newStation, name: '' });
  };

  const generateBulkStations = () => {
      const newBatch: Station[] = [];
      const baseVol = globalParams.avgGasolineSold;
      const baseRec = globalParams.recoveryRate;
      
      for(let i=0; i < bulkCount; i++) {
          const variance = (Math.random() - 0.5) * 2 * (bulkVariance / 100);
          const vol = Math.round(baseVol * (1 + variance));
          
          newBatch.push({
              id: `gen-${Date.now()}-${i}`,
              name: `Site #${stations.length + i + 1} (Gen)`,
              dailyVolume: vol,
              recoveryRate: baseRec,
              uptime: 98 + (Math.random() * 2), // 98-100% random uptime
              installCost: globalParams.installationCostPerUnit,
              localCurrency: currency,
              exchangeRateToGlobal: 1
          });
      }
      setStations([...stations, ...newBatch]);
      setShowBulkGen(false);
  };

  const removeStation = (id: string) => {
      setStations(stations.filter(s => s.id !== id));
  };

  const startEditing = (station: Station) => {
    setEditingId(station.id);
    setEditValues({ ...station });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEditing = () => {
    if (!editingId) return;
    setStations(stations.map(s => {
        if (s.id === editingId) {
            return { ...s, ...editValues } as Station;
        }
        return s;
    }));
    setEditingId(null);
    setEditValues({});
  };

  // Aggregate Calculation Logic
  const analysis = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    
    const annualMaintenance = globalParams.annualMaintenanceCost;
    const annualWarranty = globalParams.annualWarrantyCost;
    const annualConsumables = globalParams.annualConsumablesCost;
    const annualOps = dailyOpsCost * 365;
    const unitPowerCost = globalParams.unitElectricityConsumptionKwhDay * 365 * globalParams.electricityPrice;
    
    const annualFixedCostPerUnit = annualMaintenance + annualWarranty + annualConsumables + annualOps + unitPowerCost;
    const term = globalParams.leaseTerm;
    
    const results = stations.map(station => {
        let stationRevenueLocal = 0;
        
        for (let year = 1; year <= term; year++) {
             const growthFactor = Math.pow(1 + (growthRate / 100), year - 1);
             const dailyVol = station.dailyVolume * growthFactor;
             const recovered = dailyVol * (station.recoveryRate / 100) * 365 * (station.uptime / 100);
             
             const gasRev = recovered * globalParams.gasolinePrice * (globalParams.companyRevenueShare / 100);
             const co2 = recovered * globalParams.co2TonnesPerGallon; 
             const carbonRev = globalParams.enableCarbonCredits ? co2 * globalParams.pricePerCredit : 0;
             
             stationRevenueLocal += gasRev + carbonRev;
        }

        if (globalParams.companyHandlesInstallation) {
             stationRevenueLocal += station.installCost; // Install Cost charged to client
        }

        const stationCost = (annualFixedCostPerUnit * term) + globalParams.unitCost + station.installCost + globalParams.customerAcquisitionCost;
        const stationNetProfit = stationRevenueLocal - stationCost;

        totalRevenue += stationRevenueLocal;
        totalCost += stationCost;

        return {
            ...station,
            totalRevenue: stationRevenueLocal,
            totalCost: stationCost,
            netProfit: stationNetProfit
        };
    });

    return {
        stationResults: results,
        totalRevenue,
        totalCost,
        totalNetProfit: totalRevenue - totalCost,
        avgProfitPerStation: results.length ? (totalRevenue - totalCost) / results.length : 0,
        roi: totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0
    };

  }, [stations, globalParams, growthRate, dailyOpsCost]);

  const handleExport = () => {
    const header = ['Station Name', 'Currency', 'Daily Vol', 'Uptime', 'Install Cost', 'Total Revenue', 'Total Cost', 'Net Profit'];
    const rows = analysis.stationResults.map(s => [
        s.name, 
        s.localCurrency || currency,
        s.dailyVolume, 
        s.uptime, 
        s.installCost, 
        s.totalRevenue.toFixed(2), 
        s.totalCost.toFixed(2), 
        s.netProfit.toFixed(2)
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lease_Analysis_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto overflow-y-auto pb-24">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b-2 border-slate-900 dark:border-white/20 gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1">
            Lease Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-navy-400 font-medium uppercase tracking-wider">
            Station-by-Station Unit Economics
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
            <motion.button 
                onClick={loadReferenceInstallations}
                className="flex items-center space-x-2 bg-primary/10 hover:bg-primary/20 text-primary-dark dark:text-primary-light border-2 border-primary/30 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                title="Load 58 KSM-1000 reference installations from China"
            >
                <span className="text-base leading-none">🌏</span>
                <span className="hidden sm:inline">KSM-1000 Global</span>
            </motion.button>
            <motion.button 
                onClick={() => setShowBulkGen(!showBulkGen)}
                className="flex items-center space-x-2 bg-white dark:bg-navy-800 hover:bg-slate-100 dark:hover:bg-navy-700 text-slate-900 dark:text-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg border-2 border-slate-300 dark:border-white/10 transition-all font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <SlidersIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Bulk Add</span>
            </motion.button>
            <motion.button 
                onClick={handleExport}
                className="flex items-center space-x-2 bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg shadow-lg transition-all font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <DownloadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
            </motion.button>
        </div>
      </motion.div>
      
      {showBulkGen && (
          <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-white dark:bg-glass-200 border-2 border-primary/30 dark:border-primary/30 p-6 rounded-2xl shadow-xl"
          >
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-wide">Bulk Station Generator</h3>
                  <motion.button 
                      onClick={() => setShowBulkGen(false)} 
                      className="text-slate-600 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                  >
                      <XIcon className="w-5 h-5"/>
                  </motion.button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                       <label className="text-xs font-black text-slate-700 dark:text-navy-400 uppercase tracking-wider mb-2 block">Number of Stations</label>
                       <input 
                           type="number" 
                           value={bulkCount}
                           onChange={(e) => setBulkCount(Number(e.target.value))}
                           className="w-full bg-white dark:bg-navy-950 border-2 border-slate-300 dark:border-white/20 rounded-lg p-3 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                           min={1} max={100}
                       />
                   </div>
                   <div>
                       <label className="text-xs font-black text-slate-700 dark:text-navy-400 uppercase tracking-wider mb-2 block">Volume Variance (+/- %)</label>
                       <input 
                           type="number" 
                           value={bulkVariance}
                           onChange={(e) => setBulkVariance(Number(e.target.value))}
                           className="w-full bg-white dark:bg-navy-950 border-2 border-slate-300 dark:border-white/20 rounded-lg p-3 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                           min={0} max={50}
                       />
                   </div>
                   <div className="flex items-end">
                       <motion.button 
                          onClick={generateBulkStations}
                          className="w-full bg-gradient-to-r from-primary to-primary-dark hover:brightness-110 text-white font-black py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 uppercase tracking-wider text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                           Generate {bulkCount} Stations
                       </motion.button>
                   </div>
              </div>
          </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
             {/* Aggregated Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <MetricDisplay label="Total Net Profit" value={formatCurrency(analysis.totalNetProfit, currency)} highlight={analysis.totalNetProfit >= 0 ? 'net-profit-gain' : 'net-profit-loss'} />
                 <MetricDisplay label="Avg Profit / Unit" value={formatCurrency(analysis.avgProfitPerStation, currency)} />
                 <MetricDisplay label="Total Revenue" value={formatCurrency(analysis.totalRevenue, currency)} />
                 <MetricDisplay label="Portfolio ROI" value={`${analysis.roi.toFixed(1)}%`} highlight="roi" />
             </div>

             <div className="flex justify-end mb-2">
                 <div className="flex bg-slate-200 dark:bg-navy-900 rounded p-1">
                     <button 
                        onClick={() => setViewMode('table')} 
                        className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${viewMode === 'table' ? 'bg-primary text-white' : 'text-navy-400 hover:text-white'}`}
                        title="Table View"
                     >
                         <TableIcon className="w-4 h-4"/>
                     </button>
                     <button 
                        onClick={() => setViewMode('matrix')} 
                        className={`p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset ${viewMode === 'matrix' ? 'bg-primary text-white' : 'text-navy-400 hover:text-white'}`}
                        title="Performance Matrix (Chart)"
                     >
                         <ChartBarIcon className="w-4 h-4"/>
                     </button>
                 </div>
             </div>

             {/* High-Contrast Table for Light Mode */}
             <Card title={`Station Portfolio (${stations.length} Units)`} noPadding className="overflow-hidden min-h-[400px] border-2 border-slate-900 dark:border-white/10">
                 {viewMode === 'table' ? (
                     <div className="w-full overflow-x-auto custom-scrollbar">
                         <table className="w-full text-sm text-left min-w-[600px]">
                             <thead className="bg-slate-900 dark:bg-white/5 border-b-2 border-slate-900 dark:border-white/10 sticky top-0 z-10">
                                 <tr>
                                     <th className="px-6 py-4 font-black text-white uppercase tracking-wider text-xs">Station Name</th>
                                     <th className="px-6 py-4 font-black text-white uppercase tracking-wider text-xs">Currency</th>
                                     <th className="px-6 py-4 font-black text-white uppercase tracking-wider text-xs">Daily Vol</th>
                                     <th className="px-6 py-4 font-black text-white uppercase tracking-wider text-xs">Recovery</th>
                                     <th className="px-6 py-4 font-black text-white uppercase tracking-wider text-xs text-right">Net Profit (Lifetime)</th>
                                     <th className="px-6 py-4 font-black text-white uppercase tracking-wider text-xs text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y-2 divide-slate-200 dark:divide-white/5 bg-white dark:bg-transparent">
                                 {analysis.stationResults.map((s) => {
                                     const isEditing = editingId === s.id;
                                     return (
                                         <motion.tr 
                                             key={s.id} 
                                             className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                             whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                                         >
                                             <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                 {isEditing ? (
                                                     <input 
                                                         type="text" 
                                                         value={editValues.name || ''}
                                                         onChange={(e) => setEditValues({...editValues, name: e.target.value})}
                                                         className="bg-white dark:bg-navy-950 border-2 border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 w-full text-slate-900 dark:text-white focus:outline-none focus:border-primary font-semibold"
                                                     />
                                                 ) : s.name}
                                             </td>
                                             <td className="px-6 py-4 text-xs uppercase font-black text-slate-600 dark:text-navy-400">
                                                {isEditing ? (
                                                     <input 
                                                         type="text" 
                                                         value={editValues.localCurrency || currency}
                                                         onChange={(e) => setEditValues({...editValues, localCurrency: e.target.value})}
                                                         className="bg-white dark:bg-navy-950 border-2 border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 w-20 text-slate-900 dark:text-white focus:outline-none focus:border-primary uppercase font-bold"
                                                     />
                                                 ) : s.localCurrency || currency}
                                             </td>
                                             <td className="px-6 py-4 font-semibold text-slate-700 dark:text-navy-200">
                                                 {isEditing ? (
                                                     <input 
                                                         type="number" 
                                                         value={editValues.dailyVolume}
                                                         onChange={(e) => setEditValues({...editValues, dailyVolume: parseFloat(e.target.value)})}
                                                         className="bg-white dark:bg-navy-950 border-2 border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 w-28 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-semibold"
                                                     />
                                                 ) : s.dailyVolume.toLocaleString()}
                                             </td>
                                             <td className="px-6 py-4 font-semibold text-slate-700 dark:text-navy-200">
                                                 {isEditing ? (
                                                     <div className="flex items-center">
                                                         <input 
                                                             type="number" 
                                                             value={editValues.recoveryRate}
                                                             onChange={(e) => setEditValues({...editValues, recoveryRate: parseFloat(e.target.value)})}
                                                             className="bg-white dark:bg-navy-950 border-2 border-slate-300 dark:border-white/20 rounded-lg px-3 py-2 w-20 text-slate-900 dark:text-white focus:outline-none focus:border-primary font-semibold"
                                                             step={0.1}
                                                         />
                                                         <span className="ml-2 font-bold">%</span>
                                                     </div>
                                                 ) : `${(s.recoveryRate).toFixed(2)}%`}
                                             </td>
                                             <td className={`px-6 py-4 text-right font-black text-lg ${s.netProfit >= 0 ? 'text-emerald-700 dark:text-success' : 'text-red-700 dark:text-danger'}`}>
                                                 {formatCurrency(s.netProfit, currency)}
                                             </td>
                                             <td className="px-6 py-4 text-right">
                                                 {isEditing ? (
                                                     <div className="flex justify-end space-x-2">
                                                         <motion.button 
                                                             onClick={saveEditing} 
                                                             className="text-emerald-600 hover:text-emerald-700 p-2 bg-emerald-50 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-success"
                                                             whileHover={{ scale: 1.1 }}
                                                             whileTap={{ scale: 0.9 }}
                                                         >
                                                             <CheckIcon className="w-5 h-5" />
                                                         </motion.button>
                                                         <motion.button 
                                                             onClick={cancelEditing} 
                                                             className="text-red-600 hover:text-red-700 p-2 bg-red-50 dark:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-danger"
                                                             whileHover={{ scale: 1.1 }}
                                                             whileTap={{ scale: 0.9 }}
                                                         >
                                                             <XIcon className="w-5 h-5" />
                                                         </motion.button>
                                                     </div>
                                                 ) : (
                                                     <div className="flex justify-end space-x-2">
                                                         <motion.button 
                                                             onClick={() => startEditing(s)} 
                                                             className="text-slate-600 dark:text-navy-400 hover:text-primary-dark dark:hover:text-primary-light p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                                             whileHover={{ scale: 1.1 }}
                                                             whileTap={{ scale: 0.9 }}
                                                         >
                                                             <PencilIcon className="w-4 h-4" />
                                                         </motion.button>
                                                         <motion.button 
                                                             onClick={() => removeStation(s.id)} 
                                                             className="text-slate-600 dark:text-navy-400 hover:text-red-600 dark:hover:text-danger p-2 hover:bg-red-50 dark:hover:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-danger"
                                                             whileHover={{ scale: 1.1 }}
                                                             whileTap={{ scale: 0.9 }}
                                                         >
                                                             <TrashIcon className="w-4 h-4" />
                                                         </motion.button>
                                                     </div>
                                                 )}
                                             </td>
                                         </motion.tr>
                                     );
                                 })}
                                 {/* Add Row */}
                                 {!editingId && (
                                     <tr className="bg-slate-100 dark:bg-navy-900/50">
                                         <td className="px-6 py-2">
                                             <input 
                                                type="text" 
                                                placeholder="New Station Name"
                                                className="bg-transparent border border-white/20 rounded px-2 py-1 w-full text-white placeholder-navy-500 focus:outline-none focus:border-primary"
                                                value={newStation.name}
                                                onChange={e => setNewStation({...newStation, name: e.target.value})}
                                             />
                                         </td>
                                         <td className="px-6 py-2">
                                             <input 
                                                type="text" 
                                                placeholder="USD"
                                                className="bg-transparent border border-white/20 rounded px-2 py-1 w-16 text-white uppercase focus:outline-none focus:border-primary"
                                                value={newStation.localCurrency}
                                                onChange={e => setNewStation({...newStation, localCurrency: e.target.value})}
                                             />
                                         </td>
                                         <td className="px-6 py-2">
                                             <input 
                                                type="number" 
                                                className="bg-transparent border border-white/20 rounded px-2 py-1 w-24 text-white focus:outline-none focus:border-primary"
                                                value={newStation.dailyVolume}
                                                onChange={e => setNewStation({...newStation, dailyVolume: parseFloat(e.target.value)})}
                                             />
                                         </td>
                                         <td className="px-6 py-2 text-sm text-navy-400">
                                              Default ({newStation.recoveryRate}%)
                                         </td>
                                         <td className="px-6 py-2 text-right" colSpan={2}>
                                             <button 
                                                onClick={addStation}
                                                disabled={!newStation.name}
                                                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-3 py-1.5 rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                                             >
                                                 Add Station
                                             </button>
                                         </td>
                                     </tr>
                                 )}
                             </tbody>
                         </table>
                     </div>
                 ) : (
                     <div className="h-[400px] w-full p-4">
                         <h4 className="text-center text-white font-bold mb-4">Fleet Performance Matrix</h4>
                         <ResponsiveContainer width="100%" height="100%">
                             <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                 <XAxis 
                                    type="number" 
                                    dataKey="dailyVolume" 
                                    name="Daily Volume" 
                                    stroke="#94a3b8"
                                    label={{ value: 'Daily Volume', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                                 />
                                 <YAxis 
                                    type="number" 
                                    dataKey="netProfit" 
                                    name="Net Profit" 
                                    stroke="#94a3b8"
                                    tickFormatter={(val) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(val)}
                                    label={{ value: 'Net Profit', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                                 />
                                 <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip currency={currency} />} />
                                 <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                                 <Scatter name="Stations" data={analysis.stationResults} fill="#8884d8">
                                     {analysis.stationResults.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.netProfit > 0 ? '#10b981' : '#ef4444'} />
                                     ))}
                                 </Scatter>
                             </ScatterChart>
                         </ResponsiveContainer>
                     </div>
                 )}
             </Card>
          </div>

          <div className="space-y-6">
              {/* Controls */}
              <Card title="Analysis Parameters">
                  <div className="space-y-4">
                      <SliderInput 
                          label="Volume Growth Rate (Annual)"
                          value={growthRate}
                          min={-5} max={20} step={0.5}
                          unit="%"
                          onChange={setGrowthRate}
                          description="Projected annual increase in gasoline volume across portfolio."
                      />
                       <SliderInput 
                          label="Daily Op Cost / Unit"
                          value={dailyOpsCost}
                          min={0} max={50} step={1}
                          unit={CURRENCY_SYMBOLS[currency]}
                          onChange={setDailyOpsCost}
                          description="Overhead cost per day per unit."
                      />
                  </div>
              </Card>

              {/* Unit Economics Breakdown */}
              <Card title="Unit Economics (Per Unit/Year)">
                  <div className="space-y-3 text-sm">
                       <div className="flex justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                           <span className="text-slate-600 dark:text-navy-300 font-semibold">Revenue (Year 1 Avg)</span>
                           <span className="text-emerald-600 dark:text-success font-bold">{formatCurrency((analysis.totalRevenue / globalParams.leaseTerm) / Math.max(1, stations.length), currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Maintenance</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.annualMaintenanceCost, currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Electricity</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.unitElectricityConsumptionKwhDay * 365 * globalParams.electricityPrice, currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Warranty Reserve</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.annualWarrantyCost, currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Consumables</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.annualConsumablesCost, currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Daily Ops ({formatCurrency(dailyOpsCost, currency)}/day)</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(dailyOpsCost * 365, currency)}</span>
                       </div>
                        <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2 font-bold">
                           <span className="text-slate-900 dark:text-white">Total Operating Cost</span>
                           <span className="text-red-600 dark:text-danger">{formatCurrency(globalParams.annualMaintenanceCost + globalParams.annualWarrantyCost + globalParams.annualConsumablesCost + (dailyOpsCost * 365) + (globalParams.unitElectricityConsumptionKwhDay * 365 * globalParams.electricityPrice), currency)}</span>
                       </div>
                  </div>
              </Card>
              
              {/* Portfolio Metrics */}
              <Card title="Portfolio Metrics">
                  <div className="space-y-3 text-sm">
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Total Stations</span>
                           <span className="text-slate-900 dark:text-white font-bold">{stations.length}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Profitable Stations</span>
                           <span className="text-emerald-600 dark:text-success font-bold">{analysis.stationResults.filter(s => s.netProfit > 0).length}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Unprofitable Stations</span>
                           <span className="text-red-600 dark:text-danger font-bold">{analysis.stationResults.filter(s => s.netProfit <= 0).length}</span>
                       </div>
                       <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2">
                           <span className="text-slate-600 dark:text-navy-400">Total Investment</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(analysis.totalCost, currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Total Revenue ({globalParams.leaseTerm}yr)</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(analysis.totalRevenue, currency)}</span>
                       </div>
                       <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2 font-bold">
                           <span className="text-slate-900 dark:text-white">Portfolio ROI</span>
                           <span className={`${analysis.roi >= 0 ? 'text-emerald-600 dark:text-success' : 'text-red-600 dark:text-danger'}`}>{analysis.roi.toFixed(1)}%</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Avg Profit/Station</span>
                           <span className={`font-mono ${analysis.avgProfitPerStation >= 0 ? 'text-emerald-600 dark:text-success' : 'text-red-600 dark:text-danger'}`}>{formatCurrency(analysis.avgProfitPerStation, currency)}</span>
                       </div>
                  </div>
              </Card>
              
              {/* Quick Stats */}
              <Card title="Break-Even Analysis">
                  <div className="space-y-3 text-sm">
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Avg Daily Volume</span>
                           <span className="text-slate-900 dark:text-white font-mono">{(stations.reduce((sum, s) => sum + s.dailyVolume, 0) / Math.max(1, stations.length)).toFixed(0)} L</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Avg Recovery Rate</span>
                           <span className="text-slate-900 dark:text-white font-mono">{(stations.reduce((sum, s) => sum + s.recoveryRate, 0) / Math.max(1, stations.length)).toFixed(1)}%</span>
                       </div>
                       <div className="flex justify-between border-t border-slate-200 dark:border-white/10 pt-2">
                           <span className="text-slate-600 dark:text-navy-400">Best Performer</span>
                           <span className="text-emerald-600 dark:text-success font-bold text-xs">{analysis.stationResults.length > 0 ? analysis.stationResults.reduce((best, s) => s.netProfit > best.netProfit ? s : best).name : 'N/A'}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Worst Performer</span>
                           <span className="text-red-600 dark:text-danger font-bold text-xs">{analysis.stationResults.length > 0 ? analysis.stationResults.reduce((worst, s) => s.netProfit < worst.netProfit ? s : worst).name : 'N/A'}</span>
                       </div>
                  </div>
              </Card>
              
              {/* Parameters Used */}
              <Card title="Parameters Used">
                  <div className="space-y-3 text-sm">
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Gasoline Price</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.gasolinePrice, currency)}/L</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Revenue Share</span>
                           <span className="text-slate-900 dark:text-white font-mono">{globalParams.companyRevenueShare.toFixed(1)}%</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Lease Term</span>
                           <span className="text-slate-900 dark:text-white font-mono">{globalParams.leaseTerm} years</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Unit Cost (COGS)</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.unitCost, currency)}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Electricity Price</span>
                           <span className="text-slate-900 dark:text-white font-mono">{formatCurrency(globalParams.electricityPrice, currency)}/kWh</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Volume Growth</span>
                           <span className="text-slate-900 dark:text-white font-mono">{growthRate.toFixed(1)}%/yr</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Discount Rate</span>
                           <span className="text-slate-900 dark:text-white font-mono">{globalParams.discountRate.toFixed(1)}%</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-slate-600 dark:text-navy-400">Inflation Rate</span>
                           <span className="text-slate-900 dark:text-white font-mono">{globalParams.inflationRate.toFixed(1)}%</span>
                       </div>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default LeaseAnalysis;
