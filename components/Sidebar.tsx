
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorIcon, ChartBarIcon, BeakerIcon, FolderIcon, ClipboardListIcon, TableIcon, ViewBoardsIcon, SlidersIcon, AdjustmentsIcon, ShieldCheckIcon, PresentationChartBarIcon, CogIcon } from './icons';

interface SidebarProps {
  activePage: 'model' | 'assumptions' | 'sensitivity' | 'scenarios' | 'lease-analysis' | 'monte-carlo' | 'comparison' | 'goal-seek' | 'impact' | 'presentation';
  onNavigate: (page: any) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isOpen = true, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
        {/* Mobile Overlay */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 bg-slate-900/80 dark:bg-navy-950/90 backdrop-blur-md z-30 lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
            onClick={onClose}
        />

        {/* Mobile Sidebar */}
        <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: isOpen ? 0 : '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed lg:hidden top-0 left-0 h-full w-64 bg-white dark:bg-navy-950 border-r border-slate-200 dark:border-white/5 flex flex-col justify-between z-40 shadow-2xl"
        >
            <div className="flex flex-col h-full">
                {/* Logo Area */}
                <div className="p-4 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-center relative overflow-hidden group min-h-[80px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-center gap-3">
                        <img 
                            src="https://www.masarzero.com/masarzerologo.png" 
                            alt="MasarZero Logo" 
                            className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(5,150,105,0.4)]" 
                            referrerPolicy="no-referrer" 
                        />
                    </div>
                </div>
                
                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6 px-2 space-y-8 custom-scrollbar">
                    <div>
                        <div className="px-3 mb-3 text-[9px] font-black text-slate-500 dark:text-navy-500 uppercase tracking-[0.15em]">
                            Core Analysis
                        </div>
                        <ul className="space-y-1">
                            <NavItem 
                                icon={<ViewBoardsIcon className="w-5 h-5"/>} 
                                text="Dashboard" 
                                active={activePage === 'model'} 
                                onClick={() => { onNavigate('model'); onClose?.(); }}
                                isExpanded={true}
                            />
                             <NavItem 
                                icon={<ShieldCheckIcon className="w-5 h-5"/>} 
                                text="Impact" 
                                active={activePage === 'impact'} 
                                onClick={() => { onNavigate('impact'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                id="nav-item-comparison" 
                                icon={<ViewBoardsIcon className="w-5 h-5 rotate-90"/>} 
                                text="Scenarios" 
                                active={activePage === 'comparison'} 
                                onClick={() => { onNavigate('comparison'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                icon={<ChartBarIcon className="w-5 h-5"/>} 
                                text="Sensitivity" 
                                active={activePage === 'sensitivity'} 
                                onClick={() => { onNavigate('sensitivity'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                id="nav-item-monte-carlo" 
                                icon={<TableIcon className="w-5 h-5"/>} 
                                text="Monte Carlo" 
                                active={activePage === 'monte-carlo'} 
                                onClick={() => { onNavigate('monte-carlo'); onClose?.(); }}
                                isExpanded={true}
                            />
                        </ul>
                    </div>

                    <div>
                        <div className="px-3 mb-3 text-[9px] font-black text-slate-500 dark:text-navy-500 uppercase tracking-[0.15em]">
                            Tools & Config
                        </div>
                        <ul className="space-y-1">
                            <NavItem 
                                icon={<PresentationChartBarIcon className="w-5 h-5"/>} 
                                text="Present" 
                                active={activePage === 'presentation'} 
                                onClick={() => { onNavigate('presentation'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                icon={<AdjustmentsIcon className="w-5 h-5"/>} 
                                text="Goal Seek" 
                                active={activePage === 'goal-seek'} 
                                onClick={() => { onNavigate('goal-seek'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                icon={<ClipboardListIcon className="w-5 h-5"/>} 
                                text="Lease" 
                                active={activePage === 'lease-analysis'} 
                                onClick={() => { onNavigate('lease-analysis'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                icon={<FolderIcon className="w-5 h-5"/>} 
                                text="Saved" 
                                active={activePage === 'scenarios'} 
                                onClick={() => { onNavigate('scenarios'); onClose?.(); }}
                                isExpanded={true}
                            />
                            <NavItem 
                                icon={<CogIcon className="w-5 h-5"/>} 
                                text="Settings" 
                                active={activePage === 'assumptions'} 
                                onClick={() => { onNavigate('assumptions'); onClose?.(); }}
                                isExpanded={true}
                            />
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-navy-900/30 space-y-2">
                    <a
                        href="https://www.masarzero.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950 group"
                    >
                        <span className="uppercase tracking-wider">Visit MasarZero</span>
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                    
                    <button className="w-full flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-navy-300 text-[10px] font-bold py-2.5 rounded-lg transition-all border border-slate-200 dark:border-white/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950 group overflow-hidden uppercase tracking-wider">
                        <span className="group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors">v3.5.0 Pro</span>
                    </button>
                </div>
            </div>
        </motion.nav>

        {/* Collapsible Blade Sidebar */}
        <motion.nav 
            id="sidebar-nav" 
            initial={false}
            animate={{ 
                width: isExpanded ? '280px' : '80px',
            }}
            transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className={`
                hidden lg:flex
                h-full
                bg-white/95 dark:bg-navy-950/95 
                backdrop-blur-xl
                border-r border-slate-200/50 dark:border-white/5 
                flex-col justify-between flex-shrink-0 
                shadow-[4px_0_24px_-8px_rgba(0,0,0,0.1)]
                dark:shadow-[4px_0_24px_-8px_rgba(0,0,0,0.5)]
                overflow-hidden
            `}
        >
            <div className="flex flex-col h-full">
                {/* Logo Area */}
                <motion.div 
                    className="p-4 border-b border-slate-200/50 dark:border-white/5 flex items-center justify-center relative overflow-hidden group min-h-[80px]"
                    whileHover={{ backgroundColor: 'rgba(5, 150, 105, 0.03)' }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <motion.div 
                        className="relative z-10 flex items-center gap-3"
                        animate={{ scale: isExpanded ? 1 : 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        <AnimatePresence mode="wait">
                            {isExpanded ? (
                                <motion.img
                                    key="full-logo"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    src="https://www.masarzero.com/masarzerologo.png" 
                                    alt="MasarZero Logo" 
                                    className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(5,150,105,0.4)]" 
                                    referrerPolicy="no-referrer" 
                                />
                            ) : (
                                <motion.img
                                    key="favicon"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.2 }}
                                    src="/favicon.svg" 
                                    alt="MasarZero Icon" 
                                    className="h-8 w-8 object-contain drop-shadow-[0_0_12px_rgba(5,150,105,0.4)]" 
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
                
                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-6 px-2 space-y-8 custom-scrollbar">
                    <div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="px-3 mb-3 text-[9px] font-black text-slate-500 dark:text-navy-500 uppercase tracking-[0.15em] whitespace-nowrap"
                                >
                                    Core Analysis
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <ul className="space-y-1">
                            <NavItem 
                                icon={<ViewBoardsIcon className="w-5 h-5"/>} 
                                text="Dashboard" 
                                active={activePage === 'model'} 
                                onClick={() => { onNavigate('model'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                             <NavItem 
                                icon={<ShieldCheckIcon className="w-5 h-5"/>} 
                                text="Impact" 
                                active={activePage === 'impact'} 
                                onClick={() => { onNavigate('impact'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                id="nav-item-comparison" 
                                icon={<ViewBoardsIcon className="w-5 h-5 rotate-90"/>} 
                                text="Scenarios" 
                                active={activePage === 'comparison'} 
                                onClick={() => { onNavigate('comparison'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                icon={<ChartBarIcon className="w-5 h-5"/>} 
                                text="Sensitivity" 
                                active={activePage === 'sensitivity'} 
                                onClick={() => { onNavigate('sensitivity'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                id="nav-item-monte-carlo" 
                                icon={<TableIcon className="w-5 h-5"/>} 
                                text="Monte Carlo" 
                                active={activePage === 'monte-carlo'} 
                                onClick={() => { onNavigate('monte-carlo'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                        </ul>
                    </div>

                    <div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="px-3 mb-3 text-[9px] font-black text-slate-500 dark:text-navy-500 uppercase tracking-[0.15em] whitespace-nowrap"
                                >
                                    Tools & Config
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <ul className="space-y-1">
                            <NavItem 
                                icon={<PresentationChartBarIcon className="w-5 h-5"/>} 
                                text="Present" 
                                active={activePage === 'presentation'} 
                                onClick={() => { onNavigate('presentation'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                icon={<AdjustmentsIcon className="w-5 h-5"/>} 
                                text="Goal Seek" 
                                active={activePage === 'goal-seek'} 
                                onClick={() => { onNavigate('goal-seek'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                icon={<ClipboardListIcon className="w-5 h-5"/>} 
                                text="Lease" 
                                active={activePage === 'lease-analysis'} 
                                onClick={() => { onNavigate('lease-analysis'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                icon={<FolderIcon className="w-5 h-5"/>} 
                                text="Saved" 
                                active={activePage === 'scenarios'} 
                                onClick={() => { onNavigate('scenarios'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                            <NavItem 
                                icon={<CogIcon className="w-5 h-5"/>} 
                                text="Settings" 
                                active={activePage === 'assumptions'} 
                                onClick={() => { onNavigate('assumptions'); onClose?.(); }}
                                isExpanded={isExpanded}
                            />
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <motion.div 
                    className="p-3 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-navy-900/30 space-y-2"
                    whileHover={{ backgroundColor: 'rgba(5, 150, 105, 0.05)' }}
                >
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.a
                                href="https://www.masarzero.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950 group"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className="uppercase tracking-wider">Visit MasarZero</span>
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </motion.a>
                        )}
                    </AnimatePresence>
                    
                    <motion.button 
                        className="w-full flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-navy-300 text-[10px] font-bold py-2.5 rounded-lg transition-all border border-slate-200 dark:border-white/5 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950 group overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <AnimatePresence mode="wait">
                            {isExpanded ? (
                                <motion.span
                                    key="expanded"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group-hover:text-primary-dark dark:group-hover:text-primary-light transition-colors uppercase tracking-wider"
                                >
                                    v3.5.0 Pro
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="collapsed"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-primary font-black"
                                >
                                    v3
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.div>
            </div>
        </motion.nav>
    </>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  onClick?: () => void;
  id?: string;
  isExpanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, active, onClick, id, isExpanded }) => {
  return (
    <li>
      <motion.button 
        id={id}
        onClick={onClick} 
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-navy-950 relative overflow-hidden
            ${active 
                ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary-dark dark:text-white shadow-[0_0_20px_rgba(5,150,105,0.15)] border border-primary/20' 
                : 'text-slate-600 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5 border border-transparent'
            }`}
        whileHover={{ x: active ? 0 : 4 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {active && (
            <motion.div 
                layoutId="activeIndicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-dark shadow-[0_0_10px_rgba(5,150,105,0.8)]" 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
        <motion.span 
            className={`transition-colors duration-200 flex-shrink-0 ${active ? 'text-primary-dark dark:text-primary-light drop-shadow-[0_0_8px_rgba(5,150,105,0.6)]' : 'text-slate-400 dark:text-navy-500 group-hover:text-primary-dark dark:group-hover:text-primary-light'}`}
            animate={{ scale: active ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {icon}
        </motion.span>
        <AnimatePresence>
            {isExpanded && (
                <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10 whitespace-nowrap"
                >
                    {text}
                </motion.span>
            )}
        </AnimatePresence>
      </motion.button>
    </li>
  );
};

export default Sidebar;
