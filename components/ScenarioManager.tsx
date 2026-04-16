
import React, { useState, useEffect } from 'react';
import { InputParams, Scenario } from '../types';
import { TrashIcon, SaveIcon, FolderIcon, DownloadIcon, ClipboardListIcon } from './icons';
import Card from './Card';

interface ScenarioManagerProps {
  currentParams: InputParams;
  onLoad: (params: InputParams) => void;
}

const ScenarioManager: React.FC<ScenarioManagerProps> = ({ currentParams, onLoad }) => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [selectedTag, setSelectedTag] = useState<'base' | 'optimistic' | 'pessimistic' | 'custom'>('custom');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('masarzero_scenarios');
    if (saved) {
      try {
        setScenarios(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse scenarios", e);
      }
    }
  }, []);

  const saveScenariosToStorage = (updatedScenarios: Scenario[]) => {
    localStorage.setItem('masarzero_scenarios', JSON.stringify(updatedScenarios));
    setScenarios(updatedScenarios);
  };

  const handleSave = () => {
    if (!newScenarioName.trim()) {
      showNotification('Please enter a name for the scenario.', 'error');
      return;
    }

    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: newScenarioName,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      params: { ...currentParams },
      tag: selectedTag
    };

    const updated = [newScenario, ...scenarios];
    saveScenariosToStorage(updated);
    setNewScenarioName('');
    showNotification('Scenario saved successfully!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this scenario?')) {
        const updated = scenarios.filter(s => s.id !== id);
        saveScenariosToStorage(updated);
        showNotification('Scenario deleted.', 'success');
    }
  };

  const handleLoad = (scenario: Scenario) => {
    onLoad(scenario.params);
    showNotification(`Loaded scenario: ${scenario.name}`, 'success');
  };

  const handleExportToFile = () => {
      if (scenarios.length === 0) {
          showNotification('No scenarios to export.', 'error');
          return;
      }
      const dataStr = JSON.stringify(scenarios, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `masarzero_scenarios_backup_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('Backup file downloaded.', 'success');
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const imported = JSON.parse(e.target?.result as string);
              if (Array.isArray(imported)) {
                  // Merge with existing or Replace? Let's merge for safety, filtering duplicates by ID
                  const merged = [...scenarios, ...imported].filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
                  saveScenariosToStorage(merged);
                  showNotification(`Imported ${imported.length} scenarios.`, 'success');
              } else {
                  showNotification('Invalid file format.', 'error');
              }
          } catch (err) {
              showNotification('Failed to parse file.', 'error');
          }
      };
      reader.readAsText(file);
      // Reset input value to allow re-importing same file if needed
      event.target.value = '';
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
      setNotification(msg);
      setTimeout(() => setNotification(null), 3000);
  }

  const getTagColor = (tag?: string) => {
    switch(tag) {
      case 'base': return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
      case 'optimistic': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'pessimistic': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'custom': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const filteredScenarios = filterTag === 'all' 
    ? scenarios 
    : scenarios.filter(s => s.tag === filterTag);

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-primary rounded-xl shadow-glow">
                <FolderIcon className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white">Scenario Manager</h1>
                <p className="text-navy-400 mt-1">Save your current configuration or load a previous workspace.</p>
            </div>
        </div>
        <div className="flex space-x-3">
             <label className="flex items-center space-x-2 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-slate-50 dark:focus-within:ring-offset-navy-950">
                <ClipboardListIcon className="w-4 h-4" />
                <span>Import JSON</span>
                <input type="file" accept="application/json" onChange={handleImportFile} className="sr-only" />
            </label>
            <button 
                onClick={handleExportToFile}
                className="flex items-center space-x-2 bg-slate-200 dark:bg-navy-800 hover:bg-slate-300 dark:hover:bg-navy-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-300 dark:border-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-navy-950"
            >
                <DownloadIcon className="w-4 h-4" />
                <span>Export JSON</span>
            </button>
        </div>
      </div>

      {notification && (
          <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="bg-glass-200 backdrop-blur-md border border-glass-highlight px-6 py-3 rounded-xl shadow-2xl text-white font-semibold">
                  {notification}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create New Scenario */}
        <div className="lg:col-span-1">
             <Card title="Save Current State" className="h-full">
                <div className="space-y-4">
                    <p className="text-sm text-navy-300">
                        Create a snapshot of all your current inputs, assumptions, and settings.
                    </p>
                    <div>
                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2">Scenario Name</label>
                        <input 
                            type="text" 
                            value={newScenarioName}
                            onChange={(e) => setNewScenarioName(e.target.value)}
                            placeholder="e.g. High Volume Site A"
                            className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/20 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-navy-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-navy-400 uppercase tracking-widest mb-2">Scenario Tag</label>
                        <select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value as any)}
                            className="w-full bg-white dark:bg-navy-950 border border-slate-300 dark:border-white/20 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                        >
                            <option value="custom">Custom</option>
                            <option value="base">Base Case</option>
                            <option value="optimistic">Optimistic</option>
                            <option value="pessimistic">Pessimistic</option>
                        </select>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={!newScenarioName.trim()}
                        className="w-full bg-gradient-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-glow hover:brightness-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-navy-950"
                    >
                        <SaveIcon className="w-5 h-5" />
                        <span>Save Scenario</span>
                    </button>
                </div>
             </Card>
        </div>

        {/* List Scenarios */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Saved Workspaces</h3>
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-navy-900 border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="all">All Tags</option>
                    <option value="base">Base Case</option>
                    <option value="optimistic">Optimistic</option>
                    <option value="pessimistic">Pessimistic</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
            {filteredScenarios.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 text-center">
                    <FolderIcon className="w-12 h-12 text-navy-600 mb-4" />
                    <p className="text-navy-300 font-medium">
                        {filterTag === 'all' ? 'No saved scenarios yet.' : `No ${filterTag} scenarios found.`}
                    </p>
                    <p className="text-navy-500 text-sm mt-1">
                        {filterTag === 'all' ? 'Save your first configuration to see it here.' : 'Try a different filter.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredScenarios.map((scenario) => (
                        <div key={scenario.id} className="bg-glass-100 border border-glass-border rounded-xl p-5 hover:border-primary/50 transition-all duration-200 group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-white text-lg truncate" title={scenario.name}>{scenario.name}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${getTagColor(scenario.tag)}`}>
                                            {scenario.tag || 'custom'}
                                        </span>
                                    </div>
                                    <span className="text-xs text-navy-400 font-mono">{scenario.date}</span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(scenario.id)}
                                    className="text-navy-500 hover:text-danger transition-colors p-1 focus:outline-none focus:ring-2 focus:ring-danger rounded"
                                    title="Delete Scenario"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-1 mb-5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-navy-400">Model:</span>
                                    <span className="text-white font-medium">{scenario.params.businessModel}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-navy-400">Clients:</span>
                                    <span className="text-white font-medium">{scenario.params.numberOfClients}</span>
                                </div>
                                 <div className="flex justify-between text-xs">
                                    <span className="text-navy-400">Units/Client:</span>
                                    <span className="text-white font-medium">{scenario.params.unitsPerClient}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleLoad(scenario)}
                                className="w-full bg-slate-100 dark:bg-navy-800 hover:bg-primary dark:hover:bg-primary text-primary dark:text-primary-light hover:text-white dark:hover:text-white border border-primary/30 hover:border-primary font-semibold py-2 rounded-lg transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-navy-950"
                            >
                                Load Workspace
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioManager;
