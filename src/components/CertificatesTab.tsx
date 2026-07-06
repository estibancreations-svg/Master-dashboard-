import React, { useState } from 'react';
import { Award, Share2, Download, ShieldCheck, RefreshCw } from 'lucide-react';

export default function CertificatesTab() {
  const [userName, setUserName] = useState('Estiban Creations Operator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expirationMonths, setExpirationMonths] = useState(12);

  const handleGeneratePdf = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Successfully compiled high-resolution vector PDF certificate for "${userName}". Downloading payload...`);
    }, 1800);
  };

  const handleLinkedInShare = () => {
    alert("Synthesizing credential badge. Directing to LinkedIn's Certifications hub with predefined credential arguments.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="certificates-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            LMS Credential Vault & Certifications Panel
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Dynamic high-resolution PDF certificates, 12-month expiration timers, and social credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Certificate preview template */}
        <div className="lg:col-span-2 border-2 border-indigo-100 rounded-2xl p-6 bg-indigo-50/15 flex flex-col justify-between text-center relative overflow-hidden h-[340px] font-sans">
          
          {/* Watermark decorations */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-indigo-200/40 opacity-30 flex items-center justify-center">
            <Award className="w-24 h-24 text-indigo-300" />
          </div>

          <div className="z-10 space-y-1">
            <p className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-widest">Verification Credential</p>
            <h3 className="text-md font-black text-slate-800 tracking-wide uppercase">Certificate of AI Mastery Mastery</h3>
          </div>

          <div className="z-10 py-6 space-y-1.5">
            <p className="text-[10px] text-slate-450 italic">This credential validates that</p>
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              className="text-center font-black text-slate-850 text-sm focus:outline-none bg-transparent border-b border-dashed border-indigo-300/60 max-w-sm mx-auto font-sans"
              title="Click to customize holder name"
            />
            <p className="text-[11px] text-slate-650 max-w-md mx-auto leading-relaxed mt-1">
              has demonstrated expert competence in designing Multi-Agent Cognitive Swarms using Tree-of-Thoughts prompting, n8n webhook pipelines, and Stripe monetization webhooks.
            </p>
          </div>

          <div className="z-10 pt-4 border-t border-indigo-100/60 flex justify-between items-center text-[9px] font-mono text-slate-400">
            <div>
              <p className="font-bold text-slate-650">COGNITIVE SYSTEMS ACADEMY</p>
              <p>Under Ben Angel Direction</p>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-indigo-600 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" /> SECURE_ID_HASH_GATE
              </p>
              <p>Expires: {expirationMonths} months</p>
            </div>
          </div>

        </div>

        {/* Certificate controls & Expirations */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Expiration timer */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-sans shadow-3xs">
            <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Expiration & Compliance</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Define the compliance expiration window for auditing safety protocols. Re-verification pop quizzes are required when tokens expire.
            </p>

            <div className="space-y-1">
              <label className="text-[9px] font-mono font-bold text-slate-450">EXPIRATION MONTHS (1-24):</label>
              <input 
                type="number" 
                min="1" 
                max="24" 
                value={expirationMonths} 
                onChange={(e) => setExpirationMonths(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* PDF exporter and LinkedIn share */}
          <div className="bg-slate-50 border border-slate-250 p-4 rounded-xl space-y-3 font-sans">
            <button 
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-4 h-4" />}
              Generate High-Res PDF
            </button>

            <button 
              onClick={handleLinkedInShare}
              className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-750 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 font-sans"
            >
              <Share2 className="w-4 h-4" /> Share on LinkedIn
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
