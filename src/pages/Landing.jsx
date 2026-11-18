import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Heart, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Globe, Settings, Star, CheckCircle2, MessageSquare, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { productService, categoryService, reviewService, settingsService, inquiryService, notificationService } from '../services/api';
import '../EthnicEdit.css';
import girlHeroImage from '../images/ethnic_edit_girl_image.jpg';

const WhatsAppIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    <path d="M9.5 9.5c.3.8 1.1 2 2.5 2.5.5.2 1.1.2 1.5-.2l.8-.8c.3-.3.8-.3 1.1 0l1.2 1.2c.3.3.3.8 0 1.1l-.8.8c-.8.8-2 .9-3.2.1-2.1-1.4-3.7-3-5.1-5.1-.8-1.2-.7-2.4.1-3.2l.8-.8c.3-.3.8-.3 1.1 0l1.2 1.2c.3.3.3.8 0 1.1l-.8.8c-.4.4-.4 1-.2 1.5z" fill={color} stroke="none" />
  </svg>
);

const InstagramIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const resolveSafeImage = (img, fallback = '/uploads/necklaces.png') => {
  if (!img) return `url("${fallback}")`;
  const str = String(img).trim();
  if (str.startsWith('var(')) return str;
  if (str.startsWith('--')) return `var(${str})`;
  return `url("${encodeURI(str)}")`;
};

const RAIL_COLLECTIONS = [
  { id: 'earrings', name: 'Earrings', c: 'Earrings', i: '/uploads/earring.png', slug: 'earrings' },
  { id: 'bangles', name: 'Bangles', c: 'Bangles', i: '/uploads/bangles.png', slug: 'bangles' },
  { id: 'rings', name: 'Rings', c: 'Rings', i: '/uploads/rings.png', slug: 'rings' },
  { id: 'waist-belts', name: 'Waist Belts', c: 'Waist Belts', i: '/uploads/waist belt.png', slug: 'waist-belts' },
  { id: 'temple-jewellery', name: 'Temple Jewellery', c: 'Temple Jewellery', i: '/uploads/necklaces.png', slug: 'temple-jewellery' },
  { id: 'necklaces', name: 'Necklaces', c: 'Necklaces', i: '/uploads/necklaces.png', slug: 'necklaces' }
];

