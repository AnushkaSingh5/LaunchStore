import Link from 'next/link';

export default function Footer({ storeName }) {
  const displayTitle = storeName || 'Online Store';

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-card dashboard-card">
          <div className="footer-grid">
            <div className="footer-brand">
              <h2 className="footer-logo">{displayTitle}</h2>
              <p className="footer-desc">Redefining modern living through minimalist design and premium craftsmanship.</p>
              <div className="social-pill">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">I</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">T</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">F</a>
              </div>
            </div>

            <div className="footer-group">
              <h4 className="group-title">Navigation</h4>
              <Link href="#">Featured</Link>
              <Link href="#">New Arrivals</Link>
              <Link href="#">Best Sellers</Link>
              <Link href="#">Collections</Link>
            </div>

            <div className="footer-group">
              <h4 className="group-title">Support</h4>
              <Link href="#">Shipping Info</Link>
              <Link href="#">Returns</Link>
              <Link href="#">Contact Us</Link>
              <Link href="#">FAQ</Link>
            </div>

            <div className="footer-newsletter">
              <h4 className="group-title">Weekly Digest</h4>
              <p>Get curated design insights and exclusive offers.</p>
              <div className="subscribe-box">
                <input type="email" placeholder="Email address" className="subscribe-input" />
                <button className="subscribe-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} {displayTitle}. Powered by Modern Commerce.</p>
            <div className="legal-links">
              <Link href="#">Privacy</Link>
              <Link href="#">Terms</Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          padding: 80px 0 40px;
          background: var(--bg-main);
        }

        .footer-card {
          padding: 60px;
          background: var(--white);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
          gap: 60px;
          margin-bottom: 60px;
        }

        .footer-logo {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--primary);
        }

        .footer-desc {
          color: var(--text-sub);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 24px;
          max-width: 260px;
        }

        .social-pill {
          display: flex;
          gap: 12px;
        }

        .social-link {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--bg-main);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
          transition: var(--transition-fast);
        }

        .social-link:hover {
          background: var(--accent);
          color: var(--white);
          transform: translateY(-2px);
        }

        .footer-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .group-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-group a {
          font-size: 14px;
          color: var(--text-sub);
          transition: var(--transition-fast);
        }

        .footer-group a:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .footer-newsletter p {
          font-size: 14px;
          color: var(--text-sub);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .subscribe-box {
          display: flex;
          background: var(--bg-main);
          padding: 6px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.05);
        }

        .subscribe-input {
          flex: 1;
          padding: 8px 16px;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          color: var(--text-main);
        }

        .subscribe-btn {
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: var(--white);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .subscribe-btn:hover {
          background: var(--accent);
          transform: scale(1.05);
        }

        .footer-bottom {
          padding-top: 40px;
          border-top: 1px solid var(--secondary);
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--text-sub);
          font-size: 13px;
        }

        .legal-links {
          display: flex;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .footer-card {
            padding: 40px 24px;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .footer-bottom {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
