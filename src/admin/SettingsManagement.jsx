import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, Shield, Eye, EyeOff, Lock, UserCheck } from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SettingsManagement({ onBack }) {
  const { adminUser } = useAuth();
  const [settings, setSettings] = useState({
    store_name: 'Vwalah',
    tagline: 'Tradition, Beautifully Curated.',
    contact_email: 'hello@vwalah.com',
    contact_phone: '+91 98765 43210',
    contact_hours: 'Mon–Sat, 10am–7pm IST',
    about_story: 'Vwalah brings together temple-inspired designs, antique gold finishes and delicate pearl work, curated for weddings, festivals and every moment worth celebrating.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  // Admin Credentials Management State
  const [adminEmail, setAdminEmail] = useState(adminUser?.email || '');
  const [adminName, setAdminName] = useState(adminUser?.name || 'Administrator');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingAuth, setUpdatingAuth] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 4000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminService.getSettings();
        if (res.success && res.settings) {
          setSettings((prev) => ({ ...prev, ...res.settings }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminService.updateSettings(settings);
      if (res.success) {
        showToast('Store settings saved successfully!');
        // Broadcast custom event so all active tabs and pages update immediately
        try {
          window.dispatchEvent(new Event('store_settings_updated'));
          window.dispatchEvent(new Event('catalog_updated'));
          localStorage.setItem('ethnic_store_settings', JSON.stringify(settings));
          localStorage.setItem('tee_catalog_version', Date.now().toString());
        } catch (e) {}
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAdminAuth = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error');
      return;
    }
    if (newPassword && !currentPassword) {
      showToast('Please enter your current administrator password to confirm change.', 'error');
      return;
    }

    setUpdatingAuth(true);
    try {
      const payload = {
        name: adminName,
        email: adminEmail
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      const res = await adminService.updateAdminCredentials(payload);
      if (res.success) {
        showToast('Administrator credentials updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        if (res.user) {
          localStorage.setItem('tee_admin_user', JSON.stringify(res.user));
          setAdminEmail(res.user.email);
          setAdminName(res.user.name);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update admin credentials.', 'error');
    } finally {
      setUpdatingAuth(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '84px', right: '28px', background: toastType === 'error' ? 'rgba(239,68,68,0.95)' : 'linear-gradient(135deg, #f6dda0, #d4af37)', color: toastType === 'error' ? '#fff' : '#1a0418', padding: '12px 22px', borderRadius: '999px', fontWeight: 600, fontSize: '14px', zIndex: 9999, border: toastType === 'error' ? '1px solid #fca5a5' : 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {toastType === 'error' ? '⚠ ' : '✓ '} {toast}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
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
            Store Settings
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
            Updates here automatically sync across the user storefront header, navigation brand, footer, and configuration.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Store Brand & Profile Card */}
        <div style={{ background: '#1c0418', padding: '28px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <h3 style={{ fontSize: '16px', color: 'var(--gold2)', margin: '0 0 16px', fontWeight: 600 }}>
            🏪 Store Identity &amp; Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Store Name (Customer Storefront Title)
              </label>
              <input
                type="text"
                name="store_name"
                value={settings.store_name}
                onChange={handleChange}
                required
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                placeholder="e.g. Vwalah"
              />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'block' }}>
                Reflected immediately in navbar brand, page titles, and footers.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Store Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
                placeholder="e.g. Tradition, Beautifully Curated."
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Customer Care Email
              </label>
              <input
                type="email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Customer Care Phone
              </label>
              <input
                type="text"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                Concierge &amp; Working Hours
              </label>
              <input
                type="text"
                name="contact_hours"
                value={settings.contact_hours}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '6px' }}>
                About the Brand Story (Landing Page Narrative)
              </label>
              <textarea
                name="about_story"
                rows={3}
                value={settings.about_story}
                onChange={handleChange}
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', lineHeight: 1.5 }}
              />
            </div>
          </div>
        </div>

        {/* Administrator Credentials & Security Card */}
        <div style={{ background: '#1c0418', padding: '28px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', color: 'var(--gold2)', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} /> Administrator Account &amp; Login Credentials
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--cream)', opacity: 0.75, margin: '4px 0 0' }}>
              Update your administrator login email, display name, and password for accessing the management console.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '6px' }}>
                Admin Display Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Administrator"
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '6px' }}>
                Admin Login Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@vwalah.com"
                style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(212,175,55,0.12)', paddingTop: '16px', marginTop: '16px' }}>
            <h4 style={{ fontSize: '13px', color: 'var(--gold2)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> Change Admin Password
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                  New Password (min 6 chars)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gold)', cursor: 'pointer' }}
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  style={{ width: '100%', background: '#24061d', border: '1px solid var(--line)', color: '#fff', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleUpdateAdminAuth}
                disabled={updatingAuth}
                style={{
                  background: 'rgba(212,175,55,0.15)',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold2)',
                  padding: '9px 20px',
                  borderRadius: '999px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: updatingAuth ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Lock size={13} /> {updatingAuth ? 'Updating Credentials...' : 'Update Admin Credentials'}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #f6dda0, #d4af37)',
              color: '#1a0418',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Saving & Syncing...' : 'Save Settings & Update Store'}
          </button>
        </div>
      </form>
    </div>
  );
}