export default function Landing() {
  const navigate = useNavigate();
  const { cartCount, wishlistCount, addToCart } = useCart();
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const { lang, setLang, t, translateCategory } = useLanguage();
  const { storeSettings, storeName } = useStore();

  // Interactive States
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroTouchStartX = useRef(0);
  const canvasRef = useRef(null);

  // Auth Modal State
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastActive, setToastActive] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

  // Dynamic Collections from Database (with instant cached fallback so no old images flash on refresh)
  const [railCollections, setRailCollections] = useState(() => {
    try {
      const cached = localStorage.getItem('tee_cached_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return RAIL_COLLECTIONS;
  });

  // Dynamic Products strictly from Database (No stale resurrected dummy items)
  const [shopProducts, setShopProducts] = useState([]);
  const newProducts = (shopProducts.filter((p) => p.is_new).length >= 2
    ? shopProducts.filter((p) => p.is_new)
    : shopProducts
  ).slice(0, 6);

  // Customer Reviews State (sorted newest first)
  const [reviews, setReviews] = useState([
    {
      id: 7,
      customer_name: 'Priya S.',
      location: 'Chennai, Tamil Nadu',
      rating: 5,
      product_name: 'Antique Gold Kada Bangles',
      comment: 'Good Quality'
    },
    {
      id: 6,
      customer_name: 'nivii',
      location: 'Chennai, Tamil Nadu',
      rating: 4,
      product_name: 'Gemstone Cocktail Ring',
      comment: 'nice'
    },
    {
      id: 5,
      customer_name: 'Meenakshi Iyer',
      location: 'Madurai, Tamil Nadu',
      rating: 5,
      product_name: 'Temple Waist Belt (Vaddanam)',
      comment: 'Wore this royal ottiyanam for my wedding muhurtham. The fit was easily adjustable and the antique gold patina looked divine in our bridal photographs.'
    },
    {
      id: 4,
      customer_name: 'Kavita Subramanian',
      location: 'Coimbatore, Tamil Nadu',
      rating: 5,
      product_name: 'Gemstone Cocktail Ring',
      comment: 'A showstopper piece! The ruby centerpiece catches candlelight majestically. Will definitely order the coordinated bridal set next.'
    },
    {
      id: 3,
      customer_name: 'Dr. Radhika Menon',
      location: 'Bengaluru, Karnataka',
      rating: 5,
      product_name: 'Antique Gold Kada Bangles',
      comment: 'The intricate kemp stone setting and delicate peacock carving are breathtaking. Outstanding customer support and luxurious satin packaging.'
    },
    {
      id: 2,
      customer_name: 'Ananya Deshmukh',
      location: 'South Mumbai',
      rating: 5,
      product_name: 'Pearl Jhumka Earrings',
      comment: 'Exceptional weight and genuine freshwater pearls. It looks virtually indistinguishable from heirloom 22k gold. Safe, insured shipping was flawless.'
    },
    {
      id: 1,
      customer_name: 'Priya Sundaram',
      location: 'Chennai, Tamil Nadu',
      rating: 5,
      product_name: 'Temple Lakshmi Necklace',
      comment: 'The antique 24K matte finish on this necklace is absolutely regal. Wore it for my daughter’s engagement and received endless praise. Truly ancestral jewellery craftsmanship.'
    }
  ]);
  const reviewRailRef = useRef(null);
  const newArrivalsRailRef = useRef(null);

  const scrollNewArrivalsRail = (offset) => {
    if (newArrivalsRailRef.current) {
      newArrivalsRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    reviewService.getReviews({ limit: 30 })
      .then((res) => {
        if (res.success && res.reviews && res.reviews.length > 0) {
          // Sort strictly newest first by id or createdAt
          const sorted = [...res.reviews].sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime();
            const timeB = new Date(b.createdAt || 0).getTime();
            if (timeB !== timeA) return timeB - timeA;
            return (b.id || 0) - (a.id || 0);
          });
          setReviews(sorted);
          setTimeout(() => {
            if (reviewRailRef.current) {
              reviewRailRef.current.scrollLeft = 0;
            }
          }, 60);
        }
      })
      .catch((err) => {
        console.warn('Reviews fetch notice:', err.message);
      });
  }, []);

  const scrollReviewRail = (offset) => {
    if (reviewRailRef.current) {
      reviewRailRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const loadCategories = useCallback(() => {
    categoryService.getCategories()
      .then((res) => {
        if (res.success && Array.isArray(res.categories) && res.categories.length > 0) {
          const mappedCats = res.categories.map((c) => ({
            id: c.slug || c.id.toString(),
            name: c.name,
            c: c.name,
            i: c.image_url || '/uploads/necklaces.png',
            slug: c.slug || c.id.toString()
          }));
          setRailCollections(mappedCats);
          try {
            localStorage.setItem('tee_cached_categories', JSON.stringify(mappedCats));
          } catch (e) {}
        }
      })
      .catch(() => { });
  }, []);

  const loadProducts = useCallback(() => {
    productService.getProducts({ limit: 100 })
      .then((res) => {
        if (res.success && Array.isArray(res.products)) {
          const mapped = res.products.map((p) => {
            const primaryImg = p.image_url || p.images?.[0]?.image_url || p.category?.image_url || '/uploads/necklaces.png';
            return {
              id: p.id,
              name: p.name,
              c: p.category?.name || 'Jewellery',
              category: p.category?.name || 'Jewellery',
              price: p.selling_price || p.price,
              i: primaryImg,
              image_url: primaryImg,
              images: p.images || [],
              slug: p.category?.slug || 'necklaces',
              is_new: !!p.is_new || (Date.now() - new Date(p.createdAt || 0).getTime() < 30 * 86400000),
              createdAt: p.createdAt
            };
          });
          setShopProducts(mapped);
        }
      })
      .catch((err) => {
        console.warn('Backend products fetch notice:', err.message);
      });
  }, []);

  useEffect(() => {
    loadCategories();
    loadProducts();

    const handleStorageSync = (e) => {
      if (e.key === 'tee_catalog_version') {
        loadProducts();
        loadCategories();
      }
    };
    window.addEventListener('products_updated', loadProducts);
    window.addEventListener('categories_updated', loadCategories);
    window.addEventListener('banners_updated', loadProducts);
    window.addEventListener('catalog_updated', loadProducts);
    window.addEventListener('storage', handleStorageSync);

    return () => {
      window.removeEventListener('products_updated', loadProducts);
      window.removeEventListener('categories_updated', loadCategories);
      window.removeEventListener('banners_updated', loadProducts);
      window.removeEventListener('catalog_updated', loadProducts);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, [loadCategories, loadProducts]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setToastActive(true);
    setTimeout(() => setToastActive(false), 2600);
  };

  // User Navigation Flow: Guests can browse public catalogue, categories & products freely.
  // Only personal account and checkout actions require authentication.
  const handleProtectedNavigation = (targetUrl) => {
    // In-page anchor navigation on the landing page
    if (targetUrl.startsWith('#')) {
      const el = document.querySelector(targetUrl);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Without login, visitors have permission to view ONLY the landing page (/)
    if (!isAuthenticated) {
      sessionStorage.setItem('tee_login_redirect', targetUrl || '/');
      navigate('/login');
      return;
    }

    navigate(targetUrl);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price || product.selling_price || 0,
      image_url: product.i || product.image_url || '/uploads/necklaces.png',
      quantity: 1
    }, 1);
    showToast(`${product.name} added to your bag!`);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.elements.n.value;
    const email = form.elements.e.value;
    const message = form.elements.m.value;

    setContactError('');
    try {
      await inquiryService.submitInquiry({ name, email, message });
      form.reset();
      setContactSuccess(true);
      // Success message is displayed strictly inside the contact section form - NOT in the navigation bar!
      setTimeout(() => setContactSuccess(false), 9000);
    } catch (err) {
      console.error('Contact submission error:', err);
      setContactError('Error sending message. Please try again.');
      setTimeout(() => setContactError(''), 7000);
    }
  };

  const getWhatsAppUrl = () => {
    const raw = storeSettings.whatsapp_phone || storeSettings.contact_phone || '9876543210';
    let digits = String(raw).replace(/\D/g, '');
    if (digits.length === 10) digits = '91' + digits;
    const msg = encodeURIComponent(`Hello! I am reaching out to ${storeName} regarding your luxury heirloom jewellery collections.`);
    return `https://wa.me/${digits}?text=${msg}`;
  };

  const getInstagramUrl = () => {
    const custom = storeSettings.instagram_url || storeSettings.instagram_handle;
    if (custom) {
      if (String(custom).startsWith('http')) return custom;
      return `https://www.instagram.com/${String(custom).replace('@', '')}`;
    }
    return 'https://www.instagram.com/mugilan_o7';
  };

  const handleSocialClick = async (platform) => {
    try {
      await notificationService.recordSocialClick(platform);
    } catch (err) {
      console.warn('Failed to record social click:', err);
    }
  };

  const closeAll = useCallback(() => {
    setIsAccountOpen(false);
  }, []);

  // Scroll Header Shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section Observer
  useEffect(() => {
    const secs = ['home', 'collections', 'shop', 'about', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    secs.forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  // Reveal Animation Observer
  useEffect(() => {
    const rv = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            rv.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.rv').forEach((el) => rv.observe(el));
    return () => rv.disconnect();
  }, [shopProducts, railCollections, reviews]);

  // Hero Navigation
  const goToSlide = useCallback((index) => {
    setCurrentSlide((index + 3) % 3);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) goToSlide(currentSlide + 1);
    }, 6500);
    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  // Collections Rail Drag / Auto-scroll
  const railRef = useRef(null);
  const railState = useRef({ pos: 0, hold: 0, inside: false, drag: false, dx: 0, ds: 0, moved: 0 });

  const scrollRail = (delta) => {
    railState.current.hold = Date.now() + 2500;
    if (railRef.current) railRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const state = railState.current;

    const onPointerEnter = (e) => {
      if (e.pointerType === 'mouse') state.inside = true;
    };
    const onPointerLeave = () => {
      state.inside = false;
    };
    const onHold = () => {
      state.hold = Date.now() + 3500;
    };
    const onPointerDown = (e) => {
      if (e.pointerType === 'mouse') {
        state.drag = true;
        state.moved = 0;
        state.dx = e.clientX;
        state.ds = rail.scrollLeft;
        state.hold = Date.now() + 3500;
      }
    };
    const onPointerMove = (e) => {
      if (state.drag) {
        state.moved = Math.abs(e.clientX - state.dx);
        rail.scrollLeft = state.ds - (e.clientX - state.dx);
      }
    };
    const onPointerUp = () => {
      state.drag = false;
      state.hold = Date.now() + 2500;
    };

    rail.addEventListener('pointerenter', onPointerEnter);
    rail.addEventListener('pointerleave', onPointerLeave);
    rail.addEventListener('touchstart', onHold, { passive: true });
    rail.addEventListener('wheel', onHold, { passive: true });
    rail.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    let rafId;
    const loop = () => {
      const half = rail.scrollWidth / 2;
      const busy = state.inside || state.drag || Date.now() < state.hold || document.hidden;
      if (half > 0) {
        if (busy) {
          state.pos = rail.scrollLeft;
        } else {
          if (!state.pos) state.pos = half / 3;
          state.pos += 0.55;
          if (state.pos >= half) state.pos -= half;
          rail.scrollLeft = state.pos;
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      rail.removeEventListener('pointerenter', onPointerEnter);
      rail.removeEventListener('pointerleave', onPointerLeave);
      rail.removeEventListener('touchstart', onHold);
      rail.removeEventListener('wheel', onHold);
      rail.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Gold Particle Canvas
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    if (!cx) return;
    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pts = [];

    const sz = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sz();
    window.addEventListener('resize', sz);

    for (let i = 0; i < (window.innerWidth < 700 ? 22 : 46); i++) {
      pts.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.8 + Math.random() * 2,
        s: 0.00004 + Math.random() * 0.00012,
        p: Math.random() * 6.28
      });
    }

    let rafId;
    const fx = (t) => {
      cx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.y -= p.s * 16;
        p.x += Math.sin(t * 0.0004 + p.p) * 0.00012;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        const a = 0.25 + 0.55 * Math.abs(Math.sin(t * 0.0012 + p.p));
        cx.beginPath();
        cx.fillStyle = `rgba(255,214,130,${a})`;
        cx.shadowColor = 'rgba(255,200,100,.9)';
        cx.shadowBlur = 8;
        cx.arc(p.x * W, p.y * H, p.r, 0, 6.283);
        cx.fill();
      });
      rafId = requestAnimationFrame(fx);
    };
    rafId = requestAnimationFrame(fx);

    return () => {
      window.removeEventListener('resize', sz);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') {
        const res = await login(authForm.email, authForm.password);
        if (res.success) {
          setIsAccountOpen(false);
          if (res.user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
            return;
          }
          showToast(`Welcome, ${res.user.name}!`);
          navigate('/');
        }
      } else {
        const res = await register(authForm);
        if (res.success) {
          setIsAccountOpen(false);
          showToast(`Welcome, ${res.user.name}!`);
          navigate('/');
        }
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const railItems = [...railCollections, ...railCollections];

  return (
    <>
      <canvas id="fx" ref={canvasRef} aria-hidden="true"></canvas>

      {/* Toast Notification */}
      <div className={`tst ${toastActive ? 'on' : ''}`}>
        {toastMessage}
      </div>

      {/* Header */}
      <header className={`nav ${isScrolled ? 'sc' : ''}`} id="nav">
        <a className="brand" href="#home" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || t('heroSubtitle', 'Tradition, Beautifully Curated.')}</small>
          </span>
        </a>

        <nav className={`menu ${isMenuOpen ? 'open' : ''}`} id="menu" aria-label="Main">
          <a
            href="#home"
            className={activeSection === 'home' ? 'on' : ''}
            onClick={() => setIsMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              padding: '6px 8px',
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {t('home', 'Home')}
          </a>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleProtectedNavigation('#collections');
            }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              padding: '6px 8px',
              color: 'inherit',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {t('collections', 'Collections')}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleProtectedNavigation('/shop');
            }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              padding: '6px 8px',
              color: 'inherit',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {t('catalogue', 'Catalogue')}
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              handleProtectedNavigation('/orders');
            }}
            className="nav-orders-link"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              padding: '6px 8px',
              color: 'inherit',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {t('myOrders', 'My Orders')}
          </button>
          <a
            href="#about"
            className={`nav-about-link ${activeSection === 'about' ? 'on' : ''}`}
            onClick={() => setIsMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              padding: '6px 8px',
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {t('about', 'About')}
          </a>
          <a
            href="#contact"
            className={`nav-contact-link ${activeSection === 'contact' ? 'on' : ''}`}
            onClick={() => setIsMenuOpen(false)}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14.5px',
              fontWeight: 500,
              padding: '6px 8px',
              color: 'inherit',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {t('contact', 'Contact')}
          </a>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              if (isAuthenticated) {
                navigate('/account');
              } else {
                navigate('/login');
              }
            }}
            className="mo"
            id="mA"
            style={{ background: 'none', border: 'none', color: 'var(--gold2)', cursor: 'pointer', font: 'inherit', textAlign: 'left', padding: '12px 0' }}
          >
            {isAuthenticated ? user.name : t('signIn', 'Sign In / Register')}
          </button>
        </nav>

        <div className="tools">
          {/* Header Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                handleProtectedNavigation(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,240,208,0.06)',
              border: '1px solid var(--line)',
              borderRadius: '999px',
              padding: '6px 14px',
              gap: '6px'
            }}
          >
            <Search size={14} style={{ color: 'var(--gold)', opacity: 0.8 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={'Search jewellery...'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--cream)',
                fontSize: '12.5px',
                width: 'clamp(70px, 10vw, 130px)',
                outline: 'none',
                fontFamily: 'var(--font-sans)'
              }}
            />
          </form>

          {isAuthenticated && (
            <button
              onClick={() => navigate('/settings')}
              title={t('settings', 'Settings')}
              style={{ color: 'var(--gold)', padding: '6px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Settings size={18} />
            </button>
          )}

          <button
            id="bW"
            aria-label="Wishlist"
            onClick={() => handleProtectedNavigation('/wishlist')}
            style={{ color: 'var(--gold)', padding: '6px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            title={t('wishlist', 'Wishlist')}
          >
            <Heart size={20} />
            {wishlistCount > 0 && <span id="cnt" style={{ background: '#f87171' }}>{wishlistCount}</span>}
          </button>
          <button
            id="bA"
            aria-label="Account"
            onClick={() => {
              if (isAuthenticated) {
                navigate('/account');
              } else {
                navigate('/login');
              }
            }}
            title={isAuthenticated ? `${t('adminLoggedInAs', 'Signed in as')} ${user?.name}` : t('signIn', 'Sign In')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0" />
            </svg>
          </button>
          <button
            id="bB"
            aria-label="Bag"
            onClick={() => handleProtectedNavigation('/cart')}
            style={{ color: '#fff', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            title={t('bag', 'Bag')}
          >
            <ShoppingBag size={20} />
            <span id="cnt">{cartCount}</span>
          </button>
          <button
            id="burger"
            aria-label="Menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section
          className="hero"
          id="home"
          aria-roledescription="carousel"
          aria-label="Featured"
        >
          {/* Slide 1 - Iconic Model */}
          <div className={`slide ${currentSlide === 0 ? 'on' : ''}`}>
            <div className="vis" style={{ backgroundImage: `url(${girlHeroImage})`, backgroundPosition: 'center 15%', backgroundSize: 'cover' }}></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>{storeName}</div>
              <h1 style={{ '--k': 1 }}>
                {<>Tradition,<br /><em>Beautifully</em> Curated.</>}
              </h1>
              <p style={{ '--k': 2 }}>{t('heroSubtitle', 'Timeless jewellery for every celebration, crafted with elegance.')}</p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  className="gbtn"
                  style={{ '--k': 3 }}
                  onClick={() => handleProtectedNavigation('/shop')}
                >
                  {'Explore Collection'} <span>→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide 2 - Chest (Matching Image 2 Reference) */}
          <div className={`slide ${currentSlide === 1 ? 'on' : ''}`}>
            <div
              className="vis"
              style={{
                backgroundImage: "url('/uploads/banners/media_1794480336661_3a36f2df_vge71a.jpg')",
                right: 0,
                left: 'auto',
                width: '65%',
                backgroundPosition: 'center right',
                backgroundSize: 'cover'
              }}
            ></div>
            <div className="tx">
              <div className="kick" style={{ '--k': 0 }}>{'Celebrate Tradition'}</div>
              <h1 style={{ '--k': 1 }}><em>{t('inEveryDetail', 'In Every Detail.')}</em></h1>
              <p style={{ '--k': 2 }}>{t('inEveryDetailSub', 'Discover the perfect piece for your special moments.')}</p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="gbtn"
                  style={{ '--k': 3 }}
                  onClick={() => {
                    const el = document.getElementById('collections') || document.getElementById('new-arrivals') || document.querySelector('.fg') || document.querySelector('.edit');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollBy({ top: 650, behavior: 'smooth' });
                    }
                  }}
                >
                  {t('exploreMore', 'Explore More')} <span>↓</span>
                </button>
              </div>
            </div>
          </div>

          {/* Slide 3 - Heirloom Collections (Full Set Banner) */}
          <div className={`slide ${currentSlide === 2 ? 'on' : ''}`} style={{ backgroundColor: '#26051d' }}>
            <div
              className="vis"
              style={{
                backgroundImage: "url('/uploads/banners/media_1794389397936_07d825de_hftkyk.jpg')",
                right: 0,
                left: 'auto',
                width: '68%',
                backgroundPosition: 'center right',
                backgroundSize: 'cover',
                backgroundColor: '#26051d'
              }}
            ></div>
            <div
              className="tx"
              style={{
                position: 'relative',
                zIndex: 3,
                maxWidth: 'min(500px, 42vw)',
                textShadow: '0 2px 24px rgba(18,2,14,0.95), 0 4px 40px rgba(0,0,0,0.95)'
              }}
            >
              <div className="kick" style={{ '--k': 0 }}>{'Heirloom Collections'}</div>
              <h1 style={{ '--k': 1 }}>{<>Crafted with <em>elegance.</em></>}</h1>
              <p style={{ '--k': 2 }}>{'From necklaces to waist belts, find the piece that tells your story.'}</p>
            </div>
          </div>

          <div className="ctl">
            <button className="ar" id="pv" aria-label="Previous slide" onClick={() => goToSlide(currentSlide - 1)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
            </button>
            <div id="dots">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={currentSlide === i ? 'on' : ''}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goToSlide(i)}
                ></button>
              ))}
            </div>
            <button className="ar" id="nx" aria-label="Next slide" onClick={() => goToSlide(currentSlide + 1)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="trust">
          <div>
            <svg className="i" viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" /><path d="M2 9h20M9 3l3 6 3-6M12 21 9 9m3 12 3-12" /></svg>
            <span>{<>Pure Gold &amp; Jewels<br />Quality Assured</>}</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></svg>
            <span>{<>Secure<br />Payments</>}</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24"><path d="M2 6h11v10H2zM13 9h5l3 3v4h-8" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>
            <span>{<>Fast &amp; Reliable<br />Delivery</>}</span>
          </div>
          <div>
            <svg className="i" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" /><path d="M5 12v9h14v-9M12 8v13M12 8c-3 0-5-4-2-4 2 0 2 4 2 4zm0 0c3 0 5-4 2-4-2 0-2 4-2 4z" /></svg>
            <span>{<>Expert Sizing<br />Advice</>}</span>
          </div>
        </div>

        {/* Our Collections Rail Section */}
        <section className="sec" id="collections" style={{ paddingInline: 0 }}>
          <div className="hd rv">
            <h2>{t('ourCollections', 'Our Collections')}</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              {t('ourCollectionsSub', 'Every unique piece in our heritage')}
            </p>
          </div>
          <div className="rail" id="rail" ref={railRef} tabIndex={0} aria-label="Collections">
            {railItems.map((cat, idx) => {
              const bg = resolveSafeImage(cat.i, '/uploads/necklaces.png');
              return (
                <div
                  className="cc"
                  key={idx}
                  onClick={(e) => {
                    if (railState.current.moved > 6) {
                      e.preventDefault();
                      railState.current.moved = 0;
                      return;
                    }
                    handleProtectedNavigation(`/category/${cat.slug}`);
                  }}
                  style={{ cursor: 'pointer' }}
                  title={`View all ${cat.name}`}
                >
                  <div className="ph" style={{ backgroundImage: bg, backgroundPosition: 'center', backgroundColor: '#24061d' }}></div>
                  <span>{translateCategory(cat.c || cat.name)} →</span>
                </div>
              );
            })}
          </div>
          <div className="railbar">
            <button className="ar" id="rp" aria-label="Scroll left" style={{ display: 'grid' }} onClick={() => scrollRail(-300)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 5-7 7 7 7" /></svg>
            </button>
            <button className="ar" id="rn" aria-label="Scroll right" style={{ display: 'grid' }} onClick={() => scrollRail(300)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* New Products Section - Newly Added Pieces by Admin (Arched rail matching collections) */}
        <section className="sec" id="new-products" style={{ paddingTop: 0 }}>
          <div className="hd rv">
            <div className="kick" style={{ justifyContent: 'center' }}>
              {t('newArrivals', 'New Arrivals')}
            </div>
            <h2>{t('newProducts', 'New Products')}</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              {t('newProductsSub', 'Recently handcrafted heirloom pieces, fresh from our master artisans.')}
            </p>
          </div>
          <div className="rail" ref={newArrivalsRailRef}>
            {newProducts.map((p) => {
              const imgBg = resolveSafeImage(p.i, '/uploads/necklaces.png');
              return (
                <article
                  className="cc rv"
                  key={`new-${p.id}`}
                  onClick={() => handleProtectedNavigation(`/product/${p.id}`)}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                >
                  <div
                    className="ph"
                    style={{ backgroundImage: imgBg, position: 'relative' }}
                    role="img"
                    aria-label={p.name}
                  >
                    <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 2, background: 'linear-gradient(135deg, #f6dda0, #d4af37)', color: '#1a0418', fontSize: '10px', fontWeight: '700', padding: '3px 12px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.12em', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                      {'✨ New'}
                    </div>
                  </div>
                  <span style={{ display: 'block', marginTop: '14px', font: '500 clamp(17px, 1.6vw, 20px) var(--font-serif)', color: 'var(--gold2)' }}>
                    {p.name} →
                  </span>
                  <div style={{ marginTop: '4px', font: '600 clamp(14px, 1.1vw, 16px) var(--font-sans)', color: 'var(--gold)' }}>
                    {inr(p.price || p.selling_price)}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="railbar">
            <button className="ar" aria-label="Previous" onClick={() => scrollNewArrivalsRail(-280)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m15 19-7-7 7-7" /></svg>
            </button>
            <button className="ar" aria-label="Next" onClick={() => scrollNewArrivalsRail(280)}>
              <svg className="i" viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* Shop the Edit Section - Displays All Catalogue Items */}
        <section className="sec" id="shop" style={{ paddingTop: 0 }}>
          <div className="hd rv">
            <h2>{t('shopTheEdit', 'Shop the Edit')}</h2>
            <p className="ui" style={{ fontSize: '15px' }}>
              {t('shopTheEditSub', 'Heirloom-inspired pieces, ready to gift or to keep.')}
            </p>
          </div>
          <div className="grid" id="grid">
            {shopProducts.map((p) => {
              const imgBg = resolveSafeImage(p.i, '/uploads/necklaces.png');
              return (
                <article
                  className="pc rv"
                  key={p.id}
                  onClick={() => handleProtectedNavigation(`/product/${p.id}`)}
                  style={{ cursor: 'pointer', position: 'relative' }}
                >
                  {p.is_new && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, background: 'linear-gradient(135deg, #f6dda0, #d4af37)', color: '#1a0418', fontSize: '10px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {'✨ New'}
                    </div>
                  )}
                  <div className="wr">
                    <div
                      className="im"
                      style={{ backgroundImage: imgBg }}
                      role="img"
                      aria-label={p.name}
                    ></div>
                  </div>
                  <div className="in">
                    <small>{translateCategory(p.category || p.c)}</small>
                    <h3>{p.name}</h3>
                    <div className="row">
                      <span className="pr">{inr(p.price || p.selling_price)}</span>
                      <button
                        className="add"
                        onClick={(e) => handleAddToCart(e, p)}
                        title="Add to shopping bag"
                      >
                        {t('addToBag', 'Add to bag')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Promotional Banner Section */}
        <section className="promo" id="promo">
          <div className="vis" style={{ backgroundImage: "url('https://res.cloudinary.com/j3n8su10/image/upload/v1794483503/the_ethnic_edit/hero_banners/media_1794480336661_3a36f2df_vge71a.jpg')" }}></div>
          <div className="vis" style={{ backgroundImage: "url('/uploads/banners/media_1794480336661_3a36f2df_vge71a.jpg')" }}></div>
          <div className="tx rv">
            <div className="kick">{'Celebrate Tradition'}</div>
            <h2><em>{t('inEveryDetail', 'In Every Detail.')}</em></h2>
            <p>{t('inEveryDetailSub', 'Discover the perfect piece for your special moments.')}</p>
            <button
              className="gbtn"
              onClick={() => handleProtectedNavigation('/shop')}
            >
              {t('exploreMore', 'Explore More')} <span>→</span>
            </button>
          </div>
        </section>

        {/* About Section */}
        <section className="sec" id="about">
          <div className="two">
            <div className="frame rv" style={{ backgroundImage: `url(${girlHeroImage})`, backgroundPosition: 'center 15%', backgroundSize: 'cover' }}></div>
            <div className="rv">
              <div className="kick">{'Our Story'}</div>
              <h2>{t('legacyTitle', 'Jewellery that carries a legacy.')}</h2>
              <p>{storeSettings.about_story || t('legacyDesc1', 'Vwalah brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.')}</p>
              <p>{t('legacyDesc2', 'Each piece is chosen for its craftsmanship and its story, so what you wear feels both timeless and personal.')}</p>
              <div className="pts">
                <span>{t('naturalGold', 'Natural Gold Finish')}</span>
                <span>{t('antiqueKemp', 'Antique Kemp Work')}</span>
                <span>{t('velvetPackaging', 'Luxury Packaging')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews & Patron Love (Wall of Love) */}
        <section className="sec" id="reviews" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
          <div className="hd rv" style={{ marginBottom: '24px' }}>
            <div className="kick" style={{ justifyContent: 'center' }}>
              {'Wall of Love'}
            </div>
            <h2>{'Adored by 10,000+ Patrons Across India'}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <div style={{ display: 'flex', color: 'var(--gold)', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="var(--gold)" color="var(--gold)" />
                ))}
              </div>
              <span style={{ fontSize: '14px', color: 'var(--gold2)', fontWeight: 600 }}>
                4.9 / 5.0 · {'1,400+ Verified Heirloom Purchases'}
              </span>
            </div>
          </div>

          {/* Horizontal Review Cards Carousel */}
          <div style={{ position: 'relative', marginTop: '20px' }}>
            <div
              ref={reviewRailRef}
              style={{
                display: 'flex',
                gap: '20px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                padding: '10px 4px 20px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    flex: '0 0 clamp(280px, 30vw, 360px)',
                    scrollSnapAlign: 'start',
                    background: 'linear-gradient(160deg, #320726, #200318)',
                    border: '1px solid var(--line)',
                    borderRadius: '20px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                    transition: 'transform 0.25s'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '3px', color: 'var(--gold)' }}>
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} fill="var(--gold)" color="var(--gold)" />
                        ))}
                      </div>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 500 }}>
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--cream)', opacity: 0.9, margin: '0 0 12px', fontStyle: 'italic' }}>
                      "{rev.comment}"
                    </p>

                    {rev.image_url && (
                      <div
                        onClick={() => setLightboxImage(rev.image_url)}
                        style={{
                          marginBottom: '12px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          height: '190px',
                          background: 'rgba(10, 0, 8, 0.65)',
                          border: '1px solid rgba(212,175,55,0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'zoom-in',
                          position: 'relative'
                        }}
                        title="Click to view full photo"
                      >
                        <img
                          src={rev.image_url}
                          alt="Customer review photo"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.7)',
                            color: 'var(--gold2)',
                            fontSize: '10px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(212,175,55,0.3)'
                          }}
                        >
                          🔍 Full View
                        </span>
                      </div>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid rgba(229,189,114,0.18)', paddingTop: '12px', marginTop: 'auto' }}>
                    <b style={{ display: 'block', fontSize: '14.5px', color: 'var(--gold2)' }}>
                      {rev.customer_name}
                    </b>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
                      <span>{rev.location || 'Verified Patron'}</span>
                      {rev.product_name && <span style={{ color: 'var(--gold)' }}>{rev.product_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel navigation arrows & Feedback button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="ar"
                  onClick={() => scrollReviewRail(-340)}
                  aria-label="Previous Reviews"
                  style={{ display: 'grid' }}
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  className="ar"
                  onClick={() => scrollReviewRail(340)}
                  aria-label="Next Reviews"
                  style={{ display: 'grid' }}
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              <Link
                to="/feedback"
                className="gbtn out"
                style={{
                  padding: '10px 22px',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MessageSquare size={15} />
                {'Write a Review / Share Feedback →'}
              </Link>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="sec" id="contact" style={{ paddingTop: 0 }}>
          <div className="two">
            <div className="rv">
              <div className="kick">{t('contact', 'Contact')}</div>
              <h2>{t('contactTitle', "We'd love to hear from you.")}</h2>
              <p>{t('contactSub', "Questions about a piece, a custom order or gifting? Write to us and we'll reply within a day.")}</p>
              <div className="cinfo">
                <a href={`mailto:${storeSettings.contact_email || 'hello@vwalah.com'}`}>
                  ✉ {storeSettings.contact_email || 'hello@vwalah.com'}
                </a>
                <a href={`tel:${(storeSettings.contact_phone || '+91 98765 43210').replace(/\s+/g, '')}`}>
                  ☎ {storeSettings.contact_phone || '+91 98765 43210'}
                </a>
                <span>
                  ◉ {storeSettings.contact_hours || ('Mon–Sat, 10am–10pm IST')}
                </span>

                {/* WhatsApp & Instagram Social Contact Options */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold)', opacity: 0.9, fontWeight: 600 }}>
                    {'Instant Connect & Social'}
                  </span>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {/* WhatsApp */}
                    <a
                      href={getWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleSocialClick('whatsapp')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        borderRadius: '999px',
                        background: 'rgba(37, 211, 102, 0.12)',
                        border: '1px solid rgba(37, 211, 102, 0.45)',
                        color: '#4ade80',
                        fontSize: '13px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(37, 211, 102, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(37, 211, 102, 0.12)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={'Chat with us on WhatsApp'}
                    >
                      <WhatsAppIcon size={18} color="#4ade80" />
                      <span>WhatsApp</span>
                    </a>

                    {/* Instagram */}
                    <a
                      href={getInstagramUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleSocialClick('instagram')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '9px 18px',
                        borderRadius: '999px',
                        background: 'rgba(225, 48, 108, 0.12)',
                        border: '1px solid rgba(225, 48, 108, 0.45)',
                        color: '#f472b6',
                        fontSize: '13px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(225, 48, 108, 0.25)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(225, 48, 108, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(225, 48, 108, 0.12)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title={'Follow us on Instagram'}
                    >
                      <InstagramIcon size={18} color="#f472b6" />
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <form className="f rv" id="cf" onSubmit={handleContactSubmit}>
              {contactSuccess && (
                <div style={{
                  background: 'rgba(34, 197, 94, 0.18)',
                  border: '1.5px solid #22c55e',
                  color: '#86efac',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                }}>
                  <CheckCircle2 size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                  <span style={{ fontWeight: 500 }}>
                    {'Message sent successfully! Our curators will get back to you shortly.'}
                  </span>
                </div>
              )}
              {contactError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.18)',
                  border: '1.5px solid #ef4444',
                  color: '#fca5a5',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '10px'
                }}>
                  <span>{contactError}</span>
                </div>
              )}
              <label>
                {t('fullName', 'Name')}
                <input required name="n" autoComplete="name" />
              </label>
              <label>
                {t('emailAddress', 'Email')}
                <input required type="email" name="e" autoComplete="email" />
              </label>
              <label>
                {t('messagePlaceholder', 'Message')}
                <textarea required name="m"></textarea>
              </label>
              <button className="gbtn" type="submit" style={{ justifySelf: 'start' }}>
                {t('sendMessage', 'Send Message')}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="fg">
          <div>
            <a className="brand" href="#home" style={{ marginBottom: '16px' }}>
              <span className="logo"></span>
              <span>
                <b>{storeName}</b>
              </span>
            </a>
            <p>{t('footerDesc', 'Timeless jewellery for every celebration, crafted with elegance.')}</p>
          </div>
          <div>
            <h4>{t('quickLinks', 'Explore')}</h4>
            <ul>
              <li><a href="#home">{t('home', 'Home')}</a></li>
              <li>
                <button
                  onClick={() => handleProtectedNavigation('/shop')}
                  style={{ background: 'none', border: 'none', color: 'inherit', padding: '5px 0', cursor: 'pointer', font: 'inherit' }}
                >
                  {t('catalogue', 'Catalogue')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleProtectedNavigation('#collections')}
                  style={{ background: 'none', border: 'none', color: 'inherit', padding: '5px 0', cursor: 'pointer', font: 'inherit' }}
                >
                  {t('collections', 'Collections')}
                </button>
              </li>
              <li><a href="#about">{t('about', 'About Us')}</a></li>
              <li><a href="#contact">{t('contact', 'Contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t('helpInfo', 'Help & Policies')}</h4>
            <ul>
              <li><a href="#contact">{t('shippingPolicy', 'Shipping & Delivery')}</a></li>
              <li><a href="#contact">{t('returnsPolicy', 'Returns & Exchange')}</a></li>
              <li><a href="#contact">{t('privacyPolicy', 'Privacy Policy')}</a></li>
              <li>
                <Link to="/feedback" style={{ color: 'var(--gold2)', padding: '5px 0', textDecoration: 'none' }}>
                  {'Reviews & Feedback'}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>{t('newsletter', 'Newsletter')}</h4>
            <p style={{ marginBottom: '12px' }}>
              {t('newsletterDesc', 'New collections and festive offers, straight to your inbox.')}
            </p>
            <form className="nl" id="nl" onSubmit={(e) => { e.preventDefault(); e.target.reset(); showToast('Subscribed to newsletter.'); }}>
              <input type="email" required placeholder={'Your email'} aria-label="Email address" />
              <button type="submit">{t('subscribe', 'Subscribe')}</button>
            </form>
          </div>
        </div>

        {/* Footer Bottom with Powered by Aminoid */}
        <div className="fb">
          <span>© {new Date().getFullYear()} {storeName}. {t('allRightsReserved', 'All rights reserved.')}</span>
          <span>
            Powered by{' '}
            <a
              href="https://www.aminoid.in/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold2)', textDecoration: 'none', fontWeight: 500 }}
            >
              Aminoid
            </a>
          </span>
          <span>{'Privacy · Terms'}</span>
        </div>
      </footer>

      {/* High-Resolution Review Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#1a0418',
              borderRadius: '20px',
              border: '1px solid var(--gold2)',
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px'
            }}
          >
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid var(--gold2)',
                color: 'var(--gold2)',
                fontSize: '18px',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Close Full View"
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="High resolution customer preview"
              style={{
                maxWidth: '85vw',
                maxHeight: '78vh',
                objectFit: 'contain',
                display: 'block',
                borderRadius: '12px'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
