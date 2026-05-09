'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { useState } from 'react';

export default function AdminCustomers() {
  const { customers, loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  if (loading) return <div style={{ padding: '40px' }}>Loading customer database...</div>;

  const filteredCustomers = customers.filter(c => 
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

  const actions = (row) => (
    <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(row)}>View Profile</Button>
  );

  return (
    <div className="admin-customers">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b' }}>Customer Database</h2>
          <p style={{ color: '#64748b' }}>Monitor customer engagement across all creator stores.</p>
        </div>
        <div style={{ width: '300px' }}>
          <Input 
            placeholder="Search name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9' }}>
        <Table columns={columns} data={filteredCustomers} actions={actions} />
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
                <div className="detail-item"><strong>Total Spent:</strong> <span>${selectedCustomer.totalSpent || '0.00'}</span></div>
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
      `}</style>
    </div>
  );
}
