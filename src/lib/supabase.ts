import { createClient } from '@supabase/supabase-js';
import { StoreSettings, Product, WhatsAppNumber, PromotionalOffer, Review, Profile, StockNotification, EmailLog } from '../types';

// Read env variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

// Determine if real Supabase should be initialized
export const isRealSupabaseConnected = 
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-supabase-project') && 
  !supabaseAnonKey.includes('your-supabase-anon-key');

// Create standard Supabase Client with strict session persistence settings enabled
export const supabase = isRealSupabaseConnected 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,      // Tells the client to keep users logged in across tab closes
        autoRefreshToken: true,    // Seamlessly handles token expiration updates behind the scenes
        detectSessionInUrl: true   // Captures OAuth/MagicLink tokens automatically if needed
      }
    }) 
  : null;

// ==========================================
// SEED DATA FOR SIMULATED ENGINE
// ==========================================

const DEFAULT_SETTINGS: StoreSettings = {
  shop_name: 'Sri Venkateswara Jewellers',
  logo_url: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=200&auto=format&fit=crop',
  gold_22k_rate: 13294,
  gold_24k_rate: 14450,
  silver_normal_rate: 220,
  silver_999_rate: 558,
  dynamic_theme: {
    primary: '#936C31', // Editorial Bronze/Gold
    secondary: '#1A1A1A', // Editorial Deep Charcoal
    headerBg: '#1A1A1A', // Elegant Dark Header
    headerText: '#FCFAF7', // Warm Gold/Cream text
    bg: '#FCFAF7', // Warm Creamy White
    cardBg: '#ffffff', // Clean white cards
    text: '#1A1A1A', // Deep Charcoal text
    accent: '#D4AF37', // Editorial Gold Accent
  },
  admin_password: 'Sanju@1234',
  gstin: '37AAAAA1111A1Z1',
  address: 'Ammavarisala St, Sainagar, Rajampet, Andhra Pradesh 516115',
  shop_phone: '+919876543210',
  ad_active: false,
  ad_media_type: 'image',
  ad_media_url: '',
  ad_title: '',
  ad_text: '',
  ad_product_id: '',
  shop_name_font: 'serif',
  shop_name_italic: true,
  shop_name_bold: false,
  shop_name_spacing: 'tight',
  
  // Flat promotional offer defaults
  flat_offer_active: false,
  flat_offer_canceled_gold_22k: 13800,
  flat_offer_exclusive_gold_22k: 13200,
  flat_offer_canceled_gold_24k: 15000,
  flat_offer_exclusive_gold_24k: 14400,
  flat_offer_canceled_silver_999: 600,
  flat_offer_exclusive_silver_999: 550,
  flat_offer_canceled_silver_normal: 250,
  flat_offer_exclusive_silver_normal: 210,
  flat_offer_discount_amount: 1000
};

const DEFAULT_PROMO: PromotionalOffer = {
  offer_name: 'Sankranthi Gold Fest & Shubh Vivah Muhurtham Special',
  detailed_description: 'Celebrate the holy wedding season with exclusive rate locks and a flat 4.5% making charges on premium Kundan Harams, Temple Bangles, and Ornate Waistbands. Pre-book your rate now to secure against price volatility!',
  ends_at: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
  banner_image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
  banner_bg_color: '#7c2d12', // Deep Rich Rust / Terracotta Red
  is_active: true
};

