'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { adminSignIn } = useAdminAuth();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate with isolated Admin Session verification
      const signInPromise = adminSignIn(email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timed out. Please check your network.')), 20000)
      );

      const result = await Promise.race([signInPromise, timeoutPromise]);
      
      if (!result?.success) {
        throw new Error(result?.error || 'Authentication failed. Please verify credentials.');
      }

      // Authorized success -> Redirect to Admin Overview Portal
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Light gradient glow overlays */}
      <div className="glow-circle-1"></div>
      <div className="glow-circle-2"></div>

      <div className="login-card fade-in">
        {/* Back navigation link */}
        <Link href="/" className="back-link">
          ← Return to public website
        </Link>

        {/* Brand Header */}
        <div className="brand-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Admin Command</h2>
          <p>Sign in to the platform management system</p>
        </div>

        {/* Alert Error Display */}
        {error && (
          <div className="error-alert">
            <span className="error-icon">⚠️</span>
            <span className="error-msg">{error}</span>
          </div>
        )}

        {/* Standard Email Login Form */}
        <form onSubmit={handleAdminLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@launchcart.com"
              required
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Security Password</label>
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
            {loading ? 'Authorizing Security...' : 'Access Admin Panel'}
          </button>
        </form>

        {/* Info Footer */}
        <div className="login-footer">
          <span>Protected System. Public registrations are strictly restricted from acquiring administrative access clearance.</span>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .glow-circle-1 {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.03) 50%, rgba(255, 255, 255, 0) 70%);
          filter: blur(80px);
          top: -200px;
          right: -100px;
          z-index: 1;
        }

        .glow-circle-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0.02) 50%, rgba(255, 255, 255, 0) 70%);
          filter: blur(80px);
          bottom: -200px;
          left: -100px;
          z-index: 1;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 40px;
          border-radius: 32px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.06);
        }

        .back-link {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 24px;
          transition: all 0.2s ease;
        }

        .back-link:hover {
          color: #4f46e5;
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
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
        }

        .brand-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.5px;
        }

        .brand-header p {
          font-size: 13px;
          color: #64748b;
          font-weight: 550;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .error-icon {
          font-size: 16px;
        }

        .error-msg {
          font-size: 13px;
          color: #dc2626;
          font-weight: 600;
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
          font-weight: 700;
          color: #475569;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s ease;
        }

        .form-group input::placeholder {
          color: #cbd5e1;
        }

        .form-group input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          border: none;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .login-footer {
          text-align: center;
          font-size: 11px;
          line-height: 1.5;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
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
