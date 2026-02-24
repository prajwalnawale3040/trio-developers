import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Send, 
  Sparkles, 
  History, 
  CreditCard, 
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import Contacts from './components/Contacts';
import Batches from './components/Batches';
import Campaigns from './components/Campaigns';
import AITools from './components/AITools';
import HistoryView from './components/HistoryView';
import Payments from './components/Payments';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'batches', label: 'Batches', icon: Layers },
    { id: 'campaigns', label: 'Campaigns', icon: Send },
    { id: 'ai-tools', label: 'AI Creative', icon: Sparkles },
    { id: 'history', label: 'History', icon: History },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDarkMode ? "bg-[#050505] text-white" : "bg-slate-50 text-slate-900"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full z-50 transition-all duration-300 border-r",
        isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tighter flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                T
              </div>
              <span className={isDarkMode ? "text-white" : "text-slate-900"}>Trio Devs</span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group",
                activeTab === tab.id 
                  ? (isDarkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")
                  : (isDarkMode ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100")
              )}
            >
              <tab.icon size={22} className={cn(
                "transition-transform group-hover:scale-110",
                activeTab === tab.id ? "text-emerald-500" : ""
              )} />
              {isSidebarOpen && <span className="font-medium">{tab.label}</span>}
              {activeTab === tab.id && isSidebarOpen && (
                <motion.div 
                  layoutId="activeTab"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 w-full px-4 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-xl transition-colors",
              isDarkMode ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            {isSidebarOpen && <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button className={cn(
            "w-full flex items-center gap-4 p-3 rounded-xl transition-colors",
            isDarkMode ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
          )}>
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        isSidebarOpen ? "pl-64" : "pl-20"
      )}>
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-8 sticky top-0 z-40 backdrop-blur-md",
          isDarkMode ? "bg-[#050505]/80 border-white/10" : "bg-white/80 border-slate-200"
        )}>
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              isDarkMode ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-emerald-50 border-emerald-200 text-emerald-600"
            )}>
              Premium Plan
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard isDarkMode={isDarkMode} />}
              {activeTab === 'contacts' && <Contacts isDarkMode={isDarkMode} />}
              {activeTab === 'batches' && <Batches isDarkMode={isDarkMode} />}
              {activeTab === 'campaigns' && <Campaigns isDarkMode={isDarkMode} />}
              {activeTab === 'ai-tools' && <AITools isDarkMode={isDarkMode} />}
              {activeTab === 'history' && <HistoryView isDarkMode={isDarkMode} />}
              {activeTab === 'payments' && <Payments isDarkMode={isDarkMode} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 opacity-20 pointer-events-none select-none font-bold text-sm tracking-widest uppercase">
        Trio Developers
      </div>
    </div>
  );
}
