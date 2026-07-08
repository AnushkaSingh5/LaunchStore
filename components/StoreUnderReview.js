'use client';

import Link from 'next/link';

export default function StoreUnderReview({ storeName, status, statusReason, description }) {
  const isPending = status === 'pending' || !status;
  const isRejected = status === 'rejected';
  const isDisabled = status === 'disabled';

  let title = "Store Under Review";
  let icon = "⏳";
  let color = "#f59e0b";
  let defaultDescription = "This store has been submitted for admin review. Customer access has not been enabled yet. Please check back once the store has been approved.";

  if (isPending) {
    title = "Store Under Review";
    icon = "⏳";
    color = "#f59e0b";
  } else if (isRejected) {
    title = "Store Unavailable";
    icon = "🔒";
    color = "#ef4444";
    defaultDescription = `The store "${storeName || 'Store'}" is currently unavailable. Please contact the owner or try again later.${statusReason ? ` Reason: ${statusReason}` : ''}`;
  } else if (isDisabled) {
    title = "Store Disabled";
    icon = "🚫";
    color = "#6b7280";
    defaultDescription = `The store "${storeName || 'Store'}" has been disabled by platform administrators.${statusReason ? ` Reason: ${statusReason}` : ''}`;
  }

  const finalDescription = description || defaultDescription;

  return (
    <div className="pending-store-screen">
      <div className="glow-bg"></div>
      <div className="glass-card fade-in">
        <div className="icon-badge" style={{ color }}>{icon}</div>
        <h2>{icon} {title}</h2>
        <p>{finalDescription}</p>
        
        <div className="actions-row">
          <Link href="/" className="back-link">
            ← Back to Home
          </Link>
          <Link href="/" className="browse-link">
            Browse Other Stores
          </Link>
        </div>
      </div>

      <style jsx>{`
        .pending-store-screen {
          height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FAF8F5;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
        }
        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.04) 0%, rgba(255, 255, 255, 0) 70%);
          bottom: -200px;
          right: -200px;
          z-index: 1;
        }
        .glass-card {
          background: #ffffff;
          border: 1px solid rgba(0, 0, 0, 0.05);
          border-radius: 28px;
          padding: 48px 32px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          color: #121212;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 2;
          box-sizing: border-box;
        }
        .icon-badge {
          font-size: 64px;
          margin-bottom: 24px;
          animation: pulse 2s infinite alternate;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.06); }
        }
        .glass-card h2 {
          font-size: 26px;
          font-weight: 800;
          margin: 0 0 16px 0;
          color: #121212;
          letter-spacing: -0.5px;
        }
        .glass-card p {
          font-size: 14px;
          color: #706f6c;
          line-height: 1.6;
          margin: 0 0 36px 0;
          max-width: 400px;
        }
        .actions-row {
          display: flex;
          flex-direction: column;
          width: 100%;
          gap: 12px;
        }
        :global(.back-link) {
          display: block;
          width: 100%;
          padding: 14px;
          background: #121212;
          color: #FAF8F5 !important;
          border-radius: 14px;
          font-weight: 700;
          text-decoration: none !important;
          transition: all 0.2s;
          cursor: pointer;
          font-size: 14px;
          box-sizing: border-box;
        }
        :global(.back-link:hover) {
          background: #2d302e;
          transform: translateY(-1px);
        }
        :global(.browse-link) {
          display: block;
          width: 100%;
          padding: 14px;
          background: transparent;
          color: #121212 !important;
          border: 1.5px solid #121212;
          border-radius: 14px;
          font-weight: 700;
          text-decoration: none !important;
          transition: all 0.2s;
          cursor: pointer;
          font-size: 14px;
          box-sizing: border-box;
        }
        :global(.browse-link:hover) {
          background: rgba(18, 18, 18, 0.04);
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
