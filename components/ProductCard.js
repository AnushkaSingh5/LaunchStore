'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../context/StoreContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);
  const router = useRouter();

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(product);
    router.push('/cart');
  };

  return (
    <div className="product-card dashboard-card">
      <div className="product-visual-wrapper">
        <Link href={`/product/${product.id}`} className="product-visual">
          <img src={product.image} alt={product.name} />
          {product.trending && <span className="product-badge accent">Trending</span>}
          {product.featured && !product.trending && <span className="product-badge secondary">New</span>}
        </Link>
        
        <div className="visual-actions">
          <button 
            className={`action-circle wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            title="Add to Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          
          <button 
            className="action-circle add-btn"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            title="Quick Add to Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      </div>

      <div className="product-body">
        <div className="product-meta">
          <span className="product-cat">{product.category}</span>
          <div className="product-rating">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>4.8</span>
          </div>
        </div>
        <Link href={`/product/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <div className="product-footer">
          <span className="product-price">${product.price.toLocaleString()}</span>
          <button 
            className="buy-btn"
            onClick={handleBuyNow}
          >
            Buy
          </button>
        </div>
      </div>

      <style jsx>{`
        .product-card {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: var(--white);
          height: 100%;
          transition: var(--transition-smooth);
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-lg);
        }

        .product-visual-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1;
          border-radius: calc(var(--radius-md) - 4px);
          overflow: hidden;
          background: var(--bg-main);
        }

        .product-visual {
          display: block;
          width: 100%;
          height: 100%;
        }

        .product-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .product-card:hover .product-visual img {
          transform: scale(1.05);
        }

        .visual-actions {
          position: absolute;
          right: 12px;
          top: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transform: translateX(10px);
          transition: var(--transition-smooth);
          z-index: 10;
        }

        .product-card:hover .visual-actions {
          opacity: 1;
          transform: translateX(0);
        }

        .action-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--white);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: var(--transition-fast);
        }

        .action-circle:hover {
          background: var(--primary);
          color: var(--white);
          transform: scale(1.1);
        }

        .wishlist-btn.active {
          color: #ef4444;
        }

        .product-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .product-badge.accent {
          background: #ef4444;
          color: white;
        }

        .product-badge.secondary {
          background: var(--accent);
          color: white;
        }

        .product-body {
          padding: 4px 8px 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-cat {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-sub);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          color: #f59e0b;
        }

        .product-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: var(--transition-fast);
        }

        .product-name:hover {
          color: var(--accent);
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 8px;
        }

        .product-price {
          font-size: 18px;
          font-weight: 700;
          color: var(--primary);
        }

        .buy-btn {
          padding: 8px 24px;
          background: var(--primary);
          color: var(--white);
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          transition: var(--transition-fast);
        }

        .buy-btn:hover {
          background: var(--accent);
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .visual-actions {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
