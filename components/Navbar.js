'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '../context/StoreContext';
import { storeData } from '../data/mockData';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { cartCount, searchQuery, setSearchQuery } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If user starts typing and is not on home page, redirect to home
    if (value.trim() !== '' && pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="container nav-container dashboard-card glass">
        <div className="nav-main">
          <Link href="/" className="logo">
            {storeData.name}
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
            <button className="action-btn user-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
            <Link href="/cart" className="action-btn cart-btn">
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
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 20px 0;
          transition: var(--transition-smooth);
        }

        .navbar-wrapper.scrolled {
          padding: 12px 0;
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
