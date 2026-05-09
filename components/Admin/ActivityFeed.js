'use client';

export default function ActivityFeed({ activities = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'approve': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>;
      case 'product': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
      case 'creator': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      case 'report': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>;
      case 'payout': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>;
      default: return null;
    }
  };

  const getColor = (status) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'danger': return '#ef4444';
      case 'primary': return '#8b5cf6';
      case 'info': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <div className="activity-card">
      <div className="card-header">
        <h3>Recent Activity</h3>
        <button className="view-all">View All</button>
      </div>
      <div className="activity-list">
        {activities.map((item, i) => (
          <div key={item.id} className="activity-item">
            <div className="icon-line">
              <div className="icon-wrapper" style={{ backgroundColor: `${getColor(item.status)}15`, color: getColor(item.status) }}>
                {getIcon(item.type)}
              </div>
              {i !== activities.length - 1 && <div className="line"></div>}
            </div>
            <div className="content">
              <p className="message">{item.message}</p>
              <span className="time">{item.time}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .activity-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          height: 100%;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .card-header h3 {
          font-size: 16px;
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
        .activity-list {
          display: flex;
          flex-direction: column;
        }
        .activity-item {
          display: flex;
          gap: 16px;
        }
        .icon-line {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .line {
          width: 2px;
          flex-grow: 1;
          background: #f1f5f9;
          margin: 4px 0;
        }
        .content {
          padding-bottom: 20px;
        }
        .message {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin: 0;
          line-height: 1.4;
        }
        .time {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
