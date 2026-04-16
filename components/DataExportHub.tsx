import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatedResults, InputParams } from '../types';
import { DownloadIcon, XIcon, TableIcon, CheckIcon, DocumentTextIcon, ClipboardIcon, PrinterIcon } from './icons';

interface DataExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  results: CalculatedResults;
  inputs: InputParams;
  currency: string;
}

const DataExportHub: React.FC<DataExportHubProps> = ({ isOpen, onClose, results, inputs, currency }) => {
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value);

  const triggerStatus = (msg: string) => {
    setExportStatus(msg);
    setTimeout(() => setExportStatus(null), 3000);
  };

  const exportToCSV = () => {
    const rows: string[][] = [
      ['Metric', 'Value'],
      ['Business Model', inputs.businessModel],
      ['Lease Term', `${inputs.leaseTerm} years`],
      ['Units', `${inputs.unitsPerClient * inputs.numberOfClients}`],
      ['Daily Volume', `${inputs.avgGasolineSold} ${inputs.unitSystem}`],
      [],
      ['Net Profit', formatCurrency(results.profitability.netProfit)],
      ['ROI', `${results.profitability.roi.toFixed(2)}%`],
      ['NPV', formatCurrency(results.profitability.npv)],
      ['IRR', `${results.profitability.irr.toFixed(2)}%`],
      ['Payback Period', results.profitability.paybackPeriod < 0 ? 'Never' : `${results.profitability.paybackPeriod.toFixed(1)} years`],
      [],
      ['Total Revenue', formatCurrency(results.revenue.totalRevenue)],
      ['Total Costs', formatCurrency(results.costs.totalCosts)],
      [],
      ['CO2 Saved', `${Math.round(results.impact.totalCo2Saved)} tonnes`],
      ['Trees Equivalent', Math.round(results.impact.treesPlantedEquiv).toLocaleString()],
      [],
      ['Year', 'Cash Flow'],
      ...results.cashFlow.map((cf, idx) => [`Year ${idx}`, formatCurrency(cf)]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `financial_model_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    triggerStatus('CSV exported successfully!');
  };

  const exportToJSON = () => {
    const data = { inputs, results, exportDate: new Date().toISOString(), currency };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    link.download = `financial_model_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    triggerStatus('JSON exported successfully!');
  };

  const copyToClipboard = () => {
    const text = `Financial Model Summary
Generated: ${new Date().toLocaleDateString()}

Key Metrics:
• Net Profit: ${formatCurrency(results.profitability.netProfit)}
• ROI: ${results.profitability.roi.toFixed(1)}%
• NPV: ${formatCurrency(results.profitability.npv)}
• IRR: ${results.profitability.irr.toFixed(1)}%
• Payback: ${results.profitability.paybackPeriod < 0 ? 'Never' : results.profitability.paybackPeriod.toFixed(1) + ' years'}

Configuration:
• Model: ${inputs.businessModel}
• Term: ${inputs.leaseTerm} years
• Units: ${inputs.unitsPerClient * inputs.numberOfClients}
• Daily Volume: ${inputs.avgGasolineSold.toLocaleString()} ${inputs.unitSystem}

Environmental Impact:
• CO2 Saved: ${Math.round(results.impact.totalCo2Saved).toLocaleString()} tonnes
• Trees Equivalent: ${Math.round(results.impact.treesPlantedEquiv).toLocaleString()}`;
    navigator.clipboard.writeText(text);
    triggerStatus('Copied to clipboard!');
  };

  const exportOptions = [
    {
      icon: <TableIcon className="w-5 h-5" />,
      label: 'Export to CSV',
      sub: 'For Excel, Google Sheets',
      action: exportToCSV,
      shortcut: null,
    },
    {
      icon: <DocumentTextIcon className="w-5 h-5" />,
      label: 'Export to JSON',
      sub: 'Full model data with inputs',
      action: exportToJSON,
      shortcut: null,
    },
    {
      icon: <ClipboardIcon className="w-5 h-5" />,
      label: 'Copy to Clipboard',
      sub: 'Quick summary for sharing',
      action: copyToClipboard,
      shortcut: 'Ctrl+C',
    },
    {
      icon: <PrinterIcon className="w-5 h-5" />,
      label: 'Print / Save PDF',
      sub: 'Professional report via print',
      action: () => window.print(),
      shortcut: 'Ctrl+P',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal — perfectly centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="pointer-events-auto w-full max-w-md bg-navy-900 border border-primary/30 rounded-2xl shadow-[0_0_60px_rgba(5,150,105,0.2)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 border border-primary/30 rounded-lg">
                    <DownloadIcon className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Data Export Hub</h3>
                    <p className="text-xs text-navy-400">Export your model in any format</p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-navy-400 hover:text-white"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XIcon className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="p-6 space-y-3">
                {/* Status Banner */}
                <AnimatePresence>
                  {exportStatus && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 px-4 py-3 bg-primary/10 border border-primary/30 rounded-xl"
                    >
                      <CheckIcon className="w-4 h-4 text-primary-light flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary-light">{exportStatus}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Export Buttons */}
                {exportOptions.map((opt, i) => (
                  <motion.button
                    key={i}
                    onClick={opt.action}
                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/40 rounded-xl transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-navy-400 group-hover:text-primary-light transition-colors">
                        {opt.icon}
                      </span>
                      <div className="text-left">
                        <div className="font-bold text-white text-sm">{opt.label}</div>
                        <div className="text-xs text-navy-400">{opt.sub}</div>
                      </div>
                    </div>
                    {opt.shortcut
                      ? <span className="text-[10px] font-mono text-navy-500 bg-white/5 px-2 py-1 rounded border border-white/10">{opt.shortcut}</span>
                      : <DownloadIcon className="w-4 h-4 text-navy-500 group-hover:text-primary-light transition-colors" />
                    }
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 pb-5 text-center">
                <p className="text-xs text-navy-600">All exports are generated locally — no data leaves your browser</p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DataExportHub;
