import React from "react";
import { Activity, Bot, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

function ModelPanel({ title, subtitle, result, accent }) {
  const accentClasses = accent === "cyan"
    ? {
        border: "border-cyan-900/70",
        icon: "text-cyan-300 bg-cyan-950/70 border-cyan-800",
        title: "text-cyan-300",
        dot: "bg-cyan-400"
      }
    : {
        border: "border-violet-900/70",
        icon: "text-violet-300 bg-violet-950/70 border-violet-800",
        title: "text-violet-300",
        dot: "bg-violet-400"
      };

  const statusLabel = {
    idle: "Waiting for image",
    loading: "Analyzing image...",
    success: "Response received",
    error: "Inference failed"
  }[result?.status || "idle"];

  return (
    <section className={`glass-panel rounded-2xl border ${accentClasses.border} p-4 min-w-0 flex flex-col min-h-[360px]`}>
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center ${accentClasses.icon}`}>
            {accent === "cyan" ? <Bot className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h2 className={`text-sm font-bold uppercase tracking-wider font-mono ${accentClasses.title}`}>
              {title}
            </h2>
            <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 shrink-0">
          {result?.status === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
          {result?.status === "success" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          {result?.status === "error" && <AlertCircle className="w-3 h-3 text-rose-400" />}
          {statusLabel}
        </span>
      </div>

      <div className="pt-4 flex-1">
        {result?.status === "idle" && (
          <p className="text-xs text-slate-500 leading-relaxed">
            Upload a chest X-ray or run inference to view this model's report.
          </p>
        )}
        {result?.status === "loading" && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            Waiting for model response...
          </div>
        )}
        {(result?.status === "success" || result?.status === "error") && (
          <pre className={`text-xs leading-relaxed whitespace-pre-wrap break-words font-sans ${
            result.status === "error" ? "text-rose-300" : "text-slate-200"
          }`}>
            {result.text || "The model returned an empty response."}
          </pre>
        )}
      </div>
    </section>
  );
}

export default function ModelComparison({ medgemma, chexone }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Model Output Comparison
          </h2>
          <p className="text-[11px] text-slate-400">
            The same uploaded image is submitted to both models independently.
          </p>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">PARALLEL INFERENCE</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ModelPanel
          title="MedGemma"
          subtitle="google/medgemma-1.5-4b-it • Port 8000"
          result={medgemma}
          accent="cyan"
        />
        <ModelPanel
          title="CheXOne"
          subtitle="CheXOne inference server • Port 8001"
          result={chexone}
          accent="violet"
        />
      </div>
    </div>
  );
}
