'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { storeService } from '@/services/storeService';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { DashboardProvider } from '@/context/DashboardContext';
import PageLoader from '@/components/PageLoader';

function CreatorDashboardGuard({ children }) {
  const { user, role, store, storeLoading, profile, loading, refreshStore, authTimeoutError, retryAuth, signOut } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      console.log("Navigation triggered");
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && !storeLoading && user && role === 'creator' && !store) {
      console.log('🔄 [LaunchCart - Guard]: No store found for creator, redirecting to onboarding...');
      router.push('/onboarding');
    }
  }, [loading, storeLoading, user, role, store, router]);

  const handleSignOut = async () => {
    await signOut();
    console.log("Navigation triggered");
    router.push('/login');
  };

  if (authTimeoutError && loading === false && (!user || role !== 'creator')) {
    return (
      <div className="timeout-screen">
        <div className="glow-bg"></div>
        <div className="error-card fade-in">
          <div className="error-icon">⚠️</div>
          <h2>Creator Authorization Timeout</h2>
          <p>We are experiencing unexpected delays communicating with the storefront platform database. This can be caused by local ad-blockers, network firewalls, or intermittent connectivity.</p>
          <div className="btn-group">
            <button className="retry-btn" onClick={retryAuth}>Retry Connection</button>
            <button className="secondary-btn" onClick={() => router.push('/login')}>Return to Login</button>
          </div>
        </div>

        <style jsx>{`
          .timeout-screen {
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            padding: 24px;
            position: relative;
            overflow: hidden;
            font-family: 'Outfit', sans-serif;
          }
          .glow-bg {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
            top: -150px;
            left: -150px;
            z-index: 1;
          }
          .error-card {
            width: 100%;
            max-width: 460px;
            background: #ffffff;
            padding: 40px;
            border-radius: 24px;
            position: relative;
            z-index: 2;
            border: 1px solid rgba(0, 0, 0, 0.03);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
            text-align: center;
          }
          .error-icon {
            font-size: 40px;
            margin-bottom: 20px;
          }
          .error-card h2 {
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          .error-card p {
            font-size: 13px;
            color: #64748b;
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
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .retry-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
          }
          .secondary-btn {
            width: 100%;
            padding: 14px;
            background: transparent;
            color: #64748b;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            transition: all 0.2s;
            cursor: pointer;
          }
          .secondary-btn:hover {
            background: #f1f5f9;
            color: #1e293b;
          }
        `}</style>
      </div>
    );
  }

  if ((loading || storeLoading) && !profile) {
    return <PageLoader />;
  }

  if (loading || storeLoading) {
    return (
      <DashboardLayout>
        <div className="dashboard-skeleton">
          <div className="skeleton-row">
            <div className="skeleton-item shim" style={{ height: '140px', borderRadius: '16px' }}></div>
            <div className="skeleton-item shim" style={{ height: '140px', borderRadius: '16px' }}></div>
            <div className="skeleton-item shim" style={{ height: '140px', borderRadius: '16px' }}></div>
          </div>
          <div className="skeleton-box shim" style={{ height: '360px', borderRadius: '16px', marginTop: '24px' }}></div>
        </div>
        <style jsx>{`
          .dashboard-skeleton {
            display: flex;
            flex-direction: column;
            width: 100%;
          }
          .skeleton-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .skeleton-item, .skeleton-box {
            background: #fff;
            border: 1px solid rgba(0, 0, 0, 0.03);
          }
          .shim {
            position: relative;
            overflow: hidden;
          }
          .shim::after {
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            background-image: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.4) 20%,
              rgba(255, 255, 255, 0.6) 60%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: shimmer 1.5s infinite;
            content: '';
          }
          @keyframes shimmer {
            100% { transform: translateX(100%); }
          }
          @media (max-width: 768px) {
            .skeleton-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </DashboardLayout>
    );
  }

  if (!user) return null;

  if (role !== 'creator') {
    return (
      <div className="timeout-screen">
        <div className="glow-bg"></div>
        <div className="error-card fade-in">
          <div className="error-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>This panel is designated for store creators. You are currently logged in as a <strong>{role}</strong> ({user.email}).</p>
          <div className="btn-group">
            <button className="retry-btn" onClick={handleSignOut}>Sign Out & Switch Account</button>
            <button className="secondary-btn" onClick={() => router.push('/')}>Return to Storefront</button>
          </div>
        </div>

        <style jsx>{`
          .timeout-screen {
            height: 100vh;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            padding: 24px;
            position: relative;
            overflow: hidden;
            font-family: 'Outfit', sans-serif;
          }
          .glow-bg {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 0) 70%);
            top: -150px;
            left: -150px;
            z-index: 1;
          }
          .error-card {
            width: 100%;
            max-width: 460px;
            background: #ffffff;
            padding: 40px;
            border-radius: 24px;
            position: relative;
            z-index: 2;
            border: 1px solid rgba(0, 0, 0, 0.03);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.03);
            text-align: center;
          }
          .error-icon {
            font-size: 40px;
            margin-bottom: 20px;
          }
          .error-card h2 {
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            margin-bottom: 12px;
            letter-spacing: -0.5px;
          }
          .error-card p {
            font-size: 13px;
            color: #64748b;
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
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .retry-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
          }
          .secondary-btn {
            width: 100%;
            padding: 14px;
            background: transparent;
            color: #64748b;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            transition: all 0.2s;
            cursor: pointer;
          }
          .secondary-btn:hover {
            background: #f1f5f9;
            color: #1e293b;
          }
        `}</style>
      </div>
    );
  }

  if (!store) {
    return <PageLoader />;
  }

  return children;
}

export default function Layout({ children }) {
  return (
    <DashboardProvider>
      <CreatorDashboardGuard>
        <DashboardLayout>{children}</DashboardLayout>
      </CreatorDashboardGuard>
    </DashboardProvider>
  );
}
