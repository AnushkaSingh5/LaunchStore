'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/customer/profile';
  const { login } = useCustomerAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      console.log('🔄 [LaunchCart - CustomerLogin]: Logging in:', email);
      const res = await login(email, password);
      if (res && res.success) {
        console.log('✅ [LaunchCart - CustomerLogin]: Login success. Redirecting to:', redirect);
        router.push(redirect);
      }
    } catch (err) {
      console.error('❌ [LaunchCart - CustomerLogin]: Login error:', err);
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card dashboard-card fade-in">
      <Link href="/" className="back-link">
        ← Back to homepage
      </Link>

      <div className="brand-header">
        <div className="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2>Customer Sign In</h2>
        <p className="subtitle">Sign in to track orders, manage addresses, and shop securely.</p>
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="login-footer">
        New customer?{' '}
        <Link href={`/customer/signup?redirect=${encodeURIComponent(redirect)}`} className="register-link">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <div className="login-container">
      <div className="glow-bg"></div>
      <Suspense fallback={<div className="loading-text">Loading...</div>}>
        <LoginContent />
      </Suspense>

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

        :global(.login-card) {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 2;
        }

        :global(.back-link) {
          display: inline-block;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-decoration: none;
          margin-bottom: 30px;
          transition: all 0.2s;
        }

        :global(.back-link:hover) {
          color: #121212;
        }

        :global(.brand-header) {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        :global(.logo-icon) {
          width: 48px;
          height: 48px;
          background: rgba(37, 99, 235, 0.1);
          color: #2563eb;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        :global(.brand-header h2) {
          font-size: 24px;
          font-weight: 800;
          color: #121212;
          letter-spacing: -0.5px;
        }

        :global(.subtitle) {
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
        }

        :global(.error-banner) {
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

        :global(.login-form) {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 28px;
        }

        :global(.form-group) {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        :global(.form-group label) {
          font-size: 13px;
          font-weight: 600;
          color: #1d1d1f;
        }

        :global(.form-group input) {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 14px;
          color: #1d1d1f;
          outline: none;
          background: #ffffff;
          transition: all 0.2s;
        }

        :global(.form-group input:focus) {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        :global(.submit-btn) {
          width: 100%;
          padding: 14px;
          background: #121212;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(18, 18, 18, 0.15);
          transition: all 0.3s;
          cursor: pointer;
          border: none;
        }

        :global(.submit-btn:hover) {
          background: #2563eb;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.25);
          transform: translateY(-1px);
        }

        :global(.submit-btn:disabled) {
          opacity: 0.7;
          cursor: not-allowed;
        }

        :global(.login-footer) {
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          padding-top: 20px;
        }

        :global(.register-link) {
          font-weight: 700;
          color: #2563eb;
          text-decoration: none;
        }

        :global(.register-link:hover) {
          text-decoration: underline;
        }

        .loading-text {
          font-size: 16px;
          color: #64748b;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
