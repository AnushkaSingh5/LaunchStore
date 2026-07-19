'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import DemoStoreBanner from '@/components/DemoStoreBanner';
import { demoStores } from '@/lib/demoData';

const getMockReviews = (prodName) => {
  return [
    {
      id: 'rev-1',
      reviewer_name: 'Aniket Sharma',
      rating: 5,
      title: 'Outstanding quality and fit!',
      description: `Absolutely love this product. The material feels premium, durable, and is super comfortable to use daily. Definitely worth the price!`,
      date: 'June 14, 2026',
      verified: true,
    },
    {
      id: 'rev-2',
      reviewer_name: 'Priya Patel',
      rating: 4,
      title: 'Very good product, minor packaging damage',
      description: `The product itself is amazing and functions exactly as described. The only issue was the outer box was a bit crushed, but inside it was perfectly protected.`,
      date: 'May 28, 2026',
      verified: true,
    },
    {
      id: 'rev-3',
      reviewer_name: 'Rahul Varma',
      rating: 5,
      title: 'Minimalist & Elegant',
      description: `Exceeded my expectations! The design aesthetics blend beautifully with my home setup. Customer service was also very responsive.`,
      date: 'April 10, 2026',
      verified: false,
    }
  ];
};

export default function ProductDetailsClient({ slug, id }) {
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [youMayAlsoLike, setYouMayAlsoLike] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [storeDetails, setStoreDetails] = useState(null);
  const router = useRouter();

  const [reviewsList, setReviewsList] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setReviewsList(getMockReviews(product.name));
    }
  }, [product]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!formDescription.trim()) {
      alert('Please fill out the review description.');
      return;
    }
    const newReview = {
      id: `rev-${Date.now()}`,
      reviewer_name: 'You (Demo User)',
      rating: formRating,
      title: formTitle,
      description: formDescription,
      date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      verified: true
    };
    setReviewsList(prev => [newReview, ...prev]);
    setFormTitle('');
    setFormDescription('');
    setFormRating(5);
    setShowReviewForm(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const reviewStats = {
    review_count: reviewsList.length,
    average_rating: reviewsList.length > 0 ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length) : 0,
    stars_5: reviewsList.filter(r => r.rating === 5).length,
    stars_4: reviewsList.filter(r => r.rating === 4).length,
    stars_3: reviewsList.filter(r => r.rating === 3).length,
    stars_2: reviewsList.filter(r => r.rating === 2).length,
    stars_1: reviewsList.filter(r => r.rating === 1).length
  };

  useEffect(() => {
    setLoading(true);
    const store = demoStores[slug];
    if (store) {
      setStoreDetails(store);
      const prod = store.products.find(p => p.id === id);
      if (prod) {
        setProduct({ ...prod, store_slug: slug });
        let related = store.products.filter(p => p.category === prod.category && p.id !== prod.id);
        if (related.length === 0) {
          related = store.products.filter(p => p.id !== prod.id).slice(0, 4);
        }
        setRelatedProducts(related);
        const relatedIds = related.map(r => r.id);
        const other = store.products.filter(p => p.id !== prod.id && !relatedIds.includes(p.id));
        setYouMayAlsoLike(other);
      }
    }
    setLoading(false);
  }, [id, slug]);

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      router.push(`/demo-store/${slug}/cart`);
    }
  };

  if (loading && !product) {
    return (
      <div className="loading-screen">
        <p>Loading Product...</p>
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
          }
          .glass-card h2 {
            font-size: 24px;
            margin-bottom: 16px;
            color: #f43f5e;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
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
          <p>We couldn't find the product details in this store.</p>
          <Link href={`/demo-store/${slug}`} className="back-link">Return to Store</Link>
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
          }
          .glass-card h2 {
            font-size: 24px;
            margin-bottom: 16px;
            color: #f43f5e;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
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
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <DemoStoreBanner />
      <Navbar storeName={storeDetails.name} />

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
              <div className="stars" style={{ color: '#f59e0b', fontSize: '16px' }}>
                {'★'.repeat(Math.round(reviewStats.average_rating)) + '☆'.repeat(5 - Math.round(reviewStats.average_rating))}
              </div>
              <span className="reviews">
                ({reviewStats.review_count} {reviewStats.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            <p className="description">
              {product.description || `Experience unparalleled quality and minimalist design. This ${product.name.toLowerCase()} is crafted from premium materials to elevate your lifestyle and provide lasting comfort and style.`}
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

        {/* ==========================================
            RATINGS & PRODUCT REVIEWS SECTION
           ========================================== */}
        <section className="product-reviews-ratings-container dashboard-card fade-in" id="reviews-section" style={{ marginTop: '40px' }}>
          <div className="reviews-section-header">
            <h2 className="reviews-section-title">Customer Reviews & Ratings</h2>
            <p className="reviews-section-subtitle">Real feedback from verified buyers across the platform.</p>
          </div>

          <div className="reviews-layout-grid">
            {/* Left Column: Aggregated stats and eligibility */}
            <div className="reviews-stats-summary-card">
              <div className="avg-rating-block">
                <span className="avg-score">{reviewStats.average_rating > 0 ? reviewStats.average_rating.toFixed(1) : '0.0'}</span>
                <div className="stars-row" style={{ color: '#f59e0b', fontSize: '20px', letterSpacing: '1px', marginBottom: '8px' }}>
                  {'★'.repeat(Math.round(reviewStats.average_rating)) + '☆'.repeat(5 - Math.round(reviewStats.average_rating))}
                </div>
                <span className="based-on">Based on {reviewStats.review_count} {reviewStats.review_count === 1 ? 'review' : 'reviews'}</span>
              </div>

              {/* Progress bars */}
              <div className="rating-distribution-list">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = reviewStats[`stars_${stars}`] || 0;
                  const total = reviewStats.review_count || 1;
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={stars} className="distribution-row">
                      <span className="star-label">{stars} ★</span>
                      <div className="progress-bar-track">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="count-label">{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Eligibility & form launch block */}
              <div className="review-eligibility-block" id="review-form-anchor">
                <div className="eligible-box">
                  <p className="eligibility-msg-success">
                    ✔ You are logged in as a verified buyer! Your review will have a verified purchase badge.
                  </p>
                  <button 
                    className="write-review-toggle-btn"
                    onClick={() => {
                      setFormRating(5);
                      setFormTitle('');
                      setFormDescription('');
                      setShowReviewForm(!showReviewForm);
                    }}
                  >
                    {showReviewForm ? 'Cancel Review' : 'Write a Product Review'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Reviews List & submission form */}
            <div className="reviews-list-column">
              {submitSuccess && (
                <div className="form-success-alert" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: '600', fontSize: '13px' }}>
                  ✔ Review submitted successfully! Thank you for sharing your feedback.
                </div>
              )}

              {/* Submission Form */}
              {showReviewForm && (
                <form className="review-submission-form fade-in" onSubmit={handleSubmitReview}>
                  <h3 className="form-title-head">Share Your Experience</h3>

                  <div className="form-group">
                    <label className="form-label-bold">Overall Rating <span style={{ color: 'red' }}>*</span></label>
                    <div className="form-stars-picker">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-pick-btn ${star <= formRating ? 'active' : ''}`}
                          onClick={() => setFormRating(star)}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-title" className="form-label-bold">Review Title <span className="label-optional">(Optional)</span></label>
                    <input
                      id="review-title"
                      type="text"
                      className="form-text-input"
                      placeholder="e.g. Amazing quality, highly recommend!"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-description" className="form-label-bold">Review Description <span style={{ color: 'red' }}>*</span></label>
                    <textarea
                      id="review-description"
                      rows="4"
                      className="form-textarea-input"
                      placeholder="Share details about what you liked or disliked, material quality, fit, etc."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="form-btn-secondary"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="form-btn-primary"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews count header */}
              <div className="reviews-list-filters-header">
                <span className="reviews-count-header">
                  {reviewsList.length > 0 ? `${reviewsList.length} feedback entries` : 'Reviews'}
                </span>
              </div>

              {/* Reviews List */}
              {reviewsList.length === 0 ? (
                <div className="empty-reviews-state">
                  <div className="empty-icon">💬</div>
                  <h3>No Reviews Yet</h3>
                  <p>Be the first to share your thoughts about this product!</p>
                </div>
              ) : (
                <div className="reviews-cards-list">
                  {reviewsList.map(review => (
                    <div key={review.id} className="review-card-item fade-in">
                      {/* Header: User avatar and name */}
                      <div className="review-card-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#475569' }}>
                            <span>{(review.reviewer_name.charAt(0)).toUpperCase()}</span>
                          </div>
                          <div className="reviewer-meta">
                            <div className="reviewer-name-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="reviewer-name" style={{ fontWeight: '700', fontSize: '14px' }}>{review.reviewer_name}</span>
                              {review.verified && (
                                <span className="verified-purchase-badge" style={{ fontSize: '10px', color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>✔ Verified Purchase</span>
                              )}
                            </div>
                            <span className="review-date" style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{review.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating and Title */}
                      <div className="review-card-rating-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                        <div className="stars-visual" style={{ color: '#f59e0b', letterSpacing: '1px' }}>
                          {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                        </div>
                        {review.title && <h4 className="review-card-title" style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{review.title}</h4>}
                      </div>

                      {/* Description */}
                      <p className="review-card-description" style={{ fontSize: '13.5px', color: '#475569', lineHeight: '1.6', margin: 0 }}>{review.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="related-section" style={{ marginBottom: '60px' }}>
            <div className="section-header">
              <h2 className="section-title">Related Products</h2>
              <p className="section-subtitle">You might also like these pieces from the {product.category} collection.</p>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={{ ...p, store_slug: slug }} />
              ))}
            </div>
          </section>
        )}

        {youMayAlsoLike.length > 0 && (
          <section className="related-section" style={{ marginTop: '40px' }}>
            <div className="section-header">
              <h2 className="section-title">You May Also Like</h2>
              <p className="section-subtitle">Discover popular products from other categories.</p>
            </div>
            <div className="products-grid">
              {youMayAlsoLike.map(p => (
                <ProductCard key={p.id} product={{ ...p, store_slug: slug }} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer storeName={storeDetails.name} />

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

        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-sub);
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

        /* Reviews CSS styles */
        .product-reviews-ratings-container {
          background: var(--white);
          padding: 40px;
          border-radius: var(--radius-md);
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 24px;
        }
        .reviews-section-header {
          margin-bottom: 32px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 20px;
        }
        .reviews-section-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .reviews-section-subtitle {
          color: var(--text-sub);
          font-size: 14px;
        }
        .reviews-layout-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 40px;
        }
        .reviews-stats-summary-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 24px;
          align-self: start;
        }
        .avg-rating-block {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .avg-score {
          font-size: 48px;
          font-weight: 800;
          color: var(--text-main);
          display: block;
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .based-on {
          font-size: 13px;
          color: var(--text-sub);
          display: block;
          margin-top: 6px;
        }
        .rating-distribution-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .distribution-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
        }
        .star-label {
          width: 32px;
          color: var(--text-main);
          font-weight: 700;
        }
        .progress-bar-track {
          flex: 1;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          position: relative;
        }
        .progress-bar-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .count-label {
          width: 24px;
          text-align: right;
          color: var(--text-sub);
        }
        .review-eligibility-block {
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .eligible-box {
          text-align: center;
        }
        .eligibility-msg-success {
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .write-review-toggle-btn {
          width: 100%;
          background: var(--primary, #121212);
          color: var(--white, #fff);
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .write-review-toggle-btn:hover {
          background: var(--accent);
          transform: translateY(-1px);
        }
        .review-submission-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 30px;
        }
        .form-title-head {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 16px;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-label-bold {
          display: block;
          font-weight: 700;
          font-size: 13px;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .label-optional {
          font-weight: 400;
          color: var(--text-sub);
          font-size: 12px;
        }
        .form-stars-picker {
          display: flex;
          gap: 6px;
        }
        .star-pick-btn {
          font-size: 32px;
          color: #cbd5e1;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: color 0.1s ease;
          padding: 0;
          line-height: 1;
        }
        .star-pick-btn.active, .star-pick-btn:hover {
          color: #f59e0b;
        }
        .form-text-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 14px;
          color: var(--text-main);
        }
        .form-text-input:focus, .form-textarea-input:focus {
          border-color: var(--accent);
          outline: none;
        }
        .form-textarea-input {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 14px;
          color: var(--text-main);
          resize: vertical;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 10px;
        }
        .form-btn-secondary {
          background: transparent;
          border: 1px solid #cbd5e1;
          color: var(--text-sub);
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .form-btn-secondary:hover {
          background: #f1f5f9;
          color: var(--text-main);
        }
        .form-btn-primary {
          background: var(--primary, #121212);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .form-btn-primary:hover {
          background: var(--accent);
        }
        .reviews-list-filters-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .reviews-count-header {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }
        .review-card-item {
          background: #ffffff;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 30px;
          margin-bottom: 30px;
        }
        .review-card-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }
        .review-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 14px;
        }
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .reviewer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #475569;
        }
        .reviewer-meta {
          display: flex;
          flex-direction: column;
        }
        .reviewer-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .reviewer-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }
        .verified-purchase-badge {
          font-size: 10px;
          font-weight: 700;
          color: #10b981;
          background: #ecfdf5;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .review-date {
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 2px;
        }
        @media (max-width: 900px) {
          .reviews-layout-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
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
