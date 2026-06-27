'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);
  const router = useRouter();
  const pathname = usePathname() || '';

  const segments = pathname.split('/');
  const isDemo = segments[1] === 'demo-store';
  const storeSlug = (segments[1] === 'store' || isDemo) ? segments[2] : null;
  const idOrSlug = product.slug || product.id;
  const productLink = storeSlug 
    ? (isDemo ? `/demo-store/${storeSlug}/product/${idOrSlug}` : `/store/${storeSlug}/product/${idOrSlug}`) 
    : `/product/${idOrSlug}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product);
  };

  const displayPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  return (
    <div className={`premium-product-card ${product.stock === 0 ? 'out-of-stock-card' : ''}`}>
      <div className="product-image-wrapper">
        <Link href={productLink} className="product-image-link">
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-img" 
            onError={(e) => { 
              e.target.src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600'; 
            }} 
          />
          {product.stock === 0 ? (
            <span className="stock-badge oos">Out of Stock</span>
          ) : product.stock > 0 && product.stock < 10 ? (
            <span className="stock-badge low">Only {product.stock} left</span>
          ) : (
            <>
              {product.trending && <span className="stock-badge bestseller">Bestseller</span>}
              {product.featured && !product.trending && <span className="stock-badge new-tag">New</span>}
            </>
          )}
        </Link>
        
        {/* Wishlist Button */}
        <button 
          className={`wishlist-overlay-btn ${isWishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          title="Add to Wishlist"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "#ef4444" : "none"} stroke={isWishlisted ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>

      <div className="product-details">
        <Link href={productLink}>
          <h3 className="product-name-title">{product.name}</h3>
        </Link>
        
        <div className="product-footer-row">
          <div className="footer-left-col">
            <span className="price-label">₹{displayPrice.toLocaleString()}</span>
            <div className="rating-row">
              <span className="star-symbol">★</span>
              <span className="rating-score-num">{product.rating || '4.8'}</span>
            </div>
          </div>
          
          <div className="footer-right-col">
            <button 
              className={`add-to-cart-circle-btn ${product.stock === 0 ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              title="Add to Cart"
            >
              {product.stock === 0 ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-product-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border-radius: 20px;
          padding: 12px;
          transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
          height: 100%;
          border: 1px solid rgba(0, 0, 0, 0.02);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
        }

        .premium-product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.04);
        }

        .product-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: 14px;
          overflow: hidden;
          background: #FAF8F5;
        }

        .product-image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .product-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .premium-product-card:hover .product-img {
          transform: scale(1.05);
        }

        .stock-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 10px;
          border-radius: 40px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 2;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        }

        .stock-badge.bestseller {
          background: #EFECE6;
          color: #232724;
        }

        .stock-badge.new-tag {
          background: #232724;
          color: #FAF8F5;
        }

        .stock-badge.oos {
          background: #706f6c;
          color: #FAF8F5;
        }

        .stock-badge.low {
          background: #f59e0b;
          color: #ffffff;
        }

        .wishlist-overlay-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(250, 248, 245, 0.9);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #706f6c;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
          z-index: 5;
        }

        .wishlist-overlay-btn:hover {
          background: #ffffff;
          color: #ef4444;
          transform: scale(1.08);
        }

        .wishlist-overlay-btn.active {
          color: #ef4444;
          background: #ffffff;
        }

        .product-details {
          padding: 16px 4px 4px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-name-title {
          font-size: 15px;
          font-weight: 600;
          color: #121212;
          margin-bottom: 12px;
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s ease;
        }

        .product-name-title:hover {
          color: #706f6c;
        }

        .product-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .footer-left-col {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .price-label {
          font-size: 16px;
          font-weight: 700;
          color: #121212;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #706f6c;
          font-weight: 600;
        }

        .star-symbol {
          color: #f59e0b;
          font-size: 12px;
        }

        .add-to-cart-circle-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #121212;
          color: #FAF8F5;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.25s ease;
        }

        .add-to-cart-circle-btn:hover {
          background: #232724;
          transform: scale(1.08);
          box-shadow: 0 6px 14px rgba(0,0,0,0.15);
        }

        .add-to-cart-circle-btn.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .add-to-cart-circle-btn.disabled:hover {
          transform: none;
        }

        .out-of-stock-card {
          opacity: 0.85;
        }

        .out-of-stock-card .product-img {
          filter: grayscale(30%);
        }

        @media (max-width: 768px) {
          .premium-product-card {
            border-radius: 16px;
            padding: 8px;
          }
          .product-details {
            padding: 10px 2px 2px;
          }
          .product-name-title {
            font-size: 13px;
            margin-bottom: 8px;
          }
          .price-label {
            font-size: 14px;
          }
          .add-to-cart-circle-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}
