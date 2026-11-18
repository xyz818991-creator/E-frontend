import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, reviewService, inquiryService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Heart,
  Share2,
  Tag,
  Check,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock,
  MapPin,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Eye,
  X,
  Globe,
  Settings,
  Camera
} from 'lucide-react';
import '../EthnicEdit.css';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

const INDIAN_PINCODE_MAP = [
  // Tamil Nadu
  { prefixes: ['600'], area: 'Chennai', state: 'Tamil Nadu' },
  { prefixes: ['601', '602', '603'], area: 'Kanchipuram & Chengalpattu', state: 'Tamil Nadu' },
  { prefixes: ['604', '606'], area: 'Tiruvannamalai & Villupuram', state: 'Tamil Nadu' },
  { prefixes: ['605'], area: 'Puducherry & Cuddalore', state: 'Tamil Nadu / Puducherry' },
  { prefixes: ['620', '621'], area: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu' },
  { prefixes: ['624'], area: 'Dindigul', state: 'Tamil Nadu' },
  { prefixes: ['625'], area: 'Madurai', state: 'Tamil Nadu' },
  { prefixes: ['626'], area: 'Virudhunagar & Sivakasi', state: 'Tamil Nadu' },
  { prefixes: ['627', '628'], area: 'Tirunelveli & Thoothukudi', state: 'Tamil Nadu' },
  { prefixes: ['629'], area: 'Kanyakumari & Nagercoil', state: 'Tamil Nadu' },
  { prefixes: ['630'], area: 'Karaikudi & Sivaganga', state: 'Tamil Nadu' },
  { prefixes: ['631'], area: 'Arakkonam & Ranipet', state: 'Tamil Nadu' },
  { prefixes: ['632'], area: 'Vellore', state: 'Tamil Nadu' },
  { prefixes: ['635'], area: 'Hosur & Krishnagiri', state: 'Tamil Nadu' },
  { prefixes: ['636', '637'], area: 'Salem & Namakkal', state: 'Tamil Nadu' },
  { prefixes: ['638'], area: 'Erode & Gobichettipalayam', state: 'Tamil Nadu' },
  { prefixes: ['639'], area: 'Karur', state: 'Tamil Nadu' },
  { prefixes: ['641'], area: 'Coimbatore', state: 'Tamil Nadu' },
  { prefixes: ['642'], area: 'Pollachi & Tiruppur', state: 'Tamil Nadu' },
  { prefixes: ['643'], area: 'Nilgiris (Ooty & Coonoor)', state: 'Tamil Nadu' },
  // Kerala
  { prefixes: ['670', '671'], area: 'Kannur & Kasaragod', state: 'Kerala' },
  { prefixes: ['673'], area: 'Kozhikode (Calicut)', state: 'Kerala' },
  { prefixes: ['678', '679'], area: 'Palakkad & Malappuram', state: 'Kerala' },
  { prefixes: ['680', '681'], area: 'Thrissur', state: 'Kerala' },
  { prefixes: ['682', '683'], area: 'Kochi & Ernakulam', state: 'Kerala' },
  { prefixes: ['686'], area: 'Kottayam', state: 'Kerala' },
  { prefixes: ['691'], area: 'Kollam', state: 'Kerala' },
  { prefixes: ['695'], area: 'Thiruvananthapuram (Trivandrum)', state: 'Kerala' },
  // Karnataka
  { prefixes: ['560', '561', '562'], area: 'Bengaluru (Bangalore)', state: 'Karnataka' },
  { prefixes: ['570', '571'], area: 'Mysuru (Mysore)', state: 'Karnataka' },
  { prefixes: ['575'], area: 'Mangaluru (Mangalore)', state: 'Karnataka' },
  { prefixes: ['577'], area: 'Shivamogga & Davanagere', state: 'Karnataka' },
  { prefixes: ['580'], area: 'Hubballi-Dharwad', state: 'Karnataka' },
  { prefixes: ['590'], area: 'Belagavi (Belgaum)', state: 'Karnataka' },
  // Telangana & Andhra Pradesh
  { prefixes: ['500', '501', '502'], area: 'Hyderabad & Secunderabad', state: 'Telangana' },
  { prefixes: ['506'], area: 'Warangal', state: 'Telangana' },
  { prefixes: ['520', '521'], area: 'Vijayawada', state: 'Andhra Pradesh' },
  { prefixes: ['522'], area: 'Guntur', state: 'Andhra Pradesh' },
  { prefixes: ['530', '531'], area: 'Visakhapatnam (Vizag)', state: 'Andhra Pradesh' },
  { prefixes: ['517'], area: 'Tirupati & Chittoor', state: 'Andhra Pradesh' },
  // Maharashtra & Goa
  { prefixes: ['400', '401'], area: 'Mumbai, Navi Mumbai & Thane', state: 'Maharashtra' },
  { prefixes: ['403'], area: 'Panaji & Margao', state: 'Goa' },
  { prefixes: ['411', '412'], area: 'Pune & Pimpri-Chinchwad', state: 'Maharashtra' },
  { prefixes: ['416'], area: 'Kolhapur', state: 'Maharashtra' },
  { prefixes: ['422'], area: 'Nashik', state: 'Maharashtra' },
  { prefixes: ['431'], area: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
  { prefixes: ['440', '441'], area: 'Nagpur', state: 'Maharashtra' },
  // Gujarat
  { prefixes: ['380', '382'], area: 'Ahmedabad & Gandhinagar', state: 'Gujarat' },
  { prefixes: ['390'], area: 'Vadodara (Baroda)', state: 'Gujarat' },
  { prefixes: ['395'], area: 'Surat', state: 'Gujarat' },
  { prefixes: ['360'], area: 'Rajkot', state: 'Gujarat' },
  // Delhi NCR & North
  { prefixes: ['110'], area: 'New Delhi / Central Delhi', state: 'Delhi NCR' },
  { prefixes: ['121'], area: 'Faridabad', state: 'Haryana' },
  { prefixes: ['122'], area: 'Gurugram (Gurgaon)', state: 'Haryana' },
  { prefixes: ['201'], area: 'Noida & Ghaziabad', state: 'Uttar Pradesh' },
  { prefixes: ['226'], area: 'Lucknow', state: 'Uttar Pradesh' },
  { prefixes: ['208'], area: 'Kanpur', state: 'Uttar Pradesh' },
  { prefixes: ['282'], area: 'Agra', state: 'Uttar Pradesh' },
  { prefixes: ['221'], area: 'Varanasi', state: 'Uttar Pradesh' },
  { prefixes: ['302'], area: 'Jaipur', state: 'Rajasthan' },
  { prefixes: ['342'], area: 'Jodhpur', state: 'Rajasthan' },
  { prefixes: ['313'], area: 'Udaipur', state: 'Rajasthan' },
  { prefixes: ['141'], area: 'Ludhiana', state: 'Punjab' },
  { prefixes: ['143'], area: 'Amritsar', state: 'Punjab' },
  { prefixes: ['160'], area: 'Chandigarh', state: 'Chandigarh' },
  { prefixes: ['171'], area: 'Shimla', state: 'Himachal Pradesh' },
  { prefixes: ['190'], area: 'Srinagar', state: 'Jammu & Kashmir' },
  { prefixes: ['248'], area: 'Dehradun', state: 'Uttarakhand' },
  // East & Central
  { prefixes: ['700', '711', '712'], area: 'Kolkata & Howrah', state: 'West Bengal' },
  { prefixes: ['734'], area: 'Siliguri & Darjeeling', state: 'West Bengal' },
  { prefixes: ['751'], area: 'Bhubaneswar', state: 'Odisha' },
  { prefixes: ['769'], area: 'Rourkela', state: 'Odisha' },
  { prefixes: ['800'], area: 'Patna', state: 'Bihar' },
  { prefixes: ['834'], area: 'Ranchi', state: 'Jharkhand' },
  { prefixes: ['462'], area: 'Bhopal', state: 'Madhya Pradesh' },
  { prefixes: ['452'], area: 'Indore', state: 'Madhya Pradesh' },
  { prefixes: ['492'], area: 'Raipur', state: 'Chhattisgarh' },
  { prefixes: ['781'], area: 'Guwahati', state: 'Assam' }
];

const resolveIndianPincode = (pin) => {
  if (!pin || pin.length !== 6) return null;
  const p3 = pin.substring(0, 3);
  for (const item of INDIAN_PINCODE_MAP) {
    if (item.prefixes.includes(p3)) {
      return { area: item.area, state: item.state };
    }
  }
  const firstDigit = pin[0];
  const regionMap = {
    '1': { area: 'North Region', state: 'Delhi / Haryana / Punjab / HP' },
    '2': { area: 'North Region', state: 'Uttar Pradesh / Uttarakhand' },
    '3': { area: 'West Region', state: 'Rajasthan / Gujarat' },
    '4': { area: 'West / Central Region', state: 'Maharashtra / MP / Goa' },
    '5': { area: 'South Region', state: 'Karnataka / Telangana / AP' },
    '6': { area: 'South Region', state: 'Tamil Nadu / Kerala' },
    '7': { area: 'East Region', state: 'West Bengal / Odisha / North East' },
    '8': { area: 'East Region', state: 'Bihar / Jharkhand' }
  };
  return regionMap[firstDigit] || { area: 'India Delivery Zone', state: 'India' };
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, clearCart, cartCount, toggleWishlist, isInWishlist, addRecentlyViewed, recentlyViewed } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { lang, setLang, t, isTamil, translateCategory } = useLanguage();
  const { storeSettings, storeName } = useStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [categorySimilar, setCategorySimilar] = useState([]);

  // Reviews state (scoped strictly to current product)
  const [reviews, setReviews] = useState([]);
  const [notified, setNotified] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingReviewPhotos, setUploadingReviewPhotos] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2600);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Try Backend API first
        let res = null;
        try {
          res = await productService.getProductById(id);
        } catch (apiErr) {
          // If not found in API, will check core products below
        }

        if (res && res.success && res.product) {
          const p = res.product;

          // Collect ALL images from backend p.images or fallback
          let allImgs = [];
          if (Array.isArray(p.images) && p.images.length > 0) {
            allImgs = p.images
              .map((im) => (typeof im === 'string' ? im.trim() : im?.image_url))
              .filter(Boolean);
          }
          if (p.image_url && !allImgs.includes(p.image_url)) {
            allImgs.unshift(p.image_url);
          }
          if (allImgs.length === 0 && p.category?.image_url) {
            allImgs = [p.category.image_url];
          }
          if (allImgs.length === 0) {
            allImgs = ['var(--i-neck)'];
          }

          const enhanced = {
            ...p,
            image_url: allImgs[0],
            additional_images: allImgs,
            jewellery_type: p.jewellery_type || p.collection_type || 'Temple Jewellery',
            material: p.material || p.base_metal || '24k Antique Gold Plated',
            stones: p.stones || 'Synthetic Kemp & Seed Pearls',
            colour: p.colour || 'Antique Gold',
            occasion: p.occasion || 'Bridal & Festive',
            weight: p.weight || p.net_weight || '50g',
            dimensions: p.dimensions || 'Standard Bridal Specification',
            closure: 'Adjustable Traditional Clasp',
            care: 'Keep in airtight pouch away from perfumes and sprays.',
            rating: p.rating || 4.9,
            reviews_count: p.reviews_count || 64
          };
          setProduct(enhanced);
          setSelectedImage(allImgs[0]);
          addRecentlyViewed(enhanced);

          // Fetch real similar products currently in live store
          const catKey = p.category?.slug || p.category_id || p.category?.name;
          (async () => {
            try {
              let liveRelated = [];
              if (catKey) {
                const catResp = await productService.getProducts({ category: catKey, limit: 12 }).catch(() => null);
                if (catResp && catResp.success && Array.isArray(catResp.products)) {
                  liveRelated = catResp.products.filter((item) => String(item.id) !== String(p.id));
                }
              }
              // If not enough products in the same category, fill with other live active products from store
              if (liveRelated.length < 4) {
                const allResp = await productService.getProducts({ limit: 16 }).catch(() => null);
                if (allResp && allResp.success && Array.isArray(allResp.products)) {
                  const more = allResp.products.filter(
                    (item) => String(item.id) !== String(p.id) && !liveRelated.some((r) => String(r.id) === String(item.id))
                  );
                  liveRelated = [...liveRelated, ...more];
                }
              }
              const mapped = liveRelated.slice(0, 4).map((item) => ({
                ...item,
                image_url: item.images?.[0]?.image_url || item.image_url || 'var(--i-neck)'
              }));
              setCategorySimilar(mapped);
            } catch (relErr) {
              console.error('Error fetching live related products:', relErr);
            }
          })();
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error('Error fetching product:', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();

    // Fetch live customer reviews specifically for this product
    setReviews([]);
    reviewService.getByProduct(id)
      .then((res) => {
        if (res && res.success && Array.isArray(res.reviews)) {
          const mappedReviews = res.reviews
            .filter((rev) => rev.product_id && String(rev.product_id) === String(id))
            .map((rev) => ({
              id: rev.id,
              name: rev.customer_name || 'Verified Patron',
              rating: rev.rating || 5,
              date: new Date(rev.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              title: rev.title || 'Verified Purchase',
              comment: rev.comment || '',
              images: Array.isArray(rev.images) ? rev.images : (rev.image_url ? [rev.image_url] : []),
              verified: true
            }));
          setReviews(mappedReviews);
        } else {
          setReviews([]);
        }
      })
      .catch(() => {
        setReviews([]);
      });

    window.scrollTo(0, 0);
  }, [id]);

  // Protected actions check
  const checkAuth = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to start shopping.');
      setTimeout(() => navigate('/login'), 600);
      return false;
    }
    return true;
  };

  const handleNotifyMe = async () => {
    if (notified) return;
    try {
      const email = user?.email || window.prompt('Please enter your email to receive restock notifications:');
      if (!email || !email.trim()) return;

      await inquiryService.submitInquiry({
        name: user?.name || 'Customer',
        email: email.trim(),
        phone: user?.phone || '',
        subject: `Back in Stock Request: ${product?.name}`,
        message: `Customer ${user?.name || email.trim()} requested a restock notification for piece "${product?.name}" (SKU: ${product?.sku}, ID: ${product?.id}).`
      });

      setNotified(true);
      showToast('Alert requested! We have notified our team and will email you as soon as this piece is restocked.');
    } catch (err) {
      showToast(err.message || 'Failed to submit notification request.', 'error');
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      ...product,
      image_url: selectedImage,
      price: product.selling_price || product.price
    }, quantity);
    showToast(`Added ${quantity} × ${product.name} to your bag!`);
    // Navigate directly to cart page
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    const checkoutItem = {
      ...product,
      image_url: selectedImage,
      price: product.selling_price || product.price
    };
    sessionStorage.setItem('tee_buy_now_item', JSON.stringify({ ...checkoutItem, quantity }));

    if (!isAuthenticated) {
      showToast('Please sign in to proceed with Express Checkout.');
      sessionStorage.setItem('tee_login_redirect', '/buy-now');
      setTimeout(() => navigate('/login', { state: { returnUrl: '/buy-now' } }), 600);
      return;
    }

    navigate('/buy-now', { state: { product: checkoutItem, quantity } });
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      showToast('Please sign in to save pieces to your wishlist.');
      setTimeout(() => navigate('/login'), 600);
      return;
    }
    toggleWishlist(product);
    showToast('Saved to Wishlist!');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Masterpiece link copied to clipboard!');
    } else {
      showToast('Link copied!');
    }
  };

  const handleCheckPincode = async (e) => {
    e.preventDefault();
    const cleanPin = (pincode || '').trim();
    if (cleanPin.length !== 6 || isNaN(cleanPin)) {
      setDeliveryResult({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
      return;
    }

    const localInfo = resolveIndianPincode(cleanPin);
    let detectedArea = localInfo?.area || 'Delivery Zone';
    let detectedState = localInfo?.state || 'India';

    // Attempt fast lookup from public Postal PIN code API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const apiRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await apiRes.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        detectedArea = `${po.Name}, ${po.District || po.Division || detectedArea}`;
        detectedState = po.State || detectedState;
      }
    } catch (_) {
      // Fallback seamlessly to built-in location map
    }

    const days = 2 + (parseInt(cleanPin, 10) % 3);
    const date = new Date(Date.now() + days * 86400000);
    const formatted = date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    setDeliveryResult({
      success: true,
      pincode: cleanPin,
      area: detectedArea,
      state: detectedState,
      message: `Delivery by ${formatted} (${days} business days) · Free Insured Express Transit & COD available.`
    });
  };

  const handleImageMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleImageTouchMove = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
    setIsZoomed(true);
  };

  const handleReviewPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (reviewImages.length + files.length > 4) {
      showToast('Maximum of 4 photos allowed per review.');
      return;
    }
    for (const file of files) {
      if (!file.type.match(/^image\/(jpe?g|png|webp)$/i)) {
        showToast('Please upload JPG, PNG, or WEBP photos only.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Each review photo must be under 5MB.');
        return;
      }
    }

    try {
      setUploadingReviewPhotos(true);
      const formData = new FormData();
      formData.append('folder', 'reviews');
      files.forEach((file) => formData.append('images', file));

      const res = await reviewService.uploadImages(formData);
      if (res.success && res.files) {
        const urls = res.files.map((f) => f.url);
        setReviewImages((prev) => [...prev, ...urls]);
        showToast(`Uploaded ${urls.length} photo(s) to review.`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingReviewPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemoveReviewPhoto = (indexToRemove) => {
    setReviewImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.title || !newReview.comment) {
      showToast('Please fill all review fields.');
      return;
    }

    try {
      const payload = {
        product_id: product.id,
        product_name: product.name,
        customer_name: user?.name || 'Verified Patron',
        title: newReview.title.trim(),
        comment: newReview.comment.trim(),
        rating: newReview.rating,
        images: reviewImages,
        image_url: reviewImages[0] || null
      };

      const res = await reviewService.createReview(payload);
      const created = (res.success && res.review) ? res.review : {
        id: Date.now(),
        ...payload,
        name: user?.name || 'Verified Patron',
        date: 'Just now',
        verified: true
      };

      setReviews([created, ...reviews]);
      setIsReviewModalOpen(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      setReviewImages([]);
      showToast('Thank you! Your verified review and photos have been published.');
    } catch (err) {
      showToast(err.message || 'Failed to publish review. Saved locally.');
      const localFallback = {
        id: Date.now(),
        name: user?.name || 'Verified Patron',
        title: newReview.title.trim(),
        comment: newReview.comment.trim(),
        rating: newReview.rating,
        images: reviewImages,
        date: 'Just now',
        verified: true
      };
      setReviews([localFallback, ...reviews]);
      setIsReviewModalOpen(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      setReviewImages([]);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', color: 'var(--gold2)' }}>
        Loading heirloom masterpiece...
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--cream)', padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '32px', color: 'var(--gold2)', marginBottom: '12px' }}>
          Piece Not Found
        </h2>
        <p style={{ opacity: 0.8, maxWidth: '420px', marginBottom: '24px', lineHeight: 1.6 }}>
          The jewellery piece you are looking for is either no longer available or has been removed from the catalogue.
        </p>
        <button
          onClick={() => navigate('/catalogue')}
          className="gbtn"
          style={{ padding: '10px 24px', cursor: 'pointer' }}
        >
          Explore Catalogue
        </button>
      </div>
    );
  }

  const isCss = selectedImage && selectedImage.startsWith('var(');
  const bg = isCss ? selectedImage : selectedImage ? `url("${encodeURI(selectedImage)}")` : 'var(--i-neck)';

  const sellingPrice = parseFloat(product.selling_price || product.price || 0);
  const originalPrice = parseFloat(product.original_price || sellingPrice * 1.15);
  const discountPct = originalPrice > sellingPrice ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;
  const isOutOfStock = product?.stock !== undefined && product?.stock !== null && Number(product.stock) <= 0;
  const wishlisted = isInWishlist(product.id);
  const imagesList = product.additional_images?.length ? product.additional_images : [product.image_url];

  // Similar products strictly from live store items
  const similarProducts = categorySimilar;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Toast Notification */}
      <div className={`tst ${toastMessage ? 'on' : ''}`} style={{ display: toastMessage ? 'block' : 'none' }}>
        {toastMessage}
      </div>

      {/* Top Banner */}
      <div style={{ background: 'linear-gradient(90deg, #2a0520, #420833, #2a0520)', color: 'var(--gold2)', padding: '7px 16px', fontSize: '11px', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        ✨ Special Festive Deal · Extra 10% off with coupon <b>WELCOME10</b> at checkout
      </div>

      {/* Navigation Header */}
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
          <Link to="/shop">{t('catalogue', 'Catalogue')}</Link>
          <Link to="/wishlist">{t('wishlist', 'Wishlist')}</Link>
          {isAuthenticated && <Link to="/orders" style={{ color: "var(--gold2)" }}>{t('myOrders', 'My Orders')}</Link>}
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

          <button onClick={handleWishlistToggle} style={{ color: wishlisted ? '#f87171' : 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }} title={t('wishlist', 'Wishlist')}>
            <Heart size={20} fill={wishlisted ? '#f87171' : 'none'} />
          </button>
          <Link to="/cart" style={{ position: 'relative', background: 'transparent', border: 0, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title={t('bag', 'Bag')}>
            <ShoppingBag size={20} />
            <span id="cnt" style={{ marginLeft: '4px' }}>{cartCount}</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        {/* Back Button & Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/shop'))}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,240,208,0.08)',
              border: '1px solid var(--line)',
              color: 'var(--gold2)',
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title={t('adminBack', 'Go Back')}
          >
            <ArrowLeft size={16} /> {t('adminBack', 'Back')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', opacity: 0.75 }}>
            <Link to="/" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Catalogue</Link>
            <ChevronRight size={14} />
            <Link to={`/category/${product.category?.slug || 'necklaces'}`} style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              {product.category?.name || 'Jewellery'}
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--gold2)' }}>{product.name}</span>
          </div>
        </div>

        {/* Product Hero Grid (Left Gallery + Right Purchase Module) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '48px', alignItems: 'start', marginBottom: '60px' }}>
          {/* Left Column: Image Gallery with Interactive Hover Zoom */}
          <div style={{ display: 'flex', gap: '16px', position: 'sticky', top: '90px' }}>
            {/* Thumbnail Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {imagesList.map((im, idx) => {
                const isSelected = selectedImage === im;
                const isC = im && im.startsWith('var(');
                const thumbBg = isC ? im : im ? `url("${encodeURI(im)}")` : 'var(--i-neck)';

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(im)}
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--gold2)' : '1px solid var(--line)',
                      backgroundImage: thumbBg,
                      backgroundColor: '#24061d',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      padding: 0,
                      opacity: isSelected ? 1 : 0.6,
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 12px rgba(212,175,55,0.4)' : 'none'
                    }}
                    aria-label={`Thumbnail ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Main Interactive Zoom Product Display */}
            <div style={{ flex: 1, position: 'relative' }}>
              <div
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleImageMouseMove}
                onTouchMove={handleImageTouchMove}
                onTouchEnd={() => setIsZoomed(false)}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '24px',
                  backgroundColor: '#24061d',
                  border: '1px solid var(--line)',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                  cursor: isZoomed ? 'zoom-in' : 'crosshair',
                  position: 'relative',
                  overflow: 'hidden',
                  touchAction: 'none'
                }}
                role="img"
                aria-label={product.name}
              >
                {/* Smooth Magnification Layer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: bg,
                    backgroundColor: '#24061d',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: isZoomed ? '240%' : 'cover',
                    backgroundPosition: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center',
                    transition: isZoomed
                      ? 'background-position 0.04s ease-out'
                      : 'background-size 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), background-position 0.3s ease-out',
                    transform: 'translateZ(0)',
                    willChange: 'background-position, background-size'
                  }}
                />

                {/* Wishlist Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlistToggle();
                  }}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(20,2,16,0.7)',
                    border: '1px solid var(--line)',
                    color: wishlisted ? '#f87171' : 'var(--gold)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart size={20} fill={wishlisted ? '#f87171' : 'none'} />
                </button>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  style={{
                    position: 'absolute',
                    top: '66px',
                    right: '16px',
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'rgba(20,2,16,0.7)',
                    border: '1px solid var(--line)',
                    color: 'var(--gold)',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                  title="Share this Piece"
                >
                  <Share2 size={18} />
                </button>

                {/* Badge */}
                {product.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      background: 'rgba(212,175,55,0.95)',
                      color: '#12020e',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em',
                      zIndex: 10
                    }}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Interactive Zoom Indicator Pill */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: isZoomed ? 'rgba(212,175,55,0.95)' : 'rgba(20,2,16,0.82)',
                    color: isZoomed ? '#12020e' : 'var(--cream)',
                    fontWeight: isZoomed ? 700 : 500,
                    padding: '5px 16px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    pointerEvents: 'none',
                    border: isZoomed ? '1px solid #ffd700' : '1px solid var(--line)',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    transition: 'all 0.2s ease',
                    zIndex: 10
                  }}
                >
                  {isZoomed ? '🔍 2.4× Magnifier Active · Move cursor to inspect' : '🔍 Hover or Drag to Zoom'}
                </div>
              </div>

              {/* Multi-angle Views Gallery Directly Under Main Product Item */}
              {imagesList.length > 1 && (
                <div style={{ marginTop: '16px', background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '16px', padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--gold2)', fontWeight: 600 }}>
                      ✦ Multiple Angles &amp; Views ({imagesList.length} Views)
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cream)', opacity: 0.6 }}>Click thumbnail to switch preview</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {imagesList.map((im, idx) => {
                      const isSelected = selectedImage === im;
                      const isC = im && im.startsWith('var(');
                      const thumbBg = isC ? im : im ? `url(${im})` : 'var(--i-neck)';
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(im)}
                          style={{
                            flex: '0 0 72px',
                            width: '72px',
                            height: '72px',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid var(--gold2)' : '1px solid var(--line)',
                            backgroundImage: thumbBg,
                            backgroundColor: '#24061d',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            opacity: isSelected ? 1 : 0.65,
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 0 16px rgba(212,175,55,0.45)' : 'none',
                            position: 'relative'
                          }}
                          title={`View angle ${idx + 1}`}
                        >
                          {isSelected && (
                            <span style={{ position: 'absolute', bottom: '2px', right: '4px', background: 'var(--gold2)', color: '#1a0418', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', padding: '1px 3px' }}>
                              Active
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--gold)', fontWeight: 600 }}>
                  {product.category?.name || 'Temple Jewellery'}
                </span>
                <span style={{ opacity: 0.4 }}>•</span>
                <span style={{ fontSize: '11px', opacity: 0.7, color: 'var(--gold2)' }}>
                  SKU: {product.sku || 'TEE-0982'}
                </span>
              </div>

              <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '38px', color: 'var(--gold2)', margin: '0 0 12px', lineHeight: 1.15 }}>
                {product.name}
              </h1>

              {/* Ratings and Reviews */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.18)', border: '1px solid rgba(34,197,94,0.4)', padding: '3px 10px', borderRadius: '6px', color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>
                  <span>{product.rating || 4.9}</span>
                  <Star size={13} fill="#4ade80" />
                </div>
                <span style={{ fontSize: '13px', opacity: 0.8 }}>
                  <b>{reviews.length}</b> {reviews.length === 1 ? 'Verified Review' : 'Verified Reviews'}
                </span>
                <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>
                  ✓ Assured Authentic Imitation
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div style={{ background: 'linear-gradient(160deg, #2e0824, #1c0316)', border: '1px solid var(--line)', borderRadius: '18px', padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '34px', fontWeight: 700, color: 'var(--gold2)' }}>
                  {inr(sellingPrice)}
                </span>
                {originalPrice > sellingPrice && (
                  <span style={{ fontSize: '18px', textDecoration: 'line-through', opacity: 0.5 }}>
                    {inr(originalPrice)}
                  </span>
                )}
                {discountPct > 0 && (
                  <span style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid #22c55e', color: '#4ade80', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
                Inclusive of all taxes · Free insured courier transit
              </div>

              {/* Stock status */}
              {isOutOfStock ? (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#f87171', fontWeight: 600 }}>
                  <AlertCircle size={16} /> Currently Out of Stock · Handcrafted batch sold out
                </div>
              ) : (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4ade80', fontWeight: 500 }}>
                  <CheckCircle2 size={16} /> In Stock · Only {product.stock || 8} {product.stock === 1 ? 'piece' : 'pieces'} available for immediate dispatch
                </div>
              )}
            </div>

            {/* Available Flipkart-style Bank & Coupon Offers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Available Offers &amp; Discounts
              </div>
              <div style={{ background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag size={15} style={{ color: 'var(--gold)' }} />
                <span><b>Special Price:</b> Get extra 10% off with coupon code <b style={{ color: 'var(--gold2)' }}>WELCOME10</b> at checkout.</span>
              </div>
              <div style={{ background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={15} style={{ color: 'var(--gold)' }} />
                <span><b>Heritage Privilege:</b> Complimentary velvet jewellery preservation pouch with every order.</span>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons / Notify Me */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quantity:</span>
                  <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', borderRadius: '10px' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '16px', cursor: 'pointer' }}
                    >
                      −
                    </button>
                    <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: 600 }}>{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(10, quantity + 1))}
                      style={{ padding: '6px 14px', background: 'none', border: 'none', color: 'var(--gold)', fontSize: '16px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Main Action Buttons or Notify Me */}
              {isOutOfStock ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={handleNotifyMe}
                    disabled={notified}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '14px',
                      fontSize: '14px',
                      borderRadius: '999px',
                      border: '1px solid var(--gold2)',
                      background: notified ? 'rgba(34,197,94,0.2)' : 'linear-gradient(135deg, #d4af37, #996515)',
                      color: notified ? '#4ade80' : '#12020e',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      cursor: notified ? 'default' : 'pointer',
                      letterSpacing: '0.04em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                    }}
                  >
                    <Bell size={18} />
                    {notified ? '✓ Notification Request Sent to Artisan Studio' : 'Notify Me When Available'}
                  </button>
                  <span style={{ fontSize: '12px', opacity: 0.7, textAlign: 'center' }}>
                    Click "Notify Me" to alert our admin workshop to craft more units of this heirloom piece.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '14px' }}>
                  <button
                    className="gbtn"
                    onClick={handleAddToCart}
                    style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: '14px', fontWeight: 600 }}
                  >
                    <ShoppingBag size={18} style={{ marginRight: '6px' }} /> {t('addToBag', 'Add to Bag')}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      padding: '14px',
                      fontSize: '14px',
                      borderRadius: '999px',
                      border: '1px solid var(--gold2)',
                      background: 'linear-gradient(135deg, #d4af37, #996515)',
                      color: '#12020e',
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      letterSpacing: '0.04em'
                    }}
                  >
                    ⚡ {t('buyNow', 'Buy Now')}
                  </button>
                </div>
              )}
            </div>

            {/* Pincode & Delivery Date Checker */}
            <div style={{ background: 'rgba(255,240,208,0.03)', border: '1px solid var(--line)', borderRadius: '16px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '13px', fontWeight: 600, color: 'var(--gold2)' }}>
                <Truck size={16} /> Delivery &amp; Services
              </div>
              <form onSubmit={handleCheckPincode} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit delivery PIN code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1,
                    padding: '9px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,240,208,0.06)',
                    border: '1px solid var(--line)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
                <button type="submit" className="gbtn" style={{ padding: '9px 18px', fontSize: '13px' }}>
                  Check
                </button>
              </form>

              {deliveryResult && (
                <div
                  style={{
                    fontSize: '12.5px',
                    color: deliveryResult.success ? 'var(--cream)' : '#f87171',
                    marginTop: '10px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: deliveryResult.success ? 'rgba(74, 222, 128, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${deliveryResult.success ? 'rgba(74, 222, 128, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
                  }}
                >
                  {deliveryResult.success ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontWeight: 600, marginBottom: '3px' }}>
                        <span>📍</span>
                        <span>{deliveryResult.area ? `${deliveryResult.area}, ${deliveryResult.state}` : `PIN: ${deliveryResult.pincode}`}</span>
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        {deliveryResult.message}
                      </div>
                    </div>
                  ) : (
                    <div>{deliveryResult.message}</div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px', fontSize: '12px', opacity: 0.8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--gold)' }} />
                  <span>100% Certified Imitation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} style={{ color: 'var(--gold)' }} />
                  <span>7-Day Return &amp; Exchange</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Table (Flipkart Style) */}
        <section style={{ marginBottom: '60px', background: 'linear-gradient(160deg, #27051e, #170213)', border: '1px solid var(--line)', borderRadius: '24px', padding: '36px' }}>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'var(--gold2)', margin: '0 0 20px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
            Product Specifications
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Category', value: product.category?.name || 'Jewellery' },
              { label: 'Style / Collection', value: product.jewellery_type || 'Temple Imitation' },
              { label: 'Base Metal', value: product.material || product.base_metal || '24k Antique Gold Plated over Cast Brass' },
              { label: 'Embellishments', value: product.stones || 'Synthetic Kemp Stones & Micro Pearls' },
              { label: 'Colour Palette', value: product.colour || 'Antique Gold & Ruby Red' },
              { label: 'Occasion', value: product.occasion || 'Bridal & Grand Festivities' },
              { label: 'Net Weight', value: product.weight || product.net_weight || '50g' },
              { label: 'Dimensions', value: product.dimensions || 'Standard Bridal Size' },
              { label: 'Closure Type', value: product.closure || 'Traditional Adjustable Dori' },
              { label: 'Care Instructions', value: product.care || 'Keep away from moisture & perfumes. Store in velvet pouch.' }
            ].map((spec, i) => (
              <div key={i} style={{ display: 'flex', borderBottom: '1px solid rgba(212,175,55,0.08)', paddingBottom: '10px' }}>
                <span style={{ width: '150px', fontSize: '13px', opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {spec.label}
                </span>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--cream)', fontWeight: 500 }}>
                  {spec.value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
            <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold2)', margin: '0 0 8px' }}>
              Artisan Description
            </h4>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '14px', lineHeight: 1.7 }}>
              {product.description}
            </p>
          </div>
        </section>

        {/* Customer Ratings & Reviews Breakdown */}
        <section style={{ marginBottom: '60px', background: 'linear-gradient(160deg, #27051e, #170213)', border: '1px solid var(--line)', borderRadius: '24px', padding: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '28px', color: 'var(--gold2)', margin: '0 0 4px' }}>
                Ratings &amp; Customer Reviews
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(34,197,94,0.18)', padding: '4px 10px', borderRadius: '6px', color: '#4ade80', fontWeight: 700 }}>
                  <span>{product.rating || 4.9}</span>
                  <Star size={13} fill="#4ade80" />
                </div>
                <span style={{ opacity: 0.8 }}>Based on {product.reviews_count || 128} verified purchases</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (checkAuth()) setIsReviewModalOpen(true);
              }}
              className="gbtn"
              style={{ padding: '10px 20px', fontSize: '13px' }}
            >
              <MessageSquare size={14} style={{ marginRight: '6px' }} /> Rate Product
            </button>
          </div>

          {/* List of Reviews (Filtered strictly to this piece) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', background: 'rgba(255,240,208,0.02)', borderRadius: '12px', border: '1px dashed var(--line)' }}>
                No reviews yet for this piece. Be the first to share your experience!
              </div>
            ) : (
              reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid rgba(212,175,55,0.08)', paddingBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'rgba(34,197,94,0.15)', padding: '2px 6px', borderRadius: '4px', color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>
                    <span>{rev.rating}</span>
                    <Star size={10} fill="#4ade80" />
                  </div>
                  <b style={{ fontSize: '14px', color: 'var(--gold2)' }}>{rev.title}</b>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', opacity: 0.85, lineHeight: 1.5 }}>
                  {rev.comment}
                </p>

                {/* Customer Uploaded Review Photos */}
                {Array.isArray(rev.images) && rev.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '10px 0 12px' }}>
                    {rev.images.map((imgUrl, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => setLightboxImage(imgUrl)}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '10px',
                          backgroundImage: `url("${encodeURI(imgUrl)}")`,
                          backgroundColor: '#24061d',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          border: '1px solid var(--line)',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                          transition: 'transform 0.15s ease, border-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.borderColor = 'var(--gold2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = 'var(--line)';
                        }}
                        title="Click to view high-resolution photo"
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', opacity: 0.6 }}>
                  <span>{rev.name}</span>
                  <span>•</span>
                  <span>{rev.date}</span>
                  {rev.verified && <span style={{ color: '#4ade80' }}>✓ Certified Buyer</span>}
                </div>
              </div>
            )))}
          </div>
        </section>

        {/* Similar Masterpieces Rail */}
        {similarProducts.length > 0 && (
          <section style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  Curated Suggestions
                </div>
                <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '30px', color: 'var(--gold2)', margin: 0 }}>
                  Similar Pieces You May Admire
                </h2>
              </div>
              <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ChevronRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
              {similarProducts.map((p) => {
                const pImg = p.image_url;
                const isC = pImg && pImg.startsWith('var(');
                const pBg = isC ? pImg : `url(${pImg})`;
                const pr = parseFloat(p.selling_price || 0);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      navigate(`/product/${p.id}`);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      background: 'linear-gradient(160deg, #27051e, #170213)',
                      border: '1px solid var(--line)',
                      borderRadius: '18px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundImage: pBg,
                        backgroundColor: '#24061d',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <small style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase' }}>{p.category?.name}</small>
                        <h4 style={{ margin: '4px 0 8px', fontSize: '15px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)' }}>
                          {p.name}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--gold2)' }}>{inr(pr)}</span>
                        <span style={{ fontSize: '11px', color: 'var(--gold)' }}>View Details →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recently Viewed Products Rail */}
        {recentlyViewed.length > 1 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Your Browsing History
              </div>
              <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', color: 'var(--gold2)', margin: 0 }}>
                Recently Viewed Masterpieces
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
              {recentlyViewed
                .filter((rv) => rv.id !== product.id)
                .slice(0, 6)
                .map((rv, idx) => {
                  const img = rv.image_url;
                  const isC = img && img.startsWith('var(');
                  const bg = isC ? img : img ? `url("${encodeURI(img)}")` : 'var(--i-neck)';
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(`/product/${rv.id}`)}
                      style={{
                        minWidth: '180px',
                        background: 'linear-gradient(160deg, #27051e, #170213)',
                        border: '1px solid var(--line)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          backgroundImage: bg,
                          backgroundColor: '#24061d',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      />
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gold2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {rv.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--cream)', opacity: 0.8, marginTop: '2px' }}>
                          {inr(rv.selling_price || rv.price || 0)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.75)', display: 'grid', placeItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '24px', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setIsReviewModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 16px' }}>
              Write a Patron Review
            </h3>
            <form onSubmit={handleAddReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Your Rating
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={24} fill={star <= newReview.rating ? 'var(--gold)' : 'none'} color="var(--gold)" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stunning South Indian Craftsmanship!"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Review Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the finish, weight, and wearing experience..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              {/* Photo Upload with Previews */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)' }}>
                    Add Photos ({reviewImages.length}/4)
                  </label>
                  <span style={{ fontSize: '11px', opacity: 0.65 }}>JPG, PNG, WEBP · Max 5MB</span>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
                  {reviewImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        backgroundImage: `url("${encodeURI(imgUrl)}")`,
                        backgroundColor: '#24061d',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: '1px solid var(--gold2)'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveReviewPhoto(idx)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          border: 'none',
                          color: '#fff',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {reviewImages.length < 4 && (
                    <label
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        border: '1px dashed var(--line)',
                        background: 'rgba(255,240,208,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: uploadingReviewPhotos ? 'not-allowed' : 'pointer',
                        color: 'var(--gold)',
                        fontSize: '10px',
                        gap: '4px'
                      }}
                    >
                      <Camera size={18} />
                      <span>{uploadingReviewPhotos ? '...' : '+ Photo'}</span>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleReviewPhotoUpload}
                        disabled={uploadingReviewPhotos || reviewImages.length >= 4}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploadingReviewPhotos}
                className="gbtn"
                style={{ justifyContent: 'center', padding: '12px', marginTop: '6px', opacity: uploadingReviewPhotos ? 0.6 : 1 }}
              >
                {uploadingReviewPhotos ? 'Uploading photos...' : 'Submit Verified Review →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* High-Resolution Review Image Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 1, 8, 0.92)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'grid',
            placeItems: 'center',
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              background: '#24061d',
              borderRadius: '24px',
              border: '1px solid var(--gold)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.95)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(20,2,16,0.85)',
                border: '1px solid var(--line)',
                color: '#fff',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                zIndex: 20
              }}
              title="Close image viewer"
            >
              <X size={18} />
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#170213', padding: '16px' }}>
              <img
                src={lightboxImage}
                alt="Patron Review Photo"
                style={{
                  maxWidth: '100%',
                  maxHeight: '75vh',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#24061d' }}>
              <span style={{ fontSize: '13px', color: 'var(--gold2)', fontWeight: 600 }}>
                Verified Patron Photograph
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  color: 'var(--cream)',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName} · Handcrafted Imitation Jewellery.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'none', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/shop" style={{ color: 'var(--gold)', textDecoration: 'none' }}>All Jewellery</Link>
            <Link to="/cart" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Shopping Bag</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
