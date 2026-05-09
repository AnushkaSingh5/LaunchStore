'use client';

export default function PlatformHealth({ health = [] }) {
  return (
    <div className="health-card">
      <div className="card-header">
        <h3>System Health</h3>
        <button className="view-all">View All</button>
      </div>
      <div className="health-grid">
        {health.map(item => (
          <div key={item.id} className="health-item">
            <div className="status-indicator">
              <span className="dot" style={{ backgroundColor: item.color }}></span>
              <span className="label">{item.name}</span>
            </div>
            <span className="status-text" style={{ color: item.color }}>{item.status}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .health-card {
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
        .health-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .health-item {
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
        }
        .label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
        }
        .status-text {
          font-size: 12px;
          font-weight: 800;
          margin-left: 16px;
        }
      `}</style>
    </div>
  );
}
