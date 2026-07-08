import React, { useState } from 'react';
import { Profile, StoreSettings } from '../types';
import { 
  Mail, Lock, CheckCircle, Gem, ArrowRight, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { updateProfile, getProfiles, isRealSupabaseConnected, supabase } from '../lib/supabase';
import { Logo } from './Logo';

interface CustomerLoginGateProps {
  settings: StoreSettings;
  onLoginSuccess: (profile: Profile) => void;
}

export const CustomerLoginGate: React.FC<CustomerLoginGateProps> = ({
  settings,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Errors
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper: SHA-256 hash via Web Crypto API (cryptographic strength)
  const sha256Hash = async (str: string): Promise<string> => {
    const data = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Fallback: djb2 hash for backward compatibility with existing stored hashes
  const djb2Hash = (str: string): string => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash * 33) & 0xffffffff) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  };

  const getPasswordsMap = (): Record<string, string> => {
    const defaultMap: Record<string, string> = {
      'lakkireddysanjeevareddy8@gmail.com': '8159cfaa',
      'sanjeev.lakkireddy@gmail.com': 'eb039695',
      'guest.jewellery@gmail.com': 'f563505',
      'svj.rajampet@gmail.com': '46385e48',
      'kothurubharath@gmail.com': '46385e48'
    };
    try {
      const raw = localStorage.getItem('svj_passwords');
      if (raw) {
        return { ...defaultMap, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.error('Error parsing svj_passwords', e);
    }
    return defaultMap;
  };

  // Helper: Save password with SHA-256 hash
  const savePassword = async (userEmail: string, pass: string) => {
    const map = getPasswordsMap();
    map[userEmail.toLowerCase().trim()] = await sha256Hash(pass);
    localStorage.setItem('svj_passwords', JSON.stringify(map));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const emailLower = email.trim().toLowerCase();
    
    if (!emailLower.includes('@')) {
      setError('Please provide a valid email.');
      setIsSubmitting(false);
      return;
    }

    try {
      const allProfiles = await getProfiles();
      const passwords = getPasswordsMap();

      const found = allProfiles.find(p => p.email.toLowerCase() === emailLower);
      if (!found) {
        setError('This email is not registered yet. Please contact support to register your account.');
        setIsSubmitting(false);
        return;
      }
      const registeredHash = passwords[emailLower] || '8159cfaa';
      // Try SHA-256 first, fall back to djb2 for backward compatibility
      const sha256Result = await sha256Hash(password);
      const djb2Result = djb2Hash(password);
      if (registeredHash !== sha256Result && registeredHash !== djb2Result) {
        setError('Incorrect password. Please verify and try again.');
        setIsSubmitting(false);
        return;
      }
      // Auto-upgrade: if matched via djb2, re-save with SHA-256
      if (registeredHash === djb2Result && registeredHash !== sha256Result) {
        await savePassword(emailLower, password);
      }

      setSuccessMsg('Welcome back!');
      await new Promise(r => setTimeout(r, 600));
      onLoginSuccess(found);
    } catch (err) {
      setError('Connection failure. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);

    if (isRealSupabaseConnected && supabase) {
      setIsSubmitting(true);
      try {
        // Trigger real Supabase OAuth redirect login
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (oauthError) {
          setError(oauthError.message);
        }
      } catch (err) {
        setError('Connection failure during Google Login. Try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Prevent automatic dashboard bypass in simulation mode.
      // Require the user to configure Supabase in order to use Google Authentication.
      setError('Google Authentication is disabled because Supabase is not connected. To use Google Sign-In, please create a `.env` file at the root of the project and define your actual `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` credentials.');
    }
  };

  const primaryColor = settings.dynamic_theme.primary;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row bg-stone-50 lg:bg-stone-950 font-sans text-[#1A1A1A]">
      
      {/* 1. LEFT SPLASH SCREEN PANEL */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-cover bg-center text-white border-r border-stone-850" 
        style={{ backgroundImage: `linear-gradient(to right, rgba(12, 10, 9, 0.96), rgba(24, 20, 18, 0.3)), url('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200')` }}
      >
        <div className="flex items-center gap-3">
          <Logo variant="compact" />
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] rounded-none text-[10px] uppercase font-mono tracking-wider">
            <Gem className="h-3 w-3 animate-pulse" />
            BIS 916 Hallmarked Heritage
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-medium tracking-tight leading-none text-stone-100">
            Heritage Ornaments <br/>
            <span className="italic text-[#D4AF37]">Verified Authenticated.</span>
          </h1>
          <p className="text-stone-300 text-xs font-serif leading-relaxed italic font-light">
            Welcome to Sri Venkateswara Jewellers' secure customer showroom. Experience flawless transparency, access historical purchase analytics, or discover our standard certified BIS-916 gold collections.
          </p>
        </div>

        <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest flex items-center gap-3">
          <span>HUID compliant</span>
          <span>•</span>
          <span>Sri Venkateswara Jewellers © 2026</span>
        </div>
      </div>

      {/* 2. RIGHT AUTHENTICATION COMPACT CONTAINER */}
      <div className="w-full lg:w-1/2 flex flex-col justify-start lg:justify-center items-center p-4 py-8 sm:p-10 md:p-16 bg-stone-50 min-h-full">
        <div className="max-w-md w-full mx-auto space-y-6">
          
          {/* Logo representation on mobile */}
          <div className="flex lg:hidden items-center justify-between border-b border-stone-200 pb-4 mb-2">
            <div className="flex items-center gap-2.5">
              <Logo variant="compact" className="scale-75 origin-left" />
            </div>
            <span className="text-[8px] font-mono bg-stone-150 border border-stone-250 text-stone-500 px-2 py-0.5 rounded-none uppercase">
              Secure Access
            </span>
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-950 tracking-tight leading-tight">
              Welcome Back
            </h2>
            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              Sign in to access your customized product list, pooja preferences, and secure invoice desk.
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-800 border border-rose-500/20 font-mono leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {successMsg && (
            <div className="rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-800 border border-emerald-500/20 flex items-center gap-2 font-mono font-bold">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-3 bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
              
              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-stone-450 uppercase font-mono tracking-wider">Email Address</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2.5 text-xs font-mono focus:border-stone-500 focus:outline-hidden focus:bg-white transition-all text-stone-850"
                    placeholder="e.g. customer@gmail.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-bold text-stone-450 uppercase font-mono tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-stone-400 hover:text-[#936C31] transition-colors p-0.5 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2.5 text-xs font-mono focus:border-stone-500 focus:outline-hidden focus:bg-white transition-all text-stone-850"
                    placeholder="••••••••"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stone-900 hover:bg-[#936C31] text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              <span>Verify and Authenticate</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <span className="relative px-3 bg-stone-50 text-[10px] uppercase font-mono text-stone-400">
              Or Continue With
            </span>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full border border-stone-300 hover:border-stone-450 bg-white hover:bg-stone-100/50 text-stone-800 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer flex items-center justify-center gap-3 shadow-xs active:scale-98 disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.75 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                <path d="M12,20.8c2.38,0 4.37,-0.78 5.82,-2.12l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.32,0.98c-2.28,0 -4.22,-1.54 -4.9,-3.62H2.9v2.66C4.36,19.04 7.95,20.8 12,20.8z" fill="#34A853" />
                <path d="M7.1,13.46c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.4H2.9C2.3,8.6 1.96,9.97 1.96,11.4c0,1.43 0.34,2.8 0.94,4l4.2,-3.34Z" fill="#FBBC05" />
                <path d="M12,6.3c1.29,0 2.45,0.44 3.36,1.3l2.52,-2.52C16.36,3.64 14.37,3 12,3C7.95,3 4.36,4.76 2.9,7.4l4.2,3.34C7.78,7.84 9.72,6.3 12,6.3z" fill="#EA4335" />
              </g>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Trust assurances */}
          <div className="pt-4 border-t border-stone-200 flex items-center gap-2 justify-center text-stone-450 text-[10px] font-mono uppercase">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted verification protocols active</span>
          </div>

        </div>
      </div>
    </div>
  );
};
