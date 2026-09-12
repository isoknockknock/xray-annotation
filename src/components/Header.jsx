import React, { useState } from 'react';
import { Activity, Cpu, Key, FileText, Upload, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';

export default function Header({ 
  currentCase, 
  onSelectCase, 
  onUploadClick, 
  isApproved
}) {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempToken, setTempToken] = useState('');

  const handleSaveToken = () => {
    setShowKeyModal(false);
  };

  return (
    <header className="glass-header sticky top-0 z-40 px-8 py-5 flex flex-wrap items-center justify-between gap-6">
      {/* Brand & Model Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Activity className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">MedGemma</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-semibold">
              1.5-4B-IT
            </span>
            {isApproved && (
              <span className="badge badge-normal flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Approved
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Multimodal Radiology Diagnostic Workstation
          </p>
        </div>
      </div>

      {/* Upload Custom */}
      <div className="flex items-center gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 shadow-sm">
        <button
          onClick={onUploadClick}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-2 transition-all"
        >
          <Upload className="w-4 h-4 text-cyan-400" />
          Upload Custom X-Ray
        </button>
      </div>
    </header>
  );
}
