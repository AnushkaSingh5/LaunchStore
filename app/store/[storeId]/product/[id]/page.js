'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../context/StoreContext';
import { storeService } from '../../../services/storeService';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import ProductCard from '../../../components/ProductCard';

export default function ProductDetails({ params }) {
  const { id } = use(params);
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const data = await storeService.getProductById(id);
      if (data) {
        setProduct(data);
        const related = await storeService.getRelatedProducts(data.category, data.id);
        setRelatedProducts(related);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  if (loading) return <div className="loading-screen">Loading Product...</div>;
  if (!product) return <div className="error-screen">Product not found.</div>;

  return (
    <div className="product-details-page">
      <Navbar />

      <main className="container main-content">
        <div className="product-layout dashboard-card fade-in">
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
              {product.trending && <span className="badge">Trending</span>}
            </div>
          </div>

          <div className="product-info">
            <nav className="breadcrumb">
              <span>Home</span> / <span>{product.category}</span> / <span>{product.name}</span>
            </nav>

            <h1 className="title">{product.name}</h1>
            <p className="price">${product.price.toLocaleString()}</p>

            <div className="rating">
              <div className="stars">★★★★★</div>
              <span className="reviews">(128 reviews)</span>
            </div>

            <p className="description">
              Experience unparalleled quality and minimalist design. This {product.name.toLowerCase()}
              is crafted from premium materials to elevate your living space and provide
              lasting comfort and style.
            </p>

            <div className="actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            <div className="features">
              <div className="feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span>Free Shipping</span>
              </div>
              <div className="feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="related-section">
            <div className="section-header">
              <h2 className="section-title">Related Products</h2>
              <p className="section-subtitle">You might also like these pieces from the {product.category} collection.</p>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      <style jsx>{`
        .product-details-page {
          background: var(--bg-main);
          min-height: 100vh;
        }

        .main-content {
          padding-top: 140px;
          padding-bottom: 80px;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 60px;
          background: var(--white);
          margin-bottom: 80px;
        }

        .product-gallery .main-image {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-main);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-image .badge {
          position: absolute;
          top: 20px;
          left: 20px;
          background: var(--accent);
          color: white;
          padding: 6px 16px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
        }

        .breadcrumb {
          font-size: 13px;
          color: var(--text-sub);
          margin-bottom: 24px;
        }

        .title {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .price {
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 20px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .stars {
          color: #f59e0b;
          font-size: 18px;
        }

        .reviews {
          color: var(--text-sub);
          font-size: 14px;
        }

        .description {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-sub);
          margin-bottom: 40px;
        }

        .actions {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          background: var(--bg-main);
          border-radius: 12px;
          padding: 4px;
        }

        .quantity-selector button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        .quantity-selector span {
          width: 40px;
          text-align: center;
          font-weight: 700;
        }

        .add-to-cart-btn {
          flex: 1;
          background: var(--primary);
          color: var(--white);
          font-weight: 700;
          border-radius: 12px;
          font-size: 16px;
          transition: var(--transition-smooth);
        }

        .add-to-cart-btn:hover {
          background: var(--accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding-top: 30px;
          border-top: 1px solid var(--secondary);
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .related-section {
          margin-top: 40px;
        }

        .section-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
        }

        .section-subtitle {
          color: var(--text-sub);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .loading-screen, .error-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .title {
            font-size: 32px;
          }
          .actions {
            flex-direction: column;
          }
          .quantity-selector {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
