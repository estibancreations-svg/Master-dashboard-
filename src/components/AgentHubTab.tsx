import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, Pause, PlayCircle, RefreshCw, Terminal, TrendingUp, Sparkles, Sliders } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'paused';
  efficiency: number; // percentage
  roiMultiplier: number;
  thought: string;
}

export default function AgentHubTab() {
  const [memoryContext, setMemoryContext] = useState(85); // percentage
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'ag-1', name: 'Supervisor Agent', role: 'System Orchestrator', status: 'active', efficiency: 98, roiMultiplier: 4.8, thought: 'Orchestrating Kafka events. Resolving token routing optimizations.' },
    { id: 'ag-2', name: 'Scraper Agent', role: 'LinkedIn Scraper & Lead Intake', status: 'active', efficiency: 91, roiMultiplier: 3.5, thought: 'Processing LinkedIn query params. Found 45 prospective profiles.' },
    { id: 'ag-3', name: 'Reflexion Agent', role: 'Self-Correction & Quality Audit', status: 'active', efficiency: 95, roiMultiplier: 5.2, thought: 'Critiquing draft content. Found 2 repetitive word patterns.' },
    { id: 'ag-4', name: 'Captionist Agent', role: 'RunwayML Auto-Caption Generator', status: 'paused', efficiency: 87, roiMultiplier: 2.1, thought: 'Awaiting pipeline stimulus signal.' },
    { id: 'ag-5', name: 'ElevenLabs Voice Sync', role: 'Voice Synthesizer', status: 'active', efficiency: 94, roiMultiplier: 4.1, thought: 'Generating audio waveform streams at 44.1kHz sample rate.' }
  ]);

  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentRole, setNewAgentRole] = useState('');
  const [newAgentMultiplier, setNewAgentMultiplier] = useState(3.0);
  const [cliInput, setCliInput] = useState('');

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[2026-07-05 16:58:00] [SYSTEM] Initializing Supervisor-Worker Swarm Network.",
    "[2026-07-05 16:58:02] [SUPERVISOR] Loaded Tree-of-Thoughts reasoning schema.",
    "[2026-07-05 16:58:05] [REFLEXION] Audit gate passed. Error factor at 0.002%."
  ]);

  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Terminal log simulator
  useEffect(() => {
    const timer = setInterval(() => {
      const activeAgents = agents.filter(a => a.status === 'active');
      if (activeAgents.length > 0) {
        const randomAgent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
        const thoughts = [
          `Recalculating routing path for payload context.`,
          `Synchronizing episodic memories into vector embeddings database.`,
          `Running self-healing AST compiler pass on node inputs.`,
          `Fetching trending competitor metrics from Apify backend.`,
          `Optimizing prompt context. Token compression completed.`
        ];
        const log = `[${new Date().toLocaleTimeString()}] [${randomAgent.name.toUpperCase()}] ${thoughts[Math.floor(Math.random() * thoughts.length)]}`;
        setTerminalLogs(prev => [...prev.slice(-30), log]);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [agents]);

  // Scroll to bottom of terminal container only
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const toggleAgentStatus = (id: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'active' ? 'paused' : 'active';
        const nextThought = nextStatus === 'paused' ? 'Agent paused. Standing by.' : 'Awake. Resuming operational loop.';
        return { ...a, status: nextStatus, thought: nextThought };
      }
      return a;
    }));
  };

  const handleWakeAll = () => {
    setAgents(prev => prev.map(a => ({ ...a, status: 'active', thought: 'Awake. Resuming operational loop.' })));
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;
    const newAg: Agent = {
      id: `ag-${Date.now()}`,
      name: newAgentName.trim(),
      role: newAgentRole.trim(),
      status: 'active',
      efficiency: 90,
      roiMultiplier: Number(newAgentMultiplier) || 3.0,
      thought: 'Awake. Operational loop initiated.'
    };
    setAgents(prev => [...prev, newAg]);
    setTerminalLogs(prev => [...prev, `[SYSTEM] Successfully hired and deployed ${newAg.name} (${newAg.role}) into active Swarm registry.`]);
    setNewAgentName('');
    setNewAgentRole('');
  };

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    if (!cmd) return;
    setTerminalLogs(prev => [...prev, `> ${cliInput}`]);
    setCliInput('');

    if (cmd === '/clear') {
      setTerminalLogs([]);
    } else if (cmd === '/status') {
      const activeStr = agents.filter(a => a.status === 'active').map(a => a.name).join(', ') || 'None';
      setTerminalLogs(prev => [...prev, `[SYSTEM] Active Agents: ${activeStr}`]);
    } else if (cmd.startsWith('/boost ')) {
      const target = cmd.replace('/boost ', '').trim();
      setAgents(prev => prev.map(a => {
        if (a.name.toLowerCase().includes(target) || a.role.toLowerCase().includes(target)) {
          setTerminalLogs(old => [...old, `[SYSTEM] Boosted ${a.name} to 100% efficiency!`]);
          return { ...a, efficiency: 100 };
        }
        return a;
      }));
    } else {
      setTerminalLogs(prev => [...prev, `[CLI ERROR] Unknown command "${cmd}". Try /status, /clear, or /boost [agent_name].`]);
    }
  };

  // ROI Calculator
  const totalRoi = agents.reduce((acc, a) => {
    if (a.status === 'active') {
      return acc + (a.roiMultiplier * 150); // mock calculation: $150 per unit multiplier
    }
    return acc;
  }, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6" id="agent-hub">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 animate-pulse" />
            Meta-Cognitive Swarm Hub & Autonomous Orchestrator
          </h2>
          <p className="text-3xs text-slate-500 uppercase tracking-widest font-mono">Supervisor-Worker Topology with Tree-of-Thoughts Reasoning loops</p>
        </div>
        
        <button 
          onClick={handleWakeAll}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold font-sans transition-colors cursor-pointer"
        >
          Wake All Agents (150+ Swarm)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Swarm Status & Registry */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Hyper-Dimensional Memory Context</span>
            </div>
            <div className="flex items-center gap-3 w-full max-w-xs pl-4">
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={memoryContext} 
                onChange={(e) => setMemoryContext(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-slate-700">{memoryContext}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xs font-mono font-extrabold text-slate-400 uppercase tracking-widest">Active Worker Swarm (5 Core Systems)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map(a => (
                <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-3xs flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{a.name}</h4>
                        <p className="text-[10px] text-indigo-600 font-semibold">{a.role}</p>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                        a.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        {a.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-650 mt-2 font-mono leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-150">
                      💡 thought: {a.thought}
                    </p>

                    {/* Interactive Efficiency Slider */}
                    <div className="mt-3 space-y-1 bg-indigo-50/20 p-2 rounded-lg border border-indigo-100/30">
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500 leading-none">
                        <span>INDIVIDUAL EFFICIENCY:</span>
                        <span className="text-indigo-600">{a.efficiency}%</span>
                      </div>
                      <input 
                        type="range"
                        min="40"
                        max="100"
                        value={a.efficiency}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setAgents(prev => prev.map(item => item.id === a.id ? { ...item, efficiency: val } : item));
                        }}
                        className="w-full accent-indigo-600 h-1 cursor-pointer bg-slate-100 rounded appearance-none"
                        disabled={a.status === 'paused'}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-4xs font-mono text-slate-400">ROI index: {a.roiMultiplier}x</span>
                    <button 
                      onClick={() => toggleAgentStatus(a.id)}
                      className={`px-2 py-1 rounded text-4xs font-bold transition-all cursor-pointer ${
                        a.status === 'active' 
                          ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200' 
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200'
                      }`}
                    >
                      {a.status === 'active' ? 'Pause Agent' : 'Resume Agent'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Swarm Network Topology Simulator (CSS grid based) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Autonomous Swarm Interaction Grid</h4>
            <div className="grid grid-cols-5 gap-2 h-16">
              {Array.from({ length: 15 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`rounded-lg border flex items-center justify-center font-mono text-[9px] font-bold ${
                    idx % 3 === 0 
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' 
                      : idx % 4 === 0 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  node-{idx + 1}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Live Thought Process Terminal & Leaderboard */}
        <div className="space-y-6">
          
          {/* ROI Calculator Result */}
          <div className="border border-slate-200 bg-indigo-50/40 rounded-xl p-4 text-center space-y-1">
            <p className="text-4xs font-mono font-bold text-indigo-500 uppercase tracking-wider">Swarm ROI Calculator</p>
            <h4 className="text-xl font-black text-indigo-900 font-sans">${totalRoi.toLocaleString()} / mo</h4>
            <p className="text-4xs text-slate-500 font-medium">Estimated cost savings generated by automated operations pipelines</p>
          </div>

          {/* Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col h-[280px]">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Thought Process Logs</span>
            </div>

            <div 
              ref={terminalContainerRef}
              className="flex-1 overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1 pr-1"
            >
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap">{log}</div>
              ))}
            </div>

            <form onSubmit={handleCliSubmit} className="mt-2 flex gap-1.5 border-t border-slate-900 pt-2 shrink-0">
              <span className="text-emerald-500 font-mono text-2xs font-bold self-center">&gt;</span>
              <input 
                type="text"
                value={cliInput}
                onChange={e => setCliInput(e.target.value)}
                placeholder="Type /status, /clear or /boost [name]..."
                className="flex-1 bg-transparent text-emerald-300 font-mono text-[10px] focus:outline-none placeholder-emerald-800"
              />
              <button 
                type="submit"
                className="text-[9px] font-mono font-bold text-emerald-500 hover:text-emerald-300 uppercase shrink-0"
              >
                Send
              </button>
            </form>
          </div>

          {/* Leaderboard */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 font-sans">
            <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Agent Efficiency Leaderboard</h4>
            <div className="space-y-2">
              {[...agents].sort((a,b) => b.efficiency - a.efficiency).map((a, idx) => (
                <div key={a.id} className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{idx + 1}. {a.name}</span>
                  <span className="font-mono text-indigo-600">{a.efficiency}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deploy Custom Swarm Node Form */}
          <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/20 font-sans">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-indigo-650" />
              <h4 className="text-2xs font-mono font-bold text-slate-400 uppercase tracking-widest">Hire & Deploy Custom Node</h4>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-2.5">
              <div>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  placeholder="Agent Node Name (e.g., SEO Architect)" 
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold"
                  required
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={newAgentRole}
                  onChange={e => setNewAgentRole(e.target.value)}
                  placeholder="System Role (e.g., Auto-Blogging Ingester)" 
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded font-bold"
                  required
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase shrink-0">ROI index: {newAgentMultiplier}x</span>
                <input 
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={newAgentMultiplier}
                  onChange={e => setNewAgentMultiplier(Number(e.target.value))}
                  className="flex-1 accent-indigo-600 cursor-pointer h-1 rounded"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                🚀 Deploy Swarm Worker
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
