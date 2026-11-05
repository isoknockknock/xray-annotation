import React, { useState, useRef } from 'react';
import Header from './components/Header';
import XRayViewer from './components/XRayViewer';
import InferenceControls from './components/InferenceControls';
import EditableReport from './components/EditableReport';
import ExportModal from './components/ExportModal';

import { runMedGemmaInference, RADIOLOGIST_SYSTEM_PROMPT } from './services/medgemmaService';
import { runChexOneInference } from './services/chexoneService';
import ModelComparison from './components/ModelComparison';
import { Upload, FileUp, Sparkles, Activity } from 'lucide-react';

export default function App() {
  const [currentCase, setCurrentCase] = useState({ id: 'blank' });
  const [imageSrc, setImageSrc] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [modelResults, setModelResults] = useState({
    medgemma: { status: 'idle', text: '' },
    chexone: { status: 'idle', text: '' }
  });

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

   // Run both models against the exact same uploaded image.
  // Each result is tracked independently so one model can fail without hiding the other.
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
      message: "Sending the same X-ray to MedGemma and CheXOne..."
    });
    setModelResults({
      medgemma: { status: 'loading', text: '' },
      chexone: { status: 'loading', text: '' }
    });

    const medgemmaPromise = runMedGemmaInference({
      imageFile: fileToAnalyze,
      customPrompt,
      temperature,
      onProgress: (progress) => setAnalysisProgress(progress)
    });

    const chexonePromise = runChexOneInference({
      imageFile: fileToAnalyze
    });

    const [medgemmaOutcome, chexoneOutcome] = await Promise.allSettled([
      medgemmaPromise,
      chexonePromise
    ]);

    let medgemmaResult = null;

    if (medgemmaOutcome.status === 'fulfilled') {
      medgemmaResult = medgemmaOutcome.value;
      const reportText = [
        medgemmaResult.findings && `Findings:\n${medgemmaResult.findings}`,
        medgemmaResult.impression && `Impression:\n${medgemmaResult.impression}`
      ].filter(Boolean).join('\n\n') || medgemmaResult.rawReport || 'The model returned an empty report.';

      setModelResults((previous) => ({
        ...previous,
        medgemma: { status: 'success', text: reportText }
      }));

      // Keep the editable/approvable report based on MedGemma, as before.
      setFindings(medgemmaResult.findings || medgemmaResult.rawReport || '');
      setImpression(medgemmaResult.impression || '');
      setTriageLevel(medgemmaResult.triageLevel || 'Pending');
      setOriginalAiResult({
        findings: medgemmaResult.findings || medgemmaResult.rawReport || '',
        impression: medgemmaResult.impression || '',
        triageLevel: medgemmaResult.triageLevel || 'Pending'
      });
      setCurrentCase((previous) => ({
        ...previous,
        findings: medgemmaResult.findings || medgemmaResult.rawReport || '',
        impression: medgemmaResult.impression || '',
        triageLevel: medgemmaResult.triageLevel || 'Pending'
      }));
    } else {
      console.error("MedGemma Inference Error:", medgemmaOutcome.reason);
      setModelResults((previous) => ({
        ...previous,
        medgemma: {
          status: 'error',
          text: medgemmaOutcome.reason?.message || 'MedGemma inference failed.'
        }
      }));
    }

    if (chexoneOutcome.status === 'fulfilled') {
      setModelResults((previous) => ({
        ...previous,
        chexone: { status: 'success', text: chexoneOutcome.value.reportText }
      }));
    } else {
      console.error("CheXOne Inference Error:", chexoneOutcome.reason);
      setModelResults((previous) => ({
        ...previous,
        chexone: {
          status: 'error',
          text: chexoneOutcome.reason?.message || 'CheXOne inference failed.'
        }
      }));
    }

    setIsAnalyzing(false);
    setAnalysisProgress(null);
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

      {/* Main Layout */}
      <main className="flex-1 p-6 lg:p-10 max-w-[1920px] mx-auto w-full space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* X-ray viewer and shared inference controls */}
          <div className="lg:col-span-5 flex flex-col gap-4">
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

          {/* Both model outputs are shown side by side */}
          <div className="lg:col-span-7 min-w-0">
            <ModelComparison
              medgemma={modelResults.medgemma}
              chexone={modelResults.chexone}
            />
          </div>
        </div>

        {/* Editable report and approval workflow remains available below */}
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

