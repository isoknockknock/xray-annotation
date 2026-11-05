import React, { useState, useEffect } from 'react';
import { 
  FileText, Edit3, ShieldCheck, AlertTriangle, CheckCircle, 
  RotateCcw, History, Award, UserCheck, Download, Printer, ExternalLink, Eye
} from 'lucide-react';

export default function EditableReport({
  currentCase,
  findings,
  setFindings,
  impression,
  setImpression,
  triageLevel,
  setTriageLevel,
  anatomicalBreakdown,
  setAnatomicalBreakdown,
  originalAiResult,
  isApproved,
  setIsApproved,
  physicianInfo,
  setPhysicianInfo,
  onOpenExportModal
}) {
  const [showDiff, setShowDiff] = useState(false);
  const [isModified, setIsModified] = useState(false);

  // Detect if user modified MedGemma original results
  useEffect(() => {
    if (originalAiResult) {
      const findingsChanged = findings.trim() !== originalAiResult.findings.trim();
      const impressionChanged = impression.trim() !== originalAiResult.impression.trim();
      setIsModified(findingsChanged || impressionChanged);
    }
  }, [findings, impression, originalAiResult]);

  // Revert back to original MedGemma output
  const handleRevertToAi = () => {
    if (originalAiResult) {
      setFindings(originalAiResult.findings);
      setImpression(originalAiResult.impression);
      if (originalAiResult.triageLevel) {
        setTriageLevel(originalAiResult.triageLevel);
      }
    }
  };

  // Approval trigger
  const handleApprove = () => {
    setIsApproved(true);
  };

  const triageBadges = [
    { label: 'Normal', color: 'badge-normal' },
    { label: 'Moderate', color: 'badge-moderate' },
    { label: 'High', color: 'badge-high' },
    { label: 'Critical', color: 'badge-critical' }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col h-full space-y-4">
      {/* Top Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Radiology Diagnostic Report
              {isModified && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-sans normal-case flex items-center gap-1">
                  <Edit3 className="w-3 h-3" /> Clinician Modified
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">MedGemma AI Generated • Fully Editable Prior to Approval</p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2">
          {isModified && (
            <button
              onClick={handleRevertToAi}
              className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800"
              title="Reset edits to original MedGemma inference output"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" /> Revert to AI Original
            </button>
          )}

          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`text-xs px-2.5 py-1 rounded border flex items-center gap-1 transition-all ${
              showDiff 
                ? 'bg-cyan-950 border-cyan-700 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3 h-3 text-cyan-400" />
            {showDiff ? 'Hide AI Diff' : 'Compare AI vs Edit'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Diff View if Toggled */}
      {showDiff && originalAiResult && (
        <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed animate-fadeIn">
          <div className="space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-800">
            <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase block">Original MedGemma Output</span>
            <p className="text-slate-300 text-[11px] whitespace-pre-wrap font-sans">{originalAiResult.findings}</p>
            <div className="border-t border-slate-800 pt-1.5 mt-2">
              <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase block">Original Impression</span>
              <p className="text-slate-300 text-[11px] font-sans">{originalAiResult.impression}</p>
            </div>
          </div>
          <div className="space-y-1 bg-slate-900/60 p-2.5 rounded border border-emerald-900/60">
            <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase block">Current Clinician Revision</span>
            <p className="text-emerald-200 text-[11px] whitespace-pre-wrap font-sans">{findings}</p>
            <div className="border-t border-slate-800 pt-1.5 mt-2">
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase block">Current Impression</span>
              <p className="text-emerald-200 text-[11px] font-sans">{impression}</p>
            </div>
          </div>
        </div>
      )}



      {/* Editable Findings Section */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-cyan-300 font-mono uppercase flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Radiographic Findings (Editable)
          </label>
          <span className="text-[10px] text-slate-400">Click anywhere inside text box to edit</span>
        </div>
        <textarea
          rows={5}
          disabled={isApproved}
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          placeholder="Enter visible radiographic findings..."
          className={`w-full p-3 bg-slate-950 border rounded-xl text-xs font-sans leading-relaxed transition-all focus:outline-none ${
            isApproved 
              ? 'border-emerald-900/80 text-slate-200 bg-slate-950/60 cursor-not-allowed' 
              : 'border-slate-800 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
          }`}
        />
      </div>

      {/* Editable Impression Section */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-emerald-300 font-mono uppercase flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Radiology Impression (Editable)
        </label>
        <textarea
          rows={3}
          disabled={isApproved}
          value={impression}
          onChange={(e) => setImpression(e.target.value)}
          placeholder="Enter concise diagnostic impression & clinical recommendation..."
          className={`w-full p-3 bg-slate-950 border rounded-xl text-xs font-sans leading-relaxed transition-all focus:outline-none ${
            isApproved 
              ? 'border-emerald-900/80 text-slate-200 bg-slate-950/60 cursor-not-allowed' 
              : 'border-slate-800 text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
          }`}
        />
      </div>



      {/* Physician Sign-Off & Approval Toolbar */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Reviewing Physician</label>
            <input
              type="text"
              disabled={isApproved}
              value={physicianInfo.name}
              onChange={(e) => setPhysicianInfo({ ...physicianInfo, name: e.target.value })}
              placeholder="Dr. Doctor Doctor"
              className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400">Radiology License / NPI</label>
            <input
              type="text"
              disabled={isApproved}
              value={physicianInfo.license}
              onChange={(e) => setPhysicianInfo({ ...physicianInfo, license: e.target.value })}
              placeholder="NPI-94820194"
              className="w-full mt-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {isApproved ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800 flex-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div>REPORT APPROVED & SIGNED</div>
                <div className="text-[10px] text-slate-400 font-normal">
                  Signed by {physicianInfo.name} on {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleApprove}
              className="btn-success flex-1 py-2.5 text-xs uppercase tracking-wider font-bold"
            >
              <ShieldCheck className="w-4 h-4" /> Approve & Sign Diagnostic Report
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="btn-primary py-2.5 text-xs font-bold"
          >
            <Printer className="w-4 h-4" /> Export Report (PDF/Print)
          </button>
        </div>
      </div>
    </div>
  );
}
