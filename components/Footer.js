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
            <div className="newsletter-left-col">
              <div className="newsletter-icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div className="newsletter-info">
                <h2 className="newsletter-title">Get Inspired, Stay Updated</h2>
                <p className="newsletter-subtitle">Join our community and get exclusive offers, new arrivals & more.</p>
              </div>
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
            <p className="footer-brand-desc">Your one-stop shop for quality products that make life better.</p>
            <div className="footer-social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-circle" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="social-icon-circle" aria-label="Pinterest">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="20"></line><path d="M12 2C6.48 2 2 6.48 2 12c0 4.27 2.68 7.91 6.47 9.35-.08-.8-.15-2.02.03-2.9.16-.69 1.05-4.44 1.05-4.44s-.27-.54-.27-1.34c0-1.25.73-2.19 1.63-2.19.77 0 1.14.58 1.14 1.27 0 .77-.49 1.93-.74 3.01-.21.9.45 1.63 1.34 1.63 1.61 0 2.85-1.7 2.85-4.15 0-2.17-1.56-3.69-3.79-3.69-2.58 0-4.1 1.93-4.1 3.94 0 .78.3 1.62.68 2.08a.3.3 0 0 1 .07.25c-.07.31-.24.97-.27 1.1-.04.19-.15.23-.34.14-1.27-.59-2.07-2.45-2.07-3.95 0-3.21 2.33-6.16 6.72-6.16 3.53 0 6.27 2.51 6.27 5.87 0 3.51-2.21 6.33-5.28 6.33-1.03 0-2-.53-2.33-1.16l-.64 2.42c-.23.88-.86 1.98-1.28 2.66C10.09 21.75 11.02 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"></path></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-circle" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4 className="links-col-title">Navigation</h4>
            <Link href="#shop" className="footer-nav-link">Shop Collection</Link>
            <Link href="#categories-section" className="footer-nav-link">Explore Categories</Link>
            <Link href="#new-arrivals-section" className="footer-nav-link">New Arrivals</Link>
            <Link href="#trending-section" className="footer-nav-link">Best Sellers</Link>
            <Link href="#footer-section" className="footer-nav-link">About Us</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="links-col-title">Support</h4>
            <Link href="#" className="footer-nav-link">Shipping Info</Link>
            <Link href="#" className="footer-nav-link">Returns & Exchanges</Link>
            <Link href="#" className="footer-nav-link">Contact Us</Link>
            <Link href="#" className="footer-nav-link">FAQs</Link>
            <Link href="#" className="footer-nav-link">Track Order</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="links-col-title">Payment Methods</h4>
            <div className="payment-badges-row">
              <span className="payment-badge visa">Visa</span>
              <span className="payment-badge mastercard">Mastercard</span>
              <span className="payment-badge upi">UPI</span>
              <span className="payment-badge paytm">Paytm</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom-row">
          <p className="copyright-text">&copy; 2025 {displayTitle}. All rights reserved.</p>
          <div className="footer-legal-links">
            <Link href="#" className="legal-link">Privacy Policy</Link>
            <span className="divider-line">|</span>
            <Link href="#" className="legal-link">Terms & Conditions</Link>
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

        .newsletter-left-col {
          display: flex;
          align-items: center;
          gap: 20px;
          flex: 1;
          min-width: 280px;
        }

        .newsletter-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #FAF8F5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #121212;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
        }

        .newsletter-info {
          flex: 1;
        }

        .newsletter-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(22px, 2.5vw, 32px);
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
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 60px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 40px;
        }

        .footer-brand-col {
          max-width: 280px;
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
        }

        .footer-social-icons {
          display: flex;
          gap: 12px;
        }

        .social-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #EFECE6;
          color: #706f6c;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .social-icon-circle:hover {
          background: #121212;
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
        }

        .payment-badges-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .payment-badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid rgba(0,0,0,0.06);
          background: #ffffff;
          display: inline-flex;
          align-items: center;
        }

        .payment-badge.visa {
          color: #0f3e99;
        }

        .payment-badge.mastercard {
          color: #eb001b;
        }

        .payment-badge.upi {
          color: #4f1d7d;
        }

        .payment-badge.paytm {
          color: #00b9f5;
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

        .divider-line {
          color: rgba(0, 0, 0, 0.15);
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
          .newsletter-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .newsletter-left-col {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            width: 100%;
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

        @media (max-width: 480px) {
          .newsletter-form-box {
            flex-direction: column;
            background: transparent;
            border: none;
            padding: 0;
            gap: 12px;
            box-shadow: none;
          }
          .newsletter-input {
            background: #FAF8F5;
            border-radius: 30px;
            border: 1px solid rgba(0, 0, 0, 0.04);
            width: 100%;
            height: 48px;
          }
          .newsletter-subscribe-btn {
            width: 100%;
            height: 48px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
