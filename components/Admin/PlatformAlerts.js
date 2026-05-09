'use client';

export default function PlatformAlerts({ alerts = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case 'danger': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
      case 'warning': return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>;
      default: return null;
    }
  };

  return (
    <div className="alerts-card">
      <div className="card-header">
        <h3>Platform Alerts</h3>
        <button className="view-all">View All</button>
      </div>
      <div className="alerts-list">
        {alerts.map(alert => (
          <div key={alert.id} className={`alert-item ${alert.type}`}>
            <div className="alert-content">
              {getIcon(alert.type)}
              <span className="title">{alert.title}</span>
            </div>
            <span className="count">{alert.count}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .alerts-card {
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
          margin-bottom: 20px;
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
        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .alert-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          background: #f8fafc;
          transition: all 0.2s;
          cursor: pointer;
        }
        .alert-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }
        .alert-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .title {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .count {
          font-size: 12px;
          font-weight: 800;
          color: #ef4444;
        }
        .alert-item.warning .count {
          color: #f59e0b;
        }
      `}</style>
    </div>
  );
}
