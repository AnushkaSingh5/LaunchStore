'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await dashboardService.getCustomers();
      setCustomers(data);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  const columns = [
    { field: 'name', label: 'Customer', render: (row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
          {row.name.charAt(0)}
        </div>
        <span style={{fontWeight: 600}}>{row.name}</span>
      </div>
    )},
    { field: 'email', label: 'Email', render: (row) => <a href={`mailto:${row.email}`} style={{ color: 'var(--primary)' }}>{row.email}</a> },
    { field: 'phone', label: 'Phone' },
    { field: 'orders', label: 'Total Orders', render: (row) => (
      <span style={{ fontWeight: 600, padding: '4px 12px', background: '#f1f5f9', borderRadius: '20px' }}>{row.orders}</span>
    )},
  ];

  const actions = (row) => (
    <Button variant="secondary" size="sm">View History</Button>
  );

  return (
    <div className="fade-in">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Customers</h2>
          <p style={{ color: 'var(--text-sub)' }}>Manage your customer base and view their order history.</p>
        </div>
        <Button>Export CSV</Button>
      </div>

      {loading ? (
        <div>Loading customers...</div>
      ) : (
        <Table columns={columns} data={customers} actions={actions} />
      )}
    </div>
  );
}