const DEFAULT_WHATSAPP: WhatsAppNumber[] = [
  { id: 'wa-1', phone_number: '+919876543210', reference_name: 'Main Golden Showroom Desk' },
  { id: 'wa-2', phone_number: '+918765432109', reference_name: 'Sanjeeva Reddy (Senior Valuer)' }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Royal Nizam Antique Kundan Haram',
    SKU: 'SVJ-KND-HRM-001',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'Chains',
    weight_grams: 48.5,
    making_charge_percent: 12.5,
    image_urls: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 2,
    has_stone: true,
    metal_weight_grams: 45.5,
    stone_weight_grams: 3.0,
    stone_price: 25000
  },
  {
    id: 'prod-2',
    name: 'South Indian Lakshmi Temple Kasu Mala',
    SKU: 'SVJ-TMP-MAL-002',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'Chains',
    weight_grams: 36.2,
    making_charge_percent: 10.0,
    image_urls: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 8
  },
  {
    id: 'prod-3',
    name: 'Ganga Jamuna Gold Filigree Bangles',
    SKU: 'SVJ-GMB-BGL-003',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'Bangles',
    weight_grams: 28.0,
    making_charge_percent: 8.5,
    image_urls: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 1
  },
  {
    id: 'prod-4',
    name: "Classic Men's 24K Sovereign Crest Ring",
    SKU: 'SVJ-SVR-RNG-004',
    main_category: 'Gold',
    purity_type: '24K Gold',
    gender_tag: 'Men',
    product_type: 'Rings',
    weight_grams: 11.5,
    making_charge_percent: 6.0,
    image_urls: [
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 5
  },
  {
    id: 'prod-5',
    name: 'Ornate Nakshi Silver Kada',
    SKU: 'SVJ-SLV-KDA-005',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Unisex',
    product_type: 'Bangles',
    weight_grams: 52.0,
    making_charge_percent: 14.0,
    image_urls: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 12
  },
  {
    id: 'prod-6',
    name: 'Filigree Silver Chandelier Jhumkas',
    SKU: 'SVJ-SLV-JHM-006',
    main_category: 'Silver',
    purity_type: 'Normal Silver',
    gender_tag: 'Women',
    product_type: 'Earrings',
    weight_grams: 22.4,
    making_charge_percent: 11.0,
    image_urls: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 2
  },
  {
    id: 'prod-7',
    name: 'Sleek Italian Silver Link Bracelet',
    SKU: 'SVJ-SLV-BRC-007',
    main_category: 'Silver',
    purity_type: 'Normal Silver',
    gender_tag: 'Men',
    product_type: 'Chains',
    weight_grams: 35.0,
    making_charge_percent: 8.0,
    image_urls: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: false,
    stock_quantity: 0
  },
  {
    id: 'prod-8',
    name: 'Imperial Solitaire 92.5 Silver Ring',
    SKU: 'SVJ-SLV-RNG-925',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Women',
    product_type: 'Rings',
    weight_grams: 5.5,
    making_charge_percent: 10.0,
    image_urls: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 15
  },
  {
    id: 'prod-9',
    name: 'Traditional 22K Gold Antique Jhumkas',
    SKU: 'SVJ-GLD-EAR-009',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'Earrings',
    weight_grams: 14.5,
    making_charge_percent: 11.0,
    image_urls: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 4
  },
  {
    id: 'prod-10',
    name: 'Sovereign 22K Gold Waist Belt (Vaddanam)',
    SKU: 'SVJ-GLD-OTH-010',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'Others',
    weight_grams: 85.0,
    making_charge_percent: 13.5,
    image_urls: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 1
  },
  {
    id: 'prod-11',
    name: 'Elegant 22K Gold Peacock Ring',
    SKU: 'SVJ-GLD-RNG-011',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'RNG-011',
    weight_grams: 8.2,
    making_charge_percent: 9.0,
    image_urls: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 6
  },
  {
    id: 'prod-12',
    name: 'Sleek 22K Gold Rope Chain',
    SKU: 'SVJ-GLD-CHN-012',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Unisex',
    product_type: 'Chains',
    weight_grams: 18.5,
    making_charge_percent: 7.5,
    image_urls: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 10
  },
  {
    id: 'prod-13',
    name: 'Classic 22K Gold Temple Kangan',
    SKU: 'SVJ-GLD-BGL-013',
    main_category: 'Gold',
    purity_type: '22K Gold',
    gender_tag: 'Women',
    product_type: 'Bangles',
    weight_grams: 32.0,
    making_charge_percent: 9.5,
    image_urls: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 3
  },
  {
    id: 'prod-14',
    name: '92.5 Sterling Silver Figaro Chain',
    SKU: 'SVJ-S92-CHN-014',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Men',
    product_type: 'Chains',
    weight_grams: 12.0,
    making_charge_percent: 8.0,
    image_urls: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 25
  },
  {
    id: 'prod-15',
    name: '92.5 Silver Designer Cuff Bangle',
    SKU: 'SVJ-S92-BGL-015',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Women',
    product_type: 'Bangles',
    weight_grams: 24.5,
    making_charge_percent: 10.0,
    image_urls: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 12
  },
  {
    id: 'prod-16',
    name: '92.5 Silver Floral Stud Earrings',
    SKU: 'SVJ-S92-EAR-016',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Women',
    product_type: 'Earrings',
    weight_grams: 6.8,
    making_charge_percent: 12.0,
    image_urls: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 30
  },
  {
    id: 'prod-17',
    name: '92.5 Silver Antique Anklets (Payal)',
    SKU: 'SVJ-S92-OTH-017',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Women',
    product_type: 'Others',
    weight_grams: 38.0,
    making_charge_percent: 9.0,
    image_urls: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 14
  },
  {
    id: 'prod-18',
    name: 'Aura Fine Silver Band Ring',
    SKU: 'SVJ-S99-RNG-018',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Unisex',
    product_type: 'Rings',
    weight_grams: 7.2,
    making_charge_percent: 7.0,
    image_urls: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 18
  },
  {
    id: 'prod-19',
    name: 'Pure Silver Chased Kada',
    SKU: 'SVJ-S99-BGL-019',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Men',
    product_type: 'Bangles',
    weight_grams: 48.0,
    making_charge_percent: 10.0,
    image_urls: [
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 5
  },
  {
    id: 'prod-20',
    name: 'Classic Silver Snake Chain',
    SKU: 'SVJ-SLV-CHN-020',
    main_category: 'Silver',
    purity_type: 'Normal Silver',
    gender_tag: 'Unisex',
    product_type: 'Chains',
    weight_grams: 22.0,
    making_charge_percent: 6.5,
    image_urls: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 20
  },
  {
    id: 'prod-21',
    name: 'Standard Silver Hoop Earrings',
    SKU: 'SVJ-SLV-EAR-021',
    main_category: 'Silver',
    purity_type: 'Normal Silver',
    gender_tag: 'Women',
    product_type: 'Earrings',
    weight_grams: 10.5,
    making_charge_percent: 8.5,
    image_urls: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 15
  },
  {
    id: 'prod-22',
    name: 'Divine Pure Silver Pooja Plate',
    SKU: 'SVJ-S99-OTH-022',
    main_category: 'Silver',
    purity_type: 'Silver 92.5 Purity',
    gender_tag: 'Unisex',
    product_type: 'Others',
    weight_grams: 150.0,
    making_charge_percent: 15.0,
    image_urls: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop'
    ],
    is_in_stock: true,
    stock_quantity: 4
  }
];

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    product_id: 'prod-1',
    user_id: 'guest-1',
    user_name: 'Ananya Rao',
    rating_stars: 5,
    review_text: 'Absolutely stunning work of art. The antique finish on the Kundan Stones is spectacular. Reached out via WhatsApp and they sent me additional pictures instantly!',
    created_at: '2026-06-20T10:00:00.000Z'
  },
  {
    id: 'rev-2',
    product_id: 'prod-1',
    user_id: 'guest-2',
    user_name: 'Lakshmi Prasanna',
    rating_stars: 4,
    review_text: 'Classic design, weight matches exactly as listed. Making charges are extremely transparent.',
    created_at: '2026-06-25T14:30:00.000Z'
  },
  {
    id: 'rev-3',
    product_id: 'prod-4',
    user_id: 'guest-3',
    user_name: 'Kalyan Kumar',
    rating_stars: 5,
    review_text: 'Genuine 24K gold ring, heavy and premium. Truly satisfactory custom sizing desk!',
    created_at: '2026-06-24T18:00:00.000Z'
  }
];

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'p-1',
    username: 'Sanjeeva Reddy',
    email: 'lakkireddysanjeevareddy8@gmail.com',
    phone_number: '+919900887766',
    shipping_address: 'Ammavarisala St, Sainagar, Rajampet, Andhra Pradesh 516115'
  },
  {
    id: 'p-2',
    username: 'SVJ Rajampet',
    email: 'svj.rajampet@gmail.com',
    phone_number: '8500226521',
    shipping_address: 'Rajampet, Andhra Pradesh - 516115'
  },
  {
    id: 'p-3',
    username: 'Bharath',
    email: 'kothurubharath@gmail.com',
    phone_number: '8500226521',
    shipping_address: 'Andhra Pradesh'
  }
];

