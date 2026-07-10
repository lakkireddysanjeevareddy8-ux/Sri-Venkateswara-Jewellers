import React, { useState, useEffect } from 'react';
import { Profile, StoreSettings, Product } from '../types';
import { X, User, Mail, Phone, CheckCircle, Save, ShieldAlert, Heart, Trash2, Globe, MapPin, Sparkles, LogIn, LogOut, ArrowRight, Lock } from 'lucide-react';
import { getProfiles, updateProfile } from '../lib/supabase';
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
  onToggleFavorite = () => { },
  onSelectProduct = () => { },
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
  const [activeTab, setActiveTab] = useState<'profile' | 'wishlist'>('profile');

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
      'lakkireddysanjeevareddy8@gmail.com': 'password123',
      'sanjeev.lakkireddy@gmail.com': 'sanjeev123',
      'guest.jewellery@gmail.com': 'guest123'
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
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

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

      {/* Tab Navigation (Only visible when activeProfile is logged in) */}
      {activeProfile && (
        <div className="flex border-b border-stone-200 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'profile'
                ? 'border-[#936C31] text-[#936C31]'
                : 'border-transparent text-stone-450 hover:text-stone-700'
              }`}
            style={{
              borderColor: activeTab === 'profile' ? primaryColor : 'transparent',
              color: activeTab === 'profile' ? primaryColor : undefined
            }}
          >
            <User className="h-4 w-4" />
            My Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider font-mono border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer ${activeTab === 'wishlist'
                ? 'border-[#936C31] text-[#936C31]'
                : 'border-transparent text-stone-450 hover:text-stone-700'
              }`}
            style={{
              borderColor: activeTab === 'wishlist' ? primaryColor : 'transparent',
              color: activeTab === 'wishlist' ? primaryColor : undefined
            }}
          >
            <Heart className={`h-4 w-4 ${wishlist.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            My Wishlist ({wishlist.length})
          </button>
        </div>
      )}

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
          </form>
        </div>
      ) : activeTab === 'profile' ? (
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

          {/* Administration Access */}
          <div className="pt-6 border-t border-stone-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-stone-200 text-stone-700">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-bold text-stone-500 uppercase font-mono tracking-wider">
                Administration Portal
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed font-serif italic">
              Authorized personnel only. Access daily rate overrides, catalogue items manager, and visual style variables here.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full border border-[#1A1A1A] bg-[#1A1A1A] hover:bg-[#936C31] hover:border-[#936C31] text-white py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              Open Admin Dashboard
            </button>
          </div>
        </form>
      ) : (
        /* SAVED FAVORITES WISHLIST TAB */
        <div className="flex-1 p-6 space-y-4 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                {wishlistProducts.length} Saved {wishlistProducts.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>

            {wishlistProducts.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-stone-100 p-4 text-stone-450 border border-stone-200">
                  <Heart className="h-7 w-7 text-stone-300" />
                </div>
                <div>
                  <p className="font-serif text-sm italic text-stone-600">Your wishlist is currently empty.</p>
                  <p className="text-[11px] text-stone-450 mt-1.5 max-w-xs leading-relaxed">
                    Explore our curated catalog of precious gold and silver masterpieces, and tap the heart icon on any product card to save your favorite articles.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlistProducts.map((prod) => {
                  let currentRate = getRateForPurity(prod.purity_type, settings);
                  if (prod.offer_exclusive_rate && prod.offer_exclusive_rate > 0) {
                    currentRate = prod.offer_exclusive_rate;
                  } else if (settings.flat_offer_active) {
                    currentRate = getExclusiveOfferRateForPurity(prod.purity_type, settings);
                  }

                  // Stone/Metal custom pricing logic
                  const metalWeight = (prod.has_stone && prod.metal_weight_grams !== undefined && prod.metal_weight_grams > 0)
                    ? prod.metal_weight_grams
                    : prod.weight_grams;
                  const stonePrice = (prod.has_stone && prod.stone_price !== undefined)
                    ? prod.stone_price
                    : 0;

                  const onlyMetalPriceBase = metalWeight * currentRate;
                  const metalPriceWithMaking = onlyMetalPriceBase * (1 + prod.making_charge_percent / 100);

                  const basePrice = prod.has_stone
                    ? (metalPriceWithMaking + stonePrice)
                    : calculateJewelryPrice(prod.weight_grams, currentRate, prod.making_charge_percent);

                  const finalPrice = basePrice * 1.03; // Including 3% GST (1.5% CGST + 1.5% SGST) on the fully combined price
                  const formattedPrice = convertAndFormatPrice(finalPrice, selectedCurrency);

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center gap-3 bg-white border border-stone-200 p-2.5 rounded-xl hover:border-[#936C31]/50 hover:shadow-xs transition-all cursor-pointer group/item"
                      onClick={() => {
                        onSelectProduct(prod);
                        onClose(); // Close drawer so details open
                      }}
                    >
                      {/* Small image */}
                      <div className="h-14 w-14 rounded-lg overflow-hidden bg-stone-50 shrink-0 border border-stone-150">
                        <img
                          src={prod.image_urls[0] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=200'}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Metadata & Valuation */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm font-bold text-stone-900 truncate group-hover/item:text-[#936C31] transition-colors leading-snug">
                          {prod.name}
                        </h4>
                        <p className="text-[9px] uppercase font-mono tracking-wider text-stone-400 truncate mt-0.5">
                          {prod.purity_type} • {prod.weight_grams.toFixed(1)}g
                        </p>
                        <strong className="text-xs font-serif text-[#1A1A1A] block mt-0.5">
                          {formattedPrice}
                        </strong>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(prod.id);
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer rounded-full hover:bg-rose-50"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawer Footer */}
      {activeProfile && activeTab === 'profile' && (
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
