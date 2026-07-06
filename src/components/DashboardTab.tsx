import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Bell, CheckCircle, RefreshCw, Sparkles, Plus, Trash2, ShieldCheck, Send } from 'lucide-react';

interface DashboardTabProps {
  projectsCount: number;
  attachmentsCount: number;
}

interface QuickNote {
  id: string;
  text: string;
  category: 'critical' | 'marketing' | 'tech';
}

export default function DashboardTab({ projectsCount, attachmentsCount }: DashboardTabProps) {
  const [quotaUsed, setQuotaUsed] = useState(75); // percentage
  const [briefingText, setBriefingText] = useState(
    "Good morning. EstibanCreations system performance is at 98.4%. Leads intake has increased by 14% overnight. Action items: Review the High-Priority Stripe Dispute for $2,450 immediately, and verify n8n pipeline webhooks are online."
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic Post-It lists state with initial load
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>(() => {
    try {
      const saved = localStorage.getItem('estiban_quick_notes');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', text: 'Confirm n8n webhook routing rules with team', category: 'critical' },
      { id: '2', text: 'Clean older Google Drive cache dumps', category: 'tech' },
      { id: '3', text: 'Configure custom prompt vectors for Captionist agent', category: 'marketing' }
    ];
  });
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'critical' | 'marketing' | 'tech'>('tech');

  // Stripe dispute resolution simulation
  const [disputeStatus, setDisputeStatus] = useState<'active' | 'generating' | 'submitted'>('active');
  const [disputeEvidenceText, setDisputeEvidenceText] = useState('Workspace console log attachments and n8n webhook receipts demonstrate service delivery was fully executed to customer domain.');
  const [evidenceCategory, setEvidenceCategory] = useState<'digital_receipts' | 'system_logs' | 'workspace_contracts'>('digital_receipts');

  useEffect(() => {
    try {
      localStorage.setItem('estiban_quick_notes', JSON.stringify(quickNotes));
    } catch (e) {}
  }, [quickNotes]);

  const handleRefreshBriefing = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setBriefingText(
        "Briefing updated at " + new Date().toLocaleTimeString() + ": Auto-scaling triggered 2 additional worker agents in Agent Hub. LinkedIn leads scraper finished with 45 new prospects. Social sentiment score is 92% positive."
      );
      setIsRefreshing(false);
    }, 800);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote: QuickNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      category: newNoteCategory
    };
    setQuickNotes([...quickNotes, newNote]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    setQuickNotes(quickNotes.filter(n => n.id !== id));
  };

  const handleDispatchEvidence = () => {
    setDisputeStatus('generating');
    setTimeout(() => {
      setDisputeStatus('submitted');
    }, 2000);
  };

  // Radial gauge calculations
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (quotaUsed / 100) * circumference;

  return (
    <div 
      className="relative min-h-[500px] w-full rounded-2xl shadow-xl border border-amber-200/60 p-8 overflow-hidden select-text"
      style={{
        backgroundColor: '#FDF1AA',
        backgroundImage: 'linear-gradient(#87CEEB 1px, transparent 1px)',
        backgroundSize: '100% 2rem',
        paddingLeft: '60px',
        lineHeight: '2rem',
        fontFamily: 'Comic Sans MS, Marker Felt, Chalkboard SE, sans-serif'
      }}
      id="strategic-notepad"
    >
      {/* Red vertical margin line */}
      <div 
        className="absolute top-0 bottom-0 left-[40px] w-[2px] bg-red-400" 
        style={{ backgroundColor: '#FF7F7F' }}
      />

      {/* Notepad Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 border-b border-red-200/50 pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-wide flex items-center gap-2">
            📝 STRATEGIC NOTEPAD — DAILY COMMANDS
          </h2>
          <p className="text-xs text-slate-650 italic font-medium">
            AgencyFlow Central Command & Executive Oversight (v4)
          </p>
        </div>
        <div className="text-right text-xs text-slate-600 font-bold bg-white/40 px-3 py-1 rounded-lg border border-yellow-300">
          DATE: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Notepad Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        
        {/* Left Column: Automated CEO Briefings & Quick Notes */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" /> 
                Automated CEO Briefing
              </h3>
              <button 
                onClick={handleRefreshBriefing}
                disabled={isRefreshing}
                className="p-1 text-slate-650 hover:text-indigo-600 transition-colors bg-white/50 rounded hover:bg-white border border-yellow-200/70 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="bg-white/60 backdrop-blur-xs border border-yellow-200 p-5 rounded-xl shadow-xs text-xs text-slate-800 leading-relaxed font-semibold">
              {briefingText}
            </div>

            <div className="space-y-1 pt-1">
              <p className="text-xs font-bold text-slate-800 underline">TODAY'S EXECUTIVE CHECKS:</p>
              <ul className="text-xs font-bold text-slate-700 space-y-1 list-disc pl-4 leading-normal">
                <li>Current active project workspace count: <span className="text-indigo-700 underline font-bold">{projectsCount}</span></li>
                <li>Connected files in Drive Vault: <span className="text-cyan-700 underline font-bold">{attachmentsCount}</span></li>
                <li>Agent swarm overall sentiment index: <span className="text-emerald-700 font-bold">94.2% (OPTIMAL)</span></li>
              </ul>
            </div>
          </div>

          {/* Quick Notes Manager Widget (Satisfies Note-making additions) */}
          <div className="bg-white/35 p-5 border border-yellow-300 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">📌 Interactive Post-It Reminders</h4>
            
            <form onSubmit={handleAddNote} className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <input 
                type="text" 
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Pin a quick command note..."
                className="flex-1 text-xs px-2.5 py-1 bg-white border border-yellow-300 rounded focus:outline-none focus:border-indigo-500 font-sans font-bold"
              />
              <select 
                value={newNoteCategory}
                onChange={e => setNewNoteCategory(e.target.value as any)}
                className="text-xs py-1 px-1 bg-white border border-yellow-300 rounded font-sans font-bold"
              >
                <option value="tech">⚙️ Tech</option>
                <option value="critical">🚨 Alert</option>
                <option value="marketing">📈 Promo</option>
              </select>
              <button 
                type="submit"
                className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {quickNotes.map(note => (
                <div 
                  key={note.id} 
                  className={`flex justify-between items-center p-2 rounded-lg text-3xs font-bold leading-normal border ${
                    note.category === 'critical' ? 'bg-red-100/70 border-red-200 text-red-950' :
                    note.category === 'marketing' ? 'bg-emerald-100/70 border-emerald-200 text-emerald-950' :
                    'bg-white/70 border-yellow-250 text-slate-800'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">
                    {note.category === 'critical' ? '🚨' : note.category === 'marketing' ? '📈' : '⚙️'} {note.text}
                  </span>
                  <button 
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Quota Monitor (With Slider) & Dispute resolver */}
        <div className="space-y-6">
          
          {/* Quota Monitor with interactive capacity slider */}
          <div className="bg-white/55 border border-yellow-200 rounded-xl p-5 shadow-xs flex flex-col items-center">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              ⚡ Global API Quota Monitor
            </h4>
            
            <div className="relative w-28 h-28 flex items-center justify-center mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className="text-yellow-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r={radius}
                  className={`${quotaUsed >= 90 ? 'text-red-500' : 'text-indigo-600'} transition-all duration-300`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-black text-slate-800">{quotaUsed}%</span>
                <p className="text-[8px] text-slate-500 font-bold uppercase leading-none">CAPACITY</p>
              </div>
            </div>

            {/* Capacity Control Slider */}
            <div className="w-full px-2 space-y-1">
              <div className="flex justify-between text-4xs font-mono font-bold text-slate-550 leading-none">
                <span>SIMULATE QUOTA:</span>
                <span>{quotaUsed}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={quotaUsed} 
                onChange={e => setQuotaUsed(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <p className="text-[10px] text-slate-650 font-bold mt-2 text-center leading-relaxed">
              API credits: {Math.round(600000 * (quotaUsed / 100)).toLocaleString()} used / 600,000 max.
              {quotaUsed >= 90 ? " ⚠️ Critical SMS alerting active!" : " ✓ Quota stable"}
            </p>
          </div>

          {/* Stripe Dispute Alerts with Dynamic counter evidence console */}
          <div className="bg-red-50/75 border border-red-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 animate-bounce" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                🚨 CRITICAL STRIPE DISPUTE ALERT
              </h4>
            </div>
            
            {disputeStatus === 'active' && (
              <div className="text-xs text-red-950 font-semibold leading-normal space-y-2">
                <div>
                  <p className="font-bold underline">Dispute Case: #DISP-98312</p>
                  <p>Amount: $2,450.00 USD | Reason: "Product not as described"</p>
                  <p className="text-[10px] text-red-800">
                    Deadline: <span className="font-bold">July 10, 2026</span>. Please build counter-evidence below:
                  </p>
                </div>

                <div className="p-3 bg-white/70 rounded-lg border border-red-150 space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Evidence Category:</span>
                    <select 
                      value={evidenceCategory}
                      onChange={e => setEvidenceCategory(e.target.value as any)}
                      className="text-[9px] bg-white border rounded font-bold font-sans"
                    >
                      <option value="digital_receipts">📄 Delivery Receipts</option>
                      <option value="system_logs">⚡ Workspace Ingest Logs</option>
                      <option value="workspace_contracts">📝 Signed Proposal Contracts</option>
                    </select>
                  </div>

                  <textarea 
                    value={disputeEvidenceText}
                    onChange={e => setDisputeEvidenceText(e.target.value)}
                    rows={2}
                    className="w-full text-[10px] p-2 bg-white rounded border border-red-100 font-sans focus:outline-none"
                    placeholder="Describe delivery proof..."
                  />

                  <button 
                    onClick={handleDispatchEvidence}
                    className="w-full py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-3xs uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3" /> Submit Counter-Evidence Packet
                  </button>
                </div>
              </div>
            )}

            {disputeStatus === 'generating' && (
              <div className="p-6 bg-white/80 rounded-lg border border-red-200 flex flex-col items-center justify-center text-center space-y-2.5">
                <RefreshCw className="w-6 h-6 text-red-600 animate-spin" />
                <p className="text-xs font-bold text-slate-800">Compiling Legal Manifest File...</p>
                <p className="text-[9px] text-slate-500 font-mono">Bundling Google Workspace logs & signed proposals into cryptographic ZIP payload...</p>
              </div>
            )}

            {disputeStatus === 'submitted' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DISPUTE SUBMITTED & RESOLVED</span>
                </div>
                <p className="text-[10px] text-slate-650 leading-relaxed font-semibold">
                  Evidence package successfully routed via secure Stripe API webhook under ID <span className="font-mono bg-white px-1 py-0.2 border rounded">ST-EVID-98312</span>. The dispute is currently under active review. No further action needed.
                </p>
                <button 
                  onClick={() => setDisputeStatus('active')}
                  className="text-4xs font-mono font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  ◀ Reset / Edit Dispute Evidences
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
