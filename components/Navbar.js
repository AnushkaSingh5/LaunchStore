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
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
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
        <Link href="/" className="logo">
          {storeData.name}
        </Link>

        <form className="search-container" onSubmit={(e) => e.preventDefault()}>
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
          <button className="action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
          <Link href="/cart" className="action-btn cart-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>

      <style jsx>{`
        .navbar-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 24px 0;
          transition: var(--transition-smooth);
        }

        .navbar-wrapper.scrolled {
          padding: 16px 0;
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          border-radius: 50px;
          margin: 0 auto;
        }

        .logo {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--primary);
        }

        .search-container {
          position: relative;
          flex: 1;
          max-width: 460px;
          margin: 0 40px;
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
          width: 44px;
          height: 44px;
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
          top: 6px;
          right: 6px;
          background: var(--accent);
          color: var(--white);
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--white);
        }

        @media (max-width: 768px) {
          .navbar-wrapper {
            padding: 12px 16px;
          }
          .search-container {
            display: none;
          }
          .nav-container {
            padding: 8px 16px;
          }
        }
      `}</style>
    </header>
  );
}
