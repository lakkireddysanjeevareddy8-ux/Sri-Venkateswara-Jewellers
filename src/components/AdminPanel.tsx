import React, { useState, useEffect } from 'react';
import { StoreSettings, Product, WhatsAppNumber, PromotionalOffer, MainCategory, PurityType, GenderTag, ProductType, StockNotification, EmailLog } from '../types';
import {
    updateStoreSettings,
    createProduct,
    updateProduct,
    deleteProduct,
    addWhatsAppNumber,
    deleteWhatsAppNumber,
    updatePromoOffer,
    uploadImageFile,
    SQL_SETUP_SCRIPT,
    getStockNotifications,
    getEmailLogs
} from '../lib/supabase';
import {
    Coins, Palette, Share2, Plus, Trash2, Tag, Upload,
    Sparkles, Megaphone, ShieldAlert, Key, Clipboard, CheckCircle,
    ArrowLeft, FileText, Settings, RefreshCw, Layers, Sliders, Image as ImageIcon,
    Edit, X, AlertTriangle, Mail, Bell, Clock, Eye, EyeOff
} from 'lucide-react';

interface AdminPanelProps {
    settings: StoreSettings;
    products: Product[];
    whatsAppNumbers: WhatsAppNumber[];
    promoOffer: PromotionalOffer;
    onRefresh: () => void;
    onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
    settings,
    products,
    whatsAppNumbers,
    promoOffer,
    onRefresh,
    onClose,
}) => {
    // Navigation Tabs
    const [activeTab, setActiveTab] = useState<'rates' | 'theme' | 'whatsapp' | 'inventory' | 'promo' | 'db_setup' | 'notifications'>('rates');

    // Custom luxury alert modal state
    const [luxuryAlert, setLuxuryAlert] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
    } | null>(null);

    // Redefine alert to intercept all native browser alerts in the scope
    const alert = (msg: string) => {
        const isError = msg.toLowerCase().includes('failed') || 
                        msg.toLowerCase().includes('error') || 
                        msg.toLowerCase().includes('could not');
        setLuxuryAlert({
            message: msg,
            type: isError ? 'error' : 'success'
        });
    };

    // Notifications State
    const [notifications, setNotifications] = useState<StockNotification[]>([]);
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
    const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);

    // Rate & Branding State
    const [shopName, setShopName] = useState(settings.shop_name);
    const [logoUrl, setLogoUrl] = useState(settings.logo_url);
    const [gstin, setGstin] = useState(settings.gstin || '');
    const [address, setAddress] = useState(settings.address || '');
    const [gold22k, setGold22k] = useState(settings.gold_22k_rate);
    const [gold24k, setGold24k] = useState(settings.gold_24k_rate);
    const [silverNormal, setSilverNormal] = useState(settings.silver_normal_rate);
    const [silver999, setSilver999] = useState(settings.silver_999_rate);
    const [isSavingRates, setIsSavingRates] = useState(false);
    const [isSavingAd, setIsSavingAd] = useState(false);

    // Featured Spot Advertising Section State
    const [adActive, setAdActive] = useState(settings.ad_active ?? true);
    const [adMediaType, setAdMediaType] = useState<'image' | 'video'>(settings.ad_media_type ?? 'image');
    const [adMediaUrl, setAdMediaUrl] = useState(settings.ad_media_url || '');
    const [adTitle, setAdTitle] = useState(settings.ad_title || '');
    const [adText, setAdText] = useState(settings.ad_text || '');
    const [adProductId, setAdProductId] = useState(settings.ad_product_id || '');
    const [isUploadingAdMedia, setIsUploadingAdMedia] = useState(false);
    const [adUploadStatus, setAdUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'failed'>(
        settings.ad_media_url ? 'completed' : 'idle'
    );
    const [showCancelAdConfirm, setShowCancelAdConfirm] = useState(false);

    // Theme Builder State
    const [theme, setTheme] = useState(settings.dynamic_theme);
    const [collectionTitle, setCollectionTitle] = useState(settings.dynamic_theme.collection_title || 'Our Collection');
    const [collectionSubtitle, setCollectionSubtitle] = useState(settings.dynamic_theme.collection_subtitle || 'Curated masterpieces in gold and silver — every piece crafted with devotion and precision.');
    const [footerText, setFooterText] = useState(settings.dynamic_theme.footer_text || '100% certified 916 hallmark standard jewels. pre-booking registered online.');
    const [footerCopyright, setFooterCopyright] = useState(settings.dynamic_theme.footer_copyright || `© 2026 ${settings.shop_name}.`);
    const [isSavingTheme, setIsSavingTheme] = useState(false);

    // Shop Name Typography Customization
    const [shopNameFont, setShopNameFont] = useState(settings.shop_name_font || 'serif');
    const [shopNameItalic, setShopNameItalic] = useState(settings.shop_name_italic !== false);
    const [shopNameBold, setShopNameBold] = useState(!!settings.shop_name_bold);
    const [shopNameSpacing, setShopNameSpacing] = useState(settings.shop_name_spacing || 'tight');

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');

    // WhatsApp configuration State
    const [newWaNumber, setNewWaNumber] = useState('');
    const [newWaName, setNewWaName] = useState('');
    const [isAddingWa, setIsAddingWa] = useState(false);

    // Flat Promotional Offer State
    const [flatOfferActive, setFlatOfferActive] = useState(settings.flat_offer_active ?? false);
    const [flatOfferCanceled22k, setFlatOfferCanceled22k] = useState(settings.flat_offer_canceled_gold_22k ?? 13800);
    const [flatOfferExclusive22k, setFlatOfferExclusive22k] = useState(settings.flat_offer_exclusive_gold_22k ?? 13200);
    const [flatOfferCanceled24k, setFlatOfferCanceled24k] = useState(settings.flat_offer_canceled_gold_24k ?? 15000);
    const [flatOfferExclusive24k, setFlatOfferExclusive24k] = useState(settings.flat_offer_exclusive_gold_24k ?? 14400);
    const [flatOfferCanceledSilver999, setFlatOfferCanceledSilver999] = useState(settings.flat_offer_canceled_silver_999 ?? 600);
    const [flatOfferExclusiveSilver999, setFlatOfferExclusiveSilver999] = useState(settings.flat_offer_exclusive_silver_999 ?? 550);
    const [flatOfferCanceledSilverNormal, setFlatOfferCanceledSilverNormal] = useState(settings.flat_offer_canceled_silver_normal ?? 250);
    const [flatOfferExclusiveSilverNormal, setFlatOfferExclusiveSilverNormal] = useState(settings.flat_offer_exclusive_silver_normal ?? 210);
    const [flatOfferDiscountAmount, setFlatOfferDiscountAmount] = useState(settings.flat_offer_discount_amount ?? 1000);
    const [isSavingFlatOffer, setIsSavingFlatOffer] = useState(false);

    // Promotional Banner State
    const [promoName, setPromoName] = useState(promoOffer.offer_name);
    const [promoDesc, setPromoDesc] = useState(promoOffer.detailed_description);
    const [promoEnds, setPromoEnds] = useState(promoOffer.ends_at.slice(0, 16)); // Format for input datetime-local
    const [promoImg, setPromoImg] = useState(promoOffer.banner_image_url);
    const [promoBg, setPromoBg] = useState(promoOffer.banner_bg_color);
    const [promoActive, setPromoActive] = useState(promoOffer.is_active);
    const [isSavingPromo, setIsSavingPromo] = useState(false);
    const [isUploadingPromoImg, setIsUploadingPromoImg] = useState(false);
    const [showPromoGallery, setShowPromoGallery] = useState(false);
    const [promoDragActive, setPromoDragActive] = useState(false);

    // Product Inventory Form State
    const [prodName, setProdName] = useState('');
    const [prodSKU, setProdSKU] = useState('');
    const [prodMainCat, setProdMainCat] = useState<MainCategory>('Gold');
    const [prodPurity, setProdPurity] = useState<PurityType>('22K Gold');
    const [prodGender, setProdGender] = useState<GenderTag>('Women');
    const [prodType, setProdType] = useState<ProductType>('Chains');
    const [prodWeight, setProdWeight] = useState<number>(0);
    const [prodHasStone, setProdHasStone] = useState<boolean>(false);
    const [prodStoneWeight, setProdStoneWeight] = useState<number | ''>('');
    const [prodMetalWeight, setProdMetalWeight] = useState<number | ''>('');
    const [prodStonePrice, setProdStonePrice] = useState<number | ''>('');
    const [prodMakingCharge, setProdMakingCharge] = useState<number>(0);
    const [prodImageUrls, setProdImageUrls] = useState<string[]>([]);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [prodInStock, setProdInStock] = useState(true);
    const [prodStockQuantity, setProdStockQuantity] = useState<number>(5);
    const [prodCanceledRate, setProdCanceledRate] = useState<number | ''>('');
    const [prodExclusiveRate, setProdExclusiveRate] = useState<number | ''>('');
    const [prodDiscountAmount, setProdDiscountAmount] = useState<number | ''>('');
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(false);

    // SQL Copy Notice state
    const [copiedSql, setCopiedSql] = useState(false);

    // Logo uploading states
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [logoDragActive, setLogoDragActive] = useState(false);

    // Editing Product state
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Search state in the admin product list management
    const [adminProductSearch, setAdminProductSearch] = useState('');

    useEffect(() => {
        if (settings) {
            setShopName(settings.shop_name);
            setLogoUrl(settings.logo_url);
            setGstin(settings.gstin || '');
            setAddress(settings.address || '');
            setGold22k(settings.gold_22k_rate);
            setGold24k(settings.gold_24k_rate);
            setSilverNormal(settings.silver_normal_rate);
            setSilver999(settings.silver_999_rate);
            setTheme(settings.dynamic_theme);
            setCollectionTitle(settings.dynamic_theme.collection_title || 'Our Collection');
            setCollectionSubtitle(settings.dynamic_theme.collection_subtitle || 'Curated masterpieces in gold and silver — every piece crafted with devotion and precision.');
            setFooterText(settings.dynamic_theme.footer_text || '100% certified 916 hallmark standard jewels. pre-booking registered online.');
            setFooterCopyright(settings.dynamic_theme.footer_copyright || `© 2026 ${settings.shop_name}.`);
            setAdActive(settings.ad_active ?? true);
            setAdMediaType(settings.ad_media_type ?? 'image');
            setAdMediaUrl(settings.ad_media_url || '');
            setAdTitle(settings.ad_title || '');
            setAdText(settings.ad_text || '');
            setAdProductId(settings.ad_product_id || '');

            setShopNameFont(settings.shop_name_font || 'serif');
            setShopNameItalic(settings.shop_name_italic !== false);
            setShopNameBold(!!settings.shop_name_bold);
            setShopNameSpacing(settings.shop_name_spacing || 'tight');

            setFlatOfferActive(settings.flat_offer_active ?? false);
            setFlatOfferCanceled22k(settings.flat_offer_canceled_gold_22k ?? 13800);
            setFlatOfferExclusive22k(settings.flat_offer_exclusive_gold_22k ?? 13200);
            setFlatOfferCanceled24k(settings.flat_offer_canceled_gold_24k ?? 15000);
            setFlatOfferExclusive24k(settings.flat_offer_exclusive_gold_24k ?? 14400);
            setFlatOfferCanceledSilver999(settings.flat_offer_canceled_silver_999 ?? 600);
            setFlatOfferExclusiveSilver999(settings.flat_offer_exclusive_silver_999 ?? 550);
            setFlatOfferCanceledSilverNormal(settings.flat_offer_canceled_silver_normal ?? 250);
            setFlatOfferExclusiveSilverNormal(settings.flat_offer_exclusive_silver_normal ?? 210);
            setFlatOfferDiscountAmount(settings.flat_offer_discount_amount ?? 1000);
        }
    }, [settings]);

    useEffect(() => {
        if (promoOffer) {
            setPromoName(promoOffer.offer_name || '');
            setPromoDesc(promoOffer.detailed_description || '');
            setPromoEnds(promoOffer.ends_at ? promoOffer.ends_at.slice(0, 16) : '');
            setPromoImg(promoOffer.banner_image_url || '');
            setPromoBg(promoOffer.banner_bg_color || '#936C31');
            setPromoActive(promoOffer.is_active);
        }
    }, [promoOffer]);

    const fetchNotificationsAndLogs = async () => {
        setIsLoadingNotifs(true);
        try {
            const [notifs, logs] = await Promise.all([
                getStockNotifications(),
                getEmailLogs()
            ]);
            setNotifications(notifs);
            setEmailLogs(logs);
        } catch (err) {
            console.error('Failed to load notifications or email logs:', err);
        } finally {
            setIsLoadingNotifs(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'notifications') {
            fetchNotificationsAndLogs();
        }
    }, [activeTab, products]);

    useEffect(() => {
        if (prodMainCat === 'Gold' && !['22K Gold', '24K Gold'].includes(prodPurity)) {
            setProdPurity('22K Gold');
        } else if (prodMainCat === 'Silver' && !['Silver 92.5 Purity', 'Normal Silver'].includes(prodPurity)) {
            setProdPurity('Silver 92.5 Purity');
        }
    }, [prodMainCat, prodPurity]);

    const startEditingProduct = (product: Product) => {
        setEditingProduct(product);
        setProdName(product.name);
        setProdSKU(product.SKU);
        setProdMainCat(product.main_category);
        setProdPurity(product.purity_type);
        setProdGender(product.gender_tag);
        setProdType(product.product_type);
        setProdWeight(product.weight_grams);
        setProdHasStone(product.has_stone ?? false);
        setProdStoneWeight(product.stone_weight_grams !== undefined && product.stone_weight_grams !== null ? product.stone_weight_grams : '');
        setProdMetalWeight(product.metal_weight_grams !== undefined && product.metal_weight_grams !== null ? product.metal_weight_grams : '');
        setProdStonePrice(product.stone_price !== undefined && product.stone_price !== null ? product.stone_price : '');
        setProdMakingCharge(product.making_charge_percent);
        setProdImageUrls(product.image_urls);
        setProdInStock(product.is_in_stock);
        setProdStockQuantity(product.stock_quantity ?? 5);
        setProdCanceledRate(product.offer_canceled_rate !== undefined && product.offer_canceled_rate !== null ? product.offer_canceled_rate : '');
        setProdExclusiveRate(product.offer_exclusive_rate !== undefined && product.offer_exclusive_rate !== null ? product.offer_exclusive_rate : '');
        setProdDiscountAmount(product.offer_discount_amount !== undefined && product.offer_discount_amount !== null ? product.offer_discount_amount : '');

        // Scroll smoothly to the inventory form
        const container = document.getElementById('inventory-form-container');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const cancelEditingProduct = () => {
        setEditingProduct(null);
        setProdName('');
        setProdSKU('');
        setProdMainCat('Gold');
        setProdPurity('22K Gold');
        setProdGender('Women');
        setProdType('Chains');
        setProdWeight(0);
        setProdHasStone(false);
        setProdStoneWeight('');
        setProdMetalWeight('');
        setProdStonePrice('');
        setProdMakingCharge(0);
        setProdImageUrls([]);
        setProdInStock(true);
        setProdStockQuantity(5);
        setProdCanceledRate('');
        setProdExclusiveRate('');
        setProdDiscountAmount('');
    };

    // --- Handlers ---

    // Logo upload handlers
    const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingLogo(true);
        try {
            const url = await uploadImageFile(file);
            setLogoUrl(url);
        } catch (err) {
            alert('Error during logo asset upload process');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleLogoDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setLogoDragActive(true);
    };

    const handleLogoDragLeave = () => {
        setLogoDragActive(false);
    };

    const handleLogoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setLogoDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setIsUploadingLogo(true);
        try {
            const url = await uploadImageFile(file);
            setLogoUrl(url);
        } catch (err) {
            alert('Error during logo drop upload process');
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleAdMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Auto detect video vs image
        if (file.type.startsWith('video/')) {
            setAdMediaType('video');
        } else {
            setAdMediaType('image');
        }

        setIsUploadingAdMedia(true);
        setAdUploadStatus('uploading');
        try {
            const url = await uploadImageFile(file);
            setAdMediaUrl(url);
            setAdActive(true);
            setAdUploadStatus('completed');
        } catch (err) {
            setAdUploadStatus('failed');
            alert('Error during ad spotlight media upload');
        } finally {
            setIsUploadingAdMedia(false);
        }
    };

    const handlePromoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingPromoImg(true);
        try {
            const url = await uploadImageFile(file);
            setPromoImg(url);
        } catch (err) {
            alert('Error during promotional banner image upload');
        } finally {
            setIsUploadingPromoImg(false);
        }
    };

    const handlePromoDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setPromoDragActive(true);
    };

    const handlePromoDragLeave = () => {
        setPromoDragActive(false);
    };

    const handlePromoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setPromoDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setIsUploadingPromoImg(true);
        try {
            const url = await uploadImageFile(file);
            setPromoImg(url);
        } catch (err) {
            alert('Error during promotional banner drag-drop upload');
        } finally {
            setIsUploadingPromoImg(false);
        }
    };

    const handleCancelAd = async () => {
        setIsSavingRates(true);
        setShowCancelAdConfirm(false);
        try {
            await updateStoreSettings({
                ...settings,
                gold_22k_rate: Number(gold22k),
                gold_24k_rate: Number(gold24k),
                silver_normal_rate: Number(silverNormal),
                silver_999_rate: Number(silver999),
                ad_active: false,
                ad_media_type: 'image',
                ad_media_url: '',
                ad_title: '',
                ad_text: '',
                ad_product_id: '',
            });
            setAdActive(false);
            setAdMediaType('image');
            setAdTitle('');
            setAdText('');
            setAdMediaUrl('');
            setAdProductId('');
            setAdUploadStatus('idle');
            onRefresh();
            alert('Spotlight advertisement successfully cancelled, deactivated, and removed!');
        } catch (err) {
            alert('Failed to save the cancelled advertisement settings');
        } finally {
            setIsSavingRates(false);
        }
    };

    // Save Daily Metal Price rates
    const handleSaveRatesOnly = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingRates(true);
        try {
            await updateStoreSettings({
                ...settings,
                gold_22k_rate: Number(gold22k),
                gold_24k_rate: Number(gold24k),
                silver_normal_rate: Number(silverNormal),
                silver_999_rate: Number(silver999),
            });
            onRefresh();
            alert('Daily Metal Price rates successfully updated and synchronized!');
        } catch (err) {
            alert('Failed to update daily rates settings');
        } finally {
            setIsSavingRates(false);
        }
    };

    // Save Flat Promotional Offer settings
    const handleSaveFlatOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingFlatOffer(true);
        try {
            await updateStoreSettings({
                ...settings,
                flat_offer_active: flatOfferActive,
                flat_offer_canceled_gold_22k: Number(flatOfferCanceled22k),
                flat_offer_exclusive_gold_22k: Number(flatOfferExclusive22k),
                flat_offer_canceled_gold_24k: Number(flatOfferCanceled24k),
                flat_offer_exclusive_gold_24k: Number(flatOfferExclusive24k),
                flat_offer_canceled_silver_999: Number(flatOfferCanceledSilver999),
                flat_offer_exclusive_silver_999: Number(flatOfferExclusiveSilver999),
                flat_offer_canceled_silver_normal: Number(flatOfferCanceledSilverNormal),
                flat_offer_exclusive_silver_normal: Number(flatOfferExclusiveSilverNormal),
                flat_offer_discount_amount: Number(flatOfferDiscountAmount)
            });
            onRefresh();
            alert('Flat Promotional Offer settings successfully updated and synchronized!');
        } catch (err) {
            alert('Failed to update Flat Promotional Offer settings');
        } finally {
            setIsSavingFlatOffer(false);
        }
    };

    // Save Spotlight Advertisement only
    const handleSaveAdOnly = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingAd(true);
        try {
            await updateStoreSettings({
                ...settings,
                ad_active: adActive,
                ad_media_type: adMediaType,
                ad_media_url: adMediaUrl,
                ad_title: adTitle,
                ad_text: adText,
                ad_product_id: adProductId,
            });
            onRefresh();
            alert('Daily Spotlight advertisement successfully updated and published!');
        } catch (err) {
            alert('Failed to update spotlight advertisement settings');
        } finally {
            setIsSavingAd(false);
        }
    };



    // Save custom theme and branding configurations
    const handleSaveTheme = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingTheme(true);
        try {
            await updateStoreSettings({
                ...settings,
                shop_name: shopName,
                logo_url: logoUrl,
                gstin: gstin,
                address: address,
                shop_name_font: shopNameFont,
                shop_name_italic: shopNameItalic,
                shop_name_bold: shopNameBold,
                shop_name_spacing: shopNameSpacing,
                dynamic_theme: {
                    ...theme,
                    collection_title: collectionTitle,
                    collection_subtitle: collectionSubtitle,
                    footer_text: footerText,
                    footer_copyright: footerCopyright,
                },
            });
            onRefresh();
            alert('Brand Identity, GSTIN, Address, and Visual Theme successfully updated and configured!');
        } catch (err) {
            alert('Failed to update active layout theme and brand settings');
        } finally {
            setIsSavingTheme(false);
        }
    };

    // Update Administrative password
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassError('');
        setPassSuccess('');

        const currentPassFromSettings = settings.admin_password || 'Sanju@1234';

        if (currentPassword !== currentPassFromSettings && currentPassword !== 'Sanju@1234') {
            setPassError('The current passkey entered does not verify against database records.');
            return;
        }
        if (newPassword.length < 6) {
            setPassError('The replacement passkey must be at least 6 characters in length.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPassError('The confirmed passkey does not match.');
            return;
        }

        setIsSavingPassword(true);
        try {
            await updateStoreSettings({
                ...settings,
                admin_password: newPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPassSuccess('Passkey successfully verified and updated!');
            alert('Administrative credentials verified and successfully updated!');
            onRefresh();
        } catch (err) {
            setPassError('Failed to save replacement security credentials.');
        } finally {
            setIsSavingPassword(false);
        }
    };

    // WhatsApp numbers manager
    const handleAddWaNumber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWaNumber.trim() || !newWaName.trim()) return;
        setIsAddingWa(true);
        try {
            await addWhatsAppNumber({
                phone_number: newWaNumber.trim(),
                reference_name: newWaName.trim(),
            });
            setNewWaNumber('');
            setNewWaName('');
            onRefresh();
            alert('WhatsApp Representative channel successfully added!');
        } catch (err) {
            alert('Error writing WhatsApp number');
        } finally {
            setIsAddingWa(false);
        }
    };

    const handleDeleteWaNumber = async (id: string) => {
        try {
            await deleteWhatsAppNumber(id);
            onRefresh();
            alert('WhatsApp Representative channel successfully deleted!');
        } catch (err) {
            console.error('Failed to delete WhatsApp number:', err);
            alert('Failed to delete WhatsApp number');
        }
    };

    // Promo offer modifications
    const handleSavePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPromo(true);
        try {
            await updatePromoOffer({
                ...promoOffer,
                offer_name: promoName,
                detailed_description: promoDesc,
                ends_at: new Date(promoEnds).toISOString(),
                banner_image_url: promoImg,
                banner_bg_color: promoBg,
                is_active: promoActive,
            });
            onRefresh();
            alert('Active promotional layout banner successfully updated and published!');
        } catch (err) {
            alert('Failed to update promotion details');
        } finally {
            setIsSavingPromo(false);
        }
    };

    const handleRemovePromo = async () => {
        setIsSavingPromo(true);
        try {
            await updatePromoOffer({
                ...promoOffer,
                offer_name: '',
                detailed_description: '',
                ends_at: new Date().toISOString(),
                banner_image_url: '',
                banner_bg_color: '#936C31',
                is_active: false,
            });
            setPromoName('');
            setPromoDesc('');
            setPromoEnds(new Date().toISOString().slice(0, 16));
            setPromoImg('');
            setPromoBg('#936C31');
            setPromoActive(false);
            onRefresh();
            alert('Promotional offer campaign successfully deactivated and removed!');
        } catch (err) {
            alert('Failed to remove promotional offer campaign');
        } finally {
            setIsSavingPromo(false);
        }
    };

    // Image Upload Desk
    const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadProgress(true);
        try {
            const url = await uploadImageFile(file);
            setProdImageUrls([...prodImageUrls, url]);
        } catch (err) {
            alert('Error during asset upload process');
        } finally {
            setUploadProgress(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setUploadProgress(true);
        try {
            const url = await uploadImageFile(file);
            setProdImageUrls([...prodImageUrls, url]);
        } catch (err) {
            alert('Error during drag-drop asset upload process');
        } finally {
            setUploadProgress(false);
        }
    };

    // Product CRUD
    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsCreatingProduct(true);
        try {
            const finalName = prodName.trim();
            if (!finalName) {
                alert('Please fill out the Product Name.');
                setIsCreatingProduct(false);
                return;
            }

            // Auto-generate a beautiful unique SKU if left empty
            const finalSKU = prodSKU.trim()
                ? prodSKU.trim().toUpperCase()
                : `SVJ-${prodMainCat === 'Gold' ? 'G' : 'S'}-${Date.now().toString().slice(-6)}`;

            // Default to 10 grams if weight is not filled or invalid
            const finalWeight = prodWeight > 0 ? Number(prodWeight) : 10.000;

            // Premium fallback showcase images if none uploaded/pasted
            const fallbackImage = prodMainCat === 'Gold'
                ? 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';
            const finalImageUrls = prodImageUrls.length > 0 ? prodImageUrls : [fallbackImage];

            if (editingProduct) {
                // Update product flow
                await updateProduct({
                    ...editingProduct,
                    name: finalName,
                    SKU: finalSKU,
                    main_category: prodMainCat,
                    purity_type: prodPurity,
                    gender_tag: prodGender,
                    product_type: prodType,
                    weight_grams: finalWeight,
                    making_charge_percent: Number(prodMakingCharge),
                    image_urls: finalImageUrls,
                    is_in_stock: prodInStock,
                    stock_quantity: Number(prodStockQuantity),
                    offer_canceled_rate: prodCanceledRate !== '' ? Number(prodCanceledRate) : undefined,
                    offer_exclusive_rate: prodExclusiveRate !== '' ? Number(prodExclusiveRate) : undefined,
                    offer_discount_amount: prodDiscountAmount !== '' ? Number(prodDiscountAmount) : undefined,
                    has_stone: prodHasStone,
                    stone_weight_grams: prodStoneWeight !== '' ? Number(prodStoneWeight) : undefined,
                    metal_weight_grams: prodMetalWeight !== '' ? Number(prodMetalWeight) : undefined,
                    stone_price: prodStonePrice !== '' ? Number(prodStonePrice) : undefined,
                });
                setEditingProduct(null);
                alert('Jewelry item successfully updated on the live database!');
            } else {
                // Create product flow
                await createProduct({
                    name: finalName,
                    SKU: finalSKU,
                    main_category: prodMainCat,
                    purity_type: prodPurity,
                    gender_tag: prodGender,
                    product_type: prodType,
                    weight_grams: finalWeight,
                    making_charge_percent: Number(prodMakingCharge),
                    image_urls: finalImageUrls,
                    is_in_stock: prodInStock,
                    stock_quantity: Number(prodStockQuantity),
                    offer_canceled_rate: prodCanceledRate !== '' ? Number(prodCanceledRate) : undefined,
                    offer_exclusive_rate: prodExclusiveRate !== '' ? Number(prodExclusiveRate) : undefined,
                    offer_discount_amount: prodDiscountAmount !== '' ? Number(prodDiscountAmount) : undefined,
                    has_stone: prodHasStone,
                    stone_weight_grams: prodStoneWeight !== '' ? Number(prodStoneWeight) : undefined,
                    metal_weight_grams: prodMetalWeight !== '' ? Number(prodMetalWeight) : undefined,
                    stone_price: prodStonePrice !== '' ? Number(prodStonePrice) : undefined,
                });
                alert('Product successfully added and registered in inventory!');
            }

            // Reset form
            setProdName('');
            setProdSKU('');
            setProdWeight(0);
            setProdHasStone(false);
            setProdStoneWeight('');
            setProdMetalWeight('');
            setProdStonePrice('');
            setProdMakingCharge(0);
            setProdImageUrls([]);
            setProdInStock(true);
            setProdStockQuantity(5);
            setProdCanceledRate('');
            setProdExclusiveRate('');
            setProdDiscountAmount('');
            onRefresh();
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : JSON.stringify(err);
            alert(`Could not save product: ${msg}`);
        } finally {
            setIsCreatingProduct(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        try {
            await deleteProduct(id);
            onRefresh();
            alert('Product successfully deleted and removed from inventory!');
        } catch (err) {
            console.error('Failed to delete product:', err);
            alert('Failed to delete product');
        }
    };

    const handleToggleStockStatus = async (product: Product) => {
        let nextInStock = product.is_in_stock;
        let nextQuantity = product.stock_quantity ?? 0;

        if (product.is_in_stock) {
            const isCurrentlyLowStock = nextQuantity < 3;
            if (isCurrentlyLowStock) {
                // State: Low Stock -> Transition to Out of Stock
                nextInStock = false;
                nextQuantity = 0;
            } else {
                // State: In Stock -> Transition to Low Stock (1 left)
                nextInStock = true;
                nextQuantity = 1;
            }
        } else {
            // State: Out of Stock -> Transition to In Stock (5 left)
            nextInStock = true;
            nextQuantity = 5;
        }

        try {
            await updateProduct({
                ...product,
                is_in_stock: nextInStock,
                stock_quantity: nextQuantity,
            }); onRefresh();
            alert('Product stock status successfully updated!');
        } catch (err) {
            console.error('Failed to toggle stock status:', err);
            alert('Failed to update stock status');
        }
    };

    // Copy SQL script to clipboard
    const handleCopySql = () => {
        navigator.clipboard.writeText(SQL_SETUP_SCRIPT);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
    };

    const primaryColor = settings.dynamic_theme.primary;

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col">
            {/* Admin header rail */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-900 text-white">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2 bg-amber-500 text-stone-950">
                        <Settings className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-serif text-lg font-bold tracking-wide">
                            Vault Workspace Suite
                        </h1>
                        <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest">
                            Sri Venkateswara Golden Jewellers
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="rounded-full p-2 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                        title="Reload database tables"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 rounded-xl border border-stone-700 hover:border-amber-500 bg-stone-800 hover:bg-stone-900 px-4 py-2 text-xs font-bold transition-all text-amber-300 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Showroom
                    </button>
                </div>
            </header>

            {/* Main split dashboard layout */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* SIDEBAR NAVIGATION TAB SWITCHER */}
                <aside className="w-full md:w-64 bg-white border-r border-stone-200 p-4 space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono font-bold px-3 py-2">
                        Operations Menu
                    </p>
                    <button
                        onClick={() => setActiveTab('rates')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'rates' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <Coins className="h-4 w-4" /> Daily Metal Spot Rates
                    </button>

                    <button
                        onClick={() => setActiveTab('theme')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'theme' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <Palette className="h-4 w-4" /> Theme Branding Workspace
                    </button>

                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'whatsapp' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <Share2 className="h-4 w-4" /> WhatsApp Communication Paths
                    </button>

                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'inventory' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <Layers className="h-4 w-4" /> Products Details Section
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'notifications' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <Bell className="h-4 w-4" /> Back-In-Stock Alerts
                    </button>

                    <button
                        onClick={() => setActiveTab('promo')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'promo' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <Megaphone className="h-4 w-4" /> Promo Hero Blocks
                    </button>

                    <div className="border-t border-stone-150 my-3 pt-2" />
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono font-bold px-3 py-2">
                        Developer Setup
                    </p>

                    <button
                        onClick={() => setActiveTab('db_setup')}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'db_setup' ? 'bg-amber-500/10 text-amber-900' : 'text-stone-600 hover:bg-stone-50'
                            }`}
                    >
                        <FileText className="h-4 w-4" /> PostgreSQL SQL Setup
                    </button>
                </aside>

                {/* WORKSPACE CONTENT FIELD */}
                <main className="flex-1 p-6 md:p-8 max-w-6xl">
                    {/* TAB 1: DAILY RATES AND BRANDING CONFIG */}
                    {activeTab === 'rates' && (
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm">
                                <h3 className="font-serif text-lg font-bold text-stone-900">
                                    Daily Spot Metal Rates & Store Settings
                                </h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Updating these numerical variables recalculates all store jewelry values dynamically across active client storefront devices.
                                </p>

                                <form onSubmit={handleSaveRatesOnly} className="mt-6 space-y-4">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Gold 22K (Rate / g)
                                            </label>
                                            <input
                                                type="number"
                                                value={gold22k}
                                                onChange={(e) => setGold22k(Number(e.target.value))}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Gold 24K (Rate / g)
                                            </label>
                                            <input
                                                type="number"
                                                value={gold24k}
                                                onChange={(e) => setGold24k(Number(e.target.value))}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Normal Silver (Rate / g)
                                            </label>
                                            <input
                                                type="number"
                                                value={silverNormal}
                                                onChange={(e) => setSilverNormal(Number(e.target.value))}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Silver 92.5 (Rate / g)
                                            </label>
                                            <input
                                                type="number"
                                                value={silver999}
                                                onChange={(e) => setSilver999(Number(e.target.value))}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingRates}
                                            className="flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 text-white px-6 py-2.5 text-xs font-bold transition-all hover:bg-stone-850 cursor-pointer shadow-sm"
                                        >
                                            <RefreshCw className={`h-3.5 w-3.5 ${isSavingRates ? 'animate-spin' : ''}`} />
                                            {isSavingRates ? 'Updating daily rates...' : 'Update Daily Metal Price Rates'}
                                        </button>
                                    </div>
                                </form>

                                {/* FEATURED ADVERTISING SECTION CONFIGURATION */}
                                <form onSubmit={handleSaveAdOnly} className="mt-8 pt-6 border-t border-stone-200 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                                                <span>✨</span> Daily Spotlight Advertising Banner
                                            </h4>
                                            <p className="text-[11px] text-stone-500 mt-1">
                                                Configure a premium banner section right under the daily rates ticker to advertise a newly added or highly liked piece of jewelry.
                                            </p>
                                        </div>
                                        {!showCancelAdConfirm ? (
                                            <button
                                                type="button"
                                                onClick={() => setShowCancelAdConfirm(true)}
                                                className="px-3.5 py-1.5 shrink-0 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 hover:border-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-center transition-all cursor-pointer"
                                                title="Cancel/Clear active advertisement"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Cancel / Clear Ad
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 shrink-0 bg-red-50 border border-red-200 rounded-xl p-2">
                                                <span className="text-[11px] text-red-700 font-bold">Remove Advertisement?</span>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelAd}
                                                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                                >
                                                    Yes, Clear
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCancelAdConfirm(false)}
                                                    className="px-2.5 py-1 bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-lg text-[10px] font-medium transition-all cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 mt-4">
                                        {/* Active Toggle */}
                                        <div className="flex items-center gap-3 bg-stone-50 p-4 border border-stone-200 rounded-xl">
                                            <input
                                                type="checkbox"
                                                id="ad_active"
                                                checked={adActive}
                                                onChange={(e) => setAdActive(e.target.checked)}
                                                className="h-4 w-4 rounded-sm border-stone-300 text-stone-950 focus:ring-stone-500 cursor-pointer"
                                            />
                                            <div>
                                                <label htmlFor="ad_active" className="block text-xs font-bold text-stone-700 cursor-pointer">
                                                    Enable Daily Spotlight Advertising Banner
                                                </label>
                                                <span className="text-[10px] text-stone-500">
                                                    When checked, this banner will display right below the daily price ticker.
                                                </span>
                                            </div>
                                        </div>

                                        {/* STEP 1: MEDIA UPLOAD & CONFIGURATION (Clearly separated box) */}
                                        <div className="rounded-2xl border border-stone-200 bg-stone-50/40 p-5 space-y-4">
                                            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase font-mono">Step 1 of 2</span>
                                                    <h5 className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">Ad Media Asset Configuration</h5>
                                                </div>
                                                {adMediaUrl && (
                                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        Asset Loaded
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                                {/* File Picker & Upload Trigger Column (Span 5) */}
                                                <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-stone-700 uppercase font-mono mb-1.5">
                                                            Device Media Upload
                                                        </label>
                                                        <p className="text-[10px] text-stone-400 mb-2">
                                                            Choose or drag an image or video file from your computer or phone storage.
                                                        </p>

                                                        <label className={`group relative flex flex-col items-center justify-center gap-3 px-4 py-8 border-2 border-dashed rounded-xl transition-all cursor-pointer text-center ${isUploadingAdMedia
                                                                ? 'border-amber-400 bg-amber-50/20'
                                                                : adUploadStatus === 'completed'
                                                                    ? 'border-emerald-300 bg-emerald-50/10 hover:bg-emerald-50/20'
                                                                    : 'border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50/40'
                                                            }`}>
                                                            <Upload className={`h-8 w-8 transition-transform group-hover:-translate-y-0.5 ${isUploadingAdMedia
                                                                    ? 'text-amber-500 animate-bounce'
                                                                    : adUploadStatus === 'completed'
                                                                        ? 'text-emerald-500'
                                                                        : 'text-stone-400'
                                                                }`} />
                                                            <div className="space-y-1">
                                                                <span className="block text-xs font-extrabold text-stone-700 group-hover:text-stone-900">
                                                                    {isUploadingAdMedia ? 'Uploading to database...' : 'Select Media File'}
                                                                </span>
                                                                <span className="block text-[10px] text-stone-400">
                                                                    Supports PNG, JPG, WEBP, MP4
                                                                </span>
                                                            </div>
                                                            <input
                                                                type="file"
                                                                accept="image/*,video/*"
                                                                className="hidden"
                                                                onChange={handleAdMediaFileChange}
                                                                disabled={isUploadingAdMedia}
                                                            />
                                                        </label>
                                                    </div>

                                                    {/* UPLOAD STATUS MONITOR */}
                                                    <div className="rounded-xl border border-stone-200 bg-white p-3 space-y-1.5 shadow-2xs">
                                                        <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                                                            Connection & Upload Status
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {adUploadStatus === 'uploading' && (
                                                                <>
                                                                    <span className="flex h-2.5 w-2.5 relative">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                                                    </span>
                                                                    <span className="text-[11px] font-bold text-amber-700 animate-pulse">
                                                                        Uploading... Please hold
                                                                    </span>
                                                                </>
                                                            )}
                                                            {adUploadStatus === 'completed' && (
                                                                <>
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                                                    <span className="text-[11px] font-bold text-emerald-700">
                                                                        Upload Complete! Registered.
                                                                    </span>
                                                                </>
                                                            )}
                                                            {adUploadStatus === 'failed' && (
                                                                <>
                                                                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                                                                    <span className="text-[11px] font-bold text-rose-700">
                                                                        Upload failed! Try another file.
                                                                    </span>
                                                                </>
                                                            )}
                                                            {adUploadStatus === 'idle' && (
                                                                <>
                                                                    {adMediaUrl ? (
                                                                        <>
                                                                            <span className="h-2.5 w-2.5 rounded-full bg-stone-400"></span>
                                                                            <span className="text-[11px] font-semibold text-stone-600">
                                                                                Ready with existing asset
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="h-2.5 w-2.5 rounded-full bg-stone-300"></span>
                                                                            <span className="text-[11px] font-semibold text-stone-500">
                                                                                Idle — No media uploaded
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-stone-500 italic">
                                                            {adUploadStatus === 'uploading' && 'Writing binary streams directly to secure Cloud Storage buckets.'}
                                                            {adUploadStatus === 'completed' && 'Your spotlight banner asset has been successfully written and compiled!'}
                                                            {adUploadStatus === 'failed' && 'An error occurred. Check file dimensions, format, or connection status.'}
                                                            {adUploadStatus === 'idle' && (adMediaUrl ? 'Media loaded. Feel free to re-upload or update raw fields below.' : 'Select a device file above to begin, or paste an external URL.')}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Media Link / Type / Preview Details Column (Span 7) */}
                                                <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-stone-200 flex flex-col justify-between gap-4">
                                                    <div className="space-y-3.5">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                                    Media Type
                                                                </label>
                                                                <select
                                                                    value={adMediaType}
                                                                    onChange={(e) => setAdMediaType(e.target.value as 'image' | 'video')}
                                                                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden cursor-pointer"
                                                                >
                                                                    <option value="image">Photo / Image asset</option>
                                                                    <option value="video">Video asset (mp4 / stream)</option>
                                                                </select>
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                                    Raw Media URL Link
                                                                </label>
                                                                <div className="mt-1 flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={adMediaUrl}
                                                                        onChange={(e) => {
                                                                            setAdMediaUrl(e.target.value);
                                                                            if (e.target.value.trim() && !adActive) {
                                                                                setAdActive(true);
                                                                            }
                                                                            if (e.target.value.trim()) {
                                                                                setAdUploadStatus('completed');
                                                                            } else {
                                                                                setAdUploadStatus('idle');
                                                                            }
                                                                        }}
                                                                        placeholder="https://images.unsplash.com/... or raw URL"
                                                                        className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                                    />
                                                                    {adMediaUrl && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setAdMediaUrl('');
                                                                                setAdUploadStatus('idle');
                                                                            }}
                                                                            className="px-2.5 py-1 text-[10px] uppercase font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                        >
                                                                            Clear
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Live Thumbnail Preview Box */}
                                                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-200/60">
                                                        <span className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono mb-2">
                                                            Live Media Thumbnail Preview
                                                        </span>
                                                        {adMediaUrl ? (
                                                            <div className="flex gap-3 items-center">
                                                                <div className="h-16 w-24 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center shrink-0">
                                                                    {adMediaType === 'video' ? (
                                                                        <video src={adMediaUrl} className="h-full w-full object-cover" muted loop autoPlay playsInline referrerPolicy="no-referrer" />
                                                                    ) : (
                                                                        <img src={adMediaUrl} alt="Ad Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <span className="block text-xs font-bold text-stone-700 truncate">
                                                                        {adMediaUrl.split('/').pop()?.split('?')[0] || 'Linked Media Stream'}
                                                                    </span>
                                                                    <span className="block text-[10px] text-stone-500 capitalize">
                                                                        Format: {adMediaType} Asset
                                                                    </span>
                                                                    <a
                                                                        href={adMediaUrl}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-[10px] text-amber-600 hover:underline font-mono inline-flex items-center gap-1 mt-0.5"
                                                                    >
                                                                        View original source ↗
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-16 border border-dashed border-stone-200 rounded-lg flex items-center justify-center text-stone-400 text-[11px] bg-stone-50/50">
                                                                No media linked yet — Upload a file or paste a URL above
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* STEP 2: TEXT CONFIGURATION & SETTINGS (Clearly separated box) */}
                                        <div className="rounded-2xl border border-stone-200 bg-stone-50/40 p-5 space-y-4">
                                            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                                                <div>
                                                    <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase font-mono">Step 2 of 2</span>
                                                    <h5 className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">Ad Copy & Store Link Settings</h5>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Title */}
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                        Advertisement Title / Catchphrase
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={adTitle}
                                                        onChange={(e) => {
                                                            setAdTitle(e.target.value);
                                                            if (e.target.value.trim() && !adActive) {
                                                                setAdActive(true);
                                                            }
                                                        }}
                                                        placeholder="e.g. Unveiling: The Royal Nizam Antique Kundan Haram"
                                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                    />
                                                </div>

                                                {/* Link Product */}
                                                <div>
                                                    <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                        Link to Catalog Product (Optional)
                                                    </label>
                                                    <select
                                                        value={adProductId}
                                                        onChange={(e) => {
                                                            setAdProductId(e.target.value);
                                                            if (e.target.value && !adActive) {
                                                                setAdActive(true);
                                                            }
                                                        }}
                                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden cursor-pointer"
                                                    >
                                                        <option value="">-- No Direct Product Link --</option>
                                                        {products.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({p.purity_type} - {p.weight_grams}g)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Text/Subtitle */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                        Advertisement Body Description / Offer Callout
                                                    </label>
                                                    <textarea
                                                        value={adText}
                                                        onChange={(e) => {
                                                            setAdText(e.target.value);
                                                            if (e.target.value.trim() && !adActive) {
                                                                setAdActive(true);
                                                            }
                                                        }}
                                                        placeholder="A premium description displaying to the right of the photo/video..."
                                                        rows={3}
                                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingAd}
                                            className="flex items-center justify-semibold gap-1.5 rounded-xl bg-amber-500 text-stone-950 px-6 py-2.5 text-xs font-extrabold transition-all hover:bg-amber-600 cursor-pointer shadow-sm"
                                        >
                                            <Megaphone className={`h-3.5 w-3.5 ${isSavingAd ? 'animate-pulse' : ''}`} />
                                            {isSavingAd ? 'Publishing advertisement...' : 'Publish Spotlight Advertisement'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* FLAT PROMOTIONAL OFFER SETTINGS */}
                            <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🏷️</span>
                                    <div>
                                        <h3 className="font-serif text-lg font-bold text-stone-900">
                                            Canceled M.R.P. Rate Configuration
                                        </h3>
                                        <p className="text-xs text-stone-500 mt-1">
                                            Configure store-wide canceled per-gram rates for each metal type. This will display a canceled M.R.P. price and the dynamically calculated discount percentage against the live dynamic daily rate.
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveFlatOffer} className="space-y-6 pt-2">
                                    {/* Enable Switch */}
                                    <div className="flex items-center gap-3 bg-amber-500/5 p-4 border border-amber-500/10 rounded-xl">
                                        <input
                                            type="checkbox"
                                            id="flat_offer_active"
                                            checked={flatOfferActive}
                                            onChange={(e) => setFlatOfferActive(e.target.checked)}
                                            className="h-4 w-4 rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                        />
                                        <div>
                                            <label htmlFor="flat_offer_active" className="block text-xs font-bold text-stone-700 cursor-pointer">
                                                Deals Mode: Activate Canceled Rate / Savings Display Store-Wide
                                            </label>
                                            <span className="text-[10px] text-stone-500">
                                                When active, products will display a canceled M.R.P. rate and a savings percentage calculated from the difference with the live daily price.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Grid of Metal Purity rates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Gold 22K Rates */}
                                        <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/40 space-y-3.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-serif border-b pb-1.5 border-stone-200">
                                                Gold 22K Offer Canceled Rate (₹/g)
                                            </h4>
                                            <div>
                                                <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                                                    Canceled M.R.P. Rate (per gram)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={flatOfferCanceled22k}
                                                    onChange={(e) => setFlatOfferCanceled22k(Number(e.target.value))}
                                                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Gold 24K Rates */}
                                        <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/40 space-y-3.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-serif border-b pb-1.5 border-stone-200">
                                                Gold 24K Offer Canceled Rate (₹/g)
                                            </h4>
                                            <div>
                                                <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                                                    Canceled M.R.P. Rate (per gram)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={flatOfferCanceled24k}
                                                    onChange={(e) => setFlatOfferCanceled24k(Number(e.target.value))}
                                                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Silver 92.5 Rates */}
                                        <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/40 space-y-3.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-serif border-b pb-1.5 border-stone-200">
                                                Silver 92.5 Offer Canceled Rate (₹/g)
                                            </h4>
                                            <div>
                                                <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                                                    Canceled M.R.P. Rate (per gram)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={flatOfferCanceledSilver999}
                                                    onChange={(e) => setFlatOfferCanceledSilver999(Number(e.target.value))}
                                                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    min="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Normal Silver Rates */}
                                        <div className="p-4 rounded-xl border border-stone-100 bg-stone-50/40 space-y-3.5">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 font-serif border-b pb-1.5 border-stone-200">
                                                Normal Silver Offer Canceled Rate (₹/g)
                                            </h4>
                                            <div>
                                                <label className="block text-[10px] font-bold text-stone-500 uppercase font-mono">
                                                    Canceled M.R.P. Rate (per gram)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={flatOfferCanceledSilverNormal}
                                                    onChange={(e) => setFlatOfferCanceledSilverNormal(Number(e.target.value))}
                                                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSavingFlatOffer}
                                            className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 text-stone-950 px-6 py-2.5 text-xs font-bold hover:bg-amber-600 transition-all cursor-pointer shadow-sm"
                                        >
                                            <span>💾</span> {isSavingFlatOffer ? 'Saving Flat Offer...' : 'Save & Sync Flat Offer Settings'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Administrative Password Manager Desk */}
                            <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Key className="h-5 w-5 text-stone-700" />
                                    <h3 className="font-serif text-base font-bold text-stone-900">
                                        Administrative Passkey Manager
                                    </h3>
                                </div>
                                <p className="text-xs text-stone-500 mt-1">
                                    Change the secure key required to enter this panel.
                                </p>

                                {passError && (
                                    <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-xs font-medium text-rose-800 border border-rose-500/20 font-mono">
                                        {passError}
                                    </div>
                                )}
                                {passSuccess && (
                                    <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-xs font-bold text-emerald-800 border border-emerald-500/20 font-mono">
                                        {passSuccess}
                                    </div>
                                )}

                                <form onSubmit={handleUpdatePassword} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Current Password
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="e.g. Sanju@1234"
                                                className="w-full rounded-xl border border-stone-300 bg-white pl-3 pr-10 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            New Security Passkey
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="Min 6 characters"
                                                className="w-full rounded-xl border border-stone-300 bg-white pl-3 pr-10 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                                            >
                                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Confirm New Passkey
                                        </label>
                                        <div className="relative mt-1">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter to verify"
                                                className="w-full rounded-xl border border-stone-300 bg-white pl-3 pr-10 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSavingPassword}
                                            className="flex items-center gap-1.5 rounded-xl bg-stone-800 text-stone-100 px-6 py-2.5 text-xs font-bold hover:bg-stone-900 transition-all cursor-pointer"
                                        >
                                            Verify & Write Credentials
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: INTERACTIVE THEME BUILDER */}
                    {activeTab === 'theme' && (
                        <form onSubmit={handleSaveTheme} className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm space-y-6">
                            <div>
                                <h3 className="font-serif text-lg font-bold text-stone-900">
                                    Branding Layout & Theme Customizer
                                </h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Adjust color parameters, upload your brand logo, change the shop name, and set the business GSTIN number. All variables persist globally across devices.
                                </p>
                            </div>

                            {/* BRANDING IDENTITY SECTION */}
                            <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/50 space-y-5">
                                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest font-bold">Brand Identity & Legal Details</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Shop Name Field */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Store Shop Name
                                        </label>
                                        <input
                                            type="text"
                                            value={shopName}
                                            onChange={(e) => setShopName(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden"
                                            placeholder="e.g. Nazeer Jewellers"
                                            required
                                        />
                                    </div>

                                    {/* GSTIN Field */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            GSTIN Number (Goods & Services Tax)
                                        </label>
                                        <input
                                            type="text"
                                            value={gstin}
                                            onChange={(e) => setGstin(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden font-mono uppercase"
                                            placeholder="e.g. 37AAAAA1111A1Z1"
                                        />
                                        <span className="text-[9px] text-stone-400 mt-1 block">Displays legally in the storefront client footer once configured.</span>
                                    </div>
                                </div>

                                {/* Store Physical Address Field */}
                                <div className="pt-2">
                                    <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                        Store Physical Address
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden"
                                        placeholder="e.g. Ammavarisala St, Sainagar, Rajampet, Andhra Pradesh 516115"
                                    />
                                    <span className="text-[9px] text-stone-400 mt-1 block">
                                        Displays legally in the storefront footer so customers can locate your showroom.
                                    </span>
                                </div>

                                {/* SHOP NAME TYPOGRAPHY CUSTOMIZER */}
                                <div className="border border-stone-200 rounded-2xl p-5 bg-[#FCFAF7] space-y-4">
                                    <p className="text-[10px] text-[#936C31] font-mono uppercase tracking-widest font-bold flex items-center gap-1.5">
                                        <span className="text-amber-600 font-sans">✨</span> Shop Name Typography & Text Styling
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Select Font Family */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Select Brand Font Style
                                            </label>
                                            <select
                                                value={shopNameFont}
                                                onChange={(e) => setShopNameFont(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden cursor-pointer"
                                            >
                                                <option value="serif">Playfair Display (Elegant Serif)</option>
                                                <option value="sans">Inter (Modern Sans-Serif)</option>
                                                <option value="mono">JetBrains Mono (Technical Minimal)</option>
                                                <option value="cinzel">Cinzel (Roman Royal Luxury)</option>
                                                <option value="cormorant">Cormorant Garamond (High-Fashion Editorial)</option>
                                                <option value="prata">Prata (Didone Majestic Serif)</option>
                                                <option value="greatvibes">Great Vibes (Luxurious Flowing Calligraphy)</option>
                                                <option value="sacramento">Sacramento (Ultra-Thin Signature Handwriting)</option>
                                            </select>
                                            <span className="text-[9px] text-stone-400 mt-1 block">Choose a font style that fits your showroom's unique visual character.</span>
                                        </div>

                                        {/* Letter Spacing option */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Letter Spacing (Kerning)
                                            </label>
                                            <select
                                                value={shopNameSpacing}
                                                onChange={(e) => setShopNameSpacing(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden cursor-pointer"
                                            >
                                                <option value="tight">Tight</option>
                                                <option value="normal">Normal</option>
                                                <option value="wide">Wide</option>
                                                <option value="widest">Widest (Spacious luxury look)</option>
                                            </select>
                                            <span className="text-[9px] text-stone-400 mt-1 block">Adjust horizontal spacing between letters for the header brand name.</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 pt-2">
                                        {/* Italic toggle */}
                                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
                                            <input
                                                type="checkbox"
                                                checked={shopNameItalic}
                                                onChange={(e) => setShopNameItalic(e.target.checked)}
                                                className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                                            />
                                            <span>Enable Italic Styling</span>
                                        </label>

                                        {/* Bold toggle */}
                                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
                                            <input
                                                type="checkbox"
                                                checked={shopNameBold}
                                                onChange={(e) => setShopNameBold(e.target.checked)}
                                                className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                                            />
                                            <span>Enable Bold/Thick Weight</span>
                                        </label>
                                    </div>

                                    {/* Typography Live Preview */}
                                    <div className="mt-4 p-4 rounded-xl bg-stone-900 border border-stone-800 text-center flex flex-col justify-center items-center">
                                        <span className="text-[8px] uppercase tracking-widest text-[#D4AF37] font-mono mb-2">Live Header Preview</span>
                                        <div className="w-full max-w-md py-3 px-4 border border-[#D4AF37]/20 bg-[#1A1A1A] rounded-lg">
                                            <h4 className={`text-white text-base sm:text-xl transition-all duration-300 ${(shopNameFont === 'greatvibes' || shopNameFont === 'sacramento') ? '' : 'leading-none'
                                                } ${(() => {
                                                    let fClass = 'font-serif';
                                                    if (shopNameFont === 'sans') fClass = 'font-sans';
                                                    else if (shopNameFont === 'mono') fClass = 'font-mono';
                                                    else if (shopNameFont === 'cinzel') fClass = 'font-cinzel';
                                                    else if (shopNameFont === 'cormorant') fClass = 'font-cormorant';
                                                    else if (shopNameFont === 'greatvibes') fClass = 'font-greatvibes text-2xl font-normal!';
                                                    else if (shopNameFont === 'montserrat') fClass = 'font-montserrat';
                                                    else if (shopNameFont === 'prata') fClass = 'font-prata';
                                                    else if (shopNameFont === 'sacramento') fClass = 'font-sacramento text-3xl font-normal!';

                                                    const iClass = shopNameItalic ? 'italic' : 'not-italic';
                                                    const bClass = shopNameBold ? 'font-bold' : 'font-medium';

                                                    let sClass = 'tracking-tight';
                                                    if (shopNameSpacing === 'normal') sClass = 'tracking-normal';
                                                    else if (shopNameSpacing === 'wide') sClass = 'tracking-wide';
                                                    else if (shopNameSpacing === 'widest') sClass = 'tracking-widest';

                                                    return `${fClass} ${iClass} ${bClass} ${sClass}`;
                                                })()}`}>
                                                {shopName || 'Sri Venkateswara Golden Jewellers'}
                                            </h4>
                                        </div>
                                    </div>
                                </div>

                                {/* HOMEPAGE HEADINGS & FOOTER CUSTOMIZER */}
                                <div className="border border-stone-200 rounded-2xl p-5 bg-white space-y-4">
                                    <p className="text-[10px] text-[#936C31] font-mono uppercase tracking-widest font-bold">Homepage & Footer Customizable Content</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Collection Heading Title */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Our Collection Heading Title
                                            </label>
                                            <input
                                                type="text"
                                                value={collectionTitle}
                                                onChange={(e) => setCollectionTitle(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden"
                                                placeholder="Our Collection"
                                            />
                                            <span className="text-[9px] text-stone-400 mt-1 block">Customize the main heading above the product list.</span>
                                        </div>

                                        {/* Footer Copyright Text */}
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Footer Copyright Text
                                            </label>
                                            <input
                                                type="text"
                                                value={footerCopyright}
                                                onChange={(e) => setFooterCopyright(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden"
                                                placeholder="e.g. © 2026 Nazeer Jewellers."
                                            />
                                            <span className="text-[9px] text-stone-400 mt-1 block">Customize the copyright line at the very bottom-left.</span>
                                        </div>
                                    </div>

                                    {/* Collection Heading Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Our Collection Description Subtitle
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={collectionSubtitle}
                                            onChange={(e) => setCollectionSubtitle(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden"
                                            placeholder="Curated masterpieces in gold and silver — every piece crafted with devotion and precision."
                                        />
                                        <span className="text-[9px] text-stone-400 mt-1 block">Specify the fine subheading under the main Collection Heading.</span>
                                    </div>

                                    {/* Footer Standard Certified Text */}
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Footer Quality & Certification text
                                        </label>
                                        <input
                                            type="text"
                                            value={footerText}
                                            onChange={(e) => setFooterText(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs focus:border-[#936C31] focus:outline-hidden"
                                            placeholder="100% certified 916 hallmark standard jewels. pre-booking registered online."
                                        />
                                        <span className="text-[9px] text-stone-400 mt-1 block">Custom text below your address (e.g. hallmarks, credentials).</span>
                                    </div>
                                </div>

                                {/* Logo & Branding Upload Field */}
                                <div className="border border-stone-200 rounded-xl p-4 bg-white space-y-4">
                                    <span className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                        Store Logo Branding
                                    </span>

                                    <div className="flex flex-col md:flex-row gap-5 items-start">
                                        {/* Current Logo Preview */}
                                        <div className="flex flex-col items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-stone-400 uppercase font-mono">Current Logo</span>
                                            <div className="h-20 w-20 rounded-full overflow-hidden bg-white border border-stone-200 flex items-center justify-center p-1.5 shadow-xs">
                                                {logoUrl ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt="Shop Logo Preview"
                                                        className="h-full w-full rounded-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 text-stone-300" />
                                                )}
                                            </div>
                                        </div>

                                        {/* File Upload Zone / URL field */}
                                        <div className="flex-1 w-full space-y-3">
                                            {/* File Uploader Drag and Drop Zone */}
                                            <div
                                                onDragOver={handleLogoDragOver}
                                                onDragLeave={handleLogoDragLeave}
                                                onDrop={handleLogoDrop}
                                                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${logoDragActive
                                                        ? 'border-[#936C31] bg-amber-50/20'
                                                        : 'border-stone-300 hover:border-[#936C31] bg-white'
                                                    }`}
                                                onClick={() => document.getElementById('logo-file-picker')?.click()}
                                            >
                                                <input
                                                    type="file"
                                                    id="logo-file-picker"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleLogoFileChange}
                                                />

                                                {isUploadingLogo ? (
                                                    <div className="flex flex-col items-center gap-2 py-2">
                                                        <RefreshCw className="h-5 w-5 text-[#936C31] animate-spin" />
                                                        <span className="text-[11px] font-mono text-stone-500">Uploading new logo from gallery...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Upload className="h-5 w-5 text-stone-400 group-hover:text-[#936C31]" />
                                                        <span className="text-xs font-medium text-stone-700">
                                                            Drag & drop store logo here, or <strong className="text-[#936C31]">browse files</strong>
                                                        </span>
                                                        <span className="text-[10px] text-stone-400">Supports PNG, JPG, JPEG or GIF from gallery / files manager</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fallback Direct URL field */}
                                            <div>
                                                <span className="block text-[10px] text-stone-400 font-mono uppercase">Or paste raw Logo Image URL</span>
                                                <input
                                                    type="text"
                                                    value={logoUrl}
                                                    onChange={(e) => setLogoUrl(e.target.value)}
                                                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-[11px] focus:border-stone-500 focus:outline-hidden"
                                                    placeholder="https://images.unsplash.com/..."
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DYNAMIC COLORS CUSTOMIZER */}
                            <div className="space-y-4">
                                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest font-bold">Interface Theme Colors</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Primary Accent Glow
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.primary}
                                                onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.primary}
                                                onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Secondary Accent
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.secondary}
                                                onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.secondary}
                                                onChange={(e) => setTheme({ ...theme, secondary: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Premium Header Backdrop
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.headerBg}
                                                onChange={(e) => setTheme({ ...theme, headerBg: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.headerBg}
                                                onChange={(e) => setTheme({ ...theme, headerBg: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Header Title Text
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.headerText}
                                                onChange={(e) => setTheme({ ...theme, headerText: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.headerText}
                                                onChange={(e) => setTheme({ ...theme, headerText: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Canvas Background
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.bg}
                                                onChange={(e) => setTheme({ ...theme, bg: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.bg}
                                                onChange={(e) => setTheme({ ...theme, bg: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Standard Text Color
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.text}
                                                onChange={(e) => setTheme({ ...theme, text: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.text}
                                                onChange={(e) => setTheme({ ...theme, text: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Secondary Accent glow
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={theme.accent}
                                                onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={theme.accent}
                                                onChange={(e) => setTheme({ ...theme, accent: e.target.value })}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Live Preview Screen Card */}
                            <div className="border border-stone-200 rounded-2xl p-5" style={{ backgroundColor: theme.bg }}>
                                <p className="text-[10px] text-stone-400 font-mono uppercase tracking-widest mb-3">Live Interactive Theme Sandbox Preview</p>

                                <div className="rounded-xl overflow-hidden shadow-md">
                                    {/* Mock Header */}
                                    <div className="p-3 flex justify-between items-center" style={{ backgroundColor: theme.headerBg, color: theme.headerText }}>
                                        <span className="font-serif text-sm font-bold">SV Golden Jewellers</span>
                                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-sm">Account</span>
                                    </div>

                                    {/* Mock Page Content */}
                                    <div className="p-4 flex gap-4" style={{ backgroundColor: theme.bg }}>
                                        <div className="flex-1 rounded-xl p-4 shadow-xs" style={{ backgroundColor: theme.cardBg }}>
                                            <span className="text-[10px] rounded-full text-white px-2 py-0.5" style={{ backgroundColor: theme.primary }}>22K Gold</span>
                                            <h4 className="font-serif text-xs font-bold mt-2" style={{ color: theme.text }}>Antique Kasulaperu Haram</h4>
                                            <p className="text-[10px] mt-1" style={{ color: theme.text }}>Weight: 44.5 grams</p>

                                            <button className="mt-3 flex w-full justify-center rounded-lg py-1.5 text-[10px] font-bold text-white cursor-pointer" style={{ backgroundColor: theme.primary }}>
                                                WhatsApp Inquiry
                                            </button>
                                        </div>

                                        <div className="flex-1 rounded-xl p-4 shadow-xs" style={{ backgroundColor: theme.cardBg }}>
                                            <span className="text-[10px] rounded-full text-white px-2 py-0.5" style={{ backgroundColor: theme.accent }}>92.5 Silver</span>
                                            <h4 className="font-serif text-xs font-bold mt-2" style={{ color: theme.text }}>Royal Nakshi Silver Kada</h4>
                                            <p className="text-[10px] mt-1" style={{ color: theme.text }}>Weight: 52 grams</p>

                                            <button className="mt-3 flex w-full justify-center rounded-lg py-1.5 text-[10px] font-bold text-white cursor-pointer" style={{ backgroundColor: theme.secondary }}>
                                                WhatsApp Inquiry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSavingTheme}
                                    className="flex items-center gap-1.5 rounded-xl bg-stone-900 text-white px-6 py-2.5 text-xs font-bold transition-all hover:bg-stone-850 cursor-pointer"
                                >
                                    <Palette className="h-4 w-4" />
                                    {isSavingTheme ? 'Applying brand variables...' : 'Save Brand Identity & Visual Theme'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 3: WHATSAPP COMMUNICATION PATHS */}
                    {activeTab === 'whatsapp' && (
                        <div className="space-y-6">
                            <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm">
                                <h3 className="font-serif text-lg font-bold text-stone-900">
                                    Configure WhatsApp Outbound Business Numbers
                                </h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    These numbers receive sequential broadcasts from clients enquiring about specific products. Set your showroom desks and sales representatives with accurate country codes (e.g. +91...).
                                </p>

                                {/* Add new target number */}
                                <form onSubmit={handleAddWaNumber} className="mt-6 flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Representative Desk / Reference Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newWaName}
                                            onChange={(e) => setNewWaName(e.target.value)}
                                            placeholder="e.g. Hyderabad Showroom Desk"
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                            required
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Phone Number (with Country Code)
                                        </label>
                                        <input
                                            type="text"
                                            value={newWaNumber}
                                            onChange={(e) => setNewWaNumber(e.target.value)}
                                            placeholder="e.g. +919876543210"
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isAddingWa}
                                        className="rounded-xl bg-stone-900 hover:bg-stone-850 text-white px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                                    >
                                        <Plus className="h-4 w-4" /> Add Representative Channel
                                    </button>
                                </form>

                                {/* Active numbers list */}
                                <div className="mt-8 border-t border-stone-150 pt-5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
                                        Active Broadcaster Channels ({whatsAppNumbers.length})
                                    </h4>

                                    {whatsAppNumbers.length === 0 ? (
                                        <p className="mt-4 text-xs italic text-stone-500">
                                            No numbers configured. Outbound queries will fallback to prompt alerts until a path is added.
                                        </p>
                                    ) : (
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {whatsAppNumbers.map((num) => (
                                                <div
                                                    key={num.id}
                                                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 hover:shadow-xs transition-shadow"
                                                >
                                                    <div>
                                                        <span className="block font-serif text-sm font-semibold text-stone-900">{num.reference_name}</span>
                                                        <span className="text-[11px] text-stone-500 font-mono">{num.phone_number}</span>
                                                    </div>

                                                    <button
                                                        onClick={() => handleDeleteWaNumber(num.id)}
                                                        className="rounded-lg bg-rose-50 hover:bg-rose-100 p-2 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                                                        title="Delete representative channel"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: PRODUCTS DETAILS SECTION */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-6">
                            {/* Product insert form */}
                            <div id="inventory-form-container" className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm scroll-mt-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-150 pb-4 mb-5">
                                    <div>
                                        <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                                            {editingProduct ? (
                                                <>
                                                    <Edit className="h-5 w-5 text-amber-700" />
                                                    <span>Edit Jewelry Masterpiece</span>
                                                </>
                                            ) : (
                                                <span>Add New Jewelry Masterpiece</span>
                                            )}
                                        </h3>
                                        <p className="text-xs text-stone-500 mt-1">
                                            {editingProduct
                                                ? `Modifying specifications, pricing structures, or showcase photos for SKU: ${editingProduct.SKU}`
                                                : 'Add high-resolution image assets via file uploads or URL streams. Items immediately propagate to the Customer Showroom catalog tables.'
                                            }
                                        </p>
                                    </div>
                                    {editingProduct && (
                                        <button
                                            type="button"
                                            onClick={cancelEditingProduct}
                                            className="rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 hover:text-stone-950 px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                                        >
                                            <X className="h-4 w-4" /> Cancel Edit
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleCreateProduct} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Jewelry Piece Title / Name
                                            </label>
                                            <input
                                                type="text"
                                                value={prodName}
                                                onChange={(e) => setProdName(e.target.value)}
                                                placeholder="e.g. Royal Antique Emerald Kasulaperu Haram"
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Unique SKU Code Identifier
                                            </label>
                                            <input
                                                type="text"
                                                value={prodSKU}
                                                onChange={(e) => setProdSKU(e.target.value)}
                                                placeholder="e.g. SVJ-GLD-HRM-012"
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono uppercase"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Main Category Group
                                            </label>
                                            <select
                                                value={prodMainCat}
                                                onChange={(e) => setProdMainCat(e.target.value as MainCategory)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                            >
                                                <option value="Gold">Gold Jewelry</option>
                                                <option value="Silver">Silver Jewelry</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Purity Classification
                                            </label>
                                            <select
                                                value={prodPurity}
                                                onChange={(e) => setProdPurity(e.target.value as PurityType)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                            >
                                                {prodMainCat === 'Gold' ? (
                                                    <>
                                                        <option value="22K Gold">22K Gold Finish</option>
                                                        <option value="24K Gold">24K Gold (Sovereign Pure)</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="Silver 92.5 Purity">Silver 92.5 Purity</option>
                                                        <option value="Normal Silver">Normal Silver Standard</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Gender Designation
                                            </label>
                                            <select
                                                value={prodGender}
                                                onChange={(e) => setProdGender(e.target.value as GenderTag)}
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                            >
                                                <option value="Women">Women Collection</option>
                                                <option value="Men">Men Collection</option>
                                                <option value="Unisex">Unisex Line</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Jewelry Style Class
                                            </label>
                                            <input
                                                type="text"
                                                list="admin-style-classes"
                                                value={prodType}
                                                onChange={(e) => setProdType(e.target.value)}
                                                placeholder="e.g. Chains, Plates, Spoons"
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                                required
                                            />
                                            <datalist id="admin-style-classes">
                                                {Array.from(new Set([
                                                    'Chains',
                                                    'Bangles',
                                                    'Rings',
                                                    'Earrings',
                                                    'Plates',
                                                    'Spoons',
                                                    'Others',
                                                    ...products.map(p => p.product_type).filter(Boolean)
                                                ])).map((style) => (
                                                    <option key={style} value={style} />
                                                ))}
                                            </datalist>
                                            <span className="text-[9px] text-stone-400 mt-1 block">
                                                Type any custom name manually to form a new category (e.g. Plates, Spoons) or select from suggestions.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stones & Metal Breakdown Section */}
                                    <div className="border border-[#936C31]/20 rounded-xl bg-[#FCFAF7]/40 p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-stone-800 uppercase font-mono tracking-wide">
                                                    Stone & Metal Breakdown (Optional)
                                                </span>
                                                <span className="text-[9px] text-stone-400">
                                                    Enable this to manually split Gold/Silver weight, stone weight, and manually enter stone prices.
                                                </span>
                                            </div>
                                            <label className="relative flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={prodHasStone}
                                                    onChange={(e) => {
                                                        setProdHasStone(e.target.checked);
                                                        if (e.target.checked) {
                                                            // If checked and empty, initialize with values from weight if possible
                                                            if (!prodMetalWeight && prodWeight > 0) {
                                                                setProdMetalWeight(prodWeight);
                                                            }
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded-sm border-stone-300 text-[#936C31] focus:ring-[#936C31]"
                                                />
                                                <span className="text-xs font-semibold text-stone-700">Contains Stones?</span>
                                            </label>
                                        </div>

                                        {prodHasStone && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#936C31]/10 pt-4 animate-fadeIn">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-stone-600 uppercase font-mono">
                                                        Gold/Metal Weight (in Grams)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={prodMetalWeight}
                                                        onChange={(e) => {
                                                            const metalW = Number(e.target.value);
                                                            setProdMetalWeight(e.target.value !== '' ? metalW : '');
                                                            // Auto calculate total weight: metal_weight + stone_weight
                                                            const stoneW = prodStoneWeight !== '' ? Number(prodStoneWeight) : 0;
                                                            const totalW = metalW + stoneW;
                                                            setProdWeight(Number(totalW.toFixed(3)));
                                                        }}
                                                        placeholder="e.g. 21.150"
                                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-stone-600 uppercase font-mono">
                                                        Stone Weight (in Grams)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.001"
                                                        value={prodStoneWeight}
                                                        onChange={(e) => {
                                                            const stoneW = Number(e.target.value);
                                                            setProdStoneWeight(e.target.value !== '' ? stoneW : '');
                                                            // Auto calculate total weight: metal_weight + stone_weight
                                                            const metalW = prodMetalWeight !== '' ? Number(prodMetalWeight) : 0;
                                                            const totalW = metalW + stoneW;
                                                            setProdWeight(Number(totalW.toFixed(3)));
                                                        }}
                                                        placeholder="e.g. 3.0"
                                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    />
                                                    <span className="text-[9px] text-stone-400 mt-1 block">
                                                        Direct weight of the stones in grams.
                                                    </span>
                                                </div>

                                                <div>
                                                    <label className="block text-[10px] font-bold text-stone-600 uppercase font-mono">
                                                        Stone Price (Manually Set ₹)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="1"
                                                        value={prodStonePrice}
                                                        onChange={(e) => setProdStonePrice(e.target.value !== '' ? Number(e.target.value) : '')}
                                                        placeholder="e.g. 15000"
                                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Item Weight (in Grams)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={prodWeight || ''}
                                                onChange={(e) => setProdWeight(Number(e.target.value))}
                                                placeholder="e.g. 24.350"
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0.001"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Making Charge Percentage (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={prodMakingCharge || ''}
                                                onChange={(e) => setProdMakingCharge(Number(e.target.value))}
                                                placeholder="e.g. 8.5"
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                                Stock Quantity (Items)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                value={prodStockQuantity}
                                                onChange={(e) => {
                                                    const val = Math.max(0, parseInt(e.target.value) || 0);
                                                    setProdStockQuantity(val);
                                                    if (val <= 0) {
                                                        setProdInStock(false);
                                                    } else {
                                                        setProdInStock(true);
                                                    }
                                                }}
                                                placeholder="e.g. 5"
                                                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                required
                                                min="0"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-end">
                                            <label className="relative flex items-center gap-2.5 cursor-pointer py-2 text-xs font-bold text-stone-700">
                                                <input
                                                    type="checkbox"
                                                    checked={prodInStock}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setProdInStock(checked);
                                                        if (!checked) {
                                                            setProdStockQuantity(0);
                                                        } else if (prodStockQuantity <= 0) {
                                                            setProdStockQuantity(1);
                                                        }
                                                    }}
                                                    className="h-4 w-4 rounded-md border-stone-300 text-amber-600 focus:ring-amber-500"
                                                />
                                                Mark as Available In Stock
                                            </label>
                                        </div>
                                    </div>

                                    {/* Product Specific Flat Promotional Offer (Optional Override) */}
                                    <div className="border border-amber-200 rounded-xl p-4.5 bg-amber-500/5 space-y-3">
                                        <div>
                                            <h4 className="text-xs font-extrabold text-amber-850 uppercase font-mono flex items-center gap-1.5">
                                                <Sparkles className="h-4 w-4 text-amber-600 animate-pulse" />
                                                Custom Canceled M.R.P. Rate (Product Override)
                                            </h4>
                                            <p className="text-[10px] text-stone-500 mt-0.5">
                                                Configure a unique canceled per-gram rate (M.R.P. per gram) for this specific jewelry piece. Leave empty to fallback to the global default setting.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-stone-600 uppercase font-mono">
                                                Canceled Rate (M.R.P. / gram)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={prodCanceledRate}
                                                onChange={(e) => setProdCanceledRate(e.target.value === '' ? '' : Number(e.target.value))}
                                                placeholder="Using Global Default"
                                                className="mt-1 max-w-xs w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* High-quality Drag and Drop file upload with visual feedback */}
                                    <div className="border border-stone-200 rounded-xl p-4.5 bg-stone-50 space-y-4">
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Product Photo Assets Upload
                                        </label>

                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center text-center justify-center transition-all ${dragActive ? 'border-amber-500 bg-amber-500/5' : 'border-stone-300 bg-white'
                                                }`}
                                        >
                                            <Upload className={`h-8 w-8 mb-2 ${dragActive ? 'text-amber-600 animate-bounce' : 'text-stone-400'}`} />

                                            <p className="text-xs font-medium text-stone-700">
                                                Drag & Drop product photography file here or{' '}
                                                <label className="text-amber-700 hover:underline cursor-pointer font-bold">
                                                    browse files
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageFileChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </p>
                                            <p className="text-[10px] text-stone-400 font-mono uppercase mt-1">
                                                Files are automatically routed and stored in supabase buckets
                                            </p>

                                            {uploadProgress && (
                                                <div className="mt-3.5 flex items-center gap-2 text-xs text-amber-800 font-bold animate-pulse font-mono bg-amber-500/5 px-4 py-1 rounded-full">
                                                    <Plus className="h-3.5 w-3.5 animate-spin" /> Uploading asset to database...
                                                </div>
                                            )}
                                        </div>

                                        {/* Manual Image URL paste box fallback */}
                                        <div>
                                            <p className="text-xs text-stone-400 text-center font-mono py-1">OR ENTER FILE URL MANUALLY</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newImageUrl}
                                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                                    placeholder="Paste high-res Unsplash image URL stream..."
                                                    className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newImageUrl.trim()) {
                                                            setProdImageUrls([...prodImageUrls, newImageUrl.trim()]);
                                                            setNewImageUrl('');
                                                        }
                                                    }}
                                                    className="rounded-lg bg-stone-900 text-white text-xs font-bold px-4 hover:bg-stone-850 cursor-pointer"
                                                >
                                                    Append URL
                                                </button>
                                            </div>
                                        </div>

                                        {/* Previews timeline list */}
                                        {prodImageUrls.length > 0 && (
                                            <div className="border-t border-stone-200 pt-3">
                                                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-mono mb-2">
                                                    Configured Asset Previews ({prodImageUrls.length}):
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    {prodImageUrls.map((url, idx) => (
                                                        <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-stone-300 bg-white shadow-xs group">
                                                            <img src={url} alt="product-thumbnail" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setProdImageUrls(prodImageUrls.filter((_, i) => i !== idx))}
                                                                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                                title="Remove photo"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isCreatingProduct}
                                        className={`w-full flex items-center justify-center gap-1.5 rounded-xl px-6 py-3 text-xs font-extrabold transition-all hover:scale-101 cursor-pointer ${editingProduct ? 'bg-amber-600 text-white' : 'bg-amber-500 text-stone-950'
                                            }`}
                                    >
                                        {editingProduct ? (
                                            <>
                                                <CheckCircle className="h-4.5 w-4.5" />
                                                <span>{isCreatingProduct ? 'Saving changes...' : 'Save Jewelry Masterpiece Changes'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4.5 w-4.5" />
                                                <span>{isCreatingProduct ? 'Writing records...' : 'Create New Product Record'}</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Products List Management */}
                            <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-150 pb-4 mb-5">
                                    <div>
                                        <h3 className="font-serif text-lg font-bold text-stone-900">
                                            Live Database Products Details ({products.length})
                                        </h3>
                                        <p className="text-xs text-stone-500 mt-1">
                                            Manage stock statuses, audit specifications, or delete obsolete items dynamically.
                                        </p>
                                    </div>

                                    {/* SKU / Unique Product Code Search Bar */}
                                    <div className="w-full md:w-80">
                                        <label className="block text-[10px] font-bold text-[#936C31] uppercase tracking-wider font-mono mb-1">
                                            Search by Unique Product Code / SKU
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Type Product SKU (e.g., SVJ-GLD-HRM)..."
                                                value={adminProductSearch}
                                                onChange={(e) => setAdminProductSearch(e.target.value)}
                                                className="w-full rounded-xl border border-stone-300 bg-white pl-8 pr-8 py-2 text-xs focus:border-[#936C31] focus:ring-1 focus:ring-[#936C31] focus:outline-hidden font-mono uppercase"
                                            />
                                            <span className="absolute left-2.5 top-2 text-stone-400 text-xs">🔍</span>
                                            {adminProductSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAdminProductSearch('')}
                                                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                                                    title="Clear Search"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    const query = adminProductSearch.trim().toLowerCase();
                                    const filtered = products.filter((prod) => {
                                        if (!query) return true;
                                        return (
                                            (prod.SKU && prod.SKU.toLowerCase().includes(query)) ||
                                            (prod.name && prod.name.toLowerCase().includes(query)) ||
                                            (prod.product_type && prod.product_type.toLowerCase().includes(query))
                                        );
                                    });

                                    return (
                                        <>
                                            {adminProductSearch && (
                                                <div className="mb-4 flex items-center justify-between bg-amber-50/50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs">
                                                    <span className="font-medium text-stone-700 font-mono">
                                                        Found <strong className="text-[#936C31] font-bold">{filtered.length}</strong> matching jewelry items for unique code query: "<span className="uppercase font-semibold">{adminProductSearch}</span>"
                                                    </span>
                                                    <button
                                                        onClick={() => setAdminProductSearch('')}
                                                        className="text-[10px] text-amber-900 font-bold hover:underline cursor-pointer uppercase tracking-wider font-mono"
                                                    >
                                                        Clear Filter
                                                    </button>
                                                </div>
                                            )}

                                            <div className="overflow-x-auto border border-stone-200 rounded-xl">
                                                <table className="min-w-full divide-y divide-stone-200 text-left text-xs">
                                                    <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-mono">
                                                        <tr>
                                                            <th className="px-4 py-3.5 font-bold">Image</th>
                                                            <th className="px-4 py-3.5 font-bold">Name & SKU</th>
                                                            <th className="px-4 py-3.5 font-bold">Specs</th>
                                                            <th className="px-4 py-3.5 font-bold">Weight / Charge</th>
                                                            <th className="px-4 py-3.5 font-bold">Offer Override</th>
                                                            <th className="px-4 py-3.5 font-bold text-center">In Stock</th>
                                                            <th className="px-4 py-3.5 text-center font-bold">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-stone-150 bg-white">
                                                        {filtered.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={7} className="px-4 py-12 text-center text-stone-500 italic">
                                                                    No product items found matching code: "{adminProductSearch}". Check your SKU syntax or list all items.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            filtered.map((prod) => {
                                                                const isLowStock = prod.is_in_stock && (prod.stock_quantity !== undefined && prod.stock_quantity < 3);
                                                                return (
                                                                    <tr
                                                                        key={prod.id}
                                                                        className={`transition-colors border-b border-stone-150 ${isLowStock
                                                                                ? 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-l-amber-500'
                                                                                : 'hover:bg-stone-50/50'
                                                                            }`}
                                                                    >
                                                                        <td className="whitespace-nowrap px-4 py-3">
                                                                            <img
                                                                                src={prod.image_urls[0] || 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=100'}
                                                                                alt="product"
                                                                                className="h-10 w-10 rounded-md object-cover border border-stone-200"
                                                                                referrerPolicy="no-referrer"
                                                                            />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="block font-serif text-xs font-semibold text-stone-900 line-clamp-1">{prod.name}</span>
                                                                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                                                <span className="text-[10px] text-stone-400 font-mono uppercase">{prod.purity_type} • SKU: {prod.SKU}</span>
                                                                                {isLowStock && (
                                                                                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-850 uppercase tracking-wider font-mono">
                                                                                        <AlertTriangle className="h-2.5 w-2.5 text-amber-700 shrink-0" />
                                                                                        Low Stock
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-3">
                                                                            <span className="block font-medium">{prod.product_type}</span>
                                                                            <span className="text-[10px] text-stone-500 font-mono">{prod.gender_tag} collection</span>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-3 font-mono">
                                                                            <span className="block font-bold">{prod.weight_grams.toFixed(2)}g</span>
                                                                            <span className="text-[10px] text-amber-700 font-bold">+{prod.making_charge_percent}% charge</span>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-stone-600">
                                                                            {prod.offer_canceled_rate || prod.offer_exclusive_rate || prod.offer_discount_amount ? (
                                                                                <div className="space-y-0.5 text-[10px]">
                                                                                    {prod.offer_canceled_rate && (
                                                                                        <div><span className="text-stone-400">Cancel:</span> ₹{prod.offer_canceled_rate}/g</div>
                                                                                    )}
                                                                                    {prod.offer_exclusive_rate && (
                                                                                        <div><span className="text-amber-850 font-semibold">Offer:</span> ₹{prod.offer_exclusive_rate}/g</div>
                                                                                    )}
                                                                                    {prod.offer_discount_amount !== undefined && prod.offer_discount_amount !== null && (
                                                                                        <div><span className="text-emerald-700 font-semibold">Coupon:</span> -₹{prod.offer_discount_amount}</div>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-stone-400 italic text-[10px]">Using defaults</span>
                                                                            )}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-center">
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                <button
                                                                                    onClick={() => handleToggleStockStatus(prod)}
                                                                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-all cursor-pointer ${prod.is_in_stock
                                                                                            ? isLowStock
                                                                                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                                                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                                        }`}
                                                                                    title="Click to toggle availability status"
                                                                                >
                                                                                    {prod.is_in_stock ? (isLowStock ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
                                                                                </button>
                                                                                <span className="text-[10px] text-stone-500 font-mono">
                                                                                    {prod.is_in_stock ? `${prod.stock_quantity} left` : '0 left'}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-4 py-3 text-center">
                                                                            <div className="flex items-center justify-center gap-1.5">
                                                                                <button
                                                                                    onClick={() => startEditingProduct(prod)}
                                                                                    className="rounded-lg bg-amber-50 hover:bg-amber-100 p-1.5 text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                                                                                    title="Edit product specs and photos"
                                                                                >
                                                                                    <Edit className="h-4 w-4" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteProduct(prod.id)}
                                                                                    className="rounded-lg bg-rose-50 hover:bg-rose-100 p-1.5 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                                                                                    title="Delete product permanently"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: ACTIVE PROMOTIONS HERO CONFIG */}
                    {activeTab === 'promo' && (
                        <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm space-y-6">
                            <div>
                                <h3 className="font-serif text-lg font-bold text-stone-900">
                                    Promotional Offer Hero Block Config
                                </h3>
                                <p className="text-xs text-stone-500 mt-1">
                                    Configure the master marketing campaign banner that resides prominently at the absolute top of customer catalogs.
                                </p>
                            </div>

                            <form onSubmit={handleSavePromo} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Campaign Banner Title
                                        </label>
                                        <input
                                            type="text"
                                            value={promoName}
                                            onChange={(e) => setPromoName(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Banner Background Color Accent
                                        </label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={promoBg}
                                                onChange={(e) => setPromoBg(e.target.value)}
                                                className="h-10 w-10 cursor-pointer rounded-lg border border-stone-300"
                                            />
                                            <input
                                                type="text"
                                                value={promoBg}
                                                onChange={(e) => setPromoBg(e.target.value)}
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                        Detailed Offer Description
                                    </label>
                                    <textarea
                                        value={promoDesc}
                                        onChange={(e) => setPromoDesc(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-stone-300 bg-white p-3 text-xs focus:border-stone-500 focus:outline-hidden min-h-[80px]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Promo Expiry Ends At
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={promoEnds}
                                            onChange={(e) => setPromoEnds(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        <label className="block text-xs font-bold text-stone-600 uppercase font-mono">
                                            Banner Image Configuration
                                        </label>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                            {/* Image Preview Thumbnail */}
                                            <div className="md:col-span-3 flex flex-col items-center justify-center border border-stone-250 bg-stone-50 rounded-xl p-2 relative h-32 overflow-hidden group">
                                                {promoImg ? (
                                                    <>
                                                        <img
                                                            src={promoImg}
                                                            alt="Promo Preview"
                                                            className="h-full w-full object-cover rounded-lg"
                                                            referrerPolicy="no-referrer"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setPromoImg('')}
                                                            className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full cursor-pointer"
                                                            title="Clear Image"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex flex-col items-center text-stone-400 gap-1 text-center p-2">
                                                        <ImageIcon className="h-6 w-6" />
                                                        <span className="text-[10px]">No banner image selected</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* File Upload Zone / Gallery Selection */}
                                            <div className="md:col-span-9 space-y-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPromoGallery(!showPromoGallery)}
                                                        className="px-3.5 py-1.5 rounded-lg border border-[#D4AF37] hover:bg-[#D4AF37]/5 text-[#936C31] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <Palette className="h-3.5 w-3.5" />
                                                        {showPromoGallery ? 'Hide Gallery' : 'Select from Curation Gallery'}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => document.getElementById('promo-file-picker')?.click()}
                                                        className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-150 text-stone-700 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        <Upload className="h-3.5 w-3.5" />
                                                        Browse Files
                                                    </button>
                                                </div>

                                                {/* File Uploader Drag and Drop Zone */}
                                                <div
                                                    onDragOver={handlePromoDragOver}
                                                    onDragLeave={handlePromoDragLeave}
                                                    onDrop={handlePromoDrop}
                                                    onClick={() => document.getElementById('promo-file-picker')?.click()}
                                                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center cursor-pointer h-24 ${promoDragActive
                                                            ? 'border-[#936C31] bg-amber-50/20'
                                                            : 'border-stone-250 hover:border-[#936C31] bg-white hover:bg-stone-50/50'
                                                        }`}
                                                >
                                                    <input
                                                        type="file"
                                                        id="promo-file-picker"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handlePromoFileChange}
                                                    />

                                                    {isUploadingPromoImg ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <RefreshCw className="h-4 w-4 text-[#936C31] animate-spin" />
                                                            <span className="text-[10px] font-mono text-stone-500">Uploading new banner image from files...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <Upload className="h-4 w-4 text-stone-400" />
                                                            <span className="text-[11px] font-medium text-stone-700">
                                                                Drag & drop file here, or <strong className="text-[#936C31]">browse files</strong>
                                                            </span>
                                                            <span className="text-[9px] text-stone-400">Supports PNG, JPG, JPEG or GIF from gallery / files manager</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Text input fallback */}
                                                <div>
                                                    <span className="block text-[9px] text-stone-400 font-mono uppercase">Or paste direct Banner Image URL</span>
                                                    <input
                                                        type="text"
                                                        value={promoImg}
                                                        onChange={(e) => setPromoImg(e.target.value)}
                                                        placeholder="https://images.unsplash.com/photo-..."
                                                        className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-stone-500 focus:outline-hidden font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expandable Image Gallery Panel */}
                                        {showPromoGallery && (
                                            <div className="border border-stone-200 bg-stone-50/80 rounded-xl p-4 space-y-4 animate-fadeIn">
                                                {/* Tab 1: Premium Stock Curation */}
                                                <div>
                                                    <span className="block text-[10px] font-extrabold text-[#936C31] uppercase tracking-wider mb-2 font-mono">
                                                        Premium Stock Jewelry Showcase Gallery
                                                    </span>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                                                        {[
                                                            {
                                                                title: 'Gold Necklace Campaign',
                                                                url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'
                                                            },
                                                            {
                                                                title: 'Elegant Rings Collection',
                                                                url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop'
                                                            },
                                                            {
                                                                title: 'Bridal Bangles Duo',
                                                                url: 'https://images.unsplash.com/photo-1611085583191-a3b1a30a5a41?q=80&w=800&auto=format&fit=crop'
                                                            },
                                                            {
                                                                title: 'Pure Gold Bullion',
                                                                url: 'https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?q=80&w=800&auto=format&fit=crop'
                                                            },
                                                            {
                                                                title: 'Diamond Sparkle Layout',
                                                                url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=800&auto=format&fit=crop'
                                                            },
                                                            {
                                                                title: 'Antique Golden Jhumkas',
                                                                url: 'https://images.unsplash.com/photo-1635767790038-345a77dd90ac?q=80&w=800&auto=format&fit=crop'
                                                            }
                                                        ].map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                onClick={() => setPromoImg(item.url)}
                                                                className={`group relative aspect-[1.5/1] rounded-lg overflow-hidden border bg-white cursor-pointer transition-all hover:scale-105 ${promoImg === item.url ? 'border-[#936C31] ring-2 ring-[#D4AF37]/30 shadow-xs' : 'border-stone-200'
                                                                    }`}
                                                            >
                                                                <img src={item.url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[8px] text-white truncate text-center font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {item.title}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Tab 2: Inventory Products Gallery */}
                                                {products && products.length > 0 && (
                                                    <div className="border-t border-stone-200/60 pt-3">
                                                        <span className="block text-[10px] font-extrabold text-[#936C31] uppercase tracking-wider mb-2 font-mono">
                                                            Or Pick from Current Shop Inventory Items ({products.length})
                                                        </span>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
                                                            {products.map((prod) => {
                                                                const imgUrl = prod.image_urls?.[0];
                                                                if (!imgUrl) return null;
                                                                return (
                                                                    <div
                                                                        key={prod.id}
                                                                        onClick={() => setPromoImg(imgUrl)}
                                                                        className={`group relative aspect-square rounded-lg overflow-hidden border bg-white cursor-pointer transition-all hover:scale-105 ${promoImg === imgUrl ? 'border-[#936C31] ring-2 ring-[#D4AF37]/30 shadow-xs' : 'border-stone-200'
                                                                            }`}
                                                                        title={prod.name}
                                                                    >
                                                                        <img src={imgUrl} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[7px] text-white truncate text-center font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {prod.name}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-between">
                                    <label className="relative flex items-center gap-2.5 cursor-pointer text-xs font-bold text-stone-700">
                                        <input
                                            type="checkbox"
                                            checked={promoActive}
                                            onChange={(e) => setPromoActive(e.target.checked)}
                                            className="h-4 w-4 rounded-md border-stone-300 text-amber-600 focus:ring-amber-500"
                                        />
                                        Mark Promotional Banner Active
                                    </label>

                                    <div className="flex items-center gap-3">
                                        {promoOffer && (promoOffer.is_active || promoName) && (
                                            <button
                                                type="button"
                                                onClick={handleRemovePromo}
                                                disabled={isSavingPromo}
                                                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                                                title="Remove and deactivate this promotional offer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Remove Offer
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={isSavingPromo}
                                            className="flex items-center gap-1.5 rounded-xl bg-stone-900 text-white px-6 py-2.5 text-xs font-bold transition-all hover:bg-stone-850 cursor-pointer"
                                        >
                                            <Megaphone className="h-4 w-4" />
                                            {isSavingPromo ? 'Writing offer details...' : 'Publish Promotional Offer Campaign'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: BACK-IN-STOCK NOTIFICATIONS WORKSPACE */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            {/* Main Info Card */}
                            <div className="rounded-2xl bg-white p-6 border border-stone-200 shadow-sm space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                                            <Bell className="h-5 w-5 text-[#936C31]" />
                                            Back-In-Stock Alert Dashboard
                                        </h3>
                                        <p className="text-xs text-stone-500 mt-1">
                                            Manage priorities, audit customer registrations, and review automated email alerts sent when items come back in stock.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={fetchNotificationsAndLogs}
                                        disabled={isLoadingNotifs}
                                        className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                                    >
                                        <RefreshCw className={`h-3.5 w-3.5 ${isLoadingNotifs ? 'animate-spin text-[#936C31]' : ''}`} />
                                        Refresh Logs
                                    </button>
                                </div>

                                {/* Sub Tab selection inside notifications */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                                    {/* Left Column: Registered Alerts Feed */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-[#936C31] font-mono uppercase tracking-widest font-bold">
                                            Customer Priority Queue ({notifications.length})
                                        </p>

                                        {notifications.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-400">
                                                <Bell className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                                                <span className="text-xs font-semibold">No active stock registrations yet.</span>
                                                <p className="text-[10px] text-stone-400 mt-1">When customers subscribe to out-of-stock items, they appear here.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                                                {[...notifications].reverse().map((notif) => {
                                                    const prod = products.find(p => p.id === notif.product_id);
                                                    return (
                                                        <div key={notif.id} className="rounded-xl border border-stone-200 p-3.5 bg-white space-y-2 shadow-xs">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-xs font-bold text-stone-850 block font-mono">{notif.email}</span>
                                                                    <span className="text-[9px] text-stone-400 font-mono">
                                                                        Subscribed: {new Date(notif.created_at).toLocaleString('en-IN', {
                                                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                                {notif.is_notified ? (
                                                                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700 font-mono flex items-center gap-0.5 shrink-0">
                                                                        <CheckCircle className="h-2.5 w-2.5" /> Notified
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] font-bold text-amber-700 font-mono flex items-center gap-0.5 shrink-0">
                                                                        <Clock className="h-2.5 w-2.5 animate-pulse" /> Pending Stock
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="border-t border-stone-100 pt-2 flex items-center gap-2.5">
                                                                <div className="h-10 w-10 rounded-lg overflow-hidden bg-stone-50 border border-stone-150 flex items-center justify-center p-1 shrink-0">
                                                                    {prod && prod.image_urls?.[0] ? (
                                                                        <img src={prod.image_urls[0]} alt="" className="h-full w-full object-cover rounded-md" referrerPolicy="no-referrer" />
                                                                    ) : (
                                                                        <ImageIcon className="h-4 w-4 text-stone-300" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <span className="block text-xs font-bold text-stone-800 truncate leading-snug">
                                                                        {prod ? prod.name : 'Unknown Product'}
                                                                    </span>
                                                                    <span className="block text-[9px] font-mono text-stone-400 truncate">
                                                                        SKU: {prod ? prod.SKU : 'N/A'} • {prod?.purity_type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column: Outgoing Email Log (Simulated) */}
                                    <div className="space-y-4">
                                        <p className="text-[10px] text-[#936C31] font-mono uppercase tracking-widest font-bold">
                                            Priority Dispatch Mailroom ({emailLogs.length})
                                        </p>

                                        {emailLogs.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-400">
                                                <Mail className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                                                <span className="text-xs font-semibold">No emails sent yet.</span>
                                                <p className="text-[10px] text-stone-400 mt-1">When an item restocks, automated email dispatches log here.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                                                {[...emailLogs].reverse().map((log) => {
                                                    return (
                                                        <div key={log.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
                                                            <div className="flex items-start justify-between gap-2 border-b border-stone-200 pb-2">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] text-stone-400 font-mono block">RECIPIENT</span>
                                                                    <span className="text-xs font-bold text-stone-800 font-mono break-all">{log.recipient_email}</span>
                                                                </div>
                                                                <span className="text-[9px] text-stone-400 font-mono shrink-0">
                                                                    Sent: {new Date(log.sent_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1">
                                                                <span className="text-[9px] text-stone-400 font-mono block">SUBJECT</span>
                                                                <span className="text-xs font-bold text-[#936C31] font-serif leading-snug">{log.subject}</span>
                                                            </div>

                                                            <details className="group border border-stone-200 rounded-lg bg-white overflow-hidden transition-all">
                                                                <summary className="flex items-center justify-between px-3 py-2 text-[10px] font-bold text-stone-600 uppercase font-mono cursor-pointer hover:bg-stone-50 transition-colors select-none">
                                                                    <span>View Dispatch Body</span>
                                                                    <span className="text-[#936C31] transition-transform duration-200 group-open:rotate-180">▼</span>
                                                                </summary>
                                                                <pre className="p-3 text-[10px] font-mono text-stone-600 bg-stone-50 border-t border-stone-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                                                    {log.body}
                                                                </pre>
                                                            </details>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
                {luxuryAlert && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs px-4 pointer-events-auto">
                        <div className="bg-[#0B0B0B] border border-[#D4AF37]/35 w-full max-w-sm p-6 text-center shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col items-center">
                            <div className="mb-4 h-12 w-12 rounded-full border border-[#D4AF37]/50 bg-[#121212] flex items-center justify-center">
                                {luxuryAlert.type === 'error' ? (
                                    <span className="text-rose-500 font-serif text-lg font-bold">!</span>
                                ) : (
                                    <span className="text-emerald-400 font-serif text-lg font-bold">✓</span>
                                )}
                            </div>
                            <h3 className="font-serif text-xs font-bold text-[#D4AF37] uppercase tracking-widest mb-2">
                                {luxuryAlert.type === 'error' ? 'System Warning' : 'Operation Success'}
                            </h3>
                            <p className="text-stone-300 text-xs leading-relaxed font-serif italic mb-6">
                                {luxuryAlert.message}
                            </p>
                            <button
                                onClick={() => setLuxuryAlert(null)}
                                className="w-full bg-[#1A1A1A] hover:bg-[#D4AF37] hover:text-stone-950 border border-[#D4AF37]/40 text-stone-200 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-mono"
                            >
                                Acknowledge & Confirm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
