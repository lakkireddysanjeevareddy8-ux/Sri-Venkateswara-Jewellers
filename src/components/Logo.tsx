import React from 'react';
import { Gem } from 'lucide-react';

export const Logo: React.FC<{ className?: string; variant?: 'default' | 'compact' }> = ({ className = '', variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative flex flex-col items-center justify-center">
          <div className="flex items-start">
            <span className="font-serif text-2xl tracking-tight font-black bg-clip-text text-transparent bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600">
              S
            </span>
            <div className="flex flex-col items-center -ml-1 mt-1">
              <Gem size={10} className="text-gray-300 drop-shadow-[0_0_4px_rgba(255,255,255,0.4)] mb-[-2px]" strokeWidth={1} />
              <span className="font-serif text-2xl tracking-tight font-black bg-clip-text text-transparent bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 leading-[0.8]">
                j
              </span>
            </div>
          </div>
          <span className="font-sans text-[6px] tracking-[0.2em] uppercase text-gray-400 font-medium leading-none mt-1">
            Sri Venkateswara Jewellers
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center bg-[#0B0B0B] p-8 rounded-xl ${className}`}>
      {/* Sj Main Text */}
      <div className="relative mb-6 flex items-start">
        <span className="font-serif text-8xl tracking-tight font-black bg-clip-text text-transparent bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
          S
        </span>
        <div className="flex flex-col items-center -ml-3 mt-4">
          <Gem size={32} className="text-gray-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] mb-[-8px] z-10" strokeWidth={1} />
          <span className="font-serif text-8xl tracking-tight font-black bg-clip-text text-transparent bg-gradient-to-b from-gray-200 via-gray-400 to-gray-600 leading-[0.8] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            j
          </span>
        </div>
      </div>

      {/* Secondary Text */}
      <h2 className="font-serif text-sm sm:text-base tracking-[0.2em] text-gray-300 mb-1 font-light text-center filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        <span className="text-gray-200 font-medium">S</span>ri <span className="text-gray-200 font-medium">V</span>enkateswara <span className="text-gray-200 font-medium">J</span>ewellers
      </h2>
    </div>
  );
};

