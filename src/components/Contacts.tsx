import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Filter,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';
import { Contact, Batch } from '../types';
import { cn } from '../lib/utils';

export default function Contacts({ isDarkMode }: { isDarkMode: boolean }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    batch_id: '',
    tags: '',
    category: '',
    notes: ''
  });

  useEffect(() => {
    fetchContacts();
    fetchBatches();
  }, []);

  const fetchContacts = () => {
    fetch('/api/contacts')
      .then(res => res.json())
      .then(setContacts);
  };

  const fetchBatches = () => {
    fetch('/api/batches')
      .then(res => res.json())
      .then(setBatches);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];
      
      const formattedContacts = data.map(row => ({
        name: row.Name || row.name || '',
        phone: String(row.Phone || row.phone || '').replace(/\D/g, ''),
        batch_id: null,
        tags: row.Tags || row.tags || '',
        category: row.Category || row.category || '',
        notes: row.Notes || row.notes || ''
      }));

      fetch('/api/contacts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: formattedContacts })
      }).then(() => fetchContacts());
    };
    reader.readAsBinaryString(file);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact)
    }).then(() => {
      fetchContacts();
      setIsAddModalOpen(false);
      setNewContact({ name: '', phone: '', batch_id: '', tags: '', category: '', notes: '' });
    });
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all",
              isDarkMode ? "bg-[#0a0a0a] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all hover:bg-emerald-500/10",
            isDarkMode ? "bg-[#0a0a0a] border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-600"
          )}>
            <Upload size={18} />
            <span>Import Excel</span>
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus size={18} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      <div className={cn(
        "rounded-2xl border overflow-hidden",
        isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
      )}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={cn(
              "border-b",
              isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
            )}>
              <th className="p-4 font-semibold text-sm">Name</th>
              <th className="p-4 font-semibold text-sm">Phone</th>
              <th className="p-4 font-semibold text-sm">Batch</th>
              <th className="p-4 font-semibold text-sm">Category</th>
              <th className="p-4 font-semibold text-sm">Tags</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">
                      {contact.name.charAt(0)}
                    </div>
                    <span className="font-medium">{contact.name}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-400">{contact.phone}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium",
                    isDarkMode ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                  )}>
                    {batches.find(b => b.id === contact.batch_id)?.name || 'Unassigned'}
                  </span>
                </td>
                <td className="p-4 text-slate-400">{contact.category || '-'}</td>
                <td className="p-4">
                  <div className="flex gap-1">
                    {contact.tags.split(',').map((tag, i) => tag && (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[10px] uppercase tracking-wider">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredContacts.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No contacts found. Add some to get started!
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "w-full max-w-lg p-8 rounded-3xl border shadow-2xl",
              isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add New Contact</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Name</label>
                  <input 
                    required
                    type="text"
                    value={newContact.name}
                    onChange={e => setNewContact({...newContact, name: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Phone Number</label>
                  <input 
                    required
                    type="text"
                    value={newContact.phone}
                    onChange={e => setNewContact({...newContact, phone: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Batch</label>
                <select 
                  value={newContact.batch_id}
                  onChange={e => setNewContact({...newContact, batch_id: e.target.value})}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Category</label>
                  <input 
                    type="text"
                    value={newContact.category}
                    onChange={e => setNewContact({...newContact, category: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Tags (comma separated)</label>
                  <input 
                    type="text"
                    value={newContact.tags}
                    onChange={e => setNewContact({...newContact, tags: e.target.value})}
                    className={cn(
                      "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Notes</label>
                <textarea 
                  value={newContact.notes}
                  onChange={e => setNewContact({...newContact, notes: e.target.value})}
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
                Save Contact
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
