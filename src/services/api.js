import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically: routes admin calls to tee_admin_token and customer calls to tee_customer_token
api.interceptors.request.use(
  (config) => {
    const isAdminEndpoint = config.url && (config.url.includes('/admin') || config.url.includes('admin/'));
    const isInAdminPortal = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const adminToken = localStorage.getItem('tee_admin_token');
    const customerToken = localStorage.getItem('tee_customer_token');
    const legacyToken = localStorage.getItem('tee_auth_token');

    let token = null;
    if (isAdminEndpoint || isInAdminPortal) {
      token = adminToken || customerToken || legacyToken;
    } else {
      token = customerToken || legacyToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Smart Response interceptor: handles Vite proxy and dev port 5001 fallback strictly in local development
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const isProxyOrConnError =
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('Network Error') ||
      error.response?.status === 404 ||
      error.response?.status === 502 ||
      error.response?.status === 503 ||
      error.response?.status === 504;

    // Retry against local 5001 only during local development, never in production (Vercel/Railway)
    if (import.meta.env.DEV && originalRequest && !originalRequest._retryCount && isProxyOrConnError) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      if (originalRequest.baseURL === '/api' || !originalRequest.baseURL) {
        originalRequest.baseURL = 'http://127.0.0.1:5001/api';
        return api.request(originalRequest);
      }
    }
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// 1. Auth Services
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: (customToken) => api.get('/auth/me', customToken ? { headers: { Authorization: `Bearer ${customToken}` } } : {}),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// 2. Product Services
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  adminGetProducts: (params) => api.get('/products/admin/all', { params }),
  createProduct: (data) => api.post('/products/admin', data),
  updateProduct: (id, data) => api.put(`/products/admin/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/admin/${id}`),
  togglePublish: (id) => api.patch(`/products/admin/${id}/publish`)
};

// 3. Category Services
export const categoryService = {
  getCategories: () => api.get('/categories'),
  adminGetCategories: () => api.get('/categories/admin/all'),
  createCategory: (data) => api.post('/categories/admin', data),
  updateCategory: (id, data) => api.put(`/categories/admin/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/admin/${id}`)
};

// 4. Order Services
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders/my-orders'),
  getOrderById: (orderNumber) => api.get(`/orders/${orderNumber}`),
  cancelOrder: (id, data) => api.post(`/orders/${id}/cancel`, data || {}),
  adminGetOrders: (params) => api.get('/orders/admin/all', { params }),
  adminUpdateOrderStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),
  adminUpdateStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data)
};

// 5. Coupon Services
export const couponService = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate', { code, subtotal }),
  applyCoupon: (data) => api.post('/coupons/apply', data),
  adminGetCoupons: () => api.get('/coupons/admin'),
  createCoupon: (data) => api.post('/coupons/admin', data),
  toggleCoupon: (id) => api.patch(`/coupons/admin/${id}/toggle`),
  deleteCoupon: (id) => api.delete(`/coupons/admin/${id}`)
};

// 6. Banner Services
export const bannerService = {
  getBanners: () => api.get('/banners'),
  adminGetBanners: () => api.get('/banners/admin/all'),
  createBanner: (data) => api.post('/banners/admin', data),
  updateBanner: (id, data) => api.put(`/banners/admin/${id}`, data),
  deleteBanner: (id) => api.delete(`/banners/admin/${id}`)
};

// 7. Admin File Upload & Operations Services
export const adminService = {
  uploadSingle: (formData) =>
    api.post('/admin/uploads/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadMultiple: (formData) =>
    api.post('/admin/uploads/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getDashboardStats: () => api.get('/admin/dashboard'),
  getInventory: () => api.get('/admin/inventory'),
  adjustStock: (data) => api.post('/admin/inventory/adjust', data),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  toggleCustomerStatus: (id) => api.patch(`/admin/customers/${id}/toggle`),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  updateAdminCredentials: (data) => api.put('/admin/settings/credentials', data),
  testStorage: () => api.post('/admin/uploads/test-connection'),
  getMediaSyncStatus: () => api.get('/admin/uploads/sync-status'),
  retryMediaSync: (data) => api.post('/admin/uploads/sync-retry', data || {}),
  migrateCloudinaryToLocal: () => api.post('/admin/uploads/migrate-to-local'),
  deleteMedia: (data) => api.post('/admin/uploads/delete', data)
};

// 8. Analytics Services
export const analyticsService = {
  getDashboardStats: () => api.get('/admin/dashboard')
};

// 9. Payment Services (Razorpay & Online Checkout)
export const paymentService = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verifyPayment: (data) => api.post('/payments/verify', data)
};

// 10. Public Store Settings Service (Customer Storefront sync)
export const settingsService = {
  getSettings: () => api.get('/settings')
};

// 10. Customer Reviews & Feedback Services
export const reviewService = {
  getReviews: (params) => api.get('/reviews', { params }),
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  createReview: (data) => api.post('/reviews', data),
  uploadImages: (formData) =>
    api.post('/reviews/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadImage: (formData) =>
    api.post('/uploads/public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// 11. Customer Inquiries & Contact Messages
export const inquiryService = {
  submitInquiry: (data) => api.post('/inquiries', data),
  getInquiries: () => api.get('/inquiries'),
  updateStatus: (id, status) => api.patch(`/inquiries/${id}/status`, { status }),
  deleteInquiry: (id) => api.delete(`/inquiries/${id}`)
};

// 12. Notification & Social Tracking Services
export const notificationService = {
  recordSocialClick: (platform) => api.post('/notifications/social-click', { platform }),
  getAdminNotifications: (params) => api.get('/admin/notifications', { params }),
  markAsRead: (id) => api.patch(`/admin/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/admin/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`)
};

export default api;
