import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    catalogue: 'Catalogue',
    collections: 'Collections',
    about: 'About',
    contact: 'Contact',
    bag: 'Bag',
    wishlist: 'Wishlist',
    account: 'Account',
    settings: 'Settings',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    myOrders: 'My Orders',
    searchPlaceholder: 'Search necklace, earrings, bangles...',
    adminConsole: 'Admin Console',

    // Hero & Landing
    heroTitle: 'Tradition, Beautifully Curated.',
    heroSubtitle: 'Timeless jewellery for every celebration, crafted with elegance.',
    shopCollection: 'Explore Collection',
    pureGold: 'Pure Gold & Jewels',
    pureGoldSub: 'Hallmarked & certified',
    secureDelivery: 'Secure Delivery',
    secureDeliverySub: 'Tamper-evident transit',
    panIndiaShipping: 'Pan-India Shipping',
    panIndiaShippingSub: 'Insured to your doorstep',
    expertSizing: 'Expert Sizing',
    expertSizingSub: 'Custom bridal fit',

    // Section Titles
    ourCollections: 'Our Collections',
    ourCollectionsSub: 'Exquisite designs across all heirloom categories.',
    newArrivals: 'New Arrivals',
    newProducts: 'New Products',
    newProductsSub: 'Recently handcrafted heirloom pieces, fresh from our master artisans.',
    shopTheEdit: 'Shop the Edit',
    shopTheEditSub: 'Handcrafted bridal pieces, ready to order.',
    inEveryDetail: 'In Every Detail.',
    inEveryDetailSub: 'Find the perfect piece for your special moments.',
    exploreMore: 'Explore More',
    quickBuy: 'Quick Buy',
    addToBag: 'Add to Bag',
    addedToBag: 'Added to Bag!',
    viewDetails: 'View Details',
    legacyTitle: 'Jewellery that carries a legacy.',
    legacyDesc1: 'Vwalah brings together the royal elegance of antique gold temple jewellery, exquisite Kundan work, and timeless Polki sets for celebrations, weddings, and everyday cherished moments.',
    legacyDesc2: 'Each piece is hand-selected and hallmarked to ensure absolute purity and unmatched heirloom quality.',
    naturalGold: 'Natural Gold Finish',
    antiqueKemp: 'Antique Kemp Work',
    velvetPackaging: 'Luxury Packaging',
    contactTitle: "We'd love to hear from you.",
    contactSub: 'Questions about custom jewellery, sizing or orders? We are here to help.',
    namePlaceholder: 'Your Full Name',
    emailPlaceholder: 'Email Address',
    messagePlaceholder: 'Your Message / Inquiry',
    sendMessage: 'Send Message',
    sending: 'Sending...',
    messageSent: 'Thank you! Your message has been sent.',

    // Footer
    footerDesc: 'Timeless jewellery for every celebration, curated with elegance.',
    quickLinks: 'Quick Links',
    helpInfo: 'Help & Policies',
    shippingPolicy: 'Shipping & Delivery',
    returnsPolicy: 'Returns & Exchange',
    privacyPolicy: 'Privacy Policy',
    newsletter: 'Newsletter',
    newsletterDesc: 'First access to rare bridal edits and festive releases.',
    subscribe: 'Subscribe',
    allRightsReserved: 'All rights reserved.',
    handcraftedWithLove: 'Handcrafted with love for Indian tradition.',

    // Collections names
    allCollections: 'All Collections',
    necklaces: 'Necklaces',
    earrings: 'Earrings',
    bangles: 'Bangles',
    rings: 'Rings',
    waistBelts: 'Waist Belts',
    necklaceSets: 'Necklace Sets',
    bracelets: 'Bracelets',
    pendants: 'Pendants',
    maangTikka: 'Maang Tikka',
    anklets: 'Anklets',
    nosePins: 'Nose Pins',
    hairAccessories: 'Hair Accessories',

    // Catalogue & Store
    storeTitle: 'Jewellery Catalogue',
    filterByCollection: 'Filter by Collection',
    priceRange: 'Price Range',
    sortBy: 'Sort By',
    sortFeatured: 'Featured',
    sortPriceLowHigh: 'Price: Low to High',
    sortPriceHighLow: 'Price: High to Low',
    sortNewest: 'Newest Arrivals',
    sortRating: 'Highest Rated',
    sortPopularity: 'Popularity',
    inStockOnly: 'In Stock Only',
    clearFilters: 'Clear Filters',
    showingProducts: 'Showing pieces',
    noProductsFound: 'No jewellery found matching your selection.',
    resetFilters: 'Reset Filters',

    // Product Card
    quickView: 'Quick View',
    buyNow: 'Buy Now',
    reviews: 'reviews',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    piecesAvailable: 'pieces left',
    freeShipping: 'Free Insured Shipping',
    certifiedQuality: 'Certified Hallmark Quality',

    // Product Details
    selectQuantity: 'Quantity',
    productDetails: 'Product Details',
    specifications: 'Specifications',
    material: 'Material',
    colour: 'Colour',
    occasion: 'Occasion',
    weight: 'Gross Weight',
    dimensions: 'Dimensions',
    sku: 'SKU Code',
    description: 'Description',
    addWishlist: 'Add to Wishlist',
    removeWishlist: 'Remove from Wishlist',
    authenticityPromise: 'Authenticity Promise',
    careInstructions: 'Care & Maintenance',
    youMayAlsoLike: 'You May Also Like',
    writeReview: 'Write a Review',
    customerReviews: 'Patron Reviews',

    // Cart & Checkout
    shoppingBag: 'Shopping Bag',
    bagEmpty: 'Your shopping bag is empty.',
    startShopping: 'Explore Collections',
    orderSummary: 'Order Summary',
    emptyBag: 'Your shopping bag is empty',
    continueShopping: 'Explore Collections',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    free: 'FREE',
    grandTotal: 'Total Payable',
    estimatedTotal: 'Estimated Total',
    proceedToCheckout: 'Proceed to Checkout',
    checkoutTitle: 'Delivery & Checkout',
    shippingAddress: 'Shipping Address',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    emailAddress: 'Email Address',
    streetAddress: 'Flat / Street Address',
    city: 'City',
    state: 'State',
    pincode: 'PIN Code',
    continueToPayment: 'Continue to Payment',
    applyCoupon: 'Apply Promo Code',
    deliveryAddress: 'Delivery Address',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    onlinePayment: 'UPI / Cards / Net Banking',
    placeOrder: 'Place Order',
    placingOrder: 'Placing your order...',
    orderSuccessTitle: 'Order Confirmed!',
    orderSuccessSub: 'Thank you for shopping with Vwalah.',
    confirmPlaceOrder: 'Confirm & Place Order',
    orderSuccess: 'Order Placed Successfully!',
    orderNumber: 'Order Number',
    orderTracking: 'Track Your Delivery',

    // Account & Orders
    accountOverview: 'Account Overview',
    profileDetails: 'Personal Profile',
    editProfile: 'Edit Profile',
    orderHistory: 'Order History',
    noOrders: 'You have not placed any orders yet.',
    orderId: 'Order ID',
    orderDate: 'Date',
    orderTotal: 'Total',
    orderStatus: 'Status',
    action: 'Action',
    viewDetailsAction: 'View Order',
    statusDelivered: 'Delivered',
    statusShipped: 'Shipped',
    statusProcessing: 'Processing',
    statusConfirmed: 'Confirmed',
    statusPending: 'Pending',
    statusCancelled: 'Cancelled',

    // Account & Auth
    loginTitle: 'Sign In to Your Account',
    registerTitle: 'Create an Account',
    forgotPassword: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUp: 'Sign Up',
    password: 'Password',
    profile: 'Personal Profile',
    savedAddresses: 'Saved Delivery Addresses',

    // Settings Page
    userSettingsTitle: 'User Settings & Profile',
    userSettingsSub: 'Manage your personal details, language preference, and account security.',
    langSectionTitle: 'Language Preference',
    langSectionSub: 'Choose your preferred language across the entire website and admin panel.',
    personalSectionTitle: 'Personal Information',
    personalSectionSub: 'Update your contact information and default delivery address.',
    securitySectionTitle: 'Account Security',
    securitySectionSub: 'Change your login password securely.',
    currentPasswordLabel: 'Current Password',
    newPasswordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm New Password',
    saveProfileBtn: 'Save Personal Details',
    saving: 'Saving Changes...',
    updatePasswordBtn: 'Update Password',
    updatingPassword: 'Updating Password...',
    profileUpdateSuccess: 'Personal details updated successfully!',
    passwordUpdateSuccess: 'Password changed successfully!',
    passwordMismatch: 'New passwords do not match.',
    fillCurrentPassword: 'Please enter your current password.',

    // Admin Panel
    adminDashboard: 'Overview',
    adminProducts: 'Product Management',
    adminCategories: 'Collections',
    adminBanners: 'Banners & Hero Media',
    adminOrders: 'Orders & Shipments',
    adminCustomers: 'Customers',
    adminInventory: 'Inventory & Stock',
    adminReviews: 'Reviews & Feedback',
    adminInquiries: 'Messages',
    adminCoupons: 'Coupons & Offers',
    adminSettings: 'Settings',
    adminStoreSettings: 'Settings',
    adminLoggedInAs: 'Logged in as',
    adminBack: 'Back',
    adminSignOut: 'Sign Out',
    adminAddNewProduct: '+ Add New Jewellery Product',
    adminAddNewCollection: '+ New Collection',
    adminUploadImages: 'Upload Image Files',
    adminProductName: 'Product Name',
    adminCollectionCategory: 'Collection / Category',
    adminOriginalPrice: 'Original Price',
    adminSellingPrice: 'Selling Price',
    adminStock: 'Stock Available',
    adminStatus: 'Status',
    adminActions: 'Actions',
    adminEdit: 'Edit',
    adminDelete: 'Delete',
    adminPublished: 'Active',
    adminDraft: 'Draft',
    adminSave: 'Save Piece',
    adminCancel: 'Cancel',
    adminTotalRevenue: 'Total Revenue',
    adminTotalOrders: 'Total Orders',
    adminTotalProducts: 'Live Pieces',
    adminActiveCustomers: 'Registered Customers',

    // Extra Filter and UI keys
    allPieces: 'All Pieces',
    filters: 'Filters',
    clearAll: 'Clear All',
    allPrices: 'All Prices',
    under15k: 'Under ₹15,000',
    from15kTo30k: '₹15,000 – ₹30,000',
    from30kTo50k: '₹30,000 – ₹50,000',
    above50k: 'Above ₹50,000',
    jewelleryStyle: 'Jewellery Style',
    allStyles: 'All Styles',
    templeJewellery: 'Temple Jewellery',
    kundanPolki: 'Kundan & Polki',
    basraPearl: 'Basra Pearl',
    bridalJewellery: 'Bridal Jewellery',
    popularity: 'Popularity',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    newestFirst: 'Newest First',
    customerRating: 'Customer Rating',
    specialDiscount: 'Special Discount %',
    showingPieces: 'Showing handcrafted pieces',
    authenticHeritage: 'Authentic Heritage Collection',
    workingHours: 'Working Hours',
    verifiedPatron: 'Verified Patron'
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('en');

  const setLang = (newLang) => {
    setLangState('en');
    localStorage.setItem('tee_lang', 'en');
    document.documentElement.lang = 'en';
  };

  useEffect(() => {
    document.documentElement.lang = 'en';
    localStorage.setItem('tee_lang', 'en');
  }, []);

  // Translate helper function (strictly English)
  const t = (key, fallback) => {
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  const isTamil = false;

  // Helper for category names translation (strictly English)
  const translateCategory = (name) => {
    return name || '';
  };

  return (
    <LanguageContext.Provider value={{ lang: 'en', setLang, t, isTamil: false, translateCategory }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
