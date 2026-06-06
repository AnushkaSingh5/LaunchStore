'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Modal from '@/components/UI/Modal';
import { useState } from 'react';

// Helper for dynamic store avatar colors
const getAvatarColor = (name) => {
  const colors = ['#1e293b', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Helper for initials
const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function StoresManagement() {
  const { stores = [], approveStore, rejectStore, disableStore, loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);

  const filteredStores = loading ? [] : stores.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Metrics
  const totalStores = loading ? 0 : stores.length;
  const activeStores = loading ? 0 : stores.filter(s => s.status === 'Active').length;
  const pendingStores = loading ? 0 : stores.filter(s => s.status === 'Pending').length;
  const disabledStores = loading ? 0 : stores.filter(s => s.status === 'Disabled').length;

  const activePercent = totalStores ? ((activeStores / totalStores) * 100).toFixed(1) : 0;
  const disabledPercent = totalStores ? ((disabledStores / totalStores) * 100).toFixed(1) : 0;

  const columns = [
    { 
      field: 'name', 
      label: 'STORE NAME', 
      render: (row) => (
        <div className="store-name-cell">
          <div className="store-avatar" style={{ backgroundColor: getAvatarColor(row.name) }}>
            {getInitials(row.name)}
          </div>
          <span className="store-name-text">{row.name}</span>
        </div>
      ) 
    },
    { 
      field: 'ownerName', 
      label: 'OWNER',
      render: (row) => {
        const parts = row.ownerName.split(' ');
        const first = parts[0];
        const last = parts.slice(1).join(' ');
        return (
          <div className="owner-cell">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.ownerName)}&background=f1f5f9&color=64748b&bold=true`} alt={row.ownerName} className="owner-avatar" />
            <div className="owner-name-stack">
              <span>{first}</span>
              {last && <span>{last}</span>}
            </div>
          </div>
        )
      }
    },
    { 
      field: 'email', 
      label: 'EMAIL',
      render: (row) => <span className="email-text">{row.email}</span>
    },
    { 
      field: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-pill ${row.status.toLowerCase()}`}>
          <span className={`status-dot ${row.status.toLowerCase()}`}></span>
          {row.status}
        </span>
      )
    },
    { 
      field: 'createdDate', 
      label: 'REGISTERED',
      render: (row) => <span className="date-text">{row.createdDate || '15 Apr 2026'}</span>
    },
  ];

  const actions = (row) => (
    <div className="action-buttons">
      <button className="btn-action btn-details" onClick={() => setSelectedStore(row)}>Details</button>
      {row.status === 'Pending' && (
        <>
          <button className="btn-action btn-approve" onClick={() => approveStore(row.id)}>Approve</button>
          <button className="btn-action btn-reject" onClick={() => rejectStore(row.id)}>Reject</button>
        </>
      )}
      {row.status === 'Active' && (
        <button className="btn-action btn-disable" onClick={() => disableStore(row.id)}>Disable</button>
      )}
      {row.status === 'Disabled' && (
        <button className="btn-action btn-enable" onClick={() => approveStore(row.id)}>Enable</button>
      )}
    </div>
  );

  return (
    <div className="admin-stores-page">
      <div className="page-header">
        <div className="header-text">
          <h2>Store Management</h2>
          <p>Approve, reject, or manage all creator stores on the platform.</p>
        </div>
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text"
            placeholder="Search stores or owners..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="icon-wrap purple-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Total Stores</p>
            <h3 className="card-val">{totalStores}</h3>
            <p className="card-subtext gray-subtext">Across all creators</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrap green-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l2 2 4-4"></path></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Active Stores</p>
            <h3 className="card-val">{activeStores}</h3>
            <p className="card-subtext green-subtext"><span>{activePercent}%</span> of total</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrap orange-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Pending Approval</p>
            <h3 className="card-val">{pendingStores}</h3>
            <p className="card-subtext orange-subtext">Awaiting review</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrap red-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Disabled Stores</p>
            <h3 className="card-val">{disabledStores}</h3>
            <p className="card-subtext red-subtext"><span>{disabledPercent}%</span> of total</p>
          </div>
        </div>
      </div>

      <div className="table-card">
        <Table columns={columns} data={filteredStores} actions={actions} loading={loading} />
        
        <div className="table-footer">
          <div className="showing-text">
            Showing 1 to {filteredStores.length} of {totalStores} stores
          </div>
          <div className="pagination">
            <button className="page-btn">&lt;</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-ellipsis">...</span>
            <button className="page-btn">31</button>
            <button className="page-btn">&gt;</button>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedStore} 
        onClose={() => setSelectedStore(null)}
        title="Store Details"
      >
        {selectedStore && (
          <div className="modal-content-inner">
             <p>Details modal can be styled later. For now, testing table layout.</p>
             <button onClick={() => setSelectedStore(null)} className="btn-action btn-details">Close</button>
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .admin-stores-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .header-text h2 {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px 0;
        }
        .header-text p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 10px 16px;
          width: 320px;
          gap: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: border-color 0.2s;
        }
        .search-box:focus-within {
          border-color: #cbd5e1;
        }
        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          font-family: inherit;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }
        .icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .purple-bg { background: #f3e8ff; }
        .green-bg { background: #dcfce7; }
        .orange-bg { background: #fef3c7; }
        .red-bg { background: #fee2e2; }

        .card-data {
          display: flex;
          flex-direction: column;
        }
        .card-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin: 0 0 4px 0;
        }
        .card-val {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px 0;
          line-height: 1;
        }
        .card-subtext {
          font-size: 12px;
          font-weight: 500;
          margin: 0;
        }
        .gray-subtext { color: #94a3b8; }
        .green-subtext { color: #94a3b8; }
        .green-subtext span { color: #10b981; font-weight: 700; }
        .orange-subtext { color: #f59e0b; font-weight: 600; }
        .red-subtext { color: #94a3b8; }
        .red-subtext span { color: #ef4444; font-weight: 700; }

        /* Table Container */
        .table-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px 24px 12px 24px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }

        /* Footer Pagination */
        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }
        .showing-text {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .page-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn:hover {
          background: #f8fafc;
        }
        .page-btn.active {
          background: #f3e8ff;
          border-color: #f3e8ff;
          color: #8b5cf6;
        }
        .page-ellipsis {
          color: #94a3b8;
          font-weight: 600;
          padding: 0 4px;
        }

        /* Modal placeholder */
        .modal-content-inner {
          padding: 24px;
        }

        /* Overriding the generic Table component styles for this specific page */
        .admin-stores-page table th {
          font-size: 11px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 16px 16px;
          border-bottom: 1px solid #f1f5f9;
          background: #fff;
        }
        .admin-stores-page table td {
          padding: 16px 16px;
          border-bottom: 1px solid #f8fafc;
          vertical-align: middle;
        }
        .admin-stores-page table tr:last-child td {
          border-bottom: none;
        }

        /* Table Cell Renderers */
        .store-name-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .store-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 13px;
        }
        .store-name-text {
          font-weight: 700;
          color: #1e293b;
          font-size: 14px;
        }

        .owner-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .owner-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
        }
        .owner-name-stack {
          display: flex;
          flex-direction: column;
          font-size: 13px;
          color: #1e293b;
          font-weight: 500;
          line-height: 1.3;
        }

        .email-text, .date-text {
          color: #1e293b;
          font-size: 14px;
          font-weight: 500;
        }

        /* Status Pills */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        
        .status-pill.active { background: #ecfdf5; color: #10b981; }
        .status-dot.active { background: #10b981; }
        
        .status-pill.pending { background: #fffbeb; color: #f59e0b; }
        .status-dot.pending { background: #f59e0b; }
        
        .status-pill.disabled { background: #fef2f2; color: #ef4444; }
        .status-dot.disabled { background: #ef4444; }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-action {
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-details {
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #64748b;
        }
        .btn-details:hover { background: #f8fafc; color: #1e293b; }

        .btn-approve, .btn-enable {
          background: #f3e8ff;
          border: 1px solid transparent;
          color: #8b5cf6;
        }
        .btn-approve:hover, .btn-enable:hover { background: #ede9fe; }

        .btn-reject {
          background: #fee2e2;
          border: 1px solid transparent;
          color: #ef4444;
        }
        .btn-reject:hover { background: #fecaca; }

        .btn-disable {
          background: #fff;
          border: 1px solid #fca5a5;
          color: #ef4444;
        }
        .btn-disable:hover { background: #fef2f2; }
      `}</style>
    </div>
  );
}
