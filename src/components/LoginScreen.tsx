import React from 'react';
import { Network, Activity, FileText } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
  error?: string;
}

export default function LoginScreen({ onLogin, isLoggingIn, error }: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 overflow-hidden relative">
      {/* Background Visual Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />
      
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-8 shadow-lg relative z-10 space-y-8 animate-fade-in animate-duration-300">
        
        {/* Header Branding */}
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 mb-2 shadow-xs">
            <Network className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900">
            VisionWeaver
            <span className="text-indigo-600"> Control Hub</span>
          </h1>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Design pipeline assets, bundle n8n attachments, and orchestrate workflow automations directly with Google Workspace.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 gap-3 text-left">
          <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600">
            <Activity className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Interactive Pipeline Weaver</p>
              <p className="text-2xs text-slate-500">Orchestrate and deploy custom nodes, status checkpoints, and test payloads.</p>
            </div>
          </div>

          <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600">
            <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-800">Google Workspace Integrations</p>
              <p className="text-2xs text-slate-500">Attach Drive files safely, register production Tasks, and coordinate Alert log metrics.</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-150 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div className="flex justify-center flex-col items-center gap-3">
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              id="google-signin-btn"
              className="gsi-material-button w-full sm:w-auto min-w-[260px] inline-flex items-center justify-center bg-white text-slate-900 border border-slate-350 rounded-full py-2 px-5 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer group disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                <div className="gsi-material-button-icon w-5 h-5">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-sans font-semibold text-sm text-slate-800">
                  {isLoggingIn ? 'Connecting to Workspace...' : 'Sign in with Google Account'}
                </span>
              </div>
            </button>
            <p className="text-3xs text-slate-400 max-w-[285px] text-center uppercase tracking-widest mt-1 font-mono">
              authorized scopes include drive, tasks & chat
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
