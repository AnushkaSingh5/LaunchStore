'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/components/TopLoader';

export default function LoginPage() {
  const { startLoading, completeLoading } = useLoading();
  const { user, loading: authLoading, role } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (role === 'creator') {
        router.push('/dashboard');
      } else if (role === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, authLoading, role, router]);

  // Cooldown countdown effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Check URL parameters & hash callbacks
  useEffect(() => {
    const hash = window.location.hash || '';
    const params = new URLSearchParams(window.location.search);
    
    if (hash.includes('error=access_denied') && hash.includes('error_code=otp_expired')) {
      setErrorMsg('Verification link expired. Resend Verification.');
    } else if (hash.includes('error=access_denied')) {
      setErrorMsg('Access denied or recovery link expired.');
    } else if (params.get('verified') === 'true' || hash.includes('type=signup') || params.get('type') === 'signup') {
      setSuccessMsg('Email verified successfully! You can now sign in.');
    } else if (hash.includes('type=recovery') || params.get('type') === 'recovery') {
      console.log('🔄 [LaunchCart - Login]: Password recovery link detected, redirecting...');
      router.push('/reset-password');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    startLoading();
    try {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailValid) {
        throw new Error('Please enter a valid email address.');
      }

      console.log('🔄 [LaunchCart - LoginPage]: Triggering signIn for creator:', email);
      const result = await authService.signIn(email, password);
      if (result && result.error) throw result.error;
      
      const sessionUser = result.data?.user;
      if (sessionUser) {
        // Email Verification check: if unconfirmed, sign out immediately
        if (!sessionUser.email_confirmed_at) {
          console.warn('❌ [LaunchCart - LoginPage]: Email not verified.');
          await authService.signOut();
          throw new Error('Please verify your email before signing in.');
        }
      }

      // Set remember me state
      localStorage.setItem('remember_me', rememberMe ? 'true' : 'false');
      if (!rememberMe) {
        sessionStorage.setItem('session_active', 'true');
      } else {
        sessionStorage.removeItem('session_active');
      }

      console.log('✅ [LaunchCart - LoginPage]: SignIn response success, redirecting...');
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ [LaunchCart - LoginPage]: Login error:', err);
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials') || msg.includes('Failed to authenticate') || msg.includes('invalid_credentials')) {
        setErrorMsg('Incorrect email or password.');
      } else {
        setErrorMsg(msg || 'Incorrect email or password.');
      }
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    startLoading();
    try {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isEmailValid) {
        throw new Error('Please enter a valid email address.');
      }
      
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setSuccessMsg('Password reset link sent! Check your email inbox.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  const handleResendVerification = async () => {
    if (cooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabaseClient.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      setSuccessMsg('Verification email resent successfully!');
      setCooldown(60);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification email.');
    }
  };

  const handleSocialLogin = async (provider) => {
    setErrorMsg('');
    try {
      const callbackUrl = `${window.location.origin}/dashboard`;
      console.log(`🔄 [LaunchCart - LoginPage]: Triggering OAuth login for ${provider} with callback ${callbackUrl}`);
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl,
          data: {
            role: 'creator',
          }
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error(`❌ [LaunchCart - LoginPage]: ${provider} OAuth error:`, err);
      setErrorMsg(err.message || `Failed to sign in with ${provider}.`);
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

        {view === 'forgot' ? (
          <>
            {/* Brand Header */}
            <div className="brand-header">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2>Reset Password</h2>
              <p>Enter your email to receive a password recovery link</p>
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

            {successMsg && (
              <div style={{
                padding: '12px 16px',
                background: '#ecfdf5',
                color: '#10b981',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '24px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                textAlign: 'center'
              }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="login-form">
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

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Sending Recovery Link...' : 'Send Recovery Link'}
              </button>
            </form>

            <div className="login-footer" style={{ marginTop: '24px' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setView('login'); setErrorMsg(''); setSuccessMsg(''); }} className="register-link">
                Back to Sign In
              </a>
            </div>
          </>
        ) : (
          <>
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
                <div>{errorMsg}</div>
                {(errorMsg.includes('verify your email') || errorMsg.includes('Verification link expired')) && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={cooldown > 0}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        textDecoration: 'underline',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                        padding: '0'
                      }}
                    >
                      {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive email? Resend Verification"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <div style={{
                padding: '12px 16px',
                background: '#ecfdf5',
                color: '#10b981',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '24px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                textAlign: 'center'
              }}>
                {successMsg}
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
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); setView('forgot'); setErrorMsg(''); setSuccessMsg(''); }} className="forgot-link">Forgot password?</a>
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

              {/* Remember Me Checkbox */}
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0 12px 0' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer', fontWeight: '500', userSelect: 'none' }}>
                  Remember me
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="divider">
              <span>or continue with email</span>
            </div>

            {/* Social Authentication */}
            <div className="social-auth">
              <button className="social-btn" onClick={() => handleSocialLogin('google')}>
                <span className="social-icon">🌐</span>
                Continue with Google
              </button>
            </div>

            {/* Form Footer */}
            <div className="login-footer">
              <span>Don't have a store account? </span>
              <Link href="/signup" className="register-link">
                Create Your Store
              </Link>
            </div>
          </>
        )}
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
