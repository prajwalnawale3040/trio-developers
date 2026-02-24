import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  Download,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Message } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function HistoryView({ isDarkMode }: { isDarkMode: boolean }) {
  const [history, setHistory] = useState<Message[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/messages/history')
      .then(res => res.json())
      .then(setHistory);
  }, []);

  const filteredHistory = history.filter(h => 
    h.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    h.contact_phone?.includes(search) ||
    h.content.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="text-emerald-500" size={16} />;
      case 'failed': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-blue-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search history..."
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
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:bg-white/5",
            isDarkMode ? "bg-[#0a0a0a] border-white/10 text-slate-300" : "bg-white border-slate-200 text-slate-600"
          )}>
            <Download size={18} />
            <span>Export CSV</span>
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
              <th className="p-4 font-semibold text-sm">Recipient</th>
              <th className="p-4 font-semibold text-sm">Message</th>
              <th className="p-4 font-semibold text-sm">Batch</th>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Sent At</th>
              <th className="p-4 font-semibold text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredHistory.map((msg) => (
              <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-sm">{msg.contact_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{msg.contact_phone}</p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm line-clamp-1 max-w-xs text-slate-400">{msg.content}</p>
                </td>
                <td className="p-4">
                  <span className="text-xs font-medium text-slate-500">{msg.batch_name || '-'}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(msg.status)}
                    <span className={cn(
                      "text-xs font-medium capitalize",
                      msg.status === 'sent' ? "text-emerald-500" : 
                      msg.status === 'failed' ? "text-red-500" : "text-blue-500"
                    )}>
                      {msg.status}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-xs text-slate-500">
                  {msg.sent_at ? format(new Date(msg.sent_at), 'MMM d, h:mm a') : '-'}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500" title="Resend">
                      <RotateCcw size={14} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500" title="View Details">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHistory.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No message history found.
          </div>
        )}
      </div>
    </div>
  );
}
