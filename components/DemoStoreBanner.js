'use client';

import Link from 'next/link';

export default function DemoStoreBanner() {
  return (
    <div className="demo-banner">
      <div className="banner-content">
        <span className="badge">DEMO MODE</span>
        <span className="text">This is a Demo Store built using <strong>LaunchCart</strong></span>
      </div>
      <div className="banner-actions">
        <Link href="/signup" className="btn primary-btn">
          Create Your Own Store
        </Link>
        <Link href="/" className="btn secondary-btn">
          Return to Home Page
        </Link>
      </div>

      <style jsx>{`
        .demo-banner {
          width: 100%;
          background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%);
          color: #fff;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          z-index: 1001;
          position: fixed;
          top: 0;
          left: 0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          gap: 16px;
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .badge {
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          color: white;
          font-weight: 800;
          font-size: 9px;
          padding: 4px 8px;
          border-radius: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .text {
          color: #cbd5e1;
        }

        .text strong {
          color: #fff;
          font-weight: 700;
        }

        .banner-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          font-size: 12px;
          white-space: nowrap;
          border: none;
          cursor: pointer;
        }

        .primary-btn {
          background: #fff;
          color: #0f172a;
        }

        .primary-btn:hover {
          background: #f1f5f9;
          transform: translateY(-1px);
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }

        @media (max-width: 900px) {
          .demo-banner {
            flex-direction: column;
            text-align: center;
            padding: 16px;
            gap: 12px;
            height: 76px;
            justify-content: center;
          }
          .banner-content {
            gap: 6px;
          }
          .text {
            font-size: 11px;
            display: none; /* Hide full text on small mobile screens to prevent clutter */
          }
          .btn {
            padding: 6px 12px;
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
