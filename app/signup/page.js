'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { supabaseClient } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLoading } from '@/components/TopLoader';

export default function SignupPage() {
  const { startLoading, completeLoading } = useLoading();
  const { user, loading: authLoading, role } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
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

  // Live password validation helper
  const validatePassword = (pwd) => {
    const requirements = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      lower: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
    const count = Object.values(requirements).filter(Boolean).length;
    let strength = 'Weak';
    let color = '#ef4444';
    if (count >= 5) {
      strength = 'Strong';
      color = '#10b981';
    } else if (count >= 3) {
      strength = 'Medium';
      color = '#f59e0b';
    }
    return { strength, color, requirements, isValid: count === 5 };
  };

  const passwordStrength = validatePassword(password);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validate email format
    if (!isEmailValid) {
      setErrorMsg('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    // Validate password strength
    if (!passwordStrength.isValid) {
      setErrorMsg('Password does not meet the required security requirements.');
      return;
    }

    setLoading(true);
    startLoading();
    try {
      console.log('🔄 [LaunchCart - MerchantSignup]: Calling signUp service for email:', email);
      
      const { data, error } = await authService.signUp(email, password, storeName);
      if (error) throw error;

      console.log('✅ [LaunchCart - MerchantSignup]: Signup successful, verification pending.', data);
      setIsSignedUp(true);
      setSuccessMsg('Account created successfully! Please verify your email before logging in.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error signing up. Please try again.');
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
    setSuccessMsg('');
    try {
      const callbackUrl = `${window.location.origin}/onboarding`;
      console.log(`🔄 [LaunchCart - MerchantSignup]: Triggering OAuth signup for ${provider} with callback ${callbackUrl}`);
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
      console.error(`❌ [LaunchCart - MerchantSignup]: ${provider} OAuth error:`, err);
      setErrorMsg(err.message || `Failed to sign up with ${provider}.`);
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

        {isSignedUp ? (
          <div className="verification-success-view" style={{ textAlign: 'center', marginTop: '16px' }}>
            <div className="success-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '12px' }}>Verify your email</h3>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
              We've sent a verification link to <strong style={{ color: '#0f172a' }}>{email}</strong>. Please check your inbox and click the link to confirm your account.
            </p>
            
            <button
              onClick={handleResendVerification}
              className="submit-btn"
              disabled={cooldown > 0}
              style={{
                background: cooldown > 0 ? '#cbd5e1' : 'linear-gradient(135deg, var(--accent) 0%, #1e40af 100%)',
                cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
            </button>
            
            {successMsg && (
              <div style={{
                padding: '12px 16px',
                background: '#ecfdf5',
                color: '#10b981',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                marginTop: '16px',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                textAlign: 'center'
              }}>
                {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div style={{
                padding: '12px 16px',
                background: '#fef2f2',
                color: '#ef4444',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                marginTop: '16px',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                textAlign: 'center'
              }}>
                {errorMsg}
              </div>
            )}

            <div style={{ marginTop: '24px' }}>
              <Link href="/login" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent)', textDecoration: 'none' }}>
                Go to Sign In page
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Brand Header */}
            <div className="brand-header">
              <div className="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h2>Create Your Store</h2>
              <p>Get started with your 14-day free trial</p>
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

            {/* Standard Signup Form */}
            <form onSubmit={handleSignup} className="login-form">
              <div className="form-group">
                <label htmlFor="storeName">Online Store Name</label>
                <input
                  type="text"
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Luxe Apparel"
                  required
                />
                <span className="field-hint">Your store URL will be: launchcart.com/store/{storeName.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>

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
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {password && (
                  <div className="strength-container" style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Password Strength:</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: passwordStrength.color }}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="strength-bar-bg" style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                      <div className="strength-bar-fill" style={{
                        height: '100%',
                        background: passwordStrength.color,
                        width: passwordStrength.strength === 'Weak' ? '33.3%' : passwordStrength.strength === 'Medium' ? '66.6%' : '100%',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <div className="requirements-list" style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: passwordStrength.requirements.length ? '#10b981' : '#94a3b8' }}>
                        {passwordStrength.requirements.length ? '✓' : '•'} Min 8 characters
                      </span>
                      <span style={{ fontSize: '10px', color: passwordStrength.requirements.upper ? '#10b981' : '#94a3b8' }}>
                        {passwordStrength.requirements.upper ? '✓' : '•'} 1 uppercase letter
                      </span>
                      <span style={{ fontSize: '10px', color: passwordStrength.requirements.lower ? '#10b981' : '#94a3b8' }}>
                        {passwordStrength.requirements.lower ? '✓' : '•'} 1 lowercase letter
                      </span>
                      <span style={{ fontSize: '10px', color: passwordStrength.requirements.number ? '#10b981' : '#94a3b8' }}>
                        {passwordStrength.requirements.number ? '✓' : '•'} 1 number
                      </span>
                      <span style={{ fontSize: '10px', color: passwordStrength.requirements.special ? '#10b981' : '#94a3b8' }}>
                        {passwordStrength.requirements.special ? '✓' : '•'} 1 special character
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Your Store...' : 'Create Store'}
              </button>
            </form>

            <div className="divider">
              <span>or register with social</span>
            </div>

            {/* Social Authentication */}
            <div className="social-auth">
              <button className="social-btn" onClick={() => handleSocialLogin('google')}>
                <span className="social-icon">🌐</span>
                Sign Up with Google
              </button>
            </div>

            {/* Form Footer */}
            <div className="login-footer">
              <span>Already have a store account? </span>
              <Link href="/login" className="register-link">
                Sign In
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
          bottom: -200px;
          right: -200px;
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

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
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

        .field-hint {
          font-size: 11px;
          color: var(--text-sub);
          font-weight: 500;
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

        .divider {
          text-align: center;
          position: relative;
          margin-bottom: 20px;
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
          font-size: 11px;
          color: var(--text-sub);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .social-auth {
          margin-bottom: 28px;
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
