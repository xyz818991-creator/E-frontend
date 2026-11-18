import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService, reviewService } from '../services/api';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  FileText,
  Download,
  X,
  AlertTriangle
} from 'lucide-react';
import { printOrderInvoice } from '../utils/invoiceGenerator';
import '../EthnicEdit.css';

const parsePrice = (val) => {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const inr = (n) => {
  const num = parsePrice(n);
  return '₹' + Math.round(num).toLocaleString('en-IN');
};

const ORDER_STEPS = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];

export default function OrderTracking({ initialOrderNumber, onClose }) {
  const params = useParams();
  const navigate = useNavigate();
  const { storeSettings, storeName } = useStore();
  const activeOrderNum = initialOrderNumber || params.orderNumber || '';

  const [query, setQuery] = useState(activeOrderNum === 'prompt' ? '' : activeOrderNum);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cancellation State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelCustomReason, setCancelCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Feedback State
  const [actionFeedback, setActionFeedback] = useState({ type: '', text: '' });

  const fetchOrder = async (orderNum) => {
    if (!orderNum) return;
    setLoading(true);
    setError('');
    setActionFeedback({ type: '', text: '' });
    try {
      const res = await orderService.getOrderById(orderNum.trim());
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setError('Order not found. Please verify the order number.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to locate order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrderNum && activeOrderNum !== 'prompt') {
      fetchOrder(activeOrderNum);
    }
  }, [activeOrderNum]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrder(query);
  };

  const getStepStatus = (stepName) => {
    if (!order) return 'upcoming';
    const currentStatus = order.order_status || order.status || 'Pending';
    if (currentStatus === 'Cancelled') return 'cancelled';
    const currentIndex = ORDER_STEPS.findIndex((s) => s.toLowerCase() === currentStatus.toLowerCase());
    const stepIndex = ORDER_STEPS.findIndex((s) => s.toLowerCase() === stepName.toLowerCase());
    if (stepIndex < (currentIndex === -1 ? 1 : currentIndex)) return 'completed';
    if (stepIndex === (currentIndex === -1 ? 1 : currentIndex)) return 'current';
    return 'upcoming';
  };

  const currentStatusStr = (order?.order_status || order?.status || 'Pending').toLowerCase();
  const isPrePacked = ['pending', 'confirmed', 'processing', 'placed'].includes(currentStatusStr);
  const isPostPacked = ['packed', 'shipped', 'out for delivery', 'delivered'].includes(currentStatusStr);
  const isDelivered = currentStatusStr === 'delivered';
  const isCancelled = currentStatusStr === 'cancelled';

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!order) return;

    if (isPostPacked) {
      setActionFeedback({
        type: 'error',
        text: 'Cancellation is not allowed after the order has been packed.'
      });
      setCancelModalOpen(false);
      return;
    }

    setCancelling(true);
    setActionFeedback({ type: '', text: '' });
    try {
      const finalReason = cancelReason === 'Other' ? (cancelCustomReason || 'Customer requested cancellation') : cancelReason;
      const res = await orderService.cancelOrder(order.id || order.order_number, { reason: finalReason });
      if (res.success) {
        setOrder((prev) => ({
          ...prev,
          order_status: 'Cancelled',
          cancellation_reason: finalReason,
          cancelled_at: new Date().toISOString()
        }));
        try { window.dispatchEvent(new Event('orders_updated')); } catch (e) {}
        try { localStorage.setItem('tee_orders_last_updated', Date.now().toString()); } catch (e) {}
        setActionFeedback({
          type: 'success',
          text: 'Your order has been cancelled successfully and product inventory has been automatically restocked.'
        });
        setCancelModalOpen(false);
      } else {
        setActionFeedback({ type: 'error', text: res.message || 'Failed to cancel order.' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Cancellation is not allowed after the order has been packed.';
      setActionFeedback({ type: 'error', text: msg });
    } finally {
      setCancelling(false);
    }
  };

  const content = (
    <div className="box" style={{ maxWidth: '820px', width: '100%', padding: '36px', background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid var(--line)', borderRadius: '24px' }}>
      {onClose && (
        <button className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>
      )}

      <div className="kick" style={{ color: 'var(--gold2)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '6px' }}>
        Logistics Milestone
      </div>
      <h2 style={{ fontSize: '32px', fontFamily: '"Cormorant Garamond", serif', color: 'var(--gold2)', margin: '0 0 8px' }}>
        Track Your Jewellery Consignment
      </h2>
      <p style={{ color: 'var(--cream)', opacity: 0.8, fontSize: '14px', marginBottom: '24px' }}>
        Enter your order reference number to see real-time dispatch, transit milestones, courier details, and cancellations.
      </p>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. TEE-ORD-8821"
          style={{
            flex: 1,
            background: 'rgba(255,240,208,0.07)',
            border: '1px solid var(--gold)',
            borderRadius: '999px',
            padding: '12px 20px',
            color: '#fff',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
        <button className="gbtn" type="submit" disabled={loading} style={{ padding: '12px 28px' }}>
          {loading ? 'Searching...' : 'Track Milestone'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '12px 18px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Global Feedback Banner */}
      {actionFeedback.text && (
        <div
          style={{
            background: actionFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(34, 197, 94, 0.18)',
            border: `1px solid ${actionFeedback.type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
            color: actionFeedback.type === 'error' ? '#fca5a5' : '#86efac',
            padding: '12px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <span>{actionFeedback.text}</span>
          <button
            type="button"
            onClick={() => setActionFeedback({ type: '', text: '' })}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Order Details View */}
      {order && (
        <div style={{ background: 'rgba(20,2,16,0.6)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px' }}>
          {/* Header Info & Action Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--line)', paddingBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7 }}>Order ID</span>
              <h4 style={{ margin: '2px 0 0', fontSize: '18px', color: 'var(--gold2)' }}>
                #{order.order_number}
              </h4>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Cancellation Button (Only pre-packed) */}
              {isPrePacked && !isCancelled && (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.45)',
                    color: '#fca5a5',
                    borderRadius: '999px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Cancel Order (Before item is packed)"
                >
                  <X size={13} /> Cancel Order
                </button>
              )}

              {/* Locked Cancellation Tooltip/Button for packed/shipped */}
              {isPostPacked && !isDelivered && !isCancelled && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--cream)',
                    opacity: 0.6,
                    padding: '6px 12px',
                    border: '1px dashed var(--line)',
                    borderRadius: '999px'
                  }}
                  title="Cancellation is locked after order has been packed"
                >
                  🔒 Order Packed (Non-cancellable)
                </span>
              )}
            </div>
          </div>

          {/* Cancellation Notice Banner */}
          {isCancelled && (
            <div
              style={{
                marginTop: '16px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <b style={{ color: '#f87171', display: 'block', fontSize: '14px' }}>Order Cancelled</b>
                <span style={{ fontSize: '12.5px', color: 'var(--cream)', opacity: 0.9 }}>
                  {order.cancellation_reason ? `Reason: ${order.cancellation_reason}` : 'This consignment has been cancelled.'}
                  {order.cancelled_at && ` · Cancelled on ${new Date(order.cancelled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                </span>
                <div style={{ fontSize: '11.5px', color: '#4ade80', marginTop: '4px' }}>
                  ✓ Product inventory has been safely restored to live store catalogue.
                </div>
              </div>
            </div>
          )}

          {/* Stepper Timeline (Only when not cancelled) */}
          {!isCancelled && (
            <div style={{ margin: '28px 0', padding: '12px 0', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', minWidth: '480px' }}>
                <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', height: '2px', background: 'rgba(212,175,55,0.2)', zIndex: 0 }} />

                {['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => {
                  const status = getStepStatus(step);
                  const isCompleted = status === 'completed';
                  const isCurrent = status === 'current';

                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, width: '70px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isCompleted ? '#4ade80' : isCurrent ? 'var(--gold2)' : '#24061d',
                          border: isCurrent ? '3px solid #f6dda0' : '2px solid var(--line)',
                          color: isCompleted || isCurrent ? '#1a0418' : 'var(--cream)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s'
                        }}
                      >
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span
                        style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          textAlign: 'center',
                          color: isCurrent ? 'var(--gold2)' : 'var(--cream)',
                          fontWeight: isCurrent ? 600 : 400,
                          opacity: isCompleted || isCurrent ? 1 : 0.6
                        }}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Courier Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: 'rgba(255,240,208,0.03)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', fontSize: '13px', marginTop: '16px' }}>
            <div>
              <span style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Logistics Partner</span>
              <div style={{ fontWeight: 600, color: 'var(--gold2)', marginTop: '2px' }}>
                {order.tracking_carrier || 'BlueDart Express'}
              </div>
            </div>
            <div>
              <span style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Tracking AWB / Docket</span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>
                {order.tracking_number || 'BD-847291039'}
              </div>
            </div>
            <div>
              <span style={{ opacity: 0.7, fontSize: '11px', textTransform: 'uppercase' }}>Shipping Destination</span>
              <div style={{ marginTop: '2px', opacity: 0.9 }}>
                {order.shipping_address || 'Chennai, Tamil Nadu'}
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && (
            <div style={{ marginTop: '20px', borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--gold2)' }}>
                Items in Consignment:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map((it, idx) => {
                  let unitPrice = parsePrice(it.price ?? it.unit_price ?? it.selling_price ?? it.amount);
                  if (!unitPrice && order.total_amount && order.items.length) {
                    unitPrice = Math.round(parsePrice(order.total_amount) / order.items.length);
                  }
                  const qty = parseInt(it.quantity, 10) || 1;
                  const itemTotal = unitPrice * qty;
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{qty} × {it.product_name || 'Heirloom Piece'}</span>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--gold2)' }}>{inr(itemTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.75)', display: 'grid', placeItems: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '480px', background: 'linear-gradient(160deg, #3a0b2d, #230419)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '24px', padding: '30px', position: 'relative' }}>
            <button
              onClick={() => setCancelModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '24px', color: '#fca5a5', margin: '0 0 8px' }}>
              Cancel Order #{order?.order_number}
            </h3>
            <p style={{ fontSize: '13px', opacity: 0.85, margin: '0 0 16px', lineHeight: 1.5 }}>
              Orders can only be cancelled while in <b>Pending</b>, <b>Confirmed</b>, or <b>Processing</b> state before packaging begins.
            </p>

            <form onSubmit={handleCancelOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                  Reason for Cancellation *
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px' }}
                >
                  <option value="Ordered by mistake" style={{ background: '#24061d' }}>Ordered by mistake</option>
                  <option value="Found better alternative" style={{ background: '#24061d' }}>Found another piece / alternative</option>
                  <option value="Delivery timeline too long" style={{ background: '#24061d' }}>Delivery timeline too long</option>
                  <option value="Need to change shipping address" style={{ background: '#24061d' }}>Need to change shipping address</option>
                  <option value="Payment / budget issues" style={{ background: '#24061d' }}>Payment or budget reconsideration</option>
                  <option value="Other" style={{ background: '#24061d' }}>Other reason</option>
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div>
                  <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                    Please Specify Reason
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter reason..."
                    value={cancelCustomReason}
                    onChange={(e) => setCancelCustomReason(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={cancelling}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    padding: '11px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    cursor: cancelling ? 'not-allowed' : 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    color: 'var(--cream)',
                    padding: '11px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Keep Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If used as modal
  if (onClose) {
    return (
      <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && onClose()}>
        {content}
      </div>
    );
  }

  // Otherwise rendered as full page
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--cream)' }}>
      {/* Header */}
      <header className="nav sc" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <Link className="brand" to="/" aria-label={`${storeName} home`}>
          <span className="logo"></span>
          <span>
            <b>{storeName}</b>
            <small>{storeSettings.tagline || 'Tradition, Beautifully Curated.'}</small>
          </span>
        </Link>
        <nav className="menu open" style={{ display: 'flex' }}>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/account">Account</Link>
        </nav>
      </header>

      {/* Main Page Body */}
      <main style={{ flex: 1, maxWidth: '880px', width: '100%', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/orders" style={{ color: 'var(--gold2)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: 'rgba(212,175,55,0.08)', border: '1px solid var(--line)', padding: '6px 14px', borderRadius: '999px' }}>
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <Link to="/" style={{ color: 'var(--gold)', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', opacity: 0.8 }}>
            Return to Store
          </Link>
        </div>
        {content}
      </main>

      {/* Footer with Powered by Aminoid */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--line)', padding: '24px', background: 'var(--panel)', fontSize: '13px' }}>
        <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span>© {new Date().getFullYear()} {storeName}. All rights reserved.</span>
          <span>
            Powered by{' '}
            <a href="https://www.aminoid.in/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold2)', textDecoration: 'none', fontWeight: 500 }}>
              Aminoid
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
