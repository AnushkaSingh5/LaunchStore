'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import CategoryCard from '../../components/CategoryCard';
import ProductCard from '../../components/ProductCard';
import Footer from '../../components/Footer';
import { useStore } from '../../context/StoreContext';
import { storeService } from '../../services/storeService';

export default function StorePage() {
  const { selectedCategory, setSelectedCategory, searchQuery } = useStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodData, catData] = await Promise.all([
          storeService.getProducts(),
          storeService.getCategories()
        ]);
        setProducts(prodData);
        setCategories([{ id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' }, ...catData]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      <Navbar />
      <Hero />
      
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

      <Footer />

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
