import { OpenAI } from 'openai';

export interface MedicalGuideline {
  id: string;
  disease: string;
  category: string;
  guidelineText: string;
  averageCostRange: string;
  verifiableCriteria: string[];
}

// -------------------------------------------------------------
// Curated Medical Reference Guidelines (RAG Knowledge Base)
// -------------------------------------------------------------
export const medicalGuidelines: MedicalGuideline[] = [
  {
    id: "guide_leukemia",
    disease: "Acute Lymphoblastic Leukemia",
    category: "Oncology",
    guidelineText: "Leukemia standard chemotherapy requires induction, consolidation, and maintenance phases. Essential medications include Vincristine, Daunorubicin, L-asparaginase, and Prednisone. Frequent complete blood counts (CBC), bone marrow aspirations, and supportive blood product transfusions are clinically mandatory. Costs typically center around oncology ward deposits, chemo-infusion supplies, and sterile isolation rooms.",
    averageCostRange: "₹5,00,000 - ₹9,00,000",
    verifiableCriteria: ["chemotherapy", "bone marrow", "vincristine", "oncology", "cbc"]
  },
  {
    id: "guide_cardiac",
    disease: "Cardiac Bypass",
    category: "Cardiology",
    guidelineText: "Coronary Artery Bypass Grafting (CABG) requires sternotomy, cardiopulmonary bypass (heart-lung machine), and vessel harvesting (saphenous vein or internal mammary artery). Mandatory items in invoices include cardiologist consultations, ICU recovery ventilator support (1-2 days), cardiac monitors, bypass tubing packs, and post-op anti-platelet therapy (Aspirin, Clopidogrel).",
    averageCostRange: "₹3,50,000 - ₹6,00,000",
    verifiableCriteria: ["cabg", "sternotomy", "bypass", "icu", "ventilator", "aspirin"]
  },
  {
    id: "guide_spinal",
    disease: "Spinal Reconstructive Surgery",
    category: "Orthopedics",
    guidelineText: "Spinal reconstructive surgeries or spinal fusion (lumbar/thoracic) require orthopedic pedicle screws, rods, bone grafts (autograft/allograft), fluoroscopy imaging guides, and neurological monitoring. Invoices must list implant costs, surgical theatre charges, post-op physiotherapy cycles, and pain-management anesthetics.",
    averageCostRange: "₹6,00,000 - ₹10,00,000",
    verifiableCriteria: ["pedicle screws", "spinal fusion", "implant", "graft", "physiotherapy"]
  },
  {
    id: "guide_brain_tumor",
    disease: "Brain Tumor",
    category: "Neurosurgery",
    guidelineText: "Craniotomy for brain tumor resection requires neuro-navigation guides, surgical microscopes, intensive care (ICU) telemetry, histopathology biopsy reports, and corticosteroid therapies (Dexamethasone) to control cerebral edema. Post-op MRIs are clinically required to verify resection borders.",
    averageCostRange: "₹7,00,000 - ₹12,00,000",
    verifiableCriteria: ["craniotomy", "resection", "dexamethasone", "biopsy", "mri", "neurology"]
  },
  {
    id: "guide_kidney",
    disease: "Kidney Transplant",
    category: "Nephrology",
    guidelineText: "Renal transplantation requires pre-op crossmatching, donor nephrectomy, recipient vascular anastomosis, and strict lifelong immunosuppressant induction (Tacrolimus, Mycophenolate, Cyclosporine). Hospital invoice sheets must cover operating room hours, donor recovery charges, and nephrology-specific lab panels.",
    averageCostRange: "₹7,00,000 - ₹11,00,000",
    verifiableCriteria: ["transplant", "nephrectomy", "tacrolimus", "immunosuppressant", "renal"]
  }
];

// Memory cache for guidelines vector embeddings to prevent redundant API calls
const embeddingsCache: Record<string, number[]> = {};

// Simple 1D vector operations in pure TypeScript
export function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * (b[i] || 0), 0);
}

export function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

// -------------------------------------------------------------
// RAG Retrieval Engine
// -------------------------------------------------------------
export async function retrieveGuidelines(
  disease: string,
  ocrText: string
): Promise<{ guideline: MedicalGuideline; score: number }[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const targetText = `${disease} ${ocrText}`.toLowerCase();

  // --- FALLBACK MODE: Pure TF-IDF/Keyword Matching if API Key is not set ---
  if (!apiKey || apiKey === "mock-key" || apiKey.trim() === "") {
    console.log("RAG Engine operating in offline Keyword Similarity Fallback mode.");
    
    const results = medicalGuidelines.map((guide) => {
      let score = 0;
      // Weight 1: Exact disease match or partial string matching
      if (guide.disease.toLowerCase().includes(disease.toLowerCase()) || disease.toLowerCase().includes(guide.disease.toLowerCase())) {
        score += 0.5;
      }
      
      // Weight 2: Count keyword overlaps in scanned OCR text
      let overlaps = 0;
      guide.verifiableCriteria.forEach((keyword) => {
        if (targetText.includes(keyword)) {
          overlaps++;
        }
      });
      
      const overlapScore = guide.verifiableCriteria.length > 0 
        ? (overlaps / guide.verifiableCriteria.length) * 0.5 
        : 0;
      
      return {
        guideline: guide,
        score: score + overlapScore
      };
    });

    // Sort descending by calculated score and return top 2
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  }

  // --- VECTOR MODE: OpenAI 1536-dimensional Embeddings & Cosine Similarity ---
  try {
    const openai = new OpenAI({ apiKey });

    // 1. Generate query embedding
    const queryResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: targetText
    });
    const queryVector = queryResponse.data[0].embedding;

    // 2. Load or compute embeddings for each reference guideline
    const results = await Promise.all(
      medicalGuidelines.map(async (guide) => {
        let guideVector = embeddingsCache[guide.id];

        if (!guideVector) {
          // Embed the clinical reference text
          const guideResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: `${guide.disease} ${guide.category} ${guide.guidelineText}`
          });
          guideVector = guideResponse.data[0].embedding;
          embeddingsCache[guide.id] = guideVector; // cache it in memory
        }

        // Calculate cosine distance
        const score = cosineSimilarity(queryVector, guideVector);
        return { guideline: guide, score };
      })
    );

    // Sort descending by cosine similarity score
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);
  } catch (error) {
    console.error("OpenAI RAG embedding generation failed, falling back to keywords:", error);
    // Graceful secondary fallback if OpenAI API returns rate limits, network timeouts, etc.
    return retrieveGuidelines(disease, "");
  }
}
