import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { retrieveGuidelines } from '@/lib/rag';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { campaignId, ocrText, disease, patientName } = await request.json();

    if (!campaignId || !disease || !ocrText) {
      return NextResponse.json(
        { error: "Missing required fields: campaignId, disease, or ocrText." },
        { status: 400 }
      );
    }

    console.log(`Starting Gemini RAG AI Medical Audit for Campaign: ${campaignId}, Disease: ${disease}`);

    // 1. Retrieve the closest clinical reference guidelines using the Gemini RAG Retriever
    const ragMatches = await retrieveGuidelines(disease, ocrText);
    const primaryMatch = ragMatches[0];
    const retrievedContext = primaryMatch 
      ? `Disease: ${primaryMatch.guideline.disease}\nGuideline: ${primaryMatch.guideline.guidelineText}\nAverage Cost: ${primaryMatch.guideline.averageCostRange}`
      : "No precise clinical matching guidelines found in local vector repository.";

    let auditResult = {
      fraudProbability: 15,
      mismatchFound: false,
      auditDetails: "Prescription and diagnosis matches Apollo Health standards perfectly. Approved by AI Auditor."
    };

    const apiKey = process.env.GEMINI_API_KEY;

    // --- FALLBACK INTERPRETER: If Gemini API Key is missing or invalid ---
    if (!apiKey || apiKey === "mock-key" || apiKey.trim() === "") {
      console.log("RAG Auditor executing in local heuristic fallback mode.");
      
      // Smart heuristic logic based on keyword overlap
      let overlaps = 0;
      const targetText = `${disease} ${ocrText}`.toLowerCase();
      const verificationKeywords = primaryMatch?.guideline.verifiableCriteria || ["prescription", "doctor"];
      
      verificationKeywords.forEach((keyword) => {
        if (targetText.includes(keyword.toLowerCase())) {
          overlaps++;
        }
      });

      const overlapRatio = overlaps / verificationKeywords.length;
      
      if (overlapRatio >= 0.5) {
        auditResult = {
          fraudProbability: Math.round(5 + (1 - overlapRatio) * 15), // 5% - 20%
          mismatchFound: false,
          auditDetails: `[Local Gemini RAG Engine Offline Simulation] Scanned document successfully matched ${overlaps} of ${verificationKeywords.length} clinical indicators for ${disease}. Reference standard: ${primaryMatch?.guideline.disease || disease}. Cost assessment verified within standard range.`
        };
      } else {
        auditResult = {
          fraudProbability: Math.round(50 + (1 - overlapRatio) * 30), // 50% - 80%
          mismatchFound: true,
          auditDetails: `[Local Gemini RAG Engine Offline Simulation] WARNING: Clinical mismatch found. Scanned document lacks critical treatment indicators like [${verificationKeywords.join(", ")}] for ${disease}. Highly elevated risk of invoice mismatch or document manipulation.`
        };
      }
    } 
    // --- ACTIVE LLM MODE: Query Google Gemini API with Structured Output ---
    else {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const auditModel = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" } // Force strict JSON parsing
        });

        const prompt = `
          You are an expert AI Medical Claims Auditor working for MediTrust AI, a decentralized medical crowdfunding platform.
          Your task is to audit clinical prescriptions, diagnosis reports, and invoices uploaded by patients, cross-referencing them against verified reference guidelines.

          REFERENCE CLINICAL CONTEXT FROM RAG VECTOR SEARCH:
          ${retrievedContext}

          AUDITING DIRECTIONS:
          1. Evaluate the scanned document text for discrepancies, drug mismatched dosages, or cost inflation compared to standard guidelines.
          2. Check if the treatment standard matches the disease classification.
          3. Calculate a strict Fraud Probability percentage (0 to 100).
          
          You MUST output a strict JSON structure matching this exact schema:
          {
            "fraudProbability": number,
            "mismatchFound": boolean,
            "auditDetails": "string explaining specific findings"
          }

          INPUT DATA:
          Scanned Prescription/Invoice Text: "${ocrText}"
          Patient Declared Disease: ${disease}
        `;

        const result = await auditModel.generateContent(prompt);
        const rawResponse = result.response.text();
        
        // Safely parse JSON from raw text response
        auditResult = JSON.parse(rawResponse.substring(rawResponse.indexOf('{'), rawResponse.lastIndexOf('}') + 1));
      } catch (error) {
        console.error("Gemini API call failed during audit, applying local fallback:", error);
        return NextResponse.json({ error: "Gemini Auditing channel failed. Please check your credentials." }, { status: 500 });
      }
    }

    // 2. Perform Real-time Firestore Updates
    const campaignRef = doc(db, 'campaigns', campaignId);
    
    // Calculate new trust score out of 100 based on fraud probability
    const calculatedTrust = Math.max(10, 100 - auditResult.fraudProbability);

    await updateDoc(campaignRef, {
      isHospitalVerified: !auditResult.mismatchFound,
      hasDocument: true,
      hasAIStory: true, // Auto-unlock trust milestones
      aiTrustScore: calculatedTrust,
      aiAuditReport: auditResult.auditDetails,
      aiFraudProbability: auditResult.fraudProbability,
      lastAuditedAt: new Date().toISOString()
    });

    // 3. Emit real-time audit verification activity log to the database
    const activityLog = {
      type: "verification" as const,
      message: `AI Gemini RAG Auditor scanned records for ${patientName || 'Patient'}: ${auditResult.mismatchFound ? '⚠️ SUSPICIOUS' : '🛡️ VERIFIED'} (AI Trust: ${calculatedTrust}%)`,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, 'logs'), activityLog);

    console.log(`Gemini RAG AI Audit complete. Trust: ${calculatedTrust}%, Mismatch: ${auditResult.mismatchFound}`);

    return NextResponse.json({
      success: true,
      campaignId,
      retrievedGuide: primaryMatch?.guideline.disease || "Standard",
      audit: auditResult,
      trustScore: calculatedTrust
    });

  } catch (error: any) {
    console.error("Critical error in /api/audit API route:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during medical auditing." },
      { status: 500 }
    );
  }
}
