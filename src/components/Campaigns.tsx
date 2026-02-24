import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Clock, Users, Save, Trash2, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Batch, Contact } from '../types';
import { cn } from '../lib/utils';
import { geminiService } from '../services/geminiService';

export default function Campaigns({ isDarkMode }: { isDarkMode: boolean }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetch('/api/batches').then(res => res.json()).then(setBatches);
  }, []);

  const handleEnhance = async (tone: string) => {
    if (!message) return;
    setIsEnhancing(true);
    try {
      const { enhancedText } = await geminiService.enhanceMessage(message, tone);
      setMessage(enhancedText);
    } catch (error) {
      console.error(error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSend = async () => {
    if (!message || !selectedBatch) return;
    setIsSending(true);
    try {
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batch_id: selectedBatch,
          content: message,
          scheduled_at: scheduledAt || null
        })
      });
      alert('Campaign started successfully!');
      setMessage('');
      setSelectedBatch('');
      setScheduledAt('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className={cn(
          "p-8 rounded-3xl border",
          isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">New Campaign</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500" title="Save Template">
                <Save size={20} />
              </button>
              <button className="p-2 hover:bg-white/5 rounded-lg text-slate-500" title="Clear">
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Select Target Batch</label>
              <select 
                value={selectedBatch}
                onChange={e => setSelectedBatch(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}
              >
                <option value="">Select a batch...</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-400">Message Content</label>
                <div className="flex gap-2">
                  {['Professional', 'Friendly', 'Urgent'].map(tone => (
                    <button
                      key={tone}
                      onClick={() => handleEnhance(tone.toLowerCase())}
                      disabled={isEnhancing || !message}
                      className={cn(
                        "text-[10px] px-2 py-1 rounded-md border transition-all flex items-center gap-1",
                        isDarkMode ? "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      )}
                    >
                      <Sparkles size={10} />
                      {tone}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative">
                <textarea 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type your message here... Use {{name}} for personalization."
                  className={cn(
                    "w-full px-4 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-48 resize-none transition-all",
                    isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                  )}
                />
                {isEnhancing && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    >
                      <Wand2 className="text-emerald-500" size={32} />
                    </motion.div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {['{{name}}', '{{batch}}', '{{time}}', '{{date}}'].map(tag => (
                  <button 
                    key={tag}
                    onClick={() => setMessage(prev => prev + ' ' + tag)}
                    className={cn(
                      "px-2 py-1 rounded-md text-[10px] font-mono",
                      isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Schedule (Optional)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleSend}
                  disabled={isSending || !message || !selectedBatch}
                  className={cn(
                    "w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  {isSending ? 'Processing...' : (scheduledAt ? 'Schedule Campaign' : 'Send Now')}
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className={cn(
          "p-6 rounded-3xl border",
          isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
        )}>
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            Batch Summary
          </h4>
          {selectedBatch ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Recipients</span>
                <span className="font-bold">1,240</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Estimated Time</span>
                <span className="font-bold">~12 mins</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cost (Est.)</span>
                <span className="font-bold">₹62.00</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Personalization Preview</p>
                <div className={cn(
                  "p-3 rounded-xl text-xs italic",
                  isDarkMode ? "bg-white/5 text-slate-400" : "bg-slate-50 text-slate-500"
                )}>
                  "Hello John Doe, your class for Batch A starts at 10:00 AM..."
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8 italic">
              Select a batch to see details
            </p>
          )}
        </div>

        <div className={cn(
          "p-6 rounded-3xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
          isDarkMode ? "border-emerald-500/20" : "border-emerald-200"
        )}>
          <h4 className="font-bold mb-2 flex items-center gap-2 text-emerald-500">
            <Sparkles size={18} />
            AI Smart Tips
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Personalized messages have a 40% higher engagement rate. Use variables like {"{{name}}"} to make your messages feel more human.
          </p>
        </div>
      </div>
    </div>
  );
}
