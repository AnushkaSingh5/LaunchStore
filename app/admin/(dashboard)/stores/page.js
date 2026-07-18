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
  const [currentTab, setCurrentTab] = useState('All');
  const [rejectingStoreId, setRejectingStoreId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [disablingStoreId, setDisablingStoreId] = useState(null);
  const [disableReason, setDisableReason] = useState('');

  // Dynamic Metrics
  const totalStores = loading ? 0 : stores.length;
  const activeStores = loading ? 0 : stores.filter(s => s.status === 'Active').length;
  const pendingStores = loading ? 0 : stores.filter(s => s.status === 'Pending').length;
  const disabledStores = loading ? 0 : stores.filter(s => s.status === 'Disabled').length;
  const rejectedStores = loading ? 0 : stores.filter(s => s.status === 'Rejected').length;

  const activePercent = totalStores ? ((activeStores / totalStores) * 100).toFixed(1) : 0;
  const disabledPercent = totalStores ? ((disabledStores / totalStores) * 100).toFixed(1) : 0;

  const filteredByTab = currentTab === 'All' ? stores : stores.filter(s => s.status === currentTab);

  const filteredStores = loading ? [] : filteredByTab.filter(s => {
    const query = searchQuery.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(query) ||
      (s.ownerName || '').toLowerCase().includes(query) ||
      (s.email || '').toLowerCase().includes(query) ||
      (s.slug || '').toLowerCase().includes(query)
    );
  });

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
          {row.status === 'Active' ? 'Approved' : row.status}
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
          <button className="btn-action btn-reject" onClick={() => setRejectingStoreId(row.id)}>Reject</button>
        </>
      )}
      {row.status === 'Active' && (
        <button className="btn-action btn-disable" onClick={() => setDisablingStoreId(row.id)}>Disable</button>
      )}
      {row.status === 'Disabled' && (
        <button className="btn-action btn-enable" onClick={() => approveStore(row.id)}>Enable</button>
      )}
      {row.status === 'Rejected' && (
        <button className="btn-action btn-enable" onClick={() => approveStore(row.id)}>Approve</button>
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
            placeholder="Search name, owner, email or slug..." 
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
        <div className="filter-tabs">
          {['All', 'Pending', 'Active', 'Rejected', 'Disabled'].map(tab => {
            let countVal = 0;
            if (tab === 'All') countVal = stores.length;
            else if (tab === 'Active') countVal = activeStores;
            else if (tab === 'Pending') countVal = pendingStores;
            else if (tab === 'Rejected') countVal = rejectedStores;
            else if (tab === 'Disabled') countVal = disabledStores;

            const label = tab === 'Active' ? 'Approved' : tab;

            return (
              <button
                key={tab}
                className={`tab-btn ${currentTab === tab ? 'active' : ''}`}
                onClick={() => setCurrentTab(tab)}
              >
                <span>{label}</span>
                <span className="tab-count">{countVal}</span>
              </button>
            );
          })}
        </div>

        <div className="desktop-view-only">
          <Table columns={columns} data={filteredStores} actions={actions} loading={loading} />
        </div>

        <div className="mobile-view-only">
          <div className="mobile-stores-list">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="mobile-store-card skeleton shim">
                  <div className="store-header-section">
                    <div className="store-avatar" style={{ background: '#e2e8f0' }}></div>
                    <div className="store-meta-stack" style={{ width: '100%' }}>
                      <div className="skeleton-bar" style={{ width: '60%', height: '14px', marginBottom: '8px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                      <div className="skeleton-bar" style={{ width: '80%', height: '12px', marginBottom: '8px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                      <div className="skeleton-bar" style={{ width: '40%', height: '12px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredStores.length === 0 ? (
              <div className="empty-state">No data available</div>
            ) : (
              filteredStores.map(store => (
                <div key={store.id} className="mobile-store-card">
                  <div className="store-header-section">
                    <div className="store-avatar" style={{ backgroundColor: getAvatarColor(store.name) }}>
                      {getInitials(store.name)}
                    </div>
                    <div className="store-meta-stack">
                      <h4 className="store-name-text">{store.name}</h4>
                      <span className="email-text">{store.email}</span>
                      <span className={`status-pill ${store.status.toLowerCase()}`}>
                        <span className={`status-dot ${store.status.toLowerCase()}`}></span>
                        {store.status === 'Active' ? 'Approved' : store.status}
                      </span>
                      <span className="date-text">Registered: {store.createdDate || '15 Apr 2026'}</span>
                    </div>
                  </div>
                  <div className="mobile-card-actions">
                    <button className="btn-action btn-details" onClick={() => setSelectedStore(store)}>Details</button>
                    {store.status === 'Pending' && (
                      <>
                        <button className="btn-action btn-approve" onClick={() => approveStore(store.id)}>Approve</button>
                        <button className="btn-action btn-reject" onClick={() => setRejectingStoreId(store.id)}>Reject</button>
                      </>
                    )}
                    {store.status === 'Active' && (
                      <button className="btn-action btn-disable" onClick={() => setDisablingStoreId(store.id)}>Disable</button>
                    )}
                    {store.status === 'Disabled' && (
                      <button className="btn-action btn-enable" onClick={() => approveStore(store.id)}>Enable</button>
                    )}
                    {store.status === 'Rejected' && (
                      <button className="btn-action btn-enable" onClick={() => approveStore(store.id)}>Approve</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
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
             <div className="store-modal-header">
               <div className="store-modal-banner">
                 {selectedStore.bannerUrl ? (
                   <img src={selectedStore.bannerUrl} alt="Store Banner" className="modal-banner-img" />
                 ) : (
                   <div className="modal-banner-placeholder" style={{ backgroundColor: getAvatarColor(selectedStore.name) }}></div>
                 )}
               </div>
               <div className="store-modal-logo-wrap">
                 {selectedStore.logoUrl ? (
                   <img src={selectedStore.logoUrl} alt="Store Logo" className="modal-logo-img" />
                 ) : (
                   <div className="modal-logo-placeholder" style={{ backgroundColor: getAvatarColor(selectedStore.name) }}>
                     {getInitials(selectedStore.name)}
                   </div>
                 )}
               </div>
             </div>

             <div className="store-modal-body">
               <div className="store-title-status">
                 <div>
                   <h3>{selectedStore.name}</h3>
                   <span className="store-slug">/store/{selectedStore.slug}</span>
                 </div>
                 <span className={`status-pill ${selectedStore.status.toLowerCase()}`}>
                   <span className={`status-dot ${selectedStore.status.toLowerCase()}`}></span>
                   {selectedStore.status === 'Active' ? 'Approved' : selectedStore.status}
                 </span>
               </div>

               {selectedStore.description && (
                 <div className="store-desc-section">
                   <h4>Description</h4>
                   <p>{selectedStore.description}</p>
                 </div>
               )}

               {selectedStore.statusReason && (
                 <div className={`store-reason-alert ${selectedStore.status.toLowerCase()}`}>
                   <strong>Reason for status ({selectedStore.status === 'Active' ? 'Approved' : selectedStore.status}):</strong>
                   <p>{selectedStore.statusReason}</p>
                 </div>
               )}

               <div className="store-info-grid">
                 <div className="info-section">
                   <h4>Creator Info</h4>
                   <div className="info-row">
                     <span className="info-label">Name</span>
                     <span className="info-val">{selectedStore.ownerName}</span>
                   </div>
                   <div className="info-row">
                     <span className="info-label">Email</span>
                     <span className="info-val">{selectedStore.email}</span>
                   </div>
                   <div className="info-row">
                     <span className="info-label">Registered</span>
                     <span className="info-val">{selectedStore.createdDate}</span>
                   </div>
                 </div>

                 <div className="info-section">
                   <h4>Telemetry / Stats</h4>
                   <div className="info-row">
                     <span className="info-label">Categories</span>
                     <span className="info-val font-bold">{selectedStore.categoriesCount || 0}</span>
                   </div>
                   <div className="info-row">
                     <span className="info-label">Products</span>
                     <span className="info-val font-bold">{selectedStore.productsCount || 0}</span>
                   </div>
                   <div className="info-row">
                     <span className="info-label">Orders</span>
                     <span className="info-val font-bold">{selectedStore.ordersCount || 0}</span>
                   </div>
                   <div className="info-row">
                     <span className="info-label">Revenue</span>
                     <span className="info-val font-bold text-green">₹{(selectedStore.revenue || 0).toLocaleString()}</span>
                   </div>
                 </div>
               </div>
             </div>

             <div className="store-modal-footer">
               <div className="moderation-controls">
                 {selectedStore.status === 'Pending' && (
                   <>
                     <button 
                       className="btn-action btn-approve" 
                       onClick={async () => {
                         await approveStore(selectedStore.id);
                         setSelectedStore(null);
                       }}
                     >
                       Approve Store
                     </button>
                     <button 
                       className="btn-action btn-reject" 
                       onClick={() => setRejectingStoreId(selectedStore.id)}
                     >
                       Reject...
                     </button>
                   </>
                 )}
                 {selectedStore.status === 'Active' && (
                   <button 
                     className="btn-action btn-disable" 
                     onClick={() => setDisablingStoreId(selectedStore.id)}
                   >
                     Disable Store...
                   </button>
                 )}
                 {selectedStore.status === 'Disabled' && (
                   <button 
                     className="btn-action btn-enable" 
                     onClick={async () => {
                       await approveStore(selectedStore.id);
                       setSelectedStore(null);
                     }}
                   >
                     Enable Store
                   </button>
                 )}
                 {selectedStore.status === 'Rejected' && (
                   <button 
                     className="btn-action btn-approve" 
                     onClick={async () => {
                       await approveStore(selectedStore.id);
                       setSelectedStore(null);
                     }}
                   >
                     Approve Store
                   </button>
                 )}
               </div>
               <button onClick={() => setSelectedStore(null)} className="btn-action btn-details">Close</button>
             </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!rejectingStoreId}
        onClose={() => {
          setRejectingStoreId(null);
          setRejectReason('');
        }}
        title="Reject Store Application"
      >
        <div className="reason-modal-content">
          <p className="reason-modal-desc">
            Please provide a clear reason for rejecting this store. The creator will see this reason in their dashboard and can update their store to resubmit.
          </p>
          <div className="reason-form-group">
            <label htmlFor="reject-reason">Rejection Reason</label>
            <textarea
              id="reject-reason"
              placeholder="e.g. Missing a valid store banner, logo, or description..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <div className="reason-modal-actions">
            <button 
              className="btn-action btn-details" 
              onClick={() => {
                setRejectingStoreId(null);
                setRejectReason('');
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-action btn-reject" 
              onClick={async () => {
                if (!rejectReason.trim()) {
                  alert('Please enter a rejection reason.');
                  return;
                }
                await rejectStore(rejectingStoreId, rejectReason.trim());
                setRejectingStoreId(null);
                setRejectReason('');
                setSelectedStore(null);
              }}
            >
              Reject Store
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!disablingStoreId}
        onClose={() => {
          setDisablingStoreId(null);
          setDisableReason('');
        }}
        title="Disable Store"
      >
        <div className="reason-modal-content">
          <p className="reason-modal-desc text-danger">
            Warning: Disabling this store will immediately block public storefront access. Please specify the reason for suspension.
          </p>
          <div className="reason-form-group">
            <label htmlFor="disable-reason">Suspension Reason</label>
            <textarea
              id="disable-reason"
              placeholder="e.g. Violation of platform terms of service, unpaid fees, user reports..."
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
              rows={4}
            />
          </div>
          <div className="reason-modal-actions">
            <button 
              className="btn-action btn-details" 
              onClick={() => {
                setDisablingStoreId(null);
                setDisableReason('');
              }}
            >
              Cancel
            </button>
            <button 
              className="btn-action btn-reject" 
              onClick={async () => {
                if (!disableReason.trim()) {
                  alert('Please enter a suspension reason.');
                  return;
                }
                await disableStore(disablingStoreId, disableReason.trim());
                setDisablingStoreId(null);
                setDisableReason('');
                setSelectedStore(null);
              }}
            >
              Disable Store
            </button>
          </div>
        </div>
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
          gap: 16px;
          flex-wrap: wrap;
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

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .filter-tabs::-webkit-scrollbar {
          display: none;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-btn:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .tab-btn.active {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #e2e8f0;
        }
        .tab-count {
          font-size: 11px;
          font-weight: 700;
          background: #e2e8f0;
          color: #475569;
          padding: 2px 6px;
          border-radius: 20px;
        }
        .tab-btn.active .tab-count {
          background: #8b5cf6;
          color: #fff;
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

        /* Modal Details Styling */
        .store-modal-header {
          position: relative;
          margin: -24px -24px 40px -24px; /* offset modal padding */
          height: 140px;
        }
        .store-modal-banner {
          width: 100%;
          height: 100%;
          border-top-left-radius: 14px; /* match modal container */
          border-top-right-radius: 14px;
          overflow: hidden;
        }
        .modal-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .modal-banner-placeholder {
          width: 100%;
          height: 100%;
          opacity: 0.15;
        }
        .store-modal-logo-wrap {
          position: absolute;
          bottom: -30px;
          left: 24px;
          width: 68px;
          height: 68px;
          border-radius: 16px;
          border: 4px solid #fff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          background: #fff;
          overflow: hidden;
        }
        .modal-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .modal-logo-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 20px;
        }

        .store-modal-body {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .store-title-status {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .store-title-status h3 {
          font-size: 20px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
        }
        .store-slug {
          font-size: 13px;
          color: #64748b;
          font-family: monospace;
        }

        .store-desc-section h4, .info-section h4 {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 10px 0;
        }
        .store-desc-section p {
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          margin: 0;
        }

        .store-reason-alert {
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.5;
        }
        .store-reason-alert strong {
          display: block;
          margin-bottom: 4px;
        }
        .store-reason-alert p {
          margin: 0;
        }
        .store-reason-alert.rejected {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #991b1b;
        }
        .store-reason-alert.disabled {
          background: #fff5f5;
          border: 1px solid #fee2e2;
          color: #991b1b;
        }
        .store-reason-alert.pending {
          background: #fffbeb;
          border: 1px solid #fef3c7;
          color: #92400e;
        }

        .store-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }
        .info-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }
        .info-label {
          color: #64748b;
          font-weight: 500;
        }
        .info-val {
          color: #1e293b;
          font-weight: 600;
        }
        .info-val.font-bold {
          font-weight: 700;
        }
        .info-val.text-green {
          color: #10b981;
        }

        .store-modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }
        .moderation-controls {
          display: flex;
          gap: 8px;
        }

        /* Reason form styles */
        .reason-modal-content {
          padding: 8px 0;
        }
        .reason-modal-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }
        .reason-modal-desc.text-danger {
          color: #ef4444;
          font-weight: 500;
        }
        .reason-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }
        .reason-form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .reason-form-group textarea {
          padding: 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
        }
        .reason-form-group textarea:focus {
          border-color: #8b5cf6;
        }
        .reason-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
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

        .status-pill.rejected { background: #fef2f2; color: #ef4444; }
        .status-dot.rejected { background: #ef4444; }

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

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .search-box {
            width: 100%;
          }
        }
        
        .desktop-view-only {
          display: block;
        }
        .mobile-view-only {
          display: none;
        }

        @media (max-width: 1024px) {
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .desktop-view-only {
            display: none !important;
          }
          .mobile-view-only {
            display: block !important;
          }
          
          .mobile-stores-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-top: 16px;
          }
          
          .mobile-store-card {
            background: #fff;
            border-radius: 16px;
            padding: 16px;
            border: 1px solid #f1f5f9;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          
          .store-header-section {
            display: flex;
            gap: 16px;
            align-items: flex-start;
          }
          
          .store-avatar {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 800;
            font-size: 16px;
            flex-shrink: 0;
          }
          
          .store-meta-stack {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
          }
          
          .store-name-text {
            font-size: 15px;
            font-weight: 800;
            color: #1e293b;
            margin: 0;
          }
          
          .email-text {
            font-size: 13px;
            color: #64748b;
            font-weight: 500;
            word-break: break-all;
          }
          
          .date-text {
            font-size: 12px;
            color: #94a3b8;
            font-weight: 550;
          }
          
          .mobile-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 4px;
            border-top: 1px solid #f1f5f9;
            padding-top: 12px;
          }
          
          .mobile-card-actions .btn-action {
            padding: 8px 12px !important;
            font-size: 12px !important;
            height: auto !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .mobile-card-actions .btn-details {
            flex: 1.5 !important;
          }
          .mobile-card-actions .btn-approve,
          .mobile-card-actions .btn-reject,
          .mobile-card-actions .btn-disable,
          .mobile-card-actions .btn-enable {
            flex: 1 !important;
          }
          
          .table-footer {
            flex-direction: column-reverse !important;
            gap: 16px !important;
            align-items: center !important;
          }
        }

        @media (max-width: 576px) {
          .summary-cards {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .summary-card {
            padding: 14px !important;
            gap: 10px !important;
            border-radius: 16px !important;
          }
          .icon-wrap {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .icon-wrap svg {
            width: 18px !important;
            height: 18px !important;
          }
          .card-val {
            font-size: 20px !important;
          }
          .card-label {
            font-size: 11px !important;
          }
          .card-subtext {
            font-size: 10px !important;
          }
          .table-card {
            padding: 16px !important;
          }
          .filter-tabs {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
            padding-bottom: 12px !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
          .tab-btn {
            font-size: 13px !important;
            padding: 6px 12px !important;
            border-radius: 10px !important;
            border: 1px solid #e2e8f0 !important;
            background: #f8fafc !important;
            flex: none !important;
          }
          .tab-btn.active {
            background: #f1f5f9 !important;
            border-color: #cbd5e1 !important;
          }
          .tab-count {
            padding: 2px 6px !important;
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
