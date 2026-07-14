export type MainCategory = 'Gold' | 'Silver';

export type PurityType = '22K Gold' | '24K Gold' | 'Normal Silver' | 'Silver 92.5 Purity';

export type GenderTag = 'Men' | 'Women' | 'Unisex';

export type ProductType = string;

export interface DynamicTheme {
  primary: string;
  secondary: string;
  headerBg: string;
  headerText: string;
  bg: string;
  cardBg: string;
  text: string;
  accent: string;
  collection_title?: string;
  collection_subtitle?: string;
  footer_text?: string;
  footer_copyright?: string;
}

export interface StoreSettings {
  id?: string;
  shop_name: string;
  logo_url: string;
  gold_22k_rate: number;
  gold_24k_rate: number;
  silver_normal_rate: number;
  silver_999_rate: number;
  dynamic_theme: DynamicTheme;
  admin_password?: string;
  gstin?: string;
  address?: string;
  shop_phone?: string;
  ad_active?: boolean;
  ad_media_type?: 'image' | 'video';
  ad_media_url?: string;
  ad_title?: string;
  ad_text?: string;
  ad_product_id?: string;
  
  // Custom shop name typography features
  shop_name_font?: string; // 'serif' | 'sans' | 'cinzel' | 'cormorant' | 'greatvibes' | 'montserrat' | 'prata' | 'sacramento'
  shop_name_italic?: boolean;
  shop_name_bold?: boolean;
  shop_name_spacing?: 'tight' | 'normal' | 'wide' | 'widest';
  
  // Flat promotional offer settings
  flat_offer_active?: boolean;
  flat_offer_canceled_gold_22k?: number;
  flat_offer_exclusive_gold_22k?: number;
  flat_offer_canceled_gold_24k?: number;
  flat_offer_exclusive_gold_24k?: number;
  flat_offer_canceled_silver_999?: number;
  flat_offer_exclusive_silver_999?: number;
  flat_offer_canceled_silver_normal?: number;
  flat_offer_exclusive_silver_normal?: number;
  flat_offer_discount_amount?: number;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  shipping_address?: string;
  password?: string;
  favorite_product_ids?: string[];
}

export interface Product {
  id: string;
  name: string;
  SKU: string;
  main_category: MainCategory;
  purity_type: PurityType;
  gender_tag: GenderTag;
  product_type: ProductType;
  weight_grams: number;
  making_charge_percent: number;
  image_urls: string[];
  is_in_stock: boolean;
  stock_quantity: number;
  offer_canceled_rate?: number;
  offer_exclusive_rate?: number;
  offer_discount_amount?: number;
  has_stone?: boolean;
  stone_weight_grams?: number;
  metal_weight_grams?: number;
  stone_price?: number;
}

export interface WhatsAppNumber {
  id: string;
  phone_number: string;
  reference_name: string;
}

export interface PromotionalOffer {
  id?: string;
  offer_name: string;
  detailed_description: string;
  ends_at: string;
  banner_image_url: string;
  banner_bg_color: string;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating_stars: number;
  review_text: string;
  created_at: string;
}

export interface StockNotification {
  id: string;
  product_id: string;
  email: string;
  created_at: string;
  is_notified: boolean;
  notified_at?: string;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject: string;
  body: string;
  sent_at: string;
  product_id: string;
}