// Custom Event Name for Simulation Updates (mimics real-time channel)
const SIM_DB_UPDATE_EVENT = 'sv_jewellers_db_update';

const LOCAL_STORAGE_KEYS = [
  'svj_settings',
  'svj_products',
  'svj_whatsapp_numbers',
  'svj_promotions',
  'svj_reviews',
  'svj_profiles',
  'svj_stock_notifications',
  'svj_email_logs',
  'svj_passwords',
  'svj_user_wishlists'
];

export const memoryCache: Record<string, any> = {};

export const syncWithServer = async (isStartup = false): Promise<void> => {
  try {
    const res = await fetch(`/api/db?t=${Date.now()}`);
    if (!res.ok) return;
    const serverData = await res.json();
    
    if (serverData && serverData.initialized) {
      // Server has state! Update our localStorage
      LOCAL_STORAGE_KEYS.forEach(key => {
        if (serverData[key] !== undefined) {
          memoryCache[key] = serverData[key];
          try {
            localStorage.setItem(key, JSON.stringify(serverData[key]));
          } catch (err) {
            console.warn(`localStorage quota exceeded for ${key} during sync, relying on memoryCache`);
          }
        }
      });

      // Ensure that if the server contains the older shop name, we update it to 'Sri Venkateswara Jewellers'
      const loadedSettingsStr = localStorage.getItem('svj_settings');
      if (loadedSettingsStr || memoryCache['svj_settings']) {
        const parsed = memoryCache['svj_settings'] || JSON.parse(loadedSettingsStr as string);
        if (parsed.shop_name === 'Nazeer Jewellers' || parsed.shop_name === 'Sri Venkateswara Golden Jewellers') {
          parsed.shop_name = 'Sri Venkateswara Jewellers';
          localStorage.setItem('svj_settings', JSON.stringify(parsed));
          await pushLocalStateToServer();
        }
      }
    } else if (isStartup) {
      // Server is NOT initialized. Let's send our current localStorage (which has been initialized via initLocalStorageDB) to the server!
      const payload: Record<string, any> = { initialized: true };
      LOCAL_STORAGE_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val) {
          payload[key] = JSON.parse(val);
        }
      });
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  } catch (error) {
    console.error('Failed to sync with server:', error);
  }
};

export const pushLocalStateToServer = async (overrides?: Record<string, any>): Promise<void> => {
  try {
    const payload: Record<string, any> = { initialized: true };
    LOCAL_STORAGE_KEYS.forEach(key => {
      if (overrides && overrides[key] !== undefined) {
        payload[key] = overrides[key];
      } else if (memoryCache[key] !== undefined) {
        payload[key] = memoryCache[key];
      } else {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            payload[key] = JSON.parse(val);
          } catch (e) {
            console.error(`Failed to parse localStorage key ${key} during push:`, e);
          }
        }
      }
    });
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error('Failed to push state to server. Status:', res.status);
    }
  } catch (error) {
    console.error('Failed to push state to server:', error);
  }
};

// Helper to notify active listeners
const triggerSimulationSync = async (overrides?: Record<string, any>): Promise<void> => {
  try {
    await pushLocalStateToServer(overrides);
  } catch (err) {
    console.error("Error pushing local state to server:", err);
  }
  window.dispatchEvent(new CustomEvent(SIM_DB_UPDATE_EVENT));
};

// ==========================================
// DUAL MODE DATA API
// ==========================================

