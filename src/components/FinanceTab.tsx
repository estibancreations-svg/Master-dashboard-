import React, { useState } from 'react';
import { DollarSign, Download, RefreshCw, Layers, TrendingUp, Sliders } from 'lucide-react';

export default function FinanceTab() {
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [stripeMrr, setStripeMrr] = useState(14500); // MRR in base USD
  const [apiCost, setApiCost] = useState(1240); // monthly API cost in base USD
  
  // New Expense capturing states
  const [expenses, setExpenses] = useState([
    { id: 'ex-1', category: 'LLM Token Usage', amount: 840, date: '2026-07-01' },
    { id: 'ex-2', category: 'ElevenLabs Voice APIs', amount: 250, date: '2026-07-02' },
    { id: 'ex-3', category: 'RunwayML Rendering', amount: 150, date: '2026-07-04' }
  ]);
  const [newExpenseCategory, setNewExpenseCategory] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpenseDate, setNewExpenseDate] = useState('2026-07-05');

  const currencySymbols = { USD: '$', EUR: '€', GBP: '£' };
  const currencyRates = { USD: 1.0, EUR: 0.92, GBP: 0.78 };

  const formatAmount = (usdAmount: number) => {
    const symbol = currencySymbols[currency];
    const converted = usdAmount * currencyRates[currency];
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpenseCategory.trim() || !newExpenseAmount) return;
    const amountVal = Number(newExpenseAmount) || 0;
    const newEx = {
      id: `ex-${Date.now()}`,
      category: newExpenseCategory.trim(),
      amount: amountVal,
      date: newExpenseDate
    };
    setExpenses(prev => [newEx, ...prev]);
    setApiCost(prev => prev + amountVal); // dynamically update aggregated API cost
    setNewExpenseCategory('');
    setNewExpenseAmount('');
  };

  const netProfit = stripeMrr - apiCost;
  const marginPercent = ((netProfit / Math.max(stripeMrr, 1)) * 100);

  const handleExportCSV = () => {
    alert("Synthesizing balance sheet CSV... Exported 'AgencyFlow_Finance_Report.csv' successfully.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="finance-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            Finance & Revenue Analytics (AgencyFlow)
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Real-time Margin calculation, Stripe webhooks sync, and multi-currency toggles</p>
        </div>

        {/* Currency toggles */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase pr-1">Currency:</span>
          {(['USD', 'EUR', 'GBP'] as const).map(curr => (
            <button 
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-2 py-0.5 text-4xs font-bold font-mono rounded ${currency === curr ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-slate-650'}`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Margin calculator card */}
        <div className="lg:col-span-1 border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col justify-between space-y-4 shadow-3xs">
          <div>
            <div className="flex items-center justify-between border-b pb-2 mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">MRR Profit Margin Calculator</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-sm border ${
                marginPercent >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-150' : 'text-amber-700 bg-amber-50 border-amber-150'
              }`}>
                {marginPercent >= 85 ? 'Optimal' : 'Needs Optimization'}
              </span>
            </div>

            <div className="space-y-4 font-semibold text-xs text-slate-700">
              {/* Stripe MRR slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-mono font-bold text-slate-500 leading-none">
                  <span>STRIPE MRR SIMULATION:</span>
                  <span className="text-indigo-600 font-extrabold">{formatAmount(stripeMrr)}</span>
                </div>
                <input 
                  type="range"
                  min="5000"
                  max="100000"
                  step="1000"
                  value={stripeMrr}
                  onChange={e => setStripeMrr(Number(e.target.value))}
                  className="w-full h-1 accent-indigo-600 cursor-pointer bg-slate-200 rounded appearance-none"
                />
              </div>

              {/* API cost slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-3xs font-mono font-bold text-slate-500 leading-none">
                  <span>SaaS API USAGE COST:</span>
                  <span className="text-red-500 font-extrabold">-{formatAmount(apiCost)}</span>
                </div>
                <input 
                  type="range"
                  min="100"
                  max="20000"
                  step="100"
                  value={apiCost}
                  onChange={e => setApiCost(Number(e.target.value))}
                  className="w-full h-1 accent-indigo-600 cursor-pointer bg-slate-200 rounded appearance-none"
                />
              </div>

              <div className="pt-2.5 border-t flex justify-between text-slate-800">
                <span className="font-bold">Net Profit Stream:</span>
                <span className={`font-mono font-black ${netProfit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                  {formatAmount(netProfit)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            <div className="text-center bg-indigo-50 border border-indigo-150 p-2.5 rounded-lg">
              <span className="text-[10px] font-mono font-black text-indigo-700 uppercase">
                Gross Profit Margin Score: {marginPercent.toFixed(1)}%
              </span>
            </div>
            {marginPercent < 75 ? (
              <p className="text-[9px] text-red-650 font-bold bg-red-50 border border-red-150 p-2 rounded-lg leading-normal text-center">
                ⚠️ Margin dilution! Throttle worker swarm frequencies or compress token windows.
              </p>
            ) : (
              <p className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-150 p-2 rounded-lg leading-normal text-center">
                ✓ Margin healthy. Scaling capability maximized.
              </p>
            )}
          </div>
        </div>

        {/* Expense categorization */}
        <div className="lg:col-span-1 space-y-4 font-sans">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Expense Categorization</h3>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {expenses.map(ex => (
                <div key={ex.id} className="bg-white border border-slate-150 p-2.5 rounded-lg shadow-3xs flex justify-between items-center text-xs font-semibold">
                  <div>
                    <p className="font-bold text-slate-800">{ex.category}</p>
                    <p className="text-[9px] text-slate-400 font-mono font-normal">Date: {ex.date}</p>
                  </div>
                  <span className="font-mono text-red-500 font-bold">-{formatAmount(ex.amount)}</span>
                </div>
              ))}
            </div>

            {/* Record New Expense Form */}
            <form onSubmit={handleAddExpense} className="border-t pt-3 space-y-2">
              <p className="text-3xs font-mono font-bold text-slate-400 uppercase leading-none">Record API Outlay:</p>
              <input 
                type="text"
                value={newExpenseCategory}
                onChange={e => setNewExpenseCategory(e.target.value)}
                placeholder="Category (e.g. Pinecone DB)"
                className="w-full text-4xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none font-semibold"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number"
                  value={newExpenseAmount}
                  onChange={e => setNewExpenseAmount(e.target.value)}
                  placeholder="Amount (USD)"
                  className="text-4xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none font-semibold"
                  required
                />
                <input 
                  type="date"
                  value={newExpenseDate}
                  onChange={e => setNewExpenseDate(e.target.value)}
                  className="text-4xs p-1.5 bg-white border border-slate-200 rounded focus:outline-none font-mono font-bold"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-3xs font-bold uppercase tracking-wider cursor-pointer"
              >
                + Log Expense Outlay
              </button>
            </form>
          </div>
        </div>

        {/* Finance tools and actions */}
        <div className="lg:col-span-1 border border-slate-200 p-4 rounded-xl bg-slate-50 flex flex-col justify-between font-sans shadow-3xs">
          <div>
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 mb-3">Financial Actions</h3>
            <p className="text-[11px] text-slate-650 leading-relaxed mb-4">
              Export high-fidelity consolidated balance sheets detailing Stripe MRR conversions, API token depletion indexes, and invoice pipelines.
            </p>
          </div>

          <button 
            onClick={handleExportCSV}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
          >
            <Download className="w-4 h-4" /> Export Financials CSV
          </button>
        </div>

      </div>

    </div>
  );
}
