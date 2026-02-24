import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Zap, 
  Shield, 
  QrCode, 
  Copy, 
  CheckCircle2,
  ExternalLink,
  Calculator
} from 'lucide-react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Payments({ isDarkMode }: { isDarkMode: boolean }) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // AI Plan Generator State
  const [msgsPerDay, setMsgsPerDay] = useState(5000);
  const [costPerMsg, setCostPerMsg] = useState(0.05);

  const plans = [
    { 
      id: 'monthly', 
      name: 'Monthly Pro', 
      price: '₹1,799', 
      period: '/month',
      features: ['Unlimited Messages', 'AI Enhancer Pro', 'Excel Import', 'Priority Support'],
      popular: false
    },
    { 
      id: 'yearly', 
      name: 'Yearly Elite', 
      price: '₹11,999', 
      period: '/year',
      features: ['Everything in Pro', 'Custom AI Models', 'API Access', 'White-labeling'],
      popular: true
    },
    { 
      id: 'usage', 
      name: 'Usage Based', 
      price: 'Custom', 
      period: '',
      features: ['Pay as you go', 'Full AI Access', 'Scalable Throttling', 'Detailed Logs'],
      popular: false
    }
  ];

  const upiDetails = {
    number: '+91 9551522030',
    upiId: '9551522030-3@ibl',
    name: 'Trio Developers'
  };

  const calculateUsagePrice = () => {
    const daily = msgsPerDay * costPerMsg;
    return {
      daily: daily.toFixed(2),
      weekly: (daily * 7).toFixed(2),
      monthly: (daily * 30).toFixed(2),
      yearly: (daily * 365).toFixed(2)
    };
  };

  const usagePrices = calculateUsagePrice();

  const generateQR = async (plan: any) => {
    const amount = plan.price === 'Custom' ? usagePrices.monthly : plan.price.replace(/[^\d]/g, '');
    const upiUrl = `upi://pay?pa=${upiDetails.upiId}&pn=${upiDetails.name}&am=${amount}&cu=INR&tn=Payment for ${plan.name}`;
    
    try {
      const url = await QRCode.toDataURL(upiUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan.id);
    generateQR(plan);
  };

  const handleVerify = async () => {
    if (!transactionId) return;
    setIsVerifying(true);
    // Mock verification
    setTimeout(() => {
      setIsVerifying(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedPlan(null);
        setQrCodeUrl(null);
        setTransactionId('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="space-y-12">
      {/* AI Plan Generator */}
      <div className={cn(
        "p-8 rounded-3xl border relative overflow-hidden",
        isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
      )}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calculator size={120} />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Zap className="text-emerald-500" />
            AI Plan Generator
          </h3>
          <p className="text-slate-500 mb-8">Enter your requirements and we'll calculate the best price for you.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-400">Messages per Day</label>
                  <span className="text-emerald-500 font-bold">{msgsPerDay.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="50000" 
                  step="100"
                  value={msgsPerDay}
                  onChange={e => setMsgsPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-400">Cost per Message</label>
                  <span className="text-emerald-500 font-bold">₹{costPerMsg.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.50" 
                  step="0.01"
                  value={costPerMsg}
                  onChange={e => setCostPerMsg(parseFloat(e.target.value))}
                  className="w-full h-2 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Daily', price: usagePrices.daily },
                { label: 'Weekly', price: usagePrices.weekly },
                { label: 'Monthly', price: usagePrices.monthly },
                { label: 'Yearly', price: usagePrices.yearly },
              ].map((item, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl border text-center",
                  isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                )}>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-xl font-bold text-emerald-500">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={cn(
              "p-8 rounded-3xl border relative transition-all duration-300",
              plan.popular ? "ring-2 ring-emerald-500 scale-105 z-10" : "",
              isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200 shadow-sm"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            <div className="mb-8">
              <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-slate-500 text-sm">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <Check className="text-emerald-500" size={18} />
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => handleSelectPlan(plan)}
              className={cn(
                "w-full py-4 rounded-xl font-bold transition-all",
                plan.popular 
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20" 
                  : (isDarkMode ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200")
              )}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "w-full max-w-4xl p-8 rounded-[2.5rem] border shadow-2xl relative overflow-hidden",
                isDarkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-slate-200"
              )}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">Complete Payment</h3>
                    <p className="text-slate-500">Scan the QR code or use the UPI details below to pay.</p>
                  </div>

                  <div className="space-y-4">
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">UPI ID</p>
                        <p className="font-mono font-bold">{upiDetails.upiId}</p>
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(upiDetails.upiId)}
                        className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between",
                      isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                    )}>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">GPay / PhonePe</p>
                        <p className="font-mono font-bold">{upiDetails.number}</p>
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(upiDetails.number)}
                        className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500 transition-colors"
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-400">Enter Transaction ID (UTR)</label>
                    <input 
                      type="text"
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="Enter 12-digit UTR number"
                      className={cn(
                        "w-full px-4 py-4 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200"
                      )}
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying || !transactionId}
                      className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Payment'}
                      <Shield size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative p-8 bg-white rounded-[2rem] shadow-2xl">
                    {qrCodeUrl ? (
                      <div className="relative">
                        <img src={qrCodeUrl} alt="Payment QR" className="w-64 h-64" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-1">
                            <div className="w-full h-full bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                              TD
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-64 h-64 bg-slate-100 animate-pulse rounded-xl" />
                    )}
                    <div className="mt-4 text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">Trio Developers</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-500 flex items-center gap-2 justify-center">
                      <Shield size={16} className="text-emerald-500" />
                      Secure SSL Encrypted Payment
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full text-slate-500"
              >
                <X size={24} />
              </button>

              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-emerald-500 flex flex-col items-center justify-center text-white z-20"
                >
                  <CheckCircle2 size={120} className="mb-6" />
                  <h3 className="text-4xl font-bold mb-2">Payment Successful!</h3>
                  <p className="text-emerald-100">Your premium features are now active.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
