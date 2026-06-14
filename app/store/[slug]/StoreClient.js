'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';
import { useLoading } from '@/components/TopLoader';
import PageLoader from '@/components/PageLoader';

export default function StoreClient({ slug, initialStoreDetails, initialProducts, initialCategories }) {
  const { selectedCategory, setSelectedCategory, searchQuery } = useStore();
  const { startLoading, completeLoading } = useLoading();
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [storeDetails, setStoreDetails] = useState(initialStoreDetails);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStoreDetails(initialStoreDetails);
    setProducts(initialProducts || []);
    setCategories(initialCategories || []);
  }, [initialStoreDetails, initialProducts, initialCategories]);

  if (!storeDetails) {
    return (
      <div className="store-not-found-screen">
        <div className="glass-card">
          <h2>Store Not Found 🔍</h2>
          <p>We couldn't find an active store with the link <strong>/store/{slug}</strong>. Please check the spelling or contact the owner.</p>
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
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
          .glass-card h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #f43f5e, #fb7185);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
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
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
          }
        `}</style>
      </div>
    );
  }

  if (storeDetails && storeDetails.status && ['rejected', 'disabled'].includes(storeDetails.status)) {
    return (
      <div className="pending-store-screen">
        <div className="glass-card">
          <h2>Store Setup In Progress 🛠️</h2>
          <p>The online store <strong>{storeDetails.name}</strong> is currently pending platform approval or is under maintenance. Please check back later!</p>
          <Link href="/" className="back-link">Return to Home</Link>
        </div>
        <style jsx>{`
          .pending-store-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            padding: 20px;
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
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
          .glass-card h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #a78bfa, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .back-link {
            display: inline-block;
            padding: 12px 24px;
            background: #8b5cf6;
            color: #fff;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }
        `}</style>
      </div>
    );
  }

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
      <Navbar storeName={storeDetails?.name} logoUrl={storeDetails?.logo_url || storeDetails?.logo} />
      <Hero 
        bannerUrl={storeDetails?.banner_url || storeDetails?.banner}
        storeName={storeDetails?.name}
        description={storeDetails?.description}
      />

      <div className="container main-content">
        {/* Categories Section */}
        <section className="section-wrapper categories-section">
          <div className="section-header">
            <h2 className="section-title">Explore Categories</h2>
            <p className="section-subtitle">Curated collections for your lifestyle.</p>
          </div>
          <div className="categories-grid">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div className="skeleton-category-card" key={i}>
                  <div className="skeleton-image shim"></div>
                  <div className="skeleton-title shim"></div>
                </div>
              ))
            ) : (
              categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </section>

        {/* Featured Products (Only show when no active filtering) */}
        {!searchQuery && selectedCategory === 'All' && !loading && (
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
                <ProductCard key={product.id} product={product} />
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
              {loading ? 'Searching catalog...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'} found`}
            </p>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => (
                <div className="skeleton-product-card" key={i}>
                  <div className="skeleton-product-image shim"></div>
                  <div className="skeleton-product-cat shim"></div>
                  <div className="skeleton-product-name shim"></div>
                  <div className="skeleton-product-price shim"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or category filters.</p>
              <button className="reset-btn" onClick={() => { setSelectedCategory('All'); window.location.reload(); }}>Reset Filters</button>
            </div>
          )}
        </section>
      </div>

      <Footer storeName={storeDetails?.name} />

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

        .loading-state, .empty-state {
          padding: 80px 0;
          text-align: center;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
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
        }

        @media (max-width: 1024px) {
          .categories-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .products-grid {
            grid-template-columns: repeat(3, 1fr);
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

        @media (max-width: 480px) {
          .categories-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        /* Skeleton Shimmer Styles */
        .skeleton-category-card {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }
        .skeleton-category-card .skeleton-image {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #e2e8f0;
        }
        .skeleton-category-card .skeleton-title {
          width: 60px;
          height: 14px;
          border-radius: 4px;
          background: #e2e8f0;
        }
        .skeleton-product-card {
          background: #fff;
          border-radius: 16px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }
        .skeleton-product-card .skeleton-product-image {
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: 12px;
          background: #e2e8f0;
        }
        .skeleton-product-card .skeleton-product-cat {
          width: 40%;
          height: 10px;
          border-radius: 4px;
          background: #e2e8f0;
        }
        .skeleton-product-card .skeleton-product-name {
          width: 80%;
          height: 16px;
          border-radius: 4px;
          background: #e2e8f0;
        }
        .skeleton-product-card .skeleton-product-price {
          width: 30%;
          height: 14px;
          border-radius: 4px;
          background: #e2e8f0;
        }
        
        .shim {
          position: relative;
          overflow: hidden;
        }
        .shim::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.6) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
          content: '';
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </main>
  );
}
