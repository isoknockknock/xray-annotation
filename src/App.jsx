import React, { useState, useRef } from 'react';
import Header from './components/Header';
import XRayViewer from './components/XRayViewer';
import InferenceControls from './components/InferenceControls';
import EditableReport from './components/EditableReport';
import ExportModal from './components/ExportModal';

import { runMedGemmaInference, RADIOLOGIST_SYSTEM_PROMPT } from './services/medgemmaService';
import { Upload, FileUp, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [currentCase, setCurrentCase] = useState({ id: 'blank' });
  const [imageSrc, setImageSrc] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);

  // Editable Report State
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [triageLevel, setTriageLevel] = useState('');
  const [anatomicalBreakdown, setAnatomicalBreakdown] = useState({});
  
  // AI Baseline Tracking
  const [originalAiResult, setOriginalAiResult] = useState({
    findings: '',
    impression: '',
    triageLevel: ''
  });

  const [showRoiHeatmap, setShowRoiHeatmap] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  
  const [physicianInfo, setPhysicianInfo] = useState({
    name: 'Dr. Doctor Doctor, M.D.',
    license: 'NPI-xxxxxxxx'
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Select preset clinical case
  const handleSelectCase = (selectedCase) => {
    setCurrentCase(selectedCase);
    setImageSrc(selectedCase.imageUrl);
    setFindings(selectedCase.findings);
    setImpression(selectedCase.impression);
    setTriageLevel(selectedCase.triageLevel);
    setAnatomicalBreakdown(selectedCase.anatomicalBreakdown);
    setOriginalAiResult({
      findings: selectedCase.findings,
      impression: selectedCase.impression,
      triageLevel: selectedCase.triageLevel
    });
    setIsApproved(false);
  };

  // Upload custom image
  const handleFileUpload = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  // Keep the ORIGINAL File object.
  // This will later be sent to FastAPI.
  setImageFile(file);

  const reader = new FileReader();

  reader.onload = (event) => {
    const customSrc = event.target.result;

    const customCase = {
      id: `custom-${Date.now()}`,
      patientId: `PAT-CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: file.name.replace(/\.[^/.]+$/, ""),
      age: 48,
      gender: "Custom",
      view: "AP / PA View",
      scanType: "Uploaded Radiograph",
      studyDate: new Date().toISOString().split('T')[0],
      imageUrl: customSrc,
      title: file.name,

      triageLevel: "Pending",

      findings: "Awaiting MedGemma Inference...",
      impression: "Awaiting MedGemma Inference...",

      anatomicalBreakdown: {
        lungs: "Pending scan...",
        heart: "Pending scan...",
        pleura: "Pending scan...",
        bones: "Pending scan..."
      },

      rois: []
    };

    setCurrentCase(customCase);
    setImageSrc(customSrc);

    setFindings(
      "Awaiting MedGemma inference execution..."
    );

    setImpression(
      "MedGemma will analyze this uploaded radiograph."
    );

    setTriageLevel("Pending");

    setAnatomicalBreakdown({
      lungs: "Pending scan",
      heart: "Pending scan",
      pleura: "Pending scan",
      bones: "Pending scan"
    });

    setIsApproved(false);

    // Automatically analyze uploaded X-ray.
    handleRunInference({
      imageFile: file,
      customPrompt: RADIOLOGIST_SYSTEM_PROMPT
    });
  };

  reader.readAsDataURL(file);
};

  // Execute MedGemma Inference
 const handleRunInference = async ({
  customPrompt,
  temperature,
  imageFile: providedImageFile
}) => {

  const fileToAnalyze = providedImageFile || imageFile;

  if (!fileToAnalyze) {
    console.warn("No X-ray file available for inference.");
    return;
  }

  setIsAnalyzing(true);

  setAnalysisProgress({
    message: "Initializing MedGemma Vision Pipeline..."
  });

  try {

    const result = await runMedGemmaInference({
      imageFile: fileToAnalyze,
      customPrompt,
      temperature,

      onProgress: (p) => {
        setAnalysisProgress(p);
      }
    });


    // --------------------------------------------
    // Update report
    // --------------------------------------------

    setFindings(result.findings);
    setImpression(result.impression);

    if (result.triageLevel) {
      setTriageLevel(result.triageLevel);
    }


    // --------------------------------------------
    // Store original AI result
    // --------------------------------------------

    setOriginalAiResult({
      findings: result.findings,
      impression: result.impression,
      triageLevel: result.triageLevel || "Pending"
    });


    // --------------------------------------------
    // Update case data
    // --------------------------------------------

    setCurrentCase((previous) => ({
      ...previous,

      findings: result.findings,
      impression: result.impression,
      triageLevel: result.triageLevel || "Pending"
    }));

  } catch (err) {

    console.error("MedGemma Inference Error:", err);

    setFindings(
      "MedGemma inference failed."
    );

    setImpression(
      err.message || "Unable to process the X-ray."
    );

  } finally {

    setIsAnalyzing(false);
    setAnalysisProgress(null);
  }
};
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.dcm"
        className="hidden"
      />

      {/* Header */}
      <Header
        currentCase={currentCase}
        onSelectCase={handleSelectCase}
        onUploadClick={() => fileInputRef.current?.click()}
        isApproved={isApproved}
      />

      {/* Main Layout Grid */}
      <main className="flex-1 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-[1920px] mx-auto w-full">
        {/* Left Column: DICOM Canvas & Controls (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <XRayViewer
            imageSrc={imageSrc}
            caseData={currentCase}
            isAnalyzing={isAnalyzing}
            showRoiHeatmap={showRoiHeatmap}
            setShowRoiHeatmap={setShowRoiHeatmap}
          />
          <InferenceControls
            onRunInference={handleRunInference}
            isAnalyzing={isAnalyzing}
            analysisProgress={analysisProgress}
          />
        </div>

        {/* Right Column: Radiologist Editable Diagnostic Workstation (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <EditableReport
            currentCase={currentCase}
            findings={findings}
            setFindings={setFindings}
            impression={impression}
            setImpression={setImpression}
            triageLevel={triageLevel}
            setTriageLevel={setTriageLevel}
            anatomicalBreakdown={anatomicalBreakdown}
            setAnatomicalBreakdown={setAnatomicalBreakdown}
            originalAiResult={originalAiResult}
            isApproved={isApproved}
            setIsApproved={setIsApproved}
            physicianInfo={physicianInfo}
            setPhysicianInfo={setPhysicianInfo}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        caseData={currentCase}
        findings={findings}
        impression={impression}
        triageLevel={triageLevel}
        anatomicalBreakdown={anatomicalBreakdown}
        physicianInfo={physicianInfo}
        isApproved={isApproved}
        originalAiResult={originalAiResult}
        imageSrc={imageSrc}
      />
    </div>
  );
}

