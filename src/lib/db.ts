export interface Campaign {
  id?: string; // Firestore document ID
  patientName: string;
  title: string;
  disease: string;
  hospitalName: string;
  targetAmount: number;
  raisedAmount: number;
  story: string;
  daysLeft: number;
  isHospitalVerified: boolean;
  hasDocument: boolean;
  hasAIStory: boolean;
  createdAt: string;
}

export interface Donor {
  id?: string;
  name: string;
  amount: number;
  campaignId: string;
  campaignTitle: string;
  timestamp: string;
}

export interface ActivityLog {
  id?: string;
  type: "donation" | "verification" | "creation" | "transit";
  message: string;
  timestamp: string;
}

export interface MedicalReceipt {
  id?: string;
  receiptId: string;
  txHash: string;
  patientName: string;
  patientId: string;
  donorName: string;
  hospitalName: string;
  hospitalBillingId: string;
  disease: string;
  icdCode: string;
  amountInr: number;
  amountEth: string;
  paymentMethod: "upi" | "card" | "blockchain";
  taxExemptionCode: string;
  timestamp: string;
  qrChecksum: string;
  breakdown: {
    hospitalDepositPercent: number;
    surgicalSuppliesPercent: number;
    postOpCarePercent: number;
  };
}

export interface TriageAssessment {
  patientName: string;
  disease: string;
  symptomSeverity: number; // 1 to 10
  hospitalName: string;
  icdCode: string;
  estimatedCostRange: string;
  suggestedTarget: number;
  icuDays: number;
  urgencyLevel: "Critical" | "Moderate" | "Stable";
  recommendedCSR: string;
  timestamp: string;
}

export function calculateTriageMetrics(
  disease: string,
  severity: number,
  hospitalName: string
): {
  icdCode: string;
  estimatedCostRange: string;
  suggestedTarget: number;
  icuDays: number;
  urgencyLevel: "Critical" | "Moderate" | "Stable";
  recommendedCSR: string;
} {
  const cleanDisease = disease.toLowerCase();
  
  let icdCode = "ICD-10 General";
  let baseCost = 500000;
  let icuDays = 3;
  
  if (cleanDisease.includes("leukemia")) {
    icdCode = "ICD-10 C91.0";
    baseCost = 650000;
    icuDays = 7;
  } else if (cleanDisease.includes("bypass") || cleanDisease.includes("heart") || cleanDisease.includes("cardiac")) {
    icdCode = "ICD-10 Z95.1";
    baseCost = 450000;
    icuDays = 4;
  } else if (cleanDisease.includes("spinal") || cleanDisease.includes("spine")) {
    icdCode = "ICD-10 M43.1";
    baseCost = 800000;
    icuDays = 5;
  } else if (cleanDisease.includes("brain") || cleanDisease.includes("tumor")) {
    icdCode = "ICD-10 C71.9";
    baseCost = 900000;
    icuDays = 8;
  } else if (cleanDisease.includes("kidney") || cleanDisease.includes("renal")) {
    icdCode = "ICD-10 N18.6";
    baseCost = 750000;
    icuDays = 6;
  } else if (cleanDisease.includes("liver")) {
    icdCode = "ICD-10 K70.4";
    baseCost = 1800000;
    icuDays = 12;
  } else if (cleanDisease.includes("burn") || cleanDisease.includes("trauma")) {
    icdCode = "ICD-10 T31.4";
    baseCost = 550000;
    icuDays = 6;
  }

  const multiplier = 1 + (severity - 5) * 0.1;
  const suggestedTarget = Math.round(baseCost * Math.max(0.7, multiplier));
  const estimatedMin = Math.round(suggestedTarget * 0.85);
  const estimatedMax = Math.round(suggestedTarget * 1.25);

  let urgencyLevel: "Critical" | "Moderate" | "Stable" = "Moderate";
  if (severity >= 8 || suggestedTarget >= 750000) {
    urgencyLevel = "Critical";
  } else if (severity <= 4) {
    urgencyLevel = "Stable";
  }

  const csrFunds = [
    "Tata Trusts Emergency Healthcare Fund",
    "Reliance Foundation Medical Relief Pool",
    "Apollo Care Philanthropic Escrow",
    "PM National Relief Healthcare Reserve"
  ];
  const recommendedCSR = csrFunds[Math.floor(Math.random() * csrFunds.length)];

  return {
    icdCode,
    estimatedCostRange: `₹${estimatedMin.toLocaleString()} - ₹${estimatedMax.toLocaleString()}`,
    suggestedTarget,
    icuDays: Math.max(1, Math.round(icuDays * (severity / 5))),
    urgencyLevel,
    recommendedCSR
  };
}

