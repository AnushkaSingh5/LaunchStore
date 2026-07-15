'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { reviewService } from '@/services/reviewService';
import PageLoader from '@/components/PageLoader';
import { useRouter } from 'next/navigation';

export default function AdminReviewsModerationPage() {
  const { adminUser, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reasonFilter, setReasonFilter] = useState('All');
  
  // Modal lightboxes
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getAdminReportedReviews();
      setReports(data);
    } catch (e) {
      console.error('Error fetching reported reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/admin/login');
    }
  }, [adminUser, authLoading, router]);

  useEffect(() => {
    if (adminUser) {
      fetchReports();
    }
  }, [adminUser]);

  const handleDismissReport = async (reviewId) => {
    if (!confirm('Are you sure you want to dismiss all reports for this review? The review will remain active.')) return;
    try {
      await reviewService.moderateReview(reviewId, 'dismiss');
      await fetchReports();
    } catch (e) {
      console.error(e);
      alert('Failed to dismiss report.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review? It will be soft-deleted and hidden from storefronts immediately.')) return;
    try {
      await reviewService.moderateReview(reviewId, 'delete');
      // Also dismiss remaining reports since the review is now hidden
      await reviewService.moderateReview(reviewId, 'dismiss');
      await fetchReports();
    } catch (e) {
      console.error(e);
      alert('Failed to delete review.');
    }
  };

  const handleRemoveImages = async (reviewId) => {
    if (!confirm('Are you sure you want to remove all attached images from this review? The review text will remain active.')) return;
    try {
      await reviewService.moderateReview(reviewId, 'remove_images');
      await fetchReports();
    } catch (e) {
      console.error(e);
      alert('Failed to remove images.');
    }
  };

  const handleToggleBanUser = async (customerId, isBanned) => {
    const msg = isBanned 
      ? 'Are you sure you want to BAN this user? They will be blocked from posting or editing reviews across the entire platform.' 
      : 'Are you sure you want to UNBAN this user? They will regain capability to write product reviews.';
    
    if (!confirm(msg)) return;
    try {
      await reviewService.banCustomerFromReviews(customerId, isBanned);
      alert(isBanned ? 'Customer has been banned from posting reviews.' : 'Customer ban has been lifted.');
      await fetchReports();
    } catch (e) {
      console.error(e);
      alert('Failed to update customer ban status.');
    }
  };

  if (authLoading || (loading && reports.length === 0)) {
    return <PageLoader />;
  }

  // Calculate statistics from reports
  const totalReportsCount = reports.length;
  const reasonCounts = {
    Spam: reports.filter(r => r.reason === 'Spam').length,
    'Fake review': reports.filter(r => r.reason === 'Fake review').length,
    'Offensive language': reports.filter(r => r.reason === 'Offensive language').length,
    'Wrong product': reports.filter(r => r.reason === 'Wrong product').length
  };

  const filteredReports = reports.filter(r => {
    if (reasonFilter === 'All') return true;
    return r.reason === reasonFilter;
  });

  return (
    <div className="admin-reviews-moderation-page fade-in">
      {/* Page Header */}
      <div className="page-header-section">
        <div>
          <h1 className="page-title">Review Moderation Queue</h1>
          <p className="page-subtitle">Inspect reported reviews, remove abusive content, delete offensive media, and ban violating accounts.</p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card total">
          <span className="stat-label">Total Active Reports</span>
          <span className="stat-value">{totalReportsCount}</span>
        </div>
        <div className="admin-stat-card spam">
          <span className="stat-label">Spam</span>
          <span className="stat-value">{reasonCounts.Spam}</span>
        </div>
        <div className="admin-stat-card fake">
          <span className="stat-label">Fake Reviews</span>
          <span className="stat-value">{reasonCounts['Fake review']}</span>
        </div>
        <div className="admin-stat-card offensive">
          <span className="stat-label">Offensive Language</span>
          <span className="stat-value">{reasonCounts['Offensive language']}</span>
        </div>
        <div className="admin-stat-card wrong">
          <span className="stat-label">Wrong Product</span>
          <span className="stat-value">{reasonCounts['Wrong product']}</span>
        </div>
      </div>

      {/* Moderation Panel Wrapper */}
      <div className="moderation-panel-card">
        {/* Table/Queue Filter Header */}
        <div className="queue-filter-header">
          <h2 className="queue-title">Pending Reports Queue</h2>
          
          <div className="filters-row">
            <span className="filter-lbl">Reason Filter:</span>
            {['All', 'Spam', 'Fake review', 'Offensive language', 'Wrong product'].map(filter => (
              <button
                key={filter}
                className={`filter-tab-btn ${reasonFilter === filter ? 'active' : ''}`}
                onClick={() => setReasonFilter(filter)}
              >
                {filter === 'All' ? 'All Reports' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="empty-reports-queue">
            <div className="empty-icon">🛡</div>
            <h3>Queue Clear!</h3>
            <p>There are no reported reviews matching the selected filter. Platform health is optimal.</p>
          </div>
        ) : (
          <div className="reports-moderation-list">
            {filteredReports.map(report => {
              const reviewObj = report.review || {};
              const customerObj = reviewObj.customer || {};
              const productObj = reviewObj.product || {};
              const images = reviewObj.review_images || [];
              const isUserBanned = customerObj.banned_from_reviews;

              return (
                <div key={report.id} className="moderation-item-card">
                  {/* Left Column: Report Details & Flag Metadata */}
                  <div className="report-metadata-badge-column">
                    <span className="report-reason-badge">{report.reason}</span>
                    <div className="report-meta-text">
                      <div><strong>Reported By:</strong> {report.reporter?.email || 'System'}</div>
                      <div><strong>Date Reported:</strong> {new Date(report.created_at).toLocaleDateString()}</div>
                    </div>
                    {report.details && (
                      <div className="report-details-bubble">
                        <strong>Reporter Notes:</strong> "{report.details}"
                      </div>
                    )}
                  </div>

                  {/* Center Column: The offending Review itself */}
                  <div className="offending-review-content-column">
                    <div className="review-product-meta-row">
                      <span className="product-text">Product: <strong>{productObj.name || 'Deleted Product'}</strong></span>
                      <span className="store-text">Store: {productObj.store?.name || 'Unknown Store'}</span>
                    </div>

                    <div className="stars-rating-row" style={{ color: '#f59e0b', fontSize: '13px', margin: '4px 0 8px 0', letterSpacing: '1px' }}>
                      {'★'.repeat(reviewObj.rating || 0) + '☆'.repeat(5 - (reviewObj.rating || 0))}
                      {reviewObj.title && <strong style={{ color: '#1e293b', marginLeft: '12px' }}>{reviewObj.title}</strong>}
                    </div>

                    <p className="review-text-content">"{reviewObj.description || 'No description provided'}"</p>

                    {/* Review Attached Media */}
                    {images.length > 0 && (
                      <div className="review-attached-images-row">
                        {images.map(img => (
                          <div 
                            key={img.id} 
                            className="review-img-box"
                            onClick={() => setActiveLightboxImg(img.image_url)}
                            title="Click to view full image"
                          >
                            <img src={img.image_url} alt="Reported Media" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="reviewer-identity-signature">
                      <span>Reviewer: <strong>{customerObj.full_name || 'Anonymous'}</strong> ({customerObj.email || 'No email'})</span>
                      {reviewObj.is_verified && <span className="verified-purchase-lbl">✔ Verified Purchase</span>}
                      {isUserBanned && <span className="banned-status-pill">BANNED FROM REVIEWS</span>}
                    </div>
                  </div>

                  {/* Right Column: Moderation actions */}
                  <div className="moderation-controls-actions-column">
                    <button 
                      className="mod-btn approve-btn"
                      onClick={() => handleDismissReport(reviewObj.id)}
                      title="Dismiss reports and keep review online"
                    >
                      Dismiss Report
                    </button>
                    
                    <button 
                      className="mod-btn hide-review-btn"
                      onClick={() => handleDeleteReview(reviewObj.id)}
                      title="Soft delete review and hide from store"
                    >
                      Delete/Hide Review
                    </button>

                    {images.length > 0 && (
                      <button 
                        className="mod-btn strip-media-btn"
                        onClick={() => handleRemoveImages(reviewObj.id)}
                        title="Remove all uploaded images from review"
                      >
                        Remove Images Only
                      </button>
                    )}

                    {customerObj.id && (
                      <button 
                        className={`mod-btn ${isUserBanned ? 'unban-user-btn' : 'ban-user-btn'}`}
                        onClick={() => handleToggleBanUser(customerObj.id, !isUserBanned)}
                      >
                        {isUserBanned ? 'Lift User Ban' : 'Ban User from Reviews'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Lightbox Overlay */}
      {activeLightboxImg && (
        <div className="lightbox-overlay fade-in" onClick={() => setActiveLightboxImg(null)}>
          <div className="lightbox-content-card">
            <img src={activeLightboxImg} alt="Lightbox Admin Moderation media preview" />
            <button 
              className="close-lightbox-btn"
              onClick={() => setActiveLightboxImg(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-reviews-moderation-page {
          padding: 24px 0 60px 0;
          font-family: 'Outfit', sans-serif;
        }
        .page-header-section {
          margin-bottom: 32px;
        }
        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .page-subtitle {
          color: #64748b;
          font-size: 14px;
        }

        /* Stats grid cards */
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .admin-stat-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);
        }
        .admin-stat-card .stat-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        .admin-stat-card .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
        }
        .admin-stat-card.total {
          border-left: 4px solid #8b5cf6;
        }
        .admin-stat-card.spam {
          border-left: 4px solid #f43f5e;
        }
        .admin-stat-card.fake {
          border-left: 4px solid #f59e0b;
        }
        .admin-stat-card.offensive {
          border-left: 4px solid #ef4444;
        }
        .admin-stat-card.wrong {
          border-left: 4px solid #3b82f6;
        }

        /* Moderation panel queue card */
        .moderation-panel-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.01);
        }
        .queue-filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .queue-title {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
        }
        .filters-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .filter-lbl {
          font-size: 13px;
          color: #64748b;
          font-weight: 700;
        }
        .filter-tab-btn {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-tab-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }
        .filter-tab-btn.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .empty-reports-queue {
          text-align: center;
          padding: 80px 24px;
        }
        .empty-reports-queue .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .empty-reports-queue h3 {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .empty-reports-queue p {
          font-size: 13px;
          color: #64748b;
          max-width: 340px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Reports List */
        .reports-moderation-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .moderation-item-card {
          display: grid;
          grid-template-columns: 240px 1fr 220px;
          gap: 30px;
          padding: 24px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #ffffff;
          transition: all 0.25s ease;
        }
        .moderation-item-card:hover {
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
          border-color: #cbd5e1;
        }

        /* Left col report meta */
        .report-metadata-badge-column {
          border-right: 1px solid #f1f5f9;
          padding-right: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-self: start;
        }
        .report-reason-badge {
          align-self: start;
          font-size: 11px;
          font-weight: 800;
          color: #ef4444;
          background: #fef2f2;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #fca5a5;
        }
        .report-meta-text {
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .report-details-bubble {
          font-size: 12px;
          background: #f8fafc;
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          color: #334155;
          font-style: italic;
          word-break: break-word;
          line-height: 1.4;
        }

        /* Center Column Offending review details */
        .offending-review-content-column {
          display: flex;
          flex-direction: column;
        }
        .review-product-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 6px;
        }
        .product-text {
          color: #475569;
        }
        .store-text {
          color: #94a3b8;
          font-weight: 600;
        }
        .review-text-content {
          font-size: 14px;
          line-height: 1.6;
          color: #334155;
          font-style: italic;
          margin-bottom: 12px;
        }
        .reviewer-identity-signature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #64748b;
          margin-top: auto;
          padding-top: 12px;
        }
        .verified-purchase-lbl {
          color: #10b981;
          font-weight: 700;
          background: #ecfdf5;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 10px;
        }
        .banned-status-pill {
          color: #ffffff;
          background: #ef4444;
          font-weight: 800;
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .review-attached-images-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .review-img-box {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #cbd5e1;
          cursor: zoom-in;
          transition: transform 0.2s ease;
        }
        .review-img-box:hover {
          transform: scale(1.05);
        }
        .review-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Right column moderation buttons */
        .moderation-controls-actions-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
          justify-content: center;
        }
        .mod-btn {
          width: 100%;
          border: none;
          padding: 10px 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          text-align: center;
          transition: all 0.2s ease;
        }
        .approve-btn {
          background: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        }
        .approve-btn:hover {
          background: #d1fae5;
          transform: translateY(-1px);
        }
        .hide-review-btn {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        .hide-review-btn:hover {
          background: #fee2e2;
          transform: translateY(-1px);
        }
        .strip-media-btn {
          background: #f8fafc;
          color: #475569;
          border: 1px solid #cbd5e1;
        }
        .strip-media-btn:hover {
          background: #f1f5f9;
        }
        .ban-user-btn {
          background: #1e293b;
          color: #ffffff;
        }
        .ban-user-btn:hover {
          background: #0f172a;
        }
        .unban-user-btn {
          background: #e2e8f0;
          color: #475569;
        }
        .unban-user-btn:hover {
          background: #cbd5e1;
        }

        /* Lightbox overlay styles */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .lightbox-content-card {
          position: relative;
          max-width: 600px;
          max-height: 600px;
          border-radius: 12px;
          overflow: hidden;
          background: #000000;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .lightbox-content-card img {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          display: block;
        }
        .close-lightbox-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        @media (max-width: 1200px) {
          .admin-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .moderation-item-card {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .report-metadata-badge-column {
            border-right: none;
            border-bottom: 1px solid #f1f5f9;
            padding-right: 0;
            padding-bottom: 16px;
            width: 100%;
          }
        }
        @media (max-width: 640px) {
          .admin-stats-grid {
            grid-template-columns: 1fr;
          }
          .queue-filter-header {
            flex-direction: column;
            align-items: start;
            gap: 16px;
          }
          .filters-row {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