// Initial seed
const initLocalStorageDB = () => {
  const existingSettings = localStorage.getItem('svj_settings');
  if (existingSettings) {
    try {
      const parsed = JSON.parse(existingSettings);
      if (parsed.shop_name === 'Sri Venkateswara Golden Jewellers' || parsed.shop_name === 'Nazeer Jewellers') {
        // Clear out old keys to force a fresh seed matching the new layout and shop name perfectly
        localStorage.removeItem('svj_settings');
        localStorage.removeItem('svj_profiles');
        localStorage.removeItem('svj_promotions');
      } else {
        // Enrich existing with advertising fields if missing
        if (parsed.ad_active === undefined) {
          parsed.ad_active = DEFAULT_SETTINGS.ad_active;
          parsed.ad_media_type = DEFAULT_SETTINGS.ad_media_type;
          parsed.ad_media_url = DEFAULT_SETTINGS.ad_media_url;
          parsed.ad_title = DEFAULT_SETTINGS.ad_title;
          parsed.ad_text = DEFAULT_SETTINGS.ad_text;
          parsed.ad_product_id = DEFAULT_SETTINGS.ad_product_id;
          localStorage.setItem('svj_settings', JSON.stringify(parsed));
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  if (!localStorage.getItem('svj_settings')) {
    localStorage.setItem('svj_settings', JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem('svj_promotions')) {
    localStorage.setItem('svj_promotions', JSON.stringify(DEFAULT_PROMO));
  }
  if (!localStorage.getItem('svj_whatsapp_numbers')) {
    localStorage.setItem('svj_whatsapp_numbers', JSON.stringify(DEFAULT_WHATSAPP));
  }
  const existingProds = localStorage.getItem('svj_products');
  if (!existingProds || !existingProds.includes('prod-22')) {
    localStorage.setItem('svj_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('svj_reviews')) {
    localStorage.setItem('svj_reviews', JSON.stringify(DEFAULT_REVIEWS));
  }
  if (!localStorage.getItem('svj_profiles')) {
    localStorage.setItem('svj_profiles', JSON.stringify(DEFAULT_PROFILES));
  }
};

initLocalStorageDB();

// Setup listener helper
export const subscribeToRealtimeChanges = (callback: () => void): (() => void) => {
  if (isRealSupabaseConnected && supabase) {
    // Listen to real Supabase Realtime Channels
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          callback();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } else {
    // Fallback simulated realtime channel using browser event bus
    const handler = () => {
      callback();
    };
    window.addEventListener(SIM_DB_UPDATE_EVENT, handler);
    window.addEventListener('storage', handler); // sync across multiple browser tabs
    return () => {
      window.removeEventListener(SIM_DB_UPDATE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }
};

// --- Profiles ---
export const getProfiles = async (): Promise<Profile[]> => {
  const localProfiles: Profile[] = JSON.parse(localStorage.getItem('svj_profiles') || '[]');
  
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('profiles').select('*');
    if (!error && data) {
      // Merge Supabase data with local changes to preserve local edits (e.g. shipping address)
      // that might have failed to upsert due to RLS policies when logged in locally.
      const merged = data.map((dbProf: any) => {
        const local = localProfiles.find(p => p.id === dbProf.id);
        if (local) {
          return { ...dbProf, ...local };
        }
        return dbProf;
      });
      
      // Also append any local profiles that don't exist in Supabase yet
      localProfiles.forEach(local => {
        if (!merged.find((m: any) => m.id === local.id)) {
          merged.push(local);
        }
      });
      
      return merged;
    }
  }
  return localProfiles;
};

export const updateProfile = async (profile: Profile): Promise<Profile> => {
  const { password, ...dbProfile } = profile;
  
  // First, always update local storage so it serves as our reliable state
  const profiles: Profile[] = JSON.parse(localStorage.getItem('svj_profiles') || '[]');
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx > -1) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem('svj_profiles', JSON.stringify(profiles));

  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dbProfile)
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase updateProfile error:", error);
    }
    // We proceed to triggerSimulationSync even if there's an error, 
    // to ensure local state syncs up to Express DB.
  }
  
  await triggerSimulationSync();
  return profile;
};

// --- Store Settings ---
export const getStoreSettings = async (): Promise<StoreSettings> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('store_settings').select('*').maybeSingle();
    if (!error && data) return { ...DEFAULT_SETTINGS, ...data };
  }
  if (memoryCache['svj_settings']) return { ...DEFAULT_SETTINGS, ...memoryCache['svj_settings'] };
  const local = localStorage.getItem('svj_settings');
  return local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : DEFAULT_SETTINGS;
};

export const updateStoreSettings = async (settings: StoreSettings): Promise<StoreSettings> => {
  if (isRealSupabaseConnected && supabase) {
    const payload = { ...settings, id: settings.id || 'current-settings' };
    const { data, error } = await supabase
      .from('store_settings')
      .upsert(payload)
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase updateStoreSettings error:", error);
    }
    if (!error) {
      await triggerSimulationSync();
      return data || payload;
    }
  }
  memoryCache['svj_settings'] = settings;
  try {
    localStorage.setItem('svj_settings', JSON.stringify(settings));
  } catch (err) {
    console.warn('localStorage quota exceeded. Pushing state directly to server.', err);
  }
  await triggerSimulationSync({ svj_settings: settings });
  return settings;
};

