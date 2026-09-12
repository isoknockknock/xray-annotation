export const SAMPLE_CASES = [
  {
    id: "case-001",
    patientId: "PAT-884920",
    patientName: "Eleanor Vance",
    age: 54,
    gender: "Female",
    view: "PA View (Posteroanterior)",
    scanType: "Chest X-Ray (Radiograph)",
    studyDate: new Date().toISOString().split('T')[0],
    imageUrl: "/samples/pneumonia.png",
    title: "Acute Right Lower Lobe Pneumonia",
    triageLevel: "High",
    findings: `The thoracic cage and soft tissues are within normal limits.
Cardiothoracic ratio is normal (CTR < 0.50).
Trachea is midline.
There is a distinct patchy, heterogeneous airspace opacity and consolidation observed in the right lower lung zone, with associated air bronchograms.
Left lung field is clear without focal consolidation or pneumothorax.
Costophrenic angles are sharp. Pleural spaces are clear.
No evidence of hilar enlargement or rib fractures.`,
    impression: `Acute focal airspace consolidation in the right lower lung lobe, highly suspicious for Right Lower Lobe Bacterial Pneumonia. Recommend clinical correlation, sputum culture, and follow-up radiograph in 4-6 weeks post-antibiotic treatment.`,
    anatomicalBreakdown: {
      lungs: "Focal consolidation in right lower lobe with air bronchograms. Left lung clear.",
      heart: "Normal cardiac size and silhouette contours. No cardiomegaly.",
      pleura: "Costophrenic angles preserved. No blunting or pleural effusion.",
      bones: "Intact bony framework. No rib fractures or osteolytic lesions.",
      diaphragm: "Hemidiaphragm domes well delineated."
    },
    rois: [
      { x: 55, y: 55, width: 28, height: 26, label: "RLL Airspace Opacity / Consolidation", severity: "High" }
    ]
  },
  {
    id: "case-002",
    patientId: "PAT-302194",
    patientName: "Arthur Pendelton",
    age: 42,
    gender: "Male",
    view: "PA View",
    scanType: "Chest X-Ray (Radiograph)",
    studyDate: new Date().toISOString().split('T')[0],
    imageUrl: "/samples/normal.png",
    title: "Unremarkable Normal Chest Radiograph",
    triageLevel: "Normal",
    findings: `Lungs are clear bilaterally without focal pulmonary consolidation, interstitial thickening, mass, or nodules.
Cardiomediastinal silhouette is normal in size, shape, and position.
Pulmonary vascularity is unremarkable.
Costophrenic sulci and pleural spaces are clear.
No pneumothorax or pleural effusion.
Osseous structures and thoracic soft tissues demonstrate no acute bony pathology.`,
    impression: `Normal adult chest radiograph. No acute cardiopulmonary disease.`,
    anatomicalBreakdown: {
      lungs: "Clear bilaterally without infiltrates, masses, or nodules.",
      heart: "Normal heart size and mediastinal contours.",
      pleura: "No pleural effusions or pneumothorax.",
      bones: "Osseous structures intact.",
      diaphragm: "Normal contour and position."
    },
    rois: []
  },
  {
    id: "case-003",
    patientId: "PAT-771029",
    patientName: "Margaret Hayes",
    age: 68,
    gender: "Female",
    view: "AP Bedside View",
    scanType: "Chest X-Ray (Radiograph)",
    studyDate: new Date().toISOString().split('T')[0],
    imageUrl: "/samples/pneumonia.png", // reusing with effusion overlay
    title: "Left Pleural Effusion with Atelectasis",
    triageLevel: "Moderate",
    findings: `Cardiothoracic ratio is mildly enlarged (CTR ~ 0.54).
Blunting of the left costophrenic angle with homogeneous crescentic opacity tracking along the lateral chest wall, indicative of moderate left-sided pleural effusion.
Associated subsegmental compressive atelectasis in the left lung base.
Right lung field remains clear with preserved vascular markings.
No mediastinal shift observed.`,
    impression: `Moderate left-sided pleural effusion with base atelectasis and mild cardiomegaly. Recommend decubitus radiograph or diagnostic thoracentesis if clinically indicated.`,
    anatomicalBreakdown: {
      lungs: "Compressive atelectasis at left base secondary to effusion.",
      heart: "Mild cardiomegaly observed.",
      pleura: "Left costophrenic angle blunting with pleural effusion.",
      bones: "No focal osteolytic lesion.",
      diaphragm: "Left hemidiaphragm partially obscured by effusion."
    },
    rois: [
      { x: 18, y: 62, width: 25, height: 28, label: "Left Pleural Fluid Collection", severity: "Moderate" }
    ]
  }
];
