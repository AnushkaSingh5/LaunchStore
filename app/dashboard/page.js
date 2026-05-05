'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';

export default function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await dashboardService.getOverviewStats();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card dashboard-card">
          <h3>Total Sales</h3>
          <p className="stat-value">${stats.totalSales.toLocaleString()}</p>
          <span className="stat-change positive">+12.5% from last month</span>
        </div>
        <div className="stat-card dashboard-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
          <span className="stat-change positive">+8.2% from last month</span>
        </div>
        <div className="stat-card dashboard-card">
          <h3>Active Products</h3>
          <p className="stat-value">{stats.activeProducts}</p>
          <span className="stat-change neutral">Same as last month</span>
        </div>
        <div className="stat-card dashboard-card">
          <h3>Total Customers</h3>
          <p className="stat-value">{stats.totalCustomers}</p>
          <span className="stat-change positive">+15.3% from last month</span>
        </div>
      </div>

      <div className="recent-activity dashboard-card" style={{ marginTop: '40px' }}>
        <h3>Recent Orders</h3>
        <p>Your store's most recent transactions will appear here.</p>
        {/* Placeholder for future table or activity feed */}
      </div>

      <style jsx>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-card {
          padding: 24px;
        }

        .stat-card h3 {
          font-size: 15px;
          color: var(--text-sub);
          font-weight: 600;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-main);
        }

        .stat-change {
          font-size: 13px;
          font-weight: 600;
        }

        .positive { color: #22c55e; }
        .negative { color: #ef4444; }
        .neutral { color: var(--text-sub); }

        .recent-activity {
          padding: 30px;
        }

        .recent-activity h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
