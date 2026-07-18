'use client';

import { useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import StatCard from '@/components/Admin/StatCard';
import AdminAnalytics from '@/components/Admin/AdminAnalytics';
import ActivityFeed from '@/components/Admin/ActivityFeed';
import PendingApprovals from '@/components/Admin/PendingApprovals';
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
              grid-template-columns: repeat(2, 1fr);
              gap: 12px;
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
  
  const outOfStockProductsCount = products.filter(p => (parseInt(p.stock) || 0) === 0).length;
  const lowStockProductsCount = products.filter(p => {
    const stock = parseInt(p.stock) || 0;
    return stock > 0 && stock < 10;
  }).length;
  
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

  // Paid Orders & growth
  const paidOrders = orders.filter(o => (o.paymentStatus || '').toLowerCase() === 'paid');
  const paidOrdersCount = paidOrders.length;
  const paidOrdersThisWeek = ordersThisWeek.filter(o => (o.paymentStatus || '').toLowerCase() === 'paid').length;
  const paidChangePct = paidOrdersCount ? ((paidOrdersThisWeek / paidOrdersCount) * 100).toFixed(0) : 0;

  // Pending Payments & growth
  const pendingOrders = orders.filter(o => {
    const ps = (o.paymentStatus || '').toLowerCase();
    return ps === 'pending' || ps === 'pending_payment';
  });
  const pendingOrdersCount = pendingOrders.length;
  const pendingOrdersThisWeek = ordersThisWeek.filter(o => {
    const ps = (o.paymentStatus || '').toLowerCase();
    return ps === 'pending' || ps === 'pending_payment';
  }).length;
  const pendingChangePct = pendingOrdersCount ? ((pendingOrdersThisWeek / pendingOrdersCount) * 100).toFixed(0) : 0;

  // Failed Payments & growth
  const failedOrders = orders.filter(o => (o.paymentStatus || '').toLowerCase() === 'failed');
  const failedOrdersCount = failedOrders.length;
  const failedOrdersThisWeek = ordersThisWeek.filter(o => (o.paymentStatus || '').toLowerCase() === 'failed').length;
  const failedChangePct = failedOrdersCount ? ((failedOrdersThisWeek / failedOrdersCount) * 100).toFixed(0) : 0;

  const pendingStoresCount = stores.filter(s => s.status === 'Pending').length;
  const approvedStoresCount = stores.filter(s => s.status === 'Active').length;
  const rejectedStoresCount = stores.filter(s => s.status === 'Rejected').length;
  const disabledStoresCount = stores.filter(s => s.status === 'Disabled').length;

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
      title: 'Pending Stores', 
      value: pendingStoresCount.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, 
      color: '#f59e0b', 
      change: '', 
      trend: '',
      subChange: 'Awaiting review',
      chartData: analytics?.miniCharts?.pending
    },
    { 
      title: 'Approved Stores', 
      value: approvedStoresCount.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l2 2 4-4"></path></svg>, 
      color: '#10b981', 
      change: '', 
      trend: '',
      subChange: 'Live on platform',
      chartData: analytics?.miniCharts?.growth
    },
    { 
      title: 'Rejected Stores', 
      value: rejectedStoresCount.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>, 
      color: '#ef4444', 
      change: '', 
      trend: '',
      subChange: 'Moderation rejected',
      chartData: []
    },
    { 
      title: 'Disabled Stores', 
      value: disabledStoresCount.toLocaleString(), 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>, 
      color: '#6b7280', 
      change: '', 
      trend: '',
      subChange: 'Suspended stores',
      chartData: []
    },
    { 
      title: 'Total Revenue', 
      value: `₹${totalRevenue.toLocaleString()}`, 
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>, 
      color: '#10b981', 
      change: `${revenueChangePct}%`, 
      trend: 'up',
      subChange: `+₹${revenueThisWeek.toLocaleString()} this week`,
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
  ];

  const recentOrdersColumns = [
    { field: 'id', label: 'Order ID', render: (row) => (
      <span className="order-id-badge" title={row.id} style={{ fontWeight: 700, fontFamily: 'monospace' }}>
        {row.id ? `${row.id.substring(0, 8)}...` : 'N/A'}
      </span>
    )},
    { field: 'customer', label: 'Customer' },
    { field: 'store', label: 'Store' },
    { field: 'total', label: 'Amount', render: (row) => `₹${row.total.toLocaleString()}` },
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

      <div className="activity-stores-grid" style={{ marginBottom: '24px' }}>
        <div className="grid-left">
          <ActivityFeed activities={activity} />
        </div>
        <div className="grid-right">
          <TopStores stores={stores} />
        </div>
      </div>

      <div className="secondary-grid">
        <div className="grid-left">
          <PendingApprovals stores={stores.filter(s => s.status === 'Pending')} onManage={(id) => approveStore(id)} />
          <div className="recent-orders-card">
            <div className="card-header">
              <h3>Recent Platform Orders</h3>
              <button className="view-all" onClick={() => router.push('/admin/orders')}>
                <span>View All</span>
                <svg className="mobile-only-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            
            {/* Desktop view: Table */}
            <div className="desktop-only-view">
              <Table columns={recentOrdersColumns} data={orders.slice(0, 5)} />
            </div>

            {/* Mobile view: Mockup-matched Cards */}
            <div className="mobile-only-view mobile-orders-list">
              {orders.slice(0, 5).map(order => {
                const orderId = order.id ? `${order.id.substring(0, 8)}...` : 'N/A';
                const statusClass = String(order.status || 'pending').toLowerCase();
                
                return (
                  <div key={order.id} className="mobile-order-row-card">
                    {/* Top Row: Icon, Order ID Stack, Status Stack */}
                    <div className="mobile-order-top-section">
                      <div className="order-icon-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      </div>
                      <div className="order-id-stack">
                        <span className="stack-label">ORDER ID</span>
                        <span className="stack-value">{orderId}</span>
                      </div>
                      <div className="order-status-stack">
                        <span className="stack-label">STATUS</span>
                        <span className={`status-pill ${statusClass}`}>{order.status}</span>
                      </div>
                    </div>

                    {/* Bottom Row: 3 columns (Customer, Store, Amount) */}
                    <div className="mobile-order-bottom-section">
                      {/* Customer column */}
                      <div className="meta-column">
                        <div className="meta-icon-wrapper">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <div className="meta-text-stack">
                          <span className="stack-label">CUSTOMER</span>
                          <span className="stack-value">{order.customer}</span>
                        </div>
                      </div>

                      {/* Store column */}
                      <div className="meta-column">
                        <div className="meta-icon-wrapper">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                        </div>
                        <div className="meta-text-stack">
                          <span className="stack-label">STORE</span>
                          <span className="stack-value">{order.store}</span>
                        </div>
                      </div>

                      {/* Amount column */}
                      <div className="meta-column">
                        <div className="meta-icon-wrapper">
                          <span className="rupee-icon">₹</span>
                        </div>
                        <div className="meta-text-stack">
                          <span className="stack-label">AMOUNT</span>
                          <span className="stack-value">₹{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
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
        .activity-stores-grid {
          display: grid;
          grid-template-columns: 1fr 480px;
          gap: 24px;
        }
        .secondary-grid {
          display: grid;
          grid-template-columns: 1fr;
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

        /* Mobile Order Card styling */
        .mobile-orders-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mobile-order-row-card {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.01);
        }
        .mobile-order-top-section {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px dashed #f1f5f9;
          padding-bottom: 12px;
        }
        .order-icon-wrapper {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f5f3ff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .order-id-stack {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .order-status-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
        }
        .stack-label {
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }
        .stack-value {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
        }

        .mobile-order-bottom-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .meta-column {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .meta-icon-wrapper {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f8fafc;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .meta-icon-wrapper :global(svg) {
          width: 12px;
          height: 12px;
        }
        .rupee-icon {
          font-size: 11px;
          font-weight: 800;
        }
        .meta-text-stack {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .meta-text-stack .stack-value {
          font-size: 11px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        /* View toggles */
        .desktop-only-view {
          display: block;
        }
        .mobile-only-view {
          display: none;
        }
        .mobile-only-icon {
          display: none;
        }

        @media (max-width: 576px) {
          .desktop-only-view {
            display: none !important;
          }
          .mobile-only-view {
            display: block !important;
          }
          .mobile-only-icon {
            display: inline-block !important;
          }
          .recent-orders-card {
            padding: 16px !important;
          }
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

        .inventory-health-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .inventory-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .inventory-stat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
        }
        .inventory-stat-item.out-of-stock {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fecaca;
        }
        .inventory-stat-item.low-stock {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fef3c7;
        }
        .inventory-stat-item .count {
          font-size: 18px;
          font-weight: 800;
        }
        .inventory-stat-item .label {
          font-size: 13px;
        }

        @media (max-width: 1400px) {
          .analytics-overview, .secondary-grid, .activity-stores-grid {
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
          .overview-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
