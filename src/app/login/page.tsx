'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

type Role = 'patient' | 'doctor' | 'admin';
type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const [role, setRole] = useState<Role>('patient');
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extraField, setExtraField] = useState(''); // License ID or Admin Token
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please populate all required fields.');
      return;
    }

    if ((role === 'doctor' || role === 'admin') && !extraField) {
      setErrorMsg(`Clinical verification code is required for ${role} access.`);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signin') {
        // Sign in with Firebase Auth
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMsg(`Access Granted! Welcome back to the ${role.toUpperCase()} Workspace.`);
        
        // Redirect to newly relocated dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1800);
      } else {
        // Register in Firebase Auth
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMsg(`Account registered successfully as ${role.toUpperCase()} in disha21 database.`);
        
        setTimeout(() => {
          setMode('signin');
          setLoading(false);
        }, 2200);
      }
    } catch (error: any) {
      console.error(error);
      let cleanMsg = error.message || 'Authentication failed. Please check credentials.';
      if (error.code === 'auth/email-already-in-use') {
        cleanMsg = 'An account with this email address already exists.';
      } else if (error.code === 'auth/invalid-credential') {
        cleanMsg = 'Invalid email or password. Please verify credentials.';
      } else if (error.code === 'auth/weak-password') {
        cleanMsg = 'Password must be at least 6 characters long.';
      }
      setErrorMsg(cleanMsg);
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSuccessMsg(`Oauth complete. Authenticated as ${role.toUpperCase()}!`);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1800);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Google Auth aborted.');
      setLoading(false);
    }
  };

  const LockIcon = () => (
    <svg className="w-8 h-8 text-[#6b5b95]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className="relative min-h-screen bg-[#fdf8f5] text-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden">
      
      {/* Background ambient light blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-[#b8a4d4]/25 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-[#87c7a1]/25 blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-[#e8e0dd] shadow-xl relative overflow-hidden">
        
        {/* Top color accent strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#6b5b95] via-[#b8a4d4] to-[#87c7a1]" />
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#f4f0ed] border border-[#e8e0dd] flex items-center justify-center mx-auto mb-4">
            <LockIcon />
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1a1a1a] uppercase">
            MediTrust Secure Access
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1">Authorized clinical personnel and patients only.</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-[#f4f0ed] border border-[#e8e0dd] mb-6">
          {(['patient', 'doctor', 'admin'] as const).map((r) => (
            <button
              key={r}
              disabled={loading}
              onClick={() => {
                setRole(r);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2.5 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                role === r
                  ? 'bg-gradient-to-r from-[#6b5b95] to-[#87c7a1] text-white shadow-lg shadow-[#6b5b95]/20'
                  : 'text-[#7a7a7a] hover:text-[#1a1a1a] disabled:opacity-50'
              }`}
            >
              {r === 'patient' ? 'Client' : r}
            </button>
          ))}
        </div>

        {/* Auth form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-[#87c7a1]/20 border border-[#87c7a1]/50 text-[#6b5b95] text-xs font-medium text-center animate-pulse">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#e66465]/10 border border-[#e66465]/30 text-[#e66465] text-xs font-medium text-center animate-fade-in">
              ⚠ {errorMsg}
            </div>
          )}

          {/* Email input */}
          <div>
            <label htmlFor="email-login" className="block text-[10px] font-bold text-[#7a7a7a] uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              id="email-login"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@meditrust.com"
              className="w-full bg-[#fdf8f5] border border-[#e8e0dd] rounded-xl px-4 py-3 text-xs text-[#1a1a1a] placeholder-[#7a7a7a] focus:outline-none focus:border-[#6b5b95] focus:bg-[#b8a4d4]/10 transition-all"
            />
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password-login" className="block text-[10px] font-bold text-[#7a7a7a] uppercase tracking-widest mb-1.5">Password</label>
            <input
              id="password-login"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#fdf8f5] border border-[#e8e0dd] rounded-xl px-4 py-3 text-xs text-[#1a1a1a] placeholder-[#7a7a7a] focus:outline-none focus:border-[#6b5b95] focus:bg-[#b8a4d4]/10 transition-all"
            />
          </div>

          {/* Clinical License for Doctor */}
          {role === 'doctor' && (
            <div className="animate-fade-in">
              <label htmlFor="license-id" className="block text-[10px] font-bold text-[#6b5b95] uppercase tracking-widest mb-1.5">Hospital License ID (Required)</label>
              <input
                id="license-id"
                type="text"
                required
                disabled={loading}
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                placeholder="LIC-9240-AP"
                className="w-full bg-[#b8a4d4]/10 border border-[#6b5b95]/30 rounded-xl px-4 py-3 text-xs text-[#1a1a1a] placeholder-[#7a7a7a] focus:outline-none focus:border-[#6b5b95] transition-all font-mono"
              />
            </div>
          )}

          {/* Enterprise Keys for Admin */}
          {role === 'admin' && (
            <div className="animate-fade-in">
              <label htmlFor="admin-token" className="block text-[10px] font-bold text-[#87c7a1] uppercase tracking-widest mb-1.5">Hospital Enterprise Token (Required)</label>
              <input
                id="admin-token"
                type="text"
                required
                disabled={loading}
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                placeholder="ADM-6629-EM"
                className="w-full bg-[#87c7a1]/10 border border-[#87c7a1]/30 rounded-xl px-4 py-3 text-xs text-[#1a1a1a] placeholder-[#7a7a7a] focus:outline-none focus:border-[#87c7a1] transition-all font-mono"
              />
            </div>
          )}

          {/* Submit action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-[#6b5b95] to-[#87c7a1] hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#6b5b95]/20 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {mode === 'signin' ? `Sign In As ${role}` : `Register Workspace`}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <hr className="border-[#e8e0dd]" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold text-[#7a7a7a] uppercase tracking-wider whitespace-nowrap">
            Or Sync Oauth
          </span>
        </div>

        {/* Google Sync */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[#f4f0ed] border border-[#e8e0dd] hover:bg-[#e8e0dd] text-[#1a1a1a] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.111 4.113-3.414 0-6.19-2.775-6.19-6.19 0-3.414 2.776-6.19 6.19-6.19 1.484 0 2.825.526 3.882 1.39l2.943-2.944C18.17 2.68 15.36 1.8 12.24 1.8c-5.633 0-10.2 4.567-10.2 10.2s4.567 10.2 10.2 10.2c5.88 0 9.8-4.133 9.8-9.975 0-.671-.06-1.31-.17-1.94H12.24z"/>
          </svg>
          Google Identity Sync
        </button>

        {/* Toggle signin / signup */}
        <div className="text-center mt-6">
          <button
            disabled={loading}
            onClick={() => {
              setMode(prev => prev === 'signin' ? 'signup' : 'signin');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-[10px] font-bold text-[#6b5b95] hover:text-[#87c7a1] uppercase tracking-widest cursor-pointer disabled:opacity-50"
          >
            {mode === 'signin' ? 'Create New Workspace Account' : 'Already registered? Return to Login'}
          </button>
        </div>

      </div>

      {/* Return home link */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <Link href="/" className="text-[10px] font-bold text-[#7a7a7a] hover:text-[#1a1a1a] uppercase tracking-widest flex items-center gap-1.5">
          &larr; Return to Landing Page
        </Link>
      </div>
    </div>
  );
}
