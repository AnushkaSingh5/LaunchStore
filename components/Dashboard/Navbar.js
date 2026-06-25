'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { payoutService } from '@/services/payoutService';
import { walletService } from '@/services/walletService';
import styles from './DashboardLayout.module.css';

export default function Navbar({ onMenuClick, title, breadcrumbs }) {
  const { user, profile, store, signOut } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const hasUnread = notifications.some(n => !n.read);
  const storeSlug = store?.slug || 'luxe-modern';
  const avatarUrl = profile?.profile_image || '';
  const avatarLetter = profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'C';

  useEffect(() => {
    if (store?.creator_id) {
      loadRealNotifications();
    }
  }, [store, profile]);

  const loadRealNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const creatorId = store.creator_id;
      const storeId = store.id;

      // Fetch actual payout requests and transactions in parallel
      const [payouts, transactions] = await Promise.all([
        payoutService.getPayoutRequests(creatorId).catch(() => []),
        walletService.getWalletTransactions(creatorId).catch(() => [])
      ]);

      const list = [];
      let idCounter = 1;

      // 1. Store Status Notification
      if (store) {
        if (store.status === 'Approved') {
          list.push({
            id: `store-status-approved`,
            text: `🎉 Store Live! Your store "${store.name}" is active and approved.`,
            read: false,
            time: 'Live',
            type: 'store'
          });
        } else if (store.status === 'Pending') {
          list.push({
            id: `store-status-pending`,
            text: `⏳ Store Pending! Your store onboarding is pending admin approval.`,
            read: false,
            time: 'Pending',
            type: 'store'
          });
        }
      }

      // 2. KYC Status Notification
      if (profile?.verification_status) {
        const verStatus = profile.verification_status;
        if (verStatus === 'Verified') {
          list.push({
            id: `kyc-status-verified`,
            text: `📄 KYC Verified! Your identity verification has been approved.`,
            read: false,
            time: 'Verified',
            type: 'kyc'
          });
        } else if (verStatus === 'Under Review') {
          list.push({
            id: `kyc-status-review`,
            text: `📄 KYC Under Review: Your verification documents are currently being processed.`,
            read: false,
            time: 'Review',
            type: 'kyc'
          });
        } else if (verStatus === 'Rejected') {
          list.push({
            id: `kyc-status-rejected`,
            text: `❌ KYC Rejected: Your verification was rejected. Please update your documents.`,
            read: false,
            time: 'Rejected',
            type: 'kyc'
          });
        }
      }

      // 3. Payout Requests Notifications (limit to 3 most recent)
      const recentPayouts = payouts.slice(0, 3);
      recentPayouts.forEach(p => {
        let text = '';
        if (p.status === 'completed') {
          text = `💳 Payout Completed: ₹${parseFloat(p.amount).toLocaleString()} has been successfully settled.`;
        } else if (p.status === 'rejected') {
          text = `❌ Payout Rejected: Payout request of ₹${parseFloat(p.amount).toLocaleString()} was rejected.`;
        } else {
          text = `⏳ Payout Pending: Withdrawal request of ₹${parseFloat(p.amount).toLocaleString()} is pending admin review.`;
        }
        list.push({
          id: `payout-${p.id}`,
          text,
          read: false,
          time: p.requested_at ? new Date(p.requested_at).toLocaleDateString() : 'Recent',
          type: 'payout'
        });
      });

      // 4. Sales/Earnings Notifications (limit to 3 most recent Sale Credits)
      const saleCredits = transactions.filter(t => t.type === 'Sale Credit').slice(0, 3);
      saleCredits.forEach(s => {
        const orderRef = s.reference_id ? s.reference_id.substring(0, 8) : 'N/A';
        list.push({
          id: `sale-${s.id}`,
          text: `🛍️ New Sale! You earned ₹${parseFloat(s.amount).toLocaleString()} from order #${orderRef}.`,
          read: false,
          time: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Recent',
          type: 'sale'
        });
      });

      // Load read notifications list from localStorage to maintain unread counts
      const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${creatorId}`) || '[]');
      const processedList = list.map(item => ({
        ...item,
        read: readNotifications.includes(item.id)
      }));

      setNotifications(processedList);
    } catch (e) {
      console.error('Error generating real notifications:', e);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Toggle single notification read state
  const toggleRead = (id) => {
    if (!store?.creator_id) return;
    const creatorId = store.creator_id;
    const readNotifications = JSON.parse(localStorage.getItem(`read_notifications_${creatorId}`) || '[]');
    if (!readNotifications.includes(id)) {
      readNotifications.push(id);
      localStorage.setItem(`read_notifications_${creatorId}`, JSON.stringify(readNotifications));
    }
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Mark all notifications as read
  const markAllAsRead = (e) => {
    e.stopPropagation();
    if (!store?.creator_id) return;
    const creatorId = store.creator_id;
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(`read_notifications_${creatorId}`, JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/';
    }
  };

  // Click outside detection to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.navbar}>
      <div className={styles.navLeft}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>{title || 'Dashboard'}</h1>
          {breadcrumbs && (
            <div className={styles.breadcrumbs}>
              {breadcrumbs.map((bc, index) => (
                <div key={index} className={styles.breadcrumbItem}>
                  {index > 0 && (
                    <svg className={styles.separator} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  )}
                  <span className={bc.active ? styles.activeBc : ''}>{bc.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.navRight}>
        <div className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notification Bell Dropdown */}
        <div className={styles.navDropdownWrapper} ref={notificationRef}>
          <button 
            className={`${styles.notificationBtn} ${hasUnread ? styles.hasUnread : ''}`}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>
          
          {notificationsOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <h3>Notifications</h3>
                {hasUnread && (
                  <button onClick={markAllAsRead} className={styles.clearAllBtn}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className={styles.dropdownContent}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyState}>No notifications</div>
                ) : (
                  <div className={styles.notificationsList}>
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`${styles.notificationItem} ${!n.read ? styles.unread : ''}`}
                        onClick={() => toggleRead(n.id)}
                      >
                        <div className={styles.notificationMain}>
                          <span className={styles.dot}></span>
                          <p>{n.text}</p>
                        </div>
                        <span className={styles.time}>{n.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className={styles.navDropdownWrapper} ref={profileRef}>
          <div 
            className={styles.profile}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" />
            ) : (
              <div className={styles.navbarAvatar}>{avatarLetter}</div>
            )}
          </div>

          {profileOpen && (
            <div className={`${styles.dropdownMenu} ${styles.profileDropdown}`}>
              <div className={styles.profileDropdownHeader}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className={styles.largeAvatar} />
                ) : (
                  <div className={`${styles.navbarAvatar} ${styles.largeAvatarLetter}`}>{avatarLetter}</div>
                )}
                <div className={styles.profileDropdownMeta}>
                  <h4>{profile?.full_name || profile?.name || 'Creator'}</h4>
                  <span>{user?.email}</span>
                </div>
              </div>
              <div className={styles.dropdownDivider}></div>
              <ul className={styles.profileDropdownLinks}>
                <li>
                  <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Profile Settings
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/wallet" onClick={() => setProfileOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    Wallet & Earnings
                  </Link>
                </li>
                <li>
                  <a 
                    href={`/store/${storeSlug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => setProfileOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    View Storefront
                  </a>
                </li>
              </ul>
              <div className={styles.dropdownDivider}></div>
              <button onClick={handleLogout} className={styles.logoutDropdownBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}