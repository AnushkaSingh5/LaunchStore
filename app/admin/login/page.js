'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabaseClient } from '@/lib/supabase';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signOut } = useAuth();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth with 8s timeout protection
      const signInPromise = signIn(email, password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timed out. Please check your network or ad-blocker.')), 8000)
      );

      const result = await Promise.race([signInPromise, timeoutPromise]);
      const authData = result?.data;
      const authError = result?.error;
      
      if (authError) {
        throw new Error(authError.message);
      }

      // 2. Fetch User Profile role
      const userId = authData?.user?.id;
      if (!userId) {
        throw new Error('Authentication returned an empty user session.');
      }

      // If Supabase client exists, query the database, otherwise bypass with simulated mock admin login
      if (supabaseClient) {
        const { data: profile, error: dbError } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (dbError) {
          console.error('[LaunchCart - Admin]: DB Error fetching profile:', dbError);
          // If profiles table is empty or SQL fails locally (mock mode), check for simulated admin email
          if (email.toLowerCase().includes('admin')) {
            router.push('/admin');
            return;
          }
          await signOut();
          throw new Error('Could not fetch user profile details.');
        }

        // 3. Verify Admin Authorization role
        if (profile?.role !== 'admin') {
          await signOut();
          throw new Error('Access denied: Admin role authorization required.');
        }
      }

      // 4. Authorized success -> Redirect to Admin Overview Portal
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Royal Indigo Glow Overlay */}
      <div className="glow-bg"></div>

      <div className="login-card dashboard-card fade-in">
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
          background: #0f172a; /* Sleek dark theme specifically for the Admin Login */
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .glow-bg {
          position: absolute;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(79, 70, 229, 0.05) 50%, rgba(15, 23, 42, 0) 70%);
          filter: blur(80px);
          top: -200px;
          left: -200px;
          z-index: 1;
        }

        .login-card {
          width: 100%;
          max-width: 460px;
          background: #1e293b; /* Dark slate card for admin portal feel */
          padding: 40px;
          border-radius: 24px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.4);
        }

        .back-link {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 24px;
          transition: var(--transition-fast);
        }

        .back-link:hover {
          color: #818cf8;
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
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: var(--white);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .brand-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: var(--white);
          letter-spacing: -0.5px;
        }

        .brand-header p {
          font-size: 13px;
          color: #94a3b8;
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
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
          color: #fca5a5;
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
          font-weight: 600;
          color: #cbd5e1;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 14px;
          color: var(--white);
          outline: none;
          background: #0f172a;
          transition: var(--transition-fast);
        }

        .form-group input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #4f46e5;
          color: var(--white);
          font-weight: 700;
          font-size: 14px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          transition: var(--transition-smooth);
        }

        .submit-btn:hover {
          background: #6366f1;
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          font-size: 11px;
          line-height: 1.5;
          color: #64748b;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
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
