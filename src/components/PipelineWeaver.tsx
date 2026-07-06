import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  Plus, 
  Trash2, 
  Settings, 
  Activity, 
  ChevronRight, 
  Cpu, 
  FileCode, 
  AlertCircle,
  CheckCircle2,
  HardDrive,
  Download
} from 'lucide-react';
import { Project, PipelineNode } from '../types';

interface PipelineWeaverProps {
  activeProject: Project | null;
  nodes: PipelineNode[];
  onModifyNodes: (nodes: PipelineNode[]) => void;
  onDispatchTrigger: (payload: Record<string, any>) => void;
}

export default function PipelineWeaver({ activeProject, nodes, onModifyNodes, onDispatchTrigger }: PipelineWeaverProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [simLog, setSimLog] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'dev' | 'error' }[]>([]);
  const [currentNodeIdx, setCurrentNodeIdx] = useState<number | null>(null);
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [simLog]);

  const downloadPipelineJson = () => {
    if (nodes.length === 0) return;
    const projectSlug = activeProject?.name ? activeProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'pipeline';
    const filename = `visionweaver-pipeline-${projectSlug}.json`;
    
    const payload = {
      projectId: activeProject?.id || 'draft',
      projectName: activeProject?.name || 'Draft Pipeline',
      exportedAt: new Date().toISOString(),
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        name: n.name,
        config: n.config
      }))
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addLog(`Pipeline topology config file [${filename}] exported successfully to client disk.`, 'success');
  };

  const addNode = (type: PipelineNode['type']) => {
    const defaultData: Record<string, any> = {
      drive_input: { label: "Estibancreations Bucket", format: "image/all" },
      process_enhance: { denoise: 0.8, colorCorrect: true, powerScalar: 1.5 },
      process_crop: { aspect: "16:9", align: "center" },
      model_weaver: { prompt: "Improve clarity and weave overlay styles", model: "gemini-3.1-pro-preview" },
      n8n_dispatch: { webhook: activeProject?.n8nWebhookUrl || "https://visionweaver101.app.n8n.cloud/mcp-server/http" }
    };

    const nodeNames: Record<PipelineNode['type'], string> = {
      drive_input: "Drive Asset Intake",
      process_enhance: "Intelligent Neural Enhancer",
      process_crop: "Auto Crop & Frame",
      model_weaver: "Gemini Weaver Prompt",
      n8n_dispatch: "n8n Outbound Webhook"
    };

    const newNode: PipelineNode = {
      id: Math.random().toString(36).substring(7),
      type,
      name: nodeNames[type],
      status: 'pending',
      config: defaultData[type]
    };

    onModifyNodes([...nodes, newNode]);
    addLog(`Pipeline Node [${nodeNames[type]}] instantiated at draft scope.`, 'info');
  };

  const removeNode = (id: string, name: string) => {
    onModifyNodes(nodes.filter(n => n.id !== id));
    addLog(`Pipeline Node [${name}] removed from topology.`, 'info');
  };

  const updateNodeConfig = (id: string, key: string, value: any) => {
    const updated = nodes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          config: { ...n.config, [key]: value }
        };
      }
      return n;
    });
    onModifyNodes(updated);
  };

  const addLog = (msg: string, type: 'info' | 'success' | 'dev' | 'error' = 'info') => {
    const now = new Date().toLocaleTimeString();
    setSimLog(prev => [...prev, { time: now, msg, type }]);
  };

  const simulatePipeline = async () => {
    if (nodes.length === 0) {
      addLog("Cannot run topology. Zero pipeline nodes modeled.", 'error');
      return;
    }

    setIsRunning(true);
    setSimLog([]);
    addLog("System starting: Initializing VisionWeaver compiler context.", 'info');
    
    // Reset statuses
    onModifyNodes(nodes.map(n => ({ ...n, status: 'pending' })));

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      setCurrentNodeIdx(i);
      
      // Update running status
      onModifyNodes(nodes.map((n, idx) => ({
        ...n,
        status: idx === i ? 'running' : (idx < i ? 'completed' : 'pending')
      })));

      addLog(`Executing: ${node.name} (${node.type})...`, 'dev');
      
      // Node specific simulator logic
      if (node.type === 'drive_input') {
        const fileCount = activeProject?.driveAttachments.length || 0;
        addLog(`Drive Asset Intake attached ${fileCount} target items for weave.`, 'success');
        if (fileCount === 0) {
          addLog("Warning: Zero input files linked from Drive. Simulated fallback payload loaded.", 'info');
        }
      } else if (node.type === 'process_enhance') {
        addLog(`Applying scalar enhancement. Denoise ratio ${node.config.denoise || 0.8}, color Correct: ${node.config.colorCorrect}`, 'success');
      } else if (node.type === 'process_crop') {
        addLog(`Framed output coordinates mapped as aspect '${node.config.aspect || '16:9'}'.`, 'success');
      } else if (node.type === 'model_weaver') {
        addLog(`Submitting files to ${node.config.model || 'Gemini'} with prompt: "${node.config.prompt}"`, 'success');
        addLog("Response loaded from VisionWeaver API - metadata generated successfully.", 'info');
      } else if (node.type === 'n8n_dispatch') {
        const targetWebhook = node.config.webhook || activeProject?.n8nWebhookUrl || "https://visionweaver101.app.n8n.cloud/mcp-server/http";
        addLog(`Synthesizing live n8n webhook trigger on: ${targetWebhook}`, 'info');
        
        const payload = {
          projectId: activeProject?.id,
          projectName: activeProject?.name,
          timeStamp: new Date().toISOString(),
          totalNodes: nodes.length,
          attachments: activeProject?.driveAttachments || [],
          pipelineTopology: nodes.map(n => ({ id: n.id, type: n.type, config: n.config }))
        };

        try {
          const response = await fetch('/api/dispatch-n8n', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              webhookUrl: targetWebhook,
              payload
            })
          });

          const resData = await response.json();
          if (response.ok && resData.status === 'success') {
            addLog(`n8n live dispatch success! Status: ${resData.statusCode || 200}`, 'success');
            if (resData.data) {
              addLog(`Response data: ${JSON.stringify(resData.data).substring(0, 150)}...`, 'success');
            }
          } else {
            addLog(`n8n warning alert: Direct dispatch returned error state. Try verifying your webhook endpoint parameters. ${resData.message || ''}`, 'error');
          }
        } catch (err: any) {
          addLog(`Network failed to dial n8n proxy connector: ${err.message || 'Unknown network deviation.'}`, 'error');
        }

        // Keep local hook triggered
        onDispatchTrigger(payload);
      }

      await new Promise(resolve => setTimeout(resolve, 1400));
    }

    // Set all to completed
    onModifyNodes(nodes.map(n => ({ ...n, status: 'completed' })));
    setCurrentNodeIdx(null);
    setIsRunning(false);
    addLog("VisionWeaver run completed! Direct payload dispatched and persisted.", 'success');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Interactive VisionWeaver Pipeline
          </h2>
          <p className="text-slate-550 text-xs">
            Model the production steps of your VisionWeaver system. Drag, configure, and trigger test loops.
          </p>
        </div>

        <div className="flex gap-2">
          {activeProject && nodes.length > 0 && (
            <button
              type="button"
              onClick={downloadPipelineJson}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Backup current pipeline topology configuration"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              Download JSON
            </button>
          )}
          <button
            onClick={simulatePipeline}
            disabled={isRunning || !activeProject}
            className={`px-4 py-2 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              isRunning 
                ? 'bg-slate-100 text-slate-450 cursor-not-allowed border border-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm shadow-emerald-900/10'
            }`}
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Executing Nodes...' : 'Execute Active Nodes Pipeline'}
          </button>
        </div>
      </div>

      {!activeProject && (
        <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          A project must be loaded in the left panel list before building elements or simulating run cycles.
        </div>
      )}

      {/* Grid: 2 columns in large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Topology builder (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Node Pipeline Layout</h3>
            
            {/* Quick action add nodes */}
            <div className="flex flex-wrap gap-1">
              {(['drive_input', 'process_enhance', 'process_crop', 'model_weaver', 'n8n_dispatch'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => addNode(type)}
                  disabled={!activeProject}
                  className="px-2 py-1 text-4xs uppercase tracking-widest font-mono bg-slate-100 text-slate-650 rounded border border-slate-200 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  + {type.split('_').slice(1).join(' ') || type}
                </button>
              ))}
            </div>
          </div>

          {nodes.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl space-y-4 bg-slate-50/50">
              <p className="text-slate-500 text-xs font-sans">Pipeline is empty. Instantiation required.</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => addNode('drive_input')}
                  disabled={!activeProject}
                  className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50"
                >
                  Add Drive Input
                </button>
                <button
                  onClick={() => addNode('n8n_dispatch')}
                  disabled={!activeProject}
                  className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 font-semibold rounded hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Add n8n Webhook
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 font-sans">
              {nodes.map((node, index) => (
                <div 
                  key={node.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    node.status === 'running' 
                      ? 'bg-indigo-50/20 border-indigo-400 shadow-xs'
                      : node.status === 'completed'
                      ? 'bg-slate-50/40 border-emerald-200'
                      : 'bg-slate-50/10 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-xs font-bold ${
                        node.status === 'running'
                          ? 'bg-indigo-100 text-indigo-700 animate-pulse'
                          : node.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-750'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 opacity-100">
                          <h4 className="text-sm font-bold text-slate-800">{node.name}</h4>
                          <span className="text-4xs uppercase tracking-widest font-mono text-slate-400">
                            {node.type}
                          </span>
                        </div>
                        <p className="text-3xs text-slate-450 font-mono">ID: {node.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-4xs px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold ${
                        node.status === 'running'
                          ? 'bg-indigo-100 text-indigo-750 border border-indigo-200/60 animate-pulse'
                          : node.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-750 border border-emerald-200'
                          : 'bg-slate-100 text-slate-550 border border-slate-150'
                      }`}>
                        {node.status}
                      </span>
                      <button
                        onClick={() => removeNode(node.id, node.name)}
                        className="p-1 hover:bg-slate-200/50 text-slate-405 hover:text-rose-605 rounded transition cursor-pointer"
                        title="Delete node"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Configuration Input Areas */}
                  <div className="mt-4 pt-3 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                    {node.type === 'drive_input' && (
                      <>
                        <div>
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Bucket Label</label>
                          <input
                            type="text"
                            value={node.config.label || ''}
                            onChange={(e) => updateNodeConfig(node.id, 'label', e.target.value)}
                            className="bg-white border border-slate-250 rounded px-2 py-1 text-slate-850 text-3xs focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Mime Target</label>
                          <select
                            value={node.config.format || ''}
                            onChange={(e) => updateNodeConfig(node.id, 'format', e.target.value)}
                            className="bg-white border border-slate-250 rounded px-2 py-1 text-slate-850 text-3xs focus:outline-none focus:border-indigo-500 w-full"
                          >
                            <option value="image/all">Images (*)</option>
                            <option value="video/all">Videos (*)</option>
                            <option value="application/json">JSON Configurations</option>
                            <option value="all">Any documents</option>
                          </select>
                        </div>
                      </>
                    )}

                    {node.type === 'process_enhance' && (
                      <>
                        <div>
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Denoise Level ({node.config.denoise || 0.8})</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={node.config.denoise ?? 0.8}
                            onChange={(e) => updateNodeConfig(node.id, 'denoise', parseFloat(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Neural Scale Coefficient</label>
                          <input
                            type="number"
                            step="0.5"
                            value={node.config.powerScalar ?? 1.5}
                            onChange={(e) => updateNodeConfig(node.id, 'powerScalar', parseFloat(e.target.value))}
                            className="bg-white border border-slate-250 rounded px-2 py-1 text-slate-850 text-3xs focus:outline-none focus:border-indigo-500 w-full"
                          />
                        </div>
                      </>
                    )}

                    {node.type === 'process_crop' && (
                      <>
                        <div>
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Aspect Scale Override</label>
                          <select
                            value={node.config.aspect || '16:9'}
                            onChange={(e) => updateNodeConfig(node.id, 'aspect', e.target.value)}
                            className="bg-white border border-slate-250 rounded px-2 py-1 text-slate-850 text-3xs focus:outline-none focus:border-indigo-500 w-full"
                          >
                            <option value="1:1">1:1 Square (Weave)</option>
                            <option value="16:9">16:9 Cinematic (Veo Default)</option>
                            <option value="9:16">9:16 Portrait Reel</option>
                            <option value="4:3">4:3 Standard</option>
                            <option value="21:9">21:9 UltraWide</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Crop Alignment</label>
                          <select
                            value={node.config.align || 'center'}
                            onChange={(e) => updateNodeConfig(node.id, 'align', e.target.value)}
                            className="bg-white border border-slate-250 rounded px-2 py-1 text-slate-850 text-3xs focus:outline-none focus:border-indigo-500 w-full"
                          >
                            <option value="center">Center / Focal</option>
                            <option value="top">Top Anchored</option>
                            <option value="bottom">Bottom Anchored</option>
                          </select>
                        </div>
                      </>
                    )}

                    {node.type === 'model_weaver' && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Gemini Prompter</label>
                          <textarea
                            rows={2}
                            value={node.config.prompt || ''}
                            onChange={(e) => updateNodeConfig(node.id, 'prompt', e.target.value)}
                            placeholder="Prompt string input to weave metadata or analyze image dimensions..."
                            className="bg-white border border-slate-250 rounded px-2 py-1 text-slate-850 text-3xs focus:outline-none focus:border-indigo-500 w-full font-sans resize-none"
                          />
                        </div>
                      </>
                    )}

                    {node.type === 'n8n_dispatch' && (
                      <>
                        <div className="sm:col-span-2">
                          <label className="block text-3xs font-mono uppercase text-slate-500 mb-1">Outbound Target Endpoint URL (n8n)</label>
                          <input
                            type="text"
                            value={node.config.webhook || ''}
                            onChange={(e) => updateNodeConfig(node.id, 'webhook', e.target.value)}
                            className="bg-white border border-slate-250 rounded px-2 py-1.5 text-slate-800 text-3xs focus:outline-none focus:border-indigo-500 w-full font-mono font-bold"
                          />
                        </div>
                      </>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time telemetry simulated output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-505 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            Telemetry Logs trace
          </h3>

          <div 
            ref={logContainerRef}
            className="bg-slate-900 font-mono p-4 rounded-xl border border-slate-800 h-[380px] overflow-y-auto text-2xs space-y-2 select-text text-slate-100"
          >
            <div className="text-slate-400 border-b border-slate-800 pb-2 mb-2">
              *** VISIONWEAVER COMPILE LOGS V1.0 ***
              <br />
              Project Context: {activeProject?.name || 'NULL_WORKSPACE'}
              <br />
              Token check: AUTHED_BEARER_CONFIRMED
            </div>

            {simLog.length === 0 ? (
              <p className="text-slate-500 italic">No events logged. Press "Run Weaver Loop" to compile and run nodes.</p>
            ) : (
              simLog.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-slate-500 shrink-0 font-bold">[{log.time}]</span>
                  <p className={
                    log.type === 'success' 
                      ? 'text-emerald-450 font-bold' 
                      : log.type === 'error'
                      ? 'text-rose-450 font-bold'
                      : log.type === 'dev'
                      ? 'text-indigo-400'
                      : 'text-slate-205'
                  }>
                    {log.msg}
                  </p>
                </div>
              ))
            )}
          </div>
          
          {activeProject && activeProject.driveAttachments.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-150 p-4 rounded-xl space-y-2">
              <h4 className="text-2xs font-mono uppercase tracking-wider font-bold text-indigo-900 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-650" />
                Linked Assets to dispatch ({activeProject.driveAttachments.length})
              </h4>
              <div className="space-y-1.5 max-h-[100px] overflow-y-auto">
                {activeProject.driveAttachments.map(att => (
                   <div key={att.id} className="flex items-center justify-between text-3xs font-mono text-slate-650 bg-white border border-slate-200/60 px-2 py-1 rounded">
                    <span className="truncate max-w-[170px] text-slate-700 font-medium">{att.name}</span>
                    <span>{att.id.substring(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
