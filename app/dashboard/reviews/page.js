'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { reviewService } from '@/services/reviewService';
import PageLoader from '@/components/PageLoader';

export default function SellerReviewsPage() {
  const { store, loading: authLoading } = useAuth();
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSort, setFilterSort] = useState('Newest');
  
  // Reply states
  const [activeReplyFormId, setActiveReplyFormId] = useState(null);
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState({});

  const fetchReviews = async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const data = await reviewService.getSellerReviews(store.id);
      setAllReviews(data);
    } catch (e) {
      console.error('Error fetching seller reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store?.id) {
      fetchReviews();
    }
  }, [store?.id]);

  useEffect(() => {
    let result = [...allReviews];

    if (filterSort === 'Newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filterSort === 'Highest Rating') {
      result.sort((a, b) => b.rating - a.rating || new Date(b.created_at) - new Date(a.created_at));
    } else if (filterSort === 'Lowest Rating') {
      result.sort((a, b) => a.rating - b.rating || new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredReviews(result);
  }, [allReviews, filterSort]);

  // Statistics calculation
  const getStats = () => {
    if (allReviews.length === 0) {
      return {
        avgRating: 0,
        totalCount: 0,
        distributions: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        mostReviewed: [],
        lowestRated: []
      };
    }
    
    let totalScore = 0;
    const distributions = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const productGroups = {}; // key: productId
    
    allReviews.forEach(r => {
      totalScore += r.rating;
      distributions[r.rating] = (distributions[r.rating] || 0) + 1;
      
      const pId = r.product?.id || 'unknown';
      const pName = r.product?.name || 'Deleted Product';
      
      if (!productGroups[pId]) {
        productGroups[pId] = { id: pId, name: pName, ratings: [] };
      }
      productGroups[pId].ratings.push(r.rating);
    });
    
    const avgRating = totalScore / allReviews.length;
    
    const productStats = Object.values(productGroups).map(group => {
      const avg = group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length;
      return {
        id: group.id,
        name: group.name,
        count: group.ratings.length,
        avgRating: avg
      };
    });
    
    const mostReviewed = [...productStats].sort((a, b) => b.count - a.count).slice(0, 5);
    const lowestRated = [...productStats].sort((a, b) => a.avgRating - b.avgRating).slice(0, 5);
    
    return {
      avgRating,
      totalCount: allReviews.length,
      distributions,
      mostReviewed,
      lowestRated
    };
  };

  const handleReplySubmit = async (e, reviewId) => {
    e.preventDefault();
    const replyText = replyInputs[reviewId];
    if (!replyText || !replyText.trim()) return;

    setReplyLoading(prev => ({ ...prev, [reviewId]: true }));
    try {
      await reviewService.submitReply(reviewId, store.id, replyText);
      // Reload reviews
      const data = await reviewService.getSellerReviews(store.id);
      setAllReviews(data);
      // Reset input
      setReplyInputs(prev => ({ ...prev, [reviewId]: '' }));
      setActiveReplyFormId(null);
    } catch (err) {
      console.error(err);
      alert('Failed to submit reply.');
    } finally {
      setReplyLoading(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleDeleteReplyClick = async (replyId) => {
    if (!confirm('Are you sure you want to delete your response?')) return;
    try {
      await reviewService.deleteReply(replyId);
      // Reload reviews
      const data = await reviewService.getSellerReviews(store.id);
      setAllReviews(data);
    } catch (err) {
      console.error(err);
      alert('Failed to delete response.');
    }
  };

  if (authLoading || (loading && allReviews.length === 0)) {
    return <PageLoader />;
  }

  const stats = getStats();

  return (
    <>
      <div className="reviews-dashboard-page container fade-in">
        {/* Page Header */}
        <div className="page-header-section">
          <div>
            <h1 className="page-title">Reviews & Ratings</h1>
            <p className="page-subtitle">Understand customer feedback and respond to reviews dynamically.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-dashboard-grid">
          {/* Summary Stat Card */}
          <div className="dashboard-metric-card summary-card">
            <div className="avg-metric-block">
              <span className="avg-metric-val">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}</span>
              <div className="stars-row" style={{ color: '#f59e0b', fontSize: '18px', letterSpacing: '1px' }}>
                {'★'.repeat(Math.round(stats.avgRating)) + '☆'.repeat(5 - Math.round(stats.avgRating))}
              </div>
              <span className="total-metric-lbl">Based on {stats.totalCount} reviews</span>
            </div>

            <div className="dist-meter-list">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = stats.distributions[stars] || 0;
                const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
                return (
                  <div key={stars} className="dist-meter-row">
                    <span className="dist-lbl">{stars}★</span>
                    <div className="dist-bar-track">
                      <div className="dist-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="dist-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Product Insights Lists */}
          <div className="dashboard-metric-card rankings-card">
            <h3 className="card-inner-title">Lowest Rated Products</h3>
            {stats.lowestRated.length === 0 ? (
              <div className="empty-insights-state">No ratings available yet.</div>
            ) : (
              <ul className="rankings-list">
                {stats.lowestRated.map(p => (
                  <li key={p.id} className="ranking-item">
                    <span className="item-name">{p.name}</span>
                    <div className="item-score-block">
                      <span className="score-badge error-badge">{p.avgRating.toFixed(1)} ★</span>
                      <span className="reviews-sub-lbl">({p.count} rev)</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="dashboard-metric-card rankings-card">
            <h3 className="card-inner-title">Most Reviewed Products</h3>
            {stats.mostReviewed.length === 0 ? (
              <div className="empty-insights-state">No reviews posted yet.</div>
            ) : (
              <ul className="rankings-list">
                {stats.mostReviewed.map(p => (
                  <li key={p.id} className="ranking-item">
                    <span className="item-name">{p.name}</span>
                    <div className="item-score-block">
                      <span className="score-badge info-badge">{p.count} reviews</span>
                      <span className="reviews-sub-lbl">({p.avgRating.toFixed(1)} ★)</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Reviews Manager Card */}
        <div className="reviews-manager-card dashboard-card">
          <div className="card-header-filters">
            <h2 className="card-section-title">Customer Feedback Queue</h2>
            
            <div className="filters-dropdown-wrapper">
              <span className="filter-lbl">Filter:</span>
              <select
                className="filter-select-input"
                value={filterSort}
                onChange={(e) => setFilterSort(e.target.value)}
              >
                <option value="Newest">Newest Reviews</option>
                <option value="Highest Rating">Highest Ratings</option>
                <option value="Lowest Rating">Lowest Ratings</option>
              </select>
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="empty-feedback-state">
              <div className="empty-icon">💬</div>
              <h3>No Reviews Found</h3>
              <p>Customers have not posted any reviews for your products yet.</p>
            </div>
          ) : (
            <div className="feedback-list">
              {filteredReviews.map(review => (
                <div key={review.id} className="feedback-item-card">
                  {/* Left Column: Rating, review title, description */}
                  <div className="feedback-content-col">
                    <div className="review-product-title-row">
                      <span className="product-tag">{review.product?.name || 'Deleted Product'}</span>
                      <span className="feedback-date">
                        {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="rating-row" style={{ color: '#f59e0b', fontSize: '13px', margin: '6px 0 10px 0', letterSpacing: '1px' }}>
                      {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                      {review.title && <strong style={{ color: '#1e293b', marginLeft: '12px', fontSize: '14px' }}>{review.title}</strong>}
                    </div>

                    <p className="feedback-desc">"{review.description}"</p>

                    <div className="customer-signature-row">
                      <span className="customer-name">By: {review.customer?.full_name || 'Verified Customer'}</span>
                      {review.is_verified && <span className="verified-badge">✔ Verified Purchase</span>}
                    </div>

                    {/* Inline Seller Reply Block if reply exists */}
                    {review.seller_replies && review.seller_replies.length > 0 && (
                      <div className="seller-reply-bubble">
                        <div className="reply-bubble-header">
                          <span>Your Response</span>
                          <button 
                            className="delete-reply-btn"
                            onClick={() => handleDeleteReplyClick(review.seller_replies[0].id)}
                          >
                            Delete Response
                          </button>
                        </div>
                        <p className="reply-body-text">{review.seller_replies[0].reply_text}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Action triggers */}
                  <div className="feedback-actions-col">
                    {(!review.seller_replies || review.seller_replies.length === 0) && (
                      <>
                        {activeReplyFormId === review.id ? (
                          <form className="reply-submit-form" onSubmit={(e) => handleReplySubmit(e, review.id)}>
                            <textarea
                              rows="3"
                              className="reply-textarea-input"
                              placeholder="Write a professional response to this customer..."
                              value={replyInputs[review.id] || ''}
                              onChange={(e) => setReplyInputs(prev => ({ ...prev, [review.id]: e.target.value }))}
                            ></textarea>
                            <div className="reply-form-actions">
                              <button 
                                type="button" 
                                className="reply-cancel-btn"
                                onClick={() => setActiveReplyFormId(null)}
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="reply-save-btn"
                                disabled={replyLoading[review.id]}
                              >
                                {replyLoading[review.id] ? 'Submitting...' : 'Post Reply'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button 
                            className="post-reply-btn-trigger"
                            onClick={() => {
                              setActiveReplyFormId(review.id);
                              setReplyInputs(prev => ({ ...prev, [review.id]: '' }));
                            }}
                          >
                            Reply to Review
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .reviews-dashboard-page {
          padding-bottom: 60px;
          font-family: 'Outfit', sans-serif;
        }
        .page-header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }
        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .page-subtitle {
          color: #64748b;
          font-size: 14px;
        }

        /* Stats Grid */
        .stats-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }
        .dashboard-metric-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(0, 0, 0, 0.03);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.01);
        }
        .summary-card {
          display: grid;
          grid-template-columns: 110px 1fr;
          gap: 20px;
          align-items: center;
        }
        .avg-metric-block {
          text-align: center;
          border-right: 1px solid #f1f5f9;
          padding-right: 12px;
        }
        .avg-metric-val {
          font-size: 38px;
          font-weight: 800;
          color: #1e293b;
          display: block;
          line-height: 1.1;
          margin-bottom: 2px;
        }
        .total-metric-lbl {
          font-size: 11px;
          color: #64748b;
          display: block;
          margin-top: 4px;
        }
        
        .dist-meter-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dist-meter-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }
        .dist-lbl {
          width: 24px;
          color: #475569;
          font-weight: 700;
        }
        .dist-bar-track {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 3px;
          overflow: hidden;
        }
        .dist-bar-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 3px;
        }
        .dist-count {
          width: 16px;
          text-align: right;
          color: #94a3b8;
        }

        /* Product Insight lists */
        .rankings-card {
          display: flex;
          flex-direction: column;
        }
        .card-inner-title {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
        }
        .empty-insights-state {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 13px;
          font-style: italic;
        }
        .rankings-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ranking-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          border-bottom: 1px dashed #f1f5f9;
          padding-bottom: 8px;
          min-width: 0;
          width: 100%;
        }
        .ranking-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .item-name {
          color: #334155;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          margin-right: 12px;
          min-width: 0;
        }
        .item-score-block {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .score-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .score-badge.error-badge {
          background: #fef2f2;
          color: #ef4444;
        }
        .score-badge.info-badge {
          background: #eff6ff;
          color: #3b82f6;
        }
        .reviews-sub-lbl {
          font-size: 10px;
          color: #94a3b8;
        }

        /* Reviews manager card */
        .reviews-manager-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid rgba(0, 0, 0, 0.03);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.01);
        }
        .card-header-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .card-section-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
        }
        .filters-dropdown-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .filter-lbl {
          font-size: 13px;
          color: #64748b;
          font-weight: 600;
        }
        .filter-select-input {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          cursor: pointer;
        }
        
        .empty-feedback-state {
          text-align: center;
          padding: 60px 24px;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
        }
        .empty-feedback-state h3 {
          font-size: 16px;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 8px;
        }
        .empty-feedback-state p {
          color: #64748b;
          font-size: 13px;
          max-width: 320px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Feedback items */
        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .feedback-item-card {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 30px;
          padding: 24px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          transition: all 0.25s ease;
        }
        .feedback-item-card:hover {
          border-color: #e2e8f0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
          transform: translateY(-2px);
        }
        .feedback-content-col {
          display: flex;
          flex-direction: column;
        }
        .review-product-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .product-tag {
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .feedback-date {
          font-size: 12px;
          color: #94a3b8;
        }
        .feedback-desc {
          font-size: 14px;
          line-height: 1.6;
          color: #475569;
          margin-bottom: 12px;
          font-style: italic;
        }
        .customer-signature-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 16px;
        }
        .customer-name {
          font-weight: 600;
        }
        .verified-badge {
          color: #10b981;
          font-weight: 700;
          background: #ecfdf5;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
        }

        /* Reply bubble */
        .seller-reply-bubble {
          background: #f8fafc;
          border-left: 3px solid #6366f1;
          border-radius: 0 12px 12px 0;
          padding: 14px 16px;
        }
        .reply-bubble-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          font-weight: 800;
          color: #6366f1;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .delete-reply-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          font-weight: 700;
          font-size: 11px;
          cursor: pointer;
        }
        .delete-reply-btn:hover {
          text-decoration: underline;
        }
        .reply-body-text {
          font-size: 13px;
          color: #475569;
          line-height: 1.5;
        }

        /* Actions panel */
        .feedback-actions-col {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .post-reply-btn-trigger {
          background: #1e293b;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.25s ease;
          width: 100%;
          text-align: center;
        }
        .post-reply-btn-trigger:hover {
          background: #6366f1;
          transform: translateY(-1px);
        }

        /* Reply form */
        .reply-submit-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .reply-textarea-input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 13px;
          color: #1e293b;
          resize: vertical;
        }
        .reply-textarea-input:focus {
          border-color: #6366f1;
          outline: none;
          background: #ffffff;
        }
        .reply-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .reply-cancel-btn {
          background: transparent;
          border: 1px solid #cbd5e1;
          color: #64748b;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }
        .reply-cancel-btn:hover {
          background: #f1f5f9;
        }
        .reply-save-btn {
          background: #6366f1;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .reply-save-btn:hover {
          background: #4f46e5;
        }

        @media (max-width: 1024px) {
          .stats-dashboard-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .feedback-item-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .feedback-actions-col {
            width: 100%;
            justify-content: stretch;
          }
          .post-reply-btn-trigger {
            width: 100% !important;
            display: block;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .page-header-section {
            margin-bottom: 20px;
          }
          .stats-dashboard-grid {
            gap: 16px;
            margin-bottom: 24px;
          }
          .dashboard-metric-card {
            padding: 16px;
          }
          .summary-card {
            grid-template-columns: 90px 1fr;
            gap: 12px;
          }
          .avg-metric-val {
            font-size: 32px;
          }
           .reviews-manager-card {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .card-header-filters {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding-bottom: 0 !important;
            margin-bottom: 20px !important;
            border-bottom: none !important;
          }
          .card-section-title {
            font-size: 20px !important;
            margin: 0;
          }
          .filters-dropdown-wrapper {
            width: 100%;
            justify-content: space-between;
          }
          .filter-select-input {
            flex: 1;
            max-width: 200px;
          }
          .feedback-item-card {
            padding: 16px;
          }
          .reply-submit-form {
            width: 100%;
          }
          .reply-form-actions {
            width: 100%;
            justify-content: space-between;
          }
          .reply-cancel-btn, .reply-save-btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}
