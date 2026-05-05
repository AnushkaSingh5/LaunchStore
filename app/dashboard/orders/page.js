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
    switch(status) {
      case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
      case 'Shipped': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  const columns = [
    { field: 'id', label: 'Order ID', render: (row) => <span style={{fontWeight: 700}}>{row.id}</span> },
    { field: 'customer', label: 'Customer' },
    { field: 'date', label: 'Date' },
    { field: 'total', label: 'Total', render: (row) => <span style={{fontWeight: 600}}>${row.total.toLocaleString()}</span> },
    { field: 'status', label: 'Status', render: (row) => {
      const colors = getStatusColor(row.status);
      return (
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: '20px', 
          fontSize: '12px',
          fontWeight: 700,
          background: colors.bg,
          color: colors.text
        }}>
          {row.status}
        </span>
      );
    }},
  ];

  const actions = (row) => (
    <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(row)}>View Details</Button>
  );

  const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Orders</h2>
          <p style={{ color: 'var(--text-sub)' }}>Track and manage customer orders.</p>
        </div>
        <div style={{ width: '200px' }}>
          <Select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              {label: 'All Orders', value: 'All'},
              {label: 'Pending', value: 'Pending'},
              {label: 'Shipped', value: 'Shipped'},
              {label: 'Delivered', value: 'Delivered'},
              {label: 'Cancelled', value: 'Cancelled'}
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div>Loading orders...</div>
      ) : (
        <Table columns={columns} data={filteredOrders} actions={actions} />
      )}

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        title={`Order Details: ${selectedOrder?.id}`}
        footer={
          <Button onClick={() => setSelectedOrder(null)}>Close</Button>
        }
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
              <div>
                <p style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '4px' }}>Customer</p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.customer}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '4px' }}>Order Date</p>
                <p style={{ fontWeight: 600 }}>{selectedOrder.date}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '4px' }}>Payment Status</p>
                <p style={{ fontWeight: 600, color: '#166534' }}>Paid</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '4px' }}>Update Status</p>
                <Select 
                  value={selectedOrder.status}
                  onChange={() => {}}
                  options={[
                    {label: 'Pending', value: 'Pending'},
                    {label: 'Shipped', value: 'Shipped'},
                    {label: 'Delivered', value: 'Delivered'},
                    {label: 'Cancelled', value: 'Cancelled'}
                  ]}
                />
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, borderBottom: '1px solid var(--secondary)', paddingBottom: '12px', marginBottom: '16px' }}>Order Items</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', background: '#e2e8f0', borderRadius: '8px' }}></div>
                  <div>
                    <p style={{ fontWeight: 600 }}>Mock Product Name</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-sub)' }}>Qty: 1</p>
                  </div>
                </div>
                <p style={{ fontWeight: 600 }}>${selectedOrder.total.toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderTop: '1px solid var(--secondary)', marginTop: '16px', fontWeight: 700, fontSize: '18px' }}>
                <span>Total</span>
                <span>${selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
