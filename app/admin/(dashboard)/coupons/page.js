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

      {/* Desktop view: Table */}
      <div className="desktop-view-only coupons-card">
        <Table columns={columns} data={filteredCoupons} actions={actions} loading={loading} />
      </div>

      {/* Mobile view: Coupon Cards */}
      <div className="mobile-view-only mobile-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '16px' }}>No coupons found.</div>
        ) : (
          filteredCoupons.map(coupon => {
            const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
            const statusLabel = isExpired ? 'Expired' : (coupon.is_active ? 'Active' : 'Inactive');
            const statusClass = statusLabel.toLowerCase();

            return (
              <div key={coupon.id} className="mobile-coupon-card">
                <div className="mobile-card-main">
                  {/* Dashed Code Box */}
                  <div className="mobile-code-dashed-box">
                    <svg className="code-tag-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    <span className="dashed-code-text">{coupon.code}</span>
                  </div>

                  {/* Coupon Details */}
                  <div className="mobile-coupon-details">
                    <div className="mobile-store-name">{coupon.store || 'Unknown Store'}</div>
                    
                    <div className="mobile-details-meta-row">
                      <div className="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                        <span className="meta-label">DISCOUNT</span>
                        <span className="meta-value">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value.toLocaleString()}`}</span>
                      </div>
                      
                      <div className="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span className="meta-label">USAGES</span>
                        <span className="meta-value">{coupon.current_uses || 0} / {coupon.max_uses > 0 ? coupon.max_uses : '∞'}</span>
                      </div>
                      
                      <div className="meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span className="meta-label">EXPIRY</span>
                        <span className={`meta-value ${isExpired ? 'expired-text' : ''}`}>
                          {coupon.expiry_date 
                            ? new Date(coupon.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                            : 'Never'
                          }
                        </span>
                      </div>
                      
                      <div className="meta-item status-meta">
                        <span className="status-dot-indicator" style={{ background: isExpired ? '#ef4444' : (coupon.is_active ? '#10b981' : '#64748b') }}></span>
                        <span className="meta-label">STATUS</span>
                        <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Stack */}
                  <div className="mobile-coupon-actions">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedCoupon(coupon)}>Details</Button>
                    <button className="mobile-delete-btn" onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
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

        /* Desktop / Mobile view toggles */
        .desktop-view-only {
          display: block;
        }
        .mobile-view-only {
          display: none;
        }

        @media (max-width: 768px) {
          .admin-coupons {
            gap: 16px !important;
          }
          .desktop-view-only {
            display: none !important;
          }
          .mobile-view-only {
            display: block !important;
          }
          .page-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            margin-bottom: 0 !important;
          }
          .header-actions {
            width: 100% !important;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .summary-card {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .card-top {
            gap: 12px !important;
          }
          .icon-wrapper {
            width: 36px !important;
            height: 36px !important;
          }
          .card-info .value {
            font-size: 20px !important;
          }
        }

        /* Mobile Coupon Card Styling */
        .mobile-coupon-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
        }
        .mobile-card-main {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          position: relative;
        }
        .mobile-code-dashed-box {
          width: 80px;
          height: 80px;
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          background: #f5f3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }
        .code-tag-icon {
          position: absolute;
          top: 6px;
          right: 6px;
        }
        .dashed-code-text {
          font-size: 13px;
          font-weight: 700;
          color: #6366f1;
          font-family: monospace;
          word-break: break-all;
          text-align: center;
          padding: 0 4px;
        }
        .mobile-coupon-details {
          flex: 1;
          min-width: 0;
        }
        .mobile-store-name {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        /* Flex Meta Items Row with wrapping and small fonts to avoid scrolling */
        .mobile-details-meta-row {
          display: flex;
          flex-wrap: wrap;
          column-gap: 12px;
          row-gap: 8px;
          align-items: center;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
        }
        .meta-label {
          font-weight: 700;
          color: #94a3b8;
          font-size: 10px;
          letter-spacing: 0.3px;
        }
        .meta-value {
          font-weight: 600;
          color: #475569;
        }
        .meta-value.expired-text {
          color: #ef4444;
        }
        .status-meta {
          gap: 6px;
        }
        .status-dot-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .mobile-coupon-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }
        .mobile-coupon-actions button,
        .mobile-coupon-actions :global(button) {
          padding: 6px 12px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          border-radius: 8px !important;
          white-space: nowrap;
          text-align: center;
          width: 70px !important;
        }
        .mobile-delete-btn {
          padding: 6px 12px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 8px;
          border: 1px solid #fee2e2;
          background: #fff;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          width: 70px;
        }
        .mobile-delete-btn:hover {
          background: #fef2f2;
        }
      `}</style>
    </div>
  );
}
