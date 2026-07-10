'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import StoreUnderReview from '@/components/StoreUnderReview';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { getDefaultStoreData } from '@/lib/defaultStoreData';

export default function ProductsClient({ slug, initialStoreDetails, initialProducts, initialCategories }) {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [storeDetails, setStoreDetails] = useState(initialStoreDetails);
  const [sortBy, setSortBy] = useState(() => {
    const savedSort = initialStoreDetails?.theme_settings?.defaultSort;
    if (savedSort === 'price_asc') return 'price-asc';
    if (savedSort === 'price_desc') return 'price-desc';
    return 'default';
  });
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const categoryParam = searchParams ? searchParams.get('category') : null;

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam, setSelectedCategory]);

  const currentUserId = user?.id;
  const isCreator = currentUserId && currentUserId === storeDetails?.creator_id;

  useEffect(() => {
    setStoreDetails(initialStoreDetails);
    setProducts(initialProducts || []);
    setCategories(initialCategories || []);
  }, [initialStoreDetails, initialProducts, initialCategories]);

  // Dynamically load preview products on client side if creator is previewing an unapproved store
  useEffect(() => {
    if (storeDetails && storeDetails.status !== 'approved' && isCreator && products.length === 0) {
      const loadPreviewData = async () => {
        try {
          const [prodData, catData] = await Promise.all([
            productService.getProductsByStore(storeDetails.id, false),
            categoryService.getCategoriesByStore(storeDetails.id)
          ]);
          const safeCatData = catData || [];
          const mappedProducts = (prodData || []).map(p => {
            const categoryObj = safeCatData.find(c => c.id === p.category_id);
            return {
              ...p,
              category: categoryObj ? (categoryObj.name || categoryObj.title) : 'Uncategorized'
            };
          });
          setProducts(mappedProducts);
          setCategories([
            { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' },
            ...safeCatData
          ]);
        } catch (e) {
          console.error('[LaunchCart - ProductsClient] Failed to load preview data:', e);
        }
      };
      loadPreviewData();
    }
  }, [storeDetails, isCreator, products.length]);

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
            background: linear-gradient(135deg, #FAF8F5 0%, #EFECE6 100%);
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
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          }
          .glass-card h2 {
            font-size: 24px;
            font-weight: 750;
            margin-bottom: 16px;
            color: #ef4444;
          }
          .glass-card p {
            font-size: 14px;
            color: #706f6c;
            line-height: 1.6;
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
            transform: translateY(-2px);
            background: #232724;
          }
        `}</style>
      </div>
    );
  }

  // Block visitors from non-approved stores
  if (storeDetails && storeDetails.status !== 'approved' && !isCreator) {
    return (
      <StoreUnderReview 
        storeName={storeDetails.name} 
        status={storeDetails.status} 
        statusReason={storeDetails.status_reason} 
      />
    );
  }

  // Pre-calculate counts of products for each category pill
  const categoriesWithCount = categories.map(cat => {
    if (cat.id === 'all' || cat.title === 'All') {
      return { ...cat, productCount: products.length, displayTitle: 'All Products' };
    }
    const count = products.filter(p => p.category === cat.title || p.category_id === cat.id).length;
    return { ...cat, productCount: count, displayTitle: cat.title || cat.name };
  });

  // Filter products by selected category and search input
  const filteredProducts = products.filter((product) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = !q ||
      product.name.toLowerCase().includes(q) ||
      (product.category && product.category.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    if (sortBy === 'price-desc') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    // Default sorting based on store settings preference
    const defaultSort = storeDetails?.theme_settings?.defaultSort || 'newest';
    if (defaultSort === 'price_asc') {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    if (defaultSort === 'price_desc') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    if (defaultSort === 'newest') {
      const dateA = new Date(a.created_at || a.id);
      const dateB = new Date(b.created_at || b.id);
      return dateB - dateA;
    }
    return 0; // default/popular (preserves insertion order)
  });

  return (
    <main className="catalog-layout">
      {storeDetails && storeDetails.status !== 'approved' && isCreator && (
        <div className={`preview-warning-banner ${storeDetails.status}`}>
          <div className="banner-content">
            <span className="banner-badge">Preview Mode</span>
            <span className="banner-message">
              {storeDetails.status === 'pending' && "⏳ Your store is pending admin review. Public visitors see a 'Store is under review' screen."}
              {storeDetails.status === 'rejected' && `❌ Your store request was rejected. Reason: ${storeDetails.status_reason || 'N/A'}.`}
              {storeDetails.status === 'disabled' && `🚫 Your store is disabled. Reason: ${storeDetails.status_reason || 'N/A'}.`}
            </span>
          </div>
          {(storeDetails.status === 'rejected' || storeDetails.status === 'disabled') && (
            <Link href="/dashboard" className="banner-action-link">Resubmit / Manage in Dashboard &rarr;</Link>
          )}
        </div>
      )}

      <Navbar storeName={storeDetails?.name} logoUrl={storeDetails?.logo_url || storeDetails?.logo} />

      <div className="container catalog-container">
        
        {/* Page Header */}
        <section className="catalog-header-section">
          <div className="breadcrumbs">
            <Link href={`/store/${slug}`} className="breadcrumb-link">Home</Link>
            <span className="separator">&rarr;</span>
            <span className="current">Products Catalog</span>
          </div>
          <div className="header-banner-card">
            <div className="header-banner-content">
              <span className="banner-tag">Our Collection</span>
              <h1 className="catalog-title">Explore Store Collection</h1>
              <p className="catalog-subtitle">Browse through our premium selection of curated products.</p>
            </div>
            <div className="header-banner-decorative-circle"></div>
          </div>
        </section>

        {/* Category Filter Pills */}
        <section className="categories-pill-section">
          <div className="categories-pill-list">
            <button 
              className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              All Products ({products.length})
            </button>
            {categoriesWithCount.filter(c => c.id !== 'all' && c.title !== 'All').map(cat => (
              <button 
                key={cat.id}
                className={`category-pill ${selectedCategory === (cat.title || cat.name) ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.title || cat.name)}
              >
                {cat.displayTitle} ({cat.productCount})
              </button>
            ))}
          </div>
        </section>

        {/* Filters and Sorting Action Bar */}
        <section className="actions-filter-bar">
          <div className="search-status">
            {searchQuery ? (
              <span>Showing results for "<strong>{searchQuery}</strong>" in <strong>{selectedCategory === 'All' ? 'All Categories' : selectedCategory}</strong></span>
            ) : (
              <span>Showing <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? 'product' : 'products'} total</span>
            )}
          </div>
          <div className="sorting-selector-box">
            <label htmlFor="sort-select">Sort By</label>
            <div className="select-wrapper">
              <select 
                id="sort-select" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default / Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A to Z</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="products-grid-section">
          {sortedProducts.length > 0 ? (
            <div className="products-grid">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="catalog-empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No matching products found</h3>
              <p>We couldn't find any products in this collection matching your criteria. Try resetting filters.</p>
              <button className="reset-filters-btn" onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setSortBy('default'); }}>Reset All Filters</button>
            </div>
          )}
        </section>

      </div>

      <Footer storeName={storeDetails?.name} description={storeDetails?.description} />

      <style jsx>{`
        .catalog-layout {
          background: #FAF8F5; /* Warm aesthetic cream background */
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          padding-top: 76px; /* Reduced from 100px */
        }

        .catalog-container {
          padding-bottom: 80px;
          display: flex;
          flex-direction: column;
          gap: 16px; /* Reduced from 24px */
        }

        /* Banner styling */
        .preview-warning-banner {
          background: #fef3c7;
          border-bottom: 1px solid #fde68a;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          color: #92400e;
        }
        .banner-badge {
          background: #f59e0b;
          color: #fff;
          padding: 2px 8px;
          border-radius: 6px;
          font-weight: 700;
          margin-right: 8px;
        }
        .banner-action-link {
          font-weight: 700;
          color: #b45309;
          text-decoration: none;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #706f6c;
          margin-bottom: 8px;
        }
        .breadcrumb-link {
          color: #706f6c;
          text-decoration: none;
          transition: color 0.2s;
        }
        .breadcrumb-link:hover {
          color: #121212;
        }
        .separator {
          color: #cbd5e1;
        }
        .current {
          color: #121212;
          font-weight: 600;
        }

        /* Header Banner Card */
        .catalog-header-section {
          text-align: left;
        }
        .header-banner-card {
          background: linear-gradient(135deg, #2D322F 0%, #1A1D1B 100%); /* Dark charcoal/charcoal olive matching the New Arrivals banner color */
          border-radius: 20px;
          padding: 28px 36px; /* Reduced from 40px 48px */
          color: #FAF8F5;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }
        .header-banner-content {
          position: relative;
          z-index: 2;
        }
        .banner-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #A3A8A5;
          margin-bottom: 12px;
        }
        .catalog-title {
          font-size: 36px;
          font-weight: 800;
          color: #FAF8F5;
          letter-spacing: -1px;
          margin: 0 0 8px 0;
        }
        .catalog-subtitle {
          font-size: 15px;
          color: #A3A8A5;
          margin: 0;
          max-width: 480px;
          line-height: 1.5;
        }
        .header-banner-decorative-circle {
          position: absolute;
          right: -50px;
          top: -50px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.03);
          border: 1px solid rgba(250, 248, 245, 0.05);
          pointer-events: none;
        }

        /* Category pills list */
        .categories-pill-section {
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
        }
        .categories-pill-section::-webkit-scrollbar {
          display: none;
        }
        .categories-pill-list {
          display: flex;
          gap: 12px;
          white-space: nowrap;
        }
        .category-pill {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 40px;
          padding: 10px 22px;
          font-size: 13px;
          font-weight: 600;
          color: #555350;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }
        .category-pill:hover {
          background: #ffffff;
          color: #121212;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border-color: rgba(0, 0, 0, 0.1);
        }
        .category-pill.active {
          background: #121212;
          color: #FAF8F5;
          border-color: #121212;
          box-shadow: 0 8px 20px rgba(18, 18, 18, 0.15);
          transform: translateY(-2px);
        }

        /* Filters and Sorting */
        .actions-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 28px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.02);
          flex-wrap: wrap;
          gap: 16px;
        }
        .search-status {
          font-size: 14px;
          color: #555350;
        }
        .search-status strong {
          color: #121212;
        }
        .sorting-selector-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sorting-selector-box label {
          font-size: 13px;
          font-weight: 700;
          color: #706f6c;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .select-wrapper select {
          appearance: none;
          background: #FAF8F5;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 12px;
          padding: 10px 36px 10px 16px;
          font-size: 13px;
          font-weight: 600;
          color: #121212;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .select-wrapper select:focus {
          border-color: #121212;
          background: #ffffff;
        }
        .select-wrapper svg {
          position: absolute;
          right: 14px;
          pointer-events: none;
          color: #706f6c;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 32px 24px;
        }

        /* Empty State */
        .catalog-empty-state {
          text-align: center;
          padding: 80px 24px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          max-width: 500px;
          margin: 40px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .catalog-empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: #121212;
          margin: 0 0 8px 0;
        }
        .catalog-empty-state p {
          font-size: 14px;
          color: #706f6c;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .reset-filters-btn {
          display: inline-block;
          padding: 12px 24px;
          background: #121212;
          color: #FAF8F5;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        .reset-filters-btn:hover {
          background: #232724;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .catalog-layout {
            padding-top: 130px; /* Spacer for mobile search navbar height */
          }
          .actions-filter-bar {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
          }
          .sorting-selector-box {
            justify-content: space-between;
          }
          .select-wrapper {
            flex: 1;
          }
          .select-wrapper select {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
