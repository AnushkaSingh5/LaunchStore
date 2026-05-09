'use client';

export default function AdminAnalytics({ revenueData = [0, 0, 0, 0, 0, 0, 0], ordersData = [0, 0, 0, 0, 0, 0, 0] }) {
  const safeRevenue = revenueData && revenueData.length > 0 ? revenueData : [0, 0, 0, 0, 0, 0, 0];
  const safeOrders = ordersData && ordersData.length > 0 ? ordersData : [0, 0, 0, 0, 0, 0, 0];
  const maxRevenue = Math.max(...safeRevenue, 1);
  const maxOrders = Math.max(...safeOrders, 1);

  // Generate SVG points for Revenue Line Chart
  const revenuePoints = revenueData.map((v, i) => `${i * 100},${200 - (v / maxRevenue) * 160}`).join(' ');
  const revenueArea = `0,200 ${revenuePoints} 600,200`;

  // Generate SVG bars for Orders Bar Chart
  const bars = safeOrders.map((v, i) => {
    const completed = Math.floor(v * 0.75);
    const pending = v - completed;
    
    const hCompleted = (completed / maxOrders) * 160;
    const hPending = (pending / maxOrders) * 160;
    
    return {
      xCompleted: i * 80 + 18,
      xPending: i * 80 + 38,
      yCompleted: 200 - hCompleted,
      yPending: 200 - hPending,
      hCompleted,
      hPending
    };
  });

  return (
    <div className="analytics-section">
      <div className="analytics-card revenue-chart">
        <div className="chart-header">
          <div>
            <h3>Revenue Analytics</h3>
            <p className="subtitle">Weekly revenue growth across all stores</p>
          </div>
          <div className="chart-actions">
            <button className="period-btn">This Week</button>
            <button className="compare-btn">Compare</button>
          </div>
        </div>
        <div className="chart-content">
          <div className="total-revenue-stat">
            <span className="value">${revenueData[revenueData.length - 1]?.toLocaleString()}</span>
            <span className="trend positive">+18.6%</span>
          </div>
          <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0, 1, 2, 3].map(i => (
              <line key={i} x1="0" y1={i * 50 + 50} x2="600" y2={i * 50 + 50} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <path d={`M ${revenuePoints}`} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M ${revenueArea}`} fill="url(#revenue-gradient)" />
          </svg>
          <div className="chart-labels">
            {['May 9', 'May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-card orders-chart">
        <div className="chart-header">
          <div>
            <h3>Orders Overview</h3>
            <p className="subtitle">Volume breakdown by status</p>
          </div>
          <div className="legend">
            <span className="item"><i className="dot completed"></i> Completed</span>
            <span className="item"><i className="dot pending"></i> Pending</span>
          </div>
        </div>
        <div className="chart-content">
          <div className="total-orders-stat">
            <span className="value">{ordersData[ordersData.length - 1]?.toLocaleString()}</span>
            <span className="trend positive">+14.2%</span>
          </div>
          <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
            {bars.map((bar, i) => (
              <g key={i}>
                <rect
                  x={bar.xCompleted}
                  y={bar.yCompleted}
                  width="16"
                  height={bar.hCompleted > 0 ? bar.hCompleted : 0}
                  rx="4"
                  fill="#3b82f6"
                  className="bar"
                />
                <rect
                  x={bar.xPending}
                  y={bar.yPending}
                  width="16"
                  height={bar.hPending > 0 ? bar.hPending : 0}
                  rx="4"
                  fill="#14b8a6"
                  className="bar"
                />
              </g>
            ))}
          </svg>
          <div className="chart-labels">
            {['May 9', 'May 10', 'May 11', 'May 12', 'May 13', 'May 14', 'May 15'].map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-section {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .analytics-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .chart-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0 0;
        }
        .chart-actions {
          display: flex;
          gap: 8px;
        }
        .period-btn, .compare-btn {
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        .period-btn:hover, .compare-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
        .chart-content {
          position: relative;
        }
        .total-revenue-stat, .total-orders-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .total-revenue-stat .value, .total-orders-stat .value {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -1px;
        }
        .trend {
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
        }
        .trend.positive {
          background: #dcfce7;
          color: #166534;
        }
        .chart-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 16px;
          padding: 0 10px;
        }
        .chart-labels span {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
        }
        .legend {
          display: flex;
          gap: 16px;
        }
        .legend .item {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot.completed { background: #3b82f6; }
        .dot.pending { background: #14b8a6; }
        
        .bar {
          transition: height 0.3s ease, y 0.3s ease;
        }
        .bar:hover {
          filter: brightness(1.1);
        }

        @media (max-width: 1200px) {
          .analytics-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
