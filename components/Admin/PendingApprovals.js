'use client';

import Button from '@/components/UI/Button';

export default function PendingApprovals({ stores = [], onManage }) {
  return (
    <div className="approvals-card">
      <div className="card-header">
        <h3>Pending Store Approvals</h3>
        <button className="view-all">View All</button>
      </div>
      <div className="approvals-list">
        {stores.length > 0 ? (
          stores.map(store => (
            <div key={store.id} className="store-approval-item">
              <div className="store-info">
                <div className="store-logo">
                  {store.name.charAt(0)}
                </div>
                <div className="store-details">
                  <h4>{store.name}</h4>
                  <p>Owner: {store.ownerName} • {store.createdDate}</p>
                </div>
              </div>
              <div className="actions">
                <button className="action-btn approve" onClick={() => onManage(store.id)}>Approve</button>
                <button className="action-btn reject">Reject</button>
                <button className="action-btn view">View</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No pending registrations.</div>
        )}
      </div>

      <style jsx>{`
        .approvals-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .card-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .view-all {
          font-size: 11px;
          font-weight: 700;
          color: #8b5cf6;
          background: none;
          border: none;
          cursor: pointer;
        }
        .approvals-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .store-approval-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
        }
        .store-approval-item:hover {
          border-color: #8b5cf630;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transform: translateY(-2px);
        }
        .store-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .store-logo {
          width: 40px;
          height: 40px;
          background: #1e293b;
          color: #fff;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
        }
        .store-details h4 {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }
        .store-details p {
          font-size: 12px;
          color: #64748b;
          margin: 2px 0 0 0;
        }
        .actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .approve { background: #dcfce7; color: #166534; }
        .reject { background: #fee2e2; color: #b91c1c; }
        .view { background: #f1f5f9; color: #475569; }
        
        .action-btn:hover {
          filter: brightness(0.95);
          transform: scale(1.05);
        }
        .empty-state {
          text-align: center;
          padding: 32px;
          color: #94a3b8;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
