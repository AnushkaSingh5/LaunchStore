// app/admin/(dashboard)/shipping/page.js
'use client';

import { useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';

export default function AdminShippingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [syncingMap, setSyncingMap] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');

  const loadShippingData = async () => {
    setLoading(true);
    if (!supabaseClient) {
      // Mock data fallback for offline development
      const mockShippingOrders = [
        {
          id: 'ORD-CF-100234',
          created_at: new Date().toISOString(),
          customer_name: 'Rahul Kumar',
          customer_email: 'rahul@gmail.com',
          customer_phone: '9876543210',
          shipping_address: 'Flat 402, Green Glen Layout, Bengaluru, Karnataka - 560103',
          total_amount: 1599.00,
          payment_status: 'paid',
          store: { name: 'Luxe Wear' },
          shipping_provider: 'Shiprocket',
          shipment_id: 'sr_ship_392942',
          awb_number: 'AWB99201948',
          courier_name: 'Delhivery Direct',
          tracking_number: 'AWB99201948',
          tracking_url: 'https://track.shiprocket.in/tracking/AWB99201948',
          shipping_status: 'In Transit'
        },
        {
          id: 'ORD-CF-100235',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          customer_name: 'Sneha Shah',
          customer_email: 'sneha@yahoo.com',
          customer_phone: '9812345678',
          shipping_address: 'Sector 15, Vashi, Navi Mumbai, Maharashtra - 400703',
          total_amount: 899.00,
          payment_status: 'paid',
          store: { name: 'Aroma Candles' },
          shipping_provider: 'Shiprocket',
          shipment_id: 'sr_ship_392943',
          awb_number: 'AWB99201949',
          courier_name: 'BlueDart Express',
          tracking_number: 'AWB99201949',
          tracking_url: 'https://track.shiprocket.in/tracking/AWB99201949',
          shipping_status: 'Shipment Created'
        },
        {
          id: 'ORD-CF-100236',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          customer_name: 'Amit Patel',
          customer_email: 'amit@gmail.com',
          customer_phone: '9922883344',
          shipping_address: 'C-302, Satellite, Ahmedabad, Gujarat - 380015',
          total_amount: 2499.00,
          payment_status: 'paid',
          store: { name: 'Luxe Wear' },
          shipping_provider: 'Shiprocket',
          shipment_id: 'sr_ship_392944',
          awb_number: 'AWB99201950',
          courier_name: 'Delhivery Direct',
          tracking_number: 'AWB99201950',
          tracking_url: 'https://track.shiprocket.in/tracking/AWB99201950',
          shipping_status: 'Delivered'
        }
      ];
      setOrders(mockShippingOrders);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*, store:store_id(name)')
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error('Failed to load admin shipping orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShippingData();
  }, []);

  const handleSyncStatus = async (orderId) => {
    setSyncingMap(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`/api/shipping/sync?order_id=${orderId}`);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('❌ [Admin/Sync] Failed response:', text);
        let errMsg = 'Failed to sync status.';
        try {
          const data = JSON.parse(text);
          errMsg = data.message || data.error || errMsg;
        } catch (e) {
          errMsg = text.includes('<!DOCTYPE html>') ? 'Internal server error (HTML returned)' : text || errMsg;
        }
        throw new Error(errMsg);
      }
      const data = await res.json();
      alert(`Status synced successfully: ${data.status}`);
      await loadShippingData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, shipping_status: data.status }));
      }
    } catch (err) {
      alert('Failed to sync shipping status: ' + err.message);
    } finally {
      setSyncingMap(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelShipment = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    try {
      const res = await fetch('/api/shipping/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('❌ [Admin/Cancel] Failed response:', text);
        let errMsg = 'Failed to cancel shipment.';
        try {
          const data = JSON.parse(text);
          errMsg = data.message || data.error || errMsg;
        } catch (e) {
          errMsg = text.includes('<!DOCTYPE html>') ? 'Internal server error (HTML returned)' : text || errMsg;
        }
        throw new Error(errMsg);
      }
      alert('Shipment cancelled successfully.');
      await loadShippingData();
      setSelectedOrder(null);
    } catch (err) {
      alert('Failed to cancel shipment: ' + err.message);
    }
  };

  // Metrics calculations
  const totalShipments = orders.length;
  const pendingCount = orders.filter(o => o.shipping_status === 'Pending' || o.shipping_status === 'Shipment Created').length;
  const deliveredCount = orders.filter(o => o.shipping_status === 'Delivered').length;
  const returnedCount = orders.filter(o => o.shipping_status === 'Returned').length;
  const cancelledCount = orders.filter(o => o.shipping_status === 'Cancelled').length;

  // Filter rows
  const filteredOrders = orders.filter(o => {
    // Apply status filter
    if (statusFilter !== 'All') {
      const status = String(o.shipping_status || 'Pending').toLowerCase();
      if (statusFilter === 'Pending' && status !== 'pending' && status !== 'shipment created') return false;
      if (statusFilter === 'Delivered' && status !== 'delivered') return false;
      if (statusFilter === 'Returned' && status !== 'returned') return false;
      if (statusFilter === 'Cancelled' && status !== 'cancelled') return false;
    }

    const query = searchQuery.toLowerCase();
    const orderIdMatches = String(o.id || '').toLowerCase().includes(query);
    const awbMatches = String(o.awb_number || '').toLowerCase().includes(query);
    const customerMatches = String(o.customer_name || '').toLowerCase().includes(query);
    const storeMatches = String(o.store?.name || '').toLowerCase().includes(query);
    return orderIdMatches || awbMatches || customerMatches || storeMatches;
  });

  const columns = [
    { field: 'id', label: 'Order ID', render: (row) => (
      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{row.id.substring(0, 8).toUpperCase()}</span>
    )},
    { field: 'store', label: 'Store Name', render: (row) => row.store?.name || 'Platform Store' },
    { field: 'customer_name', label: 'Customer' },
    { field: 'courier_name', label: 'Courier', render: (row) => row.courier_name || 'Not Shipped' },
    { field: 'awb_number', label: 'AWB / Tracking', render: (row) => row.awb_number || 'N/A' },
    { field: 'shipping_status', label: 'Status', render: (row) => (
      <span className={`status-pill ${String(row.shipping_status || 'Pending').toLowerCase().replace(' ', '-')}`} style={{ 
        background: row.shipping_status === 'Delivered' ? '#ecfdf5' : row.shipping_status === 'Cancelled' ? '#fef2f2' : '#eff6ff',
        color: row.shipping_status === 'Delivered' ? '#047857' : row.shipping_status === 'Cancelled' ? '#b91c1c' : '#1d4ed8',
        fontWeight: 'bold',
        padding: '4px 10px',
        borderRadius: '99px',
        fontSize: '12px'
      }}>
        {row.shipping_status || 'Pending'}
      </span>
    )},
    { field: 'created_at', label: 'Date', render: (row) => new Date(row.created_at).toLocaleDateString('en-GB') }
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="secondary" size="sm" onClick={() => setSelectedOrder(row)}>Manage</Button>
      {row.awb_number && (
        <Button 
          variant="outline" 
          size="sm" 
          disabled={syncingMap[row.id]} 
          onClick={() => handleSyncStatus(row.id)}
        >
          {syncingMap[row.id] ? 'Syncing...' : 'Sync'}
        </Button>
      )}
    </div>
  );

  return (
    <div className="admin-shipping-page" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>Platform Shipping Monitor</h1>
          <p style={{ color: '#64748b' }}>Supervise all Shiprocket integrations, track package delivery lifecycles, and audit courier allocations across stores.</p>
        </div>
        <div style={{ width: '320px' }}>
          <Input 
            placeholder="Search Order ID, AWB, Customer, Store..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Orders Paid</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', marginTop: '6px' }}>{totalShipments}</div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Pending Shipments</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '6px' }}>{pendingCount}</div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivered Orders</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>{deliveredCount}</div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Returned Orders</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ef4444', marginTop: '6px' }}>{returnedCount}</div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cancelled Shipments</span>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#64748b', marginTop: '6px' }}>{cancelledCount}</div>
        </div>
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Delivered', 'Returned', 'Cancelled'].map(filter => {
          const isActive = statusFilter === filter;
          let count = totalShipments;
          if (filter === 'Pending') count = pendingCount;
          else if (filter === 'Delivered') count = deliveredCount;
          else if (filter === 'Returned') count = returnedCount;
          else if (filter === 'Cancelled') count = cancelledCount;

          return (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                border: '1px solid',
                borderColor: isActive ? '#2563eb' : '#e2e8f0',
                background: isActive ? '#eff6ff' : '#ffffff',
                color: isActive ? '#1d4ed8' : '#64748b',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <span>{filter}</span>
              <span style={{
                background: isActive ? '#2563eb' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#64748b',
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '99px',
                fontWeight: 600
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredOrders} actions={actions} loading={loading} />
      </div>

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)}
        title={`Shipment Details - Order #${selectedOrder?.id?.substring(0, 8).toUpperCase()}`}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {selectedOrder?.awb_number && selectedOrder?.shipping_status !== 'Cancelled' && (
              <button 
                onClick={() => handleCancelShipment(selectedOrder.id)}
                style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel Shipment
              </button>
            )}
            <Button variant="secondary" onClick={() => setSelectedOrder(null)}>Close</Button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="shipping-admin-details" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Shipment Metadata</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><strong>Merchant Store:</strong> {selectedOrder.store?.name || 'Platform Store'}</div>
                <div><strong>Shipping Provider:</strong> {selectedOrder.shipping_provider || 'Shiprocket'}</div>
                <div><strong>Shipment ID:</strong> {selectedOrder.shipment_id || 'Not Assigned'}</div>
                <div><strong>AWB Number:</strong> {selectedOrder.awb_number || 'Not Assigned'}</div>
                <div><strong>Courier Name:</strong> {selectedOrder.courier_name || 'Standard Courier'}</div>
                <div>
                  <strong>Shipping Status:</strong>{' '}
                  <span style={{ fontWeight: 'bold', color: selectedOrder.shipping_status === 'Delivered' ? '#10b981' : '#2563eb' }}>
                    {selectedOrder.shipping_status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Customer Contact</h3>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Name:</strong> {selectedOrder.customer_name}</div>
                  <div><strong>Email:</strong> {selectedOrder.customer_email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedOrder.customer_phone || 'N/A'}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '12px' }}>Delivery Address</h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>{selectedOrder.shipping_address}</p>
              </div>
            </div>

            {selectedOrder.awb_number && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <a 
                  href={`/api/shipping/label?order_id=${selectedOrder.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0f172a', color: '#fff', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                >
                  🖨️ Download Packing & Shipping Label
                </a>
                {selectedOrder.tracking_url && (
                  <a 
                    href={selectedOrder.tracking_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
                  >
                    🚚 Direct Courier Tracking Link
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