// --- Products ---
export const getProducts = async (): Promise<Product[]> => {
  let list: any[] = [];
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('products').select('*').order('id');
    if (!error && data) {
      list = data;
    }
  } else {
    list = JSON.parse(localStorage.getItem('svj_products') || '[]');
  }
  
  // Sort by ID to keep the positions strictly fixed on updates
  list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));

  return list.map((p: any) => ({
    ...p,
    stock_quantity: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 5 : 0)
  }));
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`
  };

  if (isRealSupabaseConnected && supabase) {
    // Use an array insert (canonical form) and maybeSingle() so a blocked
    // re-select (e.g. missing/strict RLS SELECT policy) doesn't throw the
    // "Cannot coerce the result to a single JSON object" error.
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase createProduct insert error:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    // If the insert succeeded but the row wasn't returned (RLS blocking the
    // read-back), fall back to the object we sent instead of failing.
    triggerSimulationSync();
    return data || newProduct;
  }
  const products = await getProducts();
  products.push(newProduct);
  localStorage.setItem('svj_products', JSON.stringify(products));
  triggerSimulationSync();
  return newProduct;
};

export const updateProduct = async (product: Product): Promise<Product> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase updateProduct error:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    const resultProduct = data || product;
    await processStockNotificationsForProduct(resultProduct);
    triggerSimulationSync();
    return resultProduct;
  }
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx > -1) {
    products[idx] = product;
    localStorage.setItem('svj_products', JSON.stringify(products));
    await processStockNotificationsForProduct(product);
    triggerSimulationSync();
  }
  return product;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (isRealSupabaseConnected && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error("Supabase deleteProduct error:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    triggerSimulationSync();
    return true;
  }
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  localStorage.setItem('svj_products', JSON.stringify(filtered));
  triggerSimulationSync();
  return true;
};

// --- WhatsApp Numbers ---
export const getWhatsAppNumbers = async (): Promise<WhatsAppNumber[]> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('whatsapp_numbers').select('*');
    if (!error && data) return data;
  }
  return JSON.parse(localStorage.getItem('svj_whatsapp_numbers') || '[]');
};

export const addWhatsAppNumber = async (num: Omit<WhatsAppNumber, 'id'>): Promise<WhatsAppNumber> => {
  const newNum: WhatsAppNumber = {
    ...num,
    id: `wa-${Date.now()}`
  };

  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .insert([newNum])
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase addWhatsAppNumber insert error:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    triggerSimulationSync();
    return data || newNum;
  }
  const nums = await getWhatsAppNumbers();
  nums.push(newNum);
  localStorage.setItem('svj_whatsapp_numbers', JSON.stringify(nums));
  triggerSimulationSync();
  return newNum;
};

export const deleteWhatsAppNumber = async (id: string): Promise<boolean> => {
  if (isRealSupabaseConnected && supabase) {
    const { error } = await supabase.from('whatsapp_numbers').delete().eq('id', id);
    if (!error) {
      triggerSimulationSync();
      return true;
    }
  }
  const nums = await getWhatsAppNumbers();
  const filtered = nums.filter(n => n.id !== id);
  localStorage.setItem('svj_whatsapp_numbers', JSON.stringify(filtered));
  triggerSimulationSync();
  return true;
};

// --- Promotional Offers ---
export const getPromoOffer = async (): Promise<PromotionalOffer> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('promotional_offers').select('*').maybeSingle();
    if (!error && data) return data;
  }
  return JSON.parse(localStorage.getItem('svj_promotions') || JSON.stringify(DEFAULT_PROMO));
};

export const updatePromoOffer = async (promo: PromotionalOffer): Promise<PromotionalOffer> => {
  if (isRealSupabaseConnected && supabase) {
    const payload = { ...promo, id: promo.id || 'current-promo' };
    const { data, error } = await supabase
      .from('promotional_offers')
      .upsert(payload)
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase updatePromoOffer error:", error);
    }
    if (!error) {
      triggerSimulationSync();
      return data || payload;
    }
  }
  localStorage.setItem('svj_promotions', JSON.stringify(promo));
  triggerSimulationSync();
  return promo;
};

// --- Reviews ---
export const getReviews = async (): Promise<Review[]> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('reviews').select('*');
    if (!error && data) return data;
  }
  return JSON.parse(localStorage.getItem('svj_reviews') || '[]');
};

export const addReview = async (review: Omit<Review, 'id' | 'created_at'>): Promise<Review> => {
  const newReview: Review = {
    ...review,
    id: `rev-${Date.now()}`,
    created_at: new Date().toISOString()
  };

  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([newReview])
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase addReview insert error:", error);
      throw new Error(error.message || JSON.stringify(error));
    }
    triggerSimulationSync();
    return data || newReview;
  }
  const reviews = await getReviews();
  reviews.push(newReview);
  localStorage.setItem('svj_reviews', JSON.stringify(reviews));
  triggerSimulationSync();
  return newReview;
};

// --- Back In Stock Notification Workspace & Simulation ---

export const getStockNotifications = async (): Promise<StockNotification[]> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('stock_notifications').select('*');
    if (!error && data) return data;
  }
  return JSON.parse(localStorage.getItem('svj_stock_notifications') || '[]');
};

export const getEmailLogs = async (): Promise<EmailLog[]> => {
  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase.from('email_logs').select('*');
    if (!error && data) return data;
  }
  return JSON.parse(localStorage.getItem('svj_email_logs') || '[]');
};

export const addStockNotification = async (productId: string, email: string): Promise<StockNotification> => {
  const newNotif: StockNotification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    product_id: productId,
    email: email.trim().toLowerCase(),
    created_at: new Date().toISOString(),
    is_notified: false
  };

  if (isRealSupabaseConnected && supabase) {
    const { data, error } = await supabase
      .from('stock_notifications')
      .insert([{
        id: newNotif.id,
        product_id: newNotif.product_id,
        email: newNotif.email,
        is_notified: false
      }])
      .select()
      .maybeSingle();
    if (error) {
      console.error("Supabase addStockNotification insert error:", error);
    }
    if (!error) {
      triggerSimulationSync();
      return data || newNotif;
    }
  }

  const notifications = await getStockNotifications();
  // Avoid duplicates
  const exists = notifications.some(n => n.product_id === productId && n.email === newNotif.email && !n.is_notified);
  if (!exists) {
    notifications.push(newNotif);
    localStorage.setItem('svj_stock_notifications', JSON.stringify(notifications));
    triggerSimulationSync();
  }
  return newNotif;
};

export const processStockNotificationsForProduct = async (product: Product): Promise<void> => {
  // Only process if the product is back in stock
  if (!product.is_in_stock) return;

  const notifications = await getStockNotifications();
  const pendingNotifs = notifications.filter(n => n.product_id === product.id && !n.is_notified);

  if (pendingNotifs.length === 0) return;

  const emailLogs = await getEmailLogs();
  const nowStr = new Date().toISOString();

  // Try fetching current settings for high fidelity price/branding information
  let shopName = "Sri Venkateswara Golden Jewellers (Nazeer Jewellers)";
  let rawMetalRate = 0;
  let estimatedPriceStr = "Pricing determined on request";
  let gstinStr = "";

  try {
    const settings = await getStoreSettings();
    if (settings) {
      shopName = settings.shop_name || shopName;
      if (settings.gstin) {
        gstinStr = `\nGSTIN Number: ${settings.gstin}`;
      }

      // Identify correct daily rate based on purity type
      if (product.purity_type === '22K Gold') {
        rawMetalRate = settings.gold_22k_rate;
      } else if (product.purity_type === '24K Gold') {
        rawMetalRate = settings.gold_24k_rate;
      } else if (product.purity_type === 'Silver 92.5 Purity') {
        rawMetalRate = settings.silver_999_rate;
      } else if (product.purity_type === 'Normal Silver') {
        rawMetalRate = settings.silver_normal_rate;
      }

      if (rawMetalRate > 0) {
        const finalPrice = (product.weight_grams * rawMetalRate) * (1 + (product.making_charge_percent || 0) / 100);
        estimatedPriceStr = new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(finalPrice);
      }
    }
  } catch (err) {
    console.error("Failed to query live store settings for premium notification dispatch", err);
  }

  for (const notif of pendingNotifs) {
    // Mark as notified
    notif.is_notified = true;
    notif.notified_at = nowStr;

    // Create a beautifully formatted simulated email log
    const newLog: EmailLog = {
      id: `email-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      recipient_email: notif.email,
      subject: `✨ Back in Stock: ${product.name} is Restocked at ${shopName}!`,
      body: `Dear Customer,

Great news! The jewelry piece you requested a back-in-stock notification for is now available again at ${shopName}.

Below are the complete authentic product specifications, pricing estimates, and live inventory levels for your review.

========================================================================
🌟 RESTOCKED PRODUCT DOSSIER & SPECIFICATIONS 🌟
========================================================================

💎 PRODUCT IDENTIFICATION & CATEGORY:
------------------------------------------------------------------------
• Item Name:       ${product.name}
• SKU Identifier:  ${product.SKU}
• Main Category:   ${product.main_category} (${product.product_type})
• Target Segment:  ${product.gender_tag} Wear

📐 MATERIAL METRICS & PURITY:
------------------------------------------------------------------------
• Purity Standard: ${product.purity_type} (BIS Hallmark Standard Certified)
• Net Weight:      ${product.weight_grams.toFixed(2)} grams
• Making Charges:  ${product.making_charge_percent}% of gold/silver metal value

💰 LIVE SPOT PRICING ESTIMATE (Based on Daily Rate Settings):
------------------------------------------------------------------------
• Live Metal Rate: ${rawMetalRate > 0 ? `₹${rawMetalRate}/gram` : 'Subject to spot rates'}
• Estimated Value: ${estimatedPriceStr} (Metal weight value + making charges)
  *Note: Gold & silver spot rates fluctuate on daily intervals. The billing total will reflect the exact official rates at invoice checkout.*

📦 LIVE STOCK & INVENTORY DETAILS:
------------------------------------------------------------------------
• CURRENT STOCK STATUS: [ IN STOCK - READY TO DISPATCH ]
• TOTAL STOCK QUANTITY: ${product.stock_quantity ?? 1} item(s) available in display vault
  *Disclaimer: Exquisite signature jewelry pieces sell out fast. We highly advise contacting our desk immediately to book or secure this piece.*

🖼️ PRODUCT VISUALS & GALLERY:
------------------------------------------------------------------------
• Digital Catalog Image: ${product.image_urls?.[0] || 'Image uploaded in store catalog'}
${product.image_urls && product.image_urls.length > 1 ? `• Additional View Angles:\n${product.image_urls.slice(1).map((url, i) => `   - View ${i+2}: ${url}`).join('\n')}` : ''}

========================================================================
🛍️ HOW TO PURCHASE & CONTACT OPTIONS:
========================================================================
1. WhatsApp Priority Desk: Open your digital catalog in Sri Venkateswara Golden Jewellers (Nazeer Jewellers), tap on WhatsApp to chat with our staff, and refer to SKU ${product.SKU} for prompt reservation.
2. Store Visit: Walk into Sri Venkateswara Golden Jewellers (Nazeer Jewellers) with this email code to check weight certifications or handle booking.

Thank you for choosing us to decorate your auspicious moments!

Best regards,
Customer Experience Desk
${shopName}${gstinStr}`,
      sent_at: nowStr,
      product_id: product.id
    };

    emailLogs.push(newLog);

    // If real Supabase, update the row and insert the log
    if (isRealSupabaseConnected && supabase) {
      await supabase
        .from('stock_notifications')
        .update({ is_notified: true, notified_at: nowStr })
        .eq('id', notif.id);

      await supabase
        .from('email_logs')
        .insert([{
          id: newLog.id,
          recipient_email: newLog.recipient_email,
          subject: newLog.subject,
          body: newLog.body,
          product_id: newLog.product_id
        }]);
    }
  }

  // Update fallback localStorages
  try {
    localStorage.setItem('svj_stock_notifications', JSON.stringify(notifications));
  } catch (err) {
    console.warn("Failed to write svj_stock_notifications to localStorage", err);
  }

  // Prune email logs to prevent exceeding quota
  let prunedLogs = emailLogs;
  if (prunedLogs.length > 30) {
    prunedLogs = prunedLogs.slice(-30);
  }

  try {
    localStorage.setItem('svj_email_logs', JSON.stringify(prunedLogs));
  } catch (err) {
    console.warn("Failed to write email logs to localStorage, trying to prune more severely", err);
    try {
      localStorage.setItem('svj_email_logs', JSON.stringify(prunedLogs.slice(-10)));
    } catch (e2) {
      console.error("Critical: localStorage still full even with severe pruning", e2);
    }
  }
  triggerSimulationSync();
};

