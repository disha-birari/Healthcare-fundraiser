"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Campaign, 
  Donor, 
  ActivityLog, 
  calculateUrgencyScore, 
  getUrgencyCategory, 
  calculateTrustScore, 
  getPredictiveIndicator,
  defaultCampaigns,
  defaultDonors,
  defaultLogs
} from "@/lib/db";


// -------------------------------------------------------------
// Beautiful inline SVGs for standard healthcare & dashboard icons
// -------------------------------------------------------------

function HeartIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
  );
}

function LightningIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function TrophyIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-5.25c-.621 0-1.125.504-1.125 1.125v3.375m9 0h-9M18 10.5h.75c.621 0 1.125-.504 1.125-1.125V6.75c0-.621-.504-1.125-1.125-1.125H18M6 10.5h-.75a1.125 1.125 0 0 1-1.125-1.125V6.75c0-.621.504-1.125 1.125-1.125H6M18 10.5V6.75M6 10.5V6.75M12 3v3.375m0-3.375a3 3 0 0 0-3 3v3.375m3-6.375a3 3 0 0 1 3 3v3.375" />
    </svg>
  );
}

function PlusIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SearchIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
    </svg>
  );
}

function FileTextIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3.094 15 8.187 14.187 9 9l.813 5.187L14.906 15l-5.093.904ZM18.017 4.902 17.5 8l-.517-3.098L13.9 4.38l3.083-.517L17.5 1l.517 2.863 3.083.517-3.083.522ZM19.813 18.904 19 24l-.813-5.096L13.094 18l5.093-.813L19 12l.813 5.187L24.906 18l-5.093.904Z" />
    </svg>
  );
}

