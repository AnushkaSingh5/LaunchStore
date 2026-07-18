'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { useState } from 'react';

export default function AdminOrders() {
  const { orders = [], loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = loading ? [] : orders.filter(o => 
    String(o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(o.customer || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(o.store || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: 'id', label: 'Order ID', render: (row) => (
      <span style={{ fontWeight: 700, fontFamily: 'monospace' }} title={row.id}>
        {row.id ? `${row.id.substring(0, 8)}...` : 'N/A'}
      </span>
    )},
    { field: 'customer', label: 'Customer' },
    { field: 'store', label: 'Store' },
    { field: 'total', label: 'Total Amount', render: (row) => `₹${row.total.toLocaleString()}` },
    { field: 'paymentMethod', label: 'Payment', render: (row) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontWeight: 600 }}>{row.paymentMethod}</span>
        <span className={`status-pill ${(row.paymentStatus || 'Pending').toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
          {row.paymentStatus || 'Pending'}
        </span>
      </div>
    )},
    { field: 'status', label: 'Status', render: (row) => (
      <span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span>
    )},
    { field: 'date', label: 'Date' },
  ];

  const actions = (row) => (
    <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(row)}>View Details</Button>
  );

  return (
    <div className="admin-orders">
      <div className="header-row">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Platform Orders</h2>
          <p style={{ color: '#64748b' }}>Track and monitor all sales transactions across the entire platform.</p>
        </div>
        <div className="search-wrap">
          <Input 
            placeholder="Search Order ID, Store, or Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop view: Table */}
      <div className="desktop-view-only card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredOrders} actions={actions} loading={loading} />
      </div>

      {/* Mobile view: Orders Cards */}
      <div className="mobile-view-only mobile-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '16px' }}>No orders found.</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="mobile-order-card">
              <div className="mobile-card-top">
                <div className="order-icon-wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <div className="order-details-middle">
                  <div className="order-id-label">{order.id ? (order.id.length > 8 ? `${order.id.substring(0, 8)}...` : order.id) : 'N/A'}</div>
                  <div className="order-sub-label">{order.customer} &bull; {order.store}</div>
                </div>
                <div className="order-right-stats">
                  <div className="order-price">₹{(order.total || 0).toLocaleString()}</div>
                  <span className={`status-pill ${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
              </div>
              <div className="mobile-card-bottom">
                <div className="order-date-wrap">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: '6px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span>{order.date}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(order)}>View Details</Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mobile-view-only mobile-pagination-wrap">
        <div className="showing-text">Showing 1 to {Math.min(filteredOrders.length, 6)} of {filteredOrders.length} orders</div>
        <div className="pagination-buttons">
          <button className="pag-btn">&lt;</button>
          <button className="pag-btn active">1</button>
          <button className="pag-btn">2</button>
          <button className="pag-btn">3</button>
          <span className="pag-dots">...</span>
          <button className="pag-btn">4</button>
          <button className="pag-btn">&gt;</button>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        title={`Order Details - ${selectedOrder?.id}`}
        footer={<Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>}
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="detail-section">
              <h4>Order Summary</h4>
              <div className="detail-grid">
                <div className="detail-item"><strong>Order ID:</strong> <span>{selectedOrder.id}</span></div>
                <div className="detail-item"><strong>Date:</strong> <span>{selectedOrder.date}</span></div>
                <div className="detail-item"><strong>Total:</strong> <span style={{ color: '#8b5cf6', fontSize: '18px' }}>₹{selectedOrder.total.toLocaleString()}</span></div>
                <div className="detail-item"><strong>Status:</strong> <span className={`status-pill ${selectedOrder.status.toLowerCase()}`}>{selectedOrder.status}</span></div>
              </div>
            </div>
            
            <div className="detail-row" style={{ display: 'flex', gap: '32px', marginTop: '24px' }}>
              <div className="detail-section" style={{ flex: 1 }}>
                <h4>Customer Info</h4>
                <div className="detail-item"><strong>Name:</strong> <span>{selectedOrder.customer}</span></div>
                <div className="detail-item" style={{ marginTop: '8px' }}><strong>Email:</strong> <span>{selectedOrder.email || 'N/A'}</span></div>
              </div>
              <div className="detail-section" style={{ flex: 1 }}>
                <h4>Store</h4>
                <div className="detail-item"><strong>Store Name:</strong> <span>{selectedOrder.store}</span></div>
              </div>
            </div>

            <div className="detail-section" style={{ marginTop: '24px' }}>
              <h4>Shipping & Payment</h4>
              <div className="detail-grid">
                <div className="detail-item"><strong>Payment Method:</strong> <span>{selectedOrder.paymentMethod}</span></div>
                <div className="detail-item"><strong>Payment Status:</strong> <span className={`status-pill ${(selectedOrder.paymentStatus || 'Pending').toLowerCase()}`}>{selectedOrder.paymentStatus || 'Pending'}</span></div>
                <div className="detail-item" style={{ gridColumn: 'span 2', marginTop: '8px' }}><strong>Shipping Address:</strong> <span>{selectedOrder.address || 'Standard Shipping'}</span></div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .detail-section h4 { font-size: 13px; color: #94a3b8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item strong { font-size: 11px; color: #94a3b8; }
        .detail-item span { font-size: 14px; font-weight: 600; color: #1e293b; }
        .status-pill {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          width: fit-content;
        }
        .status-pill.delivered { background: #dcfce7; color: #166534; }
        .status-pill.shipped { background: #dbeafe; color: #1e40af; }
        .status-pill.processing { background: #fef3c7; color: #92400e; }
        .status-pill.cancelled { background: #fee2e2; color: #b91c1c; }
        .status-pill.paid { background: #dcfce7; color: #166534; }
        .status-pill.pending { background: #fef3c7; color: #92400e; }
        .status-pill.failed { background: #fee2e2; color: #b91c1c; }

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

        /* Mobile Order Card CSS */
        .mobile-order-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
        }
        .mobile-card-top {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .order-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f3e8ff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .order-details-middle {
          flex: 1;
          min-width: 0;
        }
        .order-id-label {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
          font-family: monospace;
        }
        .order-sub-label {
          font-size: 13px;
          color: #64748b;
        }
        .order-right-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }
        .order-price {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
        }
        .mobile-card-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
          border-top: 1px solid #f1f5f9;
          padding-top: 12px;
        }
        .order-date-wrap {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #64748b;
        }
        .mobile-card-bottom button,
        .mobile-card-bottom :global(button) {
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
          margin-top: 24px;
          padding-bottom: 24px;
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
        .pag-dots {
          color: #94a3b8;
          font-size: 14px;
          padding: 0 4px;
        }
      `}</style>
    </div>
  );
}
