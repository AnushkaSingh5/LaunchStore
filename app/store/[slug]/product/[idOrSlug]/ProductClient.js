'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { reviewService } from '@/services/reviewService';
import StoreUnderReview from '@/components/StoreUnderReview';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PageLoader from '@/components/PageLoader';

export default function ProductClient({ slug, initialStoreDetails, initialProduct, initialRelatedProducts }) {
  const { addToCart } = useStore();
  const [product, setProduct] = useState(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState(initialRelatedProducts || []);
  const [quantity, setQuantity] = useState(1);
  const [storeDetails, setStoreDetails] = useState(initialStoreDetails);
  const [activeImage, setActiveImage] = useState(initialProduct?.image || initialProduct?.image_url);
  const router = useRouter();

  // Authentication & Reviews states
  const { customer, customerProfile } = useCustomerAuth();
  const currentCustomerId = customerProfile?.id;

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    average_rating: 0,
    review_count: 0,
    stars_1: 0,
    stars_2: 0,
    stars_3: 0,
    stars_4: 0,
    stars_5: 0
  });

  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [eligibility, setEligibility] = useState({ canReview: false, reason: '' });
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  // Reviews page state
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSort, setReviewsSort] = useState('Newest');
  const [reviewsVerifiedOnly, setReviewsVerifiedOnly] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Review form fields
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFiles, setFormFiles] = useState([]); // File objects
  const [formFilePreviews, setFormFilePreviews] = useState([]); // Base64 URLs
  const [editingReviewId, setEditingReviewId] = useState(null); // If editing
  const [existingImagesLeft, setExistingImagesLeft] = useState([]); // Existing URLs left when editing

  // Reporting states
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Lightbox preview state
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Specifications builder
  const getProductSpecs = (p) => {
    if (!p) return [];
    
    // If the database has custom specifications defined, use those!
    if (p.spec_dimensions || p.spec_material || p.spec_finish || p.spec_warranty || p.spec_origin) {
      return [
        { label: 'Dimensions', value: p.spec_dimensions || 'Standard size' },
        { label: 'Material', value: p.spec_material || 'Premium sustainably sourced materials' },
        { label: 'Finish', value: p.spec_finish || 'Satin matte protective coating' },
        { label: 'Warranty', value: p.spec_warranty || '2 Year Manufacturer Warranty' },
        { label: 'Origin', value: p.spec_origin || 'Designed & Crafted locally' }
      ].filter(spec => spec.value);
    }

    const name = (p.name || '').toLowerCase();
    if (name.includes('chair') || name.includes('stool')) {
      return [
        { label: 'Dimensions', value: '55cm x 55cm x 85cm' },
        { label: 'Weight Capacity', value: 'Up to 150 kg' },
        { label: 'Material', value: 'Solid Oak Wood & Premium Fabric' },
        { label: 'Assembly', value: 'Pre-assembled' },
        { label: 'Origin', value: 'Handcrafted in India' }
      ];
    }
    if (name.includes('table') || name.includes('desk') || name.includes('bench')) {
      return [
        { label: 'Dimensions', value: '120cm x 60cm x 75cm' },
        { label: 'Material', value: 'Solid Teak Wood & Steel Frame' },
        { label: 'Weight', value: '28 kg' },
        { label: 'Assembly Required', value: 'Yes (tools included)' },
        { label: 'Origin', value: 'Handcrafted in India' }
      ];
    }
    if (name.includes('lamp') || name.includes('light') || name.includes('pendant')) {
      return [
        { label: 'Dimensions', value: '30cm x 30cm x 45cm' },
        { label: 'Bulb Type', value: 'E27 LED (Warm White included)' },
        { label: 'Material', value: 'Mouth-blown Glass & Brass finish' },
        { label: 'Cord Length', value: '1.8 meters' },
        { label: 'Origin', value: 'Crafted in India' }
      ];
    }
    return [
      { label: 'Dimensions', value: 'Standard size' },
      { label: 'Material', value: 'Premium sustainably sourced materials' },
      { label: 'Finish', value: 'Satin matte protective coating' },
      { label: 'Warranty', value: '2 Year Manufacturer Warranty' },
      { label: 'Origin', value: 'Designed & Crafted locally' }
    ];
  };

  const loadReviewStats = async () => {
    if (!product?.id) return;
    const stats = await reviewService.fetchProductReviewStats(product.id);
    setReviewStats(stats);
  };

  const loadReviews = async (reset = false) => {
    if (!product?.id) return;
    setReviewsLoading(true);
    const nextPage = reset ? 1 : reviewsPage;
    const data = await reviewService.fetchProductReviews(product.id, {
      sortBy: reviewsSort,
      filterVerified: reviewsVerifiedOnly,
      page: nextPage,
      limit: 5
    });

    if (reset) {
      setReviews(data);
      setReviewsPage(1);
      setHasMoreReviews(data.length === 5);
    } else {
      setReviews(prev => [...prev, ...data]);
      setReviewsPage(nextPage);
      setHasMoreReviews(data.length === 5);
    }
    setReviewsLoading(false);
  };

  const checkUserEligibility = async () => {
    if (!product?.id || !currentCustomerId) {
      setEligibility({ canReview: false, reason: 'Please log in to write a review.' });
      return;
    }
    setEligibilityLoading(true);
    const res = await reviewService.checkEligibility(product.id, currentCustomerId);
    setEligibility(res);
    setEligibilityLoading(false);
  };

  // Fetch reviews and review stats when product changes or sorting updates
  useEffect(() => {
    if (product?.id) {
      loadReviewStats();
      loadReviews(true);
    }
  }, [product?.id, reviewsSort, reviewsVerifiedOnly]);

  // Check eligibility if customer is logged in
  useEffect(() => {
    if (product?.id && currentCustomerId) {
      checkUserEligibility();
    } else {
      setEligibility({ canReview: false, reason: 'Please log in to write a review.' });
    }
  }, [product?.id, currentCustomerId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrentImages = formFiles.length + existingImagesLeft.length;
    if (files.length + totalCurrentImages > 5) {
      alert('You can upload up to 5 images only.');
      return;
    }

    setFormFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormFilePreviews(prev => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImagesLeft(prev => prev.filter((_, i) => i !== index));
    } else {
      setFormFiles(prev => prev.filter((_, i) => i !== index));
      setFormFilePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!formRating) {
      setSubmitError('Rating is required.');
      return;
    }
    if (!formDescription.trim()) {
      setSubmitError('Review description is required.');
      return;
    }
    if (formDescription.length > 1000) {
      setSubmitError('Description cannot exceed 1000 characters.');
      return;
    }
    if (formTitle.length > 100) {
      setSubmitError('Title cannot exceed 100 characters.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (editingReviewId) {
        await reviewService.updateReview(editingReviewId, currentCustomerId, {
          rating: formRating,
          title: formTitle,
          description: formDescription,
          images: formFiles,
          remainingImageUrls: existingImagesLeft
        });
      } else {
        await reviewService.submitReview({
          productId: product.id,
          customerId: currentCustomerId,
          rating: formRating,
          title: formTitle,
          description: formDescription,
          images: formFiles
        });
      }

      setFormRating(5);
      setFormTitle('');
      setFormDescription('');
      setFormFiles([]);
      setFormFilePreviews([]);
      setEditingReviewId(null);
      setShowReviewForm(false);

      await loadReviewStats();
      await loadReviews(true);
      await checkUserEligibility();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setFormRating(review.rating);
    setFormTitle(review.title || '');
    setFormDescription(review.description);

    const urls = review.review_images?.map(img => img.image_url) || [];
    setExistingImagesLeft(urls);
    setFormFiles([]);
    setFormFilePreviews([]);
    setSubmitError('');
    setShowReviewForm(true);

    const anchorEl = document.getElementById('review-form-anchor');
    if (anchorEl) {
      window.scrollTo({ top: anchorEl.offsetTop - 100, behavior: 'smooth' });
    }
  };

  const handleDeleteClick = async (reviewId) => {
    if (!confirm('Are you sure you want to delete your review? This action updates the average rating immediately.')) return;
    try {
      await reviewService.deleteReview(reviewId, currentCustomerId);
      await loadReviewStats();
      await loadReviews(true);
      await checkUserEligibility();
    } catch (err) {
      console.error(err);
      alert('Failed to delete review.');
    }
  };

  const handleHelpfulClick = async (review) => {
    if (!currentCustomerId) {
      alert('Please log in to vote a review as helpful.');
      return;
    }
    const hasVoted = review.review_helpful?.some(h => h.customer_id === currentCustomerId);
    try {
      await reviewService.toggleHelpful(review.id, currentCustomerId, hasVoted);

      setReviews(prev => prev.map(r => {
        if (r.id === review.id) {
          let updatedHelpful = [...(r.review_helpful || [])];
          let diff = 0;
          if (hasVoted) {
            updatedHelpful = updatedHelpful.filter(h => h.customer_id !== currentCustomerId);
            diff = -1;
          } else {
            updatedHelpful.push({ customer_id: currentCustomerId });
            diff = 1;
          }
          return {
            ...r,
            review_helpful: updatedHelpful,
            helpful_count: Math.max(0, (r.helpful_count || 0) + diff)
          };
        }
        return r;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!currentCustomerId) {
      alert('Please log in to report a review.');
      return;
    }
    setIsSubmittingReport(true);
    try {
      // Use standard creator/customer auth user.id for reporter_id
      await reviewService.reportReview(reportingReviewId, customer.id, reportReason, reportDetails);
      alert('Review reported successfully. Administrators will review it shortly.');
      setReportingReviewId(null);
      setReportReason('Spam');
      setReportDetails('');
    } catch (err) {
      console.error(err);
      alert('Failed to submit report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const sameCatRef = useRef(null);
  const otherCatRef = useRef(null);

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const otherProducts = relatedProducts.filter(p => p.id !== product?.id);
  const sameCategoryProducts = otherProducts.filter(p => p.category_id === product?.category_id);
  const otherCategoryProducts = otherProducts.filter(p => p.category_id !== product?.category_id);

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

  const { user, loading: authLoading } = useAuth();
  const currentUserId = user?.id;
  const isCreator = currentUserId && currentUserId === storeDetails?.creator_id;

  if (authLoading) {
    return <PageLoader />;
  }

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
                {product.images.slice(0, 3).map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`thumbnail-item ${activeImage === img ? 'active' : ''}`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                  </div>
                ))}
                {product.images.length > 3 && (
                  <div 
                    className={`thumbnail-item more-badge-item ${product.images.slice(3).includes(activeImage) ? 'active' : ''}`}
                    onClick={() => setActiveImage(product.images[3])}
                  >
                    <img src={product.images[3]} alt="More images" />
                    <div className="more-overlay">+{product.images.length - 3}</div>
                  </div>
                )}
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
                <span className="stock-badge-detail low-stock">Low Stock (Very few left)</span>
              ) : (
                <span className="stock-badge-detail in-stock">In Stock</span>
              )}
            </div>

            <div className="rating">
              <div className="stars" style={{ letterSpacing: '1px' }}>
                {'★'.repeat(Math.round(reviewStats.average_rating || product.average_rating || 0)) + '☆'.repeat(5 - Math.round(reviewStats.average_rating || product.average_rating || 0))}
              </div>
              <span className="reviews">
                {(reviewStats.average_rating || product.average_rating) > 0 ? `${(reviewStats.average_rating || product.average_rating).toFixed(1)} ` : '0.0 '}
                ({reviewStats.review_count || product.review_count || 0} { (reviewStats.review_count || product.review_count || 0) === 1 ? 'review' : 'reviews' })
              </span>
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
                      alert("You cannot add more of this item as it exceeds available stock.");
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
                <span>
                  {(() => {
                    const shippingType = storeDetails?.theme_settings?.shippingType ?? 'flat';
                    const flatFee = parseFloat(storeDetails?.theme_settings?.flatFee ?? 0);
                    if (shippingType === 'flat') {
                      return flatFee > 0 ? `₹${flatFee} Shipping` : 'Free Shipping';
                    } else if (shippingType === 'calculated') {
                      return 'Calculated Shipping';
                    }
                    return 'Free Shipping';
                  })()}
                </span>
              </div>
              <div className="feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            PRODUCT DETAILS TABS SECTION
           ========================================== */}
        <div className="product-details-tabs-section dashboard-card fade-in">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Shipping Details
            </button>
            <button 
              className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
              onClick={() => setActiveTab('returns')}
            >
              Return Policy
            </button>
          </div>
          
          <div className="tab-content-panel">
            {activeTab === 'description' && (
              <div className="tab-pane fade-in">
                <p style={{ lineHeight: '1.8', color: 'var(--text-sub)' }}>
                  {product.description || `Experience unparalleled quality and minimalist design. This ${product.name.toLowerCase()} is crafted from premium materials to elevate your living space and provide lasting comfort and style.`}
                </p>
              </div>
            )}
            {activeTab === 'specifications' && (
              <div className="tab-pane specifications-pane fade-in">
                <table className="specs-table">
                  <tbody>
                    {getProductSpecs(product).map((spec, idx) => (
                      <tr key={idx}>
                        <td className="spec-label">{spec.label}</td>
                        <td className="spec-value">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'shipping' && (
              <div className="tab-pane fade-in">
                {product.shipping_details ? (
                  <p style={{ color: 'var(--text-sub)', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '15px' }}>
                    {product.shipping_details}
                  </p>
                ) : (
                  <>
                    <h3 className="pane-sub-title">Secure & Swift Logistics</h3>
                    <p style={{ color: 'var(--text-sub)', marginBottom: '16px' }}>All orders are processed and handed over to standard premium courier networks within 24 hours of confirmation.</p>
                    <ul className="policy-list">
                      <li><strong>Standard Shipping:</strong> Delivered in 3-5 business days. Free for this product.</li>
                      <li><strong>Express Shipping:</strong> Delivered in 1-2 business days (if selected at checkout).</li>
                      <li><strong>Transit Safety:</strong> Fully insured shipments with custom packaging to prevent breakages.</li>
                    </ul>
                  </>
                )}
              </div>
            )}
            {activeTab === 'returns' && (
              <div className="tab-pane fade-in">
                {product.return_policy ? (
                  <p style={{ color: 'var(--text-sub)', whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '15px' }}>
                    {product.return_policy}
                  </p>
                ) : (
                  <>
                    <h3 className="pane-sub-title">7-Day Return & Replacement Policy</h3>
                    <p style={{ color: 'var(--text-sub)', marginBottom: '16px' }}>We stand behind the craftsmanship of our products. If you are not completely satisfied, we offer a hassle-free return window.</p>
                    <ul className="policy-list">
                      <li>Items must be returned in their original packaging and unused condition.</li>
                      <li>Refunds are processed to the original payment source within 3-5 days after warehouse validation.</li>
                      <li>In case of manufacturing defects, contact our support with unboxing images for instant replacements.</li>
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            RATINGS & PRODUCT REVIEWS SECTION
           ========================================== */}
        <section className="product-reviews-ratings-container dashboard-card fade-in" id="reviews-section">
          <div className="reviews-section-header">
            <h2 className="reviews-section-title">Customer Reviews & Ratings</h2>
            <p className="reviews-section-subtitle">Real feedback from verified buyers across the platform.</p>
          </div>

          <div className="reviews-layout-grid">
            {/* Left Column: Aggregated stats and eligibility */}
            <div className="reviews-stats-summary-card">
              <div className="avg-rating-block">
                <span className="avg-score">{reviewStats.average_rating > 0 ? reviewStats.average_rating.toFixed(1) : '0.0'}</span>
                <div className="stars-row" style={{ color: '#f59e0b', fontSize: '20px', letterSpacing: '1px' }}>
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
                {eligibility.canReview ? (
                  <div className="eligible-box">
                    <p className="eligibility-msg-success">
                      {eligibility.isVerified 
                        ? '✔ You are logged in as a verified buyer! Your review will have a verified purchase badge.' 
                        : '✔ You are logged in! Write a review to share your thoughts.'}
                    </p>
                    <button 
                      className="write-review-toggle-btn"
                      onClick={() => {
                        setEditingReviewId(null);
                        setFormRating(5);
                        setFormTitle('');
                        setFormDescription('');
                        setFormFiles([]);
                        setFormFilePreviews([]);
                        setSubmitError('');
                        setShowReviewForm(!showReviewForm);
                      }}
                    >
                      {showReviewForm ? 'Cancel Review' : 'Write a Product Review'}
                    </button>
                  </div>
                ) : (
                  <div className="ineligible-box">
                    <p className="eligibility-msg-error">
                      {eligibility.reason || 'Please log in to write a review.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Reviews List & submission form */}
            <div className="reviews-list-column">
              {/* Submission/Edit Form */}
              {showReviewForm && (
                <form className="review-submission-form fade-in" onSubmit={handleSubmitReview}>
                  <h3 className="form-title-head">
                    {editingReviewId ? 'Edit Your Product Review' : 'Share Your Experience'}
                  </h3>

                  {submitError && <div className="form-error-alert">{submitError}</div>}

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
                      onChange={(e) => setFormTitle(e.target.value.substring(0, 100))}
                    />
                    <div className="char-indicator">{formTitle.length}/100 characters</div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-description" className="form-label-bold">Review Description <span style={{ color: 'red' }}>*</span></label>
                    <textarea
                      id="review-description"
                      rows="4"
                      className="form-textarea-input"
                      placeholder="Share details about what you liked or disliked, material quality, fit, etc."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value.substring(0, 1000))}
                    ></textarea>
                    <div className="char-indicator">{formDescription.length}/1000 characters</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label-bold">Attach Review Images <span className="label-optional">(Max 5)</span></label>
                    <div className="image-uploader-wrapper">
                      <label className="image-upload-box">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          disabled={formFiles.length + existingImagesLeft.length >= 5}
                          style={{ display: 'none' }}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span>Add Photos</span>
                      </label>

                      {/* Display existing images when editing */}
                      {editingReviewId && existingImagesLeft.map((imgUrl, idx) => (
                        <div key={`exist-${idx}`} className="upload-preview-card">
                          <img src={imgUrl} alt="Existing Preview" />
                          <button 
                            type="button" 
                            className="remove-preview-btn"
                            onClick={() => handleRemoveFile(idx, true)}
                          >
                            ×
                          </button>
                          <span className="existing-tag">Keep</span>
                        </div>
                      ))}

                      {/* Display newly uploaded previews */}
                      {formFilePreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} className="upload-preview-card">
                          <img src={preview} alt="New Preview" />
                          <button 
                            type="button" 
                            className="remove-preview-btn"
                            onClick={() => handleRemoveFile(idx, false)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="form-btn-secondary"
                      onClick={() => setShowReviewForm(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="form-btn-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving Review...' : (editingReviewId ? 'Update Review' : 'Submit Review')}
                    </button>
                  </div>
                </form>
              )}

              {/* Reviews filter and sorting header */}
              <div className="reviews-list-filters-header">
                <span className="reviews-count-header">
                  {reviews.length > 0 ? `${reviews.length} feedback entries` : 'Reviews'}
                </span>
                
                <div className="filter-sort-controls">
                  <div className="sorting-dropdown-wrapper">
                    <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>Sort:</span>
                    <select
                      className="sorting-select-input"
                      value={reviewsSort}
                      onChange={(e) => {
                        setReviewsSort(e.target.value);
                        setReviewsPage(1);
                      }}
                    >
                      <option value="Newest">Newest First</option>
                      <option value="Highest Rating">Highest Rating</option>
                      <option value="Lowest Rating">Lowest Rating</option>
                      <option value="Most Helpful">Most Helpful</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              {reviewsLoading && reviews.length === 0 ? (
                <div className="reviews-skeletons-loading">
                  {[1, 2].map(n => (
                    <div key={n} className="skeleton-review-card shim">
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0' }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ width: '120px', height: '14px', background: '#e2e8f0', marginBottom: '8px' }}></div>
                          <div style={{ width: '80px', height: '12px', background: '#e2e8f0' }}></div>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: '16px', background: '#e2e8f0', marginBottom: '8px' }}></div>
                      <div style={{ width: '70%', height: '16px', background: '#e2e8f0' }}></div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="empty-reviews-state">
                  <div className="empty-icon">💬</div>
                  <h3>No Reviews Yet</h3>
                  <p>Be the first to share your thoughts about this product! Purchase this product to write the first review.</p>
                </div>
              ) : (
                <div className="reviews-cards-list">
                  {reviews.map(review => {
                    const isOwnReview = currentCustomerId && review.customer_id === currentCustomerId;
                    const hasVotedHelpful = review.review_helpful?.some(h => h.customer_id === currentCustomerId);
                    
                    return (
                      <div key={review.id} className="review-card-item fade-in">
                        {/* Header: User avatar and name */}
                        <div className="review-card-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {review.customer?.avatar_url ? (
                                <img src={review.customer.avatar_url} alt={review.customer?.full_name || 'Buyer'} />
                              ) : (
                                <span>{((review.customer?.full_name || 'B').charAt(0)).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="reviewer-meta">
                              <div className="reviewer-name-row">
                                <span className="reviewer-name">{review.customer?.full_name || 'Verified Buyer'}</span>
                                {review.is_verified && (
                                  <span className="verified-purchase-badge">✔ Verified Purchase</span>
                                )}
                              </div>
                              <span className="review-date">
                                {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          {/* Top right edit/delete controls */}
                          {isOwnReview && (
                            <div className="review-own-controls">
                              <button 
                                className="control-btn edit-btn"
                                onClick={() => handleEditClick(review)}
                                title="Edit Review"
                              >
                                Edit
                              </button>
                              <button 
                                className="control-btn delete-btn"
                                onClick={() => handleDeleteClick(review.id)}
                                title="Delete Review"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Rating and Title */}
                        <div className="review-card-rating-row">
                          <div className="stars-visual" style={{ color: '#f59e0b', letterSpacing: '1px' }}>
                            {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                          </div>
                          {review.title && <h4 className="review-card-title">{review.title}</h4>}
                        </div>

                        {/* Description */}
                        <p className="review-card-description">{review.description}</p>

                        {/* Uploaded Images Gallery */}
                        {review.review_images && review.review_images.length > 0 && (
                          <div className="review-gallery-grid">
                            {review.review_images.map(img => (
                              <div 
                                key={img.id} 
                                className="gallery-thumbnail-item"
                                onClick={() => setActiveLightboxImg(img.image_url)}
                              >
                                <img src={img.image_url} alt="Review attachment" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Helpful & Report Section */}
                        <div className="review-card-footer-actions">
                          <button 
                            className={`helpful-vote-btn ${hasVotedHelpful ? 'voted' : ''}`}
                            onClick={() => handleHelpfulClick(review)}
                          >
                            👍 Helpful ({review.helpful_count || 0})
                          </button>

                          {!isOwnReview && currentCustomerId && (
                            <button 
                              className="report-flag-btn"
                              onClick={() => setReportingReviewId(review.id)}
                            >
                              🚩 Report Abuse
                            </button>
                          )}
                        </div>

                        {/* Seller Replies Section */}
                        {review.seller_replies && review.seller_replies.length > 0 && (
                          <div className="seller-reply-block">
                            <div className="reply-header">
                              <span className="reply-badge">Seller Response</span>
                              <span className="reply-date">
                                {new Date(review.seller_replies[0].created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="reply-text">{review.seller_replies[0].reply_text}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Load More pagination button */}
                  {hasMoreReviews && (
                    <button 
                      className="load-more-reviews-btn"
                      onClick={() => loadReviews(false)}
                      disabled={reviewsLoading}
                    >
                      {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================
            REPORT REVIEW MODAL
           ========================================== */}
        {reportingReviewId && (
          <div className="lightbox-overlay fade-in" onClick={() => setReportingReviewId(null)}>
            <div className="report-modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Report Review</h3>
              <p className="modal-intro">Please select a reason why this review violates platform rules. Abuse and spam will be removed by administrators.</p>
              
              <form onSubmit={handleReportClick}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label-bold">Reason for Report</label>
                  <select
                    className="sorting-select-input"
                    style={{ width: '100%', padding: '10px' }}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    <option value="Spam">Spam</option>
                    <option value="Fake review">Fake review</option>
                    <option value="Offensive language">Offensive language</option>
                    <option value="Wrong product">Wrong product</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label-bold">Additional Details</label>
                  <textarea
                    rows="3"
                    className="form-textarea-input"
                    placeholder="Provide details to help administrators review this report."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-actions" style={{ justifyContent: 'flex-end', gap: '12px' }}>
                  <button 
                    type="button" 
                    className="form-btn-secondary"
                    onClick={() => setReportingReviewId(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="form-btn-primary"
                    disabled={isSubmittingReport}
                    onClick={handleReportSubmit}
                  >
                    {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
            IMAGE LIGHTBOX OVERLAY
           ========================================== */}
        {activeLightboxImg && (
          <div className="lightbox-overlay fade-in" onClick={() => setActiveLightboxImg(null)}>
            <div className="lightbox-content-card">
              <img src={activeLightboxImg} alt="Lightbox Review Attached Graphic" />
              <button 
                className="close-lightbox-btn"
                onClick={() => setActiveLightboxImg(null)}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {sameCategoryProducts.length > 0 && (
          <section className="related-section related-products-carousel">
            <div className="section-header-row">
              <div className="section-header-left">
                <h2 className="section-title">Related Products</h2>
                <p className="section-subtitle">Similar products in the same category.</p>
              </div>
              <div className="carousel-arrows">
                <button 
                  type="button" 
                  className="carousel-arrow-btn"
                  onClick={() => scrollContainer(sameCatRef, 'left')}
                  aria-label="Previous products"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button 
                  type="button" 
                  className="carousel-arrow-btn"
                  onClick={() => scrollContainer(sameCatRef, 'right')}
                  aria-label="Next products"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
            <div className="carousel-scroll-container" ref={sameCatRef}>
              {sameCategoryProducts.map(p => (
                <div key={p.id} className="carousel-product-card-wrap">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}

        {otherCategoryProducts.length > 0 && (
          <section className="related-section other-products-carousel" style={{ marginTop: '10px' }}>
            <div className="section-header-row">
              <div className="section-header-left">
                <h2 className="section-title">You May Also Like</h2>
                <p className="section-subtitle">Discover popular products from other categories.</p>
              </div>
              <div className="carousel-arrows">
                <button 
                  type="button" 
                  className="carousel-arrow-btn"
                  onClick={() => scrollContainer(otherCatRef, 'left')}
                  aria-label="Previous products"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button 
                  type="button" 
                  className="carousel-arrow-btn"
                  onClick={() => scrollContainer(otherCatRef, 'right')}
                  aria-label="Next products"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
            <div className="carousel-scroll-container" ref={otherCatRef}>
              {otherCategoryProducts.map(p => (
                <div key={p.id} className="carousel-product-card-wrap">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer storeName={storeDetails?.name} />

      <style jsx>{`
        .product-details-page {
          background: #f8fafc;
          min-height: 100vh;
        }

        .main-content {
          padding-top: 100px;
          padding-bottom: 40px;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 24px 40px;
          background: var(--white);
          margin-bottom: 24px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }

        .product-gallery .main-image {
          position: relative;
          aspect-ratio: 1/1;
          max-height: 400px;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-main);
          margin: 0 auto;
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

        /* Legacy thumbnail-grid styles removed */

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
          margin-top: 10px;
        }

        .section-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
        }

        .section-subtitle {
          color: var(--text-sub);
        }

        .product-gallery {
          position: relative;
          width: 100%;
        }

        .product-gallery .main-image {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-main);
          width: 100%;
        }

        .thumbnails-grid {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          pointer-events: none;
        }

        .product-gallery:hover .thumbnails-grid {
          opacity: 1;
          transform: translateX(0);
          pointer-events: auto;
        }

        .thumbnail-item {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: var(--transition-fast);
          background: #ffffff;
        }

        .thumbnail-item.active {
          border-color: var(--accent, #121212);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .more-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          border-radius: var(--radius-sm);
        }

        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .section-header-left {
          text-align: left;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-main);
          margin-bottom: 4px;
        }

        .section-title::before {
          content: '';
          display: inline-block;
          width: 5px;
          height: 20px;
          background-color: var(--accent, #121212);
          border-radius: 10px;
        }

        .section-subtitle {
          color: var(--text-sub);
          font-size: 14px;
        }

        .carousel-arrows {
          display: flex;
          gap: 8px;
        }

        .carousel-arrow-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #121212;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .carousel-arrow-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .carousel-scroll-container {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 8px 4px 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .carousel-scroll-container::-webkit-scrollbar {
          display: none;
        }

        .related-products-carousel .carousel-product-card-wrap {
          flex: 0 0 calc(33.333% - 16px);
          min-width: 280px;
        }

        .other-products-carousel .carousel-product-card-wrap {
          flex: 0 0 calc(25% - 18px);
          min-width: 280px;
        }

        @media (max-width: 1024px) {
          .product-gallery {
            position: relative;
            display: block;
            width: 100%;
          }
          .thumbnails-grid {
            position: relative;
            top: auto;
            left: auto;
            z-index: auto;
            flex-direction: row;
            width: 100%;
            overflow-x: auto;
            opacity: 1;
            transform: none;
            pointer-events: auto;
            gap: 12px;
            margin-top: 12px;
          }
          .thumbnail-item {
            width: 60px;
            height: 60px;
            border: 2px solid #e2e8f0;
            box-shadow: none;
          }
          .related-products-carousel .carousel-product-card-wrap,
          .other-products-carousel .carousel-product-card-wrap {
            flex: 0 0 calc(50% - 12px);
          }
        }

        @media (max-width: 640px) {
          .related-products-carousel .carousel-product-card-wrap,
          .other-products-carousel .carousel-product-card-wrap {
            flex: 0 0 100%;
          }
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
          /* products-grid styling removed */
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

        /* Tabs CSS styles */
        .product-details-tabs-section {
          background: var(--white);
          padding: 30px;
          margin-bottom: 24px;
          border-radius: var(--radius-md);
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .tabs-header {
          display: flex;
          border-bottom: 2px solid #f1f5f9;
          margin-bottom: 24px;
          gap: 30px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          padding: 12px 4px;
          font-weight: 700;
          font-size: 15px;
          color: var(--text-sub);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          color: var(--text-main);
        }
        .tab-btn.active {
          color: var(--accent, #121212);
        }
        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent, #121212);
        }
        .tab-content-panel {
          min-height: 120px;
        }
        .specs-table {
          width: 100%;
          border-collapse: collapse;
        }
        .specs-table tr {
          border-bottom: 1px solid #f1f5f9;
        }
        .specs-table tr:last-child {
          border-bottom: none;
        }
        .spec-label {
          padding: 12px 16px;
          font-weight: 700;
          color: var(--text-main);
          width: 30%;
          background: #f8fafc;
        }
        .spec-value {
          padding: 12px 16px;
          color: var(--text-sub);
        }
        .pane-sub-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 12px;
        }
        .policy-list {
          padding-left: 20px;
          color: var(--text-sub);
        }
        .policy-list li {
          margin-bottom: 8px;
          line-height: 1.6;
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
        
        /* Stats Summary Left block */
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
        
        /* Distribution Progress bars */
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

        /* Review eligibility block */
        .review-eligibility-block {
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
        }
        .eligible-box, .ineligible-box {
          text-align: center;
        }
        .eligibility-msg-success {
          font-size: 12px;
          color: #10b981;
          font-weight: 600;
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .eligibility-msg-error {
          font-size: 13px;
          color: #ef4444;
          font-weight: 600;
          line-height: 1.5;
          padding: 8px;
          background: #fef2f2;
          border-radius: 8px;
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

        /* Review submission form styling */
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
        .form-error-alert {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
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
        .char-indicator {
          text-align: right;
          font-size: 11px;
          color: var(--text-sub);
          margin-top: 4px;
        }
        .image-uploader-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .image-upload-box {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-sub);
          font-size: 11px;
          font-weight: 700;
          gap: 6px;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .image-upload-box:hover {
          border-color: var(--accent);
          color: var(--text-main);
        }
        .upload-preview-card {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }
        .upload-preview-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-preview-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
          line-height: 1;
        }
        .remove-preview-btn:hover {
          background: rgba(239, 68, 68, 0.9);
        }
        .existing-tag {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: rgba(16, 185, 129, 0.85);
          color: white;
          font-size: 9px;
          font-weight: 700;
          text-align: center;
          padding: 2px 0;
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

        /* Filter header styling */
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
        .filter-sort-controls {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .checkbox-filter-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-sub);
          cursor: pointer;
          font-weight: 600;
        }
        .checkbox-filter-label input {
          cursor: pointer;
        }
        .sorting-dropdown-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sorting-select-input {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          font-size: 13px;
          color: var(--text-main);
          font-weight: 600;
          cursor: pointer;
        }

        /* Review Card styling */
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
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #e2e8f0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #475569;
          border: 1px solid #e2e8f0;
        }
        .reviewer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .reviewer-meta {
          display: flex;
          flex-direction: column;
        }
        .reviewer-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .reviewer-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main);
        }
        .verified-purchase-badge {
          font-size: 11px;
          font-weight: 700;
          color: #10b981;
          background: #ecfdf5;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .review-date {
          font-size: 12px;
          color: var(--text-sub);
          margin-top: 2px;
        }
        .review-own-controls {
          display: flex;
          gap: 8px;
        }
        .control-btn {
          background: transparent;
          border: none;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .control-btn.edit-btn {
          color: #3b82f6;
        }
        .control-btn.edit-btn:hover {
          background: #eff6ff;
        }
        .control-btn.delete-btn {
          color: #ef4444;
        }
        .control-btn.delete-btn:hover {
          background: #fef2f2;
        }
        .review-card-rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .review-card-title {
          font-size: 15px;
          font-weight: 800;
          color: var(--text-main);
        }
        .review-card-description {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-sub);
          margin-bottom: 16px;
        }
        .review-gallery-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 18px;
        }
        .gallery-thumbnail-item {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          cursor: zoom-in;
          transition: transform 0.2s ease;
        }
        .gallery-thumbnail-item:hover {
          transform: scale(1.04);
        }
        .gallery-thumbnail-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .review-card-footer-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .helpful-vote-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: var(--text-main);
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .helpful-vote-btn:hover {
          background: #e2e8f0;
          transform: translateY(-1px);
        }
        .helpful-vote-btn.voted {
          background: #dcfce7;
          border-color: #10b981;
          color: #047857;
        }
        .report-flag-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .report-flag-btn:hover {
          color: #ef4444;
        }

        /* Seller Reply card */
        .seller-reply-block {
          background: #f8fafc;
          border-left: 3px solid var(--accent, #121212);
          border-radius: 0 12px 12px 0;
          padding: 16px 20px;
          margin-top: 20px;
        }
        .reply-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .reply-badge {
          font-size: 12px;
          font-weight: 800;
          color: var(--text-main);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .reply-date {
          font-size: 11px;
          color: var(--text-sub);
        }
        .reply-text {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-sub);
        }

        /* Skeletons */
        .skeleton-review-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        /* Empty reviews */
        .empty-reviews-state {
          text-align: center;
          padding: 48px 24px;
          background: #f8fafc;
          border-radius: 16px;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }
        .empty-reviews-state h3 {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 6px;
        }
        .empty-reviews-state p {
          font-size: 13px;
          color: var(--text-sub);
          max-width: 380px;
          margin: 0 auto;
          line-height: 1.5;
        }

        /* Load more reviews button */
        .load-more-reviews-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #cbd5e1;
          color: var(--text-main);
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }
        .load-more-reviews-btn:hover {
          background: #f1f5f9;
        }

        /* Lightbox overlays styles */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .lightbox-content-card {
          position: relative;
          max-width: 720px;
          max-height: 720px;
          border-radius: var(--radius-md);
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
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: background 0.2s ease;
        }
        .close-lightbox-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        /* Report Modal style */
        .report-modal-card {
          background: #ffffff;
          border-radius: 20px;
          width: 100%;
          max-width: 440px;
          padding: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .modal-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .modal-intro {
          font-size: 12px;
          color: var(--text-sub);
          line-height: 1.5;
          margin-bottom: 20px;
        }

        /* Shimmer effect for skeletons */
        .shim {
          position: relative;
          overflow: hidden;
        }
        .shim::after {
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 1.5s infinite;
          content: '';
        }

        @media (max-width: 768px) {
          .product-details-tabs-section {
            padding: 20px 16px;
          }
          .tabs-header {
            gap: 16px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .tabs-header::-webkit-scrollbar {
            display: none;
          }
          .tab-btn {
            font-size: 13px;
            white-space: nowrap;
          }
          .spec-label {
            width: 40%;
            font-size: 13px;
            padding: 10px;
          }
          .spec-value {
            font-size: 13px;
            padding: 10px;
          }
          .product-reviews-ratings-container {
            padding: 24px 16px;
          }
          .reviews-layout-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .reviews-stats-summary-card {
            padding: 16px;
          }
          .avg-score {
            font-size: 36px;
          }
          .distribution-row {
            font-size: 11px;
          }
          .review-submission-form {
            padding: 16px;
          }
          .reviews-list-filters-header {
            flex-direction: column;
            align-items: start;
            gap: 12px;
          }
          .filter-sort-controls {
            width: 100%;
            justify-content: space-between;
            gap: 12px;
          }
          .checkbox-filter-label {
            font-size: 12px;
          }
          .sorting-select-input {
            padding: 6px 10px;
            font-size: 12px;
          }
          .reviewer-name {
            font-size: 13px;
          }
          .verified-purchase-badge {
            font-size: 10px;
            padding: 1px 6px;
          }
          .review-card-title {
            font-size: 14px;
          }
          .review-card-description {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
