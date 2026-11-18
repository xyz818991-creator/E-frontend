import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LanguageProvider } from './context/LanguageContext';
import { StoreProvider } from './context/StoreContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import HomePage from './pages/HomePage';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BuyNow from './pages/BuyNow';
import Account from './pages/Account';
import UserSettings from './pages/UserSettings';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import Feedback from './pages/Feedback';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Public Brand Landing Page - Open to all visitors */}
                <Route path="/" element={<Landing />} />

                {/* Authentication Pages (Public) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Customer Shopping & Catalogue Browsing (Requires Customer Login) */}
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/store" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
                <Route path="/store/:categorySlug" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
                <Route path="/shop" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
                <Route path="/category/:categorySlug" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
                <Route path="/collections/:categorySlug" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
                <Route path="/collection/:categorySlug" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
                <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                <Route path="/reviews" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
                <Route
                  path="/buy-now"
                  element={
                    <ProtectedRoute>
                      <BuyNow />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <UserSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account/settings"
                  element={
                    <ProtectedRoute>
                      <UserSettings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Account />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/track-order"
                  element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/track-order/:orderNumber"
                  element={
                    <ProtectedRoute>
                      <OrderTracking />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Portal - Role-based Admin Protected */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback - return to landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </StoreProvider>
    </BrowserRouter>
  );
}
