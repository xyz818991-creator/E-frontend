import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import ProductDetailModal from '../components/ProductDetailModal';
import {
  Search,
  SlidersHorizontal,
  ArrowLeft,
  ShoppingBag,
  Heart,
  Star,
  Eye,
  Grid,
  List,
  Filter,
  X,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Globe,
  Settings
} from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const IMITATION_CATEGORIES = [
  { id: 'all', name: 'All Pieces', slug: 'all' },
  { id: 'earrings', name: 'Earrings', slug: 'earrings' },
  { id: 'necklaces', name: 'Necklaces', slug: 'necklaces' },
  { id: 'necklace-sets', name: 'Necklace Sets', slug: 'necklace-sets' },
  { id: 'bangles', name: 'Bangles', slug: 'bangles' },
  { id: 'bracelets', name: 'Bracelets', slug: 'bracelets' },
  { id: 'rings', name: 'Rings', slug: 'rings' },
  { id: 'anklets', name: 'Anklets', slug: 'anklets' },
  { id: 'mangalsutra', name: 'Mangalsutra', slug: 'mangalsutra' },
  { id: 'bridal-jewellery', name: 'Bridal Jewellery', slug: 'bridal-jewellery' },
  { id: 'temple-jewellery', name: 'Temple Jewellery', slug: 'temple-jewellery' }
];

