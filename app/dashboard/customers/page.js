'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/UI/Modal';
import { useDashboard } from '@/context/DashboardContext';
import { supabaseClient } from '@/lib/supabase';

export default function CustomersPage() {
  const { customers: contextCustomers, orders, loading } = useDashboard();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingOrderItems, setLoadingOrderItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    type: [],
    activity: [],
    spent: 'All',
    orders: 'All',
    region: 'All Regions',
    dateRange: 'all',
    sortBy: 'newest'
  });

  const customers = (contextCustomers || []).map(cust => {
    const custOrders = (orders || []).filter(o => o.customer_email === cust.email);
    const spent = custOrders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    return {
      ...cust,
      spent,
      type: spent > 500 ? 'VIP Customers' : custOrders.length > 2 ? 'Returning Customers' : 'New Customers',
      activity: 'Active Recently (7 Days)',
      region: 'Local',
      date: custOrders.length > 0 ? new Date(custOrders[custOrders.length - 1].created_at).toISOString().split('T')[0] : '-',
      lastOrder: custOrders.length > 0 ? new Date(custOrders[0].created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
      color: '#f5f3ff',
      textColor: '#8b5cf6',
      initial: cust.name ? cust.name.charAt(0).toUpperCase() : 'C'
    };
  });

  const totalSpent = (orders || []).reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const stats = [
    { label: 'Total Customers', value: String(customers.length), sub: 'All time customers', color: '#f5f3ff', iconColor: '#8b5cf6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { label: 'Total Orders', value: String(orders?.length || 0), sub: 'All orders placed', color: '#f0fdf4', iconColor: '#22c55e', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
    { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, sub: 'All time revenue', color: '#fff7ed', iconColor: '#ea580c', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { label: 'New Customers', value: String(customers.filter(c => c.type === 'New Customers').length), sub: 'This month', trend: '+ 25%', color: '#eff6ff', iconColor: '#3b82f6', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg> },
  ];

  const filteredCustomers = (customers || []).filter(cust => {
    if (!cust) return false;
    const name = String(cust.name || '');
    const email = String(cust.email || '');
    const phone = String(cust.phone || '');
    const type = String(cust.type || 'Regular');
    const activity = String(cust.activity || 'Active');
    const spent = parseFloat(cust.spent) || 0;
    const ordersCount = parseInt(cust.orders) || 0;
    const region = String(cust.region || '');

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         phone.includes(searchQuery);
    
    const matchesType = filters.type.length === 0 || filters.type.includes(type);
    const matchesActivity = filters.activity.length === 0 || filters.activity.includes(activity);
    
    let matchesSpent = true;
    if (filters.spent === '$0 - $100') matchesSpent = spent <= 100;
    else if (filters.spent === '$100 - $500') matchesSpent = spent > 100 && spent <= 500;
    else if (filters.spent === '$500+') matchesSpent = spent > 500;

    let matchesOrders = true;
    if (filters.orders === '0 Orders') matchesOrders = ordersCount === 0;
    else if (filters.orders === '1 - 5 Orders') matchesOrders = ordersCount >= 1 && ordersCount <= 5;
    else if (filters.orders === '5 - 10 Orders') matchesOrders = ordersCount > 5 && ordersCount <= 10;
    else if (filters.orders === '10+ Orders') matchesOrders = ordersCount > 10;

    const matchesRegion = filters.region === 'All Regions' || region === filters.region;

    return matchesSearch && matchesType && matchesActivity && matchesSpent && matchesOrders && matchesRegion;
  }).sort((a, b) => {
    if (!a || !b) return 0;
    const aSpent = parseFloat(a.spent) || 0;
    const bSpent = parseFloat(b.spent) || 0;
    const aOrders = parseInt(a.orders) || 0;
    const bOrders = parseInt(b.orders) || 0;
    const aName = String(a.name || '');
    const bName = String(b.name || '');
    const aDate = a.date ? new Date(a.date) : new Date(0);
    const bDate = b.date ? new Date(b.date) : new Date(0);

    if (filters.sortBy === 'spending') return bSpent - aSpent;
    if (filters.sortBy === 'orders') return bOrders - aOrders;
    if (filters.sortBy === 'newest') return bDate - aDate;
    if (filters.sortBy === 'oldest') return aDate - bDate;
    if (filters.sortBy === 'alpha') return aName.localeCompare(bName);
    return 0;
  });

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      type: [],
      activity: [],
      spent: 'All',
      orders: 'All',
      region: 'All Regions',
      dateRange: 'all',
      sortBy: 'newest'
    });
  };

  const activeFilterCount = filters.type.length + filters.activity.length + 
                           (filters.spent !== 'All' ? 1 : 0) + 
                           (filters.orders !== 'All' ? 1 : 0) +
                           (filters.region !== 'All Regions' ? 1 : 0);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Region', 'Registration Date'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.email,
      c.phone,
      c.orders,
      c.spent.toFixed(2),
      c.region,
      c.date
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!selectedOrder) {
        setOrderItems([]);
        return;
      }
      setLoadingOrderItems(true);
      try {
        if (!supabaseClient) {
          setOrderItems([]);
          return;
        }
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const sessionData = await supabaseClient.auth.getSession();
        const token = sessionData.data.session?.access_token || supabaseAnonKey;

        // Fetch order items joined with product details
        const url = `${supabaseUrl}/rest/v1/order_items?order_id=eq.${selectedOrder.id}&select=*,product:product_id(name,price)`;
        const res = await fetch(url, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const itemsData = await res.json();
          setOrderItems(itemsData || []);
        }
      } catch (err) {
        console.error('Failed to fetch order items:', err);
      } finally {
        setLoadingOrderItems(false);
      }
    };
    fetchOrderItems();
  }, [selectedOrder?.id]);

  const selectedCustomerOrders = selectedCustomer
    ? (orders || []).filter(o => o.customer_email === selectedCustomer.email)
    : [];

  const customerSinceDate = selectedCustomerOrders.length > 0 
    ? new Date(selectedCustomerOrders[selectedCustomerOrders.length - 1].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'New';

  return (
    <div className="customers-page">
      <div className="header-row">
        <div className="header-left">
          <h1>Customers</h1>
          <p>Manage your customer base and view their order history.</p>
        </div>
        <button className="export-btn" onClick={exportToCSV}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export CSV
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon-box" style={{ background: s.color, color: s.iconColor }}>
              {s.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{s.label}</span>
              <div className="stat-val-row">
                <span className="stat-value">{s.value}</span>
                {s.trend && <span className="stat-trend">{s.trend}</span>}
              </div>
              <span className="stat-sub">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-filters-bar">
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="action-right-group">
          <button className={`filter-btn-toggle ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters
            {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
          </button>
          
          <div className="sort-dropdown-container">
            <select className="bar-select" value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="spending">Sort: Highest Spending</option>
              <option value="orders">Sort: Most Orders</option>
              <option value="alpha">Sort: Alphabetical A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {(activeFilterCount > 0 || searchQuery) && (
        <div className="active-filters-row">
          <div className="active-chips">
            <span className="results-text">{filteredCustomers.length} customers found</span>
            {filters.type.map(t => (
              <div key={t} className="filter-chip">
                Type: {t}
                <button onClick={() => toggleFilter('type', t)}>&times;</button>
              </div>
            ))}
            {filters.spent !== 'All' && (
              <div className="filter-chip">
                Spent: {filters.spent}
                <button onClick={() => handleFilterChange('spent', 'All')}>&times;</button>
              </div>
            )}
            {filters.region !== 'All Regions' && (
              <div className="filter-chip">
                Region: {filters.region}
                <button onClick={() => handleFilterChange('region', 'All Regions')}>&times;</button>
              </div>
            )}
          </div>
          <button className="clear-all-btn" onClick={resetFilters}>Clear all</button>
        </div>
      )}

      <div className="quick-filters-bar">
        <button className={`quick-chip ${filters.type.includes('VIP Customers') ? 'active' : ''}`} onClick={() => toggleFilter('type', 'VIP Customers')}>
          <span className="dot yellow"></span> VIP Customers
        </button>
        <button className={`quick-chip ${filters.type.includes('New Customers') ? 'active' : ''}`} onClick={() => toggleFilter('type', 'New Customers')}>
          <span className="dot green"></span> New Customers <span className="new-badge">New</span>
        </button>
        <button className={`quick-chip ${filters.activity.includes('Inactive (30+ Days)') ? 'active' : ''}`} onClick={() => toggleFilter('activity', 'Inactive (30+ Days)')}>
          <span className="dot red"></span> Inactive (30+ Days)
        </button>
        <button className={`quick-chip ${filters.orders === '0 Orders' ? 'active' : ''}`} onClick={() => handleFilterChange('orders', filters.orders === '0 Orders' ? 'All' : '0 Orders')}>
          <span className="dot blue"></span> No Orders
        </button>
        <button className={`quick-chip ${filters.spent === '$500+' ? 'active' : ''}`} onClick={() => handleFilterChange('spent', filters.spent === '$500+' ? 'All' : '$500+')}>
          <span className="dot purple"></span> Top Spenders
        </button>
      </div>

      <div className="list-container">
        <div className="list-header">
          <div className="col-customer">Customer</div>
          <div className="col-email">Email</div>
          <div className="col-phone">Phone</div>
          <div className="col-orders">Total Orders</div>
          <div className="col-spent">Total Spent</div>
          <div className="col-last">Last Order</div>
          <div className="col-actions">Actions</div>
        </div>

        {loading ? (
          <div className="loading-state">Loading customers...</div>
        ) : (
          filteredCustomers.map(cust => (
            <div className="customer-row" key={cust.id}>
              <div className="col-customer">
                <div className="cust-avatar-box">
                  <div className="avatar" style={{ background: cust.color, color: cust.textColor }}>{cust.initial}</div>
                  <div className="cust-name-box">
                    <strong>{cust.name}</strong>
                    {cust.type === 'VIP Customers' && <span className="vip-indicator">VIP</span>}
                  </div>
                </div>
              </div>
              <div className="col-email">{cust.email}</div>
              <div className="col-phone">{cust.phone}</div>
              <div className="col-orders">
                <span className="order-pill">{cust.orders}</span>
              </div>
              <div className="col-spent">
                <strong>${cust.spent.toFixed(2)}</strong>
              </div>
              <div className="col-last">
                <div className="last-order-box">
                  <strong>{cust.lastOrder}</strong>
                  {cust.lastOrder !== '-' && <span>10:30 AM</span>}
                </div>
              </div>
              <div className="col-actions">
                <div className="action-btns">
                  <button className="row-btn view" onClick={() => setSelectedCustomer(cust)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    View History
                  </button>
                  <button className="menu-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="list-footer">
          <p>Showing 1 to {filteredCustomers.length} of {customers.length} customers</p>
          <div className="footer-right">
            <button className="nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button className="num-btn active">1</button>
            <button className="num-btn">2</button>
            <button className="nav-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <div className={`filter-drawer ${isFilterOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Filter Customers</h2>
          <button className="close-drawer" onClick={() => setIsFilterOpen(false)}>&times;</button>
        </div>
        
        <div className="drawer-content">
          <div className="filter-section">
            <div className="section-header">
              <h3>Customer Type</h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
            </div>
            <div className="filter-options">
              {['New Customers', 'Returning Customers', 'Guest Customers', 'VIP Customers'].map(t => (
                <label key={t} className="checkbox-label">
                  <input type="checkbox" checked={filters.type.includes(t)} onChange={() => toggleFilter('type', t)} />
                  <span className="checkbox-custom"></span>
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Total Orders</h3>
            </div>
            <div className="filter-options">
              {['All', '0 Orders', '1 - 5 Orders', '5 - 10 Orders', '10+ Orders'].map(o => (
                <label key={o} className="radio-label">
                  <input type="radio" name="cOrders" checked={filters.orders === o} onChange={() => handleFilterChange('orders', o)} />
                  <span className="radio-custom"></span>
                  {o}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Total Spent</h3>
            </div>
            <div className="filter-options">
              {['All', '$0 - $100', '$100 - $500', '$500+'].map(s => (
                <label key={s} className="radio-label">
                  <input type="radio" name="cSpent" checked={filters.spent === s} onChange={() => handleFilterChange('spent', s)} />
                  <span className="radio-custom"></span>
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Customer Activity</h3>
            </div>
            <div className="filter-options">
              {['Active Recently (7 Days)', 'Inactive (30+ Days)', 'Never Purchased', 'Recently Ordered'].map(a => (
                <label key={a} className="checkbox-label">
                  <input type="checkbox" checked={filters.activity.includes(a)} onChange={() => toggleFilter('activity', a)} />
                  <span className="checkbox-custom"></span>
                  {a}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <div className="section-header">
              <h3>Location / Region</h3>
            </div>
            <select className="drawer-select" value={filters.region} onChange={(e) => handleFilterChange('region', e.target.value)}>
              <option value="All Regions">All Regions</option>
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
            </select>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="reset-btn" onClick={resetFilters}>Reset</button>
          <button className="apply-btn" onClick={() => setIsFilterOpen(false)}>Apply Filters</button>
        </div>
      </div>
      {isFilterOpen && <div className="drawer-overlay" onClick={() => setIsFilterOpen(false)}></div>}

      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={
          <div className="modal-header-content">
            <div className="avatar history-avatar" style={{ background: selectedCustomer?.color, color: selectedCustomer?.textColor }}>
              {selectedCustomer?.initial}
            </div>
            <div className="modal-title-box">
              <div className="title-with-badge">
                <h2>Customer History</h2>
                <span className="since-badge">
                  {customerSinceDate === 'New' ? 'New Customer' : `Customer since ${customerSinceDate}`}
                </span>
              </div>
              <p>{selectedCustomer?.name}</p>
            </div>
          </div>
        }
        footer={
          <div className="modal-footer-btns">
            <button className="outline-btn" onClick={() => setSelectedCustomer(null)}>Close</button>
            <button className="primary-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              Send Email
            </button>
          </div>
        }
      >
        <div className="history-content">
          <div className="section-group">
            <h3 className="section-label">Customer Overview</h3>
            <div className="overview-cards">
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Total Orders</span>
                  <strong>{selectedCustomerOrders.length}</strong>
                </div>
              </div>
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#f0fdf4', color: '#22c55e' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Total Spent</span>
                  <strong>${(selectedCustomer?.spent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              </div>
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Last Order</span>
                  <strong>{selectedCustomer?.lastOrder || '-'}</strong>
                </div>
              </div>
              <div className="ov-card">
                <div className="ov-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div className="ov-info">
                  <span className="ov-label">Email</span>
                  <strong style={{ fontSize: '12px' }}>{selectedCustomer?.email}</strong>
                </div>
              </div>
            </div>
            <div className="phone-card">
              <div className="ov-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div className="ov-info">
                <span className="ov-label">Phone</span>
                <strong>{selectedCustomer?.phone || 'N/A'}</strong>
              </div>
            </div>
          </div>

          <div className="section-group">
            <h3 className="section-label">Order History</h3>
            <div className="history-table">
              <div className="h-head">
                <div className="h-col-id">Order ID</div>
                <div className="h-col-date">Date</div>
                <div className="h-col-status">Status</div>
                <div className="h-col-total">Total</div>
                <div className="h-col-items">Items</div>
                <div className="h-col-actions">Actions</div>
              </div>
              {selectedCustomerOrders.length > 0 ? (
                selectedCustomerOrders.map(order => {
                  const orderDate = new Date(order.created_at);
                  const formattedDate = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const formattedTime = orderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  
                  let statusBg = '#fffbeb';
                  let statusColor = '#b45309';
                  if (order.status === 'Completed' || order.status === 'Delivered') {
                    statusBg = '#f0fdf4';
                    statusColor = '#15803d';
                  } else if (order.status === 'Cancelled') {
                    statusBg = '#fef2f2';
                    statusColor = '#b91c1c';
                  } else if (order.status === 'Shipped') {
                    statusBg = '#eff6ff';
                    statusColor = '#1d4ed8';
                  }

                  return (
                    <div className="h-row" key={order.id}>
                      <div className="h-col-id"><strong>{order.id.slice(0, 8).toUpperCase()}</strong></div>
                      <div className="h-col-date">
                        <div className="h-date-box">
                          <strong>{formattedDate}</strong>
                          <span>{formattedTime}</span>
                        </div>
                      </div>
                      <div className="h-col-status">
                        <span className="h-status" style={{ background: statusBg, color: statusColor }}>
                          <span className="h-dot" style={{ background: statusColor }}></span>
                          {order.status}
                        </span>
                      </div>
                      <div className="h-col-total">
                        <strong>${parseFloat(order.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                      <div className="h-col-items">1 item</div>
                      <div className="h-col-actions">
                        <button className="row-btn view" onClick={() => setSelectedOrder(order)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No order history found for this customer.
                </div>
              )}
            </div>
          </div>

          <div className="notes-section">
            <div className="notes-left">
              <div className="ov-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </div>
              <div className="ov-info">
                <strong>Customer Notes</strong>
                <p>No notes added for this customer yet.</p>
              </div>
            </div>
            <button className="add-note-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Note
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder && (
          <div className="modal-header-content">
            <div className="modal-icon detail-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div className="modal-title-box">
              <div className="title-with-badge">
                <h2>Order #{selectedOrder.id?.slice(0, 8).toUpperCase()}</h2>
                <span className="order-badge">OFFICIAL RECEIPT</span>
              </div>
              <p>Review full order details and customer information.</p>
            </div>
          </div>
        )}
        footer={
          <div className="modal-footer-btns">
            <button className="outline-btn" onClick={() => setSelectedOrder(null)}>Close</button>
            <button className="primary-btn" onClick={() => window.print()}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Receipt
            </button>
          </div>
        }
      >
        {selectedOrder && (
          <div className="order-details-summary">
            <div className="details-grid">
              <div className="detail-item">
                <span className="d-label">Status</span>
                <span className="d-val status" style={{
                  background: selectedOrder.status === 'Completed' || selectedOrder.status === 'Delivered' ? '#f0fdf4' : selectedOrder.status === 'Cancelled' ? '#fef2f2' : '#fffbeb',
                  color: selectedOrder.status === 'Completed' || selectedOrder.status === 'Delivered' ? '#15803d' : selectedOrder.status === 'Cancelled' ? '#b91c1c' : '#b45309'
                }}>{selectedOrder.status}</span>
              </div>
              <div className="detail-item">
                <span className="d-label">Total Amount</span>
                <span className="d-val"><strong>${parseFloat(selectedOrder.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              </div>
              <div className="detail-item">
                <span className="d-label">Payment</span>
                <span className="d-val">Paid via Credit Card</span>
              </div>
              <div className="detail-item">
                <span className="d-label">Date</span>
                <span className="d-val">{new Date(selectedOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            
            <div className="items-list-section">
              <h4>Order Items</h4>
              <div className="items-table">
                <div className="i-head">
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>Total</span>
                </div>
                {loadingOrderItems ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>Loading items...</div>
                ) : orderItems.length > 0 ? (
                  orderItems.map((item) => {
                    const productName = item.product?.name || 'Product Details (Archived)';
                    const itemPrice = parseFloat(item.price || item.product?.price || 0);
                    const itemQty = parseInt(item.quantity || 1);
                    const itemTotal = itemPrice * itemQty;

                    return (
                      <div className="i-row" key={item.id}>
                        <span>{productName}</span>
                        <span>{itemQty}</span>
                        <span>${itemPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span>${itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>No items found for this order.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .customers-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 100%;
          overflow-x: hidden;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #94a3b8;
        }

        .breadcrumbs span.active { color: #6366f1; font-weight: 600; }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .header-left p { color: #64748b; margin: 0; font-size: 15px; }

        .export-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .export-btn:hover { background: #4f46e5; transform: translateY(-1px); }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-card {
          background: #fff;
          padding: 24px;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: all 0.3s;
        }

        .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 25px rgba(0,0,0,0.03); }

        .stat-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { font-size: 13px; font-weight: 600; color: #64748b; }
        
        .stat-val-row { display: flex; align-items: center; gap: 10px; }
        .stat-value { font-size: 24px; font-weight: 800; color: #1e293b; }
        .stat-trend { font-size: 12px; font-weight: 700; color: #22c55e; background: #f0fdf4; padding: 2px 8px; border-radius: 20px; }
        
        .stat-sub { font-size: 12px; color: #94a3b8; }

        .table-filters-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .search-box {
          flex: 1;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          height: 48px;
        }

        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: #1e293b;
          background: transparent;
        }

        .action-right-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-btn-toggle {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0 20px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .filter-btn-toggle:hover, .filter-btn-toggle.active {
          border-color: #6366f1;
          color: #6366f1;
          background: #f5f3ff;
        }

        .filter-badge {
          background: #6366f1;
          color: #fff;
          font-size: 10px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          margin-left: 4px;
        }

        .sort-dropdown-container {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          height: 48px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .bar-select {
          border: none;
          outline: none;
          padding: 0 16px;
          height: 100%;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
          cursor: pointer;
          background: transparent;
        }

        .active-filters-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: -12px;
        }

        .active-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .results-text {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin-right: 8px;
        }

        .filter-chip {
          background: #f5f3ff;
          color: #6366f1;
          padding: 6px 12px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #e0e7ff;
        }

        .filter-chip button {
          background: none; border: none; color: #6366f1; font-size: 16px; cursor: pointer; padding: 0;
        }

        .clear-all-btn {
          background: none; border: none; color: #6366f1; font-weight: 700; font-size: 13px;
          cursor: pointer; text-decoration: underline;
        }

        .quick-filters-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: -8px;
        }

        .quick-chip {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-chip:hover, .quick-chip.active {
          border-color: #6366f1;
          background: #fbfaff;
          color: #6366f1;
        }

        .quick-chip .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .dot.yellow { background: #f59e0b; }
        .dot.red { background: #ef4444; }
        .dot.purple { background: #8b5cf6; }
        .dot.blue { background: #3b82f6; }
        .dot.green { background: #22c55e; }

        .new-badge {
          background: #f0fdf4;
          color: #22c55e;
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 6px;
          border: 1px solid #dcfce7;
        }

        .filter-drawer {
          position: fixed;
          top: 0;
          right: -400px;
          width: 380px;
          height: 100%;
          background: #fff;
          box-shadow: -10px 0 30px rgba(0,0,0,0.05);
          z-index: 1000;
          transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
        }

        .filter-drawer.open {
          right: 0;
        }

        .drawer-header {
          padding: 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drawer-header h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .close-drawer {
          background: #f1f5f9;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #64748b;
          cursor: pointer;
        }

        .drawer-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .filter-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .filter-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .checkbox-label, .radio-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-custom, .radio-custom {
          width: 18px;
          height: 18px;
          border: 2px solid #e2e8f0;
          border-radius: 5px;
          position: relative;
          transition: all 0.2s;
        }

        .radio-custom { border-radius: 50%; }

        input:checked + .checkbox-custom {
          background: #6366f1;
          border-color: #6366f1;
        }

        input:checked + .radio-custom {
          border-color: #6366f1;
        }

        input:checked + .radio-custom::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #6366f1;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .drawer-select {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .drawer-footer {
          padding: 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          gap: 12px;
        }

        .reset-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }

        .apply-btn {
          flex: 2;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: #6366f1;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.1);
          backdrop-filter: blur(2px);
          z-index: 999;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .secondary-btn {
          background: #fff;
          color: #64748b;
          border: 1px solid #e2e8f0;
          padding: 12px 20px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

        .list-container {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
          overflow-x: auto;
          border: 1px solid #f1f5f9;
        }

        .list-header {
          background: #f8fafc;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          letter-spacing: 1px;
          border-bottom: 1px solid #f1f5f9;
          text-transform: uppercase;
        }

        .col-customer { flex: 1.8; }
        .col-email { flex: 1.8; color: #64748b; }
        .col-phone { flex: 1.5; color: #64748b; }
        .col-orders { flex: 0.8; text-align: center; }
        .col-spent { flex: 1; text-align: center; }
        .col-last { flex: 1.2; text-align: left; }
        .col-actions { flex: 1.5; text-align: right; }

        .cust-name-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vip-indicator {
          font-size: 9px;
          background: #fffbeb;
          color: #f59e0b;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 800;
          width: fit-content;
          border: 1px solid #fef3c7;
        }

        .last-order-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .last-order-box strong { font-size: 13px; color: #1e293b; }
        .last-order-box span { font-size: 11px; color: #94a3b8; }

        .customer-row {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }

        .customer-row:hover { background: #fbfaff; }

        .cust-avatar-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .order-pill {
          background: #f5f3ff;
          color: #8b5cf6;
          padding: 4px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
        }

        .action-btns {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
        }

        .row-btn.view {
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
          color: #1e293b;
        }

        .row-btn.view:hover { background: #f8fafc; border-color: #cbd5e1; }

        .menu-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
        }

        .list-footer {
          padding: 20px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .list-footer p { font-size: 13px; color: #64748b; }
        .footer-right { display: flex; align-items: center; gap: 8px; }

        .nav-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
        }

        .num-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }
        .num-btn.active { background: #6366f1; color: #fff; }

        .loading-state {
          padding: 40px;
          text-align: center;
          color: #94a3b8;
        }

        /* Modal Styles */
        :global(.modal) {
          max-width: min(1000px, 95vw) !important;
          width: 95% !important;
        }

        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .history-avatar {
          width: 48px !important;
          height: 48px !important;
          font-size: 18px !important;
        }

        .modal-title-box h2 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .since-badge {
          background: #f5f3ff;
          color: #8b5cf6;
          padding: 2px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .modal-title-box p {
          font-size: 14px;
          color: #64748b;
          margin: 2px 0 0 0;
          font-weight: 600;
        }

        .history-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .section-label {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 16px 0;
        }

        .overview-cards {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }

        .ov-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 200px;
        }

        .ov-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ov-info { display: flex; flex-direction: column; gap: 2px; }
        .ov-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .ov-info strong { font-size: 14px; color: #1e293b; }

        .phone-card { 
          width: 100%;
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .history-table {
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          overflow: hidden;
        }

        .h-head {
          background: #f8fafc;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .h-row {
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
        }

        .h-row:last-child { border-bottom: none; }

        .h-col-id { flex: 0.8; color: #6366f1; }
        .h-col-date { flex: 1.8; }
        .h-col-status { flex: 1.2; }
        .h-col-total { flex: 1; }
        .h-col-items { flex: 0.8; color: #64748b; font-size: 13px; }
        .h-col-actions { flex: 1.5; text-align: right; }

        .h-date-box { display: flex; flex-direction: column; }
        .h-date-box strong { font-size: 13px; color: #1e293b; }
        .h-date-box span { font-size: 11px; color: #94a3b8; }

        .h-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

        .h-dot { width: 6px; height: 6px; border-radius: 50%; }

        .h-view-btn {
          display: none;
        }

        .notes-section {
          background: #fbfaff;
          border: 1px solid #f5f3ff;
          border-radius: 16px;
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notes-left { display: flex; align-items: center; gap: 16px; }
        .notes-left p { margin: 0; font-size: 13px; color: #64748b; }

        .order-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 2px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .modal-icon.detail-icon {
          background: #f5f3ff;
          color: #8b5cf6;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .order-details-summary {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          background: #f8fafc;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .d-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .d-val { font-size: 14px; color: #1e293b; font-weight: 600; }
        .d-val.status { width: fit-content; padding: 2px 10px; border-radius: 20px; font-size: 12px; }

        .items-list-section h4 {
          font-size: 15px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 12px 0;
        }

        .items-table {
          border: 1px solid #f1f5f9;
          border-radius: 12px;
          overflow: hidden;
        }

        .i-head {
          background: #f8fafc;
          padding: 10px 16px;
          display: grid;
          grid-template-columns: 2fr 0.5fr 1fr 1fr;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
        }

        .i-row {
          padding: 12px 16px;
          display: grid;
          grid-template-columns: 2fr 0.5fr 1fr 1fr;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        .i-row:last-child { border-bottom: none; }

        .modal-footer-btns {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          width: 100%;
        }

        .outline-btn {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 10px 32px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .primary-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 10px 32px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        @media print {
          .sidebar, .top-bar, .header-row, .stats-grid, .table-filters-bar, 
          .active-filters-row, .quick-filters-bar, .list-footer, .drawer-overlay,
          .filter-drawer, .action-buttons, .modal-footer-btns, .close-modal-btn {
            display: none !important;
          }
          
          :global(.overlay) { background: white !important; position: static !important; }
          :global(.modal) { 
            box-shadow: none !important; 
            border: none !important; 
            width: 100% !important; 
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            position: static !important;
          }
          .customers-page { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
