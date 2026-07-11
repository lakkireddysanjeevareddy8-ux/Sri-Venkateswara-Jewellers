import React, { useState, useEffect } from 'react';
import { Product, StoreSettings, WhatsAppNumber, Review, Profile } from '../types';
import { getRateForPurity, calculateJewelryPrice, ProductCard, getCanceledRateForPurity, getExclusiveOfferRateForPurity } from './ProductCard';
import { X, MessageSquare, Star, CheckCircle, AlertTriangle, ShieldCheck, Calendar, ArrowLeft, ArrowRight, Send, Mail, Bell, Globe, Heart } from 'lucide-react';
import { addReview, addStockNotification } from '../lib/supabase';
import { CurrencyCode, CURRENCIES, convertAndFormatPrice } from '../lib/currency';

interface ProductDetailProps {
  product: Product;
  settings: StoreSettings;
  whatsAppNumbers: WhatsAppNumber[];
  reviews: Review[];
  onClose: () => void;
  onReviewAdded: () => void;
  allProducts?: Product[];
  onSelectProduct: (p: Product) => void;
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  wishlist?: string[];
  onToggleFavorite?: (id: string) => void;
  onBack?: () => void;
  activeProfile: Profile | null;
  onRequireAuth: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  settings,
  whatsAppNumbers,
  reviews,
  onClose,
  onReviewAdded,
  allProducts = [],
  onSelectProduct,
  selectedCurrency,
  onCurrencyChange,
  wishlist = [],
  onToggleFavorite,
  onBack,
  activeProfile,
  onRequireAuth,
}) => {
  const isFavorite = wishlist.includes(product.id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ transform: 'scale(1)' });
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmittingNotification, setIsSubmittingNotification] = useState(false);
  const [notifSuccessMessage, setNotifSuccessMessage] = useState('');

  // Reset interactive inputs and active index when deep diving into a different product
  useEffect(() => {
    setActiveImageIndex(0);
    setReviewName('');
    setReviewRating(5);
    setReviewText('');
    setReviewMessage('');
    setCustomerEmail('');
    setNotifSuccessMessage('');
  }, [product]);

  const handleRegisterNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) return;
    setIsSubmittingNotification(true);
    try {
      await addStockNotification(product.id, customerEmail.trim());
      setNotifSuccessMessage(`Success! You will receive an email alert at ${customerEmail.trim()} as soon as this item comes back in stock.`);
      alert(`Back-in-stock notification alert successfully registered and added for ${customerEmail.trim()}!`);
      setCustomerEmail('');
    } catch (err) {
      alert('Failed to register for back-in-stock notification. Please try again.');
    } finally {
      setIsSubmittingNotification(false);
    }
  };

  // 1. Determine the actual selling rate per gram (currentRate)
  const standardDailyRate = getRateForPurity(product.purity_type, settings);
  let currentRate = standardDailyRate;
  if (product.offer_exclusive_rate && product.offer_exclusive_rate > 0) {
    currentRate = product.offer_exclusive_rate;
  } else if (settings.flat_offer_active) {
    currentRate = getExclusiveOfferRateForPurity(product.purity_type, settings);
  }

  // 2. Determine the original/canceled rate per gram (canceledRate)
  let canceledRate = currentRate;
  if (product.offer_canceled_rate && product.offer_canceled_rate > 0) {
    canceledRate = product.offer_canceled_rate;
  } else if (settings.flat_offer_active) {
    canceledRate = getCanceledRateForPurity(product.purity_type, settings);
  } else if (product.offer_exclusive_rate && product.offer_exclusive_rate > 0) {
    canceledRate = getRateForPurity(product.purity_type, settings);
  }

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

  // The original/deal price (what the customer actually pays) combined
  const finalPrice = product.has_stone
    ? (metalPriceWithMaking + stonePrice)
    : calculateJewelryPrice(product.weight_grams, currentRate, product.making_charge_percent);

  const onlyMetalPriceCanceledBase = metalWeight * canceledRate;
  const metalPriceCanceledWithMaking = onlyMetalPriceCanceledBase * (1 + product.making_charge_percent / 100);

  // The canceled/removed price (M.R.P.) combined
  const canceledPrice = product.has_stone
    ? (metalPriceCanceledWithMaking + stonePrice)
    : calculateJewelryPrice(product.weight_grams, canceledRate, product.making_charge_percent);

  const formattedPrice = convertAndFormatPrice(finalPrice, selectedCurrency);
  const formattedCanceledPrice = convertAndFormatPrice(canceledPrice, selectedCurrency);

  // Amazon-style exact pricing calculations
  const gstBaseAmount = finalPrice;

  const cgstAmount = gstBaseAmount * 0.015;
  const sgstAmount = gstBaseAmount * 0.015;
  const totalTaxAmount = cgstAmount + sgstAmount;

  const gstCanceledBaseAmount = canceledPrice;

  const cgstCanceledAmount = gstCanceledBaseAmount * 0.015;
  const sgstCanceledAmount = gstCanceledBaseAmount * 0.015;
  const canceledPriceInclGst = canceledPrice + cgstCanceledAmount + sgstCanceledAmount;

  const dealPriceExclGst = finalPrice;
  const dealPriceInclGst = finalPrice + totalTaxAmount;

  const formattedAmazonMRP = convertAndFormatPrice(canceledPriceInclGst, selectedCurrency);
  const formattedAmazonDealExcl = convertAndFormatPrice(dealPriceExclGst, selectedCurrency);
  const formattedAmazonDealIncl = convertAndFormatPrice(dealPriceInclGst, selectedCurrency);
  const formattedCGST = convertAndFormatPrice(cgstAmount, selectedCurrency);
  const formattedSGST = convertAndFormatPrice(sgstAmount, selectedCurrency);

  const amazonSavingsValue = Math.max(0, canceledPriceInclGst - dealPriceInclGst);
  const amazonSavingsPercent = amazonSavingsValue > 0 ? Math.max(1, Math.round((amazonSavingsValue / (canceledPriceInclGst || 1)) * 100)) : 0;
  const formattedAmazonSavings = convertAndFormatPrice(amazonSavingsValue, selectedCurrency);

  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const avgRating = productReviews.length
    ? (productReviews.reduce((sum, r) => sum + r.rating_stars, 0) / productReviews.length).toFixed(1)
    : '5.0';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transform: 'scale(1)', transformOrigin: 'center' });
  };

  const triggerWhatsAppBroadcast = (phone: string, refName: string) => {
    if (!activeProfile) {
      onRequireAuth();
      return;
    }
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const inquiryMessage = 
`Hello Sri Venkateswara Golden Jewellers,

I am highly interested in querying about this premium jewelry piece:
✨ *${product.name}*
🏷️ *SKU:* ${product.SKU}
⚖️ *Weight:* ${product.weight_grams.toFixed(2)} grams
💎 *Purity:* ${product.purity_type} (${product.product_type})
💰 *Estimated Price (Rate locked on ${today}):* ${formattedPrice}
🔨 *Making Charges:* ${product.making_charge_percent}%

Please let me know if this article is currently available for a customized virtual viewing or a custom store booking. Thank you!`;

    const encodedText = encodeURIComponent(inquiryMessage);
    const cleanPhone = phone.replace(/[+\s-]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  // Broadcast to all configured numbers with a single click
  const handleSequentialBroadcast = () => {
    if (!activeProfile) {
      onRequireAuth();
      return;
    }
    if (whatsAppNumbers.length === 0) {
      alert('No business WhatsApp numbers are currently configured in the settings! Please add numbers in the Admin Dashboard.');
      return;
    }

    whatsAppNumbers.forEach((num, index) => {
      // Minor staggered timeout to bypass aggressive browser popup blockers on high volumes
      setTimeout(() => {
        triggerWhatsAppBroadcast(num.phone_number, num.reference_name);
      }, index * 150);
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      alert('Please fill out both your name and review content.');
      return;
    }
    setIsSubmittingReview(true);
    // Sanitize user input: strip HTML tags and encode dangerous chars
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c));
    try {
      await addReview({
        product_id: product.id,
        user_id: 'guest-user',
        user_name: sanitize(reviewName.trim()),
        rating_stars: reviewRating,
        review_text: sanitize(reviewText.trim()),
      });
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      setReviewMessage('Thank you! Your verified review has been instantly written directly into our live data tables.');
      alert('Thank you! Your verified review has been successfully added!');
      onReviewAdded();
      setTimeout(() => setReviewMessage(''), 4000);
    } catch (err) {
      alert('Failed to submit review. Try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const primaryColor = settings.dynamic_theme.primary;
  const secondaryColor = settings.dynamic_theme.secondary;

  // Find similar products of the exact same main_category and product_type (e.g. Golden Bangles)
  const exactMatches = (allProducts || [])
    .filter((p) => p.id !== product.id)
    .filter((p) => p.main_category === product.main_category && p.product_type === product.product_type);

  let finalSimilarProducts = exactMatches.slice(0, 4);

  // If there are no exact matches of both category and type, fallback gracefully so the section isn't empty:
  if (finalSimilarProducts.length === 0) {
    // Fallback 1: Same product_type (e.g. other bangles of different metals)
    const sameTypeMatches = (allProducts || [])
      .filter((p) => p.id !== product.id)
      .filter((p) => p.product_type === product.product_type);
    
    if (sameTypeMatches.length > 0) {
      finalSimilarProducts = sameTypeMatches.slice(0, 4);
    } else {
      // Fallback 2: Same main_category (e.g. other Gold jewelry of different styles)
      const sameCategoryMatches = (allProducts || [])
        .filter((p) => p.id !== product.id)
        .filter((p) => p.main_category === product.main_category);
      
      if (sameCategoryMatches.length > 0) {
        finalSimilarProducts = sameCategoryMatches.slice(0, 4);
      } else {
        // Fallback 3: Any other products
        finalSimilarProducts = (allProducts || [])
          .filter((p) => p.id !== product.id)
          .slice(0, 4);
      }
    }
  }

  const handleSelectSimilar = (p: Product) => {
    onSelectProduct(p);
    document.getElementById('product-detail-scroll-container')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="product-detail-scroll-container" className="fixed inset-0 z-50 bg-[#FBFBFA] flex flex-col overflow-y-auto overscroll-y-contain scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Premium Sticky/Fixed Navigation Header (Amazon Style) */}
      <div className="sticky top-0 z-40 bg-white border-b border-stone-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <button
          onClick={onBack || onClose}
          className="flex items-center gap-2 text-stone-850 hover:text-stone-600 font-medium text-xs md:text-sm transition-all cursor-pointer bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-full border border-stone-200 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{onBack ? 'Back' : 'Back to Collection'}</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-center">
          <span className="h-2 w-2 rounded-full bg-[#936C31]" />
          <h1 className="font-serif font-bold text-stone-900 text-xs sm:text-sm md:text-base tracking-wider uppercase">
            Sri Venkateswara Golden Jewellers
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {product.is_in_stock ? (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              In Stock
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Sold Out
            </span>
          )}
          {/* Close button icon for easy click */}
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-800 p-1 rounded-full hover:bg-stone-100 transition-colors"
            title="Close details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Responsive Body Grid */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Gallery & Carousel (Sticky on desktop) */}
          <div className="lg:col-span-6 flex flex-col gap-6 lg:sticky lg:top-24 h-fit">
            {/* Main Stage Image Zoom container */}
            <div className="relative flex flex-col items-center justify-center bg-white border border-stone-200 p-4 rounded-none shadow-xs">
              <div
                className="relative aspect-square w-full max-w-[450px] overflow-hidden rounded-none bg-white cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <img
                  src={product.image_urls[activeImageIndex] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600'}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-transform duration-100 ease-out"
                  style={zoomStyle}
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Slide Navigation Triggers */}
              {product.image_urls.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between pointer-events-none">
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === 0 ? product.image_urls.length - 1 : prev - 1
                      )
                    }
                    className="pointer-events-auto rounded-full bg-white/90 p-2 text-stone-700 shadow-md hover:bg-white transition-all cursor-pointer border border-stone-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImageIndex((prev) =>
                        prev === product.image_urls.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="pointer-events-auto rounded-full bg-white/90 p-2 text-stone-700 shadow-md hover:bg-white transition-all cursor-pointer border border-stone-200"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnails list */}
            {product.image_urls.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto py-1 justify-center scrollbar-thin">
                {product.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-none border-2 bg-white transition-all shadow-xs"
                    style={{
                      borderColor: activeImageIndex === index ? primaryColor : '#E5E1DA',
                    }}
                  >
                    <img
                      src={url}
                      alt="thumbnail"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Luxury authenticity guarantee */}
            <div className="flex items-center justify-center gap-3 rounded-none bg-amber-500/5 p-4 text-xs text-amber-900 border border-amber-500/10 font-mono">
              <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0" />
              <span className="font-medium">100% Hallmarked & Certified Authentic Luxury Metal Quality</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Specs, Actions & Reviews */}
          <div className="lg:col-span-6 flex flex-col gap-6 md:gap-8">
            <div>
            {/* New Amazon-style Exact Layout */}
            <div className="flex flex-col font-sans mb-1">
              {/* First line: Badge and Deal Text */}
              {amazonSavingsValue > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#CC0C39] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm">
                    {amazonSavingsPercent}% OFF
                  </span>
                  <span className="text-[#CC0C39] text-[14px] font-medium">Limited deal</span>
                </div>
              )}
              
              {/* Second line: Price and MRP */}
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-[#0F1111] text-[28px] sm:text-[32px] leading-none font-bold">
                  {formattedAmazonDealIncl}
                </span>
                {amazonSavingsValue > 0 && (
                  <span className="text-[#565959] text-[14px]">
                    M.R.P.: <span className="line-through">{formattedAmazonMRP}</span>
                  </span>
                )}
              </div>

              {/* Third line: Product Title */}
              <div className="flex items-start justify-between gap-4 mt-2.5">
                <h1 className="text-[#0F1111] text-[18px] sm:text-[20px] font-normal leading-snug">
                  {product.name}
                </h1>
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className="shrink-0 group focus:outline-hidden p-1.5 -mr-1.5"
                    title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart
                      className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                        isFavorite ? 'fill-[#CC0C39] text-[#CC0C39]' : 'text-[#565959] group-hover:text-[#CC0C39]'
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Swatches and Badges Row */}
              <div className="mt-8 mb-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#888] font-mono font-medium mb-3">
                  <span>{product.product_type}</span>
                  <span>SKU: {product.SKU}</span>
                </div>
                
                <div className="flex items-center justify-between flex-wrap gap-y-3">
                  <div className="flex items-center gap-4">
                    {/* Swatches (Visual representation) */}
                    <div className="flex items-center gap-1">
                      <div className="w-[14px] h-[14px] rounded-full border border-stone-300 bg-[#E5D3B3] shadow-inner"></div>
                      <div className="w-[14px] h-[14px] rounded-full border border-stone-300 bg-[#E0E2E5] shadow-inner"></div>
                      <span className="text-[#0F1111] text-xs font-semibold ml-0.5 mr-1">+2</span>
                      
                      <div className="w-[14px] h-[14px] rounded-full border border-stone-300 bg-[#D4AF37] shadow-inner ml-1"></div>
                      <div className="w-[14px] h-[14px] rounded-full border border-stone-300 bg-[#C0C0C0] shadow-inner"></div>
                      <span className="text-[#0F1111] text-xs font-semibold ml-0.5">+3</span>
                    </div>
                    {/* Weight Badge */}
                    <span className="bg-[#F0F2F2] border border-[#D5D9D9] text-[#0F1111] text-xs font-bold px-1.5 py-0.5 rounded-sm shadow-xs font-sans">
                      {product.weight_grams.toFixed(2)}g
                    </span>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex items-center gap-1 font-sans">
                    <span className="text-[#007185] text-[13px] font-bold hover:underline cursor-pointer tracking-tight">
                      Deals from this brand
                    </span>
                    <span className="text-[#007185] mx-0.5 text-xs">•</span>
                    <span className="text-[#007185] font-bold bg-[#E6F5EC] border border-[#83D39A] px-1 py-0.5 rounded-sm text-[10px] tracking-tight">
                      916 CERT
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#E7E7E7] mt-1 mb-3"></div>

              {/* Transparent Price Breakdown text */}
              <div className="text-[11px] font-bold text-[#888] tracking-widest uppercase mb-1">
                Transparent Price Breakdown
              </div>
              
              {/* Inclusive of all taxes */}
              <div className="text-[#565959] text-[12px] font-mono text-right mt-3 w-full flex justify-end">
                Inclusive of all taxes
              </div>
            </div>

            {/* Currency Selector (Preserved from old layout) */}
            <div className="flex items-center justify-end gap-1 mt-1 mb-2">
              <Globe className="h-3 w-3 text-stone-400" />
              <select
                value={selectedCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-transparent border-none text-[10px] font-medium text-stone-500 focus:outline-hidden cursor-pointer font-mono"
              >
                {Object.values(CURRENCIES).map((cur) => (
                  <option key={cur.code} value={cur.code}>
                    {cur.code} ({cur.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Formula details sheet tucked neatly under a beautiful modern details fold */}
            <details className="group border-t border-stone-200/60 pt-2.5 mt-1">
                    <summary className="flex items-center justify-between text-[11px] font-semibold text-stone-500 hover:text-stone-800 cursor-pointer uppercase tracking-wider font-mono select-none">
                      <span>Transparent Pricing Formulas & Rates</span>
                      <span className="transition-transform duration-200 group-open:rotate-180 text-[10px]">▼</span>
                    </summary>
                    <div className="mt-3.5 text-[11px] text-stone-600 font-mono space-y-2.5 bg-white/70 border border-stone-200/50 p-3 rounded-xl">
                      <div className="flex justify-between">
                        <span>Gold/Silver Piece Weight:</span>
                        <span className="font-semibold text-stone-900">{product.weight_grams.toFixed(2)} grams</span>
                      </div>
                      {product.has_stone && (
                        <>
                          <div className="flex justify-between border-t border-stone-150/40 pt-1.5 mt-1">
                            <span>Only Gold/Metal Weight:</span>
                            <span className="font-semibold text-stone-900">{metalWeight.toFixed(2)} grams</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Only Stone Weight:</span>
                            <span className="font-semibold text-stone-900">{stoneWeightGrams.toFixed(2)} grams</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Only Metal Price (Live):</span>
                            <span className="font-semibold text-stone-900">{convertAndFormatPrice(onlyMetalPriceBase, selectedCurrency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Only Stone Price (Man.):</span>
                            <span className="font-semibold text-stone-900">{convertAndFormatPrice(stonePrice, selectedCurrency)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between border-t border-stone-150/40 pt-1.5 mt-1">
                        <span>Base Canceled Rate (M.R.P. / g):</span>
                        <span className="font-semibold text-stone-400 line-through">₹{canceledRate.toLocaleString('en-IN')}/g</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Daily Rate ({product.purity_type}):</span>
                        <span className="font-semibold text-stone-900 font-bold">₹{standardDailyRate.toLocaleString('en-IN')}/g</span>
                      </div>
                      <div className="flex justify-between text-amber-800 font-semibold bg-amber-500/5 px-2.5 py-1 border border-amber-500/10 rounded-sm">
                        <span>Making Charges Value:</span>
                        <span>+{product.making_charge_percent}%</span>
                      </div>

                      <div className="border-t border-dashed border-stone-200 pt-2 space-y-1">
                        <div className="flex justify-between text-stone-600">
                          <span>CGST (1.5%):</span>
                          <span>+{formattedCGST}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                          <span>SGST (1.5%):</span>
                          <span>+{formattedSGST}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-stone-400 border-t border-stone-150/50 pt-2 leading-relaxed">
                        <span className="font-bold uppercase text-stone-500 block mb-0.5">Calculation:</span>
                        {product.has_stone ? (
                          <>Formula: ((Metal Weight &times; Daily Rate) &times; (1 + Charge%) + Stone Price) + CGST (1.5%) + SGST (1.5%)</>
                        ) : (
                          <>Formula: (Weight &times; Daily Rate) &times; (1 + Charge%) + CGST (1.5%) + SGST (1.5%)</>
                        )}
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* Detailed Specifications */}
              <h3 className="mt-8 text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                Product Specifications
              </h3>
              <div className="mt-2.5 grid grid-cols-2 gap-4 rounded-none border border-stone-200 p-5 bg-white text-xs text-stone-700 shadow-xs">
                <div>
                  <span className="text-stone-400 block font-mono text-[10px] uppercase">Main Category</span>
                  <span className="font-serif font-bold text-stone-800 text-sm mt-0.5 block">{product.main_category} Jewelry</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-mono text-[10px] uppercase">Purity & Finish</span>
                  <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{product.purity_type}</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-mono text-[10px] uppercase">Gender Group</span>
                  <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{product.gender_tag} Collection</span>
                </div>
                <div>
                  <span className="text-stone-400 block font-mono text-[10px] uppercase">Jewelry Style</span>
                  <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{product.product_type}</span>
                </div>
                {product.has_stone && (
                  <>
                    <div>
                      <span className="text-[#936C31] block font-mono text-[10px] uppercase font-bold">Only Gold/Metal Weight</span>
                      <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{metalWeight.toFixed(2)} grams</span>
                    </div>
                    <div>
                      <span className="text-[#936C31] block font-mono text-[10px] uppercase font-bold">Stone Weight</span>
                      <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{stoneWeightGrams.toFixed(2)} grams</span>
                    </div>
                    <div>
                      <span className="text-[#936C31] block font-mono text-[10px] uppercase font-bold">Only Metal Price (Live)</span>
                      <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{convertAndFormatPrice(onlyMetalPriceBase, selectedCurrency)}</span>
                    </div>
                    <div>
                      <span className="text-[#936C31] block font-mono text-[10px] uppercase font-bold">Only Stone Price (Man.)</span>
                      <span className="font-semibold text-stone-850 text-sm mt-0.5 block">{convertAndFormatPrice(stonePrice, selectedCurrency)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Stock status indicator */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-stone-50 border border-stone-200/80 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 font-medium">Availability:</span>
                  {product.is_in_stock ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-850 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="h-4 w-4 text-emerald-600" /> In Stock & Ready to Ship
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-rose-850 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                      <AlertTriangle className="h-4 w-4 text-rose-600" /> Sold Out (Pre-order Available)
                    </span>
                  )}
                </div>

                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(product.id)}
                    className={`flex items-center gap-2 rounded-full py-1.5 px-3.5 text-xs font-bold transition-all border cursor-pointer font-sans shadow-xs ${
                      isFavorite
                        ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100/70'
                        : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100 hover:border-stone-400'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                    <span>{isFavorite ? 'Saved in Favorites' : 'Add to Favorites'}</span>
                  </button>
                )}
              </div>

              {/* Notify Me When Back in Stock Form */}
              {!product.is_in_stock && (
                <div className="mt-5 border border-[#936C31]/20 rounded-none p-4 bg-[#FCFAF7] space-y-3.5 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <div className="rounded-full bg-[#936C31]/10 p-1.5 text-[#936C31] shrink-0">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-mono">
                        Back-In-Stock Alert Desk
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Enter your email below. We'll send you an automated priority email as soon as this exquisite piece is crafted and restocked.
                      </p>
                    </div>
                  </div>

                  {notifSuccessMessage ? (
                    <div className="rounded-none bg-emerald-50 border border-emerald-200 p-3 text-[11px] font-medium text-emerald-800 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{notifSuccessMessage}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleRegisterNotification} className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="yourname@gmail.com"
                          required
                          className="w-full rounded-none border border-stone-300 bg-white pl-9.5 pr-3 py-2 text-xs focus:border-[#936C31] focus:outline-hidden"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmittingNotification}
                        className="rounded-none bg-stone-900 text-white px-4 py-2 text-xs font-bold hover:bg-stone-800 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingNotification ? 'Subscribing...' : 'Notify Me'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Multi-Broadcast WhatsApp Launch Desk */}
              <div className="mt-8 rounded-none bg-stone-900 text-white p-5 md:p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 opacity-5 pointer-events-none">
                  <MessageSquare className="h-32 w-32" />
                </div>
                <h4 className="text-sm font-semibold tracking-wide text-amber-300 font-mono uppercase">
                  WhatsApp Multi-Broadcast Channel
                </h4>
                <p className="mt-1.5 text-xs text-stone-300 leading-relaxed">
                  Instantly connect with our certified showrooms. Send this automated inquiry with item specifications to all active representatives simultaneously:
                </p>

                {/* Broadcast Action Button */}
                <button
                  onClick={handleSequentialBroadcast}
                  className="mt-4.5 flex w-full items-center justify-center gap-2 rounded-none py-4 text-sm font-bold shadow-md transition-all hover:opacity-90 hover:shadow-lg cursor-pointer text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MessageSquare className="h-4.5 w-4.5 fill-current" /> 
                  {whatsAppNumbers.length > 1 
                    ? `Inquire All ${whatsAppNumbers.length} Showrooms (Single Click)` 
                    : 'Contact Showroom via WhatsApp'
                  }
                </button>

                {/* Show All Configured Target Numbers for explicit choice */}
                {whatsAppNumbers.length > 0 && (
                  <div className="mt-5 border-t border-white/15 pt-4">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono font-bold">
                      Or Choose Showroom Representative:
                    </p>
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {whatsAppNumbers.map((num) => (
                        <button
                          key={num.id}
                          onClick={() => triggerWhatsAppBroadcast(num.phone_number, num.reference_name)}
                          className="flex items-center justify-between rounded-none bg-white/5 px-3 py-2.5 text-left hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
                        >
                          <div>
                            <span className="block font-medium text-white line-clamp-1">{num.reference_name}</span>
                            <span className="text-[10px] text-stone-400 font-mono">{num.phone_number}</span>
                          </div>
                          <span className="text-[10px] rounded-none bg-emerald-500/20 text-emerald-350 px-2 py-0.5 font-mono">
                            Inquire
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* REVIEWS SECTION */}
              <div className="mt-10 border-t border-stone-200 pt-8">
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Client Reviews & Timeline Feed
                </h3>

                {/* Reviews timeline feed */}
                <div className="mt-4 space-y-4">
                  {productReviews.length === 0 ? (
                    <p className="text-xs italic text-stone-500 bg-stone-100 p-5 rounded-none text-center border border-stone-200">
                      No reviews yet. Be the first customer to write a verified review!
                    </p>
                  ) : (
                    productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-none bg-white p-4.5 border border-stone-200 transition-all hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-850">{rev.user_name}</span>
                          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(rev.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="mt-1.5 flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating_stars ? 'fill-current' : 'text-stone-200'
                              }`}
                            />
                          ))}
                        </div>

                        <p className="mt-3 text-xs text-stone-650 leading-relaxed font-sans">
                          {rev.review_text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Submit Review Form */}
                <div className="mt-8 rounded-none bg-stone-100 p-5 md:p-6 border border-stone-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 font-mono">
                    Write a Verified Review
                  </h4>
                  {reviewMessage && (
                    <div className="mt-3.5 rounded-none bg-emerald-500/10 p-3 text-xs text-emerald-800 border border-emerald-500/20 font-semibold font-mono">
                      {reviewMessage}
                    </div>
                  )}
                  <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g. Priyanshu Reddy"
                          className="mt-1 w-full rounded-none border border-stone-300 bg-white px-3 py-2 text-xs focus:border-[#936C31] focus:outline-hidden"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                          Rating Stars
                        </label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="mt-1 w-full rounded-none border border-stone-300 bg-white px-3 py-2 text-xs focus:border-[#936C31] focus:outline-hidden"
                        >
                          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                          <option value="3">⭐⭐⭐ 3 Stars</option>
                          <option value="2">⭐⭐ 2 Stars</option>
                          <option value="1">⭐ 1 Star</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                        Your Review Content
                      </label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your genuine product review or ordering experience here..."
                        className="mt-1 w-full rounded-none border border-stone-300 bg-white p-3 text-xs focus:border-[#936C31] focus:outline-hidden min-h-[90px]"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="flex w-full items-center justify-center gap-1.5 rounded-none py-3 text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer uppercase tracking-wider"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      <Send className="h-3.5 w-3.5" /> {isSubmittingReview ? 'Writing to database...' : 'Submit Verified Review'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIMILAR PRODUCTS SECTION (Amazon Style Full-width Below) */}
        {finalSimilarProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Curated Recommendations
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                  Similar Category Masterpieces
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                Showing collections in {product.product_type} & {product.main_category}
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
              {finalSimilarProducts.map((simProd) => (
                <ProductCard
                  key={simProd.id}
                  product={simProd}
                  settings={settings}
                  onClick={() => handleSelectSimilar(simProd)}
                  isFavorited={wishlist.includes(simProd.id)}
                  onToggleFavorite={() => onToggleFavorite && onToggleFavorite(simProd.id)}
                  selectedCurrency={selectedCurrency}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
