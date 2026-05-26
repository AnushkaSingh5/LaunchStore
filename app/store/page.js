'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { storeService } from '@/services/storeService';

export default function StoreDirectoryPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const data = await storeService.getStores();
        const formatted = data.map((s, idx) => {
          const gradients = [
            'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)'
          ];
          const accents = ['#e11d48', '#2563eb', '#16a34a', '#db2777', '#8b5cf6'];
          const gradient = gradients[idx % gradients.length];
          const accent = accents[idx % accents.length];
          
          return {
            ...s,
            name: s.name,
            desc: s.description || 'Minimalist dynamic storefront curated for modern shopping.',
            slug: s.slug,
            image: s.banner_url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
            logo: s.logo_url,
            bgColor: gradient,
            accentColor: accent,
            type: s.status === 'approved' ? 'Official Store' : 'Active Store'
          };
        });
        setStores(formatted);
      } catch (err) {
        console.error('Failed to fetch stores:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="directory-page">
      <Navbar />

      <main className="container main-content fade-in">
        <div className="header-row">
          <h1>Explore Platform Stores</h1>
          <p>Discover beautiful online storefronts built entirely using LaunchCart.</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading stores from database...</p>
          </div>
        ) : stores.length > 0 ? (
          <div className="grid">
            {stores.map((store, i) => (
              <div key={i} className="store-card dashboard-card">
                <div className="visual-header" style={{ background: store.bgColor }}>
                  <img src={store.image} alt={store.name} className="store-img" />
                  {store.logo ? (
                    <img src={store.logo} alt={`${store.name} Logo`} className="store-logo-badge" />
                  ) : (
                    <span className="store-emoji">🏪</span>
                  )}
                  <span className="store-tag" style={{ color: store.accentColor, background: '#ffffffcc' }}>
                    {store.type}
                  </span>
                </div>

                <div className="content">
                  <h3>{store.name}</h3>
                  <p>{store.desc}</p>
                  <div className="footer-row">
                    <Link 
                      href={`/store/${store.slug}`} 
                      className="demo-link"
                      style={{ '--accent-hover': store.accentColor }}
                    >
                      Explore Shop
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No stores launched yet</h3>
            <p>Be the first to launch a store by signing up today!</p>
          </div>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .directory-page {
          background: var(--bg-main);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .main-content {
          padding-top: 140px;
          padding-bottom: 80px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .header-row {
          text-align: center;
        }

        .header-row h1 {
          font-size: 38px;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .header-row p {
          font-size: 16px;
          color: var(--text-sub);
          max-width: 500px;
          margin: 0 auto;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          width: 100%;
        }

        .store-card {
          background: var(--white);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .visual-header {
          height: 220px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .store-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .store-card:hover .store-img {
          transform: scale(1.05);
        }

        .store-emoji {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .store-logo-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          width: 42px;
          height: 42px;
          background: #ffffff;
          border-radius: 12px;
          padding: 4px;
          object-fit: contain;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          border: 1px solid #f1f5f9;
          z-index: 10;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .loading-state p {
          color: var(--text-sub);
          font-size: 15px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .store-tag {
          position: absolute;
          bottom: 16px;
          right: 16px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        .content {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .content h3 {
          font-size: 22px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.5px;
        }

        .content p {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-sub);
          flex: 1;
        }

        .footer-row {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-top: 12px;
        }

        .demo-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .demo-link:hover {
          color: var(--accent-hover, var(--accent));
          transform: translateX(4px);
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }

        @media (max-width: 600px) {
          .visual-header {
            height: 180px;
          }
          .content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
