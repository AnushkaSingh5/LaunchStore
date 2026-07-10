import Link from 'next/link';
import { getDefaultStoreData } from '@/lib/defaultStoreData';

export default function Footer({ storeName, description }) {
  const displayTitle = storeName || 'AestheticStore';
  const nicheConfig = getDefaultStoreData(displayTitle, description || '');
  const brandDesc = nicheConfig.brandDesc || 'Redefining modern living through minimalist design and premium craftsmanship.';

  return (
    <footer className="footer-section-wrapper" id="footer-section">
      <div className="container">
        {/* Newsletter Banner Card */}
        <div className="newsletter-card">
          <div className="newsletter-content">
            <div className="newsletter-info">
              <h2 className="newsletter-title">Get Inspired, Stay Updated</h2>
              <p className="newsletter-subtitle">Join our community and get exclusive offers, new arrivals & more.</p>
            </div>
            
            <div className="newsletter-form-box">
              <input type="email" placeholder="Enter your email" className="newsletter-input" aria-label="Email address" />
              <button className="newsletter-subscribe-btn">Subscribe</button>
            </div>
          </div>
          
          {/* Subtle decorative leaf shapes */}
          <div className="leaf-decor left-leaf">
            <svg viewBox="0 0 100 100" className="leaf-svg">
              <path d="M10,80 Q50,60 90,20 Q60,50 10,80" fill="none" stroke="rgba(35, 39, 36, 0.04)" strokeWidth="1.5" />
              <path d="M30,65 Q45,55 55,45 M50,53 Q65,43 75,33" fill="none" stroke="rgba(35, 39, 36, 0.03)" strokeWidth="1" />
            </svg>
          </div>
          <div className="leaf-decor right-leaf">
            <svg viewBox="0 0 100 100" className="leaf-svg animate-sway">
              <path d="M90,80 Q50,60 10,20 Q40,50 90,80" fill="none" stroke="rgba(35, 39, 36, 0.04)" strokeWidth="1.5" />
              <path d="M70,65 Q55,55 45,45 M50,53 Q35,43 25,33" fill="none" stroke="rgba(35, 39, 36, 0.03)" strokeWidth="1" />
            </svg>
          </div>
        </div>

        {/* Footer Grids */}
        <div className="footer-main-grid">
          <div className="footer-brand-col">
            <h3 className="footer-brand-logo">{displayTitle}</h3>
            <div className="social-links-pill">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-pill-link">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-pill-link">Pinterest</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-pill-link">Facebook</a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="links-col-title">Navigation</h4>
            <Link href="#shop" className="footer-nav-link">Shop Collection</Link>
            <Link href="#categories-section" className="footer-nav-link">Explore Categories</Link>
            <Link href="#new-arrivals-section" className="footer-nav-link">New Arrivals</Link>
            <Link href="#trending-section" className="footer-nav-link">Best Sellers</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="links-col-title">Support</h4>
            <Link href="#" className="footer-nav-link">Shipping Info</Link>
            <Link href="#" className="footer-nav-link">Returns & Exchanges</Link>
            <Link href="#" className="footer-nav-link">Contact Customer Care</Link>
            <Link href="#" className="footer-nav-link">FAQs</Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom-row">
          <p className="copyright-text">&copy; {new Date().getFullYear()} {displayTitle}. All rights reserved.</p>
          <div className="footer-legal-links">
            <Link href="#" className="legal-link">Privacy Policy</Link>
            <span className="divider"></span>
            <Link href="#" className="legal-link">Terms of Service</Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer-section-wrapper {
          background: #FAF8F5;
          padding: 80px 0 40px;
          border-top: 1px solid rgba(0, 0, 0, 0.03);
          font-family: 'Outfit', sans-serif;
        }

        /* Newsletter Card */
        .newsletter-card {
          background: #EFECE6;
          border-radius: 24px;
          padding: 60px;
          position: relative;
          overflow: hidden;
          margin-bottom: 80px;
        }

        .newsletter-content {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }

        .newsletter-info {
          max-width: 500px;
        }

        .newsletter-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 600;
          color: #121212;
          margin-bottom: 8px;
        }

        .newsletter-subtitle {
          font-size: 14px;
          color: #706f6c;
          line-height: 1.5;
        }

        .newsletter-form-box {
          display: flex;
          background: #FAF8F5;
          padding: 6px;
          border-radius: 40px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 440px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.01);
        }

        .newsletter-input {
          flex: 1;
          padding: 12px 20px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: #121212;
        }

        .newsletter-subscribe-btn {
          background: #232724;
          color: #FAF8F5;
          padding: 12px 28px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .newsletter-subscribe-btn:hover {
          background: #121212;
          transform: translateY(-1px);
        }

        /* Leaf decorations */
        .leaf-decor {
          position: absolute;
          width: 240px;
          height: 240px;
          pointer-events: none;
        }

        .left-leaf {
          bottom: -40px;
          left: -40px;
          transform: rotate(20deg);
        }

        .right-leaf {
          top: -40px;
          right: -40px;
          transform: rotate(-10deg);
        }

        .leaf-svg {
          width: 100%;
          height: 100%;
        }

        /* Footer Grid */
        .footer-main-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 64px;
          padding-bottom: 60px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 40px;
        }

        .footer-brand-col {
          max-width: 320px;
        }

        .footer-brand-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #121212;
          margin-bottom: 16px;
        }

        .footer-brand-desc {
          font-size: 13px;
          color: #706f6c;
          line-height: 1.6;
          margin-bottom: 24px;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        .social-links-pill {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .social-pill-link {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #706f6c;
          padding: 6px 14px;
          border-radius: 20px;
          background: #EFECE6;
          transition: all 0.2s ease;
        }

        .social-pill-link:hover {
          background: #232724;
          color: #FAF8F5;
          transform: translateY(-2px);
        }

        .footer-links-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .links-col-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #121212;
          margin-bottom: 12px;
        }

        .footer-nav-link {
          font-size: 13px;
          color: #706f6c;
          transition: all 0.2s ease;
        }

        .footer-nav-link:hover {
          color: #121212;
          transform: translateX(4px);
        }

        /* Bottom Row */
        .footer-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          font-size: 12px;
          color: #706f6c;
        }

        .footer-legal-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .legal-link {
          transition: color 0.2s ease;
        }

        .legal-link:hover {
          color: #121212;
        }

        .divider {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(0,0,0,0.15);
        }

        /* Responsiveness */
        @media (max-width: 1024px) {
          .footer-main-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
          .footer-brand-col {
            grid-column: span 2;
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .newsletter-card {
            padding: 40px 24px;
            border-radius: 16px;
          }
          .newsletter-form-box {
            max-width: 100%;
          }
          .footer-main-grid {
            grid-template-columns: 1fr;
            gap: 32px;
            padding-bottom: 40px;
          }
          .footer-brand-col {
            grid-column: span 1;
          }
          .footer-bottom-row {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
