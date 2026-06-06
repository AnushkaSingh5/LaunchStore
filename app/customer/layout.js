'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import PageLoader from '@/components/PageLoader';

export default function CustomerPortalLayout({ children }) {
  const { customer, customerProfile, loading, logout } = useCustomerAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [backToStoreSlug, setBackToStoreSlug] = useState(null);

  useEffect(() => {
    // 1. Try to get store from URL search params
    const params = new URLSearchParams(window.location.search);
    let slug = params.get('store');

    // 2. Try to get store from referrer if it contains /store/
    if (!slug && typeof document !== 'undefined') {
      const referrer = document.referrer;
      if (referrer && referrer.includes('/store/')) {
        const parts = referrer.split('/store/');
        if (parts[1]) {
          const extracted = parts[1].split('/')[0].split('?')[0];
          if (extracted) {
            slug = extracted;
          }
        }
      }
    }

    // 3. Fallback to localStorage
    if (!slug) {
      slug = localStorage.getItem('last_visited_store');
    }

    // 4. Save and update state if found
    if (slug) {
      localStorage.setItem('last_visited_store', slug);
      setBackToStoreSlug(slug);
    }
  }, [pathname]);

  const isPublicRoute = pathname === '/customer/login' || pathname === '/customer/signup';

  useEffect(() => {
    if (isPublicRoute) return;
    if (!loading && (!customer || !customerProfile)) {
      router.push('/customer/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [customer, customerProfile, loading, router, pathname]);


  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading || !customer || !customerProfile) {
    return <PageLoader />;
  }

  const navItems = [
    { name: 'Personal Details', path: '/customer/profile', icon: '👤' },
    { name: 'My Orders', path: '/customer/orders', icon: '📦' },
    { name: 'Address Book', path: '/customer/addresses', icon: '📍' },
  ];

  return (
    <div className="profile-dashboard">
      <div className="profile-container container">
        <aside className="profile-sidebar dashboard-card">
          <div className="sidebar-header">
            <div className="avatar-placeholder">
              {customerProfile.full_name ? customerProfile.full_name[0].toUpperCase() : 'C'}
            </div>
            <div className="user-details">
              <h3>{customerProfile.full_name || 'Customer'}</h3>
              <p>{customer.email}</p>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={backToStoreSlug ? `${item.path}?store=${backToStoreSlug}` : item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
            
            <div className="nav-divider"></div>
            
            <Link href={backToStoreSlug ? `/store/${backToStoreSlug}` : "/"} className="nav-item home-link">
              <span className="nav-icon">🛍️</span>
              Back to Shopping
            </Link>
            
            <button onClick={logout} className="nav-item logout-btn">
              <span className="nav-icon">🚪</span>
              Sign Out
            </button>
          </nav>
        </aside>

        <main className="profile-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .profile-dashboard {
          min-height: 100vh;
          background: var(--bg-main, #f8f9fb);
          padding: 80px 0;
          font-family: 'Outfit', sans-serif;
        }

        .profile-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          align-items: start;
          margin-top: 40px;
        }

        .profile-sidebar {
          background: var(--white, #ffffff);
          border-radius: var(--radius-lg, 24px);
          padding: 30px 24px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .avatar-placeholder {
          width: 52px;
          height: 52px;
          background: rgba(37, 99, 235, 0.1);
          color: var(--accent, #2563eb);
          font-size: 20px;
          font-weight: 700;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-details h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }

        .user-details p {
          font-size: 12px;
          color: var(--text-sub, #64748b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-sub, #64748b);
          border-radius: 12px;
          transition: var(--transition-fast, all 0.2s);
          text-decoration: none;
          background: transparent;
          border: none;
          text-align: left;
          width: 100%;
          cursor: pointer;
        }

        .nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: var(--text-main, #1d1d1f);
        }

        .nav-item.active {
          background: rgba(37, 99, 235, 0.08);
          color: var(--accent, #2563eb);
        }

        .nav-icon {
          font-size: 16px;
        }

        .nav-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 12px 0;
        }

        .home-link:hover {
          color: var(--accent, #2563eb);
          background: rgba(37, 99, 235, 0.04);
        }

        .logout-btn:hover {
          color: #dc2626;
          background: rgba(220, 38, 38, 0.05);
        }

        .profile-content {
          min-width: 0;
        }

        @media (max-width: 991px) {
          .profile-container {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .profile-sidebar {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
