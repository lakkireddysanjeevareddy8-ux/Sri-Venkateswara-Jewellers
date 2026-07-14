import React from 'react';
import { Product, StoreSettings } from '../types';
import { Sparkles, CheckCircle, AlertTriangle, Scale, Heart } from 'lucide-react';
import { CurrencyCode, convertAndFormatPrice } from '../lib/currency';

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  onClick: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
  selectedCurrency?: CurrencyCode;
}

export function getRateForPurity(purity: string, settings: StoreSettings): number {
  switch (purity) {
    case '22K Gold':
      return settings.gold_22k_rate;
    case '24K Gold':
      return settings.gold_24k_rate;
    case 'Silver 92.5 Purity':
    case 'Silver 999 Purity':
      return settings.silver_999_rate;
    case 'Normal Silver':
      return settings.silver_normal_rate;
    default:
      return 0;
  }
}

export function getCanceledRateForPurity(purity: string, settings: StoreSettings): number {
  switch (purity) {
    case '22K Gold':
      return settings.flat_offer_canceled_gold_22k ?? settings.gold_22k_rate;
    case '24K Gold':
      return settings.flat_offer_canceled_gold_24k ?? settings.gold_24k_rate;
    case 'Silver 92.5 Purity':
    case 'Silver 999 Purity':
      return settings.flat_offer_canceled_silver_999 ?? settings.silver_999_rate;
    case 'Normal Silver':
      return settings.flat_offer_canceled_silver_normal ?? settings.silver_normal_rate;
    default:
      return 0;
  }
}

export function getExclusiveOfferRateForPurity(purity: string, settings: StoreSettings): number {
  switch (purity) {
    case '22K Gold':
      return settings.flat_offer_exclusive_gold_22k ?? settings.gold_22k_rate;
    case '24K Gold':
      return settings.flat_offer_exclusive_gold_24k ?? settings.gold_24k_rate;
    case 'Silver 92.5 Purity':
    case 'Silver 999 Purity':
      return settings.flat_offer_exclusive_silver_999 ?? settings.silver_999_rate;
    case 'Normal Silver':
      return settings.flat_offer_exclusive_silver_normal ?? settings.silver_normal_rate;
    default:
      return 0;
  }
}

