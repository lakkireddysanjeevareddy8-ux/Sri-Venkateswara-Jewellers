import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, HeartOff, Check, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  description?: string;
  type: 'wishlist_add' | 'wishlist_remove' | 'success' | 'info';
  productImage?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
  primaryColor?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove, primaryColor = '#936C31' }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-md px-4 sm:px-0 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const isWishlistAdd = toast.type === 'wishlist_add';
          const isWishlistRemove = toast.type === 'wishlist_remove';

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full bg-stone-900/95 backdrop-blur-md border border-stone-800 text-white rounded-2xl shadow-xl overflow-hidden flex"
              style={{
                borderLeft: `4px solid ${isWishlistAdd ? '#F43F5E' : isWishlistRemove ? '#78716C' : primaryColor}`
              }}
            >
              <div className="p-4 flex gap-3.5 items-start w-full">
                {/* Image/Icon section */}
                <div className="shrink-0 relative">
                  {toast.productImage ? (
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center">
                      <img 
                        src={toast.productImage} 
                        alt="" 
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {/* overlay heart icon */}
                      <span className="absolute -bottom-1 -right-1 bg-stone-900 border border-stone-800 p-0.5 rounded-full">
                        {isWishlistAdd ? (
                          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                        ) : isWishlistRemove ? (
                          <HeartOff className="h-3 w-3 text-stone-400" />
                        ) : (
                          <Check className="h-3 w-3 text-emerald-400" />
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isWishlistAdd 
                        ? 'bg-rose-500/10 text-rose-400' 
                        : isWishlistRemove 
                          ? 'bg-stone-500/10 text-stone-400' 
                          : 'bg-stone-500/10 text-stone-400'
                    }`}>
                      {isWishlistAdd ? (
                        <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
                      ) : isWishlistRemove ? (
                        <HeartOff className="h-5 w-5 text-stone-400" />
                      ) : (
                        <Info className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content section */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${
                      isWishlistAdd 
                        ? 'text-rose-400' 
                        : isWishlistRemove 
                          ? 'text-stone-400' 
                          : 'text-stone-300'
                    }`}>
                      {isWishlistAdd ? 'Saved to favorites' : isWishlistRemove ? 'Removed favorite' : 'Notification'}
                    </span>
                  </div>
                  <h6 className="text-[13px] font-extrabold text-white leading-tight mt-0.5 font-serif">
                    {toast.message}
                  </h6>
                  {toast.description && (
                    <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                      {toast.description}
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => onRemove(toast.id)}
                  className="shrink-0 p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
