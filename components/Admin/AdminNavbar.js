'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

export default function AdminNavbar({ onToggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: '🏪 New Store Pending Approval: Store "bugfix" has been created and is awaiting review.',
      time: '5 mins ago',
      unread: true,
      link: '/admin/stores'
    },
    {
      id: 2,
      text: '👤 Creator Verification Submitted: bugfix (bugfix@gmail.com) uploaded verification documents.',
      time: '1 hour ago',
      unread: true,
      link: '/admin/creators'
    },
    {
      id: 3,
      text: '💳 New Payout Request: Store owner Anushka requested a payout of ₹15,000.',
      time: '2 hours ago',
      unread: true,
      link: '/admin/payouts'
    },
    {
      id: 4,
      text: '📦 New Platform Order Placed: Order #748c94b9 was placed on "bugfix" store for ₹216.',
      time: '1 day ago',
      unread: false,
      link: '/admin/orders'
    }
  ]);

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
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (id) => {
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === id && n.unread) {
          setUnreadCount(c => Math.max(0, c - 1));
          return { ...n, unread: false };
        }
        return n;
      })
    );
    setShowNotifications(false);
  };

  const hasUnread = unreadCount > 0;

  return (
    <header className={styles.navbar}>
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

          <button className={styles.navActionBtn} title="Help">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </button>
          <button className={styles.navActionBtn} title="Settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
          </button>
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
      `}</style>
    </header>
  );
}
