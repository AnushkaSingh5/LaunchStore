// app/dashboard/shipping/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { shippingService } from '@/services/shipping/shippingService';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

export default function CreatorShippingPage() {
  const { store } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [settings, setSettings] = useState({
    warehouse_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    country: 'India',
    gstin: '',
    pickup_location_name: '',
    pickup_location_id: ''
  });

  useEffect(() => {
    if (store?.id) {
      const loadSettings = async () => {
        try {
          const data = await shippingService.getShippingSettings(store.id);
          if (data) {
            setSettings({
              warehouse_name: data.warehouse_name || '',
              contact_person: data.contact_person || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.address || '',
              pincode: data.pincode || '',
              city: data.city || '',
              state: data.state || '',
              country: data.country || 'India',
              gstin: data.gstin || '',
              pickup_location_name: data.pickup_location_name || '',
              pickup_location_id: data.pickup_location_id || ''
            });
          }
        } catch (err) {
          console.error('Failed to load shipping settings:', err);
          setErrorMsg('Failed to load shipping settings.');
        } finally {
          setLoading(false);
        }
      };
      loadSettings();
    } else {
      setLoading(false);
    }
  }, [store?.id]);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store?.id) return;
    
    // Front-end validations
    if (!settings.warehouse_name || settings.warehouse_name.trim().length === 0) {
      setErrorMsg('Warehouse Name / Nickname is required.');
      return;
    }
    if (!settings.phone || settings.phone.replace(/\D/g, '').length !== 10) {
      setErrorMsg('Contact Mobile Number must be exactly 10 digits.');
      return;
    }
    if (!settings.pincode || settings.pincode.replace(/\D/g, '').length !== 6) {
      setErrorMsg('Pincode must be exactly 6 digits.');
      return;
    }
    if (!settings.address || settings.address.trim().length < 10) {
      setErrorMsg('Street Address must be at least 10 characters.');
      return;
    }

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await shippingService.saveShippingSettings(store.id, settings);
      if (updated) {
        setSettings(prev => ({
          ...prev,
          pickup_location_name: updated.pickup_location_name || prev.pickup_location_name,
          pickup_location_id: updated.pickup_location_id || prev.pickup_location_id
        }));
      }
      setSuccessMsg('Shipping settings saved successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save shipping settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="shipping-loading" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        <p>Loading shipping configuration...</p>
      </div>
    );
  }

  return (
    <div className="shipping-dashboard-container" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="shipping-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Shipping Configuration</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Configure your pickup warehouse details. This information will be sent directly to Shiprocket to arrange order pickups.</p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
          {errorMsg}
        </div>
      )}

      {settings.pickup_location_id && (
        <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '13px' }}>
          <span style={{ fontWeight: 700 }}>✅ Shiprocket Registered:</span> Location Nickname <strong>"{settings.pickup_location_name}"</strong> is synced with Shiprocket (ID: <code>{settings.pickup_location_id}</code>).
        </div>
      )}

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Warehouse Name / Nickname</label>
              <Input
                type="text"
                placeholder="e.g. Primary Warehouse"
                value={settings.warehouse_name}
                onChange={(e) => handleChange('warehouse_name', e.target.value)}
                required
              />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Must match your Shiprocket registered pickup location name exactly.</span>
            </div>
            
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Contact Person</label>
              <Input
                type="text"
                placeholder="Name of contact"
                value={settings.contact_person}
                onChange={(e) => handleChange('contact_person', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Contact Mobile Number</label>
              <Input
                type="tel"
                placeholder="10-digit mobile"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Email Address</label>
              <Input
                type="email"
                placeholder="contact@store.com"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Street Address (Pickup Address)</label>
            <Input
              type="text"
              placeholder="Building, street name, locality"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Pincode</label>
              <Input
                type="text"
                placeholder="6-digit PIN"
                value={settings.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>City</label>
              <Input
                type="text"
                placeholder="City"
                value={settings.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>State</label>
              <Input
                type="text"
                placeholder="State"
                value={settings.state}
                onChange={(e) => handleChange('state', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Country</label>
              <Input
                type="text"
                placeholder="Country"
                value={settings.country}
                onChange={(e) => handleChange('country', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>GST Number (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. 29AAAAA0000A1Z5"
              value={settings.gstin}
              onChange={(e) => handleChange('gstin', e.target.value)}
            />
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={saving}
              style={{ padding: '12px 24px', fontWeight: 700, fontSize: '14px', borderRadius: '12px' }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
