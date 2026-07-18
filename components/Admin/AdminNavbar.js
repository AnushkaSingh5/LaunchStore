'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './AdminLayout.module.css';
import { useAdmin } from '@/context/AdminContext';
import { payoutService } from '@/services/payoutService';

export default function AdminNavbar({ onToggleSidebar }) {
  const { stores = [], orders = [], loading } = useAdmin();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    if (loading) return;

    const generateNotifications = async () => {
      const list = [];

      // 1. Pending Stores
      const pendingStores = stores.filter(s => s.status === 'Pending');
      pendingStores.forEach(s => {
        list.push({
          id: `pending-store-${s.id}`,
          text: `🏪 New Store Pending Approval: Store "${s.name}" is awaiting review.`,
          time: s.createdDate || 'Recent',
          link: '/admin/stores',
          type: 'store'
        });
      });

      // 2. Pending Payout Requests
      let fetchedPayouts = [];
      try {
        fetchedPayouts = await payoutService.adminGetPayoutRequests();
      } catch (err) {
        console.error('Error fetching admin payouts:', err);
      }
      const pendingPayouts = (fetchedPayouts || []).filter(p => (p.status || '').toLowerCase() === 'pending');
      pendingPayouts.forEach(p => {
        list.push({
          id: `pending-payout-${p.id}`,
          text: `💳 New Payout Request: Payout of ₹${parseFloat(p.amount).toLocaleString()} requested by creator.`,
          time: p.requestedAt || 'Recent',
          link: '/admin/payouts',
          type: 'payout'
        });
      });

      // 3. Recent Orders
      const recentOrders = (orders || []).slice(0, 5);
      recentOrders.forEach(o => {
        list.push({
          id: `recent-order-${o.id}`,
          text: `📦 Order Placed: Order #${o.id.substring(0, 8)}... was placed on "${o.store}" for ₹${o.total.toLocaleString()}.`,
          time: o.date || 'Recent',
          link: '/admin/orders',
          type: 'order'
        });
      });

      // Load read status from localStorage
      const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
      const processedList = list.map(item => ({
        ...item,
        unread: !readNotifications.includes(item.id)
      }));

      setNotifications(processedList);
      setUnreadCount(processedList.filter(n => n.unread).length);
    };

    generateNotifications();
  }, [stores, orders, loading]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllRead = (e) => {
    e.stopPropagation();
    const allIds = notifications.map(n => n.id);
    localStorage.setItem('admin_read_notifications', JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (id) => {
    const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    if (!readNotifications.includes(id)) {
      readNotifications.push(id);
      localStorage.setItem('admin_read_notifications', JSON.stringify(readNotifications));
    }
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id) {
          return { ...n, unread: false };
        }
        return n;
      })
    );
    setUnreadCount(c => Math.max(0, c - 1));
    setShowNotifications(false);
  };

  const hasUnread = unreadCount > 0;

  return (
    <header className={styles.navbar}>
      {showMobileSearch ? (
        <div className="mobileSearchOverlay">
          <svg className="overlaySearchIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search stores, orders, sellers..." 
            autoFocus 
            className="overlaySearchInput"
          />
          <button className="closeOverlayBtn" onClick={() => setShowMobileSearch(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      ) : (
        <>
          <div className={styles.navLeft}>
            <button className={styles.mobileToggle} onClick={onToggleSidebar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className={styles.searchWrapper}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" placeholder="Search stores, orders, sellers..." />
              <span className={styles.searchShortcut}>⌘K</span>
            </div>
          </div>

          <div className={styles.navRight}>
            <div className={styles.navActions}>
              {/* Mobile Search Toggle Button */}
              <button 
                className="mobileSearchTriggerBtn"
                onClick={() => setShowMobileSearch(true)}
                title="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
          {/* Notifications Trigger Wrapper */}
          <div className={styles.navDropdownWrapper} ref={dropdownRef} style={{ position: 'relative' }}>
            <button 
              className={`${styles.navActionBtn} ${showNotifications ? 'active' : ''} ${hasUnread ? styles.hasUnread : ''}`} 
              title="Notifications" 
              onClick={toggleNotifications}
              style={{ position: 'relative' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {hasUnread && <span className={styles.notificationBadge}></span>}
            </button>

            {/* Notification Dropdown matching Seller Dashboard design */}
            {showNotifications && (
              <div className="dropdownMenu">
                <div className="dropdownHeader">
                  <h3>Notifications</h3>
                  {hasUnread && (
                    <button className="clearAllBtn" onClick={markAllRead}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="dropdownContent">
                  {notifications.length === 0 ? (
                    <div className="emptyState">No notifications</div>
                  ) : (
                    <div className="notificationsList">
                      {notifications.map(n => (
                        <Link 
                          href={n.link} 
                          key={n.id} 
                          className={`notificationItem ${n.unread ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(n.id)}
                        >
                          <div className="notificationMain">
                            <span className="dot"></span>
                            <p>{n.text}</p>
                          </div>
                          <span className="time">{n.time}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.adminProfile}>
          <div className={styles.adminAvatar}>AD</div>
          <div className={styles.adminInfo}>
            <span className={styles.adminName}>Admin</span>
            <span className={styles.adminRole}>Super Admin</span>
          </div>
        </div>
      </div>
    </>
  )}

      <style jsx>{`
        .dropdownMenu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 14px;
          width: 400px;
          background: #ffffff;
          border: 1px solid rgba(226, 232, 240, 0.8);
          border-radius: 18px;
          box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 12px -6px rgba(0, 0, 0, 0.03);
          z-index: 99999;
          padding: 20px;
          display: flex;
          flex-direction: column;
          animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdownHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          background: #ffffff !important;
        }

        .dropdownHeader h3 {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .clearAllBtn {
          background: none;
          border: none;
          color: #6366f1;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .clearAllBtn:hover {
          background: #f5f3ff;
        }

        .dropdownContent {
          max-height: 380px;
          overflow-y: auto;
          scrollbar-width: none;
        }

        .dropdownContent::-webkit-scrollbar {
          display: none;
        }

        .notificationsList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notificationItem {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px 16px;
          border-radius: 14px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          text-decoration: none;
        }

        .notificationItem:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .notificationItem.unread {
          background: #f5f3ff;
          border-color: #ddd6fe;
        }

        .notificationMain {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .notificationMain p {
          font-size: 13px;
          color: #475569;
          margin: 0;
          line-height: 1.5;
          font-weight: 500;
        }

        .notificationItem.unread .notificationMain p {
          color: #1e1b4b;
          font-weight: 600;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: transparent;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .notificationItem.unread .dot {
          background: #6366f1;
        }

        .time {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 550;
          margin-top: 2px;
          padding-left: 16px;
        }

        .emptyState {
          padding: 24px;
          text-align: center;
          font-size: 13px;
          color: #94a3b8;
        }

        @media (max-width: 576px) {
          .dropdownMenu {
            position: fixed;
            top: 75px;
            left: 16px;
            right: 16px;
            width: auto;
            max-width: calc(100vw - 32px);
            margin-top: 0;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
        }

        .mobileSearchTriggerBtn {
          display: none;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .mobileSearchTriggerBtn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .mobileSearchOverlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #ffffff;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 12px;
          z-index: 100;
        }
        .overlaySearchIcon {
          color: #94a3b8;
          flex-shrink: 0;
        }
        .overlaySearchInput {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          color: #1e293b;
          font-family: inherit;
        }
        .closeOverlayBtn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .closeOverlayBtn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        @media (max-width: 1024px) {
          .mobileSearchTriggerBtn {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
