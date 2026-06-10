'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { useLoading } from '@/components/TopLoader';

export default function StoreLoginPage({ params }) {
  const { slug } = use(params);
  const { startLoading, completeLoading } = useLoading();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || `/store/${slug}`;
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [storeDetails, setStoreDetails] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await storeService.getStoreBySlug(slug);
        setStoreDetails(data);
        if (slug) {
          localStorage.setItem('last_visited_store', slug);
        }
      } catch (e) {
        console.error('Failed to fetch store details:', e);
      }
    };
    fetchStore();
  }, [slug]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    startLoading();
    try {
      console.log('🔄 [LaunchCart - StoreLoginPage]: Triggering signIn for customer:', email);
      const result = await authService.signIn(email, password);
      if (result && result.error) throw result.error;
      
      console.log('✅ [LaunchCart - StoreLoginPage]: SignIn response success. Redirecting to:', redirect);
      console.log("Navigation triggered");
      router.push(redirect);
    } catch (err) {
      console.error('❌ [LaunchCart - StoreLoginPage]: Login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate. Check email/password.');
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  return (
    <div className="login-container">
      <div className="glow-bg"></div>

      <div className="login-card dashboard-card fade-in">
        <Link href={`/store/${slug}`} className="back-link">
          ← Back to store
        </Link>

        <div className="brand-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your customer account at <strong>{storeDetails?.name || 'Store'}</strong></p>
        </div>

        {errorMsg && (
          <div className="error-banner">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          Don't have an account?{' '}
          <Link href={`/store/${slug}/signup?redirect=${encodeURIComponent(redirect)}`} className="register-link">
            Sign up now
          </Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fb;
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
          top: -200px;
          right: -200px;
          z-index: 1;
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          background: var(--white, #ffffff);
          padding: 40px;
          border-radius: var(--radius-lg, 24px);
          box-shadow: var(--shadow-lg, 0 10px 30px rgba(0,0,0,0.05));
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 2;
        }

        .back-link {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-sub, #64748b);
          text-decoration: none;
          margin-bottom: 30px;
          transition: var(--transition-fast, all 0.2s);
        }

        .back-link:hover {
          color: var(--primary, #121212);
        }

        .brand-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          background: rgba(37, 99, 235, 0.1);
          color: var(--accent, #2563eb);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .brand-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary, #121212);
          letter-spacing: -0.5px;
        }

        .brand-header p {
          font-size: 13px;
          color: var(--text-sub, #64748b);
          line-height: 1.5;
        }

        .error-banner {
          padding: 12px 16px;
          background: #fef2f2;
          color: #ef4444;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          border: 1px solid rgba(239, 68, 68, 0.1);
          text-align: center;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 28px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main, #1d1d1f);
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 14px;
          color: var(--text-main, #1d1d1f);
          outline: none;
          background: var(--white, #ffffff);
          transition: var(--transition-fast, all 0.2s);
        }

        .form-group input:focus {
          border-color: var(--accent, #2563eb);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--primary, #121212);
          color: var(--white, #ffffff);
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(18, 18, 18, 0.15);
          transition: var(--transition-smooth, all 0.3s);
        }

        .submit-btn:hover {
          background: var(--accent, #2563eb);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          font-size: 13px;
          color: var(--text-sub, #64748b);
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          padding-top: 20px;
        }

        .register-link {
          font-weight: 700;
          color: var(--accent, #2563eb);
          text-decoration: none;
        }

        .register-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 32px 20px;
          }
        }
      `}</style>
    </div>
  );
}
