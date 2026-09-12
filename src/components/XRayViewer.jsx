import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Contrast, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw, 
  Layers, Maximize2, Sparkles, Sliders, ShieldAlert 
} from 'lucide-react';

export default function XRayViewer({ 
  imageSrc, 
  caseData, 
  isAnalyzing, 
  showRoiHeatmap, 
  setShowRoiHeatmap 
}) {
  const canvasRef = useRef(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(false);
  const [preset, setPreset] = useState('standard'); // standard, bone, lung, soft_tissue
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset image adjustments
  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setInvert(false);
    setPreset('standard');
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Windowing presets logic
  const handlePresetChange = (presetType) => {
    setPreset(presetType);
    if (presetType === 'standard') {
      setBrightness(100);
      setContrast(100);
      setInvert(false);
    } else if (presetType === 'bone') {
      setBrightness(120);
      setContrast(150);
      setInvert(false);
    } else if (presetType === 'lung') {
      setBrightness(90);
      setContrast(130);
      setInvert(false);
    } else if (presetType === 'inverted') {
      setBrightness(100);
      setContrast(110);
      setInvert(true);
    }
  };

  // Draw Canvas image & overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = () => {
      // Set canvas dimensions
      const containerWidth = canvas.parentElement.clientWidth || 600;
      const containerHeight = canvas.parentElement.clientHeight || 550;

      canvas.width = containerWidth;
      canvas.height = containerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context state for zoom/pan
      ctx.save();
      ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
      ctx.scale(zoom, zoom);

      // Calculate aspect ratio fit
      const scale = Math.min(containerWidth / img.width, containerHeight / img.height) * 0.9;
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;

      // Apply CSS-like filter adjustments to Canvas context
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`;
      
      // Draw image centered
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.filter = 'none'; // reset filter for annotations

      // Draw ROI bounding boxes and MedGemma heatmap annotations if enabled
      if (showRoiHeatmap && caseData?.rois && caseData.rois.length > 0) {
        caseData.rois.forEach((roi) => {
          // Convert percentage relative positions to canvas pixel points
          const roiX = -drawWidth / 2 + (roi.x / 100) * drawWidth;
          const roiY = -drawHeight / 2 + (roi.y / 100) * drawHeight;
          const roiW = (roi.width / 100) * drawWidth;
          const roiH = (roi.height / 100) * drawHeight;

          // Glowing heat region rectangle
          ctx.strokeStyle = roi.severity === 'High' ? '#ef4444' : '#f59e0b';
          ctx.lineWidth = 2.5 / zoom;
          ctx.setLineDash([6 / zoom, 4 / zoom]);
          ctx.strokeRect(roiX, roiY, roiW, roiH);

          // Heatmap semi-transparent fill
          const gradient = ctx.createRadialGradient(
            roiX + roiW / 2, roiY + roiH / 2, 5,
            roiX + roiW / 2, roiY + roiH / 2, Math.max(roiW, roiH) / 1.5
          );
          gradient.addColorStop(0, roi.severity === 'High' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.45)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(roiX, roiY, roiW, roiH);

          // Label Badge
          ctx.setLineDash([]);
          ctx.fillStyle = roi.severity === 'High' ? '#ef4444' : '#f59e0b';
          ctx.fillRect(roiX, roiY - 24 / zoom, Math.min(roiW + 20, 220 / zoom), 22 / zoom);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, 11 / zoom)}px Inter, sans-serif`;
          ctx.fillText(`MedGemma AI ROI: ${roi.label}`, roiX + 6 / zoom, roiY - 8 / zoom);
        });
      }

      ctx.restore();
    };
  }, [imageSrc, brightness, contrast, invert, zoom, pan, showRoiHeatmap, caseData]);

  // Mouse drag pan handler
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e) => {
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    // Only zoom if it was a true click, not a drag
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      setZoom(prev => Math.min(3, prev + 0.2));
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    // Only zoom out if it was a true right-click, not a drag
    if (Math.sqrt(dx * dx + dy * dy) < 5) {
      setZoom(prev => Math.max(0.5, prev - 0.2));
    }
  };

  return (
    <div className="glass-panel p-4 flex flex-col h-full rounded-2xl relative overflow-hidden border border-slate-800">
      {/* Top DICOM Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" /> DICOM RADIOGRAPH VIEWPORT
          </span>
        </div>

        {/* Adjustments & Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Preset buttons */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-800 text-[11px] font-medium">
            <button
              onClick={() => handlePresetChange('standard')}
              className={`px-3 py-1 rounded ${preset === 'standard' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Standard
            </button>
            <button
              onClick={() => handlePresetChange('bone')}
              className={`px-3 py-1 rounded ${preset === 'bone' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Bone
            </button>
            <button
              onClick={() => handlePresetChange('lung')}
              className={`px-3 py-1 rounded ${preset === 'lung' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Lung
            </button>
            <button
              onClick={() => handlePresetChange('inverted')}
              className={`px-3 py-1 rounded ${preset === 'inverted' ? 'bg-cyan-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Invert
            </button>
          </div>



          {/* Reset Zoom/Pan */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            title="Reset View Adjustments"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Canvas Container */}
      <div 
        className="dicom-canvas-container flex-1 min-h-[460px] relative cursor-grab active:cursor-grabbing border border-slate-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        {/* Scanning Beam Animation when MedGemma is analyzing */}
        {isAnalyzing && <div className="scan-line" />}



        <div className="absolute bottom-3 left-3 pointer-events-none text-[10px] font-mono text-slate-400 bg-black/60 p-2 rounded border border-slate-800 backdrop-blur-sm">
          <div>BRIGHTNESS: {brightness}% | CONTRAST: {contrast}%</div>
          <div>ZOOM: {(zoom * 100).toFixed(0)}% | INVERT: {invert ? 'YES' : 'NO'}</div>
        </div>

        {/* Interactive Canvas */}
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom Fine Tuning Sliders */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4 text-xs">
        {/* Brightness slider */}
        <div className="flex items-center gap-2 flex-1">
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-400 text-[11px] w-16">Bright</span>
          <input
            type="range"
            min="40"
            max="180"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Contrast slider */}
        <div className="flex items-center gap-2 flex-1">
          <Contrast className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-400 text-[11px] w-16">Contrast</span>
          <input
            type="range"
            min="40"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
            className="p-1 text-slate-400 hover:text-white"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono w-10 text-center text-cyan-300">{(zoom * 100).toFixed(0)}%</span>
          <button 
            onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
            className="p-1 text-slate-400 hover:text-white"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
