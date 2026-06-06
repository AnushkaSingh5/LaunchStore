'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { customerService } from '@/services/customerService';
import { useLoading } from '@/components/TopLoader';

export default function CustomerProfilePage() {
  const { customer, customerProfile, refreshProfile } = useCustomerAuth();
  const { startLoading, completeLoading } = useLoading();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (customerProfile) {
      setFullName(customerProfile.full_name || '');
      setPhone(customerProfile.phone || '');
    }
  }, [customerProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    startLoading();

    try {
      if (customerProfile?.id) {
        await customerService.updateCustomerProfile(customerProfile.id, {
          full_name: fullName,
          phone: phone
        });
        await refreshProfile();
        setSuccess('Profile details updated successfully!');
      } else {
        throw new Error('Customer profile is not loaded.');
      }
    } catch (err) {
      console.error('Failed to update customer profile:', err);
      setError(err.message || 'An error occurred while updating details.');
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  return (
    <div className="profile-details dashboard-card fade-in">
      <h2>Personal Details</h2>
      <p className="subtitle">Manage your personal information and contact details</p>

      <div className="divider"></div>

      {success && <div className="banner success-banner">{success}</div>}
      {error && <div className="banner error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="details-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input 
            type="email" 
            id="email" 
            value={customer?.email || ''} 
            disabled 
            className="disabled-input"
          />
          <small className="help-text">Email address cannot be changed</small>
        </div>

        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input 
            type="text" 
            id="fullName" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            placeholder="John Doe"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="+1 234 567 8900"
            required
          />
        </div>

        <button type="submit" className="save-btn" disabled={loading}>
          {loading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>

      <style jsx>{`
        .profile-details {
          background: var(--white, #ffffff);
          border-radius: var(--radius-lg, 24px);
          padding: 40px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main, #1d1d1f);
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-sub, #64748b);
        }

        .divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 24px 0;
        }

        .banner {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          text-align: center;
        }

        .success-banner {
          background: #ecfdf5;
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.1);
        }

        .error-banner {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .details-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 480px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 14px;
          color: var(--text-main, #1d1d1f);
          outline: none;
          background: var(--white, #ffffff);
          transition: var(--transition-fast, all 0.2s);
        }

        .form-group input:focus {
          border-color: var(--accent, #2563eb);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .disabled-input {
          background: var(--bg-main, #f8f9fb) !important;
          color: var(--text-sub, #64748b) !important;
          cursor: not-allowed;
        }

        .help-text {
          font-size: 11px;
          color: var(--text-sub, #64748b);
        }

        .save-btn {
          padding: 14px 28px;
          background: var(--primary, #121212);
          color: var(--white, #ffffff);
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(18, 18, 18, 0.1);
          transition: var(--transition-smooth, all 0.3s);
          align-self: flex-start;
          margin-top: 10px;
          border: none;
          cursor: pointer;
        }

        .save-btn:hover {
          background: var(--accent, #2563eb);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
          transform: translateY(-1px);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
