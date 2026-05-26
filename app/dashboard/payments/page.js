'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storeService } from '@/services/storeService';

export default function PaymentsPage() {
  const { store, refreshStore } = useAuth();
  const [payments, setPayments] = useState({
    enableCard: true,
    enableUPI: false,
    enableCOD: true,
    shippingType: 'flat',
    flatFee: 15,
    shippingHandler: 'platform'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setPayments({
        enableCard: store.theme_settings?.enableCard ?? true,
        enableUPI: store.theme_settings?.enableUPI ?? false,
        enableCOD: store.theme_settings?.enableCOD ?? true,
        shippingType: store.theme_settings?.shippingType ?? 'flat',
        flatFee: store.theme_settings?.flatFee ?? 15,
        shippingHandler: store.theme_settings?.shippingHandler ?? 'platform'
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [store]);

  const handleChange = (field, value) => {
    setPayments(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    try {
      const existingSettings = store.theme_settings || {};
      await storeService.updateStore(store.id, {
        theme_settings: {
          ...existingSettings,
          enableCard: payments.enableCard,
          enableUPI: payments.enableUPI,
          enableCOD: payments.enableCOD,
          shippingType: payments.shippingType,
          flatFee: parseFloat(payments.flatFee) || 0,
          shippingHandler: payments.shippingHandler
        }
      });
      await refreshStore();
      alert('Payments & Shipping configuration saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save configuration: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="payments-page">
      <div className="header-row">
        <div className="header-left">
          <h1>Payments & Shipping</h1>
          <p>Configure how you accept payments and deliver products.</p>
        </div>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h3>Payment Gateways</h3>
          <p>Manage the payment methods available at checkout.</p>
        </div>

        <div className="gateway-list">
          {/* Credit / Debit Cards */}
          <div className="gateway-container">
            <div className="gateway-item">
              <div className="gateway-left">
                <div className="gateway-icon">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: '12px' }} />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '18px' }} />
                </div>
                <div className="gateway-info">
                  <strong>Credit / Debit Cards</strong>
                  <p>Accept payments via Visa, Mastercard, and Amex via Stripe.</p>
                </div>
              </div>
              <div className="gateway-right">
                <label className="switch">
                  <input type="checkbox" checked={payments.enableCard} onChange={(e) => handleChange('enableCard', e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span className={`status-badge ${payments.enableCard ? 'enabled' : 'disabled'}`}>
                  {payments.enableCard ? 'Enabled' : 'Disabled'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          </div>

          {/* UPI / Local Wallets */}
          <div className="gateway-container">
            <div className="gateway-item">
              <div className="gateway-left">
                <div className="gateway-icon">
                  <span className="upi-logo">UPI</span>
                </div>
                <div className="gateway-info">
                  <strong>UPI / Local Wallets</strong>
                  <p>Enable Razorpay/Paytm integration for local payments.</p>
                </div>
              </div>
              <div className="gateway-right">
                <label className="switch">
                  <input type="checkbox" checked={payments.enableUPI} onChange={(e) => handleChange('enableUPI', e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span className={`status-badge ${payments.enableUPI ? 'enabled' : 'disabled'}`}>
                  {payments.enableUPI ? 'Enabled' : 'Disabled'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          </div>

          {/* Cash on Delivery */}
          <div className="gateway-container">
            <div className="gateway-item">
              <div className="gateway-left">
                <div className="gateway-icon cash">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                </div>
                <div className="gateway-info">
                  <strong>Cash on Delivery (COD)</strong>
                  <p>Allow customers to pay when the product arrives.</p>
                </div>
              </div>
              <div className="gateway-right">
                <label className="switch">
                  <input type="checkbox" checked={payments.enableCOD} onChange={(e) => handleChange('enableCOD', e.target.checked)} />
                  <span className="slider round"></span>
                </label>
                <span className={`status-badge ${payments.enableCOD ? 'enabled' : 'disabled'}`}>
                  {payments.enableCOD ? 'Enabled' : 'Disabled'}
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h3>Shipping Rules</h3>
          <p>Configure shipping cost calculation and delivery preferences.</p>
        </div>

        <div className="shipping-form">
          <div className="form-group">
            <label>Shipping Cost Calculation</label>
            <div className="select-wrapper">
              <select value={payments.shippingType} onChange={(e) => handleChange('shippingType', e.target.value)}>
                <option value="free">Free Shipping (All Orders)</option>
                <option value="flat">Flat Rate Fee</option>
                <option value="calculated">Calculated by Weight/Distance</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <span className="field-hint">Charge a fixed shipping fee for every order.</span>
          </div>

          <div className="form-group">
            <label>Flat Shipping Fee ($)</label>
            <input 
              type="number" 
              value={payments.flatFee} 
              onChange={(e) => handleChange('flatFee', Number(e.target.value))}
              placeholder="0.00"
            />
            <span className="field-hint">This amount will be added to every order.</span>
          </div>

          <div className="form-group">
            <label>Shipping Handled By</label>
            <div className="select-wrapper">
              <select value={payments.shippingHandler} onChange={(e) => handleChange('shippingHandler', e.target.value)}>
                <option value="platform">Platform Default Partner (Recommended)</option>
                <option value="manual">Creator Manual Fulfillment</option>
              </select>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <span className="field-hint">We&apos;ll choose the best delivery partner automatically.</span>
          </div>
        </div>

        <div className="info-box">
          <div className="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.674M12 3v1m0 16v1m5.657-13.657l-.707.707m-9.9 9.9l-.707.707M18 12h-1M7 12H6m11.657 5.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z"></path></svg>
          </div>
          <div className="info-text">
            <strong>How it works</strong>
            <p>A flat shipping fee of ${payments.flatFee} will be applied to every order, regardless of the order value or destination.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payments-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 100%;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .header-left p { color: #64748b; margin: 0; font-size: 15px; }

        .save-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .save-btn:hover { background: #4f46e5; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .settings-section {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .section-header p { font-size: 14px; color: #64748b; margin: 0; }

        .gateway-list { display: flex; flex-direction: column; gap: 16px; }

        .gateway-container {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .gateway-item {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s;
        }

        .gateway-item:hover { background: #fbfbff; }

        .gateway-left { display: flex; align-items: center; gap: 20px; }

        .gateway-icon {
          width: 60px;
          height: 40px;
          background: #f8fafc;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 1px solid #f1f5f9;
        }

        .upi-logo { font-size: 10px; font-weight: 900; font-style: italic; color: #1e293b; letter-spacing: -0.5px; border-bottom: 1px solid #333; }
        .gateway-icon.cash { color: #6366f1; background: #f5f3ff; }

        .gateway-info strong { font-size: 16px; color: #1e293b; display: block; margin-bottom: 4px; }
        .gateway-info p { font-size: 13px; color: #64748b; margin: 0; }

        .gateway-right { display: flex; align-items: center; gap: 24px; }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          min-width: 85px;
          text-align: center;
        }

        .status-badge.enabled { background: #f0fdf4; color: #22c55e; }
        .status-badge.disabled { background: #f1f5f9; color: #94a3b8; }

        /* Switch Styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch input { opacity: 0; width: 0; height: 0; }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #e2e8f0;
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .4s;
        }

        input:checked + .slider { background-color: #6366f1; }
        input:checked + .slider:before { transform: translateX(20px); }
        .slider.round { border-radius: 34px; }
        .slider.round:before { border-radius: 50%; }

        .shipping-form {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 600; color: #1e293b; }

        .field-hint { font-size: 11px; color: #94a3b8; font-weight: 500; }

        .form-group input, .select-wrapper select {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus, .select-wrapper select:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

        .select-wrapper { position: relative; display: flex; align-items: center; }
        .select-wrapper select { width: 100%; appearance: none; padding-right: 40px; }
        .select-wrapper svg { position: absolute; right: 16px; color: #94a3b8; pointer-events: none; }

        .info-box {
          background: #fbfaff;
          border: 1px solid #f5f3ff;
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366f1;
          border: 1px solid #f1f5f9;
        }

        .info-text strong { font-size: 14px; color: #1e293b; display: block; margin-bottom: 2px; }
        .info-text p { font-size: 13px; color: #64748b; margin: 0; }

        .loading { padding: 40px; text-align: center; color: #94a3b8; }

        @media (max-width: 768px) {
          .shipping-form { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
