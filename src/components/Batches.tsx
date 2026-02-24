import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Layers, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Users,
  Search,
  Merge
} from 'lucide-react';
import { Batch } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Batches({ isDarkMode }: { isDarkMode: boolean }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = () => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(setBatches);
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBatch)
    }).then(() => {
      fetchBatches();
      setIsAddModalOpen(false);
      setNewBatch({ name: '', description: '' });
    });
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search batches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
              isDarkMode ? "bg-[#0a0a0a] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>
        <div className="flex items-center gap-3">
          <button className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:bg-white/5",
            isDarkMode ? "bg-[#0a0a0a] border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-600"
          )}>
            <Merge size={18} />
            <span>Merge Batches</span>
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} />
            <span>Create Batch</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div 
            key={batch.id}
            className={cn(
              "p-6 rounded-2xl border transition-all hover:scale-[1.02] duration-300 group",
              isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Layers size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500">
                  <Edit2 size={16} />
                </button>
                <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold">{batch.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{batch.description || 'No description provided.'}</p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Users size={16} />
                <span>120 Contacts</span>
              </div>
              <button className="text-xs font-bold text-emerald-500 hover:underline">
                View Contacts
              </button>
            </div>
          </div>
        ))}
        {filteredBatches.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
            No batches found. Create your first batch to organize contacts!
          </div>
        )}
      </div>

      {/* Add Batch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-full max-w-md p-8 rounded-3xl border shadow-2xl",
              isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create New Batch</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBatch} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Batch Name</label>
                <input 
                  required
                  type="text"
                  value={newBatch.name}
                  onChange={e => setNewBatch({...newBatch, name: e.target.value})}
                  placeholder="e.g. Morning Batch 2026"
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea 
                  value={newBatch.description}
                  onChange={e => setNewBatch({...newBatch, description: e.target.value})}
                  placeholder="What is this batch for?"
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24 resize-none",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                Create Batch
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
