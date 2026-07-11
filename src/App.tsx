import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './lib/supabase'; // Points securely to your project initialization client
import { StoreSettings, Product, WhatsAppNumber, PromotionalOffer, Review, MainCategory, PurityType, GenderTag, ProductType, Profile } from './types';
import { 
  getStoreSettings, 
  getProducts, 
  getWhatsAppNumbers, 
  getPromoOffer, 
  getReviews, 
  subscribeToRealtimeChanges,
  isRealSupabaseConnected,
  getProfiles,
  syncWithServer,
  pushLocalStateToServer
} from './lib/supabase';
import { ProductCard } from './components/ProductCard';
import { ProductDetail } from './components/ProductDetail';
import { ProfileDrawer } from './components/ProfileDrawer';
import { PasswordGate } from './components/PasswordGate';
import { AdminPanel } from './components/AdminPanel';
import { CustomerLoginGate } from './components/CustomerLoginGate';
import { ToastMessage, ToastContainer } from './components/Toast';
import { Logo } from './components/Logo';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CurrencyCode } from './lib/currency';
import { 
  Gem, User, ShieldAlert, Award, Search, Calendar, ChevronRight, Crown, 
  MessageSquare, Star, Sparkles, Filter, X, Info, Settings, MapPin, Heart, Phone
} from 'lucide-react';

