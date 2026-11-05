/**
 * CheXOne inference client.
 * Sends the original uploaded image to the CheXOne FastAPI server.
 */

const CHEXONE_API_URL =
  import.meta.env.VITE_CHEXONE_API_URL ||
  "https://8bgv3qnc-8001.inc1.devtunnels.ms";

function extractReportText(data) {
  if (typeof data === "string") return data;

  const findings = data?.findings ?? data?.Findings;
  const impression = data?.impression ?? data?.Impression;
  const report =
    data?.report ??
    data?.generated_text ??
    data?.output ??
    data?.response ??
    data?.result ??
    data?.text;

  const sections = [];
  if (findings) sections.push(`Findings:\n${findings}`);
  if (impression) sections.push(`Impression:\n${impression}`);

  if (sections.length) return sections.join("\n\n");
  if (typeof report === "string") return report;
  if (report != null) return JSON.stringify(report, null, 2);

  // Preserve the complete server response if its schema differs.
  return JSON.stringify(data, null, 2);
}

export async function runChexOneInference({ imageFile }) {
  if (!imageFile) {
    throw new Error("No X-ray image was provided to CheXOne.");
  }

  const formData = new FormData();
  formData.append("file", imageFile);

  let response;
  try {
    response = await fetch(`${CHEXONE_API_URL}/analyze`, {
      method: "POST",
      body: formData
    });
  } catch (error) {
    console.error("CheXOne connection error:", error);
    throw new Error("Could not connect to the CheXOne server.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `CheXOne server returned ${response.status}: ${errorText}`
    );
  }

  const contentType = response.headers.get("content-type") || "";
  let data;
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    reportText: extractReportText(data),
    rawResponse: data,
    modelName: "CheXOne"
  };
}
