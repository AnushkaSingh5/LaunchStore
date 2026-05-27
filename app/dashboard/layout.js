'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { storeService } from '@/services/storeService';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { DashboardProvider } from '@/context/DashboardContext';

function CreatorDashboardGuard({ children }) {
  const { user, role, store, profile, loading, refreshStore, authTimeoutError, retryAuth } = useAuth();
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
      let logoUrl = '';
      let bannerUrl = '';

      if (logoFile) {
        logoUrl = await storeService.uploadLogo(logoFile, user.id);
      }
      if (bannerFile) {
        bannerUrl = await storeService.uploadBanner(bannerFile, user.id);
      }

      await storeService.createStore({
        creator_id: user.id,
        name: storeName,
        slug,
        description,
        logo_url: logoUrl,
        banner_url: bannerUrl,
        status: 'pending', // Starts as pending for store approval system!
      });

      await refreshStore();
    } catch (err) {
      console.error(err);
      alert('Error creating store: ' + err.message);
    } finally {
      setCreating(false);
    }
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

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="spinner"></div>
        <p>Loading Creator Dashboard...</p>
        <style jsx>{`
          .loader-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            gap: 16px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  if (role !== 'creator') {
    return (
      <div className="denied-screen">
        <h2>Access Denied</h2>
        <p>This panel is designated for store creators.</p>
        <button onClick={() => router.push('/admin/login')}>Go to Admin Panel</button>
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
