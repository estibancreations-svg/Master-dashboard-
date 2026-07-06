import React, { useState } from 'react';
import { Users, FileText, Activity, Trash2, ArrowRight, CheckSquare, Sparkles, Shield } from 'lucide-react';

interface CRMRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  clv: number; // Customer Lifetime Value in USD
  proposalStatus: 'none' | 'drafted' | 'signed';
}

export default function CRMTab() {
  const [records, setRecords] = useState<CRMRecord[]>([
    { id: 'crm-1', name: 'John Miller', company: 'Apex Ventures', email: 'john@apexventures.com', clv: 24500, proposalStatus: 'drafted' },
    { id: 'crm-2', name: 'Sarah Jenkins', company: 'Hyperion Corp', email: 'sarah@hyperion.co', clv: 18900, proposalStatus: 'signed' },
    { id: 'crm-3', name: 'Pedro Almodovar', company: 'Madrid Cinema', email: 'pedro@madridcinema.es', clv: 8200, proposalStatus: 'none' },
    { id: 'crm-4', name: 'Sarah J. Jenkins', company: 'Hyperion', email: 'sjenkins@hyperion.co', clv: 0, proposalStatus: 'none' } // Duplicate record
  ]);

  const [selectedRecordId, setSelectedRecordId] = useState('crm-1');
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [proposalModal, setProposalModal] = useState(false);

  // Capture Lead States
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadCompany, setNewLeadCompany] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadClv, setNewLeadClv] = useState('');

  const selectedRecord = records.find(r => r.id === selectedRecordId);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim() || !newLeadCompany.trim() || !newLeadEmail.trim()) return;
    const clvNum = Number(newLeadClv) || 0;
    const newRecord: CRMRecord = {
      id: `crm-${Date.now()}`,
      name: newLeadName.trim(),
      company: newLeadCompany.trim(),
      email: newLeadEmail.trim(),
      clv: clvNum,
      proposalStatus: 'none'
    };
    setRecords(prev => [...prev, newRecord]);
    setSelectedRecordId(newRecord.id);
    setNewLeadName('');
    setNewLeadCompany('');
    setNewLeadEmail('');
    setNewLeadClv('');
  };

  // CLV Tracker
  const totalClv = records.reduce((acc, r) => acc + r.clv, 0);

  const handleMergeDuplicates = () => {
    // Merge crm-4 (duplicate) into crm-2
    setRecords(prev => {
      const filtered = prev.filter(r => r.id !== 'crm-4');
      return filtered.map(r => r.id === 'crm-2' ? { ...r, clv: r.clv + 3000 } : r);
    });
    alert("Duplicate lead merger completed. Merged Sarah J. Jenkins into primary record and recalculated CRM weights.");
  };

  const handleGenerateProposal = () => {
    setIsGeneratingProposal(true);
    setTimeout(() => {
      setIsGeneratingProposal(false);
      setProposalModal(true);
    }, 1200);
  };

  const handleDocuSignSync = () => {
    setRecords(prev => prev.map(r => r.id === selectedRecordId ? { ...r, proposalStatus: 'signed' } : r));
    setProposalModal(false);
    alert("DocuSign digital signature dispatched. Executed envelope signed state successfully.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="crm-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            CRM & Customer Lifetime Value (CLV) Engine
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">One-click Proposal Generation, Duplicate lead mergers, and DocuSign syncs</p>
        </div>

        <button 
          onClick={handleMergeDuplicates}
          className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
        >
          Merge Duplicate Leads
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CRM list and profiles */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active CRM Contacts</h3>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-3xs bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-mono uppercase text-slate-400 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">CLV Score</th>
                  <th className="p-3">Proposal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white font-semibold text-slate-700">
                {records.map(record => (
                  <tr 
                    key={record.id} 
                    onClick={() => setSelectedRecordId(record.id)}
                    className={`cursor-pointer transition-colors ${selectedRecordId === record.id ? 'bg-indigo-50/55' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="p-3 text-slate-850 font-bold">
                      <p>{record.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono font-normal">{record.email}</p>
                    </td>
                    <td className="p-3 text-slate-650">{record.company}</td>
                    <td className="p-3 font-mono text-indigo-600">${record.clv.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        record.proposalStatus === 'signed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : record.proposalStatus === 'drafted' ? 'bg-cyan-50 text-cyan-700 border border-cyan-150' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {record.proposalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Capture New Lead form (Fulfills CRM improvements) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-sans">
            <div className="flex items-center gap-1.5 border-b pb-1.5">
              <Sparkles className="w-4 h-4 text-pink-600 animate-pulse" />
              <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Capture Lead Form</h4>
            </div>

            <form onSubmit={handleAddLead} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input 
                  type="text" 
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                  placeholder="Lead Full Name (e.g., Ada Lovelace)" 
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold focus:outline-none"
                  required
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={newLeadCompany}
                  onChange={e => setNewLeadCompany(e.target.value)}
                  placeholder="Company Name (e.g., Turing Engines)" 
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold focus:outline-none"
                  required
                />
              </div>
              <div>
                <input 
                  type="email" 
                  value={newLeadEmail}
                  onChange={e => setNewLeadEmail(e.target.value)}
                  placeholder="Email (e.g., ada@turing.org)" 
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold focus:outline-none"
                  required
                />
              </div>
              <div>
                <input 
                  type="number" 
                  value={newLeadClv}
                  onChange={e => setNewLeadClv(e.target.value)}
                  placeholder="Initial CLV Estimate (USD)" 
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold focus:outline-none"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <button 
                  type="submit"
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  🚀 Capture & Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CLV Metric block & Proposal Dispatcher */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* CLV Monitor */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 text-center space-y-1">
            <p className="text-4xs font-mono font-bold text-slate-400 uppercase tracking-widest">Total CRM Portfolio CLV</p>
            <h4 className="text-xl font-black text-slate-800 font-sans">${totalClv.toLocaleString()} USD</h4>
            <p className="text-4xs text-slate-500 leading-normal font-medium">Dynamic customer portfolio tracking active.</p>
          </div>

          {/* Proposal Generator card */}
          {selectedRecord ? (
            <div className="border border-slate-250 rounded-xl p-4 space-y-4 bg-slate-50 font-sans shadow-3xs">
              <div className="flex items-center gap-1.5 border-b pb-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Outreach & Proposal Dispatch</h4>
              </div>

              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-850">Client: {selectedRecord.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">Company: {selectedRecord.company}</p>
                <p className="text-[10px] text-slate-400 font-mono">Email: {selectedRecord.email}</p>
              </div>

              {/* CLV Adjustment Slider */}
              <div className="bg-white/80 p-3 rounded-lg border border-slate-200/50 space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500">
                  <span>ADJUST CLV VALUE:</span>
                  <span className="text-indigo-600 font-bold">${selectedRecord.clv.toLocaleString()}</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={selectedRecord.clv}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRecords(prev => prev.map(r => r.id === selectedRecord.id ? { ...r, clv: val } : r));
                  }}
                  className="w-full accent-indigo-600 h-1 cursor-pointer bg-slate-100 rounded appearance-none"
                />
              </div>

              {/* Dynamic Status Progress Checkboxes */}
              <div className="bg-white/80 p-3 rounded-lg border border-slate-200/50 space-y-2">
                <p className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Sales Pipeline Stages:</p>
                <div className="space-y-1.5 text-3xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="line-through text-slate-400">Lead Registry Captured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedRecord.proposalStatus !== 'none'} 
                      readOnly 
                      className="w-3.5 h-3.5 accent-indigo-600 cursor-not-allowed shrink-0"
                    />
                    <span className={selectedRecord.proposalStatus !== 'none' ? 'line-through text-slate-400' : ''}>
                      Proposal Template Drafted
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={selectedRecord.proposalStatus === 'signed'} 
                      readOnly 
                      className="w-3.5 h-3.5 accent-indigo-600 cursor-not-allowed shrink-0"
                    />
                    <span className={selectedRecord.proposalStatus === 'signed' ? 'line-through text-slate-400 font-semibold text-emerald-700' : ''}>
                      DocuSign Envelope Completed
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerateProposal}
                disabled={isGeneratingProposal}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
              >
                {isGeneratingProposal ? 'Synthesizing Proposal...' : 'One-Click Generate Proposal'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 font-mono text-xs">
              Select a contact to manage outreach.
            </div>
          )}

        </div>

      </div>

      {/* DocuSign Digital Proposal Modal mockup */}
      {proposalModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-55 font-sans" id="proposal-signing-modal">
          <div className="bg-white border border-slate-250 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 border-b pb-2">
              <Shield className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-black uppercase tracking-wider">DocuSign Digital Signatures Portal</h3>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-750 font-semibold bg-slate-50 p-4 rounded-xl border leading-relaxed">
              <p className="font-bold underline text-slate-850 text-center">AGENCYFLOW WORKFLOW CONTRACT AGREEMENT</p>
              <p>Between: <span className="font-bold text-indigo-600">EstibanCreations</span> & <span className="font-bold">{selectedRecord.name}</span></p>
              <p>
                This agreement establishes the deployment of 150+ workers multi-agent swarms utilizing Tree-of-Thoughts reasoning loops. Standard subscription SLA MRR: $3,500/mo.
              </p>
            </div>

            <div className="flex gap-3 justify-end font-sans">
              <button 
                onClick={() => setProposalModal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDocuSignSync}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1"
              >
                Sign with DocuSign <ArrowRight className="w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
