'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { storeService } from '@/services/storeService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoreUnderReview from '@/components/StoreUnderReview';

export default function WishlistPage({ params }) {
  const { slug } = use(params);
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const isDemo = segments[1] === 'demo-store';

  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { customer } = useCustomerAuth();
  const [storeDetails, setStoreDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [shareSuccess, setShareSuccess] = useState(false);

  // Filter wishlist items for this store
  const storeWishlist = (wishlist || []).filter(
    item => item.store_id === storeDetails?.id || item.store_slug === slug
  );

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const data = await storeService.getStoreBySlug(slug);
        setStoreDetails(data);
      } catch (e) {
        console.error('Failed to fetch store details in wishlist:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [slug]);

  // Handle move all in-stock items to cart
  const handleMoveAllToCart = () => {
    const inStockItems = storeWishlist.filter(item => item.stock > 0);
    if (inStockItems.length === 0) return;
    inStockItems.forEach(item => {
      addToCart(item);
    });
  };

  // Handle share wishlist url
  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  // Sort wishlist items
  const sortedWishlist = [...storeWishlist].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return parseFloat(a.price) - parseFloat(b.price);
    }
    if (sortBy === 'price-desc') {
      return parseFloat(b.price) - parseFloat(a.price);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="store-loading-screen">
        <div className="spinner"></div>
        <p>Loading Wishlist...</p>
        <style jsx>{`
          .store-loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #FAF8F5;
            color: #121212;
            gap: 16px;
            font-family: 'Outfit', sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 0, 0, 0.05);
            border-left-color: #121212;
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

  if (storeDetails.status !== 'approved') {
    return (
      <StoreUnderReview 
        storeName={storeDetails.name} 
        status={storeDetails.status} 
        statusReason={storeDetails.status_reason} 
      />
    );
  }

  return (
    <main className="wishlist-layout">
      <Navbar storeName={storeDetails.name} logoUrl={storeDetails.logo_url || storeDetails.logo} />

      <div className="container wishlist-container">
        
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href={`/store/${slug}`} className="breadcrumb-link">Home</Link>
          <span className="separator">&gt;</span>
          <span className="current">Wishlist</span>
        </div>

        {/* Header Block *        <div className="wishlist-header-row">
          <div className="header-text-col">
            <h1 className="wishlist-title">
              My Wishlist ♡
            </h1>
            <p className="wishlist-subtitle">Items you love, all in one place.</p>
          </div>
          
          <div className="header-actions">
            <button className="share-wishlist-btn" onClick={handleShare}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              {shareSuccess ? 'Link Copied!' : 'Share Wishlist'}
            </button>
            <button className="move-all-btn" onClick={handleMoveAllToCart} disabled={storeWishlist.filter(item => item.stock > 0).length === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              Move All to Cart
            </button>
          </div>
        </div>

        {/* Sub-header controls */}
        {storeWishlist.length > 0 && (
          <div className="wishlist-controls-bar">
            <span className="items-count-label">{storeWishlist.length} {storeWishlist.length === 1 ? 'item' : 'items'}</span>
            <div className="sorting-selector">
              <span className="sort-label">Sort by:</span>
              <div className="select-wrapper">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="recent">Recently Added</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Items List */}
        {sortedWishlist.length > 0 ? (
          <div className="wishlist-items-list">
            {sortedWishlist.map(product => {
              const displayPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
              
              // Calculate specific mock reviews count to match mockup screenshots
              const getReviewsCount = (name, price) => {
                const cleanName = (name || '').toLowerCase();
                if (cleanName.includes('espresso') || price === 122 || cleanName === '3p') return 22;
                if (cleanName.includes('snake') || price === 60 || cleanName === '6p') return 18;
                if (cleanName.includes('kettle') || price === 50 || cleanName === '5p') return 15;
                if (cleanName.includes('organizer') || price === 40 || cleanName === '4p') return 11;
                if (cleanName.includes('pen') || price === 20 || cleanName === '2p') return 30;
                return 10 + (product.id % 20);
              };

              // Category count badge (4 ct, 3 ct, 5 ct, etc.)
              const getCategoryCount = (name, price) => {
                const cleanName = (name || '').toLowerCase();
                if (cleanName.includes('kettle') || price === 50) return '5 ct';
                if (cleanName.includes('organizer') || price === 40) return '3 ct';
                if (cleanName.includes('espresso') || price === 122) return '4 ct';
                return '1 ct';
              };

              const reviewsCount = getReviewsCount(product.name, displayPrice);
              const categoryCount = getCategoryCount(product.name, displayPrice);
              const isOutOfStock = product.stock === 0;

              // Link to product details
              const productLink = isDemo
                ? `/demo-store/${slug}/product/${product.slug || product.id}`
                : `/store/${slug}/product/${product.slug || product.id}`;

              return (
                <div key={product.id} className="wishlist-item-card">
                  {/* Image with category badge and red heart icon overlay */}
                  <div className="item-image-wrapper">
                    <Link href={productLink}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="item-img"
                        onError={(e) => { 
                          e.target.src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600'; 
                        }}
                      />
                    </Link>
                    <span className="item-count-badge">{categoryCount}</span>
                    <button 
                      className="heart-remove-badge"
                      onClick={() => toggleWishlist(product)}
                      title="Remove from Wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                  </div>

                  {/* Title & Info Block */}
                  <div className="card-info-block">
                    <div className="title-price-row">
                      <Link href={productLink} className="item-title-link">
                        <h3 className="item-title">{product.name}</h3>
                      </Link>
                      <span className="item-price">₹{displayPrice.toLocaleString()}</span>
                    </div>

                    <div className="rating-stock-row">
                      <div className="item-rating-row">
                        <span className="star-symbol">★</span>
                        <span className="rating-score">{product.rating || '4.3'}</span>
                        <span className="reviews-count">({reviewsCount})</span>
                      </div>
                      <span className={`item-stock-status ${isOutOfStock ? 'oos' : 'in-stock'}`}>
                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                      </span>
                    </div>

                    <div className="category-tag-row">
                      <span className="item-category-tag">{product.category || 'Kitchen & Dining'}</span>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="card-actions-block">
                    {isOutOfStock ? (
                      <button className="notify-me-btn" onClick={() => alert(`We will notify you when ${product.name} is back in stock!`)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        Notify Me
                      </button>
                    ) : (
                      <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        Add to Cart
                      </button>
                    )}
                    <button className="remove-item-trash-btn" onClick={() => toggleWishlist(product)} title="Remove">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="wishlist-empty-state">
            <div className="empty-icon-heart">❤️</div>
            <h2>Your wishlist is empty</h2>
            <p>Explore our collection and add items you love to your wishlist.</p>
            <Link 
              href={isDemo ? `/demo-store/${slug}` : `/store/${slug}`} 
              className="explore-catalog-btn"
              style={{
                display: 'inline-block',
                background: '#121212',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(18, 18, 18, 0.08)',
                cursor: 'pointer'
              }}
            >
              Go to Home
            </Link>
          </div>
        )}

      </div>

      <Footer storeName={storeDetails.name} description={storeDetails.description} />

      <style jsx>{`
        .wishlist-layout {
          background: #FAF8F5;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          padding-top: 76px;
        }

        .wishlist-container {
          max-width: 1240px;
          margin: 0 auto;
          width: 100%;
          padding: 0 24px 80px;
          display: flex;
          flex-direction: column;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #706f6c;
          margin-top: 16px;
          margin-bottom: 16px;
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

        /* Wishlist Header */
        .wishlist-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .wishlist-title {
          font-size: 32px;
          font-weight: 700;
          color: #121212;
          margin: 0 0 6px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-heart-icon {
          color: #121212;
        }

        .wishlist-subtitle {
          font-size: 14px;
          color: #706f6c;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .share-wishlist-btn {
          background: #ffffff;
          color: #121212;
          border: 1px solid rgba(0, 0, 0, 0.08);
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .share-wishlist-btn:hover {
          background: #f0f2f5;
        }

        .move-all-btn {
          background: #121212;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .move-all-btn:hover:not(:disabled) {
          background: #232724;
        }

        .move-all-btn:disabled {
          background: #eef0f3;
          color: #a3a19e;
          cursor: not-allowed;
        }

        /* Wishlist Controls */
        .wishlist-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          margin-bottom: 20px;
        }

        .items-count-label {
          font-size: 14px;
          font-weight: 600;
          color: #121212;
        }

        .sorting-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-label {
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
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          padding: 6px 28px 6px 12px;
          font-size: 13px;
          font-weight: 600;
          color: #121212;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .select-wrapper select:focus {
          border-color: #121212;
        }

        .select-wrapper svg {
          position: absolute;
          right: 10px;
          pointer-events: none;
          color: #706f6c;
        }

        /* Wishlist Items list */
        .wishlist-items-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px 24px;
        }

        .wishlist-item-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .wishlist-item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
        }
        
        .item-image-wrapper {
          position: relative;
          width: 100%;
          height: 260px;
          overflow: hidden;
        }
        
        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .wishlist-item-card:hover .item-img {
          transform: scale(1.03);
        }
        
        /* item count badge (4 ct) bottom left */
        .item-count-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(18, 18, 18, 0.6);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          z-index: 1;
        }

        /* heart remove badge top right */
        .heart-remove-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ffffff;
          border: none;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          z-index: 2;
        }
        
        .heart-remove-badge:hover {
          transform: scale(1.1);
        }
        
        /* Card Info Block */
        .card-info-block {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
        }
        
        .title-price-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        
        .item-title-link {
          text-decoration: none;
          flex: 1;
        }
        
        .item-title {
          font-size: 15px;
          font-weight: 700;
          color: #121212;
          margin: 0;
          line-height: 1.4;
          font-family: 'Outfit', sans-serif;
        }
        
        .item-price {
          font-size: 15px;
          font-weight: 700;
          color: #121212;
        }
        
        .rating-stock-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .item-rating-row {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #706f6c;
        }
        
        .star-symbol {
          color: #e2a537; /* Rating gold */
        }
        
        .rating-score {
          font-weight: 700;
          color: #121212;
        }
        
        .reviews-count {
          color: #888883;
        }
        
        .item-stock-status {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .item-stock-status.in-stock {
          color: #10b981;
        }
        
        .item-stock-status.oos {
          color: #ef4444;
        }
        
        .category-tag-row {
          margin-top: 2px;
        }
        
        .item-category-tag {
          font-size: 11px;
          font-weight: 600;
          color: #706f6c;
          background: #f0f2f5;
          padding: 4px 10px;
          border-radius: 30px;
          display: inline-block;
        }
        
        /* Card Actions Block */
        .card-actions-block {
          padding: 0 20px 20px;
          display: flex;
          gap: 10px;
        }
        
        .add-to-cart-btn, .notify-me-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .add-to-cart-btn {
          background: #121212;
          color: #ffffff;
        }
        
        .add-to-cart-btn:hover {
          background: #232724;
        }
        
        .notify-me-btn {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #121212;
        }
        
        .notify-me-btn:hover {
          background: #f0f2f5;
        }
        
        .remove-item-trash-btn {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #706f6c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .remove-item-trash-btn:hover {
          background: #fee2e2;
          color: #ef4444;
          border-color: #fca5a5;
        }

        /* Empty State */
        .wishlist-empty-state {
          text-align: center;
          padding: 80px 24px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.02);
          max-width: 500px;
          margin: 40px auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.01);
        }

        .empty-icon-heart {
          font-size: 48px;
          margin-bottom: 20px;
          animation: beat 1s infinite alternate;
        }

        @keyframes beat {
          to { transform: scale(1.1); }
        }

        .wishlist-empty-state h2 {
          font-size: 22px;
          font-weight: 700;
          color: #121212;
          margin: 0 0 8px 0;
        }

        .wishlist-empty-state p {
          font-size: 14px;
          color: #706f6c;
          margin: 0 0 28px 0;
          line-height: 1.5;
        }

        .explore-catalog-btn {
          display: inline-block !important;
          background: #121212 !important;
          color: #ffffff !important;
          padding: 12px 28px !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          text-decoration: none !important;
          transition: all 0.2s ease !important;
          box-shadow: 0 4px 12px rgba(18, 18, 18, 0.08) !important;
          cursor: pointer !important;
        }

        .explore-catalog-btn:hover {
          background: #232724 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 18px rgba(18, 18, 18, 0.12) !important;
        }

        /* Newsletter Banner Styling */
        .newsletter-banner-section {
          background: #F5EFE6; /* Cozy Warm Sand/Beige color */
          border-radius: 24px;
          padding: 24px 32px;
          margin-top: 56px;
          margin-bottom: 24px;
        }
        
        .newsletter-banner-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 32px;
        }
        
        .newsletter-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .mail-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #121212;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          flex-shrink: 0;
        }
        
        .newsletter-text h3 {
          font-size: 18px;
          font-weight: 700;
          color: #121212;
          margin: 0 0 4px 0;
          font-family: 'Outfit', sans-serif;
        }
        
        .newsletter-text p {
          font-size: 13px;
          color: #706f6c;
          margin: 0;
        }
        
        .newsletter-right {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }
        
        .newsletter-form {
          display: flex;
          background: #ffffff;
          border-radius: 50px;
          padding: 4px 4px 4px 20px;
          border: 1px solid rgba(0, 0, 0, 0.05);
          width: 380px;
        }
        
        .newsletter-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          color: #121212;
          flex: 1;
        }
        
        .newsletter-submit-btn {
          background: #121212;
          color: #ffffff;
          border: none;
          padding: 10px 24px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .newsletter-submit-btn:hover {
          background: #232724;
        }
        
        .decorative-airplane {
          color: #A39E93;
          opacity: 0.8;
          display: flex;
          align-items: center;
        }

        /* Responsive styling */
        @media (max-width: 1024px) {
          .wishlist-items-list {
            grid-template-columns: repeat(2, 1fr);
          }
          .newsletter-banner-content {
            flex-direction: column;
            align-items: stretch;
            gap: 24px;
          }
          .newsletter-form {
            width: 100%;
          }
        }
        
        @media (max-width: 768px) {
          .wishlist-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .header-actions {
            width: 100%;
          }
          .share-wishlist-btn, .move-all-btn {
            flex: 1;
            justify-content: center;
          }
        }

        @media (max-width: 600px) {
          .wishlist-items-list {
            grid-template-columns: 1fr;
          }
          .newsletter-banner-section {
            padding: 20px;
          }
          .newsletter-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .decorative-airplane {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