// --- Storage / Image Upload Mock ---
export const uploadImageFile = async (file: File): Promise<string> => {
  if (isRealSupabaseConnected && supabase) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('jewelry-assets')
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage
        .from('jewelry-assets')
        .getPublicUrl(filePath);
      return data.publicUrl;
    }
  }
  
  // Return an elegant Unsplash random fallback matching jewelry, or compile a beautiful data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

// ==========================================
// SQL SCRIPT FOR EASY REPLICATING IN SUPABASE
// ==========================================

export const SQL_SETUP_SCRIPT = `-- ========================================================
-- SRI VENKATESWARA JEWELLERS
-- DATABASE SETUP SCRIPT FOR SUPABASE SQL EDITOR
-- ========================================================

-- 1. Create custom store_settings config
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY,
  shop_name TEXT NOT NULL,
  logo_url TEXT,
  gold_22k_rate NUMERIC DEFAULT 7250,
  gold_24k_rate NUMERIC DEFAULT 7910,
  silver_normal_rate NUMERIC DEFAULT 92,
  silver_999_rate NUMERIC DEFAULT 105,
  dynamic_theme JSONB NOT NULL,
  admin_password TEXT NOT NULL DEFAULT 'Sanju@1234',
  gstin TEXT DEFAULT '37AAAAA1111A1Z1',
  address TEXT DEFAULT 'Ammavarisala St, Sainagar, Rajampet, Andhra Pradesh 516115',
  ad_active BOOLEAN DEFAULT TRUE,
  ad_media_type TEXT DEFAULT 'image',
  ad_media_url TEXT DEFAULT 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop',
  ad_title TEXT DEFAULT 'Unveiling: The Royal Nizam Antique Kundan Haram',
  ad_text TEXT DEFAULT 'Introducing our newly added 22K Royal Nizam Antique Kundan Haram. Handcrafted with traditional precision and authentic BIS Hallmarking. Explore the master craftsmanship now!',
  ad_product_id TEXT DEFAULT 'prod-1',
  shop_name_font TEXT DEFAULT 'serif',
  shop_name_italic BOOLEAN DEFAULT TRUE,
  shop_name_bold BOOLEAN DEFAULT FALSE,
  shop_name_spacing TEXT DEFAULT 'tight',
  flat_offer_active BOOLEAN DEFAULT FALSE,
  flat_offer_canceled_gold_22k NUMERIC DEFAULT 13800,
  flat_offer_exclusive_gold_22k NUMERIC DEFAULT 13200,
  flat_offer_canceled_gold_24k NUMERIC DEFAULT 15000,
  flat_offer_exclusive_gold_24k NUMERIC DEFAULT 14400,
  flat_offer_canceled_silver_999 NUMERIC DEFAULT 600,
  flat_offer_exclusive_silver_999 NUMERIC DEFAULT 550,
  flat_offer_canceled_silver_normal NUMERIC DEFAULT 250,
  flat_offer_exclusive_silver_normal NUMERIC DEFAULT 210,
  flat_offer_discount_amount NUMERIC DEFAULT 1000
);

-- 2. Create products list
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  SKU TEXT UNIQUE NOT NULL,
  main_category TEXT NOT NULL CHECK (main_category IN ('Gold', 'Silver')),
  purity_type TEXT NOT NULL CHECK (purity_type IN ('22K Gold', '24K Gold', 'Silver 92.5 Purity', 'Normal Silver')),
  gender_tag TEXT NOT NULL CHECK (gender_tag IN ('Men', 'Women', 'Unisex')),
  product_type TEXT NOT NULL,
  weight_grams NUMERIC NOT NULL,
  making_charge_percent NUMERIC NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  is_in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 5,
  offer_canceled_rate NUMERIC,
  offer_exclusive_rate NUMERIC,
  offer_discount_amount NUMERIC
);

-- 3. Create promotional_offers banner layout
CREATE TABLE IF NOT EXISTS promotional_offers (
  id TEXT PRIMARY KEY,
  offer_name TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  banner_image_url TEXT,
  banner_bg_color TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 4. Create active WhatsApp numbers
CREATE TABLE IF NOT EXISTS whatsapp_numbers (
  id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  reference_name TEXT NOT NULL
);

-- 5. Create active customer reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT NOT NULL,
  rating_stars INTEGER CHECK (rating_stars >= 1 AND rating_stars <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create client user profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  shipping_address TEXT,
  favorite_product_ids TEXT[] DEFAULT '{}'
);

-- 6b. Create stock notifications table
CREATE TABLE IF NOT EXISTS stock_notifications (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP WITH TIME ZONE
);

-- 6c. Create email logs table for sent items
CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Enable Realtime triggers safely on all tables if not already registered
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'store_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE store_settings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'products') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'promotional_offers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE promotional_offers;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_numbers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_numbers;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reviews') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'stock_notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE stock_notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'email_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE email_logs;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

-- 7b. Enable Row Level Security (RLS) and set up permissive policies on every
-- table used by the admin dashboard / storefront. This is the most common
-- cause of "Cannot coerce the result to a single JSON object": an INSERT or
-- UPDATE succeeds, but the immediate .select() re-fetch is blocked because
-- there's no SELECT policy (or RLS is on with zero policies), so 0 rows come
-- back and .single()/.maybeSingle() has nothing to return.
-- NOTE: these policies are fully open (USING (true)); tighten them once you
-- add real authentication/roles.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select of profiles to everyone" ON profiles;
DROP POLICY IF EXISTS "Allow insert of profiles to everyone" ON profiles;
DROP POLICY IF EXISTS "Allow update of profiles to everyone" ON profiles;
CREATE POLICY "Allow select of profiles to everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow insert of profiles to everyone" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update of profiles to everyone" ON profiles FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on store_settings" ON store_settings;
CREATE POLICY "Allow all on store_settings" ON store_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on products" ON products;
CREATE POLICY "Allow all on products" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on promotional_offers" ON promotional_offers;
CREATE POLICY "Allow all on promotional_offers" ON promotional_offers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on whatsapp_numbers" ON whatsapp_numbers;
CREATE POLICY "Allow all on whatsapp_numbers" ON whatsapp_numbers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on reviews" ON reviews;
CREATE POLICY "Allow all on reviews" ON reviews FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on stock_notifications" ON stock_notifications;
CREATE POLICY "Allow all on stock_notifications" ON stock_notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on email_logs" ON email_logs;
CREATE POLICY "Allow all on email_logs" ON email_logs FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed default configurations (Sri Venkateswara Jewellers)
INSERT INTO store_settings (id, shop_name, logo_url, gold_22k_rate, gold_24k_rate, silver_normal_rate, silver_999_rate, dynamic_theme, admin_password, gstin, address, ad_active, ad_media_type, ad_media_url, ad_title, ad_text, ad_product_id)
VALUES (
  'current-settings',
  'Sri Venkateswara Jewellers',
  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=200&auto=format&fit=crop',
  13294,
  14450,
  220,
  558,
  '{"primary": "#936C31", "secondary": "#1A1A1A", "headerBg": "#1A1A1A", "headerText": "#FCFAF7", "bg": "#FCFAF7", "cardBg": "#ffffff", "text": "#1A1A1A", "accent": "#D4AF37"}'::jsonb,
  'Sanju@1234',
  '37AAAAA1111A1Z1',
  'Ammavarisala St, Sainagar, Rajampet, Andhra Pradesh 516115',
  true,
  'image',
  'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop',
  'Unveiling: The Royal Nizam Antique Kundan Haram',
  'Introducing our newly added 22K Royal Nizam Antique Kundan Haram. Handcrafted with traditional precision and authentic BIS Hallmarking. Explore the master craftsmanship now!',
  'prod-1'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO promotional_offers (id, offer_name, detailed_description, ends_at, banner_image_url, banner_bg_color, is_active)
VALUES (
  'current-promo',
  'Sankranthi Gold Fest & Shubh Vivah Muhurtham Special',
  'Celebrate the holy wedding season with exclusive rate locks and a flat 4.5% making charges on premium Kundan Harams, Temple Bangles, and Ornate Waistbands.',
  NOW() + interval '5 days',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&auto=format&fit=crop',
  '#7c2d12',
  true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO whatsapp_numbers (id, phone_number, reference_name) VALUES
('wa-1', '+919876543210', 'Main Golden Showroom Desk'),
('wa-2', '+918765432109', 'Sanjeeva Reddy (Senior Valuer)')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, username, email, phone_number, shipping_address) VALUES
('p-1', 'Sanjeeva Reddy', 'lakkireddysanjeevareddy8@gmail.com', '+919900887766', 'Ammavarisala St, Sainagar, Rajampet, Andhra Pradesh 516115'),
('p-2', 'SVJ Rajampet', 'svj.rajampet@gmail.com', '8500226521', 'Rajampet, Andhra Pradesh - 516115'),
('p-3', 'Bharath', 'kothurubharath@gmail.com', '8500226521', 'Andhra Pradesh')
ON CONFLICT (id) DO NOTHING;
`;
