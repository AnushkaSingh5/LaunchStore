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
  
  // Store Setup Form State
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      console.log("Navigation triggered");
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile && profile.name && profile.name !== 'New Merchant' && !storeName) {
      const timer = setTimeout(() => {
        setStoreName(profile.name);
        setSlug(profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profile, storeName]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setStoreName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!storeName || !slug) {
      alert('Store Name and URL slug are required.');
      return;
    }
    setCreating(true);
    try {
      console.log('🔄 [LaunchCart - Onboarding]: Checking for existing store first...');
      const existingStore = await storeService.getStoreByCreator(user.id);
      
      let newStore = existingStore;
      if (existingStore) {
        console.log('✅ [LaunchCart - Onboarding]: Existing store found. ID:', existingStore.id);
        console.log('🔄 [LaunchCart - Onboarding]: Updating existing store settings...');
        newStore = await storeService.updateStore(existingStore.id, {
          name: storeName,
          slug,
          description,
        });
        console.log('✅ [LaunchCart - Onboarding]: Existing store updated. ID:', newStore.id);
      } else {
        console.log('🔄 [LaunchCart - Onboarding]: Creating store database record first...');
        newStore = await storeService.createStore({
          creator_id: user.id,
          name: storeName,
          slug,
          description,
          logo_url: '',
          banner_url: '',
          status: 'approved', // Automatically approved in development/testing!
        });
        console.log('✅ [LaunchCart - Onboarding]: Store record created successfully. ID:', newStore.id);
      }

      // Verify store.id and store.slug exist before upload begins
      if (!newStore || !newStore.id || !newStore.slug) {
        throw new Error('Store record could not be resolved or created successfully.');
      }

      console.log("Store ID:", newStore.id);

      let logoUrl = '';
      let bannerUrl = '';

      if (logoFile) {
        console.log("Uploading logo...");
        console.log('🔄 [LaunchCart - Onboarding]: Uploading logo for store ID:', newStore.id);
        logoUrl = await storeService.uploadLogo(logoFile, newStore.id);
        console.log('✅ [LaunchCart - Onboarding]: Logo uploaded. URL:', logoUrl);
      }
      if (bannerFile) {
        console.log("Uploading banner...");
        console.log('🔄 [LaunchCart - Onboarding]: Uploading banner for store ID:', newStore.id);
        bannerUrl = await storeService.uploadBanner(bannerFile, newStore.id);
        console.log('✅ [LaunchCart - Onboarding]: Banner uploaded. URL:', bannerUrl);
      }

      if (logoUrl || bannerUrl) {
        console.log('🔄 [LaunchCart - Onboarding]: Saving logo/banner URLs to store...');
        await storeService.updateStore(newStore.id, {
          logo_url: logoUrl || undefined,
          banner_url: bannerUrl || undefined,
        });
        console.log('✅ [LaunchCart - Onboarding]: Store URLs updated.');
      }

      console.log('🔄 [LaunchCart - Onboarding]: Refreshing store state...');
      await refreshStore(user.id);
      console.log('✅ [LaunchCart - Onboarding]: Store state refreshed.');

      console.log('🔄 [LaunchCart - Onboarding]: Redirecting to dashboard...');
      console.log("Navigation triggered");
      router.push('/dashboard');
    } catch (err) {
      console.error('❌ [LaunchCart - Onboarding]: Failed to create store:', err);
      alert('Error creating store: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

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
    return (
      <div className="setup-container">
        <div className="glow-bg"></div>
        <div className="setup-card fade-in">
          <div className="setup-header">
            <div className="logo-icon">🚀</div>
            <h2>Create Your Online Store</h2>
            <p>You are one step away from building your dream store. Setup your store profile to begin adding products.</p>
          </div>

          <form onSubmit={handleCreateStore} className="setup-form">
            <div className="form-group">
              <label>Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={handleNameChange}
                placeholder="e.g. Luxe Studio"
                required
              />
            </div>

            <div className="form-group">
              <label>Store URL Path (Slug)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="luxe-studio"
                required
              />
              <span className="slug-preview">Live URL preview: <strong>launchcart.com/store/{slug || '...'}</strong></span>
            </div>

            <div className="form-group">
              <label>Store Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Experience custom curated minimalist designs..."
                rows="3"
              />
            </div>

            <div className="upload-grid">
              <div className="upload-box-wrapper">
                <label>Store Logo</label>
                <div className="upload-placeholder" onClick={() => document.getElementById('logo-file').click()}>
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo Preview" />
                  ) : (
                    <span>Upload Logo (Square)</span>
                  )}
                  <input type="file" id="logo-file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="upload-box-wrapper">
                <label>Store Banner</label>
                <div className="upload-placeholder banner" onClick={() => document.getElementById('banner-file').click()}>
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner Preview" />
                  ) : (
                    <span>Upload Banner (Landscape)</span>
                  )}
                  <input type="file" id="banner-file" accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={creating}>
              {creating ? 'Building Your Store...' : 'Launch Store'}
            </button>
          </form>
        </div>

        <style jsx>{`
          .setup-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            padding: 40px 20px;
            position: relative;
            overflow: hidden;
          }
          .glow-bg {
            position: absolute;
            width: 800px;
            height: 800px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(255,255,255,0) 70%);
            top: -200px;
            left: -200px;
          }
          .setup-card {
            width: 100%;
            max-width: 640px;
            background: #ffffff;
            border-radius: 24px;
            padding: 40px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(0, 0, 0, 0.03);
            position: relative;
            z-index: 10;
          }
          .setup-header {
            text-align: center;
            margin-bottom: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .logo-icon {
            font-size: 32px;
            background: #f5f3ff;
            width: 64px;
            height: 64px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8b5cf6;
          }
          .setup-header h2 {
            font-size: 26px;
            font-weight: 800;
            color: #1e293b;
          }
          .setup-header p {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
            max-width: 480px;
          }
          .setup-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-group label {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
          }
          .form-group input, .form-group textarea {
            padding: 12px 16px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            outline: none;
            background: #f8fafc;
            font-size: 14px;
            transition: all 0.2s;
          }
          .form-group input:focus, .form-group textarea:focus {
            border-color: #8b5cf6;
            background: #fff;
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.08);
          }
          .slug-preview {
            font-size: 11px;
            color: #64748b;
          }
          .slug-preview strong {
            color: #8b5cf6;
          }
          .upload-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .upload-box-wrapper {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .upload-box-wrapper label {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
          }
          .upload-placeholder {
            height: 120px;
            border: 1.5px dashed #cbd5e1;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
            background: #f8fafc;
            transition: all 0.2s;
            text-align: center;
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            padding: 8px;
          }
          .upload-placeholder:hover {
            border-color: #8b5cf6;
            background: #f5f3ff;
            color: #8b5cf6;
          }
          .upload-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .upload-placeholder.banner img {
            object-fit: cover;
          }
          .submit-btn {
            padding: 14px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: #fff;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(139, 92, 246, 0.3);
          }
          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          @media (max-width: 600px) {
            .upload-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
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
