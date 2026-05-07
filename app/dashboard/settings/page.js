'use client';

import { useState, useEffect, useRef } from 'react';
import { dashboardService } from '@/services/dashboardService';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Toggle from '@/components/UI/Toggle';
import Button from '@/components/UI/Button';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await dashboardService.getSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await dashboardService.updateSettings(settings);
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(field, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="settings-page">
      {/* Header section with title and breadcrumbs */}

      <div className="settings-title-row">
        <div className="title-left">
          <h1>Store Settings</h1>
          <p>Manage your store's identity and basic configuration.</p>
        </div>
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="settings-container">
        {/* General Information Card */}
        <div className="settings-card">
          <div className="card-header">
            <div className="section-icon" style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <h3>General Information</h3>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder="Enter store name"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={settings.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter store description"
                rows="3"
              />
            </div>
          </div>

          <div className="upload-grid">
            <div className="upload-group">
              <label><b>Store Logo</b></label>
              <input
                type="file"
                ref={logoInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileUpload('logo', e)}
              />
              <div className="upload-box" onClick={() => logoInputRef.current.click()}>
                {settings.logo ? (
                  <div className="preview-container">
                    <img src={settings.logo} alt="Logo preview" className="logo-preview" />
                    <div className="preview-overlay">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      <span>Change Logo</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <strong>Upload Logo</strong>
                    <p>PNG, JPG up to 2MB</p>
                  </>
                )}
              </div>
            </div>
            <div className="upload-group">
              <label><b>Store Banner</b></label>
              <input
                type="file"
                ref={bannerInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={(e) => handleFileUpload('banner', e)}
              />
              <div className="upload-box banner" onClick={() => bannerInputRef.current.click()}>
                {settings.banner ? (
                  <div className="preview-container">
                    <img src={settings.banner} alt="Banner preview" className="banner-preview" />
                    <div className="preview-overlay">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      <span>Change Banner</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="upload-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <strong>Upload Banner</strong>
                    <p>PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Display Preferences Card */}
        <div className="settings-card">
          <div className="card-header">
            <div className="section-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"></path><path d="M18 17l-6-6-4 4-5-5"></path></svg>
            </div>
            <h3>Display Preferences</h3>
          </div>

          <div className="toggle-grid">
            <div className="toggle-item">
              <div className="toggle-info">
                <strong>Show Categories</strong>
                <p>Display category navigation on the homepage.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.showCategories}
                  onChange={(e) => handleChange('showCategories', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <strong>Show Featured Products</strong>
                <p>Highlight specific products on the storefront.</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.showFeatured}
                  onChange={(e) => handleChange('showFeatured', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '24px' }}>
            <label>Default Product Sorting</label>
            <div className="select-wrapper">
              <select
                value={settings.defaultSort}
                onChange={(e) => handleChange('defaultSort', e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
              <svg className="select-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-bottom: 40px;
        }


        .settings-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .title-left h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }

        .title-left p {
          color: #64748b;
          font-size: 14px;
          margin: 4px 0 0 0;
        }

        .save-btn {
          background: #6366f1;
          color: #fff;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
          transition: all 0.2s ease;
        }

        .save-btn:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .settings-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-card {
          background: #fff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .section-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
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

        .form-group input, 
        .form-group textarea,
        .form-group select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: #475569;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus, 
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: #8b5cf6;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }

        .upload-box {
          background: #fff;
          border: 1.5px dashed #e2e8f0;
          border-radius: 16px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-box:hover {
          border-color: #8b5cf6;
          background: #fbfaff;
        }

        .upload-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #f5f3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .upload-box strong {
          font-size: 14px;
          color: #1e293b;
        }

        .upload-box p {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .preview-container {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-preview {
          max-width: 100px;
          max-height: 100px;
          object-fit: contain;
        }

        .banner-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 12px;
        }

        .preview-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: 12px;
        }

        .preview-container:hover .preview-overlay {
          opacity: 1;
        }

        .preview-overlay span {
          color: #fff;
          font-size: 12px;
          font-weight: 700;
        }

        .toggle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }

        .toggle-info strong {
          display: block;
          font-size: 14px;
          color: #1e293b;
          margin-bottom: 2px;
        }

        .toggle-info p {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        /* Switch Styling */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: #6366f1;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        .slider.round {
          border-radius: 24px;
        }

        .slider.round:before {
          border-radius: 50%;
        }

        .select-wrapper {
          position: relative;
        }

        .select-wrapper select {
          width: 100%;
          appearance: none;
        }

        .select-caret {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .form-grid, .upload-grid, .toggle-grid {
            grid-template-columns: 1fr;
          }
          .settings-title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
