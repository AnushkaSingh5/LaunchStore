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
    { field: 'paymentMethod', label: 'Payment' },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Platform Orders</h2>
          <p style={{ color: '#64748b' }}>Track and monitor all sales transactions across the entire platform.</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input 
            placeholder="Search Order ID, Store, or Customer..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredOrders} actions={actions} loading={loading} />
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
                <div className="detail-item"><strong>Shipping Address:</strong> <span>{selectedOrder.address || 'Standard Shipping'}</span></div>
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
      `}</style>
    </div>
  );
}
