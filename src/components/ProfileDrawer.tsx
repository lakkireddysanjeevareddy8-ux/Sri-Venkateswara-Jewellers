import React, { useState, useEffect } from 'react';
import { Profile, StoreSettings, Product } from '../types';
import { X, User, Mail, Phone, CheckCircle, Save, Heart, Trash2, Globe, MapPin, Sparkles, LogIn, LogOut, ArrowRight, Lock } from 'lucide-react';
import { getProfiles, updateProfile, supabase, isRealSupabaseConnected } from '../lib/supabase';
import { getRateForPurity, calculateJewelryPrice, getExclusiveOfferRateForPurity } from './ProductCard';
import { CurrencyCode, CURRENCIES, convertAndFormatPrice } from '../lib/currency';

interface ProfileDrawerProps {
  settings: StoreSettings;
  activeProfile: Profile | null;
  onLogin: (profile: Profile) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenAdmin: () => void;
  onProfileUpdated?: (profile?: Profile) => void;
  products?: Product[];
  wishlist?: string[];
  onToggleFavorite?: (id: string) => void;
  onSelectProduct?: (product: Product) => void;
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  settings,
  activeProfile,
  onLogin,
  onLogout,
  onClose,
  onOpenAdmin,
  onProfileUpdated,
  products = [],
  wishlist = [],
  onToggleFavorite = (_id: string) => {},
  onSelectProduct = (_product: any) => {},
  selectedCurrency,
  onCurrencyChange
}) => {
  // Form Draft Profile State
  const [profile, setProfile] = useState<Profile>({
    id: '',
    username: '',
    email: '',
    phone_number: '+91 ',
    shipping_address: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);


  // Standard Login / Signup Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTab, setLoginTab] = useState<'signin' | 'signup'>('signin');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regAddress, setRegAddress] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auto-sync form state to activeProfile prop
  useEffect(() => {
    if (activeProfile) {
      setProfile(activeProfile);
    }
  }, [activeProfile]);

  // Helper: Retrieve passwords map
  const getPasswordsMap = (): Record<string, string> => {
    const defaultMap: Record<string, string> = {
      'pathanadnankhan09@gmail.com': 'password123',
      'srivenkateswarajewellers@gmail.com': 'password123',
      'lakkireddysanjeevareddy8@gmail.com': 'password123',
      'pathanfarhankhan3309@gmail.com': 'password123'
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

  // Helper: Save password
  const savePassword = (userEmail: string, pass: string) => {
    const map = getPasswordsMap();
    map[userEmail.toLowerCase().trim()] = pass;
    localStorage.setItem('svj_passwords', JSON.stringify(map));
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    const emailLower = loginEmail.trim().toLowerCase();
    if (!emailLower.includes('@')) {
      setLoginError('Please enter a valid email address.');
      setIsLoggingIn(false);
      return;
    }

    try {
      const allProfiles = await getProfiles();
      const passwords = getPasswordsMap();

      if (loginTab === 'signin') {
        const found = allProfiles.find(p => p.email.toLowerCase() === emailLower);
        if (!found) {
          setLoginError('This email is not registered yet. Switch to "Create Account" tab.');
          setIsLoggingIn(false);
          return;
        }
        const registeredPassword = passwords[emailLower] || 'password123';
        if (registeredPassword !== loginPassword) {
          setLoginError('Incorrect password. Please verify and try again.');
          setIsLoggingIn(false);
          return;
        }
        onLogin(found);
      } else {
        const found = allProfiles.find(p => p.email.toLowerCase() === emailLower);
        if (found) {
          setLoginError('Email already registered. Sign in instead.');
          setIsLoggingIn(false);
          return;
        }
        if (!regName.trim()) {
          setLoginError('Please provide your name.');
          setIsLoggingIn(false);
          return;
        }

        const newProfile: Profile = {
          id: 'p-' + Date.now(),
          username: regName.trim(),
          email: emailLower,
          phone_number: regPhone.trim() || '+91 99008 87766',
          shipping_address: regAddress.trim() || undefined
        };

        savePassword(emailLower, loginPassword);
        await updateProfile(newProfile);
        onLogin(newProfile);
      }

      setLoginEmail('');
      setLoginPassword('');
      setRegName('');
      setRegPhone('');
      setRegAddress('');
      if (onProfileUpdated) {
        onProfileUpdated();
      }
    } catch (err) {
      console.error(err);
      setLoginError('Connection failure. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;

    setIsSaving(true);
    try {
      await updateProfile(profile);
      setSaveSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(profile);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Error saving profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const primaryColor = settings.dynamic_theme.primary;
  const secondaryColor = settings.dynamic_theme.secondary;


  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-50 shadow-2xl border-l border-stone-200 flex flex-col justify-between overflow-hidden">
      {/* Drawer Header */}
      <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full p-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              {activeProfile ? 'My Client Account' : 'Client Account Portal'}
            </h2>
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
              {activeProfile ? 'Configure your profile' : 'Secure Client Verification'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-stone-100 p-2 text-stone-500 hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>



      {/* Drawer Body - Tabs Content or Google Login Form */}
      {!activeProfile ? (
        /* STANDARD SIGN-IN / SIGN-UP COMPONENT */
        <div className="flex-1 p-6 space-y-6 overflow-y-auto flex flex-col justify-start">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-lg font-bold text-stone-850 tracking-tight leading-snug">
              Access Your Showroom Profile
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Verify your client credentials to save and retrieve favorite jewelry items and purchase alerts.
            </p>
          </div>

          {/* Inline Tabs */}
          <div className="flex bg-stone-200 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setLoginTab('signin');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${loginTab === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-850'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginTab('signup');
                setLoginError(null);
              }}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono transition-all rounded-lg flex items-center justify-center gap-2 cursor-pointer ${loginTab === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-850'
                }`}
            >
              Register
            </button>
          </div>

          {loginError && (
            <div className="rounded-xl bg-rose-500/10 p-3.5 text-xs text-rose-800 border border-rose-500/20 font-mono leading-relaxed">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-4" autoComplete="off">
            <div className="space-y-3 bg-white p-5 border border-stone-200 rounded-2xl shadow-xs">
              {/* Name (Registration Only) */}
              {loginTab === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold text-stone-450 uppercase font-mono tracking-wider">Your Full Name</label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      autoComplete="off"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden text-stone-850 font-serif font-bold"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

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
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs font-mono focus:border-stone-500 focus:outline-hidden text-stone-850"
                    placeholder="e.g. customer@gmail.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold text-stone-450 uppercase font-mono tracking-wider">Password</label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs font-mono focus:border-stone-500 focus:outline-hidden text-stone-850"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Phone & Address (Registration Only) */}
              {loginTab === 'signup' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-450 uppercase font-mono tracking-wider">Phone Number</label>
                    <div className="relative mt-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (!val.startsWith('+91 ')) {
                            val = '+91 ' + val.replace(/^\+?9?1?\s*/, '').trimStart();
                          }
                          setRegPhone(val);
                        }}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs font-mono focus:border-stone-500 focus:outline-hidden text-stone-850"
                        placeholder="+91 99008 87766"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-stone-450 uppercase font-mono tracking-wider">Shipping Address</label>
                    <div className="relative mt-1">
                      <span className="absolute top-2.5 left-3 text-stone-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <textarea
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden text-stone-850 h-14 resize-none font-sans"
                        placeholder="Enter delivery pooja / ornaments address"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-stone-900 hover:bg-[#936C31] text-white py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              style={{ backgroundColor: primaryColor }}
            >
              <span>{loginTab === 'signin' ? 'Verify and Authenticate' : 'Register and Login'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-stone-50 px-3 text-stone-500 uppercase tracking-widest font-mono text-[10px]">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (isRealSupabaseConnected && supabase) {
                  try {
                    const { error: oauthError } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: {
                        redirectTo: window.location.origin
                      }
                    });
                    if (oauthError) {
                      alert(oauthError.message);
                    }
                  } catch (err) {
                    alert('Connection failure during Google Login. Try again.');
                  }
                } else {
                  alert('Google Authentication is disabled because Supabase is not connected. To use Google Sign-In, please create a `.env` file at the root of the project and define your actual `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` credentials.');
                }
              }}
              className="w-full bg-white hover:bg-stone-50 text-stone-700 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl border border-stone-200 cursor-pointer flex items-center justify-center gap-3 shadow-xs"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
          </form>
        </div>
      ) : (
        /* LOGGED IN PROFILE FORM VIEW */
        <form onSubmit={handleSave} className="flex-1 p-6 space-y-6 overflow-y-auto">
          {saveSuccess && (
            <div className="rounded-xl bg-emerald-500/10 p-4 text-xs text-emerald-800 border border-emerald-500/20 flex items-center gap-2 font-mono font-bold">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Profile successfully written and updated on Supabase servers!</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase font-mono tracking-wider">
                Username
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-2.5 text-xs font-serif font-bold focus:border-stone-500 focus:outline-hidden"
                  placeholder="Enter display name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase font-mono tracking-wider">
                Email Address
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full rounded-lg border border-stone-200 bg-stone-150 pl-9 pr-3 py-2.5 text-xs text-stone-500 font-mono cursor-not-allowed focus:outline-hidden"
                />
              </div>
              <p className="text-[10px] text-stone-400 font-mono mt-1">Registered Customer Email</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase font-mono tracking-wider">
                Phone Number (for WhatsApp enquiries)
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profile.phone_number}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (!val.startsWith('+91 ')) {
                      val = '+91 ' + val.replace(/^\+?9?1?\s*/, '').trimStart();
                    }
                    setProfile({ ...profile, phone_number: val });
                  }}
                  className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-2.5 text-xs focus:border-stone-500 focus:outline-hidden"
                  placeholder="+91 "
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase font-mono tracking-wider">
                Shipping Address
              </label>
              <div className="relative mt-1">
                <span className="absolute top-3 left-3 text-stone-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <textarea
                  value={profile.shipping_address || ''}
                  onChange={(e) => setProfile({ ...profile, shipping_address: e.target.value })}
                  className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-2.5 text-xs focus:border-stone-500 focus:outline-hidden h-20 resize-none font-sans"
                  placeholder="Enter your complete delivery address"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase font-mono tracking-wider">
                Preferred Valuation Currency
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
                  <Globe className="h-4 w-4" />
                </span>
                <select
                  value={selectedCurrency}
                  onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                  className="w-full rounded-lg border border-stone-300 bg-white pl-9 pr-3 py-2.5 text-xs focus:border-stone-500 focus:outline-hidden cursor-pointer font-sans"
                >
                  {Object.values(CURRENCIES).map((cur) => (
                    <option key={cur.code} value={cur.code}>
                      {cur.name} ({cur.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-stone-100 p-4 border border-stone-200 text-xs text-stone-600 font-mono space-y-1.5">
            <p className="font-bold uppercase tracking-wider text-stone-700 text-[10px]">Active Privileges</p>
            <p className="leading-relaxed text-[11px]">
              Updating these credentials binds client profile data directly into our server state, allowing store managers to review transaction logs and track your customized item preferences instantly.
            </p>
          </div>

          {/* Sign Out Action */}
          <div className="pt-6 border-t border-stone-200">
            <button
              type="button"
              onClick={onLogout}
              className="w-full border border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 text-red-700 py-2.5 text-xs font-bold uppercase tracking-wider font-mono transition-all rounded-xl cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out from Showroom
            </button>
          </div>
        </form>
      )}

      {/* Drawer Footer */}
      {activeProfile && (
        <div className="p-6 border-t border-stone-200 bg-white shrink-0">
          <button
            type="submit"
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="h-4.5 w-4.5" />
            {isSaving ? 'Writing changes...' : 'Save Profile Settings'}
          </button>
        </div>
      )}
    </div>
  );
};
