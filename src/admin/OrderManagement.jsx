import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Eye, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { orderService } from '../services/api';
import { useStore } from '../context/StoreContext';

const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'];

export default function OrderManagement({ onBack }) {
  const { storeName } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Edit states for Order Modal
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 3500);
  };

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await orderService.adminGetOrders({ search, status: statusFilter });
      if (res.success) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const refreshAll = () => {
    loadOrders();
  };

  useEffect(() => {
    loadOrders();

    // Periodic live sync every 5 seconds so any update in user page shows in admin page immediately
    const pollInterval = setInterval(() => {
      loadOrders(true);
    }, 5000);

    const handleUpdate = () => {
      loadOrders(true);
    };

    window.addEventListener('orders_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    const handleStorage = (e) => {
      if (e.key === 'tee_orders_last_updated') handleUpdate();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('orders_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [statusFilter]);

  const openDetails = (ord) => {
    setSelectedOrder(ord);
    setEditStatus(ord.order_status);
    setEditTracking(ord.tracking_number || '');
    setEditPaymentStatus(ord.payment_status || 'pending');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const res = await orderService.adminUpdateStatus(selectedOrder.id, {
        order_status: editStatus,
        tracking_number: editTracking,
        payment_status: editPaymentStatus
      });
      if (res.success) {
        showToast(`Order #${selectedOrder.order_number} updated.`);
        setSelectedOrder(res.order);
        setOrders((prev) => prev.map((o) => (o.id === res.order.id ? res.order : o)));
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update order.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePrintInvoice = (order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank', 'width=880,height=920');
    if (!printWindow) {
      showToast('Please allow popups to open and print the invoice.', 'error');
      return;
    }

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      : new Date().toLocaleDateString('en-IN');

    const itemsHtml = (order.items || [])
      .map(
        (it, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <strong style="color: #111;">${it.product_name || 'Handcrafted Heritage Jewellery'}</strong>
          ${it.variant_name ? `<br/><small style="color: #6b7280;">Variant: ${it.variant_name}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">7117</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${it.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(it.price || it.unit_price || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111;">₹${(Number(it.price || it.unit_price || 0) * it.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');

    const subtotal = Number(order.total_amount || 0);
    const discount = Number(order.discount_amount || 0);
    const total = subtotal;

    const invoiceContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Tax Invoice - ${order.order_number}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 28px; color: #1f2937; line-height: 1.45; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e5e7eb; padding-bottom: 18px; margin-bottom: 20px; }
          .brand-title { font-size: 26px; font-weight: 700; color: #831843; margin: 0; font-family: "Cormorant Garamond", Georgia, serif; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 22px; }
          .meta-block { background: #f9fafb; padding: 14px; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
          th { background: #f3f4f6; padding: 8px 10px; border-bottom: 2px solid #d1d5db; font-size: 11px; text-transform: uppercase; }
          .summary-table { width: 300px; margin-left: auto; margin-bottom: 24px; font-size: 12.5px; }
          .summary-table td { padding: 4px 0; }
          .grand-total { font-size: 15px; font-weight: 700; color: #831843; border-top: 2px solid #111; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="brand-title">${storeName || 'Vwalah'}</h1>
            <p style="margin: 4px 0 0; color: #6b7280; font-size: 11px;">Fine Authentic Imitation &amp; Temple Jewellery</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #831843; font-size: 18px;">TAX INVOICE</h2>
            <div style="font-size: 12px; margin-top: 4px;"><strong>Order Ref:</strong> #${order.order_number}</div>
            <div style="font-size: 12px;"><strong>Date:</strong> ${orderDate}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-block">
            <h4 style="margin: 0 0 6px; text-transform: uppercase;">Billed &amp; Shipped To</h4>
            <div style="font-weight: 600;">${order.customer_name || 'Valued Patron'}</div>
            <div>${order.shipping_address || 'Address provided on file'}</div>
            <div>Phone: ${order.customer_phone || 'N/A'} · Email: ${order.customer_email || 'N/A'}</div>
          </div>
          <div class="meta-block">
            <h4 style="margin: 0 0 6px; text-transform: uppercase;">Payment &amp; Logistics</h4>
            <div><strong>Payment Mode:</strong> ${order.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online Payment'}</div>
            <div><strong>Payment Status:</strong> ${(order.payment_status || 'Paid').toUpperCase()}</div>
            <div><strong>Fulfillment Status:</strong> ${(order.order_status || 'Processing').toUpperCase()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th style="text-align: left;">Item Description</th>
              <th>HSN</th>
              <th>Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="summary-table">
          <tr class="grand-total">
            <td style="padding-top: 8px;">Total Paid:</td>
            <td style="padding-top: 8px; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(invoiceContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '84px', right: '28px', background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)', color: toastType === 'error' ? '#fff' : '#1a0418', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, fontSize: '14px', zIndex: 9999, border: toastType === 'error' ? '1px solid #fca5a5' : 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid var(--gold)',
              color: 'var(--gold2)',
              padding: '8px 16px',
              borderRadius: '999px',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            title="Go Back"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'var(--gold2)', margin: 0 }}>
              Customer Orders &amp; Logistics
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Manage shipments, customer cancellations, order fulfilment, and payments.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          title="Live refresh all orders from database"
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            border: '1px solid var(--gold)',
            background: 'rgba(212,175,55,0.15)',
            color: 'var(--gold2)',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          ↻ Live Sync
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', background: '#1c0418', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
            <form onSubmit={(e) => { e.preventDefault(); loadOrders(); }} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '240px' }}>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by order #, customer name, email..."
                style={{ flex: 1, background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
              />
              <button type="submit" style={{ background: 'var(--gold)', color: 'var(--ink)', border: 0, padding: '10px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
                Search
              </button>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ background: '#24061d', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: '8px', color: 'var(--cream)', fontSize: '13px' }}
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Orders Table */}
          <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ maxHeight: '420px', overflowY: 'auto', position: 'relative' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: '#24061d', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <tr style={{ background: 'rgba(229,189,114,0.08)', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
                    <th style={{ padding: '12px 16px' }}>Order Number</th>
                    <th style={{ padding: '12px 16px' }}>Date</th>
                    <th style={{ padding: '12px 16px' }}>Customer</th>
                    <th style={{ padding: '12px 16px' }}>Payment Mode</th>
                    <th style={{ padding: '12px 16px' }}>Total Amount</th>
                    <th style={{ padding: '12px 16px' }}>Fulfillment Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                        Loading orders...
                      </td>
                    </tr>
                  ) : orders.length > 0 ? (
                    orders.map((ord) => {
                      const isCancelled = ord.order_status === 'Cancelled';

                      return (
                        <tr key={ord.id} style={{ borderBottom: '1px solid rgba(229,189,114,0.1)' }}>
                          <td style={{ padding: '12px 16px', color: 'var(--gold2)', fontWeight: 600 }}>
                            #{ord.order_number}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--cream)', opacity: 0.8 }}>
                            {new Date(ord.createdAt).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 500, color: 'var(--cream)' }}>{ord.customer_name}</div>
                            <small style={{ color: 'var(--gold)', opacity: 0.7 }}>{ord.customer_email}</small>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ color: ord.payment_status === 'paid' ? '#4ade80' : '#fca5a5', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600 }}>
                                {ord.payment_status} ({ord.payment_method})
                              </span>
                              {ord.notes && ord.notes.includes('razorpay_payment_id') && (
                                <small style={{ color: '#38bdf8', fontSize: '10px' }}>⚡ Razorpay Verified</small>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--gold2)', fontWeight: 600 }}>
                            {inr(ord.total_amount)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              <span
                                style={{
                                  padding: '3px 10px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  background: isCancelled
                                    ? 'rgba(239,68,68,0.2)'
                                    : ord.order_status === 'Delivered'
                                    ? 'rgba(74,222,128,0.2)'
                                    : 'rgba(212,175,55,0.2)',
                                  color: isCancelled
                                    ? '#f87171'
                                    : ord.order_status === 'Delivered'
                                    ? '#4ade80'
                                    : 'var(--gold2)'
                                }}
                              >
                                {ord.order_status}
                              </span>

                              {isCancelled && ord.cancellation_reason && (
                                <small style={{ color: '#fca5a5', fontSize: '10px' }} title={ord.cancellation_reason}>
                                  Reason: {ord.cancellation_reason.slice(0, 24)}...
                                </small>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => openDetails(ord)}
                              style={{ background: 'none', border: 0, color: 'var(--gold)', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                              Manage Order →
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ padding: '30px', textAlign: 'center', opacity: 0.7 }}>
                        No customer orders match the criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* Full Order Details & Status Update Modal */}
      {selectedOrder && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setSelectedOrder(null)}>
          <div className="box" style={{ maxWidth: '720px', padding: '32px' }}>
            <button className="x" aria-label="Close" onClick={() => setSelectedOrder(null)}>
              ×
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '24px', color: 'var(--gold2)' }}>
                  Order #{selectedOrder.order_number}
                </h3>
                <small style={{ color: 'var(--cream)', opacity: 0.7 }}>
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </small>
              </div>
              <button
                type="button"
                onClick={() => handlePrintInvoice(selectedOrder)}
                style={{ background: 'rgba(229,189,114,0.15)', border: '1px solid var(--gold)', color: 'var(--gold2)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}
              >
                🖨️ Print Invoice
              </button>
            </div>

            {/* Cancellation Alert */}
            {selectedOrder.order_status === 'Cancelled' && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                <b style={{ color: '#f87171', display: 'block' }}>Order Cancelled by Customer</b>
                <span style={{ fontSize: '12px', color: 'var(--cream)', opacity: 0.9 }}>
                  Reason: {selectedOrder.cancellation_reason || 'Not specified'}
                  {selectedOrder.cancelled_at && ` · On ${new Date(selectedOrder.cancelled_at).toLocaleString()}`}
                </span>
              </div>
            )}

            {/* Customer & Shipping Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', background: 'rgba(255,240,208,0.04)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)' }}>Customer</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{selectedOrder.customer_name}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>{selectedOrder.customer_email}</div>
                <div style={{ fontSize: '13px', opacity: 0.8 }}>{selectedOrder.customer_phone}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)' }}>Delivery Address</span>
                <div style={{ fontSize: '13px', color: 'var(--cream)', lineHeight: 1.4 }}>
                  {selectedOrder.shipping_address}
                </div>
              </div>
            </div>

            {/* Payment Verification Information */}
            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '12.5px' }}>
              <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '2px' }}>
                Payment Channel &amp; Gateway Details:
              </div>
              <div>Mode: <b>{selectedOrder.payment_method === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online Payment'}</b> · Status: <b style={{ textTransform: 'uppercase', color: selectedOrder.payment_status === 'paid' ? '#4ade80' : '#fca5a5' }}>{selectedOrder.payment_status}</b></div>
              {selectedOrder.notes && (
                <div style={{ marginTop: '4px', opacity: 0.8, wordBreak: 'break-all' }}>
                  Gateway Audit Log: {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Items */}
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: '10px' }}>
              Items in Order
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '14px', marginBottom: '16px' }}>
              {selectedOrder.items && selectedOrder.items.map((it) => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>
                    {it.product_name} {it.variant_name ? `(${it.variant_name})` : ''} × <b>{it.quantity}</b>
                  </span>
                  <span style={{ color: 'var(--gold2)' }}>{inr((it.price || it.unit_price || 0) * it.quantity)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontWeight: 600, fontSize: '15px' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--gold2)' }}>{inr(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'rgba(20,2,16,0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--line)' }}>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                Update Fulfillment &amp; Tracking
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--cream)', display: 'block', marginBottom: '4px' }}>
                    Order Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--cream)', display: 'block', marginBottom: '4px' }}>
                    Payment Status
                  </label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--cream)', display: 'block', marginBottom: '4px' }}>
                    Tracking Number (AWB)
                  </label>
                  <input
                    value={editTracking}
                    onChange={(e) => setEditTracking(e.target.value)}
                    placeholder="e.g. BLUEDART-9823746"
                    style={{ width: '100%', background: 'rgba(255,240,208,0.06)', border: '1px solid var(--line)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="submit" className="gbtn" disabled={saving}>
                  {saving ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