export default function App() {
  // DB & Session States
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [whatsAppNumbers, setWhatsAppNumbers] = useState<WhatsAppNumber[]>([]);
  const [promoOffer, setPromoOffer] = useState<PromotionalOffer | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(() => {
    try {
      const storedProfile = localStorage.getItem('svj_active_customer_profile');
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
      const storedEmail = localStorage.getItem('svj_active_customer_email');
      if (storedEmail) {
        const localProfiles = JSON.parse(localStorage.getItem('svj_profiles') || '[]');
        const found = localProfiles.find((p: any) => p.email.toLowerCase() === storedEmail.toLowerCase());
        if (found) return found;
      }
    } catch (e) {
      console.error('Error parsing stored active customer profile:', e);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCat, setSelectedMainCat] = useState<MainCategory | 'All'>('All');
  const [selectedPurity, setSelectedPurity] = useState<PurityType | 'All'>('All');
  const [selectedStyle, setSelectedStyle] = useState<ProductType | 'All'>('All');
  const [selectedGender, setSelectedGender] = useState<GenderTag | 'All'>('All');

  // Interactive View States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productHistory, setProductHistory] = useState<Product[]>([]);

  // Helper: generate a URL-safe slug from a product name
  const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleOpenProduct = (p: Product) => {
    setProductHistory([]);
    setSelectedProduct(p);
    window.history.pushState({ productId: p.id, depth: 0 }, '', `/product/${p.id}/${toSlug(p.name)}`);
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    setProductHistory([]);
    window.history.pushState(null, '', '/');
  };

  const handleSelectProduct = (p: Product) => {
    if (selectedProduct) {
      setProductHistory((prev) => [...prev, selectedProduct]);
    }
    setSelectedProduct(p);
    window.history.pushState({ productId: p.id, depth: productHistory.length + 1 }, '', `/product/${p.id}/${toSlug(p.name)}`);
  };

  const handleBackProduct = () => {
    if (productHistory.length > 0) {
      const prev = productHistory[productHistory.length - 1];
      setProductHistory((prevList) => prevList.slice(0, -1));
      setSelectedProduct(prev);
      window.history.pushState({ productId: prev.id, depth: productHistory.length - 1 }, '', `/product/${prev.id}/${toSlug(prev.name)}`);
    } else {
      handleCloseProduct();
    }
  };

  // Listen for browser back/forward navigation buttons
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.productId && products.length > 0) {
        const found = products.find((p) => p.id === e.state.productId);
        if (found) {
          setSelectedProduct(found);
          return;
        }
      }
      // No product state — close the modal
      setSelectedProduct(null);
      setProductHistory([]);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Handle initial page load with a product URL
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      const match = window.location.pathname.match(/^\/product\/([^/]+)/);
      if (match) {
        const id = match[1];
        const product = products.find((p) => p.id === id);
        if (product) {
          setSelectedProduct(product);
          // Set initial history state if it's empty so back button works correctly
          if (!window.history.state?.productId) {
             window.history.replaceState({ productId: product.id, depth: 1 }, '', window.location.pathname);
          }
        }
      }
    }
  }, [products, selectedProduct]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordGateOpen, setIsPasswordGateOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(() => {
    try {
      return localStorage.getItem('svj_admin_authenticated') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Relational Wishlist Synchronization State (Hooked straight to Database profiles now)
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Selected Currency State
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('svj_currency') as CurrencyCode) || 'INR';
  });

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Synchronize dynamic customer wishlist data array parameters on identity profile changes
  useEffect(() => {
    const fetchPermanentUserWishlist = async () => {
      if (activeProfile?.id && isRealSupabaseConnected && supabase) {
        try {
          // Fetch the permanent profile metrics row string array straight from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('favorite_product_ids')
            .eq('id', activeProfile.id)
            .single();

          if (!error && data?.favorite_product_ids) {
            setWishlist(data.favorite_product_ids);
            return;
          }
        } catch (e) {
          console.error('Supabase RLS wishlist fetch tracking failure:', e);
        }
      }
      
      // Local structural caching fallback logic if active profile identity matching is processed locally
      if (activeProfile?.email) {
        const emailLower = activeProfile.email.toLowerCase().trim();
        try {
          const raw = localStorage.getItem('svj_user_wishlists');
          const allWishlists = raw ? JSON.parse(raw) : {};
          const userWishlist = allWishlists[emailLower] || [];
          setWishlist(userWishlist);
        } catch (e) {
          console.error('Error loading fallback user-specific wishlist', e);
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    };

    fetchPermanentUserWishlist();
  }, [activeProfile?.id, activeProfile?.email]);

  const toggleWishlist = async (productId: string) => {
    if (!activeProfile) {
      setShowAuthModal(true);
      return;
    }
    const product = products.find(p => p.id === productId);
    const productName = product ? product.name : 'Item';
    const productImage = product?.image_urls?.[0];

    const isAlreadyInWishlist = wishlist.includes(productId);
    const updatedFavoritesArray = isAlreadyInWishlist
      ? wishlist.filter(id => id !== productId)
      : [...wishlist, productId];

    // 1. Instantly trigger visual interface state update transitions
    setWishlist(updatedFavoritesArray);

    if (isAlreadyInWishlist) {
      addToast({
        message: 'Removed from Wishlist',
        description: `"${productName}" was removed from your favorites.`,
        type: 'wishlist_remove',
        productImage: productImage
      });
    } else {
      addToast({
        message: 'Added to Wishlist',
        description: `"${productName}" is now saved in your favorites list.`,
        type: 'wishlist_add',
        productImage: productImage
      });
    }

    // 2. Synchronize data metrics permanently back inside PostgreSQL table space allocations
    if (activeProfile?.id && isRealSupabaseConnected && supabase) {
      try {
        await supabase
          .from('profiles')
          .update({ favorite_product_ids: updatedFavoritesArray })
          .eq('id', activeProfile.id);
      } catch (err) {
        console.error('Failed syncing updated profile arrays to database core:', err);
      }
    }

    // 3. Keep local fallback storage indices synced
    if (activeProfile?.email) {
      const emailLower = activeProfile.email.toLowerCase().trim();
      try {
        const raw = localStorage.getItem('svj_user_wishlists');
        const allWishlists = raw ? JSON.parse(raw) : {};
        allWishlists[emailLower] = updatedFavoritesArray;
        localStorage.setItem('svj_user_wishlists', JSON.stringify(allWishlists));
        localStorage.setItem('svj_wishlist', JSON.stringify(updatedFavoritesArray));
      } catch (e) {
        console.error('Error storing localized wishlist fallbacks:', e);
      }
    }
  };

  // Developer connection guide modal state
  const [showConnectionGuide, setShowConnectionGuide] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isAdDismissed, setIsAdDismissed] = useState(false);

  // Fetch all live state values from database
  const loadDatabaseState = async () => {
    try {
      // Sync local cache with Express persistent JSON database first
      await syncWithServer(true);

      const [fetchedSettings, fetchedProducts, fetchedNumbers, fetchedPromo, fetchedReviews, fetchedProfiles] = await Promise.all([
        getStoreSettings(),
        getProducts(),
        getWhatsAppNumbers(),
        getPromoOffer(),
        getReviews(),
        getProfiles()
      ]);

      setSettings(fetchedSettings);
      setProducts(fetchedProducts);
      setWhatsAppNumbers(fetchedNumbers);
      setPromoOffer(fetchedPromo);
      setReviews(fetchedReviews);
      
      const storedEmail = localStorage.getItem('svj_active_customer_email');
      if (storedEmail) {
        let found = fetchedProfiles.find((p: any) => p.email.toLowerCase() === storedEmail.toLowerCase());

        // Fallback 1: Check local profiles array if sync has a delay or race condition
        if (!found) {
          try {
            const localProfiles = JSON.parse(localStorage.getItem('svj_profiles') || '[]');
            found = localProfiles.find((p: any) => p.email.toLowerCase() === storedEmail.toLowerCase());
          } catch (e) {
            console.error('Error parsing fallback local profiles:', e);
          }
        }

        // Fallback 2: Check active customer profile in localStorage.
        // This is our source of truth if the network fetch above came back empty,
        // slow, or blocked by RLS on a fresh reload.
        if (!found) {
          try {
            const storedProfile = localStorage.getItem('svj_active_customer_profile');
            if (storedProfile) {
              const parsed = JSON.parse(storedProfile);
              if (parsed.email.toLowerCase() === storedEmail.toLowerCase()) {
                found = parsed;
              }
            }
          } catch (e) {
            console.error('Error parsing fallback stored active customer profile:', e);
          }
        }

        if (found) {
          setActiveProfile(found);
          localStorage.setItem('svj_active_customer_profile', JSON.stringify(found));
        }
        // IMPORTANT: if nothing was found anywhere, we deliberately do NOT call
        // setActiveProfile(null) here. A single fetch cycle failing to return the
        // profile (slow network, RLS delay, cold start) must never log the user out.
        // The profile the lazy useState initializer already loaded from localStorage
        // stays in place. Only an explicit logout action clears activeProfile.
      }
      // No storedEmail at all: don't touch activeProfile here either. Logging a user
      // out is the job of the explicit logout handler, not a side-effect of a data fetch.
    } catch (err) {
      console.error('Error fetching Sri Venkateswara Jewellers tables', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getShopNameClasses = () => {
    if (!settings) return '';
    const font = settings.shop_name_font || 'serif';
    const italic = settings.shop_name_italic !== false;
    const bold = !!settings.shop_name_bold;
    const spacing = settings.shop_name_spacing || 'tight';

    let fontClass = 'font-serif';
    if (font === 'sans') fontClass = 'font-sans';
    else if (font === 'mono') fontClass = 'font-mono';
    else if (font === 'cinzel') fontClass = 'font-cinzel';
    else if (font === 'cormorant') fontClass = 'font-cormorant';
    else if (font === 'greatvibes') fontClass = 'font-greatvibes text-lg min-[360px]:text-xl min-[390px]:text-2xl sm:text-3xl md:text-4.5xl font-normal!';
    else if (font === 'montserrat') fontClass = 'font-montserrat';
    else if (font === 'prata') fontClass = 'font-prata';
    else if (font === 'sacramento') fontClass = 'font-sacramento text-xl min-[360px]:text-2xl min-[390px]:text-3xl sm:text-3.5xl md:text-5xl font-normal!';

    const italicClass = italic ? 'italic' : 'not-italic';
    const boldClass = bold ? 'font-bold' : 'font-medium';
    
    let spacingClass = 'tracking-tight';
    if (spacing === 'normal') spacingClass = 'tracking-normal';
    else if (spacing === 'wide') spacingClass = 'tracking-wide';
    else if (spacing === 'widest') spacingClass = 'tracking-widest';

    return `${fontClass} ${italicClass} ${boldClass} ${spacingClass}`;
  };

  useEffect(() => {
    loadDatabaseState();

    // Subscribe to active realtime channel triggers
    const unsubscribe = subscribeToRealtimeChanges(() => {
      loadDatabaseState();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for real Supabase Authentication session state changes (Google OAuth redirects, etc.)
  useEffect(() => {
    if (!isRealSupabaseConnected || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userEmail = session.user.email;
        if (!userEmail) return;

        try {
          // Check if profile exists in Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();

          if (!error && profile) {
            // Profile exists, log in
            setActiveProfile(profile);
            localStorage.setItem('svj_active_customer_email', profile.email);
            localStorage.setItem('svj_active_customer_profile', JSON.stringify(profile));
          } else {
            // Profile does not exist, create one using Google metadata
            const newProfile: Profile = {
              id: session.user.id,
              username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split('@')[0],
              email: userEmail,
              phone_number: session.user.user_metadata?.phone_number || '+91 99008 87766'
            };

            await supabase.from('profiles').upsert(newProfile);

            setActiveProfile(newProfile);
            localStorage.setItem('svj_active_customer_email', newProfile.email);
            localStorage.setItem('svj_active_customer_profile', JSON.stringify(newProfile));
          }
          loadDatabaseState();
        } catch (e) {
          console.error('Error handling Supabase auth state change profile mapping:', e);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Centralized body scroll lock for overlays on mobile devices
  useEffect(() => {
    const isOverlayOpen = !!(selectedProduct || isProfileOpen || isAdminPanelOpen || isPasswordGateOpen || showConnectionGuide || isLogoModalOpen);
    if (isOverlayOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct, isProfileOpen, isAdminPanelOpen, isPasswordGateOpen, showConnectionGuide, isLogoModalOpen]);

  // Reset or apply the dismissed state of the advertisement banner whenever a new ad is configured, enabled, or updated
  useEffect(() => {
    if (settings) {
      if (settings.ad_active) {
        const adSignature = `${settings.ad_title || ''}_${settings.ad_text || ''}_${settings.ad_media_url || ''}`;
        try {
          const dismissedSignature = localStorage.getItem('svj_dismissed_ad_signature');
          if (dismissedSignature === adSignature) {
            setIsAdDismissed(true);
          } else {
            setIsAdDismissed(false);
          }
        } catch (e) {
          console.error('Error reading dismissed ad signature', e);
          setIsAdDismissed(false);
        }
      }
    }
  }, [
    settings?.ad_title, 
    settings?.ad_media_url, 
    settings?.ad_active, 
    settings?.ad_text, 
    settings?.ad_product_id
  ]);

  const handleDismissAd = () => {
    setIsAdDismissed(true);
    if (settings) {
      const adSignature = `${settings.ad_title || ''}_${settings.ad_text || ''}_${settings.ad_media_url || ''}`;
      try {
        localStorage.setItem('svj_dismissed_ad_signature', adSignature);
      } catch (e) {
        console.error('Error saving dismissed ad signature', e);
      }
    }
  };

  // Recalculate countdown label
  const getCountdownLabel = (endsAtStr: string) => {
    const diff = new Date(endsAtStr).getTime() - Date.now();
    if (diff <= 0) return 'Offer ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Ends in ${days} day${days > 1 ? 's' : ''}`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `Ends in ${hours} hour${hours > 1 ? 's' : ''}`;
  };

  // Filter results
  const filteredProducts = products.filter((prod) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !query || 
      prod.name.toLowerCase().includes(query) ||
      prod.SKU.toLowerCase().includes(query) ||
      prod.purity_type.toLowerCase().includes(query) ||
      prod.product_type.toLowerCase().includes(query) ||
      prod.main_category.toLowerCase().includes(query);

    // 2. Main Category
    const matchesMainCat = selectedMainCat === 'All' || prod.main_category === selectedMainCat;

    // 3. Purity Filter
    const matchesPurity = selectedPurity === 'All' || prod.purity_type === selectedPurity;

    // 4. Product Type Style Filter
    const matchesStyle = selectedStyle === 'All' || prod.product_type === selectedStyle;

    // 5. Gender Filter
    const matchesGender = selectedGender === 'All' || prod.gender_tag === selectedGender;

    return matchesSearch && matchesMainCat && matchesPurity && matchesStyle && matchesGender;
  });

  // Render a clean loading screen during structural checking or local storage parsing
  if (isLoading || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-amber-200">
        <div className="text-center space-y-6 max-w-lg px-4">
          <div className="relative flex items-center justify-center mx-auto mb-8">
            <Logo variant="default" className="scale-90 transform" />
          </div>
          {/* Branded progress bar */}
          <div className="w-48 mx-auto mt-4 h-[2px] rounded-full bg-stone-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"
              style={{
                animation: 'shimmerProgress 2s ease-in-out infinite',
                width: '100%',
                backgroundSize: '200% 100%',
              }}
            />
          </div>
          <style>{`
            @keyframes shimmerProgress {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
          <p className="text-[10px] sm:text-xs text-stone-400 uppercase tracking-widest font-sans font-light mt-3 select-none">
            Established Quality &bull; Loading Digital Showroom
          </p>
        </div>
      </div>
    );
  }

  const truncateUsername = (username: string) => {
    if (username.length > 13) {
      return username.substring(0, 13) + '...';
    }
    return username;
  };

  // Bind DB active variables
  const primaryColor = settings.dynamic_theme.primary;
  const secondaryColor = settings.dynamic_theme.secondary;
  const headerBg = settings.dynamic_theme.headerBg;
  const headerText = settings.dynamic_theme.headerText;
  const bg = settings.dynamic_theme.bg;
  const text = settings.dynamic_theme.text;
  const accent = settings.dynamic_theme.accent;

  // Custom CSS properties for visual themer mapping
  const activeCustomStyles = {
    '--theme-primary': primaryColor,
    '--theme-secondary': secondaryColor,
    '--theme-header-bg': headerBg,
    '--theme-header-text': headerText,
    '--theme-bg': bg,
    '--theme-text': text,
    '--theme-accent': accent,
  } as React.CSSProperties;

  const sortProductTypes = (types: string[], mainGroup: 'gold' | 'silver925' | 'silver') => {
    return [...types].sort((a, b) => {
      const order: Record<string, string[]> = {
        gold: ['Chains', 'Bangles', 'Rings', 'Earrings', 'Others'],
        silver925: ['Rings', 'Chains', 'Bangles', 'Earrings', 'Others'],
        silver: ['Bangles', 'Chains', 'Rings', 'Earrings', 'Others']
      };
      const list = order[mainGroup] || [];
      const indexA = list.indexOf(a);
      const indexB = list.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.localeCompare(b);
    });
  };

  const formatSubheading = (prefix: string, typeName: string) => {
    const cleanType = typeName.trim();
    if (cleanType.toLowerCase().startsWith('gold') || cleanType.toLowerCase().startsWith('silver')) {
      return cleanType;
    }
    return `${prefix} ${cleanType}`;
  };

  const getGroupedAndSorted = (productList: Product[], groupKey: 'gold' | 'silver925' | 'silver') => {
    const grouped: Record<string, Product[]> = {};
    productList.forEach(p => {
      const type = p.product_type || 'Others';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(p);
    });
    
    const sortedTypes = sortProductTypes(Object.keys(grouped), groupKey);
    return { grouped, sortedTypes };
  };

  const renderMainSection = (
    title: string,
    subtitle: string,
    badgeText: string,
    productList: Product[],
    groupKey: 'gold' | 'silver925' | 'silver',
    prefix: string,
    themeClass: { bg: string; text: string; border: string; accent: string }
  ) => {
    if (productList.length === 0) return null;

    const { grouped, sortedTypes } = getGroupedAndSorted(productList, groupKey);

    return (
      <div className="space-y-12 pb-10 border-b border-[#E5E1DA] last:border-0">
        {/* Grand Section Header */}
        <div className={`p-6 sm:p-8 rounded-none border ${themeClass.border} ${themeClass.bg} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 rounded-full ${themeClass.accent}`} />
              <h2 className={`font-serif text-xl sm:text-2xl font-bold tracking-wider uppercase ${themeClass.text}`}>
                {title}
              </h2>
            </div>
            <p className="text-xs text-stone-500 italic font-serif">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${themeClass.border} ${themeClass.text} bg-white/60`}>
              {badgeText}
            </span>
            <span className="text-xs text-stone-450 font-bold">
              ({productList.length} {productList.length === 1 ? 'item' : 'items'})
            </span>
          </div>
        </div>

        {/* Categories inside this Section */}
        <div className="space-y-10 pl-1 sm:pl-4">
          {sortedTypes.map((type) => {
            const items = grouped[type] || [];
            const subheading = formatSubheading(prefix, type);
            return (
              <div key={type} className="space-y-6">
                {/* Category Subheading */}
                <div className="flex items-center gap-3 border-b border-[#E5E1DA] pb-2">
                  <ChevronRight className={`h-4 w-4 ${themeClass.text}`} />
                  <h3 className={`font-serif text-sm font-bold tracking-wide uppercase ${themeClass.text}`}>
                    {subheading}
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400 font-semibold bg-stone-100 px-2.5 py-0.5 rounded-full">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Grid of Products */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6 md:gap-8">
                  {items.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      settings={settings}
                      onClick={() => handleOpenProduct(prod)}
                      isFavorited={wishlist.includes(prod.id)}
                      favoritesList={wishlist}
                      setFavoritesList={setWishlist}
                      currentUser={activeProfile}
                      onToggleFavorite={() => toggleWishlist(prod.id)}
                      selectedCurrency={selectedCurrency}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative select-none pb-12"
      style={{ ...activeCustomStyles, backgroundColor: bg, color: text }}
    >

      {/* 2. MAIN HEADER */}
      <header 
        className="sticky top-0 z-40 px-6 sm:px-10 py-4 flex items-center justify-between border-b border-stone-800"
        style={{ backgroundColor: headerBg, color: headerText }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLogoModalOpen(true)}
            className="group relative focus:outline-hidden cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95"
            title="Click to view logo clearly"
          >
            <Logo variant="compact" className="group-hover:opacity-90 transition-opacity" />
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none max-w-[55%] min-[375px]:max-w-[65%] sm:max-w-none">
          <h1 className={`text-white leading-tight sm:leading-none line-clamp-2 sm:line-clamp-none transition-all duration-300 ${
            (settings.shop_name_font === 'greatvibes' || settings.shop_name_font === 'sacramento')
              ? ''
              : 'text-sm min-[360px]:text-base min-[390px]:text-lg sm:text-2xl md:text-3.5xl'
          } ${getShopNameClasses()}`}>
            {settings.shop_name}
          </h1>
        </div>

        <div className="flex items-center gap-3 z-10">
          {activeProfile?.email && [
            'pathanadnankhan09@gmail.com',
            'srivenkateswarajewellers@gmail.com',
            'lakkireddysanjeevareddy8@gmail.com',
            'pathanfarhankhan3309@gmail.com'
          ].includes(activeProfile.email.toLowerCase()) && (
            <button
              onClick={() => {
                if (localStorage.getItem('svj_admin_authenticated') === 'true') {
                  setIsAdminPanelOpen(true);
                } else {
                  setIsPasswordGateOpen(true);
                }
              }}
              className="border border-[#D4AF37]/40 bg-[#1A1A1A]/40 text-stone-250 hover:bg-[#D4AF37]/15 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 duration-200"
              title="Open Admin Dashboard"
            >
              <Crown className="h-4.5 w-4.5 text-[#D4AF37]" />
            </button>
          )}

          <button
            onClick={() => {
              if (!activeProfile) {
                setShowAuthModal(true);
              } else {
                setIsWishlistOpen(true);
              }
            }}
            className="relative border border-[#D4AF37]/40 bg-[#1A1A1A]/40 text-stone-250 hover:bg-[#D4AF37]/15 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 duration-200"
            title="My Saved Wishlist"
          >
            <Heart className="h-4.5 w-4.5 text-[#D4AF37]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[8px] font-mono font-bold h-4 w-4 rounded-full flex items-center justify-center border border-stone-900 animate-pulse">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="border border-[#D4AF37]/40 bg-[#1A1A1A]/40 text-stone-250 hover:bg-[#D4AF37]/15 p-2 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 duration-200"
            title={activeProfile ? `Client Account: ${activeProfile.username}` : "Guest Sign In / Client Account"}
          >
            <User className="h-4.5 w-4.5 text-[#D4AF37]" />
          </button>
        </div>
      </header>

      {/* 3. PRICE VALUATION TICKER BANNER */}
      <div className="bg-[#1A1A1A] text-[#D4AF37] border-b border-[#D4AF37]/20 py-2.5 px-6 flex items-center gap-4 overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x whitespace-nowrap scrollbar-none justify-start lg:justify-center text-[10px] tracking-wider font-mono" style={{ WebkitOverflowScrolling: 'touch' }}>
        <span className="text-stone-450 shrink-0">📈</span>
        <span className="shrink-0">{new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}</span>
        <span className="text-stone-700 shrink-0">|</span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-stone-400 font-sans font-bold">22K Gold:</span>
          <strong className="text-[#D4AF37] font-sans">₹{settings.gold_22k_rate.toLocaleString('en-IN')}</strong>
          <span className="text-stone-500 font-sans">/g</span>
        </div>
        <span className="text-stone-700 shrink-0">|</span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-stone-400 font-sans font-bold">24K Gold:</span>
          <strong className="text-[#D4AF37] font-sans">₹{settings.gold_24k_rate.toLocaleString('en-IN')}</strong>
          <span className="text-stone-500 font-sans">/g</span>
        </div>
        <span className="text-stone-700 shrink-0">|</span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-stone-400 font-sans font-bold">Silver 92.5:</span>
          <strong className="text-stone-200 font-sans">₹{settings.silver_999_rate.toLocaleString('en-IN')}</strong>
          <span className="text-stone-500 font-sans">/g</span>
        </div>
        <span className="text-stone-700 shrink-0">|</span>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-stone-400 font-sans font-bold">Normal Silver:</span>
          <strong className="text-stone-200 font-sans">₹{settings.silver_normal_rate.toLocaleString('en-IN')}</strong>
          <span className="text-stone-500 font-sans">/g</span>
        </div>
      </div>

      {/* 3b. SPOTLIGHT ADVERTISING BANNER */}
      {!isAdDismissed && settings.ad_active && (settings.ad_media_url || settings.ad_title || settings.ad_text) && (
        <section className="mx-6 sm:mx-auto max-w-4xl mt-6 bg-white border border-[#D4AF37]/30 shadow-xs relative overflow-hidden group transition-all duration-500 ease-out hover:scale-[1.01] hover:border-[#D4AF37]/80 hover:shadow-[0_0_22px_rgba(212,175,55,0.22)]">
          <button
            onClick={handleDismissAd}
            className="absolute top-2.5 right-2.5 z-30 p-1 bg-[#1A1A1A]/95 hover:bg-red-600 hover:text-white text-[#FCFAF7] transition-all border border-[#D4AF37]/30 hover:border-red-500 rounded-none cursor-pointer flex items-center justify-center opacity-85 hover:opacity-100 shadow-xs"
            title="Dismiss Spotlight"
          >
            <X className="h-3 w-3" />
          </button>

          <div className="flex flex-col md:flex-row items-stretch">
            <div className="md:w-5/12 min-h-[140px] sm:min-h-[200px] md:min-h-[280px] relative bg-stone-900 overflow-hidden shrink-0">
              <div className="absolute top-2.5 left-2.5 z-10">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] bg-[#1A1A1A] border border-[#D4AF37]/50 text-[#D4AF37] px-2 py-0.5 sm:py-1 font-bold font-mono shadow-xs">
                  Spotlight Showcase
                </span>
              </div>
              
              {settings.ad_media_type === 'video' && settings.ad_media_url ? (
                <video
                  src={settings.ad_media_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                />
              ) : settings.ad_media_url ? (
                <img
                  src={settings.ad_media_url}
                  alt={settings.ad_title || 'Showcase'}
                  className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-[#1A1A1A] flex flex-col items-center justify-center p-6 text-center border-r border-[#D4AF37]/20">
                  <span className="text-[#D4AF37] font-serif text-xl opacity-70 mb-2">SVJ Exclusive</span>
                  <span className="text-stone-400 text-xs font-mono uppercase tracking-widest opacity-50">Showcase Featured</span>
                </div>
              )}
            </div>

            <div className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between bg-[#FCFAF7] border-t md:border-t-0 md:border-l border-stone-200/60">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-[#D4AF37] animate-pulse"></span>
                  <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-[#936C31] font-mono font-bold">
                    Newly Restocked / Most Liked Masterpiece
                  </span>
                </div>
                
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-stone-900 tracking-tight leading-tight group-hover:text-[#936C31] transition-colors">
                  {settings.ad_title || 'Exquisite Golden Collection'}
                </h3>
                
                <p className="text-stone-600 text-xs sm:text-sm font-serif italic leading-relaxed font-light line-clamp-2 sm:line-clamp-none">
                  {settings.ad_text || 'Experience the unparalleled beauty of our carefully curated designer gold collections, designed to celebrate the golden moments of life.'}
                </p>
              </div>

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-stone-200/50 flex flex-wrap items-center justify-between gap-3">
                {settings.ad_product_id ? (
                  (() => {
                    const linkedProduct = products.find(p => p.id === settings.ad_product_id);
                    return (
                      <>
                        {linkedProduct && (
                          <div className="text-left font-mono text-[9px] sm:text-[10px] text-stone-500 max-w-[180px] sm:max-w-none truncate">
                            Linked: <span className="font-bold text-stone-700">{linkedProduct.name}</span> ({linkedProduct.purity_type})
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (linkedProduct) {
                              handleOpenProduct(linkedProduct);
                            }
                          }}
                          className="px-4 py-1.5 sm:px-5 sm:py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-stone-900 hover:bg-[#936C31] hover:text-white text-stone-100 cursor-pointer transition-all border border-[#D4AF37]/20 flex items-center gap-1.5 rounded-none shadow-xs"
                        >
                          Discover Piece Details
                          <ChevronRight className="h-2.5 w-2.5" />
                        </button>
                      </>
                    );
                  })()
                ) : (
                  <div className="text-stone-400 font-mono text-[8px] sm:text-[9px] uppercase tracking-wider italic">
                    Visit our WhatsApp helpdesk to learn more
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. CAMPAIGN HERO BLOCK */}
      {promoOffer && promoOffer.is_active && (
        <section 
          className="mx-6 sm:mx-auto max-w-4xl mt-8 overflow-hidden text-white relative flex flex-col lg:flex-row items-stretch border border-white/10 rounded-none shadow-sm"
          style={{ backgroundColor: promoOffer.banner_bg_color }}
        >
          <div className="flex-1 p-6 sm:p-8 z-10 flex flex-col justify-center space-y-3">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] bg-white/10 border border-white/25 text-white px-3 py-1.5 font-bold font-mono">
                Limited Time Campaign Offer
              </span>
            </div>
            
            <h2 className="font-serif text-2xl sm:text-3.5xl font-medium italic leading-none tracking-tight text-white">
              {promoOffer.offer_name}
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 font-serif italic font-light leading-relaxed max-w-xl">
              {promoOffer.detailed_description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <span className="bg-black/20 border border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest font-mono font-bold text-white">
                {getCountdownLabel(promoOffer.ends_at)}
              </span>
              <span className="text-[10px] text-white/70 tracking-wider uppercase font-mono">Verified rate lock contracts apply</span>
            </div>
          </div>

          <div className="w-full lg:w-5/12 min-h-[160px] lg:min-h-[220px] overflow-hidden relative shrink-0">
            <img 
              src={promoOffer.banner_image_url} 
              alt="Promotional Campaign Jewelry banner" 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#936C31]/40 via-transparent to-transparent hidden lg:block" />
          </div>
        </section>
      )}

      {/* OUR COLLECTION TITLE */}
      <div className="text-center mt-12 mb-8 px-6">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-[1px] w-12 bg-[#D4AF37]/40" />
          <Gem className="h-4 w-4 text-[#D4AF37]" />
          <div className="h-[1px] w-12 bg-[#D4AF37]/40" />
        </div>
        <h2 className="font-serif text-3xl sm:text-4.5xl font-medium text-[#1A1A1A] tracking-tight">
          {settings.dynamic_theme.collection_title || 'Our Collection'}
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 font-serif italic mt-2 max-w-xl mx-auto">
          {settings.dynamic_theme.collection_subtitle || 'Curated masterpieces in gold and silver — every piece crafted with devotion and precision.'}
        </p>
      </div>

      {/* 5. SEARCH AND FILTER TREE PANEL */}
      <section className="mx-4 sm:mx-auto max-w-4xl mt-6 bg-white p-4 sm:p-8 border border-[#E5E1DA] space-y-4 sm:space-y-6 shadow-xs">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-1 text-stone-400">
            <Search className="h-4 w-4" />
          </span >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom jewelry items, SKU codes, purity definitions (e.g. Haram, Kada, 22K)..."
            className="w-full bg-transparent border-b border-[#1A1A1A] focus:outline-hidden focus:border-[#936C31] rounded-none py-2.5 sm:py-3 pl-8 pr-10 text-xs sm:text-base placeholder-stone-400 font-serif italic text-[#1A1A1A] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-1 text-stone-450 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4 pt-1">
          {/* LEVEL 1: Navigation Splits */}
          <div className="flex overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x pb-2 sm:pb-3 gap-2 items-center border-b border-[#F2EDE4] scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ WebkitOverflowScrolling: 'touch' }}>
            <span className="text-[10px] font-bold text-[#936C31] uppercase font-mono tracking-[0.2em] shrink-0 mr-3">
              Category
            </span>
            <button
              onClick={() => {
                setSelectedMainCat('All');
                setSelectedPurity('All');
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                selectedMainCat === 'All'
                  ? 'border border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              All Metals
            </button>
            <button
              onClick={() => {
                setSelectedMainCat('Gold');
                setSelectedPurity('All');
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedMainCat === 'Gold'
                  ? 'border border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              Gold Jewelry
            </button>
            <button
              onClick={() => {
                setSelectedMainCat('Silver');
                setSelectedPurity('All');
              }}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedMainCat === 'Silver'
                  ? 'border border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              Silver Collection
            </button>
          </div>

          {/* LEVEL 2: Purity Filter Tree */}
          <div className="flex overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x pb-2 sm:pb-3 gap-2 items-center border-b border-[#F2EDE4] scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ WebkitOverflowScrolling: 'touch' }}>
            <span className="text-[10px] font-bold text-[#936C31] uppercase font-mono tracking-[0.2em] shrink-0 mr-3">
              Purity Level
            </span>
            
            <button
              onClick={() => setSelectedPurity('All')}
              className={`px-2.5 py-1.2 sm:px-3 sm:py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                selectedPurity === 'All'
                  ? 'border border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              All Purities
            </button>

            {(selectedMainCat === 'All' || selectedMainCat === 'Gold') && (
              <>
                <button
                  onClick={() => {
                    setSelectedMainCat('Gold');
                    setSelectedPurity('22K Gold');
                  }}
                  className={`px-2.5 py-1.2 sm:px-3 sm:py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                    selectedPurity === '22K Gold'
                      ? 'border border-[#936C31] bg-[#936C31] text-white'
                      : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
                  }`}
                >
                  22K Gold
                </button>
                <button
                  onClick={() => {
                    setSelectedMainCat('Gold');
                    setSelectedPurity('24K Gold');
                  }}
                  className={`px-2.5 py-1.2 sm:px-3 sm:py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                    selectedPurity === '24K Gold'
                      ? 'border border-[#936C31] bg-[#936C31] text-white'
                      : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
                  }`}
                >
                  24K Gold
                </button>
              </>
            )}

            {(selectedMainCat === 'All' || selectedMainCat === 'Silver') && (
              <>
                <button
                  onClick={() => {
                    setSelectedMainCat('Silver');
                    setSelectedPurity('Silver 92.5 Purity');
                  }}
                  className={`px-2.5 py-1.2 sm:px-3 sm:py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                    selectedPurity === 'Silver 92.5 Purity'
                      ? 'border border-stone-800 bg-stone-800 text-white'
                      : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
                  }`}
                >
                  92.5 Silver
                </button>
                <button
                  onClick={() => {
                    setSelectedMainCat('Silver');
                    setSelectedPurity('Normal Silver');
                  }}
                  className={`px-2.5 py-1.2 sm:px-3 sm:py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                    selectedPurity === 'Normal Silver'
                      ? 'border border-stone-800 bg-stone-800 text-white'
                      : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
                  }`}
                >
                  Normal Silver
                </button>
              </>
            )}
          </div>

          {/* LEVEL 3: Style & Gender Selectors */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pt-1">
            <div className="flex overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x gap-2 items-center scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ WebkitOverflowScrolling: 'touch' }}>
              <span className="text-[10px] font-bold text-[#936C31] uppercase font-mono tracking-[0.2em] shrink-0 mr-3">
                Jewelry Style
              </span>
              {['All', ...Array.from(new Set([
                'Bangles',
                'Chains',
                'Rings',
                'Earrings',
                'Others',
                ...products.map(p => p.product_type).filter(Boolean)
              ]))].map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all rounded-none cursor-pointer shrink-0 ${
                    selectedStyle === style
                      ? 'border-b-2 border-[#936C31] text-[#936C31] font-bold'
                      : 'text-stone-500 hover:text-[#1A1A1A]'
                  }`}
                >
                  {style === 'All' ? 'All Styles' : style}
                </button>
              ))}
            </div>

            <div className="flex overflow-x-auto overscroll-x-contain scroll-smooth touch-pan-x gap-2 items-center scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap shrink-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              <span className="text-[10px] font-bold text-[#936C31] uppercase font-mono tracking-[0.2em] shrink-0 mr-2">
                Gender tag
              </span>
              {(([ 'All', 'Men', 'Women', 'Unisex' ] as const)).map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] font-semibold tracking-wider uppercase transition-all rounded-none cursor-pointer shrink-0 ${
                    selectedGender === gender
                      ? 'border border-[#1A1A1A] bg-[#1A1A1A] text-white'
                      : 'border border-[#E5E1DA] bg-white text-[#1A1A1A] hover:bg-[#F2EDE4]'
                  }`}
                >
                  {gender === 'All' ? 'All' : gender}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. PRODUCT CATALOG GRID */}
      <main className="mx-2 sm:mx-10 mt-10 flex-1">
        <div className="mt-2" />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E5E1DA] rounded-none mt-8 px-4">
            <p className="text-stone-400 font-serif text-base italic">
              No articles matching your specific nested filter tree parameters were located inside the database.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMainCat('All');
                setSelectedPurity('All');
                setSelectedStyle('All');
                setSelectedGender('All');
              }}
              className="mt-6 border border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#936C31] hover:border-[#936C31] px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          (() => {
            const goldProducts = filteredProducts.filter(p => p.main_category === 'Gold');
            const silver925Products = filteredProducts.filter(p => p.main_category === 'Silver' && p.purity_type === 'Silver 92.5 Purity');
            const silverProducts = filteredProducts.filter(p => p.main_category === 'Silver' && p.purity_type !== 'Silver 92.5 Purity');

            return (
              <div className="space-y-16 mt-6">
                {renderMainSection(
                  'Golden Jewellery',
                  'Exquisite certified solid gold treasures and masterfully crafted ornaments',
                  '22K / 24K Hallmark Standard',
                  goldProducts,
                  'gold',
                  'Golden',
                  {
                    bg: 'bg-amber-50/50',
                    text: 'text-[#936C31]',
                    border: 'border-amber-200/60',
                    accent: 'bg-[#936C31]'
                  }
                )}

                {renderMainSection(
                  'Silver 92.5 Purity Jewellery',
                  'Premium quality sterling silver hallmarked collection with radiant finishing',
                  '92.5% Fine Sterling',
                  silver925Products,
                  'silver925',
                  'Silver',
                  {
                    bg: 'bg-stone-50/50',
                    text: 'text-stone-800',
                    border: 'border-stone-200/60',
                    accent: 'bg-[#D4AF37]'
                  }
                )}

                {renderMainSection(
                  'Silver Jewellery',
                  'Traditional and modern fine silver accessories and curated standard articles',
                  '99.9% / Curated Silver',
                  silverProducts,
                  'silver',
                  'Silver',
                  {
                    bg: 'bg-stone-50/20',
                    text: 'text-stone-700',
                    border: 'border-stone-100',
                    accent: 'bg-stone-400'
                  }
                )}
              </div>
            );
          })()
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#F2EDE4] px-6 sm:px-10 py-6 mt-20 flex flex-col md:flex-row justify-between items-center border-t border-[#E5E1DA] text-[10px] uppercase tracking-[0.1em] gap-4">
        <div className="space-y-1">
          <p className="font-bold font-serif text-[#1A1A1A] tracking-wider">
            {settings.dynamic_theme.footer_copyright || `© 2026 ${settings.shop_name}.`}
          </p>
          {settings.gstin && (
            <p className="text-[9px] text-[#1A1A1A]/70 font-mono tracking-normal mt-0.5 normal-case">GSTIN: {settings.gstin}</p>
          )}
          {settings.address && (
            <p className="text-[9px] text-[#1A1A1A]/80 font-sans tracking-wide mt-0.5 normal-case font-medium flex items-center gap-1">
              <span className="text-[#936C31]">📍</span> {settings.address}
            </p>
          )}
          <p className="text-[9px] text-[#1A1A1A]/60 italic font-serif mt-0.5 lowercase">
            {settings.dynamic_theme.footer_text || '100% certified 916 hallmark standard jewels. pre-booking registered online.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9px] text-stone-500">
          <span>Security Guaranteed</span>
          <span>•</span>
          <span>Privacy Verified</span>
          <span>•</span>
          <span>Powered by Supabase Realtime Channels</span>
        </div>
      </footer>

      {/* ==========================================
          MODALS & DRAWERS
      ========================================== */}

      {/* 1. PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          settings={settings}
          whatsAppNumbers={whatsAppNumbers}
          reviews={reviews}
          onClose={handleCloseProduct}
          onBack={handleBackProduct}
          onReviewAdded={loadDatabaseState}
          allProducts={products}
          onSelectProduct={handleSelectProduct}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={(curr) => {
            setSelectedCurrency(curr);
            localStorage.setItem('svj_currency', curr);
          }}
          wishlist={wishlist}
          onToggleFavorite={toggleWishlist}
          activeProfile={activeProfile}
          onRequireAuth={() => setShowAuthModal(true)}
        />
      )}

      {/* 2. PROFILE DRAWER */}
      {isProfileOpen && (
        <ProfileDrawer
          settings={settings}
          activeProfile={activeProfile}
          onLogin={(profile) => {
            setActiveProfile(profile);
            localStorage.setItem('svj_active_customer_email', profile.email);
            localStorage.setItem('svj_active_customer_profile', JSON.stringify(profile));
            loadDatabaseState();
          }}
          onLogout={() => {
            setActiveProfile(null);
            setWishlist([]); // Reset parent array components cleanly on exit parameters
            localStorage.removeItem('svj_active_customer_email');
            localStorage.removeItem('svj_active_customer_profile');
            // Explicitly sign out from Supabase engine instance
            if (isRealSupabaseConnected && supabase) {
              supabase.auth.signOut();
            }
            loadDatabaseState();
          }}

          onClose={() => setIsProfileOpen(false)}
          onOpenAdmin={() => {
            if (localStorage.getItem('svj_admin_authenticated') === 'true') {
              setIsAdminPanelOpen(true);
            } else {
              setIsPasswordGateOpen(true);
            }
          }}
          onProfileUpdated={(updatedProfile) => {
            if (updatedProfile) {
              setActiveProfile(updatedProfile);
              localStorage.setItem('svj_active_customer_profile', JSON.stringify(updatedProfile));
            }
            loadDatabaseState();
          }}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={(curr) => {
            setSelectedCurrency(curr);
            localStorage.setItem('svj_currency', curr);
          }}
        />
      )}

      {/* 3. ADMIN PASSWORD VAULT GATE */}
      {isPasswordGateOpen && (
        <PasswordGate
          settings={settings}
          onSuccess={() => {
            setIsPasswordGateOpen(false);
            setIsAdminPanelOpen(true);
            try {
              localStorage.setItem('svj_admin_authenticated', 'true');
            } catch (e) {
              console.error(e);
            }
          }}
          onCancel={() => setIsPasswordGateOpen(false)}
        />
      )}

      {/* 4. MAIN ADMIN WORKSPACE CONTROL CENTER */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <AdminPanel
            settings={settings}
            products={products}
            whatsAppNumbers={whatsAppNumbers}
            promoOffer={promoOffer || {
              offer_name: 'Sankranthi Offer',
              detailed_description: '',
              ends_at: new Date().toISOString(),
              banner_image_url: '',
              banner_bg_color: '#000000',
              is_active: false
            }}
            onRefresh={loadDatabaseState}
            onClose={() => {
              setIsAdminPanelOpen(false);
              try {
                localStorage.removeItem('svj_admin_authenticated');
              } catch (e) {
                console.error(e);
              }
            }}
            onPreviewProduct={(p) => {
              setIsAdminPanelOpen(false);
              handleOpenProduct(p);
            }}
          />
        </div>
      )}

      {/* 5. LIVE SUPABASE DEVELOPER CONNECTION SETUP GUIDE */}
      {showConnectionGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-955/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6.5 text-stone-800 shadow-2xl relative">
            <button
              onClick={() => setShowConnectionGuide(false)}
              className="absolute top-4 right-4 rounded-full bg-stone-100 p-2 text-stone-600 hover:bg-stone-250 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Connect Sri Venkateswara Jewellers to Supabase
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Currently running in **Simulated Sandbox Mode** with direct LocalStorage synchronization. Complete these quick steps to hook up your live production relational tables:
            </p>

            <div className="mt-4 space-y-4 text-xs">
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-2">
                <span className="font-bold text-amber-800 font-mono block">1. Set Secrets in AI Studio Settings:</span>
                <p className="text-stone-600">
                  Click the <strong>Secrets/Variables panel</strong> (or gear settings icon) in the Google AI Studio build dashboard and define:
                </p>
                <ul className="list-disc pl-4.5 text-stone-600 space-y-1 font-mono text-[10px]">
                  <li>VITE_SUPABASE_URL = "https://your-project.supabase.co"</li>
                  <li>VITE_SUPABASE_ANON_KEY = "your-anon-public-key"</li>
                  <li>VITE_MASTER_BYPASS_KEY = "Sanju@1234"</li>
                </ul>
              </div>

              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-1.5">
                <span className="font-bold text-amber-800 font-mono block">2. Initialize database schema:</span>
                <p className="text-stone-600">
                  Open our <strong>Admin Panel</strong>, click the <strong>PostgreSQL SQL Setup</strong> tab on the sidebar, copy the auto-generated query script, and run it inside your Supabase project SQL Editor page!
                </p>
              </div>

              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50 space-y-1">
                <span className="font-bold text-amber-800 font-mono block">3. Re-launch / refresh Applet:</span>
                <p className="text-stone-600">
                  Once environment tokens propagate, Sri Venkateswara Jewellers will dynamically swap to querying live Postgres tables. Changes made inside the Admin Panel will immediately re-sync on customer screens!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConnectionGuide(false)}
              className="mt-6 w-full rounded-xl py-3 text-xs font-bold text-stone-900 bg-amber-400 hover:bg-amber-500 shadow-md cursor-pointer text-center"
            >
              Understood, let me review the Showroom!
            </button>
          </div>
        </div>
      )}

      {/* 6. EXPANDED LOGO PREVIEW POPUP */}
      <AnimatePresence>
        {isLogoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoModalOpen(false)}
              className="absolute inset-0 bg-stone-955/85 backdrop-blur-md cursor-zoom-out"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/30 bg-stone-900 text-white shadow-2xl p-6 flex flex-col items-center"
            >
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37]/40 rounded-tr-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37]/40 rounded-bl-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37]/40 rounded-br-2xl pointer-events-none" />

              <button
                onClick={() => setIsLogoModalOpen(false)}
                className="absolute top-4 right-4 rounded-full bg-stone-850 p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 transition-all cursor-pointer shadow-sm"
                title="Close overlay"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mt-2 mb-6">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold block mb-1">
                  Official Insignia
                </span>
                <h3 className={`text-white leading-tight transition-all duration-300 ${
                  (settings.shop_name_font === 'greatvibes' || settings.shop_name_font === 'sacramento')
                    ? 'text-3xl'
                    : 'text-xl'
                } ${getShopNameClasses()}`}>
                  {settings.shop_name}
                </h3>
              </div>

              <div className="relative aspect-square w-full max-w-xs rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 p-2 shadow-inner flex items-center justify-center">
                <img
                  src={settings.logo_url}
                  alt={`${settings.shop_name} Official Logo`}
                  className="max-h-full max-w-full object-contain rounded-xl select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full mt-6 pt-4 border-t border-stone-800/80 text-center space-y-1">
                <p className="text-xs text-stone-300 font-serif italic">
                  "Excellence, Purity, and Integrity since generations"
                </p>
                <div className="flex items-center justify-center gap-4 text-[9px] uppercase tracking-wider text-stone-500 font-mono pt-1">
                  <span>HUID Compliant</span>
                  <span>•</span>
                  <span>BIS Hallmarked</span>
                  <span>•</span>
                  <span>Premium Certified</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showAuthModal && (
        <CustomerLoginGate
          settings={settings}
          onLoginSuccess={(profile) => {
            setActiveProfile(profile);
            localStorage.setItem('svj_active_customer_email', profile.email);
            localStorage.setItem('svj_active_customer_profile', JSON.stringify(profile));
            loadDatabaseState();
            setShowAuthModal(false);
          }}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {isWishlistOpen && (
        <WishlistDrawer
          settings={settings}
          wishlist={wishlist}
          products={products}
          onClose={() => setIsWishlistOpen(false)}
          onToggleFavorite={toggleWishlist}
          onSelectProduct={handleSelectProduct}
          selectedCurrency={selectedCurrency}
        />
      )}

      {/* FLOATING WHATSAPP & PHONE CONTACT BUTTONS */}
      {settings && !isAdminPanelOpen && !selectedProduct && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-200" style={{ pointerEvents: 'auto' }}>
          {/* WhatsApp Button */}
          {whatsAppNumbers.length > 0 && (
            <motion.a
              href={`https://wa.me/${whatsAppNumbers[0].phone_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${settings.shop_name}, I'd like to enquire about your jewellery collection.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 cursor-pointer hover:bg-stone-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`Chat on WhatsApp — ${whatsAppNumbers[0].reference_name}`}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-10 h-10" />
            </motion.a>
          )}

          {/* Phone Call Button */}
          {whatsAppNumbers.length > 0 && (
            <motion.a
              href={`tel:${whatsAppNumbers[0].phone_number.replace(/[^0-9+]/g, '')}`}
              className="group flex items-center justify-center w-12 h-12 rounded-full border border-stone-200 transition-all duration-300 cursor-pointer hover:bg-stone-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`Call ${settings.shop_name}`}
            >
              <Phone className="w-6 h-6 text-stone-600" />
            </motion.a>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} primaryColor={primaryColor} />
    </div>
  );
};
