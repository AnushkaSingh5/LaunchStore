'use client';

import { useState, useEffect } from 'react';
import { couponService } from '@/services/couponService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const loadAllCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.getAllCoupons();
      setCoupons(data || []);
    } catch (err) {
      console.error('Error loading admin coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCoupons();
  }, []);

  const handleDeleteCoupon = async (id) => {
    if (confirm('Are you sure you want to delete this coupon platform-wide? This action is permanent.')) {
      try {
        await couponService.deleteCoupon(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
        setSelectedCoupon(null);
      } catch (err) {
        alert('Failed to delete coupon: ' + err.message);
      }
    }
  };

  // Derived Analytics Summary
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.is_active && (!c.expiry_date || new Date(c.expiry_date) >= new Date())).length;
  const totalUsages = coupons.reduce((sum, c) => sum + (c.current_uses || 0), 0);
  const expiredCoupons = coupons.filter(c => c.expiry_date && new Date(c.expiry_date) < new Date()).length;

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.store && c.store.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = [
    { field: 'code', label: 'Coupon Code', render: (row) => <span className="code-badge">{row.code}</span> },
    { field: 'store', label: 'Store Name', render: (row) => <span style={{ fontWeight: 600 }}>{row.store || 'Unknown Store'}</span> },
    { field: 'discount_value', label: 'Discount Value', render: (row) => (
      <span>{row.discount_type === 'percentage' ? `${row.discount_value}%` : `₹${row.discount_value.toLocaleString()}`}</span>
    )},
    { field: 'current_uses', label: 'Usages', render: (row) => `${row.current_uses || 0} / ${row.max_uses > 0 ? row.max_uses : '∞'}` },
    { field: 'expiry_date', label: 'Expiry Date', render: (row) => {
      if (!row.expiry_date) return 'Never';
      const isExpired = new Date(row.expiry_date) < new Date();
      return (
        <span style={{ color: isExpired ? '#ef4444' : 'inherit' }}>
          {new Date(row.expiry_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      );
    }},
    { field: 'is_active', label: 'Status', render: (row) => {
      const isExpired = row.expiry_date && new Date(row.expiry_date) < new Date();
      if (isExpired) return <span className="status-badge expired">Expired</span>;
      return row.is_active 
        ? <span className="status-badge active">Active</span> 
        : <span className="status-badge inactive">Inactive</span>;
    }}
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="secondary" size="sm" onClick={() => setSelectedCoupon(row)}>Details</Button>
      <Button variant="outline" size="sm" onClick={() => handleDeleteCoupon(row.id)}>Delete</Button>
    </div>
  );

  return (
    <div className="admin-coupons">
      <div className="page-header">
        <div className="header-text">
          <h2>Coupon & Discount Auditing</h2>
          <p>Monitor platform-wide coupon details, statistics, and store redemption counts.</p>
        </div>
        <div className="header-actions">
          <Input 
            placeholder="Search code or store name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </div>
            <div className="card-info">
              <span className="label">Total Coupons</span>
              <span className="value">{totalCoupons}</span>
              <span className="sub">Platform-wide codes</span>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div className="card-info">
              <span className="label">Active Coupons</span>
              <span className="value">{activeCoupons}</span>
              <span className="sub">Currently eligible</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div className="card-info">
              <span className="label">Total Usages</span>
              <span className="value">{totalUsages}</span>
              <span className="sub">Checkout redemptions</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <div className="card-info">
              <span className="label">Expired Coupons</span>
              <span className="value">{expiredCoupons}</span>
              <span className="sub">Past expiry dates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table Card */}
      <div className="coupons-card">
        <Table columns={columns} data={filteredCoupons} actions={actions} loading={loading} />
      </div>

      {/* Coupon Detail Modal */}
      <Modal 
        isOpen={!!selectedCoupon} 
        onClose={() => setSelectedCoupon(null)}
        title="Coupon Audit Profile"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => handleDeleteCoupon(selectedCoupon.id)}>Delete Code</Button>
            <Button variant="secondary" onClick={() => setSelectedCoupon(null)}>Close</Button>
          </div>
        }
      >
        {selectedCoupon && (
          <div className="coupon-audit-details">
            <div className="profile-main">
              <div className="code-display-circle">{selectedCoupon.code.slice(0, 2)}</div>
              <div className="info">
                <h3>{selectedCoupon.code}</h3>
                <p>Belongs to store: <strong>{selectedCoupon.store || 'Unknown Store'}</strong></p>
                <span className={`status-badge ${selectedCoupon.is_active ? 'active' : 'inactive'}`}>
                  {selectedCoupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <strong>Discount Offer</strong>
                <span>{selectedCoupon.discount_type === 'percentage' ? `${selectedCoupon.discount_value}% Off` : `₹${selectedCoupon.discount_value.toLocaleString()} Off`}</span>
              </div>
              
              <div className="detail-item">
                <strong>Minimum Order Req.</strong>
                <span>₹{(selectedCoupon.minimum_order_amount || 0).toLocaleString()}</span>
              </div>

              <div className="detail-item">
                <strong>Total Redemptions</strong>
                <span>{selectedCoupon.current_uses || 0} / {selectedCoupon.max_uses > 0 ? selectedCoupon.max_uses : 'Unlimited'}</span>
              </div>

              <div className="detail-item">
                <strong>Expiry configuration</strong>
                <span>
                  {selectedCoupon.expiry_date 
                    ? new Date(selectedCoupon.expiry_date).toLocaleString('en-IN')
                    : 'No expiration date'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .admin-coupons { display: flex; flex-direction: column; gap: 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .header-text h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
        .header-text p { color: #64748b; margin: 4px 0 0 0; }
        .header-actions { width: 300px; }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .summary-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-info {
          display: flex;
          flex-direction: column;
        }

        .card-info .label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .card-info .value {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
        }

        .card-info .sub {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          margin-top: 2px;
        }
        
        .coupons-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .code-badge {
          background: #f5f3ff;
          color: #6366f1;
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #e0e7ff;
          letter-spacing: 0.02em;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          display: inline-block;
        }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.inactive { background: #f1f5f9; color: #475569; }
        .status-badge.expired { background: #fee2e2; color: #b91c1c; }

        .coupon-audit-details { display: flex; flex-direction: column; gap: 24px; }
        .profile-main { display: flex; align-items: center; gap: 16px; }
        
        .code-display-circle {
          width: 64px; height: 64px; background: #ec4899; color: #fff;
          border-radius: 20px; display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800; text-transform: uppercase;
        }
        
        .info h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
        .info p { font-size: 14px; color: #64748b; margin: 4px 0 8px 0; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item strong { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
        .detail-item span { font-size: 14px; font-weight: 700; color: #1e293b; }
      `}</style>
    </div>
  );
}
