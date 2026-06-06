'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import StatCard from '@/components/Admin/StatCard';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import ActivityFeed from '@/components/Admin/ActivityFeed';
import PendingApprovals from '@/components/Admin/PendingApprovals';
import AIInsights from '@/components/Admin/AIInsights';
import TopStores from '@/components/Admin/TopStores';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import { useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

export default function AdminOverview() {
  const { stores, products, orders, customers, analytics, activity, alerts, systemHealth, aiInsights, approveStore, loading } = useAdmin();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/admin/login');
    }
  }, [adminUser, authLoading, router]);

  if ((authLoading || loading) && !adminUser) {
    return <PageLoader />;
  }

  if (authLoading || loading) {
    return (
      <div className="admin-overview">
        <div className="overview-header">
          <div className="header-text">
            <h2>Platform Overview</h2>
            <div className="skeleton-line shim" style={{ width: '200px', height: '14px', borderRadius: '4px', marginTop: '8px', background: '#e2e8f0' }}></div>
          </div>
        </div>
        
        <div className="stats-grid">
          {[...Array(6)].map((_, i) => (
            <div className="skeleton-card shim" key={i} style={{ height: '120px', borderRadius: '24px', background: '#fff', border: '1px solid #f1f5f9' }}></div>
          ))}
        </div>

        <div className="analytics-overview shim" style={{ height: '320px', borderRadius: '24px', background: '#fff', border: '1px solid #f1f5f9' }}>
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
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .shim {
            position: relative;
            overflow: hidden;
          }
          .shim::after {
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.4) 20%,
              rgba(255, 255, 255, 0.6) 60%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: shimmer 1.5s infinite;
            content: '';
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          @media (max-width: 1200px) {
            .stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }
  if (!adminUser) return null;

  // 1. Calculate dynamic, non-hardcoded dashboard telemetry
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  const dateRangeString = `${formatDate(startDate)} - ${formatDate(endDate)}`;

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Total Stores & growth
  const newStoresThisWeek = stores.filter(s => new Date(s.createdDate) > oneWeekAgo).length;
  const storesChangePct = stores.length ? ((newStoresThisWeek / stores.length) * 100).toFixed(0) : 0;
  
  // Total Revenue & growth
  const totalRevenue = stores.reduce((acc, s) => acc + (s.revenue || 0), 0);
  const ordersThisWeek = orders.filter(o => new Date(o.date) > oneWeekAgo);
  const revenueThisWeek = ordersThisWeek.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueChangePct = totalRevenue ? ((revenueThisWeek / totalRevenue) * 100).toFixed(0) : 0;

  // Total Orders & growth
  const ordersCountThisWeek = ordersThisWeek.length;
  const ordersChangePct = orders.length ? ((ordersCountThisWeek / orders.length) * 100).toFixed(0) : 0;

  // Active Creators (unique creator accounts on platform)
  const allCreatorsEmails = new Set(stores.map(s => s.email));
  const uniqueCreatorsCount = allCreatorsEmails.size;
  const newCreatorsThisWeekCount = new Set(
    stores.filter(s => new Date(s.createdDate) > oneWeekAgo).map(s => s.email)
  ).size;
  const creatorsChangePct = uniqueCreatorsCount ? ((newCreatorsThisWeekCount / uniqueCreatorsCount) * 100).toFixed(0) : 0;

  // Pending approvals
  const pendingCount = stores.filter(s => s.status === 'Pending').length;
  const pendingChangePct = stores.length ? ((pendingCount / stores.length) * 100).toFixed(0) : 0;

  // Platform Growth (weekly store count increase rate)
  const storesLastWeek = stores.length - newStoresThisWeek;
  const platformGrowthPct = storesLastWeek > 0 ? ((newStoresThisWeek / storesLastWeek) * 100).toFixed(1) : (newStoresThisWeek ? (newStoresThisWeek * 100).toFixed(0) : 0);

  const stats = [
    { 
      title: 'Total Stores', 
      value: stores.length.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>, 
      color: '#8b5cf6', 
      change: `${storesChangePct}%`, 
      trend: 'up',
      subChange: `+${newStoresThisWeek} this week`,
      chartData: analytics?.miniCharts?.stores
    },
    { 
      title: 'Total Revenue', 
      value: `$${totalRevenue.toLocaleString()}`, 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>, 
      color: '#10b981', 
      change: `${revenueChangePct}%`, 
      trend: 'up',
      subChange: `+$${revenueThisWeek.toLocaleString()} this week`,
      chartData: analytics?.miniCharts?.revenue
    },
    { 
      title: 'Total Orders', 
      value: orders.length.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>, 
      color: '#f97316', 
      change: `${ordersChangePct}%`, 
      trend: 'up',
      subChange: `+${ordersCountThisWeek} this week`,
      chartData: analytics?.miniCharts?.orders
    },
    { 
      title: 'Active Creators', 
      value: uniqueCreatorsCount.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>, 
      color: '#3b82f6', 
      change: `${creatorsChangePct}%`, 
      trend: 'up',
      subChange: `+${newCreatorsThisWeekCount} new this week`,
      chartData: analytics?.miniCharts?.creators
    },
    { 
      title: 'Pending Approvals', 
      value: pendingCount.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>, 
      color: '#ef4444', 
      change: `${pendingChangePct}%`, 
      trend: pendingCount > 0 ? 'up' : 'down',
      subChange: 'Awaiting admin action',
      chartData: analytics?.miniCharts?.pending
    },
    { 
      title: 'Platform Growth', 
      value: `+${platformGrowthPct}%`, 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>, 
      color: '#a855f7', 
      change: 'Weekly', 
      trend: 'up',
      subChange: 'Based on store joins',
      chartData: analytics?.miniCharts?.growth
    },
  ];

  const recentOrdersColumns = [
    { field: 'id', label: 'Order ID', render: (row) => (
      <span className="order-id-badge" title={row.id} style={{ fontWeight: 700, fontFamily: 'monospace' }}>
        {row.id ? `${row.id.substring(0, 8)}...` : 'N/A'}
      </span>
    )},
    { field: 'customer', label: 'Customer' },
    { field: 'store', label: 'Store' },
    { field: 'total', label: 'Amount', render: (row) => `$${row.total.toLocaleString()}` },
    { field: 'status', label: 'Status', render: (row) => (
      <span className={`status-pill ${row.status.toLowerCase()}`}>{row.status}</span>
    )},
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
            <span>{dateRangeString}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      <div className="analytics-overview">
        <AdminAnalytics revenueData={analytics?.revenueData} ordersData={analytics?.ordersData} />
      </div>

      <div className="activity-row">
        <ActivityFeed activities={activity} />
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
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .activity-row {
          width: 100%;
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
          min-width: 0;
        }
        .grid-right {
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }
        .recent-orders-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .recent-orders-card th,
        .recent-orders-card td {
          padding: 12px 14px !important;
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
          .grid-right {
            width: 100%;
          }
        }
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
