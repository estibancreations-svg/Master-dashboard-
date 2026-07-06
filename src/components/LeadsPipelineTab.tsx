import React, { useState } from 'react';
import { Users, Search, Plus, Filter, Kanban, MessageSquare, TrendingUp, Sparkles, Send, RefreshCw } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  role: string;
  temperature: number; // calculated lead temperature
  opens: number;
  clicks: number;
  stage: 'captured' | 'nurtured' | 'contacted' | 'proposal' | 'won';
}

export default function LeadsPipelineTab() {
  const [leads, setLeads] = useState<Lead[]>([
    { id: 'le-1', name: 'John Miller', company: 'Apex Ventures', role: 'Managing Partner', temperature: 84, opens: 4, clicks: 2, stage: 'proposal' },
    { id: 'le-2', name: 'Sarah Jenkins', company: 'Hyperion Corp', role: 'Director of Growth', temperature: 45, opens: 1, clicks: 0, stage: 'captured' },
    { id: 'le-3', name: 'David Cho', company: 'Nova Labs', role: 'VP Operations', temperature: 92, opens: 7, clicks: 5, stage: 'nurtured' },
    { id: 'le-4', name: 'Emma Watson', company: 'Vanguard Media', role: 'Marketing Lead', status: 'active', temperature: 68, opens: 3, clicks: 1, stage: 'contacted' },
    { id: 'le-5', name: 'Sanjay Gupta', company: 'Matrix Global', role: 'CTO', temperature: 95, opens: 8, clicks: 6, stage: 'won' }
  ]);

  const [scraperInput, setScraperInput] = useState('AI Marketing Agencies');
  const [isScraping, setIsScraping] = useState(false);
  const [smsText, setSmsText] = useState('Hi! Let us connect to discuss your n8n workflows.');
  const [campaignStep, setCampaignStep] = useState(1);

  const calculateTemp = (opens: number, clicks: number) => {
    // Lead temperature calculation formula: (opens * 10) + (clicks * 15) bounded to max 100
    return Math.min((opens * 10) + (clicks * 15), 100);
  };

  const handleLinkedInScraping = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    setTimeout(() => {
      const newLeads: Lead[] = [
        { id: `le-${Date.now()}`, name: 'Alice Walker', company: 'Visionary Agency', role: 'CEO', temperature: calculateTemp(1, 1), opens: 1, clicks: 1, stage: 'captured' },
        { id: `le-${Date.now() + 1}`, name: 'Michael Jordan', company: 'Flight Marketing', role: 'Founder', temperature: calculateTemp(0, 0), opens: 0, clicks: 0, stage: 'captured' }
      ];
      setLeads(prev => [...prev, ...newLeads]);
      setIsScraping(false);
      alert("LinkedIn scraping complete. Appended 2 qualified leads into Kanban.");
    }, 2000);
  };

  const updateLeadStage = (id: string, newStage: 'captured' | 'nurtured' | 'contacted' | 'proposal' | 'won') => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
  };

  const handleTwilioSms = (leadName: string) => {
    alert(`Dispatching automated Twilio SMS outreach package to ${leadName}: "${smsText}"`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6 animate-fade-in" id="leads-pipeline">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-indigo-600" />
            AABOS Smart Leads Pipeline & LinkedIn Scraper
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Real-time Lead Temperature Algorithm & Twilio SMS Automation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scraper & Drip Campaign Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* LinkedIn Profile Scraper */}
          <div className="bg-slate-50 border border-slate-250 p-4 rounded-xl space-y-3 font-sans">
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              LinkedIn scraper proxy (Apify Integration)
            </h3>
            
            <form onSubmit={handleLinkedInScraping} className="space-y-3">
              <input 
                type="text" 
                value={scraperInput} 
                onChange={(e) => setScraperInput(e.target.value)} 
                placeholder="Target industry or keyword..."
                className="w-full pl-3 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
              />
              <button 
                type="submit" 
                disabled={isScraping}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isScraping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Scrape LinkedIn Leads'}
              </button>
            </form>
          </div>

          {/* Drip Campaign Builder */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3.5 bg-slate-50">
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Drip Campaign Builder</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Active Campaign Steps</span>
                <span className="font-mono text-indigo-600">Step {campaignStep} of 3</span>
              </div>
              
              <div className="space-y-1.5 text-4xs font-mono">
                <div 
                  onClick={() => setCampaignStep(1)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${campaignStep === 1 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-150'}`}
                >
                  ✉ Step 1: Initial Cold Pitch Outreach Email
                </div>
                <div 
                  onClick={() => setCampaignStep(2)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${campaignStep === 2 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-150'}`}
                >
                  🕒 Step 2: Followup sequence if unopened (48 hours later)
                </div>
                <div 
                  onClick={() => setCampaignStep(3)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${campaignStep === 3 ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-150'}`}
                >
                  📱 Step 3: SMS Followup (via Twilio Webhook)
                </div>
              </div>
            </div>
          </div>

          {/* Twilio Outbound Dispatch */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Twilio SMS Panel</h3>
            <textarea 
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className="w-full p-2.5 text-3xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              rows={2}
            />
            <p className="text-[10px] text-slate-500 font-medium">Configure SMS text parameter template before sending.</p>
          </div>

        </div>

        {/* Trello-Style Kanban Column */}
        <div className="lg:col-span-2 space-y-4 overflow-hidden">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Sales Pipeline Kanban View</h3>
          
          <div className="flex flex-col sm:flex-row gap-3.5 overflow-x-auto pb-4" id="kanban-scroll-container">
            
            {/* Stages Columns list */}
            {(['captured', 'nurtured', 'contacted', 'proposal', 'won'] as const).map(stage => (
              <div key={stage} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-col gap-2 min-h-[350px] min-w-[180px] flex-1">
                <h4 className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider border-b border-slate-200 pb-1 flex justify-between">
                  <span>{stage}</span>
                  <span className="text-indigo-600">({leads.filter(l => l.stage === stage).length})</span>
                </h4>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {leads.filter(l => l.stage === stage).map(lead => (
                    <div key={lead.id} className="bg-white border border-slate-150 p-2.5 rounded-lg shadow-3xs space-y-2">
                      <div>
                        <p className="text-2xs font-bold text-slate-800 leading-tight">{lead.name}</p>
                        <p className="text-[9px] text-slate-400 font-mono truncate">{lead.company} ({lead.role})</p>
                      </div>

                      {/* Lead Temperature indicator badge */}
                      <div className="flex justify-between items-center text-4xs font-mono font-bold">
                        <span>Score:</span>
                        <span className={`px-1 rounded-sm uppercase ${
                          lead.temperature >= 85 ? 'bg-red-50 text-red-700' : lead.temperature >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-cyan-50 text-cyan-700'
                        }`}>
                          🔥 {lead.temperature}°C
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                        <button 
                          onClick={() => handleTwilioSms(lead.name)}
                          className="p-1 bg-cyan-50 hover:bg-cyan-100 border border-cyan-150 text-cyan-600 rounded"
                          title="Trigger Twilio Outreach"
                        >
                          <Send className="w-2.5 h-2.5" />
                        </button>
                        
                        <select 
                          value={lead.stage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                          className="text-[8px] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-1 py-0.5 font-mono font-bold text-slate-600 focus:outline-none"
                        >
                          <option value="captured">Capture</option>
                          <option value="nurtured">Nurture</option>
                          <option value="contacted">Contact</option>
                          <option value="proposal">Proposal</option>
                          <option value="won">Won</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>

    </div>
  );
}
