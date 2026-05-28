"use client";

import React, { useState, useEffect } from "react";
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import dynamic from 'next/dynamic';
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

// Dynamic import of Leaflet map component to prevent Next.js SSR build errors
const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

// Curated transit route coordinates in Mumbai from Santacruz Airport area to SevenHills Hospital, Marol
const mumbaiRoute = [
  { lat: 19.0760, lng: 72.8777 },
  { lat: 19.0802, lng: 72.8790 },
  { lat: 19.0845, lng: 72.8805 },
  { lat: 19.0888, lng: 72.8820 },
  { lat: 19.0930, lng: 72.8835 },
  { lat: 19.0972, lng: 72.8842 },
  { lat: 19.1015, lng: 72.8830 },
  { lat: 19.1058, lng: 72.8812 },
  { lat: 19.1100, lng: 72.8795 },
  { lat: 19.1142, lng: 72.8780 }
];

// Database of top clinical emergency partner hospitals in Mumbai with GPS coordinates
const mumbaiHospitals = [
  { id: "hosp_01", name: "SevenHills Hospital, Marol", lat: 19.1156, lng: 72.8785, phone: "+91 22 6767 6767", address: "Marol Maroshi Road, Andheri East" },
  { id: "hosp_02", name: "Kokilaben Dhirubhai Ambani Hospital, Andheri", lat: 19.1312, lng: 72.8252, phone: "+91 22 3099 9999", address: "Four Bungalows, Andheri West" },
  { id: "hosp_03", name: "Lilavati Hospital & Research Centre, Bandra", lat: 19.0506, lng: 72.8277, phone: "+91 22 2675 1000", address: "A.S. Road, Bandra West" },
  { id: "hosp_04", name: "Fortis Hospital, Mulund", lat: 19.1678, lng: 72.9554, phone: "+91 22 4111 4111", address: "Mulund Goregaon Link Road" },
  { id: "hosp_05", name: "Apollo Hospitals, Navi Mumbai", lat: 19.0194, lng: 73.0180, phone: "+91 22 3350 3350", address: "Parsik Hill Road, Sector 23, Belapur" }
];

