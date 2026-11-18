import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Phone, Calendar, Clock, CheckCircle, Trash2, MessageSquare, RefreshCw, Eye } from 'lucide-react';
import { inquiryService } from '../services/api';

export default function InquiriesManagement({ onBack }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await inquiryService.getInquiries();
      if (res && res.success && Array.isArray(res.inquiries)) {
        setInquiries(res.inquiries);
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await inquiryService.updateStatus(id, status);
      if (res && res.success) {
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status }));
        }
        showToast(`Inquiry marked as ${status}`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer inquiry?')) return;
    try {
      const res = await inquiryService.deleteInquiry(id);
      if (res && res.success) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry(null);
        }
        showToast('Inquiry deleted successfully.');
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      showToast('Failed to delete inquiry.');
    }
  };

  const filtered = inquiries.filter((inq) => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: 'rgba(212,175,55,0.95)', color: '#1a0418', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
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
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--gold2)', margin: '0 0 4px' }}>
              Customer Inquiries &amp; Messages
            </h1>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.75 }}>
              Messages submitted by visitors through the storefront contact form
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={fetchInquiries}
            className="gbtn"
            style={{ padding: '8px 16px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,240,208,0.03)', border: '1px solid var(--line)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
        {[
          { key: 'all', label: `All (${inquiries.length})` },
          { key: 'new', label: `New (${inquiries.filter((i) => i.status === 'new').length})` },
          { key: 'read', label: `Read (${inquiries.filter((i) => i.status === 'read').length})` },
          { key: 'replied', label: `Replied (${inquiries.filter((i) => i.status === 'replied').length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              background: filter === tab.key ? 'var(--gold)' : 'transparent',
              color: filter === tab.key ? '#1a0418' : 'var(--cream)',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inquiries Table / List with Scroll Type */}
      <div style={{ background: '#1c0418', border: '1px solid var(--line)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: '#24061d', borderBottom: '1px solid var(--line)', color: 'var(--gold)' }}>
              <tr>
                <th style={{ padding: '12px 16px' }}>Sender</th>
                <th style={{ padding: '12px 16px' }}>Contact Details</th>
                <th style={{ padding: '12px 16px' }}>Message Preview</th>
                <th style={{ padding: '12px 16px' }}>Date Received</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                    Loading inquiries...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '40px', textAlign: 'center', opacity: 0.7 }}>
                    No customer inquiries found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((inq) => (
                  <tr
                    key={inq.id}
                    style={{
                      borderBottom: '1px solid rgba(229,189,114,0.1)',
                      background: inq.status === 'new' ? 'rgba(212,175,55,0.04)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: inq.status === 'new' ? 'var(--gold)' : 'rgba(255,240,208,0.15)', color: inq.status === 'new' ? '#1a0418' : '#fff', display: 'grid', placeItems: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                          {inq.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: inq.status === 'new' ? 'var(--gold2)' : 'var(--cream)' }}>
                            {inq.name}
                          </div>
                          {inq.status === 'new' && (
                            <span style={{ fontSize: '10px', background: '#eab308', color: '#1a0418', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <a href={`mailto:${inq.email}`} style={{ color: 'var(--gold2)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={12} /> {inq.email}
                        </a>
                        {inq.phone && (
                          <span style={{ opacity: 0.75, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Phone size={12} /> {inq.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '320px' }}>
                      <p style={{ margin: 0, fontSize: '12.5px', opacity: 0.88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inq.message}
                      </p>
                    </td>
                    <td style={{ padding: '14px 16px', opacity: 0.75, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Clock size={12} /> {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {inq.status === 'new' && (
                        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.3)', fontWeight: 600 }}>
                          ● New
                        </span>
                      )}
                      {inq.status === 'read' && (
                        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }}>
                          Read
                        </span>
                      )}
                      {inq.status === 'replied' && (
                        <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11px', background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)' }}>
                          ✓ Replied
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedInquiry(inq);
                            if (inq.status === 'new') handleUpdateStatus(inq.id, 'read');
                          }}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--gold2)', background: 'rgba(212,175,55,0.12)', color: 'var(--gold2)', fontSize: '12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          onClick={() => handleDelete(inq.id)}
                          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', fontSize: '12px', cursor: 'pointer' }}
                          title="Delete message"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to view full message */}
      {selectedInquiry && (
        <div className="ov on" onClick={(e) => e.target.classList.contains('ov') && setSelectedInquiry(null)}>
          <div className="box" style={{ maxWidth: '580px', padding: '32px', background: 'linear-gradient(160deg, #320726, #1c0316)', border: '1px solid var(--gold)', borderRadius: '20px' }}>
            <button className="x" aria-label="Close" onClick={() => setSelectedInquiry(null)}>
              ×
            </button>
            <div className="kick" style={{ color: 'var(--gold2)', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>
              Customer Message
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--gold2)', margin: '0 0 16px' }}>
              {selectedInquiry.name}
            </h3>

            <div style={{ background: 'rgba(255,240,208,0.04)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Email Address</span>
                <a href={`mailto:${selectedInquiry.email}`} style={{ color: 'var(--gold2)', textDecoration: 'none' }}>
                  {selectedInquiry.email}
                </a>
              </div>
              <div>
                <span style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Phone</span>
                <span>{selectedInquiry.phone || 'Not provided'}</span>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <span style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', display: 'block' }}>Received At</span>
                <span>{new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: 'var(--gold)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Message</span>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: '12px', padding: '16px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedInquiry.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <a
                href={`mailto:${selectedInquiry.email}?subject=Re: Inquiry with Vwalah&body=Dear ${encodeURIComponent(selectedInquiry.name)},%0D%0A%0D%0AThank you for reaching out to us.`}
                onClick={() => handleUpdateStatus(selectedInquiry.id, 'replied')}
                className="gbtn"
                style={{ padding: '8px 18px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Mail size={14} /> Reply via Email
              </a>
              {selectedInquiry.status !== 'replied' && (
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry.id, 'replied')}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #22c55e', background: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '13px', cursor: 'pointer' }}
                >
                  Mark as Replied
                </button>
              )}
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--line)', color: '#fff', background: 'none', cursor: 'pointer', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

