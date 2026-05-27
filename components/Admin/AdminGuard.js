'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AdminGuard({ children }) {
  const { user, role, loading, authTimeoutError, retryAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth checking has finished and user is not verified as an admin, redirect
    if (!loading && pathname !== '/admin/login') {
      if (!user || role !== 'admin') {
        router.push('/admin/login');
      }
    }
  }, [user, role, loading, router, pathname]);

  // Bypass protection for login route itself to prevent cycles
  if (pathname === '/admin/login') {
    return children;
  }

  // Display Premium Error State on Timeout
  if (authTimeoutError && loading === false && (!user || role !== 'admin')) {
    return (
      <div className="timeout-screen">
        <div className="glow-bg"></div>
        <div className="error-card fade-in">
          <div className="error-icon">⚠️</div>
          <h2>Authorization Request Timeout</h2>
          <p>We are experiencing unexpected delays communicating with the security server. This could be due to a strict network firewall or connection issues.</p>
          <div className="btn-group">
            <button className="retry-btn" onClick={retryAuth}>Retry Connection</button>
            <button className="secondary-btn" onClick={() => router.push('/admin/login')}>Return to Login</button>
          </div>
        </div>

        <style jsx>{`
          .timeout-screen {
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            padding: 24px;
            position: relative;
            overflow: hidden;
            font-family: 'Outfit', sans-serif;
          }
          .glow-bg {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0) 70%);
            top: -150px;
            left: -150px;
            z-index: 1;
          }
          .error-card {
            width: 100%;
            max-width: 460px;
            background: #1e293b;
            padding: 40px;
            border-radius: 24px;
            position: relative;
            z-index: 2;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.4);
            text-align: center;
          }
          .error-icon {
            font-size: 40px;
            margin-bottom: 20px;
          }
          .error-card h2 {
            font-size: 22px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          .error-card p {
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .btn-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .retry-btn {
            width: 100%;
            padding: 14px;
            background: #4f46e5;
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .retry-btn:hover {
            background: #6366f1;
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
            transform: translateY(-1px);
          }
          .secondary-btn {
            width: 100%;
            padding: 14px;
            background: transparent;
            color: #cbd5e1;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s;
            cursor: pointer;
          }
          .secondary-btn:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
          }
        `}</style>
      </div>
    );
  }

  // Modern Loader Spinner Screen
  if (loading) {
    return (
      <div className="loader-screen">
        <div className="spinner"></div>
        <p>Verifying Admin Command Credentials...</p>
        <style jsx>{`
          .loader-screen {
            height: 100vh;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #fff;
            gap: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .spinner {
            width: 44px;
            height: 44px;
            border: 4px solid rgba(255, 255, 255, 0.05);
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          p {
            font-size: 14px;
            font-weight: 600;
            color: #94a3b8;
          }
        `}</style>
      </div>
    );
  }

  // If session resolves but role check is wrong
  if (!user || role !== 'admin') {
    return null;
  }

  // Verified Admin -> Render contents
  return children;
}