// ---------------------------------------------------------
// Score Calculations (Pure Functions)
// ---------------------------------------------------------

export function calculateUrgencyScore(campaign: Campaign): number {
  const diseaseSeverities: Record<string, number> = {
    "Leukemia": 90,
    "Acute Lymphoblastic Leukemia": 90,
    "Cardiac Bypass": 85,
    "Heart Bypass Surgery": 85,
    "Spinal Reconstructive Surgery": 70,
    "Spinal Reconstructive": 70,
    "Brain Tumor": 95,
    "Kidney Transplant": 80,
    "Chemotherapy": 75,
    "Fracture": 30,
    "Hernia": 25,
  };

  const diseaseName = campaign.disease ? campaign.disease.trim() : "";
  const severity = diseaseSeverities[diseaseName] || 50;

  let daysUrgency = 0;
  if (campaign.daysLeft <= 3) daysUrgency = 95;
  else if (campaign.daysLeft <= 7) daysUrgency = 80;
  else if (campaign.daysLeft <= 15) daysUrgency = 60;
  else if (campaign.daysLeft <= 30) daysUrgency = 40;
  else daysUrgency = 20;

  const percentRaised = (campaign.raisedAmount / campaign.targetAmount) * 100;
  const fundingUrgency = Math.max(0, 100 - percentRaised);

  const score = Math.round(severity * 0.5 + daysUrgency * 0.3 + fundingUrgency * 0.2);
  return Math.min(100, Math.max(0, score));
}

export function getUrgencyCategory(score: number): {
  label: "Critical" | "Moderate" | "Stable";
  color: string;
  bgColor: string;
  icon: string;
} {
  if (score >= 80) {
    return {
      label: "Critical",
      color: "text-[#e66465] dark:text-[#f8a0a1]",
      bgColor: "bg-[#fdecec] dark:bg-[#3a1a1a]/30",
      icon: "⚡",
    };
  } else if (score >= 40) {
    return {
      label: "Moderate",
      color: "text-[#6b5b95] dark:text-[#b8a4d4]",
      bgColor: "bg-[#f5f0f8] dark:bg-[#2a1f3a]/30",
      icon: "⚠️",
    };
  } else {
    return {
      label: "Stable",
      color: "text-[#87c7a1] dark:text-[#a8d8b9]",
      bgColor: "bg-[#f0faf5] dark:bg-[#1a3328]/30",
      icon: "🟢",
    };
  }
}

export function calculateTrustScore(campaign: Campaign): number {
  let score = 50; // base score
  if (campaign.isHospitalVerified) score += 20;
  if (campaign.hasDocument) score += 15;
  if (campaign.hasAIStory) score += 15;
  return Math.min(100, score);
}

export function getPredictiveIndicator(campaign: Campaign): string {
  const urgency = calculateUrgencyScore(campaign);
  const percentRaised = (campaign.raisedAmount / campaign.targetAmount) * 100;

  if (percentRaised >= 100) {
    return "Goal achieved successfully!";
  }

  if (urgency >= 80) {
    return `Critical high-need case. High donor visibility. Estimated to complete within 4 days.`;
  } else if (urgency >= 50) {
    return `Healthy funding velocity. Estimated to reach the goal within 9 days.`;
  } else {
    return `Stable timeline. Projecting full funding within 15 days based on local search volume.`;
  }
}

// ---------------------------------------------------------
// Seed / Default Data
// ---------------------------------------------------------

