'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Toggle from '@/components/UI/Toggle';
import Select from '@/components/UI/Select';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';

export default function PaymentsPage() {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      const data = await dashboardService.getPayments();
      setPayments(data);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await dashboardService.updatePayments(payments);
    setSaving(false);
    alert('Payment & Shipping settings saved!');
  };

  const handleChange = (field, value) => {
    setPayments(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Payments & Shipping</h2>
          <p style={{ color: 'var(--text-sub)' }}>Configure how you accept money and deliver products.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px' }}>
        
        <div className="dashboard-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--secondary)', paddingBottom: '16px' }}>
            Payment Gateways
          </h3>
          <Toggle 
            label="Credit / Debit Cards" 
            description="Accept payments via Visa, Mastercard, and Amex via Stripe."
            checked={payments.enableCard} 
            onChange={(val) => handleChange('enableCard', val)} 
          />
          <Toggle 
            label="UPI / Local Wallets" 
            description="Enable Razorpay/Paytm integration for local payments."
            checked={payments.enableUPI} 
            onChange={(val) => handleChange('enableUPI', val)} 
          />
          <Toggle 
            label="Cash on Delivery (COD)" 
            description="Allow customers to pay when the product arrives."
            checked={payments.enableCOD} 
            onChange={(val) => handleChange('enableCOD', val)} 
          />
        </div>

        <div className="dashboard-card" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--secondary)', paddingBottom: '16px' }}>
            Shipping Rules
          </h3>
          
          <Select 
            label="Shipping Cost Calculation" 
            value={payments.shippingType}
            onChange={(e) => handleChange('shippingType', e.target.value)}
            options={[
              { label: 'Free Shipping (All Orders)', value: 'free' },
              { label: 'Flat Rate Fee', value: 'flat' },
              { label: 'Calculated by Weight/Distance', value: 'calculated' },
            ]}
          />

          {payments.shippingType === 'flat' && (
            <div style={{ marginTop: '16px' }}>
              <Input 
                label="Flat Shipping Fee ($)" 
                type="number"
                value={payments.flatFee}
                onChange={(e) => handleChange('flatFee', Number(e.target.value))}
              />
            </div>
          )}

          <div style={{ marginTop: '24px' }}>
            <Select 
              label="Shipping Handled By" 
              value={payments.shippingHandler}
              onChange={(e) => handleChange('shippingHandler', e.target.value)}
              options={[
                { label: 'Platform Default Partner (Recommended)', value: 'platform' },
                { label: 'Creator Manual Fulfillment', value: 'manual' },
              ]}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
