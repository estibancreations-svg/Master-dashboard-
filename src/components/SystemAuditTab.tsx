import React, { useState } from 'react';
import { Activity, Bell, ShieldAlert, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

interface AuditLog {
  timestamp: string;
  source: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
}

export default function SystemAuditTab() {
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [darkLogsMode, setDarkLogsMode] = useState(true);
  const [smsAlertNumber, setSmsAlertNumber] = useState('+1 (555) 019-2831');
  const [isTestingSms, setIsTestingSms] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { timestamp: '16:58:12', source: 'n8n Webhook Outbound', action: 'Payload handshakes verification success', status: 'SUCCESS' },
    { timestamp: '16:58:05', source: 'Stripe webhook', action: 'MRR subscription update processed for John Miller', status: 'SUCCESS' },
    { timestamp: '16:57:42', source: 'Supervisor Swarm', action: 'Cognitive routing threshold reached 88%', status: 'WARNING' },
    { timestamp: '16:56:10', source: 'ElevenLabs Sync', action: 'API budget usage exceeded 90% quota capacity', status: 'ERROR' }
  ]);

  const handleTriggerKillSwitch = () => {
    const nextState = !killSwitchActive;
    setKillSwitchActive(nextState);
    alert(nextState 
      ? "🔴 EMERGENCY GLOBAL KILL SWITCH ENGAGED. Disabling all autonomous ReAct loops, n8n webhook dispatches, and Stripe discount engines." 
      : "🟢 System restored to optimal, safe standing state."
    );
  };

  const handleTestSmsAlert = () => {
    setIsTestingSms(true);
    setTimeout(() => {
      setIsTestingSms(false);
      alert(`Sent test notification message to ${smsAlertNumber}: "[CRITICAL ALERT] EstibanCreations API capacity reached 95%. Safeguard routines initiated."`);
    }, 1200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="system-audit-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            System Audit & Global Safeguard Console
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">SMS Quota capacity alerts, telemetry node graphs, and emergency safeguards</p>
        </div>

        {/* Kill Switch */}
        <button 
          onClick={handleTriggerKillSwitch}
          className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer font-sans ${
            killSwitchActive 
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {killSwitchActive ? 'Disengage Kill Switch' : 'Trigger Global Kill Switch'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SMS Alert and visual node-graph */}
        <div className="lg:col-span-1 space-y-6 font-sans">
          
          {/* SMS Quota Setup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">SMS Alerts for 95% Quota</h4>
            </div>
            <p className="text-[11px] text-slate-650 leading-relaxed">
              Define target cellular numbers to receive automated notification alerts when global API consumption depletions cross 95% threshold gates.
            </p>

            <div className="space-y-2">
              <input 
                type="text" 
                value={smsAlertNumber} 
                onChange={(e) => setSmsAlertNumber(e.target.value)} 
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="Alert phone number..."
              />
              <button 
                onClick={handleTestSmsAlert}
                disabled={isTestingSms}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isTestingSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Send Test SMS'}
              </button>
            </div>
          </div>

          {/* API Communications Node-Graph mockup */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">API Communications Node-Graph</h4>
            <div className="flex flex-col gap-2 font-mono text-[9px] font-bold text-slate-650 bg-white p-3 rounded-lg border">
              <div className="flex justify-between">
                <span>[Client]</span>
                <span className="text-indigo-600">-- HTTPS --&gt;</span>
                <span>[Express backend]</span>
              </div>
              <div className="flex justify-between">
                <span>[Express]</span>
                <span className="text-indigo-600">-- GRPC --&gt;</span>
                <span>[Firestore Cluster]</span>
              </div>
              <div className="flex justify-between">
                <span>[Express]</span>
                <span className="text-cyan-600">-- Webhook --&gt;</span>
                <span>[n8n instances]</span>
              </div>
            </div>
          </div>

        </div>

        {/* Audit Logs Viewer with Dark/Light Toggle */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active System Logs Registry</h3>
            <button 
              onClick={() => setDarkLogsMode(!darkLogsMode)}
              className="text-4xs font-mono font-bold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2 py-1 rounded"
            >
              Toggle Logs Color Mode ({darkLogsMode ? 'LIGHT' : 'DARK'})
            </button>
          </div>

          <div className={`p-4 rounded-xl font-mono text-[10px] space-y-2 h-[300px] overflow-y-auto border ${
            darkLogsMode ? 'bg-slate-950 text-emerald-400 border-slate-800' : 'bg-slate-50 text-slate-800 border-slate-200'
          }`}>
            {auditLogs.map((log, idx) => {
              const statusColors = {
                SUCCESS: 'text-emerald-500',
                WARNING: 'text-amber-500',
                ERROR: 'text-red-500'
              };
              return (
                <div key={idx} className="leading-relaxed border-b border-dashed border-slate-800/20 pb-1 flex flex-col sm:flex-row justify-between gap-1">
                  <div>
                    <span className="text-slate-500">[{log.timestamp}]</span> <span className="font-bold">[{log.source}]</span> {log.action}
                  </div>
                  <span className={`font-black uppercase sm:pl-2 shrink-0 ${statusColors[log.status]}`}>{log.status}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
