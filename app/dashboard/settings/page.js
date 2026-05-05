'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '../../../services/dashboardService';
import Input from '../../../components/UI/Input';
import Select from '../../../components/UI/Select';
import Toggle from '../../../components/UI/Toggle';
import Button from '../../../components/UI/Button';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="settings-page fade-in">
      <div className="dashboard-header">
        <div>
          <h2>Store Settings</h2>
          <p className="text-sub">Manage your store's identity and basic configuration.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="settings-content">
        <div className="dashboard-card form-section">
          <h3>General Information</h3>
          <Input 
            label="Store Name" 
            value={settings.storeName} 
            onChange={(e) => handleChange('storeName', e.target.value)} 
          />
          <Input 
            label="Description" 
            type="textarea"
            value={settings.description} 
            onChange={(e) => handleChange('description', e.target.value)} 
          />
          
          <div className="image-uploads">
            <div className="upload-group">
              <label className="label">Store Logo</label>
              <div className="upload-box">
                <span className="icon">📷</span>
                <span>Upload Logo</span>
              </div>
            </div>
            <div className="upload-group">
              <label className="label">Store Banner</label>
              <div className="upload-box banner-box">
                <span className="icon">🖼️</span>
                <span>Upload Banner</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card form-section">
          <h3>Display Preferences</h3>
          <Toggle 
            label="Show Categories" 
            description="Display category navigation on the homepage."
            checked={settings.showCategories} 
            onChange={(val) => handleChange('showCategories', val)} 
          />
          <Toggle 
            label="Show Featured Products" 
            description="Highlight specific products on the storefront."
            checked={settings.showFeatured} 
            onChange={(val) => handleChange('showFeatured', val)} 
          />
          
          <Select 
            label="Default Product Sorting" 
            value={settings.defaultSort}
            onChange={(e) => handleChange('defaultSort', e.target.value)}
            options={[
              { label: 'Popularity', value: 'popular' },
              { label: 'Newest Arrivals', value: 'newest' },
              { label: 'Price: Low to High', value: 'price_asc' },
              { label: 'Price: High to Low', value: 'price_desc' },
            ]}
          />
        </div>
      </div>

      <style jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .dashboard-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .text-sub {
          color: var(--text-sub);
          font-size: 15px;
        }

        .settings-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          max-width: 800px;
        }

        .form-section {
          padding: 30px;
        }

        .form-section h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--secondary);
          padding-bottom: 16px;
        }

        .image-uploads {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 20px;
          margin-top: 20px;
        }

        .label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .upload-box {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-sub);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .upload-box:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: #f1f5f9;
        }

        .upload-box .icon {
          font-size: 24px;
        }

        @media (max-width: 768px) {
          .image-uploads {
            grid-template-columns: 1fr;
          }
          .dashboard-header {
            flex-direction: column;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}
