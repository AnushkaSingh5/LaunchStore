'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import DemoStoreBanner from '@/components/DemoStoreBanner';
import { useStore } from '@/context/StoreContext';
import { demoStores } from '@/lib/demoData';
import { getDefaultStoreData } from '@/lib/defaultStoreData';

export default function DemoStoreClientPage({ slug }) {
  const { selectedCategory, setSelectedCategory, searchQuery } = useStore();
  const [storeDetails, setStoreDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const categoriesRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const scrollAmount = 300;
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

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
            background: #FAF8F5;
            padding: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .glass-card {
            background: #ffffff;
            border: 1px solid rgba(0,0,0,0.06);
            border-radius: 24px;
            padding: 40px;
            max-width: 480px;
            text-align: center;
            color: #121212;
            box-shadow: 0 10px 30px rgba(0,0,0,0.03);
          }
          .glass-card h2 {
            font-size: 24px;
            color: #ef4444;
            font-family: 'Outfit', sans-serif;
            margin-bottom: 16px;
          }
          .glass-card p {
            font-size: 14px;
            color: #706f6c;
            margin-bottom: 28px;
          }
          .back-link {
            display: inline-block;
            padding: 12px 24px;
            background: #121212;
            color: #FAF8F5;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
          }
          .back-link:hover {
            background: #232724;
          }
        `}</style>
      </div>
    );
  }

  const rawProducts = storeDetails.products || [];
  const rawCategories = storeDetails.categories || [];

  // Fallback checks for demo stores as well
  const fallback = getDefaultStoreData(storeDetails.name, storeDetails.description);
  const hasNoData = rawProducts.length === 0;
  const products = hasNoData ? fallback.products : rawProducts;
  const categories = hasNoData 
    ? [
        { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' },
        ...fallback.categories.map(c => ({ id: c.id, title: c.title, image: c.image, count: c.count, icon: c.icon }))
      ] 
    : rawCategories;

  const categoryTitle = fallback.categoryTitle || 'Shop By Space';
  const categorySubtitle = fallback.categorySubtitle || 'Find the perfect pieces for every corner.';
  const arrivalsTitle = fallback.arrivalsTitle || 'Fresh Finds for Beautiful Spaces';
  const arrivalsSubtitle = fallback.arrivalsSubtitle || 'Explore our latest additions, thoughtfully curated to inspire your home.';

  // Filter
  const filteredProducts = products.filter((product) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = !q ||
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Dynamic count calculation
  const categoriesWithCount = categories.map(cat => {
    if (cat.id === 'all') {
      return { ...cat, productCount: products.length };
    }
    const count = products.filter(p => p.category === cat.title || p.category_id === cat.id).length;
    return { ...cat, productCount: count || cat.count || 0 };
  });

  // Fresh Finds: featured items, or first 3
  const freshFindsProducts = products.filter(p => p.featured).slice(0, 3);
  if (freshFindsProducts.length === 0) {
    freshFindsProducts.push(...products.slice(0, 3));
  }

  // Trending Now: items marked as trending or non-featured
  const trendingProducts = products.filter(p => p.trending).slice(0, 4);
  if (trendingProducts.length === 0) {
    trendingProducts.push(...products.slice(0, 4));
  }

  const isFilteringActive = searchQuery !== '';

  return (
    <main className="dashboard-store">
      <DemoStoreBanner />
      <Navbar storeName={storeDetails.name} logoUrl={storeDetails.logo} />
      
      <Hero 
        bannerUrl={storeDetails.banner}
        storeName={storeDetails.name}
        description={storeDetails.description}
      />

      <div className="container main-content">
        {isFilteringActive ? (
          <section className="catalog-search-section">
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
        ) : (
          <>
            <section className="categories-section" id="categories-section">
              <div className="section-header">
                <div className="header-meta">
                  <h2 className="section-title">{categoryTitle}</h2>
                  <span className="accent-underline"></span>
                </div>
                <p className="section-subtitle">{categorySubtitle}</p>
              </div>
              
              <div className="carousel-wrapper">
                <button 
                  className="carousel-nav-btn left" 
                  onClick={() => scrollCategories('left')}
                  aria-label="Scroll categories left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <div className="categories-carousel-track" ref={categoriesRef}>
                  {categoriesWithCount.filter(c => c.id !== 'all').map(category => (
                    <div key={category.id} className="carousel-item-card">
                      <CategoryCard 
                        category={category} 
                        productCount={category.productCount} 
                      />
                    </div>
                  ))}
                </div>

                <button 
                  className="carousel-nav-btn right" 
                  onClick={() => scrollCategories('right')}
                  aria-label="Scroll categories right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </section>

            {/* 2. New Arrivals (Fresh Finds) Split Banner */}
            <section className="new-arrivals-banner-section" id="new-arrivals-section">
              <div className="new-arrivals-grid">
                <div className="arrivals-info-pane">
                  <span className="pane-tag">New Arrivals</span>
                  <h2 className="pane-title">{arrivalsTitle}</h2>
                  <p className="pane-desc">{arrivalsSubtitle}</p>
                  <button onClick={() => {
                    const el = document.getElementById('trending-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} className="pane-discover-btn">
                    Discover Now <span className="arrow">→</span>
                  </button>
                </div>
                
                <div className="arrivals-products-pane">
                  {freshFindsProducts.map(product => (
                    <ProductCard key={product.id} product={{ ...product, store_slug: slug }} />
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Value Proposition Bar */}
            <div className="value-props-bar">
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div className="value-text">
                  <span className="value-title">Premium Quality</span>
                  <span className="value-desc">Carefully selected</span>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
                <div className="value-text">
                  <span className="value-title">Free Shipping</span>
                  <span className="value-desc">On all orders</span>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                </div>
                <div className="value-text">
                  <span className="value-title">Easy Returns</span>
                  <span className="value-desc">30-day returns</span>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div className="value-text">
                  <span className="value-title">Secure Payments</span>
                  <span className="value-desc">100% protected</span>
                </div>
              </div>
              <div className="value-item">
                <div className="value-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div className="value-text">
                  <span className="value-title">Dedicated Support</span>
                  <span className="value-desc">We're here to help</span>
                </div>
              </div>
            </div>

            {/* 4. Trending Now grid */}
            <section className="trending-section" id="trending-section">
              <div className="section-header">
                <div className="header-meta">
                  <h2 className="section-title">Trending Now</h2>
                  <span className="accent-underline"></span>
                </div>
                <p className="section-subtitle">Most-loved pieces by our customers.</p>
                <button onClick={() => setSelectedCategory('All')} className="section-action-link">
                  View All Products <span className="link-arrow">→</span>
                </button>
              </div>

              <div className="products-grid-4">
                {trendingProducts.map(product => (
                  <ProductCard key={product.id} product={{ ...product, store_slug: slug }} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <Footer storeName={storeDetails.name} description={storeDetails.description} />

      <style jsx>{`
        .dashboard-store {
          background: #FAF8F5; /* Warm aesthetic cream background */
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 80px;
          padding-bottom: 80px;
          margin-top: 20px;
        }

        section {
          padding: 20px 0;
        }

        /* Section Headers */
        .section-header {
          margin-bottom: 48px;
          text-align: center;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .header-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .section-title {
          font-size: clamp(28px, 4vw, 36px);
          font-weight: 700;
          color: #121212;
          font-family: 'Outfit', sans-serif;
          letter-spacing: -0.5px;
        }

        .accent-underline {
          width: 60px;
          height: 1.5px;
          background: #232724;
        }

        .section-subtitle {
          font-size: 14px;
          color: #706f6c;
          max-width: 500px;
          margin: 0 auto;
        }

        .section-action-link {
          font-size: 13px;
          font-weight: 600;
          color: #121212;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 12px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
        }

        .section-action-link:hover {
          color: #706f6c;
        }

        .link-arrow {
          transition: transform 0.2s ease;
        }

        .section-action-link:hover .link-arrow {
          transform: translateX(3px);
        }

        /* Categories Carousel Slider */
        .carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .categories-carousel-track {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none; /* Firefox */
          padding: 12px 0;
          width: 100%;
        }

        .categories-carousel-track::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }

        .carousel-item-card {
          width: 240px;
          flex-shrink: 0;
        }

        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.9);
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          color: #121212;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .carousel-nav-btn:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }

        .carousel-nav-btn.left {
          left: -22px;
        }

        .carousel-nav-btn.right {
          right: -22px;
        }

        /* New Arrivals Dark Banner Section */
        .new-arrivals-banner-section {
          background: #2D322F; /* Dark charcoal olive */
          border-radius: 24px;
          padding: 64px;
          color: #FAF8F5;
        }

        .new-arrivals-grid {
          display: grid;
          grid-template-columns: 4.2fr 7.8fr;
          gap: 48px;
          align-items: center;
        }

        .arrivals-info-pane {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .pane-tag {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #A39E93;
          margin-bottom: 16px;
        }

        .pane-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(26px, 3vw, 36px);
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 16px;
        }

        .pane-desc {
          font-size: 13px;
          color: #C1BCB2;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .pane-discover-btn {
          align-self: flex-start;
          background: #FAF8F5;
          color: #232724;
          padding: 12px 28px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .pane-discover-btn:hover {
          background: #EFECE6;
          transform: translateY(-2px);
        }

        .pane-discover-btn .arrow {
          transition: transform 0.2s ease;
        }

        .pane-discover-btn:hover .arrow {
          transform: translateX(3px);
        }

        .arrivals-products-pane {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        /* Value Props Bar */
        .value-props-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #EFECE6;
          border-radius: 20px;
          padding: 24px 48px;
          gap: 24px;
          flex-wrap: wrap;
        }

        .value-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .value-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(35, 39, 36, 0.04);
          color: #232724;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .value-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .value-title {
          font-size: 12px;
          font-weight: 600;
          color: #121212;
        }

        .value-desc {
          font-size: 10px;
          color: #706f6c;
        }

        /* Products Grid (4 Columns) */
        .products-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        /* Catalog search active state */
        .catalog-search-section {
          padding-top: 40px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 80px 0;
          text-align: center;
        }

        .empty-icon {
          font-size: 48px;
        }

        .empty-state h3 {
          font-size: 24px;
          font-weight: 700;
          font-family: 'Outfit', sans-serif;
        }

        .empty-state p {
          color: #706f6c;
          font-size: 14px;
        }

        .reset-btn {
          margin-top: 20px;
          padding: 12px 28px;
          background: #121212;
          color: #FAF8F5;
          border-radius: 30px;
          font-weight: 600;
          font-size: 13px;
        }

        .reset-btn:hover {
          background: #232724;
          transform: translateY(-2px);
        }

        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: #706f6c;
          background: #FAF8F5;
        }

        /* Responsive breakpoints */
        @media (max-width: 1024px) {
          .carousel-item-card {
            width: 220px;
          }
          .new-arrivals-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .arrivals-products-pane {
            grid-template-columns: repeat(3, 1fr);
          }
          .products-grid-4, .products-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .value-props-bar {
            justify-content: center;
            padding: 24px;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            gap: 60px;
          }
          .new-arrivals-banner-section {
            padding: 32px 24px;
          }
          .arrivals-products-pane {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .carousel-nav-btn {
            display: none;
          }
          .carousel-item-card {
            width: 180px;
          }
          .products-grid-4, .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          .value-props-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
            padding: 24px 32px;
          }
        }
      `}</style>
    </main>
  );
}
