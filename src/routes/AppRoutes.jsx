import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Landing from '../pages/Landing';
import HomePage from '../pages/HomePage';
import ProductListing from '../pages/ProductListing';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import BuyNow from '../pages/BuyNow';
import Account from '../pages/Account';
import UserSettings from '../pages/UserSettings';
import OrderTracking from '../pages/OrderTracking';
import Wishlist from '../pages/Wishlist';
import Feedback from '../pages/Feedback';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminLogin from '../admin/AdminLogin';
import AdminLayout from '../admin/AdminLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/store" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
      <Route path="/collection/:slug" element={<ProtectedRoute><ProductListing /></ProtectedRoute>} />
      <Route path="/product/:slug" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/buy-now" element={<ProtectedRoute><BuyNow /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/track" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />

      <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRoutes;