export function calculateJewelryPrice(weight: number, rate: number, makingChargePercent: number): number {
  return (weight * rate) * (1 + makingChargePercent / 100);
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  settings, 
  onClick, 
  isFavorited = false, 
  onToggleFavorite,
  selectedCurrency = 'INR'
}) => {
  const isFlatOffer = settings.flat_offer_active;
  const currentRate = getRateForPurity(product.purity_type, settings);

  // Custom or fallback canceled rate entered by the admin
  const canceledRate = (product.offer_canceled_rate && product.offer_canceled_rate > 0)
    ? product.offer_canceled_rate
    : (getCanceledRateForPurity(product.purity_type, settings) || (currentRate * 1.25));

  // Dynamic Stone & Metal Breakdown Pricing Logic
  const metalWeight = (product.has_stone && product.metal_weight_grams !== undefined && product.metal_weight_grams > 0)
    ? product.metal_weight_grams
    : product.weight_grams;

  const stoneWeightGrams = (product.has_stone && product.stone_weight_grams !== undefined)
    ? product.stone_weight_grams
    : 0;

  const stonePrice = (product.has_stone && product.stone_price !== undefined)
    ? product.stone_price
    : 0;

  const onlyMetalPriceBase = metalWeight * currentRate;
  const metalPriceWithMaking = onlyMetalPriceBase * (1 + product.making_charge_percent / 100);

  // Original/deal price (what the customer actually pays) is made according to metal type, daily rate per gram
  const finalPrice = product.has_stone
    ? (metalPriceWithMaking + stonePrice)
    : calculateJewelryPrice(product.weight_grams, currentRate, product.making_charge_percent);

  const onlyMetalPriceCanceledBase = metalWeight * canceledRate;
  const metalPriceCanceledWithMaking = onlyMetalPriceCanceledBase * (1 + product.making_charge_percent / 100);

  // Canceled/removed price (M.R.P.) is based on rate entered/customized by the admin
  const canceledPrice = product.has_stone
    ? (metalPriceCanceledWithMaking + stonePrice)
    : calculateJewelryPrice(product.weight_grams, canceledRate, product.making_charge_percent);

  // 1.5% CGST + 1.5% SGST (3% GST total) added to the total
  const gstBaseAmount = finalPrice;

  const cgstAmount = gstBaseAmount * 0.015;
  const sgstAmount = gstBaseAmount * 0.015;
  const finalPriceInclGst = finalPrice + cgstAmount + sgstAmount;

  const gstCanceledBaseAmount = canceledPrice;

  const cgstCanceledAmount = gstCanceledBaseAmount * 0.015;
  const sgstCanceledAmount = gstCanceledBaseAmount * 0.015;
  const canceledPriceInclGst = canceledPrice + cgstCanceledAmount + sgstCanceledAmount;

  const formattedPrice = convertAndFormatPrice(finalPriceInclGst, selectedCurrency as CurrencyCode);
  const formattedCanceledPrice = convertAndFormatPrice(canceledPriceInclGst, selectedCurrency as CurrencyCode);

  const amazonSavingsValue = Math.max(0, canceledPriceInclGst - finalPriceInclGst);
  const amazonSavingsPercent = Math.max(1, Math.round((amazonSavingsValue / canceledPriceInclGst) * 100));
  const ratePerGram = finalPriceInclGst / product.weight_grams;

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-lg sm:rounded-xl border border-stone-200 bg-white p-1.5 sm:p-3 space-y-1 sm:space-y-2 transition-all duration-300 hover:shadow-md cursor-pointer select-none"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden rounded-md sm:rounded-lg bg-stone-50/50 flex items-center justify-center">
        {/* Top Left: Purity & Gender Badges */}
        <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 z-10 flex flex-col gap-0.5 sm:gap-1">
          <span className="px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[6px] sm:text-[8px] font-extrabold tracking-wider uppercase bg-[#F2EDE4] text-[#936C31] rounded-xs border border-[#936C31]/10 shadow-3xs">
            {product.purity_type}
          </span>
          <span className="bg-black/50 text-white px-1 sm:px-1.5 py-0.2 sm:py-0.5 text-[6px] sm:text-[8px] font-bold tracking-wider uppercase rounded-xs shadow-3xs">
            {product.gender_tag}
          </span>
        </div>

        {/* Top Right: Wishlist Heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) {
              onToggleFavorite(e);
            }
          }}
          className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 z-20 rounded-full bg-white/90 backdrop-blur-xs p-1 sm:p-1.5 shadow-sm hover:bg-white hover:scale-110 active:scale-95 text-stone-600 transition-all cursor-pointer border border-stone-100"
          title={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart
            className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 transition-colors ${
              isFavorited ? 'fill-rose-500 text-rose-500' : 'text-stone-400 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Bottom Left: Stock Status (Minimal Dot/Pill) */}
        <div className="absolute bottom-1 left-1 sm:bottom-1.5 sm:left-1.5 z-10">
          {product.is_in_stock ? (
            <span className="bg-emerald-50 text-[6px] sm:text-[8px] font-extrabold tracking-wider px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-xs text-emerald-600 flex items-center gap-0.5 border border-emerald-200/80 shadow-3xs">
              <span className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-emerald-500 animate-pulse" /> IN STOCK
            </span>
          ) : (
            <span className="bg-rose-50 text-[6px] sm:text-[8px] font-extrabold tracking-wider px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-xs text-rose-600 flex items-center gap-0.5 border border-rose-200/80 shadow-3xs">
              <span className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-rose-500" /> OUT OF STOCK
            </span>
          )}
        </div>

        {/* Bottom Right: Bright Yellow Plus (+) Button (Amazon Quick Action) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick(); // Clicks card to open detail drawer/modal
          }}
          className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 z-20 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] rounded-full h-5.5 w-5.5 sm:h-8 sm:w-8 flex items-center justify-center font-extrabold text-xs sm:text-lg shadow-md border border-[#FCD200]/80 transition-transform duration-200 hover:scale-110 active:scale-95 cursor-pointer"
          title="Quick Buy & Details"
        >
          +
        </button>

        {/* Product Main Image */}
        <img
          src={product.image_urls[0] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=400'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-102"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      </div>

      {/* Info Body */}
      <div className="flex flex-1 flex-col justify-between pt-0.5 sm:pt-1 text-left">
        <div className="space-y-1 sm:space-y-1.5">
          {/* 1. Crimson discount badge + "Limited time deal" text */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="bg-[#CC0C39] text-white text-[7px] sm:text-[9px] font-extrabold px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-xs uppercase tracking-wider">
              {amazonSavingsPercent}% off
            </span>
            <span className="text-[#CC0C39] text-[7px] sm:text-[9px] font-extrabold tracking-tight">
              Limited deal
            </span>
          </div>

          {/* 2. Pricing Row: big bold deal price & M.R.P. next to it */}
          <div className="flex flex-wrap items-baseline gap-x-1 sm:gap-x-1.5 gap-y-0.2 sm:gap-y-0.5">
            <span className="text-stone-900 text-xs sm:text-base font-bold leading-none tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-[#565959] text-[8px] sm:text-[10px] font-normal">
              M.R.P.: <span className="line-through">{formattedCanceledPrice}</span>
            </span>
          </div>

          {/* 3. Product Title Name */}
          <h3 className="text-[#0F1111] text-[9.5px] sm:text-xs font-normal leading-tight line-clamp-2 hover:text-[#007185] transition-colors h-[1.95rem] sm:h-[2.35rem]">
            {product.name}
          </h3>

          {/* 4. Material and SKU code (Amazon ASIN equivalent) */}
          <div className="flex items-center justify-between text-[7px] sm:text-[8px] uppercase font-mono tracking-wider text-stone-400">
            <span>{product.product_type}</span>
            <span>SKU: {product.SKU?.replace('NJ-', 'SVJ-')}</span>
          </div>

          {/* 5. Gold / Silver color options indicators (as seen on Amazon card color dots) */}
          <div className="flex items-center justify-between pt-0.2 sm:pt-0.5">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E5D5B8] border border-[#C5B390] shadow-2xs" title="Gold Finish" />
              <span className="inline-block w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full bg-[#E8E8E8] border border-[#CCCCCC] shadow-2xs" title="Silver 92.5 Finish" />
              <span className="text-stone-400 text-[7px] sm:text-[8px] font-mono ml-0.5 font-bold hover:underline cursor-pointer">+2</span>
            </div>
            
          {/* Weight label */}
          <div className="flex items-center justify-between pt-0.2 sm:pt-0.5">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E5D5B8] border border-[#C5B390] shadow-2xs" title="Gold Finish" />
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E8E8E8] border border-[#CCCCCC] shadow-2xs" title="Silver 92.5 Finish" />
              <span className="text-stone-400 text-[6.5px] sm:text-[8px] font-mono ml-0.5 font-bold">+3</span>
            </div>
            
            <span className="text-[7.5px] sm:text-[9px] font-mono text-stone-500 font-bold bg-stone-100 px-1 sm:px-1.5 py-0.1 rounded-xs">
              {product.weight_grams.toFixed(2)}g
            </span>
          </div>

          {/* 6. "Deals from this brand" / Sri Vasavi Quality Link */}
          <div className="hidden sm:flex text-[#007185] hover:underline text-[8px] sm:text-[10px] font-bold tracking-wide mt-1.5 items-center gap-0.5">
            <span>Deals from this brand</span>
            <span>•</span>
            <span className="text-emerald-700 font-extrabold uppercase text-[7px] bg-emerald-50 px-1 py-0.2 rounded-xs border border-emerald-100">
              916 Cert
            </span>
          </div>
        </div>

        {/* 7. Collapsible Pricing Breakout Details (For customer transparency) */}
        <div className="hidden sm:block mt-2 pt-1 border-t border-stone-100">
          <details className="group" onClick={(e) => e.stopPropagation()}>
            <summary className="flex items-center justify-between text-[8px] font-bold text-stone-400 hover:text-stone-700 cursor-pointer uppercase tracking-wider font-mono select-none py-0.5">
              <span>Transparent Price Breakdown</span>
              <span className="transition-transform duration-200 group-open:rotate-180 text-[6px] shrink-0 text-stone-300">▼</span>
            </summary>
            
            <div className="mt-1 space-y-1 text-[8px] text-stone-500 font-mono bg-[#FCFAF7] border border-stone-100 p-1.5 rounded-sm">
              <div className="flex justify-between">
                <span>Purity:</span>
                <span className="font-semibold text-stone-700">{product.purity_type}</span>
              </div>
              <div className="flex justify-between">
                <span>Rate per gram:</span>
                <span className="font-semibold text-stone-700">₹{currentRate.toLocaleString('en-IN')}</span>
              </div>
              {product.has_stone && (
                <>
                  <div className="flex justify-between border-t border-stone-100/50 pt-0.5 mt-0.5">
                    <span>Metal Weight:</span>
                    <span className="font-semibold text-stone-700">{(product.metal_weight_grams ?? product.weight_grams).toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stone Weight:</span>
                    <span className="font-semibold text-stone-700">{stoneWeightGrams.toFixed(2)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Only Stone Price:</span>
                    <span className="font-semibold text-stone-700">{convertAndFormatPrice(stonePrice, selectedCurrency as CurrencyCode)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-stone-100/50 pt-0.5">
                <span>Making Charge:</span>
                <span className="font-semibold text-stone-700">+{product.making_charge_percent}%</span>
              </div>
              <div className="flex justify-between border-t border-stone-100/50 pt-0.5">
                <span>GST (3%):</span>
                <span className="font-semibold text-stone-700">{convertAndFormatPrice(cgstAmount + sgstAmount, selectedCurrency as CurrencyCode)}</span>
              </div>
            </div>
          </details>
          <div className="text-stone-400 text-[8px] text-center mt-1 font-mono">
            Inclusive of all taxes
          </div>
        </div>

        <div className="block sm:hidden text-center text-[7px] text-stone-400 font-mono mt-0.5">
          Tap for price breakdown
        </div>
      </div>
    </div></div>
  );
};
