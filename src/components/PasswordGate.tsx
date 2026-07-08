import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Lock, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';

interface PasswordGateProps {
  settings: StoreSettings;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ settings, onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get the configured password from database, defaulting to "Sanju@1234"
    const activePassword = settings.admin_password || 'Sanju@1234';

    // Get the master bypass key from environment or default to "Sanju@1234"
    const masterBypass = (import.meta as any).env?.VITE_MASTER_BYPASS_KEY || 'Sanju@1234';

    if (password === activePassword || password === masterBypass) {
      onSuccess();
    } else {
      setError('Invalid passkey. Access to the luxury admin panel remains securely sealed.');
    }
  };

  const primaryColor = settings.dynamic_theme.primary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 p-6.5 text-stone-200 shadow-2xl relative overflow-hidden">
        {/* Luxury Background elements */}
        <div className="absolute top-0 right-0 h-32 w-32 translate-y-[-20%] translate-x-[20%] rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 translate-y-[20%] translate-x-[-20%] rounded-full bg-amber-500/5 blur-3xl" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div
            className="rounded-full p-4.5 text-stone-950 shadow-lg animate-pulse"
            style={{ backgroundColor: primaryColor }}
          >
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-serif text-xl font-bold tracking-wide text-amber-100">
            Secure Admin Vault Access
          </h2>
          <p className="mt-1.5 text-xs text-stone-400 max-w-xs font-sans">
            Please enter your administrative passkey to customize metal rates, active themes, and inventory.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-center text-xs font-medium text-rose-400 border border-rose-500/20 font-mono">
              {error}
            </div>
          )}

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter admin passkey..."
              className="w-full rounded-xl border border-stone-850 bg-stone-950 px-4 py-3.5 pr-12 text-sm text-amber-100 placeholder-stone-600 focus:border-amber-500 focus:outline-hidden font-mono tracking-widest text-center"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-stone-500 hover:text-stone-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl bg-stone-850 py-3 text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Exit Showroom
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl py-3 text-xs font-bold text-stone-950 shadow-md transition-all hover:scale-102 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              Unlock Vault
            </button>
          </div>
        </form>

        {/* Info Footnote */}
        <div className="mt-6 flex items-start gap-2 border-t border-stone-800 pt-4.5 text-[10px] text-stone-500 font-mono leading-relaxed">
          <ShieldCheck className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            Bypassing active database passkeys is securely supported via encrypted environment master tokens. Authorized personnel only.
          </span>
        </div>
      </div>
    </div>
  );
};
