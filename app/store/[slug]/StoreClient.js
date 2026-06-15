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
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export default function StoreClient({ slug, initialStoreDetails, initialProducts, initialCategories }) {
  const { selectedCategory, setSelectedCategory, searchQuery } = useStore();
  const { startLoading, completeLoading } = useLoading();
  const [products, setProducts] = useState(initialProducts || []);
  const [categories, setCategories] = useState(initialCategories || []);
  const [storeDetails, setStoreDetails] = useState(initialStoreDetails);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const currentUserId = user?.id;
  const isCreator = currentUserId && currentUserId === storeDetails?.creator_id;

  useEffect(() => {
    setStoreDetails(initialStoreDetails);
    setProducts(initialProducts || []);
    setCategories(initialCategories || []);
  }, [initialStoreDetails, initialProducts, initialCategories]);

  // Dynamically load products/categories on the client side if the store is not approved and the creator is previewing it
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
          console.error('[LaunchCart - StoreClient] Failed to load preview data:', e);
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

  // For visitors, block access to non-approved stores
  if (storeDetails && storeDetails.status !== 'approved' && !isCreator) {
    const isPending = storeDetails.status === 'pending';
    const isRejected = storeDetails.status === 'rejected';
    const isDisabled = storeDetails.status === 'disabled';

    let title = "Store is under review";
    let icon = "⏳";
    let color = "#fb7185";
    let buttonColor = "#8b5cf6";
    let description = `The online store "${storeDetails.name}" is currently under review by platform administrators. Please check back later!`;

    if (isPending) {
      title = "Store is under review";
      icon = "⏳";
      color = "#f59e0b";
      buttonColor = "#f59e0b";
      description = `The store "${storeDetails.name}" has been created and is currently waiting for admin review.`;
    } else if (isRejected) {
      title = "Store Unavailable";
      icon = "🔒";
      color = "#ef4444";
      buttonColor = "#ef4444";
      description = `The store "${storeDetails.name}" is currently unavailable. Please contact the owner or try again later.`;
    } else if (isDisabled) {
      title = "Store Disabled";
      icon = "🚫";
      color = "#6b7280";
      buttonColor = "#374151";
      description = `The store "${storeDetails.name}" has been disabled by platform administrators.`;
    }

    return (
      <div className="pending-store-screen">
        <div className="glass-card">
          <div className="icon-badge" style={{ color: color }}>{icon}</div>
          <h2>{title}</h2>
          <p>{description}</p>
          <Link href="/" className="back-link" style={{ backgroundColor: buttonColor }}>Return to Home</Link>
        </div>
        <style jsx>{`
          .pending-store-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            padding: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px;
            padding: 48px;
            max-width: 500px;
            text-align: center;
            color: #fff;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .icon-badge {
            font-size: 56px;
            margin-bottom: 24px;
            animation: pulse 2s infinite alternate;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.08); }
          }
          .glass-card h2 {
            font-size: 26px;
            font-weight: 850;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
            color: #f8fafc;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 32px;
          }
          .back-link {
            display: inline-block;
            padding: 14px 28px;
            color: #fff;
            border-radius: 14px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          }
          .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.3);
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
        .preview-warning-banner {
          width: 100%;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 600;
          z-index: 9999;
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
        }
        .preview-warning-banner.pending {
          background: #fffbeb;
          border-bottom: 1px solid #fef3c7;
          color: #d97706;
        }
        .preview-warning-banner.rejected {
          background: #fef2f2;
          border-bottom: 1px solid #fee2e2;
          color: #dc2626;
        }
        .preview-warning-banner.disabled {
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          color: #4b5563;
        }
        .banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .banner-badge {
          padding: 4px 8px;
          background: rgba(0,0,0,0.06);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .banner-action-link {
          color: inherit;
          text-decoration: underline;
          font-weight: 700;
          white-space: nowrap;
        }
      `}</style>
    </main>
  );
}
