import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Universal authentication & authorization guard.
 * Supports customer route protection (preserving intended destination)
 * and admin route protection with 403 role-based enforcement.
 */
export default function ProtectedRoute({ children, element, adminOnly = false }) {
  const { isAuthenticated, isAdmin, isAdminAuthenticated, adminUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(111,31,78,0.5), transparent 70%), #12020e',
          color: 'var(--gold2)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✦</div>
          <p style={{ letterSpacing: '0.1em' }}>Authenticating...</p>
        </div>
      </div>
    );
  }

  // Admin route protection
  if (adminOnly) {
    if (!isAdminAuthenticated && !adminUser && !isAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (!isAdmin && adminUser?.role !== 'admin') {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(111,31,78,0.5), transparent 70%), #12020e',
            color: '#fff',
            padding: '24px',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid #ef4444',
              margin: '0 auto 16px',
              display: 'grid',
              placeItems: 'center',
              color: '#fca5a5',
              fontSize: '24px'
            }}
          >
            ✕
          </div>
          <h2
            style={{
              color: '#fca5a5',
              fontSize: '26px',
              fontFamily: 'var(--font-serif)',
              marginBottom: '8px'
            }}
          >
            Access Denied (403)
          </h2>
          <p
            style={{
              maxWidth: '440px',
              color: 'var(--cream)',
              opacity: 0.85,
              fontSize: '14px',
              lineHeight: 1.6,
              marginBottom: '24px'
            }}
          >
            Administrator privileges required. Your customer account does not have authorization to view this panel.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/admin/login"
              style={{
                background: 'linear-gradient(135deg, #f6dda0, #d4af37)',
                color: '#1a0418',
                padding: '10px 24px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign in as Administrator →
            </a>
            <a
              href="/"
              style={{
                background: 'rgba(255,240,208,0.08)',
                border: '1px solid var(--line)',
                color: 'var(--cream)',
                padding: '10px 24px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              ← Customer Storefront
            </a>
          </div>
        </div>
      );
    }
    return children || element;
  }

  // Customer route protection
  if (!isAuthenticated) {
    const targetUrl = location.pathname + location.search;
    sessionStorage.setItem('tee_login_redirect', targetUrl);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || element;
}
