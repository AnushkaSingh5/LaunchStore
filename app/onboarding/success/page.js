'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PageLoader from '@/components/PageLoader';

export default function OnboardingSuccessPage() {
  const router = useRouter();
  const { user, profile, store, loading, storeLoading } = useAuth();
  const [copied, setCopied] = useState(false);

  // 1. Guard check: Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 2. Guard check: Redirect if onboarding is not completed
  useEffect(() => {
    if (!loading && !storeLoading && profile) {
      if (!profile.onboarding_completed) {
        console.log('🔄 [LaunchCart - OnboardingSuccess]: Onboarding not complete, redirecting to onboarding wizard...');
        router.push('/onboarding');
      }
    }
  }, [profile, loading, storeLoading, router]);

  if (loading || storeLoading || !user || !profile || !profile.onboarding_completed) {
    return <PageLoader />;
  }

  // If store context is still loading, display a temporary loading state
  if (!store) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your storefront details...</p>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            gap: 16px;
            font-family: 'Outfit', sans-serif;
          }
          .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid rgba(0, 0, 0, 0.05);
            border-left-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const storeName = store.name || 'Your Store';
  const slug = store.slug || '';
  const storefrontUrl = typeof window !== 'undefined' ? `${window.location.origin}/store/${slug}` : `/store/${slug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storefrontUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="onboarding-container">
      <div className="glow-bg"></div>
      <div className="onboarding-card success-card fade-in">
        <div className="success-icon-animation">
          <div className="check-icon">⏳</div>
        </div>
        <h2>Store Submitted for Review!</h2>
        <p className="success-subtitle">
          Congratulations! <strong>{storeName}</strong> has been successfully configured and submitted for admin moderation. Your store will become publicly live once approved.
        </p>

        <div className="link-preview-box">
          <span className="label">Your storefront link (Private during review)</span>
          <div className="link-row">
            <input type="text" readOnly value={storefrontUrl} />
            <button onClick={copyToClipboard} className="copy-btn">
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="actions-row">
          <a
            href={`/store/${slug}`}
            className="view-store-btn"
          >
            Preview Store
          </a>
          <button onClick={() => router.push('/dashboard')} className="primary-dashboard-btn">
            Go to Dashboard
          </button>
        </div>
      </div>

      <style jsx>{`
        .onboarding-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }
        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
          bottom: -200px;
          right: -200px;
          z-index: 1;
        }
        .onboarding-card {
          width: 100%;
          max-width: 580px;
          background: #ffffff;
          padding: 48px;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
          z-index: 2;
          text-align: center;
        }
        .success-icon-animation {
          font-size: 64px;
          margin-bottom: 24px;
          animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        h2 {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .success-subtitle {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .link-preview-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 18px;
          text-align: left;
          margin-bottom: 32px;
        }
        .link-preview-box .label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #94a3b8;
          font-weight: 700;
          display: block;
          margin-bottom: 8px;
        }
        .link-row {
          display: flex;
          gap: 12px;
        }
        .link-row input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-size: 14px;
          font-weight: 600;
          color: #334155;
        }
        .copy-btn {
          background: #fff;
          border: 1px solid #cbd5e1;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover {
          border-color: #8b5cf6;
          color: #8b5cf6;
          background: #f5f3ff;
        }
        .actions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .view-store-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px;
          border: 1px solid #cbd5e1;
          color: #475569;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .view-store-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .primary-dashboard-btn {
          padding: 14px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
          transition: all 0.2s;
        }
        .primary-dashboard-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
        }
      `}</style>
    </div>
  );
}
