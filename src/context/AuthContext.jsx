import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Customer Session
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_customer_user') || localStorage.getItem('tee_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.role !== 'admin' ? parsed : null;
    } catch (e) {
      return null;
    }
  });

  const [customerToken, setCustomerToken] = useState(() => {
    return localStorage.getItem('tee_customer_token') || localStorage.getItem('tee_auth_token') || null;
  });

  // Admin Session (completely independent)
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tee_admin_user');
      if (stored) return JSON.parse(stored);
      // Legacy fallback
      const legacy = localStorage.getItem('tee_user');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        return parsed?.role === 'admin' ? parsed : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [adminToken, setAdminToken] = useState(() => {
    const adminTok = localStorage.getItem('tee_admin_token');
    if (adminTok) return adminTok;
    const legacyUser = localStorage.getItem('tee_user');
    if (legacyUser && legacyUser.includes('"role":"admin"')) {
      return localStorage.getItem('tee_auth_token') || null;
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Validate Customer Token on load
  useEffect(() => {
    const verifyCustomer = async () => {
      if (customerToken) {
        try {
          const res = await authService.getMe(customerToken);
          if (res.success && res.user) {
            setCustomerUser(res.user);
            localStorage.setItem('tee_customer_user', JSON.stringify(res.user));
            if (res.user.role === 'admin') {
              setAdminUser(res.user);
              setAdminToken(customerToken);
              localStorage.setItem('tee_admin_token', customerToken);
              localStorage.setItem('tee_admin_user', JSON.stringify(res.user));
            }
          }
        } catch (err) {
          console.warn('Customer session expired:', err.message);
          customerLogout();
        }
      }
    };
    verifyCustomer();
  }, [customerToken]);

  // Validate Admin Token on load
  useEffect(() => {
    const verifyAdmin = async () => {
      if (adminToken) {
        try {
          const res = await authService.getMe(adminToken);
          if (res.success && res.user && res.user.role === 'admin') {
            setAdminUser(res.user);
            localStorage.setItem('tee_admin_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.warn('Admin session expired:', err.message);
          adminLogout();
        }
      }
      setLoading(false);
    };
    verifyAdmin();
  }, [adminToken]);

  // Customer Login (Standard customer storefront - supports email or mobile number)
  const customerLogin = async (emailOrPhone, password) => {
    const res = await authService.login({ email: emailOrPhone, phone: emailOrPhone, identifier: emailOrPhone, password });
    if (res.success) {
      setCustomerToken(res.token);
      setCustomerUser(res.user);
      localStorage.setItem('tee_customer_token', res.token);
      localStorage.setItem('tee_customer_user', JSON.stringify(res.user));

      // If the authenticated user is an administrator, also enable admin privileges
      if (res.user && res.user.role === 'admin') {
        setAdminToken(res.token);
        setAdminUser(res.user);
        localStorage.setItem('tee_admin_token', res.token);
        localStorage.setItem('tee_admin_user', JSON.stringify(res.user));
      } else {
        // Normal customer login: completely purge any old admin session
        setAdminToken(null);
        setAdminUser(null);
        localStorage.removeItem('tee_admin_token');
        localStorage.removeItem('tee_admin_user');
      }
    }
    return res;
  };

  // Customer Register
  const customerRegister = async (userData) => {
    const res = await authService.register(userData);
    if (res.success) {
      setCustomerToken(res.token);
      setCustomerUser(res.user);
      localStorage.setItem('tee_customer_token', res.token);
      localStorage.setItem('tee_customer_user', JSON.stringify(res.user));
      // Purge any old admin session
      setAdminToken(null);
      setAdminUser(null);
      localStorage.removeItem('tee_admin_token');
      localStorage.removeItem('tee_admin_user');
    }
    return res;
  };

  // Customer Logout
  const customerLogout = () => {
    setCustomerUser(null);
    setCustomerToken(null);
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('tee_customer_token');
    localStorage.removeItem('tee_customer_user');
    localStorage.removeItem('tee_auth_token');
    localStorage.removeItem('tee_user');
    localStorage.removeItem('tee_admin_token');
    localStorage.removeItem('tee_admin_user');
    sessionStorage.removeItem('tee_login_redirect');
  };

  // Admin Login (Separate admin portal)
  const adminLogin = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success) {
      if (res.user.role !== 'admin') {
        throw new Error('Access denied: Administrator permissions required.');
      }
      setAdminToken(res.token);
      setAdminUser(res.user);
      localStorage.setItem('tee_admin_token', res.token);
      localStorage.setItem('tee_admin_user', JSON.stringify(res.user));
    }
    return res;
  };

  // Admin Logout
  const adminLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('tee_admin_token');
    localStorage.removeItem('tee_admin_user');
    // Also clean up any mirrored customer tokens for this admin session
    if (customerUser?.role === 'admin') {
      setCustomerUser(null);
      setCustomerToken(null);
      localStorage.removeItem('tee_customer_token');
      localStorage.removeItem('tee_customer_user');
    }
  };

  const updateCustomerUser = (updated) => {
    setCustomerUser((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem('tee_customer_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        // Customer state & methods
        user: customerUser,
        token: customerToken,
        customerUser,
        customerToken,
        isAuthenticated: !!customerToken && !!customerUser,
        login: customerLogin,
        register: customerRegister,
        logout: customerLogout,
        updateUser: updateCustomerUser,

        // Admin state & methods
        adminUser: adminUser || (customerUser?.role === 'admin' ? customerUser : null),
        adminToken: adminToken || (customerUser?.role === 'admin' ? customerToken : null),
        isAdminAuthenticated: (!!adminToken && adminUser?.role === 'admin') || (!!customerToken && customerUser?.role === 'admin'),
        isAdmin: adminUser?.role === 'admin' || customerUser?.role === 'admin',
        adminLogin,
        adminLogout,

        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