export const defaultCampaigns: Campaign[] = [
  {
    patientName: "Aarav Sharma",
    title: "Support 6-Year-Old Aarav's Leukemia Treatment",
    disease: "Acute Lymphoblastic Leukemia",
    hospitalName: "Apollo Health City, Hyderabad",
    targetAmount: 650000,
    raisedAmount: 390000,
    story: "Aarav is an energetic 6-year-old child whose laughter used to light up our home. In March 2026, he was diagnosed with Acute Lymphoblastic Leukemia. He needs immediate bone marrow chemotherapy cycles over the next two months. His father is a daily wage storekeeper and has exhausted all savings. Your support can give Aarav a second chance at life.",
    daysLeft: 5,
    isHospitalVerified: true,
    hasDocument: true,
    hasAIStory: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    patientName: "Meera Nair",
    title: "Urgent Heart Bypass Surgery for Meera",
    disease: "Cardiac Bypass",
    hospitalName: "Fortis Hospital, Mumbai",
    targetAmount: 450000,
    raisedAmount: 120000,
    story: "Meera is a devoted mother and a secondary school teacher. Last week, she suffered a severe cardiac incident. Doctors have advised an emergency double-vessel bypass surgery within 12 days. The total cost is far beyond the family's capabilities. She has spent her life educating the future; please help her teach another day.",
    daysLeft: 10,
    isHospitalVerified: false,
    hasDocument: true,
    hasAIStory: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    patientName: "Rohan Das",
    title: "Spinal Reconstructive Surgery for Rohan",
    disease: "Spinal Reconstructive Surgery",
    hospitalName: "Manipal Hospital, Bangalore",
    targetAmount: 800000,
    raisedAmount: 680000,
    story: "Rohan met with a severe road accident that damaged his lumbar vertebrae, leaving him bedridden. The spinal reconstruction surgery will help him walk again. We have raised a significant amount but need that final crucial stretch to clear the hospital deposits and proceed with the operation scheduled for next week.",
    daysLeft: 4,
    isHospitalVerified: true,
    hasDocument: true,
    hasAIStory: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const defaultDonors: Donor[] = [
  {
    name: "Rajesh Kumar",
    amount: 50000,
    campaignId: "c1",
    campaignTitle: "Support 6-Year-Old Aarav's Leukemia Treatment",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Anita Desai",
    amount: 25000,
    campaignId: "c3",
    campaignTitle: "Spinal Reconstructive Surgery for Rohan",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    name: "Vikram Malhotra",
    amount: 75000,
    campaignId: "c1",
    campaignTitle: "Support 6-Year-Old Aarav's Leukemia Treatment",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const defaultLogs: ActivityLog[] = [
  {
    type: "creation",
    message: "Campaign 'Support 6-Year-Old Aarav's Leukemia Treatment' was created by patient's father.",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    type: "verification",
    message: "Apollo Health City, Hyderabad digitally verified campaign documents for Aarav Sharma.",
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    type: "donation",
    message: "Vikram Malhotra donated ₹75,000 to Aarav Sharma's treatment.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export const defaultReceipts: MedicalReceipt[] = [
  {
    receiptId: "RCP-2026-991823",
    txHash: "0x8f3a19b204c5e718a291f038472910ab38c49d1e",
    patientName: "Aarav Sharma",
    patientId: "MRN-AP-9921",
    donorName: "Vikram Malhotra",
    hospitalName: "Apollo Health City, Hyderabad",
    hospitalBillingId: "HOSP-APOLLO-992",
    disease: "Acute Lymphoblastic Leukemia",
    icdCode: "ICD-10 C91.0",
    amountInr: 75000,
    amountEth: "0.2500 ETH",
    paymentMethod: "blockchain",
    taxExemptionCode: "80G-MED-2026-AP882",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    qrChecksum: "VERIFIED-APOLLO-80G-0x8f3a19b204c5e718a291f038472910ab38c49d1e",
    breakdown: {
      hospitalDepositPercent: 60,
      surgicalSuppliesPercent: 20,
      postOpCarePercent: 20
    }
  },
  {
    receiptId: "RCP-2026-773419",
    txHash: "0x3e192a8b9f123c56a7d8e90123456789abcdef01",
    patientName: "Meera Nair",
    patientId: "MRN-FT-4412",
    donorName: "Anita Desai",
    hospitalName: "Fortis Hospital, Mumbai",
    hospitalBillingId: "HOSP-FORTIS-441",
    disease: "Cardiac Bypass",
    icdCode: "ICD-10 Z95.1",
    amountInr: 25000,
    amountEth: "0.0833 ETH",
    paymentMethod: "upi",
    taxExemptionCode: "80G-MED-2026-FT441",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    qrChecksum: "VERIFIED-FORTIS-80G-0x3e192a8b9f123c56a7d8e90123456789abcdef01",
    breakdown: {
      hospitalDepositPercent: 60,
      surgicalSuppliesPercent: 20,
      postOpCarePercent: 20
    }
  }
];

