'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { demoStores } from '@/lib/demoData';

export default function Navbar({ storeName, logoUrl }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount, searchQuery, setSearchQuery } = useStore();
  const { customer, customerProfile, logout } = useCustomerAuth();
  const user = customer;
  const profile = customerProfile;
  const signOut = logout;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const pathParts = pathname ? pathname.split('/') : [];
  const isDemo = pathParts[1] === 'demo-store';
  const isStorePage = (pathParts[1] === 'store' || isDemo) && pathParts[2];
  const storeSlug = isStorePage ? pathParts[2] : null;
  const storeLogo = logoUrl || (isDemo && storeSlug ? demoStores[storeSlug]?.logo : null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (storeSlug) {
      localStorage.setItem('last_visited_store', storeSlug);
    }
  }, [storeSlug]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If user starts typing and is not on home page, redirect to home
    if (value.trim() !== '') {
      const homePath = storeSlug ? `/${pathParts[1]}/${storeSlug}` : '/';
      if (pathname !== homePath) {
        router.push(homePath);
      }
    }
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="container nav-container dashboard-card glass">
        <div className="nav-main">
          <Link href={storeSlug ? `/${pathParts[1]}/${storeSlug}` : "/"} className="logo">
            {storeLogo && (
              <img 
                src={storeLogo} 
                alt={`${storeName} Logo`} 
                className="logo-img" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            )}
            <span>{storeName || 'Online Store'}</span>
          </Link>

          <form className="search-container desktop-search" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <div className="search-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
          </form>

          <div className="nav-actions">
            {!isDemo && (
              <div className="user-dropdown-container">
                <button 
                  className="action-btn user-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="User profile menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </button>
                {isDropdownOpen && (
                  <div className="dropdown-menu glass">
                    {user ? (
                      <>
                        <div className="dropdown-header">
                          <div className="dropdown-name">{profile?.full_name || 'Customer'}</div>
                          <div className="dropdown-email">{user.email}</div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <Link href={storeSlug ? `/customer/profile?store=${storeSlug}` : "/customer/profile"} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          My Profile
                        </Link>
                        <Link href={storeSlug ? `/customer/orders?store=${storeSlug}` : "/customer/orders"} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          My Orders
                        </Link>
                        <Link href={storeSlug ? `/customer/addresses?store=${storeSlug}` : "/customer/addresses"} className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                          My Addresses
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button 
                          className="dropdown-item logout-btn" 
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link 
                          href={storeSlug ? `/customer/login?redirect=/store/${storeSlug}` : "/customer/login"} 
                          className="dropdown-item" 
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Login
                        </Link>
                        <Link 
                          href={storeSlug ? `/customer/signup?redirect=/store/${storeSlug}` : "/customer/signup"} 
                          className="dropdown-item" 
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            <Link href={storeSlug ? `/${pathParts[1]}/${storeSlug}/cart` : "/cart"} className="action-btn cart-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Mobile Search - Only visible on small screens */}
        <form className="mobile-search" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
        </form>
      </nav>

      <style jsx>{`
        .navbar-wrapper {
          position: fixed;
          top: ${pathname?.includes('/demo-store') ? '48px' : '0px'};
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 20px 0;
          transition: var(--transition-smooth);
        }

        .navbar-wrapper.scrolled {
          padding: 12px 0;
        }

        @media (max-width: 900px) {
          .navbar-wrapper {
            top: ${pathname?.includes('/demo-store') ? '76px' : '0px'};
          }
        }

        .nav-container {
          display: flex;
          flex-direction: column;
          padding: 12px 24px;
          border-radius: 40px;
          margin: 0 auto;
          transition: var(--transition-smooth);
          gap: 0;
        }

        .nav-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--primary);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(0, 0, 0, 0.08);
          flex-shrink: 0;
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
          margin: 0 30px;
        }

        .mobile-search {
          display: none;
          position: relative;
          width: 100%;
          margin-top: 12px;
        }

        .search-input {
          width: 100%;
          padding: 10px 20px 10px 48px;
          border-radius: 30px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          background: var(--bg-main);
          font-size: 14px;
          transition: var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          background: var(--white);
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-sub);
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-dropdown-container {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 220px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: var(--shadow-lg);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 1100;
          animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .dropdown-header {
          padding: 8px 12px 10px;
        }

        .dropdown-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-email {
          font-size: 11px;
          color: var(--text-sub);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.06);
          margin: 6px 0;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-main);
          border-radius: var(--radius-sm);
          transition: var(--transition-fast);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.04);
          color: var(--accent);
        }

        .logout-btn {
          color: #dc2626;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
        }

        .action-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          transition: var(--transition-fast);
        }

        .action-btn:hover {
          background: var(--bg-main);
          color: var(--accent);
          transform: scale(1.05);
        }

        .badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: var(--accent);
          color: var(--white);
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
        }

        @media (max-width: 768px) {
          .navbar-wrapper {
            padding: 10px 15px;
          }
          .navbar-wrapper.scrolled {
            padding: 8px 15px;
          }
          .nav-container {
            padding: 10px 16px;
            border-radius: 30px;
          }
          .desktop-search {
            display: none;
          }
          .mobile-search {
            display: block;
          }
          .search-input {
            padding: 8px 16px 8px 36px;
            font-size: 13px;
          }
          .search-icon {
            left: 12px;
          }
          .logo {
            font-size: 18px;
          }
          .action-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </header>
  );
}
