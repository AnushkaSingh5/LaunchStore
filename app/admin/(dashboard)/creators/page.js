'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { useState } from 'react';

export default function AdminCreators() {
  const { stores = [], loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState(null);

  // Derive creators from stores (in this mock setup, each store has an owner)
  const creators = loading ? [] : stores.map(store => ({
    id: store.id,
    name: store.ownerName || '',
    email: store.email || '',
    storeName: store.name || '',
    status: store.status || '',
    joinedDate: store.createdDate || '',
    revenue: store.revenue || 0,
    growth: store.growth || 0
  })).filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { field: 'name', label: 'Creator Name', render: (row) => <span style={{ fontWeight: 700 }}>{row.name}</span> },
    { field: 'email', label: 'Email' },
    { field: 'storeName', label: 'Primary Store' },
    { field: 'revenue', label: 'Total Revenue', render: (row) => `₹${(row.revenue || 0).toLocaleString()}` },
    { field: 'status', label: 'Status', render: (row) => (
      <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
    )},
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="secondary" size="sm" onClick={() => setSelectedCreator(row)}>Details</Button>
      <Button variant="outline" size="sm">Message</Button>
    </div>
  );

  return (
    <div className="admin-creators">
      <div className="page-header">
        <div className="header-text">
          <h2>Creator Management</h2>
          <p>Monitor and support the platform&apos;s independent creators.</p>
        </div>
        <div className="header-actions">
          <Input 
            placeholder="Search creators or stores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="creators-card">
        <Table columns={columns} data={creators} actions={actions} loading={loading} />
      </div>

      <Modal 
        isOpen={!!selectedCreator} 
        onClose={() => setSelectedCreator(null)}
        title="Creator Profile"
        footer={<Button variant="secondary" onClick={() => setSelectedCreator(null)}>Close</Button>}
      >
        {selectedCreator && (
          <div className="creator-details">
            <div className="profile-main">
              <div className="avatar">{selectedCreator.name.charAt(0)}</div>
              <div className="info">
                <h3>{selectedCreator.name}</h3>
                <p>{selectedCreator.email}</p>
                <span className={`status-badge ${selectedCreator.status.toLowerCase()}`}>{selectedCreator.status}</span>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <strong>Primary Store</strong>
                <span>{selectedCreator.storeName}</span>
              </div>
              <div className="detail-item">
                <strong>Member Since</strong>
                <span>{selectedCreator.joinedDate}</span>
              </div>
              <div className="detail-item">
                <strong>Total Revenue</strong>
                <span>₹{(selectedCreator.revenue || 0).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <strong>Growth Trend</strong>
                <span style={{ color: selectedCreator.growth >= 0 ? '#10b981' : '#ef4444' }}>
                  {selectedCreator.growth >= 0 ? '+' : ''}{selectedCreator.growth}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .admin-creators { display: flex; flex-direction: column; gap: 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .header-text h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
        .header-text p { color: #64748b; margin: 4px 0 0 0; }
        .header-actions { width: 300px; }
        
        .creators-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.disabled { background: #fee2e2; color: #b91c1c; }

        .creator-details { display: flex; flex-direction: column; gap: 24px; }
        .profile-main { display: flex; align-items: center; gap: 16px; }
        .avatar {
          width: 64px; height: 64px; background: #8b5cf6; color: #fff;
          border-radius: 20px; display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800;
        }
        .info h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
        .info p { font-size: 14px; color: #64748b; margin: 4px 0 8px 0; }
        
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px; background: #f8fafc; border-radius: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item strong { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
        .detail-item span { font-size: 14px; font-weight: 700; color: #1e293b; }
      `}</style>
    </div>
  );
}
