'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminGuard({ children }) {
  const { adminUser, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth checking has finished and user is not verified as an admin, redirect to login
    if (!loading && pathname !== '/admin/login') {
      if (!adminUser) {
        router.push('/admin/login');
      }
    }
    // If user is already authenticated as an admin and visits the login page, redirect to the dashboard
    if (!loading && pathname === '/admin/login' && adminUser) {
      router.push('/admin');
    }
  }, [adminUser, loading, router, pathname]);

  // Bypass protection for login route itself to prevent cycles
  if (pathname === '/admin/login') {
    // If authenticated as admin, let the useEffect handle the redirect to /admin
    if (adminUser) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#fff',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Redirecting to Admin Dashboard...
        </div>
      );
    }
    return children;
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

  // If session resolves but not logged in
  if (!adminUser) {
    return null;
  }

  // Verified Admin -> Render contents
  return children;
}
