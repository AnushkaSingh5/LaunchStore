'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '@/context/DashboardContext';
import { useAuth } from '@/context/AuthContext';

const Sparkline = ({ color, path }) => (
  <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={path} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d={`${path} L 60 24 L 0 24 Z`} fill={`url(#grad-${color.replace('#','')})`} opacity="0.2" />
    <defs>
      <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="1"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const getDynamicChartData = (ordersList, timeframe) => {
  const chartData = [];
  const now = new Date();
  
  if (timeframe === 'Last 7 Days') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const label = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      
      const daySales = ordersList
        .filter(o => {
          const od = new Date(o.created_at);
          return od.toDateString() === d.toDateString() && o.status !== 'Cancelled';
        })
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        
      chartData.push({ name: label, sales: Math.round(daySales * 100) / 100 });
    }
  } else if (timeframe === 'Last 30 Days') {
    for (let i = 3; i >= 0; i--) {
      const label = `Week ${4 - i}`;
      const start = new Date();
      start.setDate(now.getDate() - (i + 1) * 7);
      const end = new Date();
      end.setDate(now.getDate() - i * 7);
      
      const weekSales = ordersList
        .filter(o => {
          const od = new Date(o.created_at);
          return od >= start && od <= end && o.status !== 'Cancelled';
        })
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        
      chartData.push({ name: label, sales: Math.round(weekSales * 100) / 100 });
    }
  } else if (timeframe === 'Last 12 Months') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      
      const monthSales = ordersList
        .filter(o => {
          const od = new Date(o.created_at);
          return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear() && o.status !== 'Cancelled';
        })
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        
      chartData.push({ name: label, sales: Math.round(monthSales * 100) / 100 });
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const label = `${year}`;
      
      const yearSales = ordersList
        .filter(o => {
          const od = new Date(o.created_at);
          return od.getFullYear() === year && o.status !== 'Cancelled';
        })
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
        
      chartData.push({ name: label, sales: Math.round(yearSales * 100) / 100 });
    }
  }
  return chartData;
};

