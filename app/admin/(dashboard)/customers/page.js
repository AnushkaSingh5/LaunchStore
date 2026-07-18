'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { useState } from 'react';

export default function AdminCustomers() {
  const { customers = [], loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = loading ? [] : customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: 'name', label: 'Customer Name', render: (row) => <span style={{ fontWeight: 700 }}>{row.name}</span> },
    { field: 'email', label: 'Email' },
    { field: 'phone', label: 'Phone Number' },
    { field: 'totalOrders', label: 'Total Orders', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }}></div>
        {row.totalOrders} orders
      </div>
    )},
  ];

  const getAvatarColor = (name) => {
    const colors = [
      { bg: '#f3e8ff', text: '#8b5cf6' }, // purple
      { bg: '#dcfce7', text: '#166534' }, // green
      { bg: '#fee2e2', text: '#ef4444' }, // red
      { bg: '#fffbeb', text: '#b45309' }, // orange
      { bg: '#e0f2fe', text: '#0369a1' }  // blue
    ];
    let sum = 0;
    const cleanName = name || '';
    for (let i = 0; i < cleanName.length; i++) {
      sum += cleanName.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase();
  };

  const actions = (row) => (
    <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(row)}>View Profile</Button>
  );

  return (
    <div className="admin-customers">
      <div className="header-row">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Customer Database</h2>
          <p style={{ color: '#64748b' }}>Monitor customer engagement across all creator stores.</p>
        </div>
        <div className="search-wrap">
          <Input 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop view: Table */}
      <div className="desktop-view-only card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredCustomers} actions={actions} loading={loading} />
      </div>

      {/* Mobile view: Customers List */}
      <div className="mobile-view-only mobile-customers-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '16px' }}>No customers found.</div>
        ) : (
          <div className="mobile-customers-list">
            {filteredCustomers.map(customer => {
              const avatarStyles = getAvatarColor(customer.name);
              return (
                <div key={customer.id || customer.email} className="mobile-customer-row">
                  <div className="mobile-customer-left">
                    <div 
                      className="mobile-avatar" 
                      style={{ background: avatarStyles.bg, color: avatarStyles.text }}
                    >
                      {getInitials(customer.name)}
                    </div>
                    <div className="mobile-customer-info">
                      <div className="mobile-customer-name">{customer.name}</div>
                      <div className="mobile-customer-email">{customer.email}</div>
                      <div className="mobile-customer-phone">{customer.phone || 'No Phone'}</div>
                    </div>
                  </div>
                  <div className="mobile-customer-right">
                    <div className="orders-count-row">
                      <div className="purple-dot"></div>
                      <span>{customer.totalOrders} orders</span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(customer)}>View Profile</Button>
                  </div>
                </div>
              );
            })}
            
            <div className="mobile-pagination-wrap">
              <div className="showing-text">Showing 1 to {filteredCustomers.length} of {filteredCustomers.length} customers</div>
              <div className="pagination-buttons">
                <button className="pag-btn">&lt;</button>
                <button className="pag-btn active">1</button>
                <button className="pag-btn">&gt;</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={!!selectedCustomer} 
        onClose={() => setSelectedCustomer(null)}
        title="Customer Profile"
        footer={<Button variant="secondary" onClick={() => setSelectedCustomer(null)}>Close</Button>}
      >
        {selectedCustomer && (
          <div className="customer-details">
            <div className="profile-header">
              <div className="profile-avatar">{selectedCustomer.name.charAt(0)}</div>
              <div className="profile-info">
                <h3>{selectedCustomer.name}</h3>
                <p>{selectedCustomer.email}</p>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '32px' }}>
              <h4>Engagement Summary</h4>
              <div className="detail-grid">
                <div className="detail-item"><strong>Total Orders:</strong> <span>{selectedCustomer.totalOrders} orders</span></div>
                <div className="detail-item"><strong>Total Spent:</strong> <span>₹{selectedCustomer.totalSpent || '0.00'}</span></div>
                <div className="detail-item"><strong>Phone:</strong> <span>{selectedCustomer.phone}</span></div>
                <div className="detail-item"><strong>Customer Since:</strong> <span>{selectedCustomer.joinedDate || '2024'}</span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .profile-header { display: flex; align-items: center; gap: 20px; }
        .profile-avatar { width: 64px; height: 64px; background: #8b5cf6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; }
        .profile-info h3 { font-size: 20px; font-weight: 800; color: #1e293b; margin: 0; }
        .profile-info p { color: #64748b; font-size: 14px; margin: 4px 0 0 0; }
        .detail-section h4 { font-size: 12px; color: #94a3b8; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item strong { font-size: 11px; color: #94a3b8; }
        .detail-item span { font-size: 14px; font-weight: 600; color: #1e293b; }

        /* Desktop / Mobile view toggles */
        .desktop-view-only {
          display: block;
        }
        .mobile-view-only {
          display: none;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .search-wrap {
          width: 300px;
        }

        @media (max-width: 768px) {
          .desktop-view-only {
            display: none !important;
          }
          .mobile-view-only {
            display: block !important;
          }
          .header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            margin-bottom: 24px !important;
          }
          .search-wrap {
            width: 100% !important;
          }
        }

        /* Mobile Customers List CSS */
        .mobile-customers-container {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          overflow: hidden;
        }
        .mobile-customers-list {
          display: flex;
          flex-direction: column;
        }
        .mobile-customer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .mobile-customer-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }
        .mobile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .mobile-customer-info {
          flex: 1;
          min-width: 0;
        }
        .mobile-customer-name {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 3px;
        }
        .mobile-customer-email {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 1px;
          word-break: break-all;
        }
        .mobile-customer-phone {
          font-size: 12px;
          color: #94a3b8;
        }
        .mobile-customer-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          flex-shrink: 0;
        }
        .orders-count-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .purple-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #8b5cf6;
        }
        .mobile-customer-right button,
        .mobile-customer-right :global(button) {
          padding: 6px 14px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          border-radius: 8px !important;
        }

        /* Pagination Styling */
        .mobile-pagination-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 16px 24px 16px;
          background: #fafafa;
        }
        .showing-text {
          font-size: 13px;
          color: #64748b;
        }
        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pag-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #475569;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pag-btn.active {
          background: #f3e8ff;
          color: #8b5cf6;
          border-color: #d8b4fe;
        }
      `}</style>
    </div>
  );
}