// Haversine high-precision spherical distance algorithm (outputs distance in Kilometers)
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in Km
}

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
  const [activeTab, setActiveTab] = useState<"donor" | "patient" | "admin" | "leaderboard" | "ambulance">("donor");

  // Ambulance States
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>("amb_01");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simIntervalId, setSimIntervalId] = useState<NodeJS.Timeout | null | any>(null);

  // User & Nearest Hospital GPS states
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("hosp_01");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

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

  // Real-time Transaction states
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [latestTxHash, setLatestTxHash] = useState("");
  const [isReceiptView, setIsReceiptView] = useState(false);

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

    // 4. Subscribe to ambulances and auto-seed if empty
    const unsubscribeAmbulances = onSnapshot(
      collection(db, "ambulances"),
      (snapshot) => {
        const ambulanceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (ambulanceList.length === 0) {
          const defaultAmbulances = [
            {
              vehicleNumber: "MH-01-AX-1234",
              driverName: "Ramesh Kumar",
              driverPhone: "+91 98765 43210",
              lat: 19.0760,
              lng: 72.8777,
              status: "Standby",
              step: 0
            },
            {
              vehicleNumber: "MH-02-BY-5678",
              driverName: "Sanjay Patil",
              driverPhone: "+91 98765 01234",
              lat: 19.1025,
              lng: 72.8850,
              status: "Standby",
              step: 0
            }
          ];
          defaultAmbulances.forEach(async (amb, idx) => {
            const docId = `amb_0${idx + 1}`;
            await setDoc(doc(db, "ambulances", docId), amb);
          });
        } else {
          setAmbulances(ambulanceList);
        }
      }
    );

    return () => {
      unsubscribeCampaigns();
      unsubscribeDonors();
      unsubscribeLogs();
      unsubscribeAmbulances();
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
    setUpiId("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardHolder("");
    setLatestTxHash("");
    setIsReceiptView(false);
    setPaymentMethod("upi");
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

    // Strict Field Validations for Real-time authorization simulation
    if (paymentMethod === "upi") {
      if (!upiId || !upiId.includes("@")) {
        alert("Please enter a valid UPI ID (e.g. user@bank)!");
        return;
      }
    } else {
      if (!cardNumber || cardNumber.length < 12) {
        alert("Please enter a valid credit card number!");
        return;
      }
      if (!cardExpiry || !cardExpiry.includes("/")) {
        alert("Please enter card expiry date (MM/YY)!");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        alert("Please enter a valid 3-digit CVV!");
        return;
      }
    }

    setIsSuccessAnimation(true);

    try {
      // Generate secure unique transparent ledger hash
      const txHash = "0x" + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setLatestTxHash(txHash);

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
        message: `PHILANTHROPIST DEPOSIT: ${donorName} donated ₹${donationAmount.toLocaleString()} to ${selectedCampaign.patientName} via ${paymentMethod.toUpperCase()}. Transaction Hash: ${txHash.slice(0, 10)}...`,
        timestamp: new Date().toISOString()
      });

      // 4. Complete authorization transition and open Receipt Hub
      setTimeout(() => {
        setIsSuccessAnimation(false);
        setIsReceiptView(true);
      }, 2000);
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

  // -------------------------------------------------------------
  // Live Ambulance GPS Routing Simulator
  // -------------------------------------------------------------
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Defaulting to Central Mumbai coordinates.");
      setUserLat(19.0760);
      setUserLng(72.8777);
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.warn("Geolocation access denied or failed: ", error.message);
        alert("Location access denied or failed. Defaulting to Santacruz, Mumbai coordinates for simulation.");
        setUserLat(19.0760);
        setUserLng(72.8777);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const generateSimulationRoute = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const steps = [];
    const numSteps = 10;
    for (let i = 0; i <= numSteps; i++) {
      const fraction = i / numSteps;
      const lat = startLat + (endLat - startLat) * fraction;
      const lng = startLng + (endLng - startLng) * fraction;
      steps.push({ lat, lng });
    }
    return steps;
  };

  const startTransitSimulation = async () => {
    if (isSimulating) return;

    const targetAmb = ambulances.find(a => a.id === "amb_01");
    if (!targetAmb) {
      alert("Ambulance data not loaded yet. Try again in a moment.");
      return;
    }

    const targetHosp = mumbaiHospitals.find(h => h.id === selectedHospitalId) || mumbaiHospitals[0];

    setIsSimulating(true);

    // Register dispatch activity log in Firestore
    await addDoc(collection(db, "logs"), {
      type: "transit",
      message: `Emergency Ambulance ${targetAmb.vehicleNumber} dispatched to ${targetHosp.name}. GPS beacon initialized.`,
      timestamp: new Date().toISOString()
    });

    // Generate dynamic coordinate route to the selected hospital
    const dynamicRoute = generateSimulationRoute(19.0760, 72.8777, targetHosp.lat, targetHosp.lng);

    let currentStep = targetAmb.step || 0;
    if (currentStep >= dynamicRoute.length - 1) {
      currentStep = 0; // reset to beginning if already completed
    }

    const interval = setInterval(async () => {
      currentStep++;
      if (currentStep >= dynamicRoute.length) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimIntervalId(null);

        // Update to Arrived status in Firestore
        await updateDoc(doc(db, "ambulances", "amb_01"), {
          status: "Arrived",
          step: dynamicRoute.length - 1,
          lat: targetHosp.lat,
          lng: targetHosp.lng
        });

        // Register arrival log in Firestore
        await addDoc(collection(db, "logs"), {
          type: "transit",
          message: `Ambulance ${targetAmb.vehicleNumber} has arrived safely at ${targetHosp.name}. Transit complete.`,
          timestamp: new Date().toISOString()
        });

        return;
      }

      // Update position in Firestore
      const nextCoords = dynamicRoute[currentStep];
      await updateDoc(doc(db, "ambulances", "amb_01"), {
        lat: nextCoords.lat,
        lng: nextCoords.lng,
        status: "In Transit",
        step: currentStep
      });

    }, 2000);

    setSimIntervalId(interval);
  };

  const stopTransitSimulation = async () => {
    if (simIntervalId) {
      clearInterval(simIntervalId);
      setSimIntervalId(null);
    }
    setIsSimulating(false);

    const targetAmb = ambulances.find(a => a.id === "amb_01");
    if (targetAmb) {
      await updateDoc(doc(db, "ambulances", "amb_01"), {
        status: "Standby",
        step: 0,
        lat: mumbaiRoute[0].lat,
        lng: mumbaiRoute[0].lng
      });

      // Register standby log in Firestore
      await addDoc(collection(db, "logs"), {
        type: "transit",
        message: `Ambulance ${targetAmb.vehicleNumber} transit aborted. GPS tracking switched to standby.`,
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    return () => {
      if (simIntervalId) clearInterval(simIntervalId);
    };
  }, [simIntervalId]);

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
            <button
              onClick={() => setActiveTab("ambulance")}
              className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "ambulance" 
                  ? "bg-white text-teal-700 shadow-sm" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25v11.25m0-11.25H8.25m0 0a9.003 9.003 0 0 1 7.5 7.5M8.25 7.5v11.25" />
              </svg>
              <span>Ambulance Tracker</span>
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

        {/* -------------------------------------------------------------
            TAB: AMBULANCE TRACKER (REAL-TIME GPS TELEMETRY & HOSPITAL LOCATOR)
            ------------------------------------------------------------- */}
        {activeTab === "ambulance" && (
          <section className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Geolocation Helper Banner */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold flex items-center space-x-2 text-teal-300">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                  </span>
                  <span>Interactive High-Precision GPS Ambulance Telemetry</span>
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Our system computes real-time spherical distances using the **Haversine Algorithm** to determine your nearest emergency medical center instantly. Select any hospital to auto-route active clinical transits.
                </p>
              </div>

              <div className="shrink-0">
                {userLat && userLng ? (
                  <div className="bg-slate-800/80 border border-teal-500/30 px-4.5 py-2.5 rounded-xl text-xs font-mono flex items-center space-x-2">
                    <span className="text-teal-400">📍 GPS Connected:</span>
                    <span>{userLat.toFixed(4)}°N, {userLng.toFixed(4)}°E</span>
                  </div>
                ) : (
                  <button
                    onClick={detectUserLocation}
                    disabled={isDetectingLocation}
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    <span>📍</span>
                    <span>{isDetectingLocation ? "Accessing GPS Satellite..." : "Detect Nearest Emergency Hospital"}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Telemetry Control Panel & List */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Ambulance Selector Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Active Ambulance Fleet</span>
                  <div className="space-y-3">
                    {ambulances.map(amb => {
                      const isSelected = selectedAmbulanceId === amb.id;
                      let statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                      let pulseDot = "bg-amber-500";
                      if (amb.status === "In Transit") {
                        statusBadge = "bg-teal-50 text-teal-700 border-teal-200 animate-pulse";
                        pulseDot = "bg-teal-500";
                      } else if (amb.status === "Arrived") {
                        statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        pulseDot = "bg-emerald-500";
                      }

                      return (
                        <button
                          key={amb.id}
                          onClick={() => setSelectedAmbulanceId(amb.id)}
                          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col space-y-2.5 ${
                            isSelected 
                              ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                              : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-black tracking-wide font-mono">
                              {amb.vehicleNumber}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border flex items-center space-x-1 ${statusBadge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${pulseDot} shrink-0`} />
                              <span>{amb.status}</span>
                            </span>
                          </div>

                          <div className="text-[11px] leading-tight">
                            <div className={isSelected ? "text-slate-300" : "text-slate-500"}>
                              Driver: <span className="font-bold">{amb.driverName}</span>
                            </div>
                            <div className={`mt-0.5 font-mono ${isSelected ? "text-teal-400" : "text-slate-600"}`}>
                              Coords: {amb.lat.toFixed(4)}, {amb.lng.toFixed(4)}
                            </div>
                          </div>

                          <a
                            href={`tel:${amb.driverPhone}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`w-full py-1.5 rounded-lg text-[10px] font-bold text-center border transition-all ${
                              isSelected 
                                ? "bg-slate-800 border-slate-700 text-teal-400 hover:bg-slate-750" 
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            📞 Direct Call Driver
                          </a>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Transit Simulator Interface */}
                {selectedAmbulanceId === "amb_01" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Emergency Routing Simulator</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Route Ramesh Kumar's emergency vehicle from Santacruz to your selected destination hospital.</p>
                    </div>

                    {/* Progress Bar showing current transit steps */}
                    {(() => {
                      const amb = ambulances.find(a => a.id === "amb_01");
                      const step = amb?.step || 0;
                      const numSteps = 10;
                      const percent = Math.round((step / numSteps) * 100);

                      return (
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600">
                            <span>Transit Progress</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                            <span>Santacruz Depot</span>
                            <span className="text-right truncate max-w-[150px]">
                              {mumbaiHospitals.find(h => h.id === selectedHospitalId)?.name || "Hospital"}
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex space-x-2">
                      {isSimulating ? (
                        <button
                          onClick={stopTransitSimulation}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/10 hover:shadow-lg transition-all text-center flex items-center justify-center space-x-1.5"
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-100"></span>
                          </span>
                          <span>Stop Simulation</span>
                        </button>
                      ) : (
                        <button
                          onClick={startTransitSimulation}
                          className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-500 text-white hover:from-teal-700 hover:to-emerald-600 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-teal-600/10 hover:shadow-lg transition-all text-center flex items-center justify-center space-x-1.5"
                        >
                          <span>⚡ Dispatch & Simulate</span>
                        </button>
                      )}
                    </div>

                    {isSimulating && (
                      <div className="bg-slate-900 text-slate-300 p-2.5 rounded-lg text-[9px] font-mono leading-relaxed space-y-0.5 border border-slate-800">
                        <div className="text-teal-400 font-bold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                          <span>Transmitting GPS Telemetry...</span>
                        </div>
                        <div>Packet status: Connected</div>
                        <div>Update rate: 2000ms latency</div>
                      </div>
                    )}
                  </div>
                )}

                {selectedAmbulanceId === "amb_02" && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center text-xs text-slate-500">
                    <span>Ambulance MH-02-BY-5678 is currently stationed at base depot coordinates. Select Ramesh Kumar (MH-01-AX-1234) to run live routing simulation vectors.</span>
                  </div>
                )}
              </div>

              {/* Live Interactive Map and Ledger Integrations */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Live High-Precision Map Canvas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Live High-Precision Map</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Interactive visualization canvas displaying live emergency telemetry updates.</p>
                    </div>
                    {(() => {
                      const selectedAmb = ambulances.find(a => a.id === selectedAmbulanceId);
                      return selectedAmb ? (
                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                          AMB LOC: {selectedAmb.lat.toFixed(5)}°N, {selectedAmb.lng.toFixed(5)}°E
                        </span>
                      ) : null;
                    })()}
                  </div>

                  {/* map container rendering */}
                  {(() => {
                    const selectedAmb = ambulances.find(a => a.id === selectedAmbulanceId);
                    const selectedHosp = mumbaiHospitals.find(h => h.id === selectedHospitalId);

                    return selectedAmb ? (
                      <div className="w-full relative rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                        <LiveMap 
                          lat={selectedAmb.lat} 
                          lng={selectedAmb.lng} 
                          driverName={selectedAmb.driverName}
                          vehicleNumber={selectedAmb.vehicleNumber}
                          hospitalLat={selectedHosp?.lat}
                          hospitalLng={selectedHosp?.lng}
                          hospitalName={selectedHosp?.name}
                          userLat={userLat || undefined}
                          userLng={userLng || undefined}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-96 rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 border border-slate-200">
                        Initializing high-precision leaflet map engine...
                      </div>
                    );
                  })()}
                </div>

                {/* Emergency Hospital Locator & Haversine Distance Search Engine */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Hospital locator & Haversine GPS search</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Spherical calculations determine the physical nearest clinical escrows instantly.</p>
                    </div>

                    {/* Hospital Search input */}
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search hospital by name..."
                        value={hospitalSearchQuery}
                        onChange={(e) => setHospitalSearchQuery(e.target.value)}
                        className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs w-60"
                      />
                    </div>
                  </div>

                  {/* Haversine distance computations list */}
                  {(() => {
                    // Filter hospitals based on query
                    const filtered = mumbaiHospitals.filter(h => 
                      h.name.toLowerCase().includes(hospitalSearchQuery.toLowerCase()) ||
                      h.address.toLowerCase().includes(hospitalSearchQuery.toLowerCase())
                    );

                    // Map with computed distances if user location is available
                    const computedHospitals = filtered.map(h => {
                      let distance: number | null = null;
                      if (userLat !== null && userLng !== null) {
                        distance = getDistanceFromLatLonInKm(userLat, userLng, h.lat, h.lng);
                      }
                      return { ...h, distance };
                    });

                    // Sort by distance if available, otherwise keep default
                    if (userLat !== null && userLng !== null) {
                      computedHospitals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                    }

                    // Find closest one
                    const minDistanceHospId = computedHospitals.length && userLat !== null
                      ? computedHospitals[0].id
                      : null;

                    return (
                      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                        {computedHospitals.map(h => {
                          const isTarget = selectedHospitalId === h.id;
                          const isNearest = h.id === minDistanceHospId;

                          return (
                            <div 
                              key={h.id} 
                              className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200 ${
                                isTarget 
                                  ? "bg-rose-50/50 border-rose-200" 
                                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-black text-slate-800">{h.name}</span>
                                  {isNearest && (
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full animate-bounce">
                                      🏆 Nearest
                                    </span>
                                  )}
                                  {isTarget && (
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                                      🎯 Target Target
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-500 block">📍 {h.address}</span>
                                <span className="text-[10px] font-mono text-slate-400 block">📞 Phone: {h.phone}</span>
                              </div>

                              <div className="flex items-center space-x-4 shrink-0 justify-between md:justify-end">
                                {/* Distance readout if calculated */}
                                {h.distance !== null && (
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-400 block font-bold">Computed Distance</span>
                                    <span className="text-xs font-black text-slate-800 font-mono">
                                      {h.distance.toFixed(2)} km
                                    </span>
                                  </div>
                                )}

                                {/* Target Select button */}
                                <button
                                  onClick={async () => {
                                    setSelectedHospitalId(h.id);
                                    // Log to blockchain stream
                                    await addDoc(collection(db, "logs"), {
                                      type: "transit",
                                      message: `Target emergency hospital set to ${h.name}. Coordinates loaded to fleet telemetry.`,
                                      timestamp: new Date().toISOString()
                                    });
                                  }}
                                  className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                                    isTarget 
                                      ? "bg-rose-600 border-rose-600 text-white shadow-sm" 
                                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  {isTarget ? "🎯 Destination Set" : "🗺️ Set as Destination"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {computedHospitals.length === 0 && (
                          <div className="text-center text-xs text-slate-500 py-6">
                            No hospitals found matching your keyword search.
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Real-time Telemetry Ledger updates */}
                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-lg font-mono">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center space-x-2 text-teal-400">
                      <span className="animate-pulse w-2 h-2 rounded-full bg-teal-400" />
                      <span className="text-xs font-extrabold uppercase tracking-wider">Telemetry GPS Ledger Logs</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold font-mono">Channel ID: #telemetry-stream</span>
                  </div>

                  <div className="space-y-1.5 text-[10px] max-h-40 overflow-y-auto">
                    {logs.filter(l => l.type === "transit" || l.type === "creation").slice(0, 15).map((log) => {
                      const simulatedHash = "0x" + Math.floor(Math.random() * 10000000).toString(16).padEnd(8, "f");
                      return (
                        <div key={log.id} className="flex justify-between border-b border-slate-800/40 py-1 hover:bg-slate-850 transition-colors">
                          <div className="flex items-start space-x-2">
                            <span className="text-teal-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-slate-300">{log.message}</span>
                          </div>
                          <span className="text-slate-500 text-[9px] font-mono shrink-0 ml-4">
                            hash: {simulatedHash}
                          </span>
                        </div>
                      );
                    })}
                    {logs.filter(l => l.type === "transit").length === 0 && (
                      <div className="text-slate-500 text-center py-4 italic">No telemetry transits recorded in the public ledger block yet. Click 'Simulate Transit' to dispatch emergency vehicles.</div>
                    )}
                  </div>
                </div>
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
          {/* Custom print target stylesheet to focus printing entirely on receipt */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              .print-receipt-only, .print-receipt-only * {
                visibility: visible !important;
              }
              .print-receipt-only {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                background: white !important;
                color: black !important;
                padding: 20px !important;
              }
            }
          `}} />

          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Close Button */}
            {!isSuccessAnimation && (
              <button
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setSelectedCampaign(null);
                  setIsReceiptView(false);
                }}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* 1. SUCCESS PROCESSING ANIMATION */}
            {isSuccessAnimation ? (
              <div className="py-12 text-center space-y-5 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 flex items-center justify-center text-3xl animate-bounce text-emerald-600">
                  ✔
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Authorizing Transaction...</h3>
                  <p className="text-xs text-slate-500 max-w-[280px] mx-auto mt-1">
                    Validating clinical escrows and transmitting real-time GPS telemetry records...
                  </p>
                </div>
                <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[80%] animate-pulse" />
                </div>
              </div>

            // 2. SUCCESS RECEIPT HUB (PRINTABLE RECEIPT)
            ) : isReceiptView ? (
              <div className="space-y-6">
                
                {/* Official Receipt Card Block */}
                <div className="print-receipt-only border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 space-y-5 text-slate-800">
                  
                  {/* Receipt Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 bg-teal-600 rounded-lg text-white font-bold text-sm">🏥</span>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wide text-slate-900">MediTrust AI Escrow</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">On-Chain Healthcare Registry</span>
                      </div>
                    </div>
                    
                    {/* Mock Stamp Seal */}
                    <div className="border border-emerald-500 text-emerald-600 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest rotate-6 select-none shrink-0 bg-white">
                      ✔ Escrow Signed
                    </div>
                  </div>

                  {/* Transaction Metadata Table */}
                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400 font-semibold">Transaction ID / Hash:</span>
                      <span className="font-mono font-bold text-[10px] text-slate-800">{latestTxHash}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400 font-semibold">Payment Timestamp:</span>
                      <span className="font-bold text-slate-800">{new Date().toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400 font-semibold">Medical Philanthropist:</span>
                      <span className="font-extrabold text-slate-900 uppercase">{donorName}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400 font-semibold">Healthcare Recipient:</span>
                      <span className="font-bold text-slate-800">{selectedCampaign.patientName} ({selectedCampaign.disease})</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400 font-semibold">Escrow Partner Hospital:</span>
                      <span className="font-bold text-slate-800">{selectedCampaign.hospitalName}</span>
                    </div>

                    <div className="flex justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-400 font-semibold">Contribution Amount:</span>
                      <span className="text-base font-black text-teal-700">₹{donationAmount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Payment Channel:</span>
                      <span className="font-bold text-slate-800 uppercase font-mono">{paymentMethod}</span>
                    </div>
                  </div>

                  {/* Receipt Footer disclaimer */}
                  <div className="border-t border-slate-200 pt-4 text-[9px] text-slate-400 leading-relaxed text-center">
                    This document certifies secure escrow allocation for direct clinical settlement under project ID `disha21`. Generative blockchain receipt established.
                  </div>
                </div>

                {/* Printable Action Buttons */}
                <div className="flex space-x-2.5 pt-2">
                  <button
                    onClick={() => {
                      setIsPaymentModalOpen(false);
                      setSelectedCampaign(null);
                      setIsReceiptView(false);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    Close & Return
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-gradient-to-r from-teal-700 to-emerald-600 text-white hover:from-teal-800 hover:to-emerald-700 py-3 rounded-xl text-xs font-extrabold shadow-md shadow-teal-600/10 hover:shadow-lg transition-all text-center flex items-center justify-center space-x-1.5"
                  >
                    <span>🖨️ Download / Print Receipt</span>
                  </button>
                </div>
              </div>

            // 3. SECURE CHECKOUT FLOW (UPI AND CARD OPTIONS)
            ) : (
              <form onSubmit={processMockDonation} className="space-y-4">
                
                {/* Modal Title */}
                <div>
                  <h3 className="text-base font-black text-slate-900">Secure Medical Contribution</h3>
                  <p className="text-xs text-slate-500 mt-1">Select UPI or Credit Card. 100% of funds settle directly to clinical partner escrows.</p>
                </div>

                {/* Selected Campaign Header */}
                <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Fundraising Target</span>
                    <span className="font-extrabold text-slate-800 block mt-0.5">{selectedCampaign.patientName}</span>
                  </div>
                  <span className="text-[10px] font-black text-teal-700 bg-white border border-teal-500/25 px-2.5 py-0.5 rounded-full shrink-0">
                    ₹{donationAmount.toLocaleString()}
                  </span>
                </div>

                {/* Form Fields: Name and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase tracking-wide">Your Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1 uppercase tracking-wide">Donation Amount (INR)</label>
                    <input
                      type="number"
                      value={donationAmount || ""}
                      onChange={(e) => setDonationAmount(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-bold"
                    />
                  </div>
                </div>

                {/* Quick Donation Presets */}
                <div className="grid grid-cols-3 gap-2">
                  {[2000, 5000, 10000].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                        donationAmount === amt
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Payment Option Selector Tabs */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-[10px] font-black text-slate-500 block mb-2.5 uppercase tracking-wide">Escrow Settle Channel</span>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("upi")}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        paymentMethod === "upi"
                          ? "bg-white text-teal-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <span>⚡</span>
                      <span>UPI Instant Transfer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                        paymentMethod === "card"
                          ? "bg-white text-teal-700 shadow-sm"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <span>💳</span>
                      <span>Credit / Debit Card</span>
                    </button>
                  </div>
                </div>

                {/* Payment Fields according to Selected Tab */}
                {paymentMethod === "upi" ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                    
                    {/* Simulated Dynamic Escrow QR Code */}
                    <div className="flex items-center space-x-4">
                      {/* Stylized high-fidelity QR code SVG */}
                      <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg p-1.5 shrink-0 flex items-center justify-center">
                        <svg className="w-full h-full text-slate-800" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="0" y="0" width="30" height="30" />
                          <rect x="5" y="5" width="20" height="20" fill="white" />
                          <rect x="10" y="10" width="10" height="10" />
                          
                          <rect x="70" y="0" width="30" height="30" />
                          <rect x="75" y="5" width="20" height="20" fill="white" />
                          <rect x="80" y="10" width="10" height="10" />

                          <rect x="0" y="70" width="30" height="30" />
                          <rect x="5" y="75" width="20" height="20" fill="white" />
                          <rect x="10" y="80" width="10" height="10" />

                          <rect x="40" y="40" width="20" height="20" fill="#0d9488" />
                          <rect x="45" y="45" width="10" height="10" fill="white" />
                          
                          <rect x="45" y="10" width="10" height="20" />
                          <rect x="80" y="45" width="10" height="20" />
                          <rect x="45" y="80" width="15" height="10" />
                        </svg>
                      </div>

                      <div className="text-[11px] leading-relaxed">
                        <span className="font-extrabold text-slate-800 block">Dynamic Escrow QR Generated</span>
                        <p className="text-slate-500 mt-0.5">Scan to instantly match hospital deposits or enter your Virtual Payment Address below.</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-500 block mb-1 uppercase tracking-wide">Enter UPI ID</label>
                      <input
                        type="text"
                        placeholder="e.g. name@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                    
                    {/* Simulated holographic Visual Credit Card */}
                    <div className="w-full h-28 bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-900 rounded-xl p-3.5 text-white flex flex-col justify-between shadow-md relative overflow-hidden font-mono select-none">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-teal-400 font-bold uppercase tracking-widest leading-none">MediTrust Gateway</span>
                        <span className="text-xs italic font-bold">VISA</span>
                      </div>

                      <div className="text-sm tracking-widest text-center py-1">
                        {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : "•••• •••• •••• ••••"}
                      </div>

                      <div className="flex justify-between text-[8px] leading-tight">
                        <div>
                          <span className="text-slate-400 block text-[6px] uppercase">Card Holder</span>
                          <span className="font-bold truncate max-w-[120px] block mt-0.5">{cardHolder ? cardHolder.toUpperCase() : "YOUR NAME"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[6px] uppercase">Expires</span>
                          <span className="font-bold block mt-0.5">{cardExpiry ? cardExpiry : "MM/YY"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[6px] uppercase">CVV</span>
                          <span className="font-bold block mt-0.5">{cardCvv ? cardCvv : "•••"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <label className="text-[9px] font-black text-slate-500 block mb-0.5 uppercase tracking-wide">Card Holder Name</label>
                        <input
                          type="text"
                          placeholder="Name as printed on card"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-slate-500 block mb-0.5 uppercase tracking-wide">Card Number</label>
                        <input
                          type="text"
                          maxLength={16}
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="text-[9px] font-black text-slate-500 block mb-0.5 uppercase tracking-wide">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-500 block mb-0.5 uppercase tracking-wide">CVV Code</label>
                          <input
                            type="password"
                            placeholder="•••"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Settle Escrow Trigger Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 text-white hover:from-teal-800 hover:to-emerald-700 py-3 rounded-xl text-xs font-black tracking-widest uppercase shadow-md shadow-teal-600/10 hover:shadow-lg transition-all cursor-pointer"
                  >
                    🔐 Secure Escrow Deposit
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
