'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomerOrdersHistoryPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    const fetchCustomerOrders = async () => {
      if (!user) {
        setLoadingOrders(false);
        return;
      }
      setLoadingOrders(true);
      try {
        const data = await orderService.getCustomerOrders(user.email);
        setOrders(data || []);
      } catch (e) {
        console.error('Failed to load customer orders:', e);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchCustomerOrders();
  }, [user, authLoading]);

  const handleToggleExpand = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      setExpandedDetails(null);
      return;
    }

    setExpandedOrder(orderId);
    setLoadingDetails(true);
    try {
      const details = await orderService.getOrderDetails(orderId);
      setExpandedDetails(details);
    } catch (e) {
      console.error('Failed to fetch items details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#ecfdf5', text: '#10b981' };
      case 'Cancelled': return { bg: '#fef2f2', text: '#ef4444' };
      case 'Pending':
      default: return { bg: '#fffbeb', text: '#f59e0b' };
    }
  };

  return (
    <div className="history-page">
      <Navbar />

      <main className="container main-content">
        {authLoading ? (
          <div className="dashboard-layout">
            <div className="sidebar-section dashboard-card shim" style={{ height: '300px', background: '#fff' }}></div>
            <div className="orders-section">
              <div className="skeleton-box shim" style={{ height: '40px', width: '250px', marginBottom: '20px', background: '#fff', borderRadius: '8px' }}></div>
              <div className="skeleton-box shim" style={{ height: '140px', borderRadius: '16px', background: '#fff' }}></div>
            </div>
          </div>
        ) : !user ? (
          <div className="auth-prompt dashboard-card fade-in">
            <div className="prompt-icon">🔒</div>
            <h2>Access Denied</h2>
            <p>Please log in or register a customer account to track your orders, view historical receipts, and save your shopping profiles.</p>
            <div className="btn-row">
              <Link href="/login" className="login-btn">Log In</Link>
              <Link href="/signup" className="signup-btn">Create Account</Link>
            </div>
          </div>
        ) : (
          <div className="dashboard-layout">
            <div className="sidebar-section dashboard-card fade-in">
              <div className="profile-card">
                <div className="avatar">👤</div>
                <h3>{profile?.name || 'Customer'}</h3>
                <span className="email">{user.email}</span>
                <span className="role-tag">Customer Account</span>
              </div>
              <div className="nav-menu">
                <Link href="/account/orders" className="menu-item active">🛍️ Order History</Link>
                <Link href="/cart" className="menu-item">🛒 Active Cart</Link>
              </div>
            </div>

            <div className="orders-section">
              <h1 className="section-title">Your Order History</h1>
              
              {loadingOrders ? (
                <div className="loading-orders">
                  <div className="spinner"></div>
                  <p>Loading your historical purchases...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="no-orders dashboard-card fade-in">
                  <div className="empty-icon">📦</div>
                  <h2>No orders found</h2>
                  <p>You haven&apos;t placed any orders on our platform yet. Visit storefronts to begin shopping!</p>
                  <Link href="/" className="shop-btn">Explore Stores</Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <div key={order.id} className="order-card dashboard-card fade-in">
                        <div className="order-header" onClick={() => handleToggleExpand(order.id)}>
                          <div className="header-left">
                            <div className="store-badge">🏪 {order.store?.name || 'LaunchCart Shop'}</div>
                            <span className="order-date">Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                          
                          <div className="header-right">
                            <span className="status-pill" style={{ background: statusStyle.bg, color: statusStyle.text }}>
                              {order.status}
                            </span>
                            <span className="order-total">₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                            <span className={`expand-chevron ${isExpanded ? 'rotated' : ''}`}>▼</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="order-body fade-in">
                            <div className="details-grid">
                              <div className="detail-item address">
                                <strong>Shipping Address</strong>
                                <p>{order.shipping_address || 'No address provided'}</p>
                              </div>
                              <div className="detail-item tracking">
                                <strong>Delivery Timeline</strong>
                                <div className="timeline">
                                  <div className={`timeline-step active`}>
                                    <div className="bullet">✓</div>
                                    <span>Placed</span>
                                  </div>
                                  <div className={`timeline-step ${order.status === 'Completed' ? 'active' : ''}`}>
                                    <div className="bullet">{order.status === 'Completed' ? '✓' : '•'}</div>
                                    <span>Processed</span>
                                  </div>
                                  <div className={`timeline-step ${order.status === 'Completed' ? 'active' : ''}`}>
                                    <div className="bullet">{order.status === 'Completed' ? '✓' : '•'}</div>
                                    <span>Delivered</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="items-list">
                              <h4>Purchased Items</h4>
                              {loadingDetails ? (
                                <p className="loading-text">Loading items...</p>
                              ) : (
                                expandedDetails?.items?.map((item) => (
                                  <div key={item.id} className="item-row">
                                    <div className="item-info">
                                      <img 
                                        src={item.productImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200'} 
                                        alt="" 
                                      />
                                      <strong>{item.productName}</strong>
                                    </div>
                                    <span className="item-qty-price">{item.quantity} × ₹{parseFloat(item.price || 0).toFixed(2)}</span>
                                    <span className="item-sub">₹{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .history-page {
          background: var(--bg-main);
          min-height: 100vh;
        }
        .main-content {
          padding-top: 140px;
          padding-bottom: 80px;
        }
        .auth-prompt {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
          padding: 60px 40px;
          background: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .prompt-icon {
          font-size: 54px;
        }
        .auth-prompt h2 {
          font-size: 26px;
          font-weight: 800;
        }
        .auth-prompt p {
          color: var(--text-sub);
          line-height: 1.6;
          font-size: 14px;
        }
        .btn-row {
          display: flex;
          gap: 16px;
          width: 100%;
          margin-top: 10px;
        }
        .login-btn, .signup-btn {
          flex: 1;
          padding: 13px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          text-align: center;
          text-decoration: none;
          transition: var(--transition-smooth);
        }
        .login-btn {
          background: var(--primary);
          color: var(--white);
        }
        .login-btn:hover {
          background: var(--accent);
        }
        .signup-btn {
          background: var(--bg-main);
          color: var(--text-main);
          border: 1px solid var(--secondary);
        }
        .signup-btn:hover {
          background: var(--secondary);
        }
        .dashboard-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          align-items: start;
        }
        .sidebar-section {
          background: var(--white);
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .profile-card {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .avatar {
          font-size: 40px;
          width: 70px;
          height: 70px;
          background: var(--bg-main);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }
        .profile-card h3 {
          font-size: 18px;
          font-weight: 800;
        }
        .profile-card .email {
          font-size: 12px;
          color: var(--text-sub);
        }
        .role-tag {
          font-size: 10px;
          background: #eff6ff;
          color: #3b82f6;
          padding: 2px 10px;
          border-radius: 99px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .menu-item {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-sub);
          text-decoration: none;
          transition: var(--transition-smooth);
        }
        .menu-item:hover, .menu-item.active {
          background: var(--bg-main);
          color: var(--primary);
        }
        .orders-section {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
        }
        .loading-orders {
          text-align: center;
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--text-sub);
        }
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--secondary);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .no-orders {
          text-align: center;
          padding: 80px 40px;
          background: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .no-orders h2 {
          font-size: 22px;
          font-weight: 800;
        }
        .no-orders p {
          color: var(--text-sub);
          max-width: 300px;
          font-size: 14px;
          line-height: 1.6;
        }
        .shop-btn {
          margin-top: 10px;
          padding: 12px 30px;
          background: var(--primary);
          color: var(--white);
          border-radius: 10px;
          font-weight: 700;
          text-decoration: none;
          transition: var(--transition-smooth);
        }
        .shop-btn:hover {
          background: var(--accent);
        }
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .order-card {
          background: var(--white);
          padding: 0;
          overflow: hidden;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 30px;
          cursor: pointer;
          user-select: none;
          transition: var(--transition-smooth);
        }
        .order-header:hover {
          background: var(--bg-main);
        }
        .header-left {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .store-badge {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-main);
        }
        .order-date {
          font-size: 12px;
          color: var(--text-sub);
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .status-pill {
          font-size: 11px;
          padding: 4px 12px;
          border-radius: 99px;
          font-weight: 800;
        }
        .order-total {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          width: 100px;
          text-align: right;
        }
        .expand-chevron {
          font-size: 12px;
          color: var(--text-sub);
          transition: var(--transition-smooth);
        }
        .expand-chevron.rotated {
          transform: rotate(180deg);
        }
        .order-body {
          border-top: 1px solid var(--secondary);
          padding: 30px;
          background: #fafafa;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          margin-bottom: 30px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .detail-item strong {
          font-size: 11px;
          text-transform: uppercase;
          color: var(--text-sub);
          letter-spacing: 0.5px;
        }
        .detail-item p {
          font-size: 14px;
          color: var(--text-main);
          line-height: 1.5;
        }
        .timeline {
          display: flex;
          justify-content: space-between;
          position: relative;
          margin-top: 10px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 15px;
          right: 15px;
          height: 2px;
          background: var(--secondary);
          z-index: 1;
        }
        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          z-index: 2;
        }
        .bullet {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--secondary);
          color: var(--text-sub);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          transition: var(--transition-smooth);
        }
        .timeline-step.active .bullet {
          background: #10b981;
          color: var(--white);
        }
        .timeline-step span {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-sub);
        }
        .timeline-step.active span {
          color: #10b981;
        }
        .items-list {
          border-top: 1px solid var(--secondary);
          padding-top: 24px;
        }
        .items-list h4 {
          font-size: 13px;
          text-transform: uppercase;
          color: var(--text-sub);
          margin-bottom: 16px;
          letter-spacing: 0.5px;
        }
        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px dashed var(--secondary);
          font-size: 14px;
        }
        .item-row:last-child {
          border-bottom: none;
        }
        .item-info {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        .item-info img {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          background: var(--bg-main);
        }
        .item-info strong {
          font-weight: 700;
          color: var(--text-main);
        }
        .item-qty-price {
          color: var(--text-sub);
          margin: 0 40px;
        }
        .item-sub {
          font-weight: 700;
          color: var(--text-main);
        }
        .loading-text {
          font-size: 14px;
          color: var(--text-sub);
          text-align: center;
        }
        @media (max-width: 991px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }
          .details-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
        .skeleton-box {
          border: 1px solid var(--secondary);
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
      `}</style>
    </div>
  );
}
