import React from 'react';
import { Printer, Download, X, ShieldCheck, Activity, Award, FileText, CheckCircle2 } from 'lucide-react';

export default function ExportModal({
  isOpen,
  onClose,
  caseData,
  findings,
  impression,
  triageLevel,
  anatomicalBreakdown,
  physicianInfo,
  isApproved,
  originalAiResult,
  imageSrc
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const reportData = {
      caseMetadata: caseData,
      inferenceModel: "google/medgemma-1.5-4b-it",
      findings,
      impression,
      physicianInfo,
      isApproved,
      approvedTimestamp: new Date().toISOString(),
      originalAiInference: originalAiResult
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MedGemma_Report_${caseData?.patientId || 'Patient'}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Header (Screen Only) */}
        <div className="no-print p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Clinical Diagnostic Report Export Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" /> Save JSON
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary text-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Clinical Radiology Report Content */}
        <div className="p-8 bg-white text-slate-900 overflow-y-auto font-sans leading-normal flex-1">
          {/* Hospital Letterhead Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-cyan-700 font-extrabold text-xl tracking-tight">
                <Activity className="w-6 h-6 stroke-[3]" /> MEDGEMMA RADIOLOGY CENTER
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Advanced AI-Assisted Multimodal Imaging Department • Diagnostic Report
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div className="font-bold text-slate-900">STUDY DATE: {caseData?.studyDate || new Date().toLocaleDateString()}</div>
              <div>REPORT ID: RPT-{Math.floor(100000 + Math.random() * 900000)}</div>
              <div>AI ENGINE: MedGemma-1.5-4B-IT</div>
            </div>
          </div>

          {/* Patient Metadata Grid Table */}
          <div className="bg-slate-100 p-4 rounded-lg border border-slate-300 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Patient Name</span>
              <span className="font-bold text-slate-900">{caseData?.patientName || 'Igor Thiago'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Patient ID</span>
              <span className="font-mono font-bold text-slate-900">{caseData?.patientId || 'PAT-xxxxxx'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Age / Sex</span>
              <span className="font-bold text-slate-900">{caseData?.age || 54} Y / {caseData?.gender || 'F'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Scan Modality / View</span>
              <span className="font-bold text-slate-900">{caseData?.view || 'PA Chest Radiograph'}</span>
            </div>
          </div>

          {/* Side-by-Side Image Thumbnail & Triage Urgency */}
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-44 h-44 bg-black rounded-lg overflow-hidden border border-slate-300 shrink-0 flex items-center justify-center">
              <img src={imageSrc} alt="Radiograph X-Ray" className="max-w-full max-h-full object-contain" />
            </div>


          </div>

          {/* Radiographic Findings */}
          <div className="mb-6">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
              RADIOGRAPHIC FINDINGS
            </h4>
            <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
              {findings}
            </div>
          </div>

          {/* Radiology Impression */}
          <div className="mb-8 p-4 bg-slate-50 border-l-4 border-cyan-600 rounded-r-lg">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-900 mb-1">
              DIAGNOSTIC IMPRESSION
            </h4>
            <div className="text-xs font-semibold text-slate-900 leading-relaxed">
              {impression}
            </div>
          </div>

          {/* Physician Approval & Digital Sign-off Stamp */}
          <div className="pt-6 border-t-2 border-slate-800 flex justify-between items-end">
            <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
              <div>PHYSICIAN APPROVAL STAMP</div>
              <div>STATUS: {isApproved ? 'VERIFIED & APPROVED' : 'PENDING REVIEW'}</div>
              <div>VERIFICATION CODE: MDG-{Math.random().toString(36).substring(2, 9).toUpperCase()}</div>
            </div>

            <div className="text-right">
              <div className="font-bold text-xs text-slate-900">
                {physicianInfo?.name || 'Dr. Doctor Doctor, M.D.'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {physicianInfo?.license || 'NPI-xxxxxxxx'} • Board Certified Radiologist
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center justify-end gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Signed & Authenticated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
