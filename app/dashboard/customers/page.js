'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Modal from '@/components/UI/Modal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const stats = [
    { label: 'Total Customers', value: '4', sub: 'All time customers', color: '#f5f3ff', iconColor: '#8b5cf6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { label: 'Total Orders', value: '9', sub: 'All orders placed', color: '#f0fdf4', iconColor: '#22c55e', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
    { label: 'Total Spent', value: '$1,634.00', sub: 'All time revenue', color: '#fff7ed', iconColor: '#ea580c', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { label: 'New Customers', value: '2', sub: 'This month', trend: '+ 25%', color: '#eff6ff', iconColor: '#3b82f6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg> },
  ];

  const mockCustomers = [
    { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '+1 234 567 8900', orders: 3, spent: 450, color: '#f5f3ff', textColor: '#8b5cf6', initial: 'A' },
    { id: 2, name: 'Bob Jones', email: 'bob@example.com', phone: '+1 234 567 8901', orders: 1, spent: 199, color: '#f0fdf4', textColor: '#22c55e', initial: 'B' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 234 567 8902', orders: 5, spent: 899, color: '#fffbeb', textColor: '#f59e0b', initial: 'C' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', phone: '+1 234 567 8903', orders: 0, spent: 0, color: '#fef2f2', textColor: '#ef4444', initial: 'D' },
  ];

  useEffect(() => {
    // In a real app, we would fetch from dashboardService
    setCustomers(mockCustomers);
    setLoading(false);
  }, []);

  return (
    <div className="customers-page">
      <div className="header-row">
        <div className="header-left">
          <h1>Customers</h1>
          <p>Manage your customer base and view their order history.</p>
        </div>
        <button className="export-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon-box" style={{ background: s.color, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{s.label}</span>
              <div className="stat-val-row">
                <span className="stat-value">{s.value}</span>
                {s.trend && <span className="stat-trend">{s.trend}</span>}
              </div>
              <span className="stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-filters-bar">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search by name, email or phone..." />
        </div>
        <div className="filter-group">
          <button className="bar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters
          </button>
          <div className="sort-wrapper">
            <span>Sort by: <strong>Newest First</strong></span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      <div className="list-container">
        <div className="list-header">
          <div className="col-customer">Customer</div>
          <div className="col-email">Email</div>
          <div className="col-phone">Phone</div>
          <div className="col-orders">Total Orders</div>
          <div className="col-spent">Total Spent</div>
          <div className="col-actions">Actions</div>
        </div>

        {loading ? (
          <div className="loading-state">Loading customers...</div>
        ) : (
          customers.map(cust => (
            <div className="customer-row" key={cust.id}>
              <div className="col-customer">
                <div className="cust-avatar-box">
                  <div className="avatar" style={{ background: cust.color, color: cust.textColor }}>{cust.initial}</div>
                  <strong>{cust.name}</strong>
                </div>
              </div>
              <div className="col-email">{cust.email}</div>
              <div className="col-phone">{cust.phone}</div>
              <div className="col-orders">
                <span className="order-pill">{cust.orders}</span>
              </div>
              <div className="col-spent">
                <strong>${cust.spent.toFixed(2)}</strong>
              </div>
              <div className="col-actions">
                <div className="action-btns">
                  <button className="row-btn view" onClick={() => setSelectedCustomer(cust)}>View History</button>
                  <button className="menu-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="list-footer">
          <p>Showing 1 to 4 of 4 customers</p>
          <div className="footer-right">
            <button className="nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button className="num-btn active">1</button>
            <button className="nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={
          <div className="modal-header-content">
            <div className="avatar history-avatar" style={{ background: selectedCustomer?.color, color: selectedCustomer?.textColor }}>
              {selectedCustomer?.initial}
            </div>
            <div className="modal-title-box">
              <div className="title-with-badge">
                <h2>Customer History</h2>
                <span className="since-badge">Customer since Oct 20, 2023</span>
              </div>
              <p>{selectedCustomer?.name}</p>
            </div>
          </div>
        }
        footer={
          <div className="modal-footer-btns">
            <button className="outline-btn" onClick={() => setSelectedCustomer(null)}>Close</button>
            <button className="primary-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Send Email
            </button>
          </div>
        }
      >
        <div className="history-content">
          <div className="section-group">
            <h3 className="section-label">Customer Overview</h3>
            <div className="overview-cards">
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Total Orders</span>
                  <strong>3</strong>
                </div>
              </div>
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Total Spent</span>
                  <strong>$748.00</strong>
                </div>
              </div>
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Last Order</span>
                  <strong>May 05, 2026</strong>
                </div>
              </div>
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Email</span>
                  <strong style={{ fontSize: '12px' }}>{selectedCustomer?.email}</strong>
                </div>
              </div>
            </div>
            <div className="phone-card">
              <div className="ov-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div className="ov-info">
                <span className="ov-label">Phone</span>
                <strong>{selectedCustomer?.phone}</strong>
              </div>
            </div>
          </div>

          <div className="section-group">
            <h3 className="section-label">Order History</h3>
            <div className="history-table">
              <div className="h-head">
                <div className="h-col-id">Order ID</div>
                <div className="h-col-date">Date</div>
                <div className="h-col-status">Status</div>
                <div className="h-col-total">Total</div>
                <div className="h-col-items">Items</div>
                <div className="h-col-actions">Actions</div>
              </div>
              {[
                { id: 'ORD-1001', date: 'May 05, 2026', time: '02:30 PM', status: 'Delivered', color: '#f0fdf4', textColor: '#15803d', total: '$450.00', items: '1 item' },
                { id: 'ORD-0992', date: 'Apr 21, 2026', time: '11:15 AM', status: 'Pending', color: '#fffbeb', textColor: '#b45309', total: '$199.00', items: '2 items' },
                { id: 'ORD-0981', date: 'Mar 10, 2026', time: '09:45 AM', status: 'Shipped', color: '#eff6ff', textColor: '#1d4ed8', total: '$99.00', items: '1 item' },
              ].map(order => (
                <div className="h-row" key={order.id}>
                  <div className="h-col-id"><strong>{order.id}</strong></div>
                  <div className="h-col-date">
                    <div className="h-date-box">
                      <strong>{order.date}</strong>
                      <span>{order.time}</span>
                    </div>
                  </div>
                  <div className="h-col-status">
                    <span className="h-status" style={{ background: order.color, color: order.textColor }}>
                      <span className="h-dot" style={{ background: order.textColor }}></span>
                      {order.status}
                    </span>
                  </div>
                  <div className="h-col-total"><strong>{order.total}</strong></div>
                  <div className="h-col-items">{order.items}</div>
                <div className="h-col-actions">
                  <button className="row-btn view">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    View Details
                  </button>
                </div>
                </div>
              ))}
            </div>
          </div>

          <div className="notes-section">
            <div className="notes-left">
              <div className="ov-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="ov-info">
                <strong>Customer Notes</strong>
                <p>No notes added for this customer yet.</p>
              </div>
            </div>
            <button className="add-note-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Note
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .customers-page {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 100%;
          overflow-x: hidden;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #94a3b8;
        }

        .breadcrumbs span.active { color: #6366f1; font-weight: 600; }

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

        .export-btn {
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

        .export-btn:hover { background: #4f46e5; transform: translateY(-1px); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-card {
          background: #fff;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s;
        }

        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.03); }

        .stat-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 13px; font-weight: 600; color: #64748b; }
        
        .stat-val-row { display: flex; align-items: center; gap: 10px; }
        .stat-value { font-size: 24px; font-weight: 800; color: #1e293b; }
        .stat-trend { font-size: 12px; font-weight: 700; color: #22c55e; background: #f0fdf4; padding: 2px 8px; border-radius: 20px; }
        
        .stat-sub { font-size: 12px; color: #94a3b8; }

        .table-filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
          align-items: center;
          gap: 12px;
        }

        .bar-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0 20px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
        }

        .sort-wrapper {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0 20px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
        }

        .list-container {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          overflow-x: auto;
          border: 1px solid #f1f5f9;
        }

        .list-header {
          background: #f8fafc;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 1px;
          border-bottom: 1px solid #f1f5f9;
          text-transform: uppercase;
        }

        .col-customer { flex: 1.8; }
        .col-email { flex: 1.8; color: #64748b; }
        .col-phone { flex: 1.5; color: #64748b; }
        .col-orders { flex: 0.8; text-align: center; }
        .col-spent { flex: 1; text-align: center; }
        .col-actions { flex: 1.5; text-align: right; }

        .customer-row {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .customer-row:hover { background: #fbfaff; }

        .cust-avatar-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .order-pill {
          background: #f5f3ff;
          color: #8b5cf6;
          padding: 4px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
        }

        .action-btns {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .row-btn.view {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
          color: #1e293b;
        }

        .row-btn.view:hover { background: #f8fafc; border-color: #cbd5e1; }

        .menu-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
        }

        .list-footer {
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-footer p { font-size: 13px; color: #64748b; }
        .footer-right { display: flex; align-items: center; gap: 8px; }

        .nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
        }

        .num-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }
        .num-btn.active { background: #6366f1; color: #fff; }

        .loading-state {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }

        /* Modal Styles */
        :global(.modal) {
          max-width: min(1000px, 95vw) !important;
          width: 95% !important;
        }

        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .history-avatar {
          width: 48px !important;
          height: 48px !important;
          font-size: 18px !important;
        }

        .modal-title-box h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .since-badge {
          background: #f5f3ff;
          color: #8b5cf6;
          padding: 2px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .modal-title-box p {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
          font-weight: 600;
        }

        .history-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-label {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 16px 0;
        }

        .overview-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .ov-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 200px;
        }

        .ov-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ov-info { display: flex; flex-direction: column; gap: 2px; }
        .ov-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .ov-info strong { font-size: 14px; color: #1e293b; }

        .phone-card { 
          width: 100%;
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-table {
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          overflow: hidden;
        }

        .h-head {
          background: #f8fafc;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .h-row {
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .h-row:last-child { border-bottom: none; }

        .h-col-id { flex: 0.8; color: #6366f1; }
        .h-col-date { flex: 1.8; }
        .h-col-status { flex: 1.2; }
        .h-col-total { flex: 1; }
        .h-col-items { flex: 0.8; color: #64748b; font-size: 13px; }
        .h-col-actions { flex: 1.5; text-align: right; }

        .h-date-box { display: flex; flex-direction: column; }
        .h-date-box strong { font-size: 13px; color: #1e293b; }
        .h-date-box span { font-size: 11px; color: #94a3b8; }

        .h-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .h-dot { width: 6px; height: 6px; border-radius: 50%; }

        .h-view-btn {
          display: none;
        }

        .notes-section {
          background: #fbfaff;
          border: 1px solid #f5f3ff;
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notes-left { display: flex; align-items: center; gap: 16px; }
        .notes-left p { margin: 0; font-size: 13px; color: #64748b; }

        .add-note-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #6366f1;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;
        }

        .outline-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 10px 32px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .primary-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 10px 32px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
