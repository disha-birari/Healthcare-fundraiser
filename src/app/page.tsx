'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function MediTrustLanding() {
  const [activeTab, setActiveTab] = useState<'home' | 'campaigns' | 'tech' | 'trust' | 'about' | 'blog'>('home');

  // Custom SVGs for Trust Badges
  const VerifiedDocIcon = () => (
    <svg className="w-8 h-8 text-[#6b5b95]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
    </svg>
  );

  const AuditFinIcon = () => (
    <svg className="w-8 h-8 text-[#6b5b95]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12 18.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );

  const ShieldIcon = () => (
    <svg className="w-8 h-8 text-[#6b5b95]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );

  // Framer Motion staggered grid parents and spring animation definitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const textItemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 }
    }
  };

  const hologramVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 80, damping: 15, delay: 0.25 }
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardEntranceVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 90, damping: 18 }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fdf8f5] text-[#1a1a1a] flex flex-col justify-between overflow-hidden">
      
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[900px] h-[900px] rounded-full bg-[#b8a4d4]/30 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] rounded-full bg-[#87c7a1]/25 blur-[160px] pointer-events-none" />

      {/* Header / Navigation */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="sticky top-0 w-full z-50 bg-[#fdf8f5]/80 border-b border-[#e8e0dd] backdrop-blur-md"
      >
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="text-[#6b5b95] group-hover:scale-110 transition-transform duration-300">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h2.25l1.35-3.83 2.7 8.66 2.7-11.83 2.7 8.66 1.35-3.83h2.25" />
              </svg>
            </div>
            <span className="text-lg font-black tracking-wider bg-gradient-to-r from-[#1a1a1a] via-[#6b5b95] to-[#87c7a1] bg-clip-text text-transparent">
              MediTrust AI
            </span>
          </Link>
          
          <nav className="flex space-x-1.5 p-1 bg-[#f4f0ed]/80 rounded-full border border-[#e8e0dd] shadow-inner">
            {([
              { id: 'home', label: 'Home' },
              { id: 'campaigns', label: 'Campaigns' },
              { id: 'tech', label: 'Technology' },
              { id: 'trust', label: 'Trust' },
              { id: 'about', label: 'About' },
              { id: 'blog', label: 'Blog' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-4.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#6b5b95] text-white shadow-md'
                    : 'text-[#7a7a7a] hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
 
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link 
              href="/login" 
              className="px-6 py-3 rounded-full bg-[#6b5b95] hover:bg-[#5a4a80] text-white text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-[#6b5b95]/20 active:shadow-[#6b5b95]/10 cursor-pointer block"
            >
              Access Platform
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Main SaaS Showcase - Configured for Fullscreen spaciousness */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-8 md:px-12 py-10 md:py-14 z-10 flex flex-col justify-center gap-14 md:gap-18">
        
        {/* HERO SECTION */}
        <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 min-h-[50vh]">
          
          {/* Hero Left */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/2 space-y-7 text-center lg:text-left flex flex-col justify-center"
          >
            <motion.h1 
              variants={textItemVariants}
              className="text-4xl md:text-5xl lg:text-[62px] font-extrabold tracking-tight leading-[1.05] text-[#1a1a1a]"
            >
              Accelerate Healthcare Access with Transparent Crowdfunding.
            </motion.h1>
            <motion.p 
              variants={textItemVariants}
              className="text-[#7a7a7a] text-sm md:text-base leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Leverage AI-driven accountability for trustworthy medical support. Join a global community empowering patients through Firestore blockchain integration.
            </motion.p>
            <motion.div 
              variants={textItemVariants}
              className="pt-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/login" 
                className="px-8 py-4.5 rounded-full bg-[#6b5b95] hover:bg-[#5a4a80] text-white font-black text-sm tracking-wider uppercase shadow-xl shadow-[#6b5b95]/25 active:scale-[0.99] transition-all cursor-pointer inline-block"
              >
                Explore Campaigns
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Right: Hologram human */}
          <motion.div 
            variants={hologramVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-1/2 flex justify-center relative"
          >
            <div className="relative w-full max-w-lg h-[420px] flex items-center justify-center">
              
              {/* Central Hologram Asset */}
              <motion.div 
                animate={{ 
                  y: [0, -12, 0],
                  rotateY: [0, 4, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-88 h-88 relative select-none"
              >
                <Image 
                  src="/hologram.png"
                  alt="MediTrust Hologram"
                  fill
                  className="object-contain drop-shadow-[0_0_40px_rgba(6,182,212,0.15)]"
                  priority
                />
              </motion.div>
              
              {/* Overlay absolute telemetry screens to mirror the visual design */}
              <motion.div 
                whileHover={{ scale: 1.05, borderColor: "rgba(107, 91, 149, 0.3)" }}
                className="absolute top-4 left-4 p-3 rounded-xl bg-white/80 border border-[#e8e0dd] text-[9px] font-mono text-[#6b5b95]/90 space-y-1 max-w-[120px] backdrop-blur-md shadow-2xl transition-all duration-300 cursor-help"
              >
                <div className="font-bold border-b border-[#e8e0dd] pb-0.5 text-[#6b5b95]">BRAIN_SCAN</div>
                <div>FREQ: 9.8 Hz</div>
                <div>STATE: ACTIVE</div>
                <div className="text-[7px] text-[#7a7a7a]">SYSTEM: NORMAL</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, borderColor: "rgba(107, 91, 149, 0.3)" }}
                className="absolute bottom-6 right-4 p-3 rounded-xl bg-white/80 border border-[#e8e0dd] text-[9px] font-mono text-[#6b5b95]/90 space-y-1 max-w-[125px] backdrop-blur-md shadow-2xl transition-all duration-300 cursor-help"
              >
                <div className="font-bold border-b border-[#e8e0dd] pb-0.5 text-[#6b5b95]">TELEMETRY_LOG</div>
                <div>PULSE: 74 BPM</div>
                <div>SYNC: 100% SECURE</div>
                <div className="text-[7px] text-[#87c7a1]">STATUS: ON CHAIN</div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* BOTTOM HALF MATRIX */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Active Patient Statistics Grid (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xs font-black text-[#7a7a7a] uppercase tracking-widest leading-none">
              Active Patient Statistics
            </h2>
            
            <motion.div 
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              
              {/* Card 1: Total Funded */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-6 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col justify-between min-h-[210px] relative overflow-hidden transition-colors duration-300 shadow-xl"
              >
                <div className="flex justify-between items-center z-10">
                  <span className="text-xs font-bold text-[#7a7a7a]">Total Funded</span>
                  <span className="text-[10px] font-black text-[#6b5b95] bg-[#b8a4d4]/30 border border-[#6b5b95]/20 px-2 py-0.5 rounded-full">$4.8M</span>
                </div>
                <div className="my-2 z-10">
                  <div className="text-3.5xl font-black text-[#1a1a1a]">$4.8M</div>
                </div>
                {/* SVG Spline Wave Chart */}
                <div className="h-16 w-full relative z-0">
                  <svg className="w-full h-full text-[#6b5b95] opacity-80" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="gradient-wave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6b5b95" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6b5b95" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 Q30,20 60,40 T120,15 T180,30 L200,10 L200,60 L0,60 Z" fill="url(#gradient-wave)" />
                    <path d="M0,45 Q30,20 60,40 T120,15 T180,30 L200,10" fill="none" stroke="#6b5b95" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="200" cy="10" r="3.5" fill="#87c7a1" className="animate-ping" />
                    <circle cx="200" cy="10" r="2.5" fill="#87c7a1" />
                  </svg>
                </div>
                <div className="flex justify-between text-[9px] text-[#7a7a7a] font-bold z-10 mt-1">
                  <span>12,500+ Donors</span>
                  <span>+15% monthly growth</span>
                </div>
              </motion.div>

              {/* Card 2: Success Rate */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-6 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col justify-between min-h-[210px] transition-colors duration-300 shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#7a7a7a]">Success Rate</span>
                  <span className="text-[#6b5b95]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12" />
                    </svg>
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-3.5xl font-black text-[#1a1a1a]">91%</div>
                </div>
                {/* SVG Coordinates line graph */}
                <div className="h-16 w-full relative">
                  <svg className="w-full h-full text-[#e8e0dd]" viewBox="0 0 200 60" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="15" x2="200" y2="15" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="0" y1="45" x2="200" y2="45" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3,3" />
                    
                    <path d="M0,50 L40,42 L80,35 L120,18 L160,25 L200,15" fill="none" stroke="#87c7a1" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="200" cy="15" r="3" fill="#87c7a1" />
                  </svg>
                </div>
                <div className="flex justify-between text-[8px] text-[#7a7a7a] font-mono mt-1">
                  <span>0</span>
                  <span>20</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100</span>
                </div>
              </motion.div>

              {/* Card 3: Active Patients */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-6 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col justify-between min-h-[210px] transition-colors duration-300 shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#7a7a7a]">Active Patients</span>
                  <span className="text-[10px] font-black text-[#6b5b95] bg-[#b8a4d4]/30 border border-[#6b5b95]/20 px-2 py-0.5 rounded-full">1,420</span>
                </div>
                <div className="my-2">
                  <div className="text-3.5xl font-black text-[#1a1a1a]">1,420</div>
                </div>
                {/* stylized SVG mini world map */}
                <div className="h-16 w-full flex items-center justify-center opacity-70">
                  <svg className="w-full h-full text-[#b8a4d4]/50" viewBox="0 0 240 70" fill="currentColor">
                    <path d="M30,10 Q25,25 35,40 T30,60 L20,60 L20,30 Z" />
                    <path d="M45,35 Q50,45 42,60 T35,70 L30,55 Z" />
                    <path d="M120,8 Q140,5 160,12 T180,25 T150,40 T130,15 Z" />
                    <path d="M130,30 Q145,45 138,55 T120,60 Z" />
                    <circle cx="195" cy="48" r="7" />
                    <circle cx="210" cy="55" r="4" />
                    <circle cx="35" cy="28" r="2.5" fill="#87c7a1" className="animate-pulse" />
                    <circle cx="145" cy="18" r="2.5" fill="#87c7a1" className="animate-pulse" />
                    <circle cx="195" cy="48" r="2" fill="#87c7a1" className="animate-pulse" />
                  </svg>
                </div>
              </motion.div>

              {/* Card 4: Funded Treatments */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-6 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col justify-between min-h-[210px] transition-colors duration-300 shadow-xl"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#7a7a7a]">Funded Treatments</span>
                  <span className="text-[#6b5b95]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
                    </svg>
                  </span>
                </div>
                <div className="my-2">
                  <div className="text-3.5xl font-black text-[#1a1a1a]">8,310</div>
                </div>
                {/* SVG Vertical bar chart */}
                <div className="h-16 w-full relative">
                  <svg className="w-full h-full text-[#e8e0dd]" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <rect x="5" y="40" width="10" height="20" rx="2" fill="#6b5b95" />
                    <rect x="29" y="32" width="10" height="28" rx="2" fill="#6b5b95" />
                    <rect x="53" y="24" width="10" height="36" rx="2" fill="#6b5b95" />
                    <rect x="77" y="38" width="10" height="22" rx="2" fill="#6b5b95" />
                    <rect x="101" y="16" width="10" height="44" rx="2" fill="#6b5b95" />
                    <rect x="125" y="28" width="10" height="32" rx="2" fill="#6b5b95" />
                    <rect x="149" y="34" width="10" height="26" rx="2" fill="#6b5b95" />
                    <rect x="173" y="10" width="10" height="50" rx="2" fill="#87c7a1" className="animate-pulse" />
                  </svg>
                </div>
                <div className="flex justify-between text-[8px] text-[#7a7a7a] font-bold mt-1">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                </div>
              </motion.div>

            </motion.div>
          </div>
 
          {/* Trust & Audit Badges Column (Right 1 Column) */}
          <div className="space-y-6">
            <h2 className="text-xs font-black text-[#7a7a7a] uppercase tracking-widest leading-none">
              Trust & Audit Badges
            </h2>
            
            <motion.div 
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 gap-4"
            >
              
              {/* Badge 1: Verified Patient Records */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-4.5 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col items-center justify-center text-center min-h-[190px] shadow-xl transition-all duration-300"
              >
                <VerifiedDocIcon />
                <h3 className="font-extrabold text-[11px] text-[#1a1a1a] mt-3 leading-snug">
                  Verified Patient Records
                </h3>
                <span className="text-[9px] text-[#7a7a7a] font-semibold mt-1">MediTrust AI Certified</span>
              </motion.div>

              {/* Badge 2: Audited Financials */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-4.5 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col items-center justify-center text-center min-h-[190px] shadow-xl transition-all duration-300"
              >
                <AuditFinIcon />
                <h3 className="font-extrabold text-[11px] text-[#1a1a1a] mt-3 leading-snug">
                  Audited Financials
                </h3>
                <span className="text-[9px] text-[#7a7a7a] font-semibold mt-1">Blockchain Verifiable</span>
              </motion.div>

              {/* Badge 3: AI Risk Score */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-4.5 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col items-center justify-center text-center min-h-[190px] shadow-xl transition-all duration-300"
              >
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="rgba(107, 91, 149, 0.15)" strokeWidth="3" fill="none" />
                    <motion.circle 
                      cx="24" 
                      cy="24" 
                      r="20" 
                      stroke="#87c7a1" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeDasharray="125" 
                      initial={{ strokeDashoffset: 125 }}
                      whileInView={{ strokeDashoffset: 12 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-[#1a1a1a]">94</span>
                </div>
                <h3 className="font-extrabold text-[11px] text-[#1a1a1a] mt-3 leading-snug">
                  AI Risk Score
                </h3>
                <span className="text-[9px] text-[#7a7a7a] font-semibold mt-1">Score: 94/100</span>
              </motion.div>

              {/* Badge 4: Secure Payments */}
              <motion.div 
                variants={cardEntranceVariants}
                whileHover={{ y: -6, borderColor: "rgba(107, 91, 149, 0.25)", backgroundColor: "rgba(244, 240, 237, 0.8)" }}
                className="p-4.5 rounded-2xl bg-white/60 border border-[#e8e0dd] flex flex-col items-center justify-center text-center min-h-[190px] shadow-xl transition-all duration-300"
              >
                <ShieldIcon />
                <h3 className="font-extrabold text-[11px] text-[#1a1a1a] mt-3 leading-snug">
                  Secure Payments
                </h3>
                <span className="text-[9px] text-[#7a7a7a] font-semibold mt-1">Fully Encrypted</span>
              </motion.div>

            </motion.div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="w-full border-t border-[#e8e0dd] py-6 text-center text-xs text-[#7a7a7a] z-10 backdrop-blur-md"
      >
        <p>&copy; {new Date().getFullYear()} MediTrust AI. Verified Medical Crowdfunding Registry. Deployed via Firebase.</p>
      </motion.footer>
    </div>
  );
}