export default function ProductListing() {
  const { addToCart, clearCart, cartCount, toggleWishlist, isInWishlist, wishlistCount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang, t, translateCategory } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Core Data - strictly from Live Database
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(IMITATION_CATEGORIES);
  const { storeSettings, storeName } = useStore();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceBucket, setPriceBucket] = useState('all'); // all, under-15, 15-30, 30-50, above-50
  const [selectedJewelleryType, setSelectedJewelleryType] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('all');
  const [selectedColour, setSelectedColour] = useState('all');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0); // 0, 3.5, 4.0, 4.5
  const [minDiscount, setMinDiscount] = useState(0); // 0, 10, 15, 20

  // UI States
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity', 'price-low', 'price-high', 'newest', 'rating', 'discount'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Sync category param from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const catQuery = urlParams.get('category') || params.categorySlug;
    const searchParam = urlParams.get('search');

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (catQuery) {
      let normalized = catQuery.toLowerCase();
      if (normalized === 'neck') normalized = 'necklaces';
      if (normalized === 'ear') normalized = 'earrings';
      if (normalized === 'bang') normalized = 'bangles';
      if (normalized === 'ring') normalized = 'rings';
      if (normalized === 'belt' || normalized === 'waist-belt' || normalized === 'waist-belts' || normalized === 'vaddanam' || normalized === 'ottiyanam') {
        normalized = 'waist-belts';
      }
      if (normalized === 'bridal' || normalized === 'bridal-sets') {
        normalized = 'bridal-jewellery';
      }
      setSelectedCategory(normalized);
    }
  }, [location.search, params.categorySlug]);

  // Load from backend dynamically
  const loadData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        productService.getProducts(),
        categoryService.getCategories()
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value?.success && Array.isArray(prodRes.value.products)) {
        const dbProducts = prodRes.value.products.map((p) => ({
          ...p,
          selling_price: parseFloat(p.selling_price || p.price || 0),
          original_price: parseFloat(p.original_price || (p.selling_price || 0) * 1.15),
          image_url: p.image_url || p.images?.[0]?.image_url || p.category?.image_url || 'var(--i-neck)',
          jewellery_type: p.jewellery_type || p.collection_type || 'Temple Jewellery',
          material: p.material || '24k Antique Gold Plated',
          colour: p.colour || 'Antique Gold',
          occasion: p.occasion || 'Festive',
          in_stock: p.stock > 0,
          popularity: p.popularity || p.reviews_count || 90,
          rating: parseFloat(p.rating || 4.8),
          reviews_count: p.reviews_count || 65
        }));
        setProducts(dbProducts);
      }

      if (catRes.status === 'fulfilled' && catRes.value?.success && Array.isArray(catRes.value.categories) && catRes.value.categories.length > 0) {
        const dbCats = catRes.value.categories.map((c) => ({
          id: c.slug || c.id.toString(),
          name: c.name,
          slug: c.slug || c.id.toString(),
          img: c.image_url || 'var(--i-neck)',
          tag: 'Collection'
        }));
        setCategories(dbCats);
      }
    } catch (e) {
      console.warn('API fetch notice:', e.message);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorageSync = (e) => {
      if (e.key === 'tee_catalog_version') {
        loadData();
      }
    };
    window.addEventListener('products_updated', loadData);
    window.addEventListener('categories_updated', loadData);
    window.addEventListener('catalog_updated', loadData);
    window.addEventListener('storage', handleStorageSync);

    return () => {
      window.removeEventListener('products_updated', loadData);
      window.removeEventListener('categories_updated', loadData);
      window.removeEventListener('catalog_updated', loadData);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [loadData]);

  // E-Commerce User Navigation & Action Flow
  const handleProtectedAction = (product, action = 'view') => {
    if (action === 'wishlist') {
      if (!isAuthenticated) {
        showToast('Please sign in to save items to your wishlist.');
        setTimeout(() => navigate('/login'), 600);
        return;
      }
      toggleWishlist(product);
      showToast(isInWishlist(product.id) ? 'Removed from Wishlist' : 'Saved to Wishlist!');
    } else if (action === 'cart') {
      addToCart(product, 1);
      showToast(`${product.name} added to your bag`);
    } else if (action === 'buynow') {
      const checkoutItem = {
        ...product,
        price: product.selling_price || product.price
      };
      sessionStorage.setItem('tee_buy_now_item', JSON.stringify({ ...checkoutItem, quantity: 1 }));
      if (!isAuthenticated) {
        showToast('Please sign in to proceed with Buy Now.');
        sessionStorage.setItem('tee_login_redirect', '/buy-now');
        navigate('/login', { state: { returnUrl: '/buy-now' } });
        return;
      }
      navigate('/buy-now', { state: { product: checkoutItem, quantity: 1 } });
    } else if (action === 'quickview') {
      setSelectedProduct(product);
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceBucket('all');
    setSelectedJewelleryType('all');
    setSelectedMaterial('all');
    setSelectedColour('all');
    setSelectedOccasion('all');
    setInStockOnly(false);
    setMinRating(0);
    setMinDiscount(0);
    setSortBy('popularity');
  };

  // Filter Logic
  const filtered = products.filter((p) => {
    const catName = (p.category?.name || '').toLowerCase();
    const catSlug = (p.category?.slug || '').toLowerCase();
    const targetCat = selectedCategory.toLowerCase();

    // Strict Category Isolation: Each category shows ONLY its dedicated items
    const matchesCategory = (() => {
      if (targetCat === 'all' || !targetCat) return true;

      // Match by exact Category ID or exact Slug
      if (p.category_id?.toString() === targetCat) return true;
      if (catSlug === targetCat) return true;
      if (catName === targetCat) return true;

      // 1. Earrings Collection
      if (targetCat === 'earrings' || targetCat === 'ear') {
        return catSlug === 'earrings' || catName.includes('earring') || catName.includes('jhumka') || catName.includes('stud');
      }

      // 2. Rings Collection (MUST explicitly exclude earrings/jhumkas)
      if (targetCat === 'rings' || targetCat === 'ring') {
        const isEarring = catSlug === 'earrings' || catName.includes('earring') || catName.includes('jhumka') || catName.includes('stud');
        if (isEarring) return false;
        return catSlug === 'rings' || catName === 'rings' || catName.includes('finger ring') || catName.includes('cocktail ring');
      }

      // 3. Necklaces Collection (excludes necklace sets)
      if (targetCat === 'necklaces' || targetCat === 'neck') {
        return (catSlug === 'necklaces' || catName.includes('necklace') || catName.includes('choker') || catName.includes('mala')) && catSlug !== 'necklace-sets';
      }

      // 4. Necklace Sets Collection
      if (targetCat === 'necklace-sets') {
        return catSlug === 'necklace-sets' || catName.includes('necklace set');
      }

      // 5. Bangles Collection (excludes bracelets)
      if (targetCat === 'bangles' || targetCat === 'bang') {
        return (catSlug === 'bangles' || catName.includes('bangle') || catName.includes('valayal') || catName.includes('kada')) && catSlug !== 'bracelets';
      }

      // 6. Bracelets Collection
      if (targetCat === 'bracelets') {
        return catSlug === 'bracelets' || catName.includes('bracelet');
      }

      // 7. Anklets / Payal
      if (targetCat === 'anklets' || targetCat === 'payal') {
        return catSlug === 'anklets' || catName.includes('anklet') || catName.includes('payal');
      }

      // 8. Mangalsutra
      if (targetCat === 'mangalsutra') {
        return catSlug === 'mangalsutra' || catName.includes('mangalsutra');
      }

      // 9. Waist Belts / Vaddanam (BUG_008: strictly separated from bridal jewellery)
      if (targetCat === 'waist-belts' || targetCat === 'belt' || targetCat === 'vaddanam' || targetCat === 'ottiyanam') {
        return (
          catSlug === 'waist-belts' ||
          catSlug === 'belt' ||
          p.category_id === 15 ||
          catName.toLowerCase().includes('waist') ||
          catName.toLowerCase().includes('vaddanam') ||
          catName.toLowerCase().includes('ottiyanam') ||
          p.name.toLowerCase().includes('waist') ||
          p.name.toLowerCase().includes('vaddanam') ||
          p.name.toLowerCase().includes('ottiyanam') ||
          p.sku?.includes('BLT')
        );
      }

      // 9b. Bridal Jewellery (strictly only bridal jewellery items)
      if (targetCat === 'bridal-jewellery' || targetCat === 'bridal') {
        const isWaistBelt = (
          catSlug === 'waist-belts' ||
          catSlug === 'belt' ||
          p.category_id === 15 ||
          catName.toLowerCase().includes('waist') ||
          catName.toLowerCase().includes('vaddanam') ||
          catName.toLowerCase().includes('ottiyanam') ||
          p.name.toLowerCase().includes('waist') ||
          p.name.toLowerCase().includes('vaddanam') ||
          p.name.toLowerCase().includes('ottiyanam') ||
          p.sku?.includes('BLT')
        );
        if (isWaistBelt) return false;

        return (
          catSlug === 'bridal-jewellery' ||
          catSlug === 'bridal' ||
          p.category_id === 9 ||
          p.category?.slug === 'bridal-jewellery' ||
          p.category?.slug === 'bridal' ||
          catName.toLowerCase() === 'bridal jewellery' ||
          catName.toLowerCase() === 'bridal' ||
          p.jewellery_type === 'Bridal Jewellery'
        );
      }

      // 10. Temple Jewellery
      if (targetCat === 'temple-jewellery' || targetCat.includes('temple')) {
        return catSlug === 'temple-jewellery' || p.category_id === 10 || catName.includes('temple') || (p.jewellery_type && p.jewellery_type.toLowerCase().includes('temple')) || (p.collection_type && p.collection_type.toLowerCase().includes('temple')) || p.name.toLowerCase().includes('temple');
      }

      return catSlug === targetCat || catName === targetCat;
    })();

    // Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      catName.includes(q) ||
      (p.material && p.material.toLowerCase().includes(q)) ||
      (p.jewellery_type && p.jewellery_type.toLowerCase().includes(q));

    // Price Bucket
    const price = parseFloat(p.selling_price || p.price || 0);
    let matchesPrice = true;
    if (priceBucket === 'under-500') matchesPrice = price < 500;
    else if (priceBucket === '500-1000') matchesPrice = price >= 500 && price <= 1000;
    else if (priceBucket === '1000-2000') matchesPrice = price >= 1000 && price <= 2000;
    else if (priceBucket === '2000-5000') matchesPrice = price >= 2000 && price <= 5000;
    else if (priceBucket === '5000-15000') matchesPrice = price >= 5000 && price <= 15000;
    else if (priceBucket === 'above-15000') matchesPrice = price > 15000;
    else if (priceBucket === 'under-15') matchesPrice = price < 15000;
    else if (priceBucket === '15-30') matchesPrice = price >= 15000 && price <= 30000;
    else if (priceBucket === '30-50') matchesPrice = price > 30000 && price <= 50000;
    else if (priceBucket === 'above-50') matchesPrice = price > 50000;

    // Jewellery Type
    const matchesType =
      selectedJewelleryType === 'all' ||
      (p.jewellery_type && p.jewellery_type.toLowerCase().includes(selectedJewelleryType.toLowerCase()));

    // Material
    const matchesMaterial =
      selectedMaterial === 'all' ||
      (p.material && p.material.toLowerCase().includes(selectedMaterial.toLowerCase()));

    // Colour
    const matchesColour =
      selectedColour === 'all' ||
      (p.colour && p.colour.toLowerCase().includes(selectedColour.toLowerCase()));

    // Occasion
    const matchesOccasion =
      selectedOccasion === 'all' ||
      (p.occasion && p.occasion.toLowerCase().includes(selectedOccasion.toLowerCase()));

    // Stock
    const matchesStock = !inStockOnly || p.in_stock !== false;

    // Rating
    const rating = parseFloat(p.rating || 4.5);
    const matchesRating = minRating === 0 || rating >= minRating;

    // Discount
    const origPrice = parseFloat(p.original_price || price * 1.15);
    const discountPct = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : 0;
    const matchesDiscount = minDiscount === 0 || discountPct >= minDiscount;

    return (
      matchesCategory &&
      matchesSearch &&
      matchesPrice &&
      matchesType &&
      matchesMaterial &&
      matchesColour &&
      matchesOccasion &&
      matchesStock &&
      matchesRating &&
      matchesDiscount
    );
  });

  // Sort Logic
  const sorted = [...filtered].sort((a, b) => {
    const pa = parseFloat(a.selling_price || a.price || 0);
    const pb = parseFloat(b.selling_price || b.price || 0);
    const ra = parseFloat(a.rating || 4.5);
    const rb = parseFloat(b.rating || 4.5);
    const da = a.original_price ? (a.original_price - pa) / a.original_price : 0;
    const db = b.original_price ? (b.original_price - pb) / b.original_price : 0;

    if (sortBy === 'price-low') return pa - pb;
    if (sortBy === 'price-high') return pb - pa;
    if (sortBy === 'rating') return rb - ra;
    if (sortBy === 'discount') return db - da;
    if (sortBy === 'newest') return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
    return (b.popularity || 90) - (a.popularity || 90);
  });

  const categoryName =
    categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory)?.name ||
    (selectedCategory !== 'all' ? selectedCategory.replace('-', ' ') : 'All Pieces');

  // Count active filters
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (priceBucket !== 'all' ? 1 : 0) +
    (selectedJewelleryType !== 'all' ? 1 : 0) +
    (selectedMaterial !== 'all' ? 1 : 0) +
    (selectedColour !== 'all' ? 1 : 0) +
    (selectedOccasion !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (minDiscount > 0 ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Toast Notification */}
      <div className={`tst ${toastMessage ? 'on' : ''}`} style={{ display: toastMessage ? 'block' : 'none' }}>
        {toastMessage}
      </div>

      {/* Header */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link className="brand" to="/" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || t('heroSubtitle', 'Tradition, Beautifully Curated.')}</small>
          </span>
        </Link>
        <nav className="menu open" style={{ display: 'flex', alignItems: 'center' }}>
          <Link to="/">{t('home', 'Overview')}</Link>
          <span style={{ color: 'var(--gold2)', borderBottom: '2px solid var(--gold2)', paddingBottom: '4px' }}>
            {t('catalogue', 'Catalogue')}
          </span>
          <Link to="/wishlist">{t('wishlist', 'Wishlist')} ({wishlistCount})</Link>
          <Link to="/orders" style={{ whiteSpace: 'nowrap' }}>{t('myOrders', 'My Orders')}</Link>
          {isAuthenticated && <Link to="/settings">{t('settings', 'Settings')}</Link>}
          <Link to={isAuthenticated ? '/account' : '/login'}>
            {isAuthenticated ? user?.name : t('signIn', 'Sign In')}
          </Link>
        </nav>
        <div className="tools" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Quick Language Toggle */}
          {isAuthenticated && (
            <Link to="/settings" title={t('settings', 'Settings')} style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }}>
              <Settings size={18} />
            </Link>
          )}

          <Link to="/wishlist" style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center' }} title={t('wishlist', 'Wishlist')}>
            <Heart size={20} />
            {wishlistCount > 0 && <span id="cnt" style={{ background: '#f87171' }}>{wishlistCount}</span>}
          </Link>
          <Link to="/cart" style={{ position: 'relative', background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('bag', 'Bag')}>
            <ShoppingBag size={20} />
            <span id="cnt" style={{ marginLeft: '4px' }}>{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '28px 20px' }}>
        {/* Breadcrumb & Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}>
            <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,240,208,0.08)', border: '1px solid var(--line)', color: 'var(--gold2)', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', cursor: 'pointer', marginRight: '8px' }}><ArrowLeft size={13} /> {t('adminBack', 'Back')}</button><Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>{t('home', 'Home')}</Link>
            <span>/</span>
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>{t('catalogue', 'Catalogue')}</Link>
            <span>/</span>
            <span style={{ color: 'var(--gold2)' }}>{translateCategory(categoryName)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--gold2)', margin: '0 0 4px', textTransform: 'capitalize' }}>
                {translateCategory(categoryName)}
              </h1>
              <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>
                {`Showing ${sorted.length} handcrafted pieces · Authentic Heritage Collection`}
              </p>
            </div>

            {/* Quick Action Buttons on Mobile */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="gbtn"
              style={{ display: 'none', padding: '8px 16px', fontSize: '13px' }}
              id="filterToggleBtn"
            >
              <Filter size={14} /> {'Filters'} ({activeFiltersCount})
            </button>
          </div>
        </div>

        {/* Top Control Bar: Search + Sorting + Grid/List View */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(160deg, #320726, #200318)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '24px'
          }}
        >
          {/* Live Search */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', opacity: 0.7 }} />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Search necklace, earrings, kada, CZ, bridal...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '10px',
                background: 'rgba(255,240,208,0.06)',
                border: '1px solid var(--line)',
                color: '#fff',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', opacity: 0.6, cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls Right: Sort by + Grid/List View Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Sorting Dropdown & Price Filter Integration */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={14} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                  {t('sortBy', 'Sort By')}:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    background: '#24061d',
                    border: '1px solid var(--line)',
                    color: 'var(--cream)',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="popularity">{t('popularity', 'Popularity')}</option>
                  <option value="price-low">{t('priceLowHigh', 'Price: Low to High')}</option>
                  <option value="price-high">{t('priceHighLow', 'Price: High to Low')}</option>
                  <option value="newest">{t('newestFirst', 'Newest First')}</option>
                  <option value="rating">{t('customerRating', 'Customer Rating')}</option>
                  <option value="discount">{t('specialDiscount', 'Special Discount %')}</option>
                </select>
              </div>

              {/* Price Filter Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={14} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
                  Price:
                </span>
                <select
                  value={priceBucket}
                  onChange={(e) => setPriceBucket(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '10px',
                    background: '#24061d',
                    border: priceBucket !== 'all' ? '1px solid var(--gold2)' : '1px solid var(--line)',
                    color: priceBucket !== 'all' ? 'var(--gold2)' : 'var(--cream)',
                    fontSize: '13px',
                    fontWeight: priceBucket !== 'all' ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Prices</option>
                  <option value="under-500">Under ₹500</option>
                  <option value="500-1000">₹500 – ₹1,000</option>
                  <option value="1000-2000">₹1,000 – ₹2,000</option>
                  <option value="2000-5000">₹2,000 – ₹5,000</option>
                  <option value="5000-15000">₹5,000 – ₹15,000</option>
                  <option value="above-15000">Above ₹15,000</option>
                </select>
                {priceBucket !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setPriceBucket('all')}
                    title="Reset Price Filter"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid #f87171',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      color: '#f87171',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      padding: 0
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle: Grid vs List */}
            <div style={{ display: 'flex', background: 'rgba(255,240,208,0.05)', border: '1px solid var(--line)', borderRadius: '10px', padding: '3px' }}>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
                title="Grid View"
                style={{
                  background: viewMode === 'grid' ? 'var(--gold)' : 'transparent',
                  color: viewMode === 'grid' ? '#12020e' : 'var(--cream)',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                aria-label="List View"
                title="List View"
                style={{
                  background: viewMode === 'list' ? 'var(--gold)' : 'transparent',
                  color: viewMode === 'list' ? '#12020e' : 'var(--cream)',
                  border: 'none',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Horizontal Rail */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', scrollbarWidth: 'none' }}>
          <button
            onClick={() => {
              setSelectedCategory('all');
              navigate('/shop', { replace: true });
            }}
            style={{
              padding: '7px 18px',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              border: selectedCategory === 'all' ? '1px solid var(--gold2)' : '1px solid var(--line)',
              background: selectedCategory === 'all' ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(66,8,51,0.6))' : 'rgba(255,240,208,0.04)',
              color: selectedCategory === 'all' ? 'var(--gold2)' : 'var(--cream)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: selectedCategory === 'all' ? 600 : 400,
              transition: 'all 0.2s'
            }}
          >
            {'✨ All Pieces'}
          </button>
          {categories
            .filter((c) => c.slug !== 'all' && c.id !== 'all')
            .map((c) => {
              const isSelected = selectedCategory === (c.slug || c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    const targetSlug = c.slug || c.id;
                    setSelectedCategory(targetSlug);
                    navigate(`/category/${targetSlug}`, { replace: true });
                  }}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '999px',
                    whiteSpace: 'nowrap',
                    border: isSelected ? '1px solid var(--gold2)' : '1px solid var(--line)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(66,8,51,0.6))' : 'rgba(255,240,208,0.04)',
                    color: isSelected ? 'var(--gold2)' : 'var(--cream)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.2s'
                  }}
                >
                  {translateCategory(c.name)}
                </button>
              );
            })}
        </div>



        {/* Product Cards Container: GRID or LIST view */}
        <div style={{ width: '100%' }}>
            {sorted.length === 0 ? (
              <div
                style={{
                  background: 'linear-gradient(160deg, #27051e, #170213)',
                  border: '1px solid var(--line)',
                  borderRadius: '20px',
                  padding: '60px 24px',
                  textAlign: 'center'
                }}
              >
                <Filter size={48} style={{ color: 'var(--gold)', opacity: 0.4, marginBottom: '16px' }} />
                <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 8px' }}>
                  No Pieces Match Your Selected Filters
                </h3>
                <p style={{ opacity: 0.75, maxWidth: '400px', margin: '0 auto 24px', fontSize: '14px' }}>
                  Try resetting your price range, material, or style filters to explore our full collection.
                </p>
                <button onClick={handleClearFilters} className="gbtn">
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW: 5 CARDS PER ROW, CONTAINED BORDER-BOX IMAGES, ALIGNED BUTTONS */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: '16px',
                  minHeight: '300px'
                }}
                className="catalogue-grid"
              >
                {sorted.map((p) => {
                  const img = p.image_url || p.images?.[0]?.image_url;
                  const isCss = img && img.startsWith('var(');
                  const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                  const price = parseFloat(p.selling_price || p.price || 0);
                  const originalPrice = parseFloat(p.original_price || price * 1.15);
                  const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  const wishlisted = isInWishlist(p.id);

                  return (
                    <article
                      key={p.id}
                      onClick={() => handleProtectedAction(p, 'view')}
                      style={{
                        boxSizing: 'border-box',
                        background: 'linear-gradient(160deg, #27051e, #170213)',
                        border: '1px solid var(--line)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = 'var(--gold)';
                        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--line)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Heart Wishlist Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProtectedAction(p, 'wishlist');
                        }}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          zIndex: 2,
                          background: 'rgba(20,2,16,0.75)',
                          border: '1px solid var(--line)',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          color: wishlisted ? '#f87171' : 'var(--gold)'
                        }}
                        title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                      >
                        <Heart size={15} fill={wishlisted ? '#f87171' : 'none'} />
                      </button>

                      {/* Badge if available */}
                      {p.badge && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            zIndex: 2,
                            background: 'rgba(212,175,55,0.92)',
                            color: '#12020e',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '999px',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {p.badge}
                        </div>
                      )}

                      {/* Contained Square Image Box */}
                      <div
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                          backgroundColor: '#24061d',
                          position: 'relative',
                          borderBottom: '1px solid var(--line)'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: bg,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transition: 'transform 0.4s ease'
                          }}
                          role="img"
                          aria-label={p.name}
                        />
                      </div>

                      {/* Card Content with border box padding */}
                      <div
                        style={{
                          padding: '12px 14px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          justifyContent: 'space-between',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10.5px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
                              {p.category?.name || 'Imitation'}
                            </span>
                            <span style={{ fontSize: '10px', opacity: 0.6, color: 'var(--cream)' }}>
                              {p.material?.split(' ')[0] || 'Brass'}
                            </span>
                          </div>

                          <h3
                            style={{
                              fontFamily: 'var(--font-serif)',
                              fontWeight: 500,
                              fontSize: '15px',
                              lineHeight: 1.3,
                              color: 'var(--cream)',
                              margin: '0 0 6px',
                              minHeight: '38px',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {p.name}
                          </h3>

                          {/* Rating row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--gold)', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(34,197,94,0.15)', padding: '2px 5px', borderRadius: '4px', color: '#4ade80', fontWeight: 600 }}>
                              <span>{p.rating || 4.9}</span>
                              <Star size={10} fill="#4ade80" />
                            </div>
                            <span style={{ opacity: 0.6 }}>({p.reviews_count || 50}+)</span>
                          </div>
                        </div>

                        <div>
                          {/* Price Row */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold2)' }}>
                              {inr(price)}
                            </span>
                            {originalPrice > price && (
                              <span style={{ fontSize: '11px', textDecoration: 'line-through', opacity: 0.5 }}>
                                {inr(originalPrice)}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span style={{ fontSize: '10.5px', color: '#4ade80', fontWeight: 600, marginLeft: 'auto' }}>
                                Save {discountPct}%
                              </span>
                            )}
                          </div>

                          {/* Action Buttons: Add to Bag & Buy Now (bug_012) */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProtectedAction(p, 'cart');
                              }}
                              style={{
                                height: '38px',
                                borderRadius: '999px',
                                background: 'rgba(212,175,55,0.12)',
                                border: '1px solid var(--gold)',
                                color: 'var(--gold2)',
                                fontWeight: 600,
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                                padding: '0 8px',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--gold)';
                                e.currentTarget.style.color = '#12020e';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
                                e.currentTarget.style.color = 'var(--gold2)';
                              }}
                              title="Add to Bag"
                            >
                              <ShoppingBag size={13} />
                              <span>Add to Bag</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProtectedAction(p, 'buynow');
                              }}
                              style={{
                                height: '38px',
                                borderRadius: '999px',
                                background: 'linear-gradient(135deg, #d4af37, #996515)',
                                border: '1px solid var(--gold2)',
                                color: '#12020e',
                                fontWeight: 700,
                                fontSize: '11.5px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                padding: '0 8px',
                                boxSizing: 'border-box',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'none';
                              }}
                              title="Direct Checkout / Payment"
                            >
                              <span>⚡ Buy Now</span>
                            </button>
                          </div>

                          {/* View Details Link */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(p, 'view');
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              fontSize: '11.5px',
                              color: 'var(--gold)',
                              cursor: 'pointer',
                              padding: '2px 0',
                              opacity: 0.9,
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.9')}
                          >
                            <Eye size={12} />
                            <span>View Details →</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW (Flipkart Style Wide Cards) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {sorted.map((p) => {
                  const img = p.image_url || p.images?.[0]?.image_url;
                  const isCss = img && img.startsWith('var(');
                  const bg = isCss ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                  const price = parseFloat(p.selling_price || p.price || 0);
                  const originalPrice = parseFloat(p.original_price || price * 1.15);
                  const discountPct = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
                  const wishlisted = isInWishlist(p.id);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleProtectedAction(p, 'view')}
                      className="catalogue-list-card"
                      style={{
                        background: 'linear-gradient(160deg, #27051e, #170213)',
                        border: '1px solid var(--line)',
                        borderRadius: '20px',
                        padding: '20px',
                        display: 'grid',
                        gridTemplateColumns: '180px 1fr 220px',
                        gap: '24px',
                        alignItems: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 0.2s, border-color 0.2s'
                      }}
                    >
                      {/* Thumbnail with Wishlist & Badge */}
                      <div
                        style={{
                          width: '100%',
                          height: '180px',
                          borderRadius: '14px',
                          backgroundImage: bg,
                          backgroundColor: '#24061d',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px solid var(--line)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {p.badge && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: 'rgba(212,175,55,0.92)',
                              color: '#12020e',
                              fontSize: '9px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              zIndex: 2
                            }}
                          >
                            {p.badge}
                          </div>
                        )}

                        {/* Positioned Wishlist Heart on Image */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProtectedAction(p, 'wishlist');
                          }}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            zIndex: 2,
                            background: 'rgba(20,2,16,0.8)',
                            border: '1px solid var(--line)',
                            borderRadius: '50%',
                            width: '34px',
                            height: '34px',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            color: wishlisted ? '#f87171' : 'var(--gold)',
                            transition: 'all 0.2s'
                          }}
                          title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                          <Heart size={16} fill={wishlisted ? '#f87171' : 'none'} />
                        </button>
                      </div>

                      {/* Middle Details */}
                      <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '4px' }}>
                          {p.category?.name || 'Jewellery'} · {p.jewellery_type || 'Temple Imitation'}
                        </div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                          {p.name}
                        </h3>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(34,197,94,0.15)', padding: '2px 8px', borderRadius: '4px', color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>
                            <span>{p.rating || 4.9}</span>
                            <Star size={11} fill="#4ade80" />
                          </div>
                          <span style={{ fontSize: '12px', opacity: 0.6 }}>({p.reviews_count || 85} Customer Reviews)</span>
                        </div>

                        {/* Key Specs */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', opacity: 0.85, marginBottom: '8px' }}>
                          <span><b>Material:</b> {p.material || '24k Antique Gold Plated'}</span>
                          <span>•</span>
                          <span><b>Colour:</b> {p.colour || 'Antique Gold'}</span>
                          <span>•</span>
                          <span><b>Occasion:</b> {p.occasion || 'Bridal & Festive'}</span>
                        </div>

                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.7, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description}
                        </p>
                      </div>

                      {/* Right Price & Aligned Action Buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', borderLeft: '1px solid rgba(212,175,55,0.1)', paddingLeft: '20px', height: '100%', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--gold2)', textAlign: 'right' }}>
                            {inr(price)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', marginTop: '2px' }}>
                            {originalPrice > price && (
                              <span style={{ fontSize: '12px', textDecoration: 'line-through', opacity: 0.5 }}>
                                {inr(originalPrice)}
                              </span>
                            )}
                            {discountPct > 0 && (
                              <span style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>
                                Save {discountPct}% off
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Harmonized Action Buttons: Identical 38px height, 999px pill border-radius */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(p, 'cart');
                            }}
                            style={{
                              width: '100%',
                              height: '38px',
                              borderRadius: '999px',
                              background: 'rgba(212,175,55,0.12)',
                              border: '1px solid var(--gold)',
                              color: 'var(--gold2)',
                              fontWeight: 600,
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '0 16px',
                              boxSizing: 'border-box',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--gold)';
                              e.currentTarget.style.color = '#12020e';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(212,175,55,0.12)';
                              e.currentTarget.style.color = 'var(--gold2)';
                            }}
                            title="Add to Bag"
                          >
                            <ShoppingBag size={14} />
                            <span>Add to Bag</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProtectedAction(p, 'buynow');
                            }}
                            style={{
                              width: '100%',
                              height: '38px',
                              borderRadius: '999px',
                              background: 'linear-gradient(135deg, #d4af37, #996515)',
                              border: '1px solid var(--gold2)',
                              color: '#12020e',
                              fontWeight: 700,
                              fontSize: '12.5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '0 16px',
                              boxSizing: 'border-box',
                              transition: 'all 0.2s ease',
                              whiteSpace: 'nowrap'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                            onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                            title="Direct Checkout / Payment"
                          >
                            <span>⚡ Buy Now</span>
                          </button>
                        </div>

                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProtectedAction(p, 'view');
                          }}
                          style={{
                            marginTop: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: 'var(--gold)',
                            cursor: 'pointer',
                            opacity: 0.9
                          }}
                        >
                          <Eye size={13} />
                          <span>View Details →</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </main>

      {/* Modal Quick View */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onShowToast={showToast}
        />
      )}

      {/* Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName} · Luxury Imitation Jewellery.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'none', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/wishlist" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Wishlist</Link>
            <Link to="/cart" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Cart</Link>
            
          </div>
        </div>
      </footer>
    </div>
  );
}