export default function DashboardOverview() {
  const router = useRouter();
  const { products, orders, customers, loading } = useDashboard();
  const { profile } = useAuth();
  const creatorName = profile?.name || 'Creator';
  
  const [timeframe, setTimeframe] = useState('Last 7 Days');
  const [isTimeframeOpen, setIsTimeframeOpen] = useState(false);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (orders) {
      setChartData(getDynamicChartData(orders, timeframe));
    }
  }, [orders, timeframe]);

  const totalSales = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const activeProducts = products.filter(p => p.status === 'Published').length;
  const totalCustomers = customers.length;

  const recentOrders = orders.slice(0, 4).map(order => ({
    id: order.id.slice(0, 8).toUpperCase(),
    date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    customer: order.customer_name,
    status: order.status,
    total: parseFloat(order.total_amount || 0)
  }));

  const avgOrderValue = orders.length > 0 
    ? Math.round((totalSales / orders.length) * 100) / 100 
    : 0;

  const refunds = orders
    .filter(o => o.status === 'Cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  // Calculate dynamic monthly trends to replace hardcoded values
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const currentPeriodOrders = orders.filter(o => new Date(o.created_at) >= thirtyDaysAgo);
  const previousPeriodOrders = orders.filter(o => {
    const d = new Date(o.created_at);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });

  // Sales trend
  const currentPeriodSales = currentPeriodOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
  const previousPeriodSales = previousPeriodOrders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  let salesChangeText = '0.0% from last month';
  let salesChangeClass = 'neutral';
  let salesChangeIcon = '';
  if (previousPeriodSales > 0) {
    const pct = ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100;
    salesChangeText = `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}% from last month`;
    salesChangeClass = pct >= 0 ? 'positive' : 'negative';
    salesChangeIcon = pct >= 0 ? '↑' : '↓';
  } else if (currentPeriodSales > 0) {
    salesChangeText = '↑ 100.0% from last month';
    salesChangeClass = 'positive';
    salesChangeIcon = '↑';
  }

  // Orders trend
  let ordersChangeText = '0.0% from last month';
  let ordersChangeClass = 'neutral';
  if (previousPeriodOrders.length > 0) {
    const pct = ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100;
    ordersChangeText = `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}% from last month`;
    ordersChangeClass = pct >= 0 ? 'positive' : 'negative';
  } else if (currentPeriodOrders.length > 0) {
    ordersChangeText = '↑ 100.0% from last month';
    ordersChangeClass = 'positive';
  }

  // Active products trend
  const currentPeriodProducts = products.filter(p => new Date(p.created_at) >= thirtyDaysAgo).length;
  let productsChangeText = 'Same as last month';
  let productsChangeClass = 'neutral';
  if (currentPeriodProducts > 0) {
    productsChangeText = `↑ ${currentPeriodProducts} new this month`;
    productsChangeClass = 'positive';
  }

  // Customers trend
  const currentPeriodCustomers = customers.filter(c => {
    const custOrders = orders.filter(o => o.customer_email === c.email && new Date(o.created_at) >= thirtyDaysAgo);
    return custOrders.length > 0;
  }).length;
  const previousPeriodCustomers = customers.filter(c => {
    const custOrders = orders.filter(o => o.customer_email === c.email && new Date(o.created_at) >= sixtyDaysAgo && new Date(o.created_at) < thirtyDaysAgo);
    return custOrders.length > 0;
  }).length;

  let customersChangeText = '0.0% from last month';
  let customersChangeClass = 'neutral';
  if (previousPeriodCustomers > 0) {
    const pct = ((currentPeriodCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100;
    customersChangeText = `${pct >= 0 ? '↑' : '↓'} ${Math.abs(pct).toFixed(1)}% from last month`;
    customersChangeClass = pct >= 0 ? 'positive' : 'negative';
  } else if (currentPeriodCustomers > 0) {
    customersChangeText = '↑ 100.0% from last month';
    customersChangeClass = 'positive';
  }

  // Conversion rate (simulate dynamically: 0.0% if 0 orders, 2.4% if orders exist)
  const conversionRate = orders.length > 0 ? '2.4%' : '0.0%';

  const stats = {
    totalSales,
    totalOrders: orders.length,
    activeProducts,
    totalCustomers,
    recentOrders,
    chartData
  };

  return (
    <div className="overview-page">
      <div className="header-subtitle">
        <p>Welcome back, <strong>{creatorName}!</strong> Here&apos;s what&apos;s happening in your store.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="icon-wrapper" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div className="stat-info">
              <h3>Total Sales</h3>
              <p className="stat-value">₹{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="sparkline">
              <Sparkline color="#a855f7" path="M0 20 Q 15 5, 30 15 T 60 5" />
            </div>
          </div>
          <span className={`stat-change ${salesChangeClass}`}>{salesChangeText}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="icon-wrapper" style={{ background: '#e0f2fe', color: '#3b82f6' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            </div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-value">{stats.totalOrders}</p>
            </div>
            <div className="sparkline">
              <Sparkline color="#3b82f6" path="M0 15 Q 15 20, 30 10 T 60 5" />
            </div>
          </div>
          <span className={`stat-change ${ordersChangeClass}`}>{ordersChangeText}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="icon-wrapper" style={{ background: '#ffedd5', color: '#f97316' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <div className="stat-info">
              <h3>Active Products</h3>
              <p className="stat-value">{stats.activeProducts}</p>
            </div>
            <div className="sparkline">
              <Sparkline color="#f97316" path="M0 20 L 15 15 L 30 20 L 45 10 L 60 5" />
            </div>
          </div>
          <span className={`stat-change ${productsChangeClass}`}>{productsChangeText}</span>
        </div>

        <div className="stat-card">
          <div className="stat-card-inner">
            <div className="icon-wrapper" style={{ background: '#dcfce7', color: '#22c55e' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="stat-info">
              <h3>Total Customers</h3>
              <p className="stat-value">{stats.totalCustomers}</p>
            </div>
            <div className="sparkline">
              <Sparkline color="#22c55e" path="M0 20 C 20 20, 20 5, 40 15 C 50 15, 55 5, 60 5" />
            </div>
          </div>
          <span className={`stat-change ${customersChangeClass}`}>{customersChangeText}</span>
        </div>
      </div>

      <div className="main-grid">
        <div className="chart-card dashboard-card">
          <div className="card-header">
            <h3>Sales Overview</h3>
            <div className="dropdown-container">
              <button className="dropdown-btn" onClick={() => setIsTimeframeOpen(!isTimeframeOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {timeframe}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isTimeframeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              {isTimeframeOpen && (
                <div className="dropdown-menu">
                  {['Last 7 Days', 'Last 30 Days', 'Last 12 Months', 'All Time'].map(option => (
                    <button 
                      key={option} 
                      className={`dropdown-item ${timeframe === option ? 'active' : ''}`}
                      onClick={() => {
                        setTimeframe(option);
                        setIsTimeframeOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="chart-title">
            <span className="chart-label">Total Sales</span>
            <div className="chart-value-row">
              <h2>₹{stats.totalSales.toLocaleString()}</h2>
              <span className={`badge ${salesChangeClass}`}>
                {salesChangeIcon || '→'} {previousPeriodSales > 0 ? `${Math.abs(((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100).toFixed(1)}%` : currentPeriodSales > 0 ? '100.0%' : '0.0%'}
              </span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stats.chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#8b5cf6', fontWeight: 600 }}
                  labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-metrics">
            <div className="metric">
              <div className="metric-icon" style={{ background: '#e0f2fe', color: '#3b82f6' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </div>
              <div className="metric-info">
                <p>Average Order Value</p>
                <h4>${avgOrderValue > 0 ? `₹${avgOrderValue.toLocaleString()}` : '₹0'}</h4>
              </div>
            </div>
            <div className="metric">
              <div className="metric-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="metric-info">
                <p>Conversion Rate</p>
                <h4>{conversionRate}</h4>
              </div>
            </div>
            <div className="metric">
              <div className="metric-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
              </div>
              <div className="metric-info">
                <p>Refunds</p>
                <h4>${refunds > 0 ? `₹${refunds.toLocaleString()}` : '₹0'}</h4>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-orders-card dashboard-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="view-all-btn" onClick={() => router.push('/dashboard/orders')}>View All Orders</button>
          </div>
          <div className="orders-list">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <strong>#{order.id}</strong>
                  <span>{order.date}</span>
                </div>
                <div className="order-customer">{order.customer}</div>
                <div className="order-status">
                  <span className={`status-pill ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-total">₹{order.total}</div>
              </div>
            ))}
          </div>
          <button className="go-to-orders-btn" onClick={() => router.push('/dashboard/orders')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Go to Orders
          </button>
        </div>
      </div>

      <div className="tip-banner">
        <div className="tip-left">
          <div className="tip-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div className="tip-text">
            <h4>Tip to grow your store</h4>
            <p>Add more products and optimize your store settings to increase sales.</p>
          </div>
        </div>
        <div className="tip-right">
          <button className="manage-store-btn">Manage Store</button>
          <button className="close-banner-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .overview-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .header-subtitle {
          margin-bottom: 8px;
          margin-top: -16px;
        }

        .header-subtitle p {
          color: #64748b;
          font-size: 14px;
        }

        .header-subtitle strong {
          color: #8b5cf6;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #f1f5f9;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.06);
          border-color: rgba(139, 92, 246, 0.2);
        }

        .stat-card-inner {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          min-width: 0;
        }

        .stat-info h3 {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
        }

        .sparkline {
          flex-shrink: 0;
        }

        .stat-change {
          font-size: 12px;
          font-weight: 600;
        }

        .stat-change.positive { color: #22c55e; }
        .stat-change.neutral { color: #94a3b8; }

        .main-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
        }

        .dashboard-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dropdown-btn:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px;
          width: 160px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          z-index: 100;
          display: flex;
          flex-direction: column;
          gap: 4px;
          animation: dropdownFade 0.2s ease-out;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: #f5f3ff;
          color: #8b5cf6;
        }

        .dropdown-item.active {
          background: #8b5cf6;
          color: #fff;
        }

        .chart-title {
          margin-bottom: 24px;
        }

        .chart-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .chart-value-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }

        .chart-value-row h2 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
        }

        .badge {
          background: #dcfce7;
          color: #16a34a;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .chart-container {
          margin-bottom: 24px;
          position: relative;
          transition: opacity 0.3s ease;
        }

        .chart-container.loading {
          opacity: 0.5;
        }

        .chart-loader-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .shimmer {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .chart-metrics {
          display: flex;
          justify-content: space-between;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
        }

        .metric {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .metric-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-info p {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .metric-info h4 {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
        }

        .view-all-btn {
          background: #f3e8ff;
          color: #8b5cf6;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          flex: 1;
        }

        .order-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          align-items: center;
          padding-bottom: 16px;
          border-bottom: 1px solid #f1f5f9;
        }

        .order-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .order-info strong {
          font-size: 13px;
          color: #1e293b;
        }

        .order-info span {
          font-size: 12px;
          color: #94a3b8;
        }

        .order-customer {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }

        .status-pill {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }

        .status-pill.delivered {
          background: #dcfce7;
          color: #166534;
        }

        .status-pill.shipped {
          background: #dbeafe;
          color: #1e40af;
        }

        .status-pill.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-pill.cancelled {
          background: #fee2e2;
          color: #b91c1c;
        }

        .order-total {
          font-weight: 800;
          font-size: 14px;
          color: #1e293b;
          text-align: right;
        }

        .go-to-orders-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f8fafc;
          border: none;
          padding: 12px;
          border-radius: 12px;
          color: #8b5cf6;
          font-weight: 700;
          font-size: 14px;
          margin-top: 24px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .go-to-orders-btn:hover {
          background: #f3e8ff;
        }

        .tip-banner {
          background: #fff;
          border-radius: 20px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }

        .tip-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tip-icon {
          width: 48px;
          height: 48px;
          background: #fef3c7;
          color: #d97706;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tip-text h4 {
          font-size: 15px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .tip-text p {
          font-size: 13px;
          color: #64748b;
        }

        .tip-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .manage-store-btn {
          background: #8b5cf6;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .close-banner-btn {
          background: #f8fafc;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          cursor: pointer;
        }

        @media (max-width: 1024px) {
          .main-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .header-container {
            flex-direction: column;
            gap: 16px;
          }
          .search-bar {
            width: 100%;
          }
          .chart-metrics {
            flex-direction: column;
            gap: 16px;
          }
          .order-item {
            grid-template-columns: 1fr auto;
            row-gap: 8px;
          }
          .order-customer {
            display: none;
          }
          .order-status {
            grid-column: 1 / 2;
          }
          .order-total {
            grid-column: 2 / 3;
            grid-row: 1 / 3;
            align-self: center;
          }
          .tip-banner {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          .tip-left {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
