'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getDefaultStoreData } from '@/lib/defaultStoreData';

export default function Hero({ bannerUrl, storeName, description }) {
  const pathname = usePathname() || '';
  const isDemo = pathname.includes('/demo-store');
  const [headline, setHeadline] = useState('Design Your Space, Define Your Style');
  const [subheading, setSubheading] = useState('Handpicked pieces that bring beauty, comfort and character to your home.');
  const [banner, setBanner] = useState('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200');
  const [showMobileReviews, setShowMobileReviews] = useState(false);

  const truncateDescription = (text) => {
    if (!text) return '';
    if (text.length <= 160) return text;
    return text.substring(0, 157) + '...';
  };

  useEffect(() => {
    // Dynamically choose themed content based on store details
    const fallback = getDefaultStoreData(storeName || '', description || '');
    
    // If the store is "AestheticStore" or matches home-decor, use exact mockup text
    if ((storeName || '').toLowerCase().includes('aesthetic')) {
      setHeadline('Design Your Space, Define Your Style');
      setSubheading('Handpicked pieces that bring beauty, comfort and character to your home.');
      setBanner(bannerUrl || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200');
    } else {
      // Determine themed defaults
      if (fallback.niche === 'fashion') {
        setHeadline(storeName ? `Curated Style at ${storeName}` : 'Express Your Style, Define Your Look');
        setSubheading(truncateDescription(description) || 'Carefully curated garments that bring elegance, comfort and confidence to your wardrobe.');
        setBanner(bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200');
      } else if (fallback.niche === 'beauty') {
        setHeadline(storeName ? `Radiate Beauty with ${storeName}` : 'Reveal Your Glow, Define Your Beauty');
        setSubheading(truncateDescription(description) || 'Botanical formulations that bring nourishment, radiance and clarity to your skin.');
        setBanner(bannerUrl || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1200');
      } else if (fallback.niche === 'electronics') {
        setHeadline(storeName ? `Future Tech at ${storeName}` : 'Elevate Your Sound, Define Your Beat');
        setSubheading(truncateDescription(description) || 'High-performance tech gear that brings precision, comfort and innovation to your daily life.');
        setBanner(bannerUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200');
      } else if (fallback.niche === 'food') {
        setHeadline(storeName ? `A Taste of ${storeName}` : 'Savor the Taste, Define Your Flavor');
        setSubheading(truncateDescription(description) || 'Artisanal ingredients and fresh bakes that bring joy, warmth and comfort to your table.');
        setBanner(bannerUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200');
      } else if (fallback.niche === 'home-decor') {
        setHeadline(storeName ? `Elevated Living with ${storeName}` : 'Design Your Space, Define Your Style');
        setSubheading(truncateDescription(description) || 'Handpicked pieces that bring beauty, comfort and character to your home.');
        setBanner(bannerUrl || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200');
      } else {
        // general / default
        setHeadline(storeName ? `Curated Collection at ${storeName}` : 'Welcome to Our Store');
        setSubheading(truncateDescription(description) || 'Curating high-quality products to bring value, utility, and delight to your life.');
        setBanner(bannerUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200');
      }
    }
  }, [storeName, description, bannerUrl]);

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={`hero-section ${isDemo ? 'demo-mode-hero' : ''}`}>
      <div className="container hero-container">
        <div className="hero-grid">
          {/* Left Dark Pane */}
          {/*
          <div className="hero-left-pane">
            <div className="pane-content">
              <span className="welcome-tag">Premium Collection</span>
              <h1 className="hero-title">{headline}</h1>
              <p className="hero-subtitle">{subheading}</p>
              
              <div className="hero-actions">
                <button onClick={() => handleScroll('trending-section')} className="primary-btn">
                  Shop Collection 
                  <span className="arrow-icon">→</span>
                </button>
                <button onClick={() => handleScroll('categories-section')} className="secondary-btn">
                  Explore Categories
                </button>
              </div>
            </div>

            <div className="slide-indicator">
              <span className="active-slide">01</span>
              <span className="slide-line"></span>
              <span className="total-slides">03</span>
            </div>
          </div>
          */}

          {/* Right Banner Image Pane */}
          <div className="hero-right-pane">
            <img src={banner} alt={storeName || 'Store Banner'} className="banner-img" />
            
            {/* Overlay customer reviews badge */}
            <div className={`reviews-badge ${showMobileReviews ? 'active' : ''}`}>
              <div className="avatar-stack">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60" alt="Customer" className="avatar-img" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60" alt="Customer" className="avatar-img" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60" alt="Customer" className="avatar-img" />
              </div>
              <div className="reviews-text">
                <div className="bold-text">2K+ Happy Customers</div>
                <div className="sub-text">rating our products</div>
              </div>
              <div className="rating-score">
                <span className="star-icon">★</span>
                <span className="score">4.8</span>
              </div>
            </div>

            {/* Mobile Reviews Toggle Trigger */}
            <button 
              className="mobile-reviews-trigger" 
              onClick={() => setShowMobileReviews(!showMobileReviews)}
              aria-label="Toggle reviews info"
            >
              <span className="star-icon">★</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          padding-top: 120px;
          padding-bottom: 40px;
          background: #FAF8F5;
        }

        .hero-section.demo-mode-hero {
          padding-top: 168px; /* 48px banner + 120px padding */
        }

        .hero-container {
          padding: 0 24px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.02);
          height: 380px; 
        }

        /* Left Pane Styling */
        .hero-left-pane {
          background: #232724; /* Premium Dark Forest/Olive */
          padding: 64px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #FAF8F5;
          position: relative;
        }

        .pane-content {
          max-width: 440px;
        }

        .welcome-tag {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #A39E93;
          margin-bottom: 24px;
          display: block;
        }

        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(32px, 3.8vw, 48px);
          font-weight: 700;
          line-height: 1.15;
          margin-bottom: 24px;
          letter-spacing: -0.5px;
          color: #FAF8F5;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .hero-subtitle {
          font-size: 14px;
          line-height: 1.6;
          color: #C1BCB2;
          margin-bottom: 24px;
          font-weight: 400;
          word-break: break-word;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .primary-btn {
          background: #FAF8F5;
          color: #232724;
          padding: 14px 28px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1);
          background: #EFECE6;
        }

        .arrow-icon {
          font-size: 16px;
          transition: transform 0.2s ease;
        }

        .primary-btn:hover .arrow-icon {
          transform: translateX(3px);
        }

        .secondary-btn {
          border: 1px solid rgba(250, 248, 245, 0.3);
          color: #FAF8F5;
          padding: 14px 28px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.25s ease;
        }

        .secondary-btn:hover {
          border-color: #FAF8F5;
          background: rgba(250, 248, 245, 0.05);
          transform: translateY(-2px);
        }

        /* Slide Indicator */
        .slide-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          font-weight: 500;
          color: #A39E93;
          margin-top: 40px;
        }

        .active-slide {
          color: #FAF8F5;
        }

        .slide-line {
          width: 48px;
          height: 1px;
          background: rgba(250, 248, 245, 0.2);
        }

        /* Right Pane Styling */
        .hero-right-pane {
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .mobile-reviews-trigger {
          display: none;
        }

        /* Floating Reviews Badge */
        .reviews-badge {
          position: absolute;
          bottom: 24px;
          right: 24px;
          background: rgba(250, 248, 245, 0.9);
          backdrop-filter: blur(8px);
          border-radius: 40px;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          animation: floatAnimation 4s ease-in-out infinite alternate;
        }

        @keyframes floatAnimation {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        .avatar-stack {
          display: flex;
          align-items: center;
        }

        .avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #FAF8F5;
          margin-right: -10px;
        }

        .avatar-img:last-child {
          margin-right: 0;
        }

        .reviews-text {
          display: flex;
          flex-direction: column;
        }

        .bold-text {
          font-size: 12px;
          font-weight: 600;
          color: #121212;
        }

        .sub-text {
          font-size: 10px;
          color: #706f6c;
        }

        .rating-score {
          display: flex;
          align-items: center;
          gap: 4px;
          border-left: 1px solid rgba(0, 0, 0, 0.08);
          padding-left: 12px;
          margin-left: 4px;
        }

        .star-icon {
          color: #f59e0b;
          font-size: 14px;
        }

        .score {
          font-size: 12px;
          font-weight: 700;
          color: #121212;
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            min-height: auto;
            height: auto; 
          }

          .hero-left-pane {
            padding: 48px;
            gap: 40px;
          }

          .hero-right-pane {
            height: 240px;
          }
        }

        @media (max-width: 900px) {
          .hero-section.demo-mode-hero {
            padding-top: 226px; /* 76px banner + 150px padding */
          }
        }

        @media (max-width: 768px) {
          .hero-section {
            padding-top: 90px; /* Adjust for mobile navbar space */
            padding-bottom: 20px;
          }

          .hero-right-pane {
            height: 280px;
          }

          .hero-section.demo-mode-hero {
            padding-top: 138px;
          }

          .hero-left-pane {
            padding: 32px 24px;
          }

          .hero-title {
            font-size: 32px;
          }

          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }

          .primary-btn, .secondary-btn {
            width: 100%;
            justify-content: center;
          }

          .reviews-badge {
            bottom: 16px;
            right: 16px;
            padding: 8px 16px;
            gap: 10px;
          }

          .avatar-img {
            width: 28px;
            height: 28px;
          }

          .mobile-reviews-trigger {
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            bottom: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            cursor: pointer;
            z-index: 10;
            color: #e2a537;
            font-size: 14px;
            transition: all 0.2s ease;
            padding: 0;
          }

          .mobile-reviews-trigger:active {
            transform: scale(0.9);
          }

          .reviews-badge {
            position: absolute;
            bottom: 52px;
            right: 12px;
            left: auto !important;
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.06);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            padding: 6px 10px;
            gap: 6px;
            border-radius: 12px;
            width: auto;
            max-width: 220px;
            display: flex;
            align-items: center;
            opacity: 0;
            pointer-events: none;
            transform: translateY(8px);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 9;
            animation: none !important;
          }

          .reviews-badge.active {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }

          .avatar-img {
            width: 20px !important;
            height: 20px !important;
            border-width: 1px !important;
            margin-right: -6px !important;
          }

          .reviews-text .bold-text {
            font-size: 10px !important;
            line-height: 1.2;
          }

          .reviews-text .sub-text {
            font-size: 8px !important;
            line-height: 1.2;
          }

          .rating-score {
            font-size: 10px !important;
            gap: 2px !important;
          }
        }

        @media (max-width: 480px) {
          /* Prevent badge centering so it stays relative to the trigger button */
        }
      `}</style>
    </section>
  );
}
