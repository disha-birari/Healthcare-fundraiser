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
    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className="relative min-h-screen bg-[#05060b] text-zinc-100 flex items-center justify-center p-4 overflow-hidden bg-grid-medical">
      
      {/* Background ambient light blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-teal-950/25 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-emerald-950/25 blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 rounded-3xl glass-panel relative overflow-hidden">
        
        {/* Top color accent strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mx-auto mb-4">
            <LockIcon />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase">
            MediTrust Secure Access
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Authorized clinical personnel and patients only.</p>
        </div>

        {/* Role tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl bg-zinc-950/70 border border-white/[0.04] mb-6">
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
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-950/30'
                  : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-50'
              }`}
            >
              {r === 'patient' ? 'Client' : r}
            </button>
          ))}
        </div>

        {/* Auth form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center animate-pulse">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-medium text-center animate-fade-in">
              ⚠ {errorMsg}
            </div>
          )}

          {/* Email input */}
          <div>
            <label htmlFor="email-login" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Email Address</label>
            <input
              id="email-login"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@meditrust.com"
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-teal-500 focus:bg-teal-950/5 transition-all"
            />
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password-login" className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Password</label>
            <input
              id="password-login"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-teal-500 focus:bg-teal-950/5 transition-all"
            />
          </div>

          {/* Clinical License for Doctor */}
          {role === 'doctor' && (
            <div className="animate-fade-in">
              <label htmlFor="license-id" className="block text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1.5">Hospital License ID (Required)</label>
              <input
                id="license-id"
                type="text"
                required
                disabled={loading}
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                placeholder="LIC-9240-AP"
                className="w-full bg-teal-950/5 border border-teal-500/20 rounded-xl px-4 py-3 text-xs text-teal-200 placeholder-teal-800 focus:outline-none focus:border-teal-400 transition-all font-mono"
              />
            </div>
          )}

          {/* Enterprise Keys for Admin */}
          {role === 'admin' && (
            <div className="animate-fade-in">
              <label htmlFor="admin-token" className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">Hospital Enterprise Token (Required)</label>
              <input
                id="admin-token"
                type="text"
                required
                disabled={loading}
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
                placeholder="ADM-6629-EM"
                className="w-full bg-emerald-950/5 border border-emerald-500/20 rounded-xl px-4 py-3 text-xs text-emerald-200 placeholder-emerald-800 focus:outline-none focus:border-emerald-400 transition-all font-mono"
              />
            </div>
          )}

          {/* Submit action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-teal-950/30 flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {mode === 'signin' ? `Sign In As ${role}` : `Register Workspace`}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 text-center">
          <hr className="border-white/[0.05]" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0a0c14] px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
            Or Sync Oauth
          </span>
        </div>

        {/* Google Sync */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
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
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest cursor-pointer disabled:opacity-50"
          >
            {mode === 'signin' ? 'Create New Workspace Account' : 'Already registered? Return to Login'}
          </button>
        </div>

      </div>

      {/* Return home link */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
        <Link href="/" className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
          &larr; Return to Landing Page
        </Link>
      </div>
    </div>
  );
}
