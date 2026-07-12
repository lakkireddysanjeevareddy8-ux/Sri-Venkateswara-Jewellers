import React from 'react';

export const Logo: React.FC<{ className?: string; variant?: 'default' | 'compact' }> = ({ className = '', variant = 'default' }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img 
          src="/logo.jpg" 
          alt="Sri Venkateswara Jewellers Logo" 
          className="h-10 w-auto object-contain drop-shadow-md"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center bg-[#0B0B0B] p-4 rounded-xl ${className}`}>
      <img 
        src="/logo.jpg" 
        alt="Sri Venkateswara Jewellers Logo" 
        className="h-32 sm:h-48 w-auto object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
};

