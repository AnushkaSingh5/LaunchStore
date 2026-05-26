'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Footer from '@/components/Footer';
import { useStore } from '@/context/StoreContext';
import { storeService } from '@/services/storeService';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';

export default function StorePage({ params }) {
  const { slug } = use(params);
  const { selectedCategory, setSelectedCategory, searchQuery } = useStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeDetails, setStoreDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log(`[LaunchCart - StorePage] Starting fetchData for slug: "${slug}"`);
      setLoading(true);
      try {
        console.log(`[LaunchCart - StorePage] Calling storeService.getStoreBySlug("${slug}")...`);
        const storeData = await storeService.getStoreBySlug(slug);
        console.log(`[LaunchCart - StorePage] storeService.getStoreBySlug returned:`, storeData);
        setStoreDetails(storeData);
        
        if (storeData && storeData.id) {
          console.log(`[LaunchCart - StorePage] Store matched. Fetching products & categories for store ID: "${storeData.id}"...`);
          const [prodData, catData] = await Promise.all([
            productService.getProductsByStore(storeData.id, false),
            categoryService.getCategoriesByStore(storeData.id)
          ]);
          console.log(`[LaunchCart - StorePage] Products fetched count: ${prodData?.length}, Categories fetched count: ${catData?.length}`);
          
          const safeCatData = catData || [];
          const mappedProducts = (prodData || []).map(p => {
            const categoryObj = safeCatData.find(c => c.id === p.category_id);
            return {
              ...p,
              category: categoryObj ? (categoryObj.name || categoryObj.title) : 'Uncategorized'
            };
          });
          console.log(`[LaunchCart - StorePage] Mapped products with categories:`, mappedProducts.map(p => ({ name: p.name, category: p.category })));
          
          setProducts(mappedProducts);
          setCategories([
            { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' },
            ...safeCatData
          ]);
        } else {
          console.warn(`[LaunchCart - StorePage] No store matches slug: "${slug}"`);
        }
      } catch (error) {
        console.error("[LaunchCart - StorePage] Failed to fetch data with error:", error);
      } finally {
        console.log("[LaunchCart - StorePage] Fetch data complete, setting loading to false.");
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="store-loading-screen">
        <div className="spinner"></div>
        <p>Loading storefront...</p>
        <style jsx>{`
          .store-loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #fff;
            gap: 16px;
            font-family: 'Outfit', sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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

  if (storeDetails.status && ['rejected', 'disabled'].includes(storeDetails.status)) {
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
      <Navbar storeName={storeDetails?.name} />
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
            <p className="section-subtitle">Curated collections for your home.</p>
          </div>
          <div className="categories-grid">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Featured Products (Only show when no active filtering) */}
        {!searchQuery && selectedCategory === 'All' && (
          <section className="section-wrapper dashboard-card section-card">
            <div className="section-header align-left">
              <div className="title-box">
                <h2 className="section-title">Featured Collections</h2>
                <span className="live-badge">Live Now</span>
              </div>
              <p className="section-subtitle">Timeless pieces selected for modern enthusiasts.</p>
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
              {selectedCategory === 'All' ? 'Discover All' : `${selectedCategory} Collection`}
              {searchQuery && ` - Results for "${searchQuery}"`}
            </h2>
            <p className="section-subtitle">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} found
            </p>
          </div>

          {loading ? (
            <div className="loading-state">Loading products...</div>
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
          grid-template-columns: repeat(5, 1fr);
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
      `}</style>
    </main>
  );
}
