'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import { storeService } from '@/services/storeService';
import { useLoading } from '@/components/TopLoader';

export default function StoreSignupPage({ params }) {
  const { slug } = use(params);
  const { startLoading, completeLoading } = useLoading();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || `/store/${slug}`;
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    startLoading();
    try {
      console.log('🔄 [LaunchCart - StoreSignupPage]: Triggering signUp for customer:', email);
      // SignUp options structure matches the schema setup to map role and metadata
      const result = await authService.signUp(email, password, name, 'customer', phone);
      if (result && result.error) throw result.error;

      // Auto-authenticate: check if a session is returned, otherwise login explicitly
      let session = result.data?.session;
      if (!session) {
        console.log('🔄 [LaunchCart - StoreSignupPage]: No session in signUp response, performing explicit signIn...');
        const loginRes = await authService.signIn(email, password);
        if (loginRes.error) throw loginRes.error;
        session = loginRes.data?.session;
      }
      
      console.log('✅ [LaunchCart - StoreSignupPage]: Customer signup and auto-login successful.');
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push(redirect);
      }, 1000);
    } catch (err) {
      console.error('❌ [LaunchCart - StoreSignupPage]: Signup error:', err);
      setErrorMsg(err.message || 'Failed to register account. Please try again.');
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  return (
    <div className="signup-container">
      <div className="glow-bg"></div>

      <div className="signup-card dashboard-card fade-in">
        <Link href={`/store/${slug}`} className="back-link">
          ← Back to store
        </Link>

        <div className="brand-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Create Customer Account</h2>
          <p>Register to start shopping at <strong>{storeDetails?.name || 'Store'}</strong></p>
        </div>

        {errorMsg && (
          <div className="error-banner">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="success-banner">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 (555) 019-2834"
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
              placeholder="Choose a password (min. 6 characters)"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          Already have an account?{' '}
          <Link href={`/store/${slug}/login?redirect=${encodeURIComponent(redirect)}`} className="register-link">
            Log in
          </Link>
        </div>
      </div>

      <style jsx>{`
        .signup-container {
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

        .signup-card {
          width: 100%;
          max-width: 460px;
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
          margin-bottom: 24px;
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
          margin-bottom: 24px;
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
          margin-bottom: 20px;
          border: 1px solid rgba(239, 68, 68, 0.1);
          text-align: center;
        }

        .success-banner {
          padding: 12px 16px;
          background: #ecfdf5;
          color: #10b981;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(16, 185, 129, 0.1);
          text-align: center;
        }

        .signup-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main, #1d1d1f);
        }

        .form-group input {
          width: 100%;
          padding: 11px 15px;
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
          margin-top: 8px;
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

        .signup-footer {
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
          .signup-card {
            padding: 32px 20px;
          }
        }
      `}</style>
    </div>
  );
}
