'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useLoading } from '@/components/TopLoader';

export default function LoginPage() {
  const { startLoading, completeLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    startLoading();
    try {
      console.log('🔄 [LaunchCart - LoginPage]: Triggering signIn for creator:', email);
      const result = await authService.signIn(email, password);
      if (result && result.error) throw result.error;
      
      console.log('✅ [LaunchCart - LoginPage]: SignIn response success, redirecting...');
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ [LaunchCart - LoginPage]: Login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate. Check email/password.');
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  return (
    <div className="login-container">
      {/* Glow overlay */}
      <div className="glow-bg"></div>

      <div className="login-card dashboard-card fade-in">
        {/* Back navigation */}
        <Link href="/" className="back-link">
          ← Back to homepage
        </Link>

        {/* Brand Header */}
        <div className="brand-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your LaunchCart creator dashboard</p>
        </div>

        {/* Social Authentication */}
        <div className="social-auth">
          <button className="social-btn" onClick={() => router.push('/dashboard')}>
            <span className="social-icon">🌐</span>
            Continue with Google
          </button>
          <button className="social-btn" onClick={() => router.push('/dashboard')}>
            <span className="social-icon">💻</span>
            Continue with GitHub
          </button>
        </div>

        <div className="divider">
          <span>or continue with email</span>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            background: '#fef2f2',
            color: '#ef4444',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '24px',
            border: '1px solid rgba(239, 68, 68, 0.1)',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Standard Email Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Form Footer */}
        <div className="login-footer">
          <span>Don&apos;t have a store account? </span>
          <Link href="/signup" className="register-link">
            Create Your Store
          </Link>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.06) 0%, rgba(99, 102, 241, 0.03) 50%, rgba(255, 255, 255, 0) 70%);
          filter: blur(60px);
          top: -200px;
          left: -200px;
          z-index: 1;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          background: var(--white);
          padding: 40px;
          border-radius: 24px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
        }

        .back-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-sub);
          text-decoration: none;
          display: inline-block;
          margin-bottom: 24px;
          transition: var(--transition-fast);
        }

        .back-link:hover {
          color: var(--accent);
          transform: translateX(-2px);
        }

        .brand-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 32px;
          gap: 12px;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--accent) 0%, #1e40af 100%);
          color: var(--white);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .brand-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          letter-spacing: -0.5px;
        }

        .brand-header p {
          font-size: 13px;
          color: var(--text-sub);
        }

        .social-auth {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .social-btn {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          color: var(--text-main);
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: var(--transition-fast);
        }

        .social-btn:hover {
          background: #f1f5f9;
          border-color: rgba(0, 0, 0, 0.1);
        }

        .social-icon {
          font-size: 16px;
        }

        .divider {
          text-align: center;
          position: relative;
          margin-bottom: 24px;
        }

        .divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          z-index: 1;
        }

        .divider span {
          position: relative;
          z-index: 2;
          background: var(--white);
          padding: 0 12px;
          font-size: 12px;
          color: var(--text-sub);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
          color: var(--text-main);
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-link {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.08);
          font-size: 14px;
          color: var(--text-main);
          outline: none;
          background: var(--white);
          transition: var(--transition-fast);
        }

        .form-group input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--primary);
          color: var(--white);
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(18, 18, 18, 0.15);
          transition: var(--transition-smooth);
        }

        .submit-btn:hover {
          background: var(--accent);
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
          color: var(--text-sub);
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          padding-top: 20px;
        }

        .register-link {
          font-weight: 700;
          color: var(--accent);
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
