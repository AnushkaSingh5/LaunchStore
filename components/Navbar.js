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

  const handleMenuClick = (targetId) => {
    if (pathname !== (storeSlug ? `/${pathParts[1]}/${storeSlug}` : '/')) {
      router.push(storeSlug ? `/${pathParts[1]}/${storeSlug}#${targetId}` : `/#${targetId}`);
      return;
    }
    
    if (targetId === 'shop') {
      setSearchQuery('');
      setSelectedCategory('All');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="container nav-container">
        <div className="nav-main">
          {/* Logo / Brand Name */}
          <Link href={storeSlug ? `/${pathParts[1]}/${storeSlug}` : "/"} className="logo">
            {storeLogo ? (
              <img 
                src={storeLogo} 
                alt={`${storeName} Logo`} 
                className="logo-img" 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            ) : (
              <div className="logo-placeholder-dot"></div>
            )}
            <span>{storeName || 'AestheticStore'}</span>
          </Link>

          {/* Middle Nav Links */}
          <div className="nav-links">
            <button onClick={() => handleMenuClick('shop')} className="nav-link-btn">Shop</button>
            <button onClick={() => handleMenuClick('categories-section')} className="nav-link-btn">Categories</button>
            <button onClick={() => handleMenuClick('new-arrivals-section')} className="nav-link-btn">New Arrivals</button>
            <button onClick={() => handleMenuClick('trending-section')} className="nav-link-btn">Best Sellers</button>
            <button onClick={() => handleMenuClick('footer-section')} className="nav-link-btn">About Us</button>
          </div>

          {/* Right Action Area */}
          <div className="nav-actions-area">
            <form className="search-container desktop-search" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="text" 
                placeholder="Search products..." 
                className="search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className="search-submit-btn" type="button" aria-label="Search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </button>
            </form>

            <div className="nav-icons">
              {!isDemo && (
                <div className="user-dropdown-container">
                  <button 
                    className="action-btn user-btn"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-label="User profile menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search - Only visible on small screens */}
        <form className="mobile-search" onSubmit={(e) => e.preventDefault()}>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="search-submit-btn" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>
      </nav>

      <style jsx>{`
        .navbar-wrapper {
          position: fixed;
          top: ${pathname?.includes('/demo-store') ? '48px' : '0px'};
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 24px 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
        }

        .navbar-wrapper.scrolled {
          padding: 16px 0;
          background: rgba(250, 248, 245, 0.95);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02);
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
        }

        @media (max-width: 900px) {
          .navbar-wrapper {
            top: ${pathname?.includes('/demo-store') ? '76px' : '0px'};
          }
        }

        .nav-container {
          margin: 0 auto;
          width: 100%;
        }

        .nav-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 20px;
        }

        .logo {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.5px;
          color: #121212;
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Outfit', sans-serif;
        }

        .logo-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid rgba(0, 0, 0, 0.06);
          flex-shrink: 0;
        }

        .logo-placeholder-dot {
          width: 10px;
          height: 10px;
          background: #706f6c;
          border-radius: 50%;
        }

        /* Middle Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link-btn {
          font-size: 14px;
          font-weight: 500;
          color: #555350;
          transition: all 0.2s ease;
          position: relative;
          padding: 8px 0;
        }

        .nav-link-btn:hover {
          color: #121212;
        }

        .nav-link-btn::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 0;
          width: 100%;
          height: 1.5px;
          background: #121212;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.25s ease;
        }

        .nav-link-btn:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Right Actions */
        .nav-actions-area {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .search-container {
          position: relative;
          width: 240px;
          transition: width 0.3s ease;
        }

        .search-container:focus-within {
          width: 280px;
        }

        .search-input {
          width: 100%;
          padding: 10px 44px 10px 20px;
          border-radius: 40px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          background: #EFECE6;
          font-size: 13px;
          color: #121212;
          transition: all 0.25s ease;
        }

        .search-input:focus {
          outline: none;
          background: #FAF8F5;
          border-color: #121212;
          box-shadow: 0 0 0 3px rgba(18, 18, 18, 0.05);
        }

        .search-submit-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #706f6c;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-submit-btn:hover {
          color: #121212;
        }

        .nav-icons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #121212;
          position: relative;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: rgba(0, 0, 0, 0.03);
          transform: scale(1.05);
        }

        .badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #121212;
          color: #FAF8F5;
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #FAF8F5;
        }

        /* User Dropdown */
        .user-dropdown-container {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 220px;
          border-radius: 16px;
          background: #FAF8F5;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
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
          color: #121212;
          margin-bottom: 2px;
        }

        .dropdown-email {
          font-size: 11px;
          color: #706f6c;
        }

        .dropdown-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 6px 0;
        }

        .dropdown-item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 500;
          color: #555350;
          border-radius: 8px;
          transition: all 0.2s ease;
          background: transparent;
        }

        .dropdown-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: #121212;
        }

        .logout-btn {
          color: #dc2626;
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.05);
          color: #dc2626;
        }

        /* Mobile Layout */
        .mobile-search {
          display: none;
          position: relative;
          width: 100%;
          margin-top: 12px;
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
          .search-container.desktop-search {
            display: none;
          }
          .mobile-search {
            display: block;
          }
          .search-input {
            padding: 8px 36px 8px 16px;
            font-size: 12px;
          }
          .search-submit-btn {
            right: 12px;
          }
        }

        @media (max-width: 768px) {
          .navbar-wrapper {
            padding: 12px 16px;
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
