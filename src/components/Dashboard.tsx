import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  MessageSquare,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Stats } from '../types';
import { cn } from '../lib/utils';

const data = [
  { name: 'Mon', sent: 400, failed: 24 },
  { name: 'Tue', sent: 300, failed: 13 },
  { name: 'Wed', sent: 200, failed: 98 },
  { name: 'Thu', sent: 278, failed: 39 },
  { name: 'Fri', sent: 189, failed: 48 },
  { name: 'Sat', sent: 239, failed: 38 },
  { name: 'Sun', sent: 349, failed: 43 },
];

export default function Dashboard({ isDarkMode }: { isDarkMode: boolean }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  const cards = [
    { label: 'Total Messages', value: stats?.totalMessages || 0, icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Sent Successfully', value: stats?.sentMessages || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Failed Messages', value: stats?.failedMessages || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Total Contacts', value: stats?.totalContacts || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div 
            key={i}
            className={cn(
              "p-6 rounded-2xl border transition-all hover:scale-[1.02] duration-300",
              isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-xl", card.bg)}>
                <card.icon className={card.color} size={24} />
              </div>
              <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                <TrendingUp size={16} />
                +12%
              </div>
            </div>
            <div className="space-y-1">
              <p className={cn("text-sm font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                {card.label}
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6">Messaging Activity</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#333" : "#eee"} vertical={false} />
                <XAxis dataKey="name" stroke={isDarkMode ? "#666" : "#999"} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isDarkMode ? "#666" : "#999"} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#111' : '#fff', 
                    border: `1px solid ${isDarkMode ? '#333' : '#eee'}`,
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="sent" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h3 className="text-lg font-semibold mb-6">Recent Campaigns</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className={cn(
                "p-4 rounded-xl border flex items-center justify-between",
                isDarkMode ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"
              )}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Send size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Batch {i + 1} Notification</p>
                    <p className="text-xs text-slate-500">Scheduled for 2:00 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">1,200 recipients</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-500">
                    <Clock size={12} />
                    Processing
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
