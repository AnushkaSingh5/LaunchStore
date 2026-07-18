'use client';

export default function StatCard({ title, value, icon, color, change, trend, subChange, chartData = [10, 20, 15, 25, 18, 30, 24] }) {
  // Safeguard against empty or all-zero data
  const safeData = chartData && chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0, 0];
  const maxValue = Math.max(...safeData, 1);
  const points = safeData.map((v, i) => `${i * 15},${40 - (v / maxValue) * 30}`).join(' ');

  return (
    <div className="stat-card">
      <div className="card-header">
        <div className="icon-wrapper" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <span className="trend-indicator" style={{ 
          color: trend === 'up' ? '#10b981' : '#ef4444',
          background: trend === 'up' ? '#10b98115' : '#ef444415'
        }}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </span>
      </div>
      
      <div className="card-body">
        <div className="value-section">
          <h3 className="title">{title}</h3>
          <p className="value">{value}</p>
          <p className="sub-change">{subChange}</p>
        </div>
        
        <div className="chart-section">
          <svg width="100" height="40" viewBox="0 0 100 40">
            <path
              d={`M ${points}`}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M ${points} L 90,40 L 0,40 Z`}
              fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
              opacity="0.1"
            />
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <style jsx>{`
        .stat-card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: ${color}40;
        }
        .stat-card:hover::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, ${color}05 0%, transparent 100%);
          pointer-events: none;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .trend-indicator {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 10px;
        }
        .card-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .title {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .value {
          font-size: 26px;
          font-weight: 800;
          color: #1e293b;
          margin: 6px 0;
          letter-spacing: -0.5px;
        }
        .sub-change {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          margin: 0;
        }
        .chart-section {
          opacity: 0.8;
          filter: drop-shadow(0 4px 4px ${color}20);
        }
        @media (max-width: 576px) {
          .stat-card {
            padding: 14px;
            gap: 10px;
          }
          .icon-wrapper {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          .icon-wrapper :global(svg) {
            width: 16px;
            height: 16px;
          }
          .trend-indicator {
            font-size: 10px;
            padding: 2px 6px;
          }
          .value {
            font-size: 20px;
            margin: 4px 0;
          }
          .title {
            font-size: 10px;
            letter-spacing: 0.4px;
          }
          .sub-change {
            font-size: 10px;
          }
          .chart-section {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
