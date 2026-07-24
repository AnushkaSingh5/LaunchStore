'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase';
import { useLoading } from '@/components/TopLoader';

export default function ResetPasswordPage() {
  const { startLoading, completeLoading } = useLoading();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  // Check if a recovery session is present (Supabase sets session on redirect from recovery link)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
          setSessionActive(true);
        } else {
          // If no session, check if there is an error in URL hash
          const hash = window.location.hash || '';
          if (hash.includes('error=access_denied') || hash.includes('error_code=otp_expired')) {
            setErrorMsg('Reset link expired. Request another one.');
          } else {
            setErrorMsg('Invalid or expired reset link. Please request a new one.');
          }
        }
      } catch (err) {
        setErrorMsg('Error checking reset link session.');
      } finally {
        setCheckingSession(false);
      }
    };
    checkSession();
  }, []);

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

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!passwordStrength.isValid) {
      setErrorMsg('Password does not meet security requirements.');
      return;
    }

    setLoading(true);
    startLoading();
    try {
      const { error } = await supabaseClient.auth.updateUser({
        password: password
      });
      if (error) throw error;
      
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Reset link may have expired.');
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  if (checkingSession) {
    return (
      <div className="login-container">
        <div className="login-card dashboard-card" style={{ textAlign: 'center' }}>
          <p>Verifying link validity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="glow-bg"></div>

      <div className="login-card dashboard-card fade-in">
        <div className="brand-header">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h2>Create New Password</h2>
          <p>Enter your new password below</p>
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

        {sessionActive ? (
          <form onSubmit={handleResetPassword} className="login-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
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
                  <div style={{ display: 'flex', justifycontent: 'space-between', alignitems: 'center', marginbottom: '4px' }}>
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              You can request a new reset password link from the Login page.
            </p>
            <Link href="/login" className="submit-btn" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              Request another link
            </Link>
          </div>
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
          background: #ffffff;
          padding: 40px;
          border-radius: 24px;
          position: relative;
          z-index: 2;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
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
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }

        .brand-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          letter-spacing: -0.5px;
        }

        .brand-header p {
          font-size: 13px;
          color: #64748b;
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
          color: #334155;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          color: #1e293b;
          background: #f8fafc;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-group input:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
          outline: none;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
        }

        .submit-btn:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
