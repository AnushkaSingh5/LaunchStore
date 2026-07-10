'use client';

import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import Modal from '@/components/UI/Modal';
import Toggle from '@/components/UI/Toggle';

export default function CouponsPage() {
  const { coupons = [], loading, addCoupon, updateCoupon, deleteCoupon } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form Fields State
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [maxUses, setMaxUses] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Edit State
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formError, setFormError] = useState('');

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinimumOrderAmount('0');
    setMaxUses('0');
    setExpiryDate('');
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEditClick = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinimumOrderAmount((coupon.minimum_order_amount || 0).toString());
    setMaxUses((coupon.max_uses || 0).toString());
    setExpiryDate(coupon.expiry_date ? coupon.expiry_date.split('T')[0] : '');
    setIsActive(coupon.is_active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmedCode = code.toUpperCase().trim();
    if (!trimmedCode) {
      setFormError('Coupon code is required.');
      return;
    }
    if (!/^[A-Z0-9_-]+$/.test(trimmedCode)) {
      setFormError('Coupon code can only contain alphanumeric characters, dashes, and underscores.');
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      setFormError('Discount value must be a positive number.');
      return;
    }

    if (discountType === 'percentage' && value > 100) {
      setFormError('Percentage discount value cannot exceed 100%.');
      return;
    }

    const minAmt = parseFloat(minimumOrderAmount);
    if (isNaN(minAmt) || minAmt < 0) {
      setFormError('Minimum order amount must be 0 or higher.');
      return;
    }

    const limit = parseInt(maxUses);
    if (isNaN(limit) || limit < 0) {
      setFormError('Usage limit must be 0 (unlimited) or higher.');
      return;
    }

    if (expiryDate) {
      const selected = new Date(expiryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      selected.setHours(0, 0, 0, 0);
      if (selected < tomorrow) {
        setFormError('Expiry date must be after today.');
        return;
      }
    }

    const payload = {
      code: trimmedCode,
      discount_type: discountType,
      discount_value: value,
      minimum_order_amount: minAmt,
      max_uses: limit,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : null,
      is_active: isActive
    };

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, payload);
      } else {
        await addCoupon(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to save coupon.');
    }
  };

  const handleDeleteClick = async (couponId) => {
    if (confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      try {
        await deleteCoupon(couponId);
      } catch (err) {
        alert('Failed to delete coupon: ' + err.message);
      }
    }
  };

  const handleStatusToggle = async (coupon, newStatus) => {
    try {
      await updateCoupon(coupon.id, { is_active: newStatus });
    } catch (err) {
      alert('Failed to toggle coupon status: ' + err.message);
    }
  };

  // Filtered Coupon List
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || c.discount_type === typeFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = c.is_active;
    else if (statusFilter === 'inactive') !c.is_active;
    else if (statusFilter === 'expired') {
      matchesStatus = c.expiry_date && new Date(c.expiry_date) < new Date();
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  // Analytics Derivations
  const totalCouponsCount = coupons.length;
  const activeCouponsCount = coupons.filter(c => c.is_active).length;
  const totalUsagesCount = coupons.reduce((sum, c) => sum + (c.current_uses || 0), 0);
  
  const mostUsedCoupon = [...coupons]
    .sort((a, b) => (b.current_uses || 0) - (a.current_uses || 0))[0] || null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  return (
    <div className="coupons-page">
      <div className="header-row">
        <div className="header-left">
          <h1>Coupons & Discounts</h1>
          <p>Create percentage and flat-rate discount codes for checkouts.</p>
        </div>
        <button className="add-btn" onClick={handleOpenAddModal}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create Coupon
        </button>
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
              <span className="value">{totalCouponsCount}</span>
              <span className="sub">All configured offers</span>
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
              <span className="value">{activeCouponsCount}</span>
              <span className="sub">Eligible for checkout usage</span>
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
              <span className="label">Total Coupon Usages</span>
              <span className="value">{totalUsagesCount}</span>
              <span className="sub">Redeemed across checkouts</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#fff7ed', color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div className="card-info">
              <span className="label">Most Popular</span>
              <span className="value" style={{ fontSize: '20px' }}>
                {mostUsedCoupon && mostUsedCoupon.current_uses > 0 ? mostUsedCoupon.code : 'None'}
              </span>
              <span className="sub">
                {mostUsedCoupon && mostUsedCoupon.current_uses > 0 
                  ? `${mostUsedCoupon.current_uses} redemptions` 
                  : 'No usage logged yet'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Actions */}
      <div className="actions-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search coupon codes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Flat-Rate (₹)</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* List Container */}
      <div className="list-container">
        <div className="list-header">
          <div className="col-code">COUPON CODE</div>
          <div className="col-value">DISCOUNT VALUE</div>
          <div className="col-min">MINIMUM ORDER</div>
          <div className="col-uses">USAGE COUNT</div>
          <div className="col-expiry">EXPIRY DATE</div>
          <div className="col-status">STATUS</div>
          <div className="col-actions">ACTIONS</div>
        </div>
        
        <div className="list-body">
          {loading ? (
            <div className="loading-state">Loading coupons...</div>
          ) : filteredCoupons.length === 0 ? (
            <div className="loading-state">No coupons found matching your search.</div>
          ) : filteredCoupons.map((coupon) => {
            const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
            const max = coupon.max_uses || 0;
            const current = coupon.current_uses || 0;
            const usagePercent = max > 0 ? Math.min(100, (current / max) * 100) : 0;
            
            return (
              <div key={coupon.id} className="coupon-row">
                <div className="col-code">
                  <div className="code-badge">{coupon.code}</div>
                  <span className={`type-tag ${coupon.discount_type}`}>
                    {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Flat'}
                  </span>
                </div>

                <div className="col-value">
                  <span className="value-label">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value.toLocaleString()}`}
                  </span>
                </div>

                <div className="col-min">
                  <span>
                    {coupon.minimum_order_amount > 0 ? `₹${coupon.minimum_order_amount.toLocaleString()}` : '₹0 (None)'}
                  </span>
                </div>

                <div className="col-uses">
                  <div className="uses-info">
                    <span className="uses-text">
                      {current} / {max > 0 ? max : '∞'} uses
                    </span>
                    {max > 0 && (
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${usagePercent}%`, backgroundColor: usagePercent >= 100 ? '#ef4444' : '#8b5cf6' }}></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-expiry">
                  <span className={isExpired ? 'expired-text' : ''}>
                    {coupon.expiry_date 
                      ? new Date(coupon.expiry_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Never Expires'
                    }
                  </span>
                  {isExpired && <span className="expired-badge">Expired</span>}
                </div>

                <div className="col-status">
                  <label className="switch-sm">
                    <input 
                      type="checkbox" 
                      checked={coupon.is_active}
                      onChange={(e) => handleStatusToggle(coupon, e.target.checked)}
                    />
                    <span className="slider-sm"></span>
                  </label>
                </div>

                <div className="col-actions">
                  <button className="row-btn edit" onClick={() => handleEditClick(coupon)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                  <button className="row-btn delete" onClick={() => handleDeleteClick(coupon.id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Coupon Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="modal-custom-header">
            <div className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
              </svg>
            </div>
            <div className="modal-title-box">
              <h2>{editingCoupon ? 'Edit Coupon Code' : 'Create New Coupon'}</h2>
              <p>{editingCoupon ? 'Configure parameters for this active offer.' : 'Set up a new discount code for your shoppers.'}</p>
            </div>
          </div>
        }
        footer={
          <div className="modal-footer-btns">
            <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="save-submit-btn" onClick={handleSaveCoupon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </button>
          </div>
        }
      >
        <div className="modal-form">
          {formError && <div className="form-error-banner">{formError}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label>Coupon Code <span className="required">*</span></label>
              <input 
                type="text" 
                placeholder="e.g. WELCOME100" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={!!editingCoupon}
                className="code-input"
              />
              <span className="help-text">forced to uppercase. Only alphanumeric, dashes and underscores allowed.</span>
            </div>

            <div className="form-group">
              <label>Discount Type</label>
              <select 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value)}
                className="form-select"
              >
                <option value="percentage">Percentage (%) Off</option>
                <option value="fixed">Fixed Flat-Rate (₹) Off</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Discount Value ({discountType === 'percentage' ? '%' : '₹'}) <span className="required">*</span></label>
              <input 
                type="number" 
                placeholder={discountType === 'percentage' ? 'e.g. 10' : 'e.g. 150'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                min="0.01"
                step="any"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }}
              />
            </div>

            <div className="form-group">
              <label>Minimum Purchase Amount (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 500" 
                value={minimumOrderAmount}
                onChange={(e) => setMinimumOrderAmount(e.target.value)}
                min="0"
                step="any"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
                }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Usage Limit (Max Uses)</label>
              <input 
                type="number" 
                placeholder="e.g. 100 (0 for unlimited)" 
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                min="0"
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                }}
              />
              <span className="help-text">Set to 0 if there is no total limit.</span>
            </div>

             <div className="form-group">
                <label>Expiry Date</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={tomorrowStr}
                />
              </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <Toggle 
              label="Active Status" 
              description="Whether shoppers can redeem this coupon code at checkout."
              checked={isActive}
              onChange={setIsActive}
            />
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .coupons-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
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
          margin: 0;
        }

        .header-left p {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .add-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover { background: #4f46e5; transform: translateY(-1px); }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .summary-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          border: 1px solid #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .summary-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.05);
          border-color: #e2e8f0;
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
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
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

        .actions-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .search-box {
          flex: 1;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          height: 48px;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: #1e293b;
          background: transparent;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .filter-select {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 0 16px;
          height: 48px;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:hover {
          border-color: #6366f1;
        }

        .list-container {
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
        }

        .list-header {
          display: grid;
          grid-template-columns: 2.2fr 1.3fr 1.3fr 1.5fr 1.7fr 1fr 1.8fr;
          padding: 16px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.05em;
        }

        .list-body {
          display: flex;
          flex-direction: column;
        }

        .coupon-row {
          display: grid;
          grid-template-columns: 2.2fr 1.3fr 1.3fr 1.5fr 1.7fr 1fr 1.8fr;
          padding: 20px 24px;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
        }

        .coupon-row:last-child {
          border-bottom: none;
        }

        .coupon-row:hover {
          background: #fafafc;
        }

        .code-badge {
          background: #f5f3ff;
          color: #6366f1;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #e0e7ff;
          display: inline-block;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }

        .type-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          margin-left: 6px;
          text-transform: uppercase;
        }
        .type-tag.percentage {
          background: #fdf2f8;
          color: #ec4899;
        }
        .type-tag.fixed {
          background: #ecfdf5;
          color: #10b981;
        }

        .value-label {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .uses-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .uses-text {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .progress-bar-container {
          background: #e2e8f0;
          height: 6px;
          border-radius: 3px;
          width: 90px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .expired-text {
          color: #ef4444;
          text-decoration: line-through;
        }
        .expired-badge {
          background: #fef2f2;
          color: #ef4444;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-left: 6px;
        }

        .switch-sm {
          position: relative;
          display: inline-block;
          width: 36px;
          height: 20px;
        }
        .switch-sm input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider-sm {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .3s;
          border-radius: 20px;
        }
        .slider-sm:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        .switch-sm input:checked + .slider-sm {
          background-color: #10b981;
        }
        .switch-sm input:checked + .slider-sm:before {
          transform: translateX(16px);
        }

        .col-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .row-btn {
          border: 1px solid #e2e8f0;
          background: #fff;
          border-radius: 8px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .row-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #1e293b;
        }
        .row-btn.delete:hover {
          background: #fef2f2;
          border-color: #fca5a5;
          color: #ef4444;
        }

        .loading-state {
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }

        /* Modal Styles */
        .modal-custom-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .modal-icon {
          width: 40px;
          height: 40px;
          background: #f5f3ff;
          color: #8b5cf6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-title-box h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .modal-title-box p {
          font-size: 12px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 10px 0;
        }
        .form-error-banner {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fca5a5;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }
        .form-group input, .form-group select {
          height: 42px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 0 12px;
          font-size: 14px;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group select:focus {
          border-color: #8b5cf6;
        }
        .form-group input.code-input {
          font-family: monospace;
          letter-spacing: 0.05em;
          font-weight: 700;
        }
        .required {
          color: #ef4444;
        }
        .help-text {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 1px;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;
        }
        .cancel-btn {
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cancel-btn:hover { background: #e2e8f0; }
        
        .save-submit-btn {
          background: #8b5cf6;
          border: none;
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 700;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
          transition: all 0.15s;
        }
        .save-submit-btn:hover { background: #7c3aed; }
      `}</style>
    </div>
  );
}
