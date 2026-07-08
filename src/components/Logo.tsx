import React from 'react';
import { Gem } from 'lucide-react';

export const Logo: React.FC<{ className?: string; variant?: 'default' | 'compact' }> = ({ className = '', variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex items-center justify-center w-10 h-10 bg-black rounded-full border border-[#D4AF37]/50 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
          <Gem size={20} className="text-gray-200" strokeWidth={1.5} />
          <div className="absolute top-[60%] w-6 h-3 border-t-[1.5px] border-[#D4AF37] rounded-[100%] rotate-[-15deg] opacity-80"></div>
          <div className="absolute top-[60%] w-6 h-3 border-t-[1.5px] border-[#F9F6EE] rounded-[100%] rotate-[15deg] opacity-70"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg tracking-wider font-black bg-clip-text text-transparent bg-gradient-to-b from-[#FFF0C2] via-[#D4AF37] to-[#996515]">
            SVJ
          </span>
          <span className="font-sans text-[8px] tracking-[0.1em] uppercase text-[#D4AF37] font-medium leading-none">
            Jewellery's
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center bg-[#0B0B0B] p-6 rounded-xl border border-[#D4AF37]/20 shadow-[0_10px_40px_rgba(212,175,55,0.15)] ${className}`}>
      {/* Top Graphic: Diamond & Swirls */}
      <div className="relative mb-3 flex flex-col items-center mt-2">
        {/* Sparkles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-5 text-yellow-200 text-sm animate-pulse">✦</div>
        <div className="absolute top-4 left-0 -translate-x-6 text-yellow-400 text-xs animate-ping">✦</div>
        <div className="absolute top-4 right-0 translate-x-6 text-yellow-300 text-xs animate-pulse delay-75">✦</div>
        
        <Gem size={56} className="text-gray-100 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] z-10" strokeWidth={1} />
        
        {/* Golden Swirls under Diamond */}
        <div className="absolute top-[60%] w-32 h-16 border-t-2 border-[#D4AF37] rounded-[100%] rotate-[-15deg] opacity-90 shadow-[0_0_10px_rgba(212,175,55,0.4)]"></div>
        <div className="absolute top-[60%] w-32 h-16 border-t-2 border-[#F9F6EE] rounded-[100%] rotate-[15deg] opacity-80 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
        <div className="absolute top-[75%] w-24 h-12 border-t-[1.5px] border-[#B8860B] rounded-[100%] opacity-90"></div>
      </div>

      {/* SVJ Main Text */}
      <h1 className="font-serif text-6xl sm:text-7xl tracking-[0.15em] font-black uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFF0C2] via-[#D4AF37] to-[#996515] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
        SVJ
      </h1>

      {/* Separator Line */}
      <div className="w-full max-w-[320px] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-3 opacity-80"></div>

      {/* Secondary Text */}
      <h2 className="font-serif text-xs sm:text-sm tracking-[0.25em] uppercase text-[#D4AF37] mb-3 font-medium text-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        Sri Venkateswara Jewellery's
      </h2>

      {/* Separator Line */}
      <div className="w-full max-w-[260px] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-3 opacity-50"></div>

      {/* Tertiary Text */}
      <p className="font-sans text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-gray-400 font-light text-center">
        Gold, Diamond & Silver Shop
      </p>
    </div>
  );
};
