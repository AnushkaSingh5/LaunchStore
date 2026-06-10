'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import DemoStoreBanner from '@/components/DemoStoreBanner';
import { useStore } from '@/context/StoreContext';
import { demoStores } from '@/lib/demoData';

export default function DemoStoreClientPage({ slug }) {
  const { selectedCategory, setSelectedCategory, searchQuery } = useStore();
  const [storeDetails, setStoreDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory('All');
  }, [slug, setSelectedCategory]);

  useEffect(() => {
    setLoading(true);
    const details = demoStores[slug];
    if (details) {
      setStoreDetails(details);
    }
    setLoading(false);
  }, [slug]);

  if (loading && !storeDetails) {
    return (
      <div className="loading-screen">
        <p>Loading Demo Store...</p>
      </div>
    );
  }

  if (!storeDetails) {
    return (
      <div className="store-not-found-screen">
        <div className="glass-card">
          <h2>Demo Store Not Found 🔍</h2>
          <p>We couldn't find a demo store matching the link <strong>/demo-store/{slug}</strong>.</p>
          <Link href="/" className="back-link">Return to Home</Link>
        </div>
        <style jsx>{`
          .store-not-found-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            padding: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            max-width: 480px;
            text-align: center;
            color: #fff;
          }
          .glass-card h2 {
            font-size: 24px;
            margin-bottom: 16px;
            color: #f43f5e;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            margin-bottom: 28px;
          }
          .back-link {
            display: inline-block;
            padding: 12px 24px;
            background: #e11d48;
            color: #fff;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
          }
        `}</style>
      </div>
    );
  }

  const products = storeDetails.products || [];
  const categories = storeDetails.categories || [];

  const filteredProducts = products.filter((product) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = !q ||
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);

  return (
    <main className="dashboard-store">
      <DemoStoreBanner />
      <Navbar storeName={storeDetails.name} />
      <Hero 
        bannerUrl={storeDetails.banner}
        storeName={storeDetails.name}
        description={storeDetails.description}
      />

      <div className="container main-content">
        {/* Categories Section */}
        <section className="section-wrapper categories-section">
          <div className="section-header">
            <h2 className="section-title">Explore Categories</h2>
            <p className="section-subtitle">Curated collections for your lifestyle.</p>
          </div>
          <div className="categories-grid">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {!searchQuery && selectedCategory === 'All' && (
          <section className="section-wrapper dashboard-card section-card">
            <div className="section-header align-left">
              <div className="title-box">
                <h2 className="section-title">Featured Items</h2>
                <span className="live-badge">Best Sellers</span>
              </div>
              <p className="section-subtitle">Premium pieces selected for this showcase.</p>
            </div>
            <div className="products-grid">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={{ ...product, store_slug: slug }} />
              ))}
            </div>
          </section>
        )}

        {/* Main Product Grid */}
        <section className="section-wrapper dashboard-card section-card alt-bg">
          <div className="section-header">
            <h2 className="section-title">
              {selectedCategory === 'All' ? 'Discover All Products' : `${selectedCategory} Collection`}
              {searchQuery && ` - Results for "${searchQuery}"`}
            </h2>
            <p className="section-subtitle">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={{ ...product, store_slug: slug }} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or category filters.</p>
              <button className="reset-btn" onClick={() => setSelectedCategory('All')}>Reset Filters</button>
            </div>
          )}
        </section>
      </div>

      <Footer storeName={storeDetails.name} />

      <style jsx>{`
        .dashboard-store {
          background: var(--bg-main);
          min-height: 100vh;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 40px;
          padding-bottom: 80px;
          margin-top: 20px;
        }

        .section-wrapper {
          margin-bottom: 20px;
        }

        .section-card {
          padding: 60px;
          background: var(--white);
        }

        .section-card.alt-bg {
          background: linear-gradient(180deg, #ffffff 0%, #f0f4f8 100%);
        }

        .section-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .section-header.align-left {
          text-align: left;
        }

        .title-box {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 8px;
        }

        .live-badge {
          padding: 4px 12px;
          background: #dcfce7;
          color: #166534;
          font-size: 11px;
          font-weight: 700;
          border-radius: 20px;
          text-transform: uppercase;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -1px;
        }

        .section-subtitle {
          font-size: 16px;
          color: var(--text-sub);
          max-width: 500px;
          margin: 0 auto;
        }

        .align-left .section-subtitle {
          margin: 0;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-sub);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 0;
        }

        .empty-icon {
          font-size: 48px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
        }

        .empty-state p {
          color: var(--text-sub);
        }

        .reset-btn {
          margin-top: 20px;
          padding: 12px 24px;
          background: var(--primary);
          color: var(--white);
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }

        @media (max-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .main-content {
            gap: 20px;
          }
          .section-wrapper {
            margin-bottom: 0;
          }
          .categories-section {
            padding: 0;
          }
          .section-title {
            font-size: 22px;
            margin-bottom: 4px;
          }
          .section-subtitle {
            font-size: 13px;
          }
          .section-header {
            margin-bottom: 20px;
          }
          .categories-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .section-card {
            padding: 30px 12px;
            margin-top: 10px;
          }
          .title-box {
            justify-content: center;
          }
          .section-header.align-left {
            text-align: center;
          }
        }
      `}</style>
    </main>
  );
}
