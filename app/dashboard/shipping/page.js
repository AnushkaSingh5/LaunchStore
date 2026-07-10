// app/dashboard/shipping/page.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { shippingService } from '@/services/shipping/shippingService';
import { storeService } from '@/services/storeService';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

export default function CreatorShippingPage() {
  const { store, refreshStore } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [shippingRules, setShippingRules] = useState({
    shippingType: 'flat',
    flatFee: 15,
    shippingHandler: 'platform'
  });
  const [savingRules, setSavingRules] = useState(false);

  useEffect(() => {
    if (store) {
      setShippingRules({
        shippingType: store.theme_settings?.shippingType ?? 'flat',
        flatFee: store.theme_settings?.flatFee ?? 15,
        shippingHandler: store.theme_settings?.shippingHandler ?? 'platform'
      });
    }
  }, [store]);

  const handleRulesChange = (field, value) => {
    setShippingRules(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    if (!store?.id) return;
    setSavingRules(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const existingSettings = store.theme_settings || {};
      await storeService.updateStore(store.id, {
        theme_settings: {
          ...existingSettings,
          shippingType: shippingRules.shippingType,
          flatFee: parseFloat(shippingRules.flatFee) || 0,
          shippingHandler: shippingRules.shippingHandler
        }
      });
      await refreshStore();
      setSuccessMsg('Shipping rules saved successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save shipping rules: ' + err.message);
    } finally {
      setSavingRules(false);
    }
  };

  const getRulesDescription = () => {
    if (shippingRules.shippingType === 'free') {
      return 'Shipping will be free for all orders placed on your store.';
    } else if (shippingRules.shippingType === 'calculated') {
      return 'Shipping costs will be calculated dynamically based on package weight and customer distance during checkout.';
    } else {
      return `A flat shipping fee of ₹${shippingRules.flatFee} will be applied to every order, regardless of the order value or destination.`;
    }
  };
  const [settings, setSettings] = useState({
    warehouse_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    pickup_address_line2: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    gstin: '',
    business_name: '',
    landmark: '',
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
              pickup_address_line2: data.pickup_address_line2 || '',
              city: data.city || '',
              state: data.state || '',
              country: data.country || 'India',
              pincode: data.pincode || '',
              gstin: data.gstin || '',
              business_name: data.business_name || '',
              landmark: data.landmark || '',
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
    
    // Trim string fields
    const trimmedWarehouseName = (settings.warehouse_name || '').trim();
    const trimmedContactPerson = (settings.contact_person || '').trim();
    const trimmedEmail = (settings.email || '').trim();
    const trimmedPhone = (settings.phone || '').trim();
    const trimmedAddress = (settings.address || '').trim();
    const trimmedAddressLine2 = (settings.pickup_address_line2 || '').trim();
    const trimmedCity = (settings.city || '').trim();
    const trimmedState = (settings.state || '').trim();
    const trimmedCountry = (settings.country || 'India').trim();
    const trimmedPincode = (settings.pincode || '').trim();
    const trimmedGstin = (settings.gstin || '').trim();
    const trimmedBusinessName = (settings.business_name || '').trim();
    const trimmedLandmark = (settings.landmark || '').trim();

    // Front-end validations
    if (!trimmedWarehouseName) {
      setErrorMsg('Warehouse Name / Nickname is required.');
      return;
    }
    if (!trimmedContactPerson) {
      setErrorMsg('Contact Person is required.');
      return;
    }
    if (!trimmedBusinessName) {
      setErrorMsg('Business Name / Company Name is required.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('A valid Contact Email is required.');
      return;
    }

    // Phone validation: exactly 10 digits, no +91, no spaces, no special characters
    const digitsOnlyPhone = trimmedPhone.replace(/\D/g, '');
    if (trimmedPhone !== digitsOnlyPhone || trimmedPhone.length !== 10) {
      setErrorMsg('Contact Mobile Number must be exactly 10 digits (no +91, spaces, or special characters).');
      return;
    }

    // Pincode validation: exactly 6 digits
    const digitsOnlyPincode = trimmedPincode.replace(/\D/g, '');
    if (trimmedPincode !== digitsOnlyPincode || trimmedPincode.length !== 6) {
      setErrorMsg('Pincode must be exactly 6 digits.');
      return;
    }

    if (!trimmedAddress || trimmedAddress.length < 10) {
      setErrorMsg('Pickup Address Line 1 must be at least 10 characters.');
      return;
    }
    if (!trimmedCity) {
      setErrorMsg('City is required.');
      return;
    }
    if (!trimmedState) {
      setErrorMsg('State is required.');
      return;
    }

    const trimmedSettings = {
      warehouse_name: trimmedWarehouseName,
      contact_person: trimmedContactPerson,
      email: trimmedEmail,
      phone: trimmedPhone,
      address: trimmedAddress,
      pickup_address_line2: trimmedAddressLine2,
      city: trimmedCity,
      state: trimmedState,
      country: trimmedCountry,
      pincode: trimmedPincode,
      gstin: trimmedGstin,
      business_name: trimmedBusinessName,
      landmark: trimmedLandmark
    };

    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const updated = await shippingService.saveShippingSettings(store.id, trimmedSettings);
      if (updated) {
        setSettings(prev => ({
          ...prev,
          ...trimmedSettings,
          pickup_location_name: updated.pickup_location_name || prev.pickup_location_name,
          pickup_location_id: updated.pickup_location_id || prev.pickup_location_id
        }));
      }
      setSuccessMsg('Delhivery shipping settings saved successfully!');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save Delhivery shipping settings.');
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
    <div className="shipping-dashboard-container" style={{ padding: '24px', maxWidth: '100%' }}>
      <div className="shipping-header" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>Delhivery Shipping Configuration</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Configure your pickup warehouse details. This information will be sent directly to Delhivery to arrange order pickups.</p>
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
          <span style={{ fontWeight: 700 }}>✅ Delhivery Registered:</span> Location Nickname <strong>"{settings.pickup_location_name}"</strong> is synced with Delhivery (ID: <code>{settings.pickup_location_id}</code>).
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
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Must match your Delhivery registered pickup location name exactly.</span>
            </div>
            
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Business Name / Company Name</label>
              <Input
                type="text"
                placeholder="e.g. Acme Corp"
                value={settings.business_name}
                onChange={(e) => handleChange('business_name', e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
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

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Contact Mobile Number</label>
              <Input
                type="tel"
                placeholder="10-digit mobile"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Pickup Address Line 1</label>
              <Input
                type="text"
                placeholder="Building, street name, locality"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Pickup Address Line 2 (Optional)</label>
              <Input
                type="text"
                placeholder="Floor, suite, additional details"
                value={settings.pickup_address_line2}
                onChange={(e) => handleChange('pickup_address_line2', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Landmark (Optional)</label>
              <Input
                type="text"
                placeholder="e.g. Near Metro Station"
                value={settings.landmark}
                onChange={(e) => handleChange('landmark', e.target.value)}
              />
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Pincode</label>
              <Input
                type="text"
                placeholder="6-digit PIN"
                value={settings.pincode}
                onChange={(e) => handleChange('pincode', e.target.value.replace(/[^0-9]/g, ''))}
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

      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginTop: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>Shipping Rules</h3>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Configure shipping cost calculation and delivery preferences.</p>
        </div>

        <form onSubmit={handleSaveRules} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Shipping Cost Calculation</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select 
                  value={shippingRules.shippingType} 
                  onChange={(e) => handleRulesChange('shippingType', e.target.value)}
                  style={{ width: '100%', appearance: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1e293b', outline: 'none' }}
                >
                  <option value="free">Free Shipping (All Orders)</option>
                  <option value="flat">Flat Rate Fee</option>
                  <option value="calculated">Calculated by Weight/Distance</option>
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', right: '16px', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Charge a fixed shipping fee for every order.</span>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Flat Shipping Fee (₹)</label>
              <Input 
                type="number" 
                value={shippingRules.flatFee} 
                onChange={(e) => handleRulesChange('flatFee', Number(e.target.value))}
                placeholder="0.00"
                disabled={shippingRules.shippingType !== 'flat'}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>This amount will be added to every order.</span>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'block', marginBottom: '8px' }}>Shipping Handled By</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select 
                  value={shippingRules.shippingHandler} 
                  onChange={(e) => handleRulesChange('shippingHandler', e.target.value)}
                  style={{ width: '100%', appearance: 'none', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1e293b', outline: 'none' }}
                >
                  <option value="platform">Platform Default Partner (Recommended)</option>
                  <option value="manual">Creator Manual Fulfillment</option>
                </select>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', right: '16px', pointerEvents: 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>We'll choose the best delivery partner automatically.</span>
            </div>
          </div>

          <div style={{ background: '#fbfaff', border: '1px solid #f5f3ff', borderRadius: '16px', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '40px', height: '40px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', border: '1px solid #f1f5f9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.663 17h4.674M12 3v1m0 16v1m5.657-13.657l-.707.707m-9.9 9.9l-.707.707M18 12h-1M7 12H6m11.657 5.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5 5 5 0 0 0-5-5z"></path></svg>
            </div>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block', marginBottom: '2px' }}>How it works</strong>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{getRulesDescription()}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={savingRules}
              style={{ padding: '12px 24px', fontWeight: 700, fontSize: '14px', borderRadius: '12px' }}
            >
              {savingRules ? 'Saving...' : 'Save Rules'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
