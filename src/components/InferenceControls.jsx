import React, { useState } from 'react';
import { Play, Sparkles, Settings2, Sliders, ChevronDown, ChevronUp, Bot, FileCode } from 'lucide-react';
import { RADIOLOGIST_SYSTEM_PROMPT } from '../services/medgemmaService';

export default function InferenceControls({ 
  onRunInference, 
  isAnalyzing, 
  analysisProgress 
}) {
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(RADIOLOGIST_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(0.2);

  const handleExecute = () => {
    onRunInference({
      customPrompt,
      temperature
    });
  };

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              MedGemma 1.5 4B-IT Engine
            </h3>
            <p className="text-[11px] text-slate-400">Deep Vision-Language Radiology Inference</p>
          </div>
        </div>

        <button
          onClick={() => setShowPromptEditor(!showPromptEditor)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-medium transition-colors"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {showPromptEditor ? 'Hide Prompt Tuning' : 'Prompt & Parameters'}
          {showPromptEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Prompt Editor & Temperature Slider */}
      {showPromptEditor && (
        <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 space-y-3 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" /> System Prompt (Colab Notebook Format)
              </label>
              <button 
                onClick={() => setCustomPrompt(RADIOLOGIST_SYSTEM_PROMPT)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Reset Default
              </button>
            </div>
            <textarea
              rows={6}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] text-slate-300">Temperature ({temperature})</span>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded appearance-none accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress Notification Bar during inference */}
      {isAnalyzing && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-800/80 rounded-xl flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-cyan-300 font-mono">
              {analysisProgress?.message || 'Processing scan through MedGemma...'}
            </div>
            <div className="w-full bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Trigger Inference Button */}
      <button
        onClick={handleExecute}
        disabled={isAnalyzing}
        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
          isAnalyzing
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-extrabold shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-0.5'
        }`}
      >
        <Sparkles className="w-4 h-4 fill-black" />
        {isAnalyzing ? 'RUNNING MEDGEMMA INFERENCE...' : 'RUN MEDGEMMA DIAGNOSTIC INFERENCE'}
      </button>
    </div>
  );
}
