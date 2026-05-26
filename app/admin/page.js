'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/Admin/StatCard';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import ActivityFeed from '@/components/Admin/ActivityFeed';
import PendingApprovals from '@/components/Admin/PendingApprovals';
import PlatformHealth from '@/components/Admin/PlatformHealth';
import PlatformAlerts from '@/components/Admin/PlatformAlerts';
import AIInsights from '@/components/Admin/AIInsights';
import TopStores from '@/components/Admin/TopStores';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import { useRouter } from 'next/navigation';

export default function AdminOverview() {
  const { stores, products, orders, customers, analytics, activity, alerts, systemHealth, aiInsights, approveStore, loading } = useAdmin();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, role, authLoading, router]);

  if (authLoading || loading) return <div style={{ padding: '40px' }}>Loading platform overview...</div>;
  if (!user || role !== 'admin') return null;

  const stats = [
    { 
      title: 'Total Stores', 
      value: stores.length.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>, 
      color: '#8b5cf6', 
      change: '12%', 
      trend: 'up',
      subChange: '+24 new today',
      chartData: analytics?.miniCharts?.stores
    },
    { 
      title: 'Total Revenue', 
      value: `$${stores.reduce((acc, s) => acc + (s.revenue || 0), 0).toLocaleString()}`, 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>, 
      color: '#10b981', 
      change: '18.6%', 
      trend: 'up',
      subChange: '+$5.2k this week',
      chartData: analytics?.miniCharts?.revenue
    },
    { 
      title: 'Total Orders', 
      value: orders.length.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>, 
      color: '#f97316', 
      change: '14.2%', 
      trend: 'up',
      subChange: '+156 this month',
      chartData: analytics?.miniCharts?.orders
    },
    { 
      title: 'Active Creators', 
      value: '2,357', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>, 
      color: '#3b82f6', 
      change: '16%', 
      trend: 'up',
      subChange: '+12 last 24h',
      chartData: analytics?.miniCharts?.creators
    },
    { 
      title: 'Pending Approvals', 
      value: stores.filter(s => s.status === 'Pending').length, 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>, 
      color: '#ef4444', 
      change: '8%', 
      trend: 'down',
      subChange: '-3 from yesterday',
      chartData: analytics?.miniCharts?.pending
    },
    { 
      title: 'Platform Growth', 
      value: '+24.6%', 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>, 
      color: '#a855f7', 
      change: '6.4%', 
      trend: 'up',
      subChange: 'Above target',
      chartData: analytics?.miniCharts?.growth
    },
  ];

  const recentOrdersColumns = [
    { field: 'id', label: 'Order ID' },
    { field: 'customer', label: 'Customer' },
    { field: 'store', label: 'Store' },
    { field: 'total', label: 'Amount', render: (row) => `$${row.total.toLocaleString()}` },
    { field: 'status', label: 'Status', render: (row) => (
      <span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span>
    )},
    { field: 'time', label: 'Time' },
  ];

  return (
    <div className="admin-overview">
      <div className="overview-header">
        <div className="header-text">
          <h2>Platform Overview</h2>
          <p>Here&apos;s what&apos;s happening across your platform today.</p>
        </div>
        <div className="header-actions">
          <div className="date-picker">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>May 9 - May 15, 2026</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="analytics-overview">
        <AdminAnalytics revenueData={analytics?.revenueData} ordersData={analytics?.ordersData} />
        <div className="overview-sidebar">
          <ActivityFeed activities={activity} />
        </div>
      </div>

      <div className="secondary-grid">
        <div className="grid-left">
          <PendingApprovals stores={stores.filter(s => s.status === 'Pending')} onManage={(id) => approveStore(id)} />
          <div className="recent-orders-card">
            <div className="card-header">
              <h3>Recent Platform Orders</h3>
              <button className="view-all" onClick={() => router.push('/admin/orders')}>View All</button>
            </div>
            <Table columns={recentOrdersColumns} data={orders.slice(0, 5)} />
          </div>
        </div>
        <div className="grid-right">
          <TopStores stores={stores} />
          <PlatformAlerts alerts={alerts} />
          <PlatformHealth health={systemHealth} />
          <AIInsights insights={aiInsights} />
        </div>
      </div>

      <style jsx>{`
        .admin-overview {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .overview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-text h2 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .header-text p {
          color: #64748b;
          margin: 4px 0 0 0;
          font-size: 15px;
          font-weight: 500;
        }
        .date-picker {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .analytics-overview {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }
        .secondary-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
        }
        .grid-left {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .grid-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .recent-orders-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
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
          font-size: 12px;
          font-weight: 700;
          color: #8b5cf6;
          background: none;
          border: none;
          cursor: pointer;
        }
        .status-pill {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .status-pill.delivered { background: #dcfce7; color: #166534; }
        .status-pill.processing { background: #fef3c7; color: #92400e; }
        .status-pill.shipped { background: #dbeafe; color: #1e40af; }
        .status-pill.cancelled { background: #fee2e2; color: #b91c1c; }

        @media (max-width: 1400px) {
          .analytics-overview, .secondary-grid {
            grid-template-columns: 1fr;
          }
          .overview-sidebar, .grid-right {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
