/**
 * MedGemma 1.5 4B IT
 *
 * Sends the actual uploaded X-ray File to the
 * FastAPI MedGemma server running on chatur.
 */

const MEDGEMMA_API_URL =
  import.meta.env.VITE_MEDGEMMA_API_URL;

export const RADIOLOGIST_SYSTEM_PROMPT = `You are an expert chest radiologist.

Analyze this chest X-ray.

Return ONLY in the following format:

Findings:
<findings>

Impression:
<impression>`;

export function parseMedGemmaReport(rawReportText) {
  let findings = "";
  let impression = "";

  const findingsMatch = rawReportText.match(
    /Findings:\s*([\s\S]*?)(?=Impression:|$)/i
  );

  const impressionMatch = rawReportText.match(
    /Impression:\s*([\s\S]*)/i
  );

  if (findingsMatch?.[1]) {
    findings = findingsMatch[1].trim();
  }

  if (impressionMatch?.[1]) {
    impression = impressionMatch[1].trim();
  }

  if (!findings && !impression) {
    findings = rawReportText;
  }

  return {
    findings,
    impression
  };
}

export async function runMedGemmaInference({
  imageFile,
  customPrompt = RADIOLOGIST_SYSTEM_PROMPT,
  temperature = 0.2,
  onProgress = () => {}
}) {
  if (!imageFile) {
    throw new Error("No X-ray image was provided.");
  }

  onProgress({
    step: "preprocessing",
    message: "Preparing X-ray image..."
  });

  const formData = new FormData();

  // The FastAPI endpoint expects the field name "file"
  formData.append("file", imageFile);

  onProgress({
    step: "inference",
    message: "Sending X-ray to MedGemma GPU server..."
  });

  let response;

  try {
    response = await fetch(
      `${MEDGEMMA_API_URL}/analyze`,
      {
        method: "POST",
        body: formData
      }
    );
  } catch (error) {
    console.error("MedGemma connection error:", error);

    throw new Error(
      "Could not connect to the MedGemma server."
    );
  }

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `MedGemma server returned ${response.status}: ${errorText}`
    );
  }

  onProgress({
    step: "decoding",
    message: "Receiving MedGemma diagnostic report..."
  });

  const data = await response.json();

  return {
    rawReport: data.report || "",
    findings: data.findings || "",
    impression: data.impression || "",
    triageLevel: "Pending",
    confidence: null,
    modelName: "google/medgemma-1.5-4b-it"
  };
}