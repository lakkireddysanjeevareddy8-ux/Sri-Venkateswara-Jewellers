import React from 'react';
import { X, Heart, Trash2 } from 'lucide-react';
import { Product, StoreSettings } from '../types';
import { getRateForPurity, calculateJewelryPrice, getExclusiveOfferRateForPurity } from './ProductCard';
import { CurrencyCode, convertAndFormatPrice } from '../lib/currency';

interface WishlistDrawerProps {
  settings: StoreSettings;
  wishlist: string[];
  products: Product[];
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectProduct: (p: Product) => void;
  selectedCurrency: CurrencyCode;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  settings,
  wishlist,
  products,
  onClose,
  onToggleFavorite,
  onSelectProduct,
  selectedCurrency,
}) => {
  const primaryColor = settings.dynamic_theme.primary;
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-stone-50 shadow-2xl border-l border-stone-200 flex flex-col justify-between overflow-hidden font-sans text-[#1A1A1A]">
      {/* Drawer Header */}
      <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="rounded-full p-2 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-stone-900">
              My Saved Wishlist
            </h2>
            <p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">
              Your Favorite Ornaments
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

      {/* Drawer Body - Saved Favorites List */}
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
                <p className="text-[11px] text-stone-450 mt-1.5 max-w-xs leading-relaxed font-sans">
                  Explore our curated catalog of gold and silver masterpieces, and tap the heart icon on any product card to save your favorite articles.
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

                const finalPrice = basePrice * 1.03; // Including 3% GST (1.5% CGST + 1.5% SGST)
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
                      <strong className="text-xs font-serif text-[#1A1A1A] block mt-0.5 font-bold">
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
                      className="p-2 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer rounded-full hover:bg-rose-50 flex items-center justify-center shrink-0"
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
    </div>
  );
};