export default function Home() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState<"donor" | "patient" | "admin" | "leaderboard">("donor");

  // Core Data States
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "Critical" | "Moderate" | "Stable">("all");

  // Patient Campaign Form Fields State
  const [patientName, setPatientName] = useState("");
  const [title, setTitle] = useState("");
  const [disease, setDisease] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [daysLeft, setDaysLeft] = useState<number>(14);
  const [story, setStory] = useState("");
  const [hasDocument, setHasDocument] = useState(false);
  const [hasAIStory, setHasAIStory] = useState(false);

  // Form Mock Processing states
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrLog, setOcrLog] = useState<string[]>([]);
  const [isAiWriting, setIsAiWriting] = useState(false);

  // Modal / Detail States
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(5000);
  const [donorName, setDonorName] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessAnimation, setIsSuccessAnimation] = useState(false);

  // Hospital Cost Breakdown Mock values
  const [expenseBreakdown, setExpenseBreakdown] = useState({
    surgery: 60,
    medicines: 20,
    icu: 20
  });
  const [surgeryStatus, setSurgeryStatus] = useState<"Scheduled" | "In Progress" | "Completed">("Scheduled");

  // Load from Cloud Firestore in Real-Time on mount
  useEffect(() => {
    // 1. Subscribe to campaigns
    const unsubscribeCampaigns = onSnapshot(
      query(collection(db, "campaigns"), orderBy("createdAt", "desc")), 
      (snapshot) => {
        const campaignList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Campaign));
        if (campaignList.length === 0) {
          // Seed cloud database if empty
          defaultCampaigns.forEach(async (c) => {
            await addDoc(collection(db, "campaigns"), c);
          });
        } else {
          setCampaigns(campaignList);
        }
      }
    );

    // 2. Subscribe to donors
    const unsubscribeDonors = onSnapshot(
      query(collection(db, "donors"), orderBy("timestamp", "desc")), 
      (snapshot) => {
        const donorList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
        if (donorList.length === 0) {
          // Seed cloud database if empty
          defaultDonors.forEach(async (d) => {
            await addDoc(collection(db, "donors"), d);
          });
        } else {
          setDonors(donorList);
        }
      }
    );

    // 3. Subscribe to logs
    const unsubscribeLogs = onSnapshot(
      query(collection(db, "logs"), orderBy("timestamp", "desc")), 
      (snapshot) => {
        const logList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
        if (logList.length === 0) {
          // Seed cloud database if empty
          defaultLogs.forEach(async (l) => {
            await addDoc(collection(db, "logs"), l);
          });
        } else {
          setLogs(logList.slice(0, 50));
        }
      }
    );

    return () => {
      unsubscribeCampaigns();
      unsubscribeDonors();
      unsubscribeLogs();
    };
  }, []);


  // -------------------------------------------------------------
  // Mock AI OCR Scan Simulation
  // -------------------------------------------------------------
  const triggerOcrScan = () => {
    setIsOcrScanning(true);
    setOcrLog([]);
    const steps = [
      "📷 Accessing medical document file...",
      "🔍 Extracted medical center: Apollo Hospitals, Mumbai",
      "📝 Detected primary diagnosis code: AML-92 (Acute Lymphoblastic Leukemia)",
      "💰 Extracted surgery & treatment estimate: ₹6,50,000",
      "✍️ Certified by Chief Oncologist Dr. R. K. Sen",
      "✅ Medical Certificate Verification Successful (Fraud Probability: 1.2%)"
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setOcrLog(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setTimeout(() => {
            // Auto populate fields
            setPatientName("Pranav Patil");
            setTitle("Urgent Chemotherapy and Treatment for 12-Year-Old Pranav");
            setDisease("Acute Lymphoblastic Leukemia");
            setHospitalName("Apollo Hospitals, Mumbai");
            setTargetAmount(650000);
            setDaysLeft(8);
            setHasDocument(true);
            setIsOcrScanning(false);
          }, 800);
        }
      }, (idx + 1) * 700);
    });
  };

  // -------------------------------------------------------------
  // Mock AI Story Writer Simulation
  // -------------------------------------------------------------
  const generateAiStory = () => {
    if (!patientName || !disease || !hospitalName) {
      alert("Please provide or AI-extract Patient Name, Disease, and Hospital Name first!");
      return;
    }
    setIsAiWriting(true);
    setTimeout(() => {
      const generated = `${patientName} is a brave individual currently struggling with ${disease} at ${hospitalName}. In a sudden turn of events, this devastating diagnosis has turned the family's world upside down. The doctor has advised immediate treatment and surgery within days to guarantee survival. The family has pooled all their savings but falls critical of the target goal. Your donation, no matter how small, represents hope, health, and a lifesaver for ${patientName}. Please stand by us during this dark hour.`;
      setStory(generated);
      setHasAIStory(true);
      setIsAiWriting(false);
    }, 1500);
  };

  // -------------------------------------------------------------
  // Patient Submit Campaign Form
  // -------------------------------------------------------------
  const submitCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !title || !disease || !hospitalName || targetAmount <= 0) {
      alert("Please fill in all core fields!");
      return;
    }

    const newCampaign: Campaign = {
      patientName,
      title,
      disease,
      hospitalName,
      targetAmount,
      raisedAmount: 0,
      story: story || "No story description provided yet.",
      daysLeft,
      isHospitalVerified: false,
      hasDocument,
      hasAIStory,
      createdAt: new Date().toISOString()
    };

    try {
      // Add document to Cloud Firestore
      await addDoc(collection(db, "campaigns"), newCampaign);

      // Register activity log in Cloud Firestore
      await addDoc(collection(db, "logs"), {
        type: "creation",
        message: `New Campaign '${title}' was created by patient ${patientName}.`,
        timestamp: new Date().toISOString()
      });

      // Reset Form
      setPatientName("");
      setTitle("");
      setDisease("");
      setHospitalName("");
      setTargetAmount(0);
      setDaysLeft(14);
      setStory("");
      setHasDocument(false);
      setHasAIStory(false);

      // Navigate to live feed
      setActiveTab("donor");
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Cloud sync failed. Verify your database configurations.");
    }
  };

  // -------------------------------------------------------------
  // Mock Payment & Donation processing
  // -------------------------------------------------------------
  const openDonationModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDonationAmount(5000);
    setDonorName("");
    setIsPaymentModalOpen(true);
    setIsSuccessAnimation(false);
  };

  const processMockDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName) {
      alert("Please enter your name!");
      return;
    }
    if (donationAmount <= 0 || !selectedCampaign) return;

    setIsSuccessAnimation(true);

    try {
      // 1. Update the campaign's raised amount in Firestore
      const campaignRef = doc(db, "campaigns", selectedCampaign.id!);
      await updateDoc(campaignRef, {
        raisedAmount: Math.min(selectedCampaign.targetAmount, selectedCampaign.raisedAmount + donationAmount)
      });

      // 2. Add to global Donors collection in Firestore
      const newDonor: Donor = {
        name: donorName,
        amount: donationAmount,
        campaignId: selectedCampaign.id!,
        campaignTitle: selectedCampaign.title,
        timestamp: new Date().toISOString()
      };
      await addDoc(collection(db, "donors"), newDonor);

      // 3. Register transaction log in Firestore
      await addDoc(collection(db, "logs"), {
        type: "donation",
        message: `${donorName} donated ₹${donationAmount.toLocaleString()} to ${selectedCampaign.patientName}.`,
        timestamp: new Date().toISOString()
      });

      // 4. Reset & Close
      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setIsSuccessAnimation(false);
        setSelectedCampaign(null);
      }, 1500);
    } catch (err) {
      console.error("Donation failed:", err);
      alert("Cloud sync failed. Verification of transaction failed.");
      setIsSuccessAnimation(false);
    }
  };

  // -------------------------------------------------------------
  // Admin Toggle Verification
  // -------------------------------------------------------------
  const toggleVerification = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      const nextStatus = !campaign.isHospitalVerified;
      
      // Update campaign in Cloud Firestore
      await updateDoc(campaignRef, {
        isHospitalVerified: nextStatus
      });

      // Log verification status
      await addDoc(collection(db, "logs"), {
        type: "verification",
        message: `Hospital verification status for '${campaign.title}' set to ${nextStatus ? "VERIFIED" : "UNVERIFIED"}.`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Verification toggle failed:", err);
      alert("Cloud update failed. Verify hospital status connection.");
    }
  };

  // Calculate Header statistics
  const totalRaised = campaigns.reduce((acc, curr) => acc + curr.raisedAmount, 0);
  const totalVerified = campaigns.filter(c => c.isHospitalVerified).length;
  const uniqueDonorsCount = new Set(donors.map(d => d.name)).size;
  const averageTrust = campaigns.length 
    ? Math.round(campaigns.reduce((acc, curr) => acc + calculateTrustScore(curr), 0) / campaigns.length)
    : 0;

  // Filter & Search Campaigns for Feed
  const filteredCampaigns = campaigns.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      c.patientName.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.disease.toLowerCase().includes(query) ||
      c.hospitalName.toLowerCase().includes(query);

    const urgencyScore = calculateUrgencyScore(c);
    const category = getUrgencyCategory(urgencyScore).label;
    const matchesUrgency = urgencyFilter === "all" || category === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  // Top Donors Calculation (Group by Donor Name and sort descending)
  const groupedDonors = donors.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.name] = (acc[curr.name] || 0) + curr.amount;
    return acc;
  }, {});

  const sortedLeaderboard = Object.entries(groupedDonors)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans pb-12">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-teal-600 to-emerald-400 rounded-xl text-white shadow-md shadow-teal-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-teal-800 to-emerald-600 bg-clip-text text-transparent leading-none">
                MediTrust AI
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block mt-0.5">
                AI + Transparency + Trust
              </span>
            </div>
          </div>

          {/* Navigation tabs */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("donor")}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "donor" 
                  ? "bg-white text-teal-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HeartIcon className="w-4 h-4" />
              <span>Browse Cases</span>
            </button>
            <button
              onClick={() => setActiveTab("patient")}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "patient" 
                  ? "bg-white text-teal-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Appeal</span>
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "admin" 
                  ? "bg-white text-teal-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Verification Hub</span>
            </button>
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "leaderboard" 
                  ? "bg-white text-teal-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrophyIcon className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Real-time Platform statistics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Total Funds Raised</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-black text-slate-900">₹{totalRaised.toLocaleString()}</span>
              <span className="text-xs text-emerald-600 font-bold">100% Secure</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full w-[80%]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Verified Cases</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-black text-slate-900">{totalVerified}</span>
              <span className="text-xs text-teal-600 font-bold">Hospital Signed</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full w-[70%]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Active Supporters</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-black text-slate-900">{uniqueDonorsCount}</span>
              <span className="text-xs text-emerald-600 font-bold">Round-the-clock</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full w-[65%]" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-tr from-teal-50/50 to-emerald-50/50">
            <span className="text-xs font-semibold text-teal-800 block uppercase tracking-wider">Platform Trust Index</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-2xl font-black text-teal-900">{averageTrust}%</span>
              <span className="text-xs text-teal-600 font-bold">Highly Genuine</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full" style={{ width: `${averageTrust}%` }} />
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------
            TAB: DONOR (BROWSE AND DONATE FLOW)
            ------------------------------------------------------------- */}
        {activeTab === "donor" && (
          <section className="space-y-6">
            
            {/* Search & Filter Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by diagnosis, hospital name, or patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Need Level:</span>
                <button
                  onClick={() => setUrgencyFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    urgencyFilter === "all"
                      ? "bg-teal-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Cases
                </button>
                <button
                  onClick={() => setUrgencyFilter("Critical")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    urgencyFilter === "Critical"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                  }`}
                >
                  <span>⚡ Critical</span>
                </button>
                <button
                  onClick={() => setUrgencyFilter("Moderate")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    urgencyFilter === "Moderate"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  <span>⚠️ Moderate</span>
                </button>
                <button
                  onClick={() => setUrgencyFilter("Stable")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    urgencyFilter === "Stable"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <span>🟢 Stable</span>
                </button>
              </div>
            </div>

            {/* Campaign Cards Grid */}
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-400 mb-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
                </svg>
                <h3 className="text-base font-bold text-slate-700">No campaigns found</h3>
                <p className="text-xs text-slate-500 mt-1">Try modifying your keyword search or selected filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredCampaigns.map(c => {
                  const percentRaised = Math.round((c.raisedAmount / c.targetAmount) * 100);
                  const urgencyScore = calculateUrgencyScore(c);
                  const urgencyCat = getUrgencyCategory(urgencyScore);
                  const trustScore = calculateTrustScore(c);

                  return (
                    <div 
                      key={c.id} 
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                    >
                      {/* Card Header image placeholder with Gradient */}
                      <div className="h-44 bg-gradient-to-tr from-teal-800 to-emerald-600 relative p-5 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center space-x-1 bg-white/20 backdrop-blur-md`}>
                            <span>{urgencyCat.icon}</span>
                            <span>{urgencyCat.label} Case</span>
                          </span>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            trustScore >= 80 ? "bg-emerald-500/95" : "bg-teal-500/90"
                          }`}>
                            🛡️ {trustScore}% Trust
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded">
                              {c.disease}
                            </span>
                            {c.isHospitalVerified && (
                              <span className="text-[10px] font-bold bg-emerald-500/30 border border-emerald-400 text-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                                <span>✔ Verified</span>
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-base mt-2 group-hover:text-emerald-300 transition-colors line-clamp-1">
                            {c.title}
                          </h3>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {c.story}
                        </p>

                        <div className="space-y-3">
                          {/* Progress */}
                          <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                              <span>Raised: ₹{c.raisedAmount.toLocaleString()}</span>
                              <span>{percentRaised}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-teal-600 to-emerald-400 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(100, percentRaised)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                              <span>Goal: ₹{c.targetAmount.toLocaleString()}</span>
                              <span className="font-bold text-slate-700">{c.daysLeft} days left</span>
                            </div>
                          </div>

                          {/* Predictive success text */}
                          <div className="bg-teal-50 border border-teal-100/50 p-2.5 rounded-xl text-[10px] text-teal-800 leading-snug flex items-start space-x-1.5">
                            <SparklesIcon className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">AI Funding Projection:</span>
                              {getPredictiveIndicator(c)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <button
                            onClick={() => setSelectedCampaign(c)}
                            className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2.5 rounded-xl text-xs font-bold transition-all text-center"
                          >
                            Details & Audits
                          </button>
                          <button
                            onClick={() => openDonationModal(c)}
                            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-500 text-white hover:from-teal-700 hover:to-emerald-600 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-600/10 hover:shadow-lg transition-all"
                          >
                            Donate Securely
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* -------------------------------------------------------------
            TAB: PATIENT (CREATE CAMPAIGN FLOW)
            ------------------------------------------------------------- */}
        {activeTab === "patient" && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Column */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Create Fundraising Campaign</h2>
                <p className="text-xs text-slate-500 mt-1">Setup patient details, goals, and leverage AI analysis to increase trust factors.</p>
              </div>

              {/* Mock OCR Scan Box */}
              <div className="border-2 border-dashed border-teal-200 bg-teal-50/20 p-5 rounded-2xl text-center space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider">🌟 Hackathon Shortcut: Mock AI Medical OCR Scan</h3>
                  <p className="text-[11px] text-slate-600 mt-1">Simulate hospital prescription invoice parsing to auto-populate the form instantly and boost verification trust!</p>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={triggerOcrScan}
                    disabled={isOcrScanning}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 shadow-md shadow-teal-600/10 transition-all disabled:opacity-50"
                  >
                    <FileTextIcon className="w-4 h-4" />
                    <span>{isOcrScanning ? "Scanning Invoice Documents..." : "Simulate Prescription Upload & Scan"}</span>
                  </button>
                </div>

                {isOcrScanning && (
                  <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-left text-[11px] font-mono space-y-1.5 shadow-inner max-h-48 overflow-y-auto animate-pulse">
                    <div className="text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-1">⚡ medi-ocr-engine v2.0.4 - scan initialized</div>
                    {ocrLog.map((log, index) => (
                      <div key={index} className="transition-all duration-300">{log}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* Standard Form */}
              <form onSubmit={submitCampaign} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Medical Diagnosis / Disease</label>
                    <input
                      type="text"
                      placeholder="e.g. Acute Lymphoblastic Leukemia"
                      value={disease}
                      onChange={(e) => setDisease(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Fundraiser Campaign Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Emergency bone marrow transplant treatment funding required"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 block mb-1">Hospital Hospital & Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Apollo Health City, Hyderabad"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Fundraising Target (INR)</label>
                    <input
                      type="number"
                      placeholder="Goal in ₹"
                      value={targetAmount || ""}
                      onChange={(e) => setTargetAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Days Remaining for Surgery</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={daysLeft || ""}
                      onChange={(e) => setDaysLeft(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Documents Uploaded</label>
                    <div className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id="hasDoc"
                        checked={hasDocument}
                        onChange={(e) => setHasDocument(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <label htmlFor="hasDoc" className="text-xs text-slate-600 font-semibold cursor-pointer">
                        Prescription / Hospital Invoice Attached
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-600">Emotional Story Appeal</label>
                    <button
                      type="button"
                      onClick={generateAiStory}
                      disabled={isAiWriting}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1 disabled:opacity-50"
                    >
                      <SparklesIcon className="w-3.5 h-3.5 text-teal-500" />
                      <span>{isAiWriting ? "Drafting with AI..." : "Generate AI Patient Story"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Provide detailed descriptions of your medical situation and fundraising urgency, or use the Generate AI Patient Story button..."
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white hover:from-teal-800 hover:to-emerald-700 py-3 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-lg transition-all"
                  >
                    Publish Healthcare Appeal Campaign
                  </button>
                </div>
              </form>
            </div>

            {/* AI Real-time calculations Preview Sidebar */}
            <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-800 pb-3 mb-5">
                  <SparklesIcon className="w-5 h-5 text-teal-400" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-400">Medi-AI Core Analytics</h3>
                </div>

                {/* Score calculators preview box */}
                <div className="space-y-6">
                  {/* Need/Urgency Level Preview */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Predictive Urgency Level</span>
                    {(() => {
                      const mockCampaign: Campaign = {
                        id: "temp",
                        patientName: patientName || "Patient",
                        title: title || "New Appeal",
                        disease: disease || "Other",
                        hospitalName: hospitalName || "Hospital",
                        targetAmount: targetAmount || 100000,
                        raisedAmount: 0,
                        story: story || "",
                        daysLeft: daysLeft || 14,
                        isHospitalVerified: false,
                        hasDocument,
                        hasAIStory,
                        createdAt: new Date().toISOString()
                      };
                      const urgency = calculateUrgencyScore(mockCampaign);
                      const cat = getUrgencyCategory(urgency);

                      return (
                        <div className="mt-2.5">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold flex items-center space-x-1">
                              <span>{cat.icon}</span>
                              <span className={cat.color}>{cat.label} ({urgency}%)</span>
                            </span>
                            <span className="text-slate-400 font-semibold">Weight: 0.5 severity</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-teal-400 h-full rounded-full transition-all duration-300" style={{ width: `${urgency}%` }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Trust Score Preview */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Calculated Platform Trust Index</span>
                    {(() => {
                      const mockCampaign: Campaign = {
                        id: "temp",
                        patientName: patientName || "Patient",
                        title: title || "New Appeal",
                        disease: disease || "Other",
                        hospitalName: hospitalName || "Hospital",
                        targetAmount: targetAmount || 100000,
                        raisedAmount: 0,
                        story: story || "",
                        daysLeft: daysLeft || 14,
                        isHospitalVerified: false,
                        hasDocument,
                        hasAIStory,
                        createdAt: new Date().toISOString()
                      };
                      const trust = calculateTrustScore(mockCampaign);

                      return (
                        <div className="mt-2.5 bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-teal-400">Total Trust Score:</span>
                            <span className="font-black text-white">{trust}%</span>
                          </div>
                          
                          <div className="text-[10px] text-slate-400 space-y-1 pt-1.5 border-t border-slate-800">
                            <div className="flex justify-between">
                              <span>Base Score:</span>
                              <span className="text-white">50%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Hospital Verification:</span>
                              <span className={mockCampaign.isHospitalVerified ? "text-emerald-400 font-bold" : "text-slate-500"}>+20%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>OCR Document Attach:</span>
                              <span className={mockCampaign.hasDocument ? "text-emerald-400 font-bold" : "text-slate-500"}>+15%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>AI Generated Story:</span>
                              <span className={mockCampaign.hasAIStory ? "text-emerald-400 font-bold" : "text-slate-500"}>+15%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Machine Learning success timeline */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block mb-2">Predictive Funding Probability</span>
                    {(() => {
                      const mockCampaign: Campaign = {
                        id: "temp",
                        patientName: patientName || "Patient",
                        title: title || "New Appeal",
                        disease: disease || "Other",
                        hospitalName: hospitalName || "Hospital",
                        targetAmount: targetAmount || 100000,
                        raisedAmount: 0,
                        story: story || "",
                        daysLeft: daysLeft || 14,
                        isHospitalVerified: false,
                        hasDocument,
                        hasAIStory,
                        createdAt: new Date().toISOString()
                      };
                      return (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 border border-slate-800 p-3 rounded-xl italic">
                          "{getPredictiveIndicator(mockCampaign)}"
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Hackathon Judge Tip */}
              <div className="mt-8 border-t border-slate-800 pt-4 text-[10px] text-teal-400 flex items-center space-x-1.5">
                <span className="text-base">💡</span>
                <p className="leading-snug">
                  <strong>Judge Pro Tip:</strong> Upload a medical prescription document via our simulated OCR scanner to instantly populate the data and gain the Trust Score bonuses automatically!
                </p>
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            TAB: ADMIN / HOSPITAL CENTRAL PORTAL
            ------------------------------------------------------------- */}
        {activeTab === "admin" && (
          <section className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Admin Verification list */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Hospital Verification Console</h2>
                  <p className="text-xs text-slate-500 mt-1">Review pending healthcare campaigns, audit invoices, and toggle authentic verification flags.</p>
                </div>

                <div className="space-y-4">
                  {campaigns.map(c => {
                    const trust = calculateTrustScore(c);
                    const urgency = calculateUrgencyScore(c);
                    const urgencyCat = getUrgencyCategory(urgency);

                    return (
                      <div key={c.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-800">{c.patientName}</span>
                            <span className="text-[10px] bg-slate-200/80 px-2 py-0.5 rounded text-slate-600 font-bold">{c.disease}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${urgencyCat.bgColor} ${urgencyCat.color}`}>
                              {urgencyCat.icon} {urgencyCat.label}
                            </span>
                          </div>
                          
                          <h4 className="text-xs font-bold text-slate-700 line-clamp-1">{c.title}</h4>
                          <span className="text-[10px] text-slate-500 block">🏥 {c.hospitalName}</span>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          {/* Trust metrics */}
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">Trust Indicator</span>
                            <span className="text-xs font-black text-slate-800">{trust}% Score</span>
                          </div>

                          {/* Verification Switch Button */}
                          <button
                            onClick={() => toggleVerification(c.id!)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all border ${
                              c.isHospitalVerified
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
                            }`}
                          >
                            {c.isHospitalVerified ? "✔ Doctor Verified" : "Verify Campaign"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hospital Expense Breakdown Simulator */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center space-x-1.5">
                      <span>🏥</span>
                      <span>Hospital Partner Portal</span>
                    </h2>
                    <p className="text-[10px] text-slate-500 mt-1">Audit active expense allocations and update actual surgery statuses dynamically.</p>
                  </div>

                  {/* Dynamic cost slider mock inputs */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">Expense Usage Allocations (Simulated)</span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Surgery & Doctor Fees:</span>
                          <span className="font-bold">{expenseBreakdown.surgery}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          value={expenseBreakdown.surgery}
                          onChange={(e) => setExpenseBreakdown(prev => ({ ...prev, surgery: Number(e.target.value) }))}
                          className="w-full accent-teal-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Medicines & Lab Scans:</span>
                          <span className="font-bold">{expenseBreakdown.medicines}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          value={expenseBreakdown.medicines}
                          onChange={(e) => setExpenseBreakdown(prev => ({ ...prev, medicines: Number(e.target.value) }))}
                          className="w-full accent-teal-600"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>ICU & Ward Stay:</span>
                          <span className="font-bold">{expenseBreakdown.icu}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="80"
                          value={expenseBreakdown.icu}
                          onChange={(e) => setExpenseBreakdown(prev => ({ ...prev, icu: Number(e.target.value) }))}
                          className="w-full accent-teal-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Treatment status tracker */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">Surgery Treatment Tracker</span>
                    <div className="grid grid-cols-3 gap-1">
                      {["Scheduled", "In Progress", "Completed"].map(status => (
                        <button
                          key={status}
                          onClick={() => setSurgeryStatus(status as any)}
                          className={`py-1.5 rounded text-[10px] font-bold transition-all border ${
                            surgeryStatus === status
                              ? "bg-teal-600 border-teal-600 text-white"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-[10px] text-slate-600 leading-snug">
                  <strong>Live Synchronization:</strong> Cost percentages and scheduling status are simulated on the donor detail panels immediately.
                </div>
              </div>
            </div>

            {/* Blockchain-Style Transaction Ledger */}
            <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl shadow-lg font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <span className="animate-ping w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest">MediTrust Transparent Ledger Stream (Local Node)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">Consensus: ACTIVE</span>
              </div>

              <div className="space-y-2 text-[11px] max-h-60 overflow-y-auto">
                {logs.map((log, index) => {
                  const simulatedHash = "0x" + Math.floor(Math.random() * 10000000).toString(16).padEnd(8, "f") + "..." + Math.floor(Math.random() * 1000).toString(16);
                  return (
                    <div key={log.id} className="flex flex-col md:flex-row md:justify-between border-b border-slate-800/50 py-1.5 hover:bg-slate-850 transition-colors">
                      <div className="flex items-start space-x-2">
                        <span className="text-teal-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                      <span className="text-slate-500 text-[10px] md:text-right shrink-0 mt-0.5 md:mt-0">
                        Block hash: {simulatedHash}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* -------------------------------------------------------------
            TAB: LEADERBOARD (TOP DONORS)
            ------------------------------------------------------------- */}
        {activeTab === "leaderboard" && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Top Donors List (Leaderboard) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Top Donors Recognition Leaderboard</h2>
                <p className="text-xs text-slate-500 mt-1">Honoring our top financial heroes supporting critical medical treatments.</p>
              </div>

              {sortedLeaderboard.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No donation transactions registered yet.</div>
              ) : (
                <div className="space-y-3">
                  {sortedLeaderboard.map((d, index) => {
                    let medal = "";
                    let medalBg = "bg-slate-50 border-slate-200";
                    if (index === 0) {
                      medal = "🥇";
                      medalBg = "bg-amber-50 border-amber-200 text-amber-900";
                    } else if (index === 1) {
                      medal = "🥈";
                      medalBg = "bg-slate-100 border-slate-300 text-slate-900";
                    } else if (index === 2) {
                      medal = "🥉";
                      medalBg = "bg-orange-50 border-orange-200 text-orange-900";
                    }

                    return (
                      <div 
                        key={index} 
                        className={`border rounded-2xl p-4 flex items-center justify-between transition-all hover:scale-[1.01] ${medalBg}`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <span className="text-lg font-bold w-6 text-center">
                            {medal || `#${index + 1}`}
                          </span>
                          <div>
                            <span className="font-extrabold text-sm block">{d.name}</span>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">Verified Medical Philanthropist</span>
                          </div>
                        </div>

                        <span className="text-base font-black text-slate-800">
                          ₹{d.amount.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Live Activity Stream */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">Recent Contributions</h2>
                <p className="text-[10px] text-slate-500 mt-1">Real-time public donor transactions ledger feed updates.</p>
              </div>

              <div className="space-y-4">
                {donors.slice(0, 5).map(d => (
                  <div key={d.id} className="border-b border-slate-100 pb-3 last:border-b-0 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{d.name}</span>
                      <span className="font-black text-emerald-600">+₹{d.amount.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">Support for: {d.campaignTitle}</p>
                    <span className="text-[9px] text-slate-400 block">{new Date(d.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* -------------------------------------------------------------
          MODAL: CAMPAIGN DETAILS (AUDITS & EXPENSES)
          ------------------------------------------------------------- */}
      {selectedCampaign && !isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full border border-teal-200/50">
                  🛡️ {calculateTrustScore(selectedCampaign)}% Trust
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                  getUrgencyCategory(calculateUrgencyScore(selectedCampaign)).bgColor
                } ${getUrgencyCategory(calculateUrgencyScore(selectedCampaign)).color}`}>
                  Need: {getUrgencyCategory(calculateUrgencyScore(selectedCampaign)).label}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug pr-8">
                {selectedCampaign.title}
              </h3>
              <span className="text-xs text-slate-500 font-semibold block mt-1">
                🏥 Hospital Location: {selectedCampaign.hospitalName}
              </span>
            </div>

            {/* Story */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Campaign Appeal & Story</span>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-150 font-serif">
                "{selectedCampaign.story}"
              </p>
            </div>

            {/* AI Trust auditing breakdown */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-inner space-y-4 font-mono">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 mb-2">
                <SparklesIcon className="w-4.5 h-4.5 text-teal-400 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-widest text-teal-400">Hospital Partner Trust Verification Matrix</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] leading-relaxed">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Document Auditing:</span>
                    <span className={selectedCampaign.hasDocument ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {selectedCampaign.hasDocument ? "OCR ATTACHED (+15%)" : "MISSING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hospital API Check:</span>
                    <span className={selectedCampaign.isHospitalVerified ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {selectedCampaign.isHospitalVerified ? "DOCTOR SIGNED (+20%)" : "PENDING"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Story Synthesis:</span>
                    <span className={selectedCampaign.hasAIStory ? "text-emerald-400 font-bold" : "text-slate-500"}>
                      {selectedCampaign.hasAIStory ? "ACTIVE (+15%)" : "INACTIVE"}
                    </span>
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-800/80 pt-2 md:pt-0 md:pl-4 space-y-1">
                  <span className="text-slate-400 uppercase tracking-wider block font-bold text-[9px]">Live Treatment Status:</span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="font-bold text-white text-xs">{surgeryStatus}</span>
                  </div>
                  <span className="text-slate-500 block text-[9px] mt-1 leading-snug">
                    *Verified cost splits: Surgery {expenseBreakdown.surgery}%, Medicine {expenseBreakdown.medicines}%, ICU {expenseBreakdown.icu}%.
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm buttons */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all text-center"
              >
                Close Details
              </button>
              <button
                onClick={() => openDonationModal(selectedCampaign)}
                className="flex-1 bg-gradient-to-r from-teal-700 to-emerald-600 text-white hover:from-teal-800 hover:to-emerald-700 py-3 rounded-xl text-xs font-bold shadow-md shadow-teal-600/10 hover:shadow-lg transition-all"
              >
                Proceed to Secure Donation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: PAYMENT AND SUCCESS PANEL
          ------------------------------------------------------------- */}
      {isPaymentModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close */}
            <button
              onClick={() => {
                setIsPaymentModalOpen(false);
                setSelectedCampaign(null);
              }}
              disabled={isSuccessAnimation}
              className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Animation state */}
            {isSuccessAnimation ? (
              <div className="py-12 text-center space-y-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-3xl animate-bounce text-emerald-600">
                  ✔
                </div>
                <h3 className="text-lg font-black text-slate-900">Donation Successful!</h3>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                  Thank you! Your transaction is logged securely inside the transparent ledger node.
                </p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Tx Hash: 0x9f3d...{Math.floor(Math.random() * 1000)}
                </div>
              </div>
            ) : (
              <form onSubmit={processMockDonation} className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Secure Medical Contribution</h3>
                  <p className="text-xs text-slate-500 mt-1">100% of contributions are processed through mock hospital escrows.</p>
                </div>

                {/* Target Name */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 text-xs">
                  <span className="text-slate-400 block font-bold">Patient Target</span>
                  <span className="font-extrabold text-slate-800 block mt-0.5">{selectedCampaign.patientName} ({selectedCampaign.disease})</span>
                </div>

                {/* Input Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Your Full Name (For Leaderboard)</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Donation Amount (INR)</label>
                    <input
                      type="number"
                      value={donationAmount || ""}
                      onChange={(e) => setDonationAmount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[2000, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                        donationAmount === amt
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white hover:from-teal-800 hover:to-emerald-700 py-3 rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-lg transition-all"
                  >
                    Confirm Escrow Donation
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
