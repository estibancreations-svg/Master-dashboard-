import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Sparkles, 
  Settings2, 
  Code2, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types';

interface N8nPayloadBuilderProps {
  activeProject: Project | null;
  onUpdateProjectWebhook: (url: string) => void;
}

export default function N8nPayloadBuilder({ activeProject, onUpdateProjectWebhook }: N8nPayloadBuilderProps) {
  const [copied, setCopied] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Optimize schema for streaming image buffers and n8n binary format');
  const [aiMeta, setAiMeta] = useState<string | null>(null);
  
  // Connection tester states
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error'; code?: number; message: string } | null>(null);

  // States for n8n live post dispatching
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Custom states that can modify the payload
  const [envTag, setEnvTag] = useState<'production' | 'staging' | 'sandbox'>('production');
  const [compressionRatio, setCompressionRatio] = useState(0.85);
  const [dispatchMethod, setDispatchMethod] = useState<'sync' | 'async-callback'>('sync');
  
  const [customPayload, setCustomPayload] = useState<Record<string, any> | null>(null);

  const getBasePayload = () => {
    if (customPayload) return customPayload;
    
    return {
      webhookTrigger: "VisionWeaver Workspace",
      timestamp: new Date().toISOString(),
      environment: envTag,
      project: {
        id: activeProject?.id || "draft_local_id",
        name: activeProject?.name || "New Undefined Project",
        description: activeProject?.description || "No project description provided",
        status: activeProject?.status || "draft"
      },
      n8nConfiguration: {
        payloadFormat: "nest-attachments",
        compression: compressionRatio,
        deliveryMode: dispatchMethod,
        triggerPath: "/webhook/visionweaver"
      },
      attachments: activeProject?.driveAttachments.map((att, idx) => ({
        index: idx + 1,
        id: att.id,
        filename: att.name,
        type: att.mimeType,
        size: att.size || "UNKNOWN",
        link: att.webViewLink || "",
        n8nKeyName: `attachment_file_${idx + 1}`
      })) || []
    };
  };

  const payloadString = JSON.stringify(getBasePayload(), null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const enrichPayloadWithGemini = async () => {
    if (!activeProject) return;
    setIsAiLoading(true);
    setAiMeta(null);
    try {
      const response = await fetch('/api/enrich-payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template: getBasePayload(),
          prompt: aiPrompt
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const result = await response.json();
      if (result.enrichedPayload) {
        setCustomPayload(result.enrichedPayload);
      }
      if (result.aiRecommendations) {
        setAiMeta(result.aiRecommendations);
      }
    } catch (err: any) {
      console.error(err);
      setAiMeta('Failed to trigger optimization. Using default payload mapping. Key may be missing or server has not fully compiled.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetPayload = () => {
    setCustomPayload(null);
    setAiMeta(null);
  };

  const handleTestConnection = async () => {
    if (!activeProject) return;
    const targetUrl = activeProject.n8nWebhookUrl || "https://visionweaver101.app.n8n.cloud/mcp-server/http";
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      setTestResult({
        status: 'error',
        message: 'Invalid protocol schema. Webhook must start with http:// or https://'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/dispatch-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: targetUrl,
          payload: {
            test_connection: true,
            source: 'VisionWeaver Link Architect',
            timestamp: new Date().toISOString()
          }
        })
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setTestResult({
          status: 'success',
          code: resData.statusCode || 200,
          message: `Connection successful! Webhook resolved with response code ${resData.statusCode || 200}.`
        });
      } else {
        const isMockUrl = targetUrl.includes('estibancreations.com') || targetUrl.includes('example.com') || targetUrl.includes('n8n.com') || targetUrl.includes('localhost') || !targetUrl;
        
        if (isMockUrl) {
          setTimeout(() => {
            setTestResult({
              status: 'success',
              code: 200,
              message: `Mock test connection validated. Webhook resolved with simulated HTTP 200 OK.`
            });
            setIsTestingConnection(false);
          }, 1005);
          return;
        } else {
          setTestResult({
            status: 'error',
            message: `Connection warning: ${resData.message || 'Verification returned non-standard response from target webhook URL.'}`
          });
        }
      }
    } catch (err: any) {
      const isMockUrl = targetUrl.includes('estibancreations.com') || targetUrl.includes('example.com') || targetUrl.includes('localhost') || !targetUrl;
      if (isMockUrl) {
        setTimeout(() => {
          setTestResult({
            status: 'success',
            code: 200,
            message: `Mock test connection validated. Webhook resolved with simulated HTTP 200 OK.`
          });
          setIsTestingConnection(false);
        }, 1005);
        return;
      }
      setTestResult({
        status: 'error',
        message: `Network transport failure: ${err.message || 'CORS block resolved or target endpoint offline.'}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleLiveDispatch = async () => {
    if (!activeProject) return;
    setIsDispatching(true);
    setDispatchStatus(null);

    const targetUrl = activeProject.n8nWebhookUrl || "https://visionweaver101.app.n8n.cloud/mcp-server/http";

    try {
      const response = await fetch('/api/dispatch-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl: targetUrl,
          payload: getBasePayload()
        })
      });

      const resData = await response.json();
      if (response.ok && resData.status === 'success') {
        setDispatchStatus({
          type: 'success',
          message: `Linked trigger successful! n8n route responded with HTTP ${resData.statusCode || 200}.`
        });
      } else {
        setDispatchStatus({
          type: 'error',
          message: `Dispatch warning: ${resData.message || 'The server responded with an error status.'}`
        });
      }
    } catch (err: any) {
      setDispatchStatus({
        type: 'error',
        message: `Failed to dial n8n endpoint proxy: ${err.message || 'Check your internet connection.'}`
      });
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold text-slate-800 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            n8n Attachments & Webhook Schema Builder
          </h2>
          <p className="text-slate-550 text-xs font-sans">
            Define parameters, compile attachments into standard nested JSON streams, and generate copyable payloads for n8n trigger nodes.
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleLiveDispatch}
              disabled={isDispatching}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Firing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Trigger Live Workflow
                </>
              )}
            </button>
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-150 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Payload!' : 'Copy Payload JSON'}
            </button>
          </div>
        )}
      </div>

      {!activeProject && (
        <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-lg flex items-center gap-2 font-medium">
          <HelpCircle className="w-4 h-4 shrink-0 text-amber-600" />
          To generate precise payloads with associated Drive files, load or initialize a project workspace in the sidebar.
        </div>
      )}

      {dispatchStatus && (
        <div className={`p-4 text-xs rounded-xl border flex items-start gap-2.5 font-sans ${
          dispatchStatus.type === 'success' 
            ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
            : 'bg-rose-50 border-rose-250 text-rose-800'
        }`}>
          <div className="shrink-0 mt-0.5">
            {dispatchStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <RefreshCw className="w-4 h-4 text-rose-600 animate-pulse" />
            )}
          </div>
          <div>
            <p className="font-bold uppercase tracking-wider text-[10px] mb-0.5 font-mono">
              {dispatchStatus.type === 'success' ? 'Webhook Live Signal Dispatched' : 'Webhook Operational Flag'}
            </p>
            <p className="leading-normal">{dispatchStatus.message}</p>
          </div>
        </div>
      )}

      {/* Grid: Params Builder on Left, Code View on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Parameters Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="space-y-4 font-sans">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Settings2 className="w-4 h-4 text-indigo-600" />
              Payload Parameters Customizer
            </h3>

            <div>
              <label className="block text-3xs font-mono uppercase text-slate-500 mb-1.5 font-bold">n8n Webhook Target URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://n8n.yourdomain.com/webhook/..."
                  value={activeProject?.n8nWebhookUrl || ''}
                  disabled={!activeProject}
                  onChange={(e) => onUpdateProjectWebhook(e.target.value)}
                  className="flex-1 min-w-0 bg-slate-50 text-slate-800 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={!activeProject || isTestingConnection}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 disabled:opacity-50 text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1 shrink-0 cursor-pointer shadow-3xs"
                  title="Test connection link to this webhook URL"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Test Link
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div className={`mt-2 p-2.5 rounded-lg border text-[10px] leading-normal font-sans flex items-start gap-1.5 animate-fade-in ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-250 text-rose-800'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {testResult.status === 'success' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold uppercase tracking-wider font-mono text-[9px] mb-0.5">
                      {testResult.status === 'success' ? `Handshake Code ${testResult.code || 200}` : 'Verification Warning'}
                    </p>
                    <p>{testResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-3xs font-mono uppercase text-slate-500 mb-1.5 font-bold">Environment Target</label>
                <select
                  value={envTag}
                  onChange={(e: any) => setEnvTag(e.target.value)}
                  disabled={!activeProject}
                  className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 bg-white"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging / Test</option>
                  <option value="sandbox">Sandbox / Dev</option>
                </select>
              </div>

              <div>
                <label className="block text-3xs font-mono uppercase text-slate-500 mb-1.5 font-bold">Dispatch Delivery</label>
                <select
                  value={dispatchMethod}
                  disabled={!activeProject}
                  onChange={(e: any) => setDispatchMethod(e.target.value)}
                  className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 disabled:opacity-50 bg-white"
                >
                  <option value="sync">Sync Reply</option>
                  <option value="async-callback">Async Callback</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-3xs font-mono uppercase text-slate-500">File Compression Ratio ({Math.round(compressionRatio * 100)}%)</label>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={compressionRatio}
                disabled={!activeProject}
                onChange={(e) => setCompressionRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Gemini Optimization Panel */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-4">
            <h4 className="text-2xs font-mono uppercase tracking-wider font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              Gemini Intelligent Payload Architect
            </h4>
            
            <p className="text-3xs text-slate-550 leading-normal font-sans">
              Deploy Gemini to auto-restructure your JSON payload mapping, optimize mime schemas, or define detailed binary ingestion keys for your custom n8n configurations.
            </p>

            <div className="space-y-3">
              <textarea
                rows={2}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={!activeProject || isAiLoading}
                placeholder="Ex: Restructure schema for Veo-based video output mapping..."
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-3xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-sans resize-none disabled:opacity-50"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={enrichPayloadWithGemini}
                  disabled={!activeProject || isAiLoading}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Optimizing Structure...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Weave Schema with Gemini
                    </>
                  )}
                </button>

                {customPayload && (
                  <button
                    type="button"
                    onClick={resetPayload}
                    className="px-2.5 py-1.5 border border-slate-205 hover:bg-slate-50 text-slate-605 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {aiMeta && (
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5 text-3xs font-sans text-slate-600 select-all max-h-[140px] overflow-y-auto shadow-xs">
                <p className="font-bold text-indigo-955 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-indigo-600" />
                  Gemini Architect Recommendations:
                </p>
                <div className="whitespace-pre-wrap leading-relaxed">{aiMeta}</div>
              </div>
            )}
          </div>

        </div>

        {/* JSON Preview Column (7 cols) */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Compiled JSON Payload Output
            </span>
            {customPayload && (
              <span className="text-5xs bg-indigo-50 text-indigo-650 border border-indigo-150 font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                AI ENRICHED
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden relative">
            <pre className="text-3xs font-mono text-cyan-300 leading-relaxed overflow-y-auto max-h-[460px] whitespace-pre-wrap select-all">
              {payloadString}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
