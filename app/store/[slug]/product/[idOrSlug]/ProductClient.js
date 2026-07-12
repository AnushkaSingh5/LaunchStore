'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import StoreUnderReview from '@/components/StoreUnderReview';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function ProductClient({ slug, initialStoreDetails, initialProduct, initialRelatedProducts }) {
  const { addToCart } = useStore();
  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts || []);
  const [quantity, setQuantity] = useState(1);
  const [storeDetails, setStoreDetails] = useState(initialStoreDetails);
  const [activeImage, setActiveImage] = useState(initialProduct?.image || initialProduct?.image_url);
  const router = useRouter();

  useEffect(() => {
    setProduct(initialProduct);
    setStoreDetails(initialStoreDetails);
    setRelatedProducts(initialRelatedProducts || []);
    setQuantity(1);
    setActiveImage(initialProduct?.image || initialProduct?.image_url);
  }, [initialProduct, initialStoreDetails, initialRelatedProducts]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (!product || !product.images || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(activeImage);
    const prevIndex = currentIndex <= 0 ? product.images.length - 1 : currentIndex - 1;
    setActiveImage(product.images[prevIndex]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (!product || !product.images || product.images.length <= 1) return;
    const currentIndex = product.images.indexOf(activeImage);
    const nextIndex = currentIndex >= product.images.length - 1 ? 0 : currentIndex + 1;
    setActiveImage(product.images[nextIndex]);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push(`/store/${slug}/cart`);
  };

  const { user } = useAuth();
  const currentUserId = user?.id;
  const isCreator = currentUserId && currentUserId === storeDetails?.creator_id;

  if (storeDetails && storeDetails.status !== 'approved' && !isCreator) {
    return (
      <StoreUnderReview 
        storeName={storeDetails.name} 
        status={storeDetails.status} 
        statusReason={storeDetails.status_reason} 
      />
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

  if (!product) {
    return (
      <div className="store-not-found-screen">
        <div className="glass-card">
          <h2>Product Not Found 🔍</h2>
          <p>We couldn't find the product details in this store. It might have been removed or set to draft.</p>
          <Link href={`/store/${slug}`} className="back-link">Return to Store</Link>
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

  return (
    <div className="product-details-page">
      <Navbar storeName={storeDetails?.name} logoUrl={storeDetails?.logo_url || storeDetails?.logo} />

      <main className="container main-content">
        <div className="product-layout dashboard-card fade-in">
          <div className="product-gallery">
            <div className="main-image">
              <img src={activeImage} alt={product.name} />
              {product.trending && <span className="badge">Trending</span>}

              {product.images && product.images.length > 1 && (
                <>
                  <button type="button" className="gallery-arrow-btn prev" onClick={handlePrevImage} aria-label="Previous image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <button type="button" className="gallery-arrow-btn next" onClick={handleNextImage} aria-label="Next image">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                </>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="thumbnails-grid">
                {product.images.map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-item ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <nav className="breadcrumb">
              <span>Home</span> / <span>{product.category || 'Uncategorized'}</span> / <span>{product.name}</span>
            </nav>

            <h1 className="title">{product.name}</h1>
            <p className="price">₹{product.price.toLocaleString()}</p>

            <div className="stock-status-wrapper" style={{ marginBottom: '20px' }}>
              {product.stock === 0 ? (
                <span className="stock-badge-detail out-of-stock">Out of Stock</span>
              ) : product.stock < 10 ? (
                <span className="stock-badge-detail low-stock">Low Stock (Only {product.stock} items left)</span>
              ) : (
                <span className="stock-badge-detail in-stock">In Stock ({product.stock} items available)</span>
              )}
            </div>

            <div className="rating">
              <div className="stars">★★★★★</div>
              <span className="reviews">(128 reviews)</span>
            </div>

            <p className="description">
              {product.description || `Experience unparalleled quality and minimalist design. This ${product.name.toLowerCase()} is crafted from premium materials to elevate your living space and provide lasting comfort and style.`}
            </p>

            <div className="actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                >
                  -
                </button>
                <span>{product.stock === 0 ? 0 : quantity}</span>
                <button 
                  onClick={() => {
                    if (product.stock !== undefined && quantity >= product.stock) {
                      alert(`Only ${product.stock} items available.`);
                      return;
                    }
                    setQuantity(quantity + 1);
                  }}
                  disabled={product.stock === 0}
                >
                  +
                </button>
              </div>
              {product.stock === 0 ? (
                <button
                  className="add-to-cart-btn disabled-btn"
                  disabled
                >
                  Out of Stock
                </button>
              ) : (
                <button
                  className="add-to-cart-btn"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              )}
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
              <p className="section-subtitle">You might also like these pieces from the {product.category || 'collection'}.</p>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer storeName={storeDetails?.name} />

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

        .gallery-arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: var(--transition-smooth);
          z-index: 10;
        }

        .gallery-arrow-btn:hover {
          background: var(--white);
          color: var(--accent);
          transform: translateY(-50%) scale(1.1);
          box-shadow: var(--shadow-md);
        }

        .gallery-arrow-btn.prev {
          left: 16px;
        }

        .gallery-arrow-btn.next {
          right: 16px;
        }

        .main-image:hover .gallery-arrow-btn {
          opacity: 1;
        }

        .thumbnails-grid {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .thumbnail-item {
          width: 70px;
          height: 70px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: var(--transition-fast);
          flex-shrink: 0;
          background: var(--bg-main);
        }

        .thumbnail-item.active {
          border-color: var(--accent);
          transform: scale(0.95);
        }

        .thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
          border: none;
          background: transparent;
          cursor: pointer;
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
          border: none;
          cursor: pointer;
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
            gap: 32px;
            padding: 30px;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding-top: 90px;
            padding-bottom: 40px;
          }
          .product-layout {
            padding: 20px 16px;
            gap: 24px;
            margin-bottom: 40px;
            border-radius: var(--radius-md);
          }
          .product-gallery .main-image {
            aspect-ratio: 1/1;
            max-height: 320px;
            max-width: 320px;
            margin: 0 auto;
          }
          .thumbnails-grid {
            margin-top: 12px;
            gap: 8px;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .thumbnails-grid::-webkit-scrollbar {
            display: none;
          }
          .title {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .price {
            font-size: 22px;
            margin-bottom: 16px;
          }
          .description {
            font-size: 14px;
            margin-bottom: 24px;
          }
          .actions {
            display: grid;
            grid-template-columns: 120px 1fr;
            gap: 12px;
            margin-bottom: 24px;
          }
          .add-to-cart-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            height: 48px;
            font-size: 15px;
          }
          .quantity-selector {
            height: 48px;
            justify-content: space-between;
          }
          .quantity-selector button {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
          .quantity-selector span {
            width: 36px;
          }
          .features {
            grid-template-columns: 1fr;
            gap: 16px;
            padding-top: 20px;
          }
          .related-section {
            margin-top: 24px;
          }
          .section-title {
            font-size: 24px;
          }
        }

        .stock-badge-detail {
          display: inline-block;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
        }
        .stock-badge-detail.out-of-stock {
          background: #fee2e2;
          color: #ef4444;
        }
        .stock-badge-detail.low-stock {
          background: #fffbeb;
          color: #f59e0b;
        }
        .stock-badge-detail.in-stock {
          background: #dcfce7;
          color: #22c55e;
        }
        .disabled-btn {
          opacity: 0.6;
          cursor: not-allowed !important;
          background: #cbd5e1 !important;
          color: #64748b !important;
          box-shadow: none !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
}
