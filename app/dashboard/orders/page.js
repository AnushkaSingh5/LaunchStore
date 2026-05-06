'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Select from '@/components/UI/Select';
import Modal from '@/components/UI/Modal';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await dashboardService.getOrders();
      setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return { bg: '#f0fdf4', text: '#15803d', dot: '#22c55e' };
      case 'Shipped': return { bg: '#eff6ff', text: '#1d4ed8', dot: '#3b82f6' };
      case 'Pending': return { bg: '#fffbeb', text: '#b45309', dot: '#f59e0b' };
      case 'Cancelled': return { bg: '#fef2f2', text: '#b91c1c', dot: '#ef4444' };
      default: return { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' };
    }
  };

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="orders-page">
      <div className="breadcrumbs">
        Dashboard <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        <span className="current">Orders</span>
      </div>

      <div className="header-row">
        <div className="header-left">
          <h1>Orders</h1>
          <p>Track and manage customer orders.</p>
        </div>
        <div className="header-right">
          <div className="status-select-wrapper">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <div className="select-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            </div>
            <div className="card-info">
              <span className="value">24</span>
              <span className="label">Total Orders</span>
            </div>
          </div>
          <div className="trend positive">↑ 18% from last month</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div className="card-info">
              <span className="value">8</span>
              <span className="label">Pending</span>
            </div>
          </div>
          <div className="trend positive">↑ 12% from last month</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <div className="card-info">
              <span className="value">10</span>
              <span className="label">Shipped</span>
            </div>
          </div>
          <div className="trend positive">↑ 25% from last month</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#f0fdf4', color: '#22c55e' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="card-info">
              <span className="value">6</span>
              <span className="label">Delivered</span>
            </div>
          </div>
          <div className="trend positive">↑ 8% from last month</div>
        </div>
        <div className="summary-card">
          <div className="card-top">
            <div className="icon-wrapper" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            </div>
            <div className="card-info">
              <span className="value">4</span>
              <span className="label">Cancelled</span>
            </div>
          </div>
          <div className="trend negative">↓ 2% from last month</div>
        </div>
      </div>

      <div className="actions-bar">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search by order ID or customer name..." />
        </div>
        <div className="filter-group">
          <button className="bar-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters
          </button>
          <div className="sort-wrapper">
            <span>Sort: Newest First</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      <div className="list-container">
        <div className="list-header">
          <div className="col-check"><input type="checkbox" /></div>
          <div className="col-id">ORDER ID</div>
          <div className="col-customer">CUSTOMER</div>
          <div className="col-date">DATE</div>
          <div className="col-total">TOTAL</div>
          <div className="col-status">STATUS</div>
          <div className="col-actions">ACTIONS</div>
        </div>

        <div className="list-body">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading orders...</div>
          ) : filteredOrders.map(order => {
            const status = getStatusColor(order.status);
            return (
              <div key={order.id} className="order-row">
                <div className="col-check"><input type="checkbox" /></div>
                <div className="col-id"><strong>{order.id}</strong></div>
                <div className="col-customer">
                  <div className="cust-info">
                    <strong>{order.customer}</strong>
                    <span>{order.customer.toLowerCase().replace(' ', '.')}@email.com</span>
                  </div>
                </div>
                <div className="col-date">
                  <div className="date-info">
                    <strong>{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                    <span>10:30 AM</span>
                  </div>
                </div>
                <div className="col-total"><strong>${order.total.toFixed(2)}</strong></div>
                <div className="col-status">
                  <span className="status-pill" style={{ background: status.bg, color: status.text }}>
                    <span className="dot" style={{ background: status.dot }}></span>
                    {order.status}
                  </span>
                </div>
                <div className="col-actions">
                  <div className="action-btns">
                    <button className="row-btn view" onClick={() => setSelectedOrder(order)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      View Details
                    </button>
                    <button className="menu-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="list-footer">
          <p>Showing 1 to {filteredOrders.length} of 24 orders</p>
          <div className="footer-right">
            <button className="nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button className="num-btn active">1</button>
            <button className="num-btn">2</button>
            <button className="num-btn">3</button>
            <button className="num-btn">...</button>
            <button className="num-btn">6</button>
            <button className="nav-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .orders-page {
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
          margin-bottom: -8px;
        }

        .breadcrumbs svg { color: #cbd5e1; }
        .breadcrumbs span.current { color: #8b5cf6; font-weight: 600; }

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

        .status-select-wrapper {
          position: relative;
          min-width: 160px;
        }

        .status-select-wrapper select {
          width: 100%;
          padding: 10px 40px 10px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          appearance: none;
          cursor: pointer;
          outline: none;
        }

        .select-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #64748b;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }

        .summary-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-wrapper svg {
          width: 18px;
          height: 18px;
        }

        .card-info {
          display: flex;
          flex-direction: column;
        }

        .card-info .value {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
        }

        .card-info .label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
        }

        .trend {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 0;
        }

        .trend.positive { color: #10b981; }
        .trend.negative { color: #ef4444; }

        .actions-bar {
          display: flex;
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
          gap: 16px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #f1f5f9;
          text-transform: uppercase;
        }

        .col-check { width: 36px; flex-shrink: 0; }
        .col-id { flex: 1.2; }
        .col-customer { flex: 2.5; }
        .col-date { flex: 1.5; }
        .col-total { flex: 0.6; }
        .col-status { flex: 1.7; }
        .col-actions { flex: 1.8; text-align: right; }

        .order-row {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .order-row:hover { background: #fbfaff; }

        .cust-info, .date-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cust-info strong, .date-info strong {
          color: #1e293b;
          font-size: 14px;
        }

        .cust-info span, .date-info span {
          color: #94a3b8;
          font-size: 12px;
        }

        .status-pill {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
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

        /* Global override for Order Details Modal width */
        :global(.modal) {
          max-width: min(1150px, 95vw) !important;
          width: 95% !important;
          overflow-x: hidden !important;
        }

        /* Style for the title passed as prop */
        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        :global(.modal-container) :global(h2) {
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
        }
        
        :global(.orders-page) + :global(.modal-overlay) :global(.modal-header) {
          padding: 16px 32px !important;
        }

        .modal-icon.detail-icon {
          width: 44px;
          height: 44px;
          background: #f5f3ff;
          color: #8b5cf6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .order-badge {
          background: #f5f3ff;
          color: #8b5cf6;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .modal-title-box h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .modal-title-box p {
          font-size: 13px;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .order-details-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 4px 0;
        }

        .info-bar {
          background: #f8fafc;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 16px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-item.customer { flex: 1.5; }
        .info-item.date { flex: 1.2; }
        .info-item.payment { flex: 1; }
        .info-item.status { flex: 1; }

        .info-label {
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .info-val-box {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .val-icon {
          width: 32px;
          height: 32px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8b5cf6;
        }

        .val-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .val-text strong { font-size: 14px; color: #1e293b; }
        .val-text span { font-size: 12px; color: #94a3b8; }

        .info-divider {
          width: 1px;
          height: 32px;
          background: #e2e8f0;
          margin: 0 16px;
        }

        @media (max-width: 1024px) {
          .info-divider { display: none; }
          .info-item { min-width: 200px; flex: 1; }
        }

        .val-select-wrapper {
          position: relative;
        }

        .val-select-wrapper select {
          width: 100%;
          padding: 8px 32px 8px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          appearance: none;
          cursor: pointer;
        }

        .select-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #64748b;
        }

        .section-title {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 10px;
        }

        .items-table {
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-row {
          display: flex;
          align-items: center;
          padding: 10px 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .table-row.head {
          background: #f8fafc;
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.8px;
        }

        .col-prod { flex: 2.5; }
        .col-qty { flex: 0.8; text-align: center; }
        .col-price { flex: 1.2; text-align: center; }
        .col-total { flex: 1.2; text-align: right; }

        .prod-item-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .prod-img {
          width: 44px;
          height: 44px;
          background: #f1f5f9;
          border-radius: 8px;
          background-image: url('https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=100&q=80');
          background-size: cover;
        }

        .prod-meta { display: flex; flex-direction: column; }
        .prod-meta strong { font-size: 13px; color: #1e293b; }
        .prod-meta span { font-size: 11px; color: #94a3b8; }

        .total-summary-box {
          background: #fbfaff;
          border: 1px solid #f5f3ff;
          border-radius: 16px;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .total-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wallet-icon {
          width: 32px;
          height: 32px;
          background: #f5f3ff;
          color: #8b5cf6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .total-left strong { font-size: 15px; color: #1e293b; }
        .total-val { font-size: 20px; font-weight: 800; color: #6366f1; }

        .timeline {
          display: flex;
          flex-direction: column;
        }

        .timeline-item {
          display: flex;
          gap: 16px;
        }

        .time-line-track {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .time-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f0fdf4;
          color: #22c55e;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 1;
        }

        .time-dot.blue { background: #eff6ff; color: #3b82f6; }

        .time-line-track .line {
          width: 2px;
          flex: 1;
          background: #f1f5f9;
          margin: 4px 0;
        }

        .time-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          padding-bottom: 16px;
        }

        .time-info { display: flex; flex-direction: column; gap: 2px; }
        .time-info strong { font-size: 14px; color: #1e293b; }
        .time-info span { font-size: 12px; color: #94a3b8; }
        .time-user { font-size: 12px; color: #94a3b8; font-weight: 700; }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          padding-top: 12px;
        }

        .close-modal-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 8px 32px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-modal-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        @media (max-width: 768px) {
          .summary-grid { grid-template-columns: 1fr; }
          .order-row { flex-direction: column; align-items: flex-start; gap: 16px; }
          .col-check { display: none; }
          .col-actions { text-align: left; width: 100%; }
          .action-btns { justify-content: flex-start; }
        }
      `}</style>

      {/* Keep the detail modal logic */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={
          <div className="modal-header-content">
            <div className="modal-icon detail-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div className="modal-title-box">
              <div className="title-with-badge">
                <h2>Order Details</h2>
                <span className="order-badge">{selectedOrder?.id}</span>
              </div>
              <p>View and manage the details of this order.</p>
            </div>
          </div>
        }
        footer={
          <div className="modal-footer-btns">
            <button className="close-modal-btn" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        }
      >
        <div className="order-details-content">
          <div className="info-bar">
            <div className="info-item customer">
              <span className="info-label">Customer</span>
              <div className="info-val-box">
                <div className="val-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                <div className="val-text">
                  <strong>{selectedOrder?.customer}</strong>
                  <span>{selectedOrder?.customer.toLowerCase().replace(' ', '.')}@email.com</span>
                </div>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item date">
              <span className="info-label">Order Date</span>
              <div className="info-val-box">
                <div className="val-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                <div className="val-text">
                  <strong>{selectedOrder ? new Date(selectedOrder.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}</strong>
                  <span>10:30 AM</span>
                </div>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item payment">
              <span className="info-label">Payment Status</span>
              <div className="info-val-box">
                <span className="status-pill" style={{ background: '#f0fdf4', color: '#15803d', padding: '6px 12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '6px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Paid
                </span>
              </div>
            </div>
            <div className="info-divider"></div>
            <div className="info-item status">
              <span className="info-label">Update Status</span>
              <div className="val-select-wrapper">
                <select defaultValue={selectedOrder?.status}>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="select-arrow"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></div>
              </div>
            </div>
          </div>

          <div className="items-section">
            <h3 className="section-title">Order Items</h3>
            <div className="items-table">
              <div className="table-row head">
                <div className="col-prod">PRODUCT</div>
                <div className="col-qty">QUANTITY</div>
                <div className="col-price">UNIT PRICE</div>
                <div className="col-total">TOTAL</div>
              </div>
              <div className="table-row">
                <div className="col-prod">
                  <div className="prod-item-box">
                    <div className="prod-img"></div>
                    <div className="prod-meta">
                      <strong>Modern Coffee Table</strong>
                      <span>SKU: MCT-001</span>
                    </div>
                  </div>
                </div>
                <div className="col-qty">1</div>
                <div className="col-price">$450.00</div>
                <div className="col-total"><strong>$450.00</strong></div>
              </div>
            </div>
          </div>

          <div className="total-summary-box">
            <div className="total-left">
              <div className="wallet-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M7 15h0M2 9.5h20"></path></svg>
              </div>
              <strong>Order Total</strong>
            </div>
            <div className="total-val">${selectedOrder?.total.toFixed(2)}</div>
          </div>

          <div className="timeline-section">
            <h3 className="section-title">Order Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="time-line-track">
                  <div className="time-dot active"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  <div className="line"></div>
                </div>
                <div className="time-content">
                  <div className="time-info">
                    <strong>Order Placed</strong>
                    <span>25 Oct, 2023 10:30 AM</span>
                  </div>
                  <span className="time-user">Alice Smith</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="time-line-track">
                  <div className="time-dot active"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                  <div className="line"></div>
                </div>
                <div className="time-content">
                  <div className="time-info">
                    <strong>Payment Completed</strong>
                    <span>25 Oct, 2023 10:31 AM</span>
                  </div>
                  <span className="time-user">System</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="time-line-track">
                  <div className="time-dot blue"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                </div>
                <div className="time-content">
                  <div className="time-info">
                    <strong>Order Delivered</strong>
                    <span>27 Oct, 2023 04:20 PM</span>
                  </div>
                  <span className="time-user">System</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
