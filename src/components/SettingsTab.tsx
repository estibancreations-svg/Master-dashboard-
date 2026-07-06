import React, { useState } from 'react';
import { Sliders, Shield, RefreshCw, Key, Globe, Trash2, Code, LogIn } from 'lucide-react';

export default function SettingsTab() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [customDomain, setCustomDomain] = useState('agency.estibancreations.com');
  const [selectedRole, setSelectedRole] = useState<'Administrator' | 'Manager' | 'Operator'>('Administrator');
  const [isRotating, setIsRotating] = useState(false);
  const [ghostLoginActive, setGhostLoginActive] = useState(false);

  const handleRotateKeys = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
      alert("Encryption Keys Rotated. Regenerated 256-bit AES cluster tokens.");
    }, 1500);
  };

  const handleGdprWipe = () => {
    const confirmation = window.confirm("⚠️ WARNING: This operation is IRREVERSIBLE. Are you sure you want to trigger a full GDPR compliance data wipe? This will purge your profile, Stripe linkages, and 150+ multi-agent swarm configurations.");
    if (confirmation) {
      alert("Wipe initiated. Standard GDPR cluster clean routines queued.");
    }
  };

  const handleGhostLogin = () => {
    setGhostLoginActive(!ghostLoginActive);
    alert(ghostLoginActive ? "Deactivated Ghost Login mode." : "Ghost Login mode active. Your session footprint is now completely obscured using private proxies.");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="settings-tab">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            Global Settings & Security Configuration
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">2FA compliance safeguards, Key rotations, GDPR compliance wipes, and Ghost Logins</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Security and RBAC controls */}
        <div className="lg:col-span-1 space-y-6 font-sans">
          
          {/* Two factor toggle */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-3xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-850">Security Safeguards</h4>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Enforce Multi-Factor 2FA</span>
              <button 
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:outline-none cursor-pointer ${
                  twoFactorEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${twoFactorEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            
            <p className="text-[10px] text-slate-500 leading-normal">Require secure authenticators to audit pipeline node changes.</p>
          </div>

          {/* Role-Based Access Control */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Role-Based Access Control (RBAC)</h4>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans"
            >
              <option value="Administrator">Administrator (All Permissions)</option>
              <option value="Manager">Manager (Edit and Dispatch)</option>
              <option value="Operator">Operator (Read-Only)</option>
            </select>
          </div>

        </div>

        {/* Custom Domains and API Key rotation */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Domain Setup */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3 font-sans">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Custom Domain Mapping</h4>
            </div>

            <input 
              type="text" 
              value={customDomain} 
              onChange={(e) => setCustomDomain(e.target.value)} 
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-mono"
            />
            <p className="text-[10px] text-slate-500 font-medium">Map custom domains to white-label AgencyFlow workspaces.</p>
          </div>

          {/* Key rotation */}
          <div className="bg-slate-50 border border-slate-250 p-4 rounded-xl space-y-3 font-sans shadow-3xs">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Encryption Key Rotation</h4>
            </div>

            <button 
              onClick={handleRotateKeys}
              disabled={isRotating}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isRotating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Rotate AES-256 Keys'}
            </button>
          </div>

        </div>

        {/* GDPR Compliant Data Wipe and Ghost login options */}
        <div className="lg:col-span-1 space-y-6 font-sans">
          
          {/* Ghost Login */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-cyan-600" />
              <h4 className="text-xs font-bold text-slate-800">Ghost Login Simulator</h4>
            </div>
            
            <p className="text-[10px] text-slate-650 leading-relaxed">
              Obscure and hide connection trails during operations so your CRM footprints remain anonymous.
            </p>

            <button 
              onClick={handleGhostLogin}
              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                ghostLoginActive 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-750'
              }`}
            >
              {ghostLoginActive ? 'Deactivate Ghost Login' : 'Activate Ghost Login'}
            </button>
          </div>

          {/* GDPR Wipe */}
          <div className="border border-red-200 bg-red-50/20 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> GDPR Data Erasure
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Purges all persistent database structures from Firestore. This action cannot be undone.
            </p>
            <button 
              onClick={handleGdprWipe}
              className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer text-center"
            >
              Wipe Core Databases
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
