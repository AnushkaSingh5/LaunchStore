'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { storeService } from '@/services/storeService';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
import { authService } from '@/services/authService';
import PageLoader from '@/components/PageLoader';
import ImageCropperModal from '@/components/ImageCropperModal';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, store, loading, storeLoading, refreshStore, refreshProfile } = useAuth();

  const initialStepLoadedRef = useRef(false);

  // Wizard Step State (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatingToSuccess, setIsNavigatingToSuccess] = useState(false);

  // Step 2: Store Details State
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropType, setCropType] = useState('banner');

  // Step 3: Category Setup State
  const [categoryName, setCategoryName] = useState('');
  const [categoryFile, setCategoryFile] = useState(null);
  const [categoryPreview, setCategoryPreview] = useState('');
  const [createdCategory, setCreatedCategory] = useState(null);

  // Step 4: Product Setup State
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('10');
  const [productFile, setProductFile] = useState(null);
  const [productPreview, setProductPreview] = useState('');
  const [createdProduct, setCreatedProduct] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load existing profile onboarding step and store details on mount
  useEffect(() => {
    if (!loading && !storeLoading && profile) {
      if (profile.onboarding_completed && store && !isNavigatingToSuccess) {
        console.log('🔄 [LaunchCart - Onboarding]: Onboarding complete and store exists, redirecting to dashboard...');
        router.push('/dashboard');
        return;
      }
      
      // If profile says onboarding is completed but we have no store, reset it in DB
      if (profile.onboarding_completed && !store) {
        console.log('🔄 [LaunchCart - Onboarding]: Profile completed onboarding but no store exists. Resetting database state...');
        authService.updateProfile(user.id, { onboarding_completed: false, onboarding_step: 1 })
          .then(() => refreshProfile())
          .catch(err => console.error('Failed to reset onboarding state:', err));
        return;
      }
      
      if (!initialStepLoadedRef.current) {
        initialStepLoadedRef.current = true;
        // If no store exists yet, force start from Step 1 (Welcome) to configure details
        if (!store) {
          setCurrentStep(1);
        } else if (profile.onboarding_step > 0 && profile.onboarding_step <= 5) {
          setCurrentStep(profile.onboarding_step);
        }
      }
    }
  }, [profile, store, loading, storeLoading, router]);

  // Pre-populate store details if store already exists
  useEffect(() => {
    if (store) {
      setStoreName(store.name || '');
      setSlug(store.slug || '');
      setDescription(store.description || '');
      if (store.logo_url) setLogoPreview(store.logo_url);
      if (store.banner_url) setBannerPreview(store.banner_url);
    } else if (profile && profile.name && profile.name !== 'New Merchant' && !storeName) {
      setStoreName(profile.name);
      setSlug(profile.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [store, profile]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setStoreName(val);
    setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
  };



  const handleCroppedImageConfirm = (croppedFile) => {
    setCropperOpen(false);
    setSelectedFile(null);
    if (cropType === 'logo') {
      setLogoFile(croppedFile);
      setLogoPreview(URL.createObjectURL(croppedFile));
    } else {
      setBannerFile(croppedFile);
      setBannerPreview(URL.createObjectURL(croppedFile));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Unsupported file format. Please upload a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Logo file size exceeds the 2MB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Unsupported file format. Please upload a JPG, PNG, or WEBP image.');
      e.target.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds the 5MB limit. Please upload a smaller image.');
      e.target.value = '';
      return;
    }

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Step transitions and DB state sync (Optimistic UI updates)
  const updateOnboardingStep = async (step) => {
    setCurrentStep(step);
    try {
      if (user?.id) {
        await authService.updateProfile(user.id, { 
          onboarding_step: step,
          onboarding_completed: false
        });
        await refreshProfile();
      }
    } catch (err) {
      const errMsg = err?.message || err?.error_description || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      console.error('❌ [LaunchCart - updateOnboardingStep] Error updating onboarding step in DB:', errMsg);
      if (err && typeof err === 'object') {
        console.error('Error details:', {
          message: err.message,
          details: err.details,
          code: err.code,
          hint: err.hint
        });
      }
    }
  };

  // Submit Step 2: Store Setup
  const handleSubmitStore = async (e) => {
    e.preventDefault();
    if (!storeName || !slug) return;
    setIsSubmitting(true);
    try {
      let activeStore = store;
      if (!activeStore) {
        activeStore = await storeService.getStoreByCreator(user.id);
      }

      let resultStore;
      if (activeStore) {
        resultStore = await storeService.updateStore(activeStore.id, {
          name: storeName,
          slug,
          description,
        });
      } else {
        resultStore = await storeService.createStore({
          creator_id: user.id,
          name: storeName,
          slug,
          description,
          logo_url: '',
          banner_url: '',
          status: 'pending', // Starts pending until Step 5 Publish
        });
      }

      // Upload files if selected
      let logoUrl = resultStore.logo_url;
      let bannerUrl = resultStore.banner_url;

      if (logoFile) {
        logoUrl = await storeService.uploadLogo(logoFile, resultStore.id);
      }
      if (bannerFile) {
        bannerUrl = await storeService.uploadBanner(bannerFile, resultStore.id);
      }

      if (logoUrl !== resultStore.logo_url || bannerUrl !== resultStore.banner_url) {
        await storeService.updateStore(resultStore.id, {
          logo_url: logoUrl,
          banner_url: bannerUrl,
        });
      }

      await updateOnboardingStep(3);
      await refreshStore();
    } catch (err) {
      console.error('Failed to save store details:', err);
      alert('Failed to save store details. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 3: Create Category
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!categoryName) return;
    setIsSubmitting(true);
    try {
      let imageBase64 = '';
      if (categoryFile) {
        imageBase64 = await fileToBase64(categoryFile);
      }

      const cat = await categoryService.createCategory({
        store_id: store.id,
        name: categoryName,
        image: imageBase64,
      });

      setCreatedCategory(cat);
      await updateOnboardingStep(4);
    } catch (err) {
      console.error('Failed to create category:', err);
      alert('Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 4: Create Product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!productName || !productPrice) return;
    setIsSubmitting(true);
    try {
      let imageBase64 = '';
      if (productFile) {
        imageBase64 = await fileToBase64(productFile);
      }

      const prod = await productService.createProduct({
        store_id: store.id,
        category_id: createdCategory?.id || null,
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        stock: parseInt(productStock) || 0,
        image: imageBase64,
        status: 'Published',
      });

      setCreatedProduct(prod);
      await updateOnboardingStep(5);
    } catch (err) {
      console.error('Failed to create product:', err);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Step 5: Publish Store (Submits store for review)
  const handlePublishStore = async () => {
    setIsSubmitting(true);
    setIsNavigatingToSuccess(true);
    try {
      // 1. Submit store for review (status = 'pending')
      await storeService.updateStore(store.id, { status: 'pending', status_reason: null });
      // 2. Mark profile onboarding complete
      await authService.updateProfile(user.id, {
        onboarding_completed: true,
        onboarding_step: 5,
      });
      // 3. Refresh contexts
      await refreshProfile();
      await refreshStore();
      
      // Navigate to dedicated success page
      router.push('/onboarding/success');
    } catch (err) {
      console.error('Failed to submit store for review:', err);
      setIsNavigatingToSuccess(false);
      alert('Failed to submit store. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return <PageLoader />;
  }

  // Define step headers and percentage progress
  const stepsList = [
    { num: 1, title: 'Welcome' },
    { num: 2, title: 'Store Details' },
    { num: 3, title: 'Category' },
    { num: 4, title: 'Product' },
    { num: 5, title: 'Launch' },
  ];

  const progressPercentage = currentStep * 20;



  return (
    <div className="onboarding-container">
      <div className="glow-bg"></div>

      <div className="onboarding-w-card">
        {/* Step Stepper Header */}
        <div className="stepper-header">
          <div className="logo-section">
            <span className="logo-icon">🚀</span>
            <h3>LaunchCart</h3>
          </div>
          <span className="step-indicator-text">Step {currentStep} of 5</span>
        </div>

        {/* Stepper Dots & Labels */}
        <div className="stepper-visual">
          <div className="bar-bg">
            <div className="bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="dots-row">
            {stepsList.map((step) => (
              <div
                key={step.num}
                className={`step-dot-wrapper ${currentStep >= step.num ? 'active' : ''} ${
                  currentStep === step.num ? 'current' : ''
                }`}
              >
                <div className="dot">{step.num}</div>
                <span className="dot-label">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Wizard Steps */}

        {/* STEP 1: Welcome Screen */}
        {currentStep === 1 && (
          <div className="wizard-step fade-in">
            <h2>Welcome to LaunchCart!</h2>
            <p className="step-subtitle text-center">
              Let&apos;s build your online business together. In just 5 simple steps, we&apos;ll configure your store details, add categories, create your first product, and publish your storefront.
            </p>
            <div className="illustration-wrapper">
              <svg width="220" height="180" viewBox="0 0 240 200" fill="none">
                <rect x="20" y="40" width="200" height="130" rx="16" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="2" />
                <rect x="35" y="55" width="48" height="48" rx="8" fill="#e0e7ff" />
                <circle cx="59" cy="79" r="12" fill="#818cf8" />
                <rect x="95" y="60" width="110" height="8" rx="4" fill="#cbd5e1" />
                <rect x="95" y="76" width="70" height="8" rx="4" fill="#e2e8f0" />
                <rect x="35" y="120" width="170" height="36" rx="10" fill="#8b5cf6" />
                <rect x="90" y="132" width="60" height="12" rx="4" fill="#ffffff" opacity="0.9" />
              </svg>
            </div>
            <button
              onClick={() => updateOnboardingStep(2)}
              className="action-btn next-btn w-full mt-8"
            >
              Get Started
            </button>
          </div>
        )}

        {/* STEP 2: Store Creation */}
        {currentStep === 2 && (
          <div className="wizard-step fade-in">
            <h2>Add Store Details</h2>
            <p className="step-subtitle">
              Enter your store name and select a clean public URL path. Add a description, logo, and banner.
            </p>
            <form onSubmit={handleSubmitStore} className="onboarding-form">
              <div className="form-group">
                <label htmlFor="storeName">Store Name</label>
                <input
                  type="text"
                  id="storeName"
                  value={storeName}
                  onChange={handleNameChange}
                  placeholder="e.g. Luxe Studio"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">Store URL Path (Slug)</label>
                <input
                  type="text"
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. luxe-studio"
                  required
                />
                <span className="live-preview-url">
                  Live URL Preview: <strong>launchcart.com/store/{slug || '...'}</strong>
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="description">Store Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what your store sells..."
                  rows="3"
                  maxLength={160}
                />
                <span className="help-text" style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Max 160 characters. Current: {description.length}/160</span>
              </div>

              <div className="upload-grid">
                <div className="upload-box-wrapper">
                  <label>Store Logo</label>
                  <div className="upload-zone" onClick={() => document.getElementById('logo-upload').click()}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" />
                    ) : (
                      <div className="upload-placeholder-text logo-guidelines-onboarding">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" style={{ marginBottom: '2px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <strong>Upload Logo</strong>
                        <div className="guidelines-list-mini logo-list-mini">
                          <span>500 × 500 px (Rec.)</span>
                          <span>Ratio 1:1</span>
                          <span>Max Size 2MB</span>
                          <span>JPG, PNG, WEBP</span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                <div className="upload-box-wrapper">
                  <label>Store Banner</label>
                  <div className="upload-zone banner" onClick={() => document.getElementById('banner-upload').click()}>
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner preview" />
                    ) : (
                      <div className="upload-placeholder-text banner-guidelines-onboarding">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" style={{ marginBottom: '2px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <strong>Upload Store Banner</strong>
                        <div className="guidelines-list-mini">
                          <span>1920 × 600 px (Rec.)</span>
                          <span>Ratio 16:5</span>
                          <span>Max Size 5MB</span>
                          <span>JPG, PNG, WEBP</span>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      id="banner-upload"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="action-btn next-btn w-full mt-6" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Store Details...' : 'Save & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Category Setup */}
        {currentStep === 3 && (
          <div className="wizard-step fade-in">
            <h2>Create Your First Category</h2>
            <p className="step-subtitle">
              Group products together into categories to make browsing effortless. This step is optional.
            </p>
            <form onSubmit={handleSubmitCategory} className="onboarding-form">
              <div className="form-group">
                <label htmlFor="categoryName">Category Name</label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Summer Collection"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category Image</label>
                <div
                  className="upload-zone category-zone"
                  onClick={() => document.getElementById('category-upload').click()}
                >
                  {categoryPreview ? (
                    <img src={categoryPreview} alt="Category preview" />
                  ) : (
                    <div className="upload-placeholder-text">
                      <span className="icon">📁</span>
                      <span>Upload Category Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="category-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setCategoryFile(file);
                        setCategoryPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="btn-group-row mt-6">
                <button
                  type="button"
                  onClick={() => updateOnboardingStep(4)}
                  className="action-btn skip-btn"
                  disabled={isSubmitting}
                >
                  Skip Step
                </button>
                <button type="submit" className="action-btn next-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Category...' : 'Create & Continue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 4: First Product */}
        {currentStep === 4 && (
          <div className="wizard-step fade-in">
            <h2>Add Your First Product</h2>
            <p className="step-subtitle">
              Add details for your first product to display in your storefront. This step is optional.
            </p>
            <form onSubmit={handleSubmitProduct} className="onboarding-form">
              <div className="form-group">
                <label htmlFor="productName">Product Name</label>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Classic Cotton Tee"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="productDescription">Description</label>
                <textarea
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe the materials, sizing, or colors..."
                  rows="3"
                />
              </div>

              <div className="double-form-row">
                <div className="form-group">
                  <label htmlFor="productPrice">Price (₹)</label>
                  <input
                    type="number"
                    id="productPrice"
                    value={productPrice}
                    onChange={(e) => setProductPrice(e.target.value)}
                    placeholder="e.g. 999"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="productStock">Available Stock</label>
                  <input
                    type="number"
                    id="productStock"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    placeholder="e.g. 10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div
                  className="upload-zone product-zone"
                  onClick={() => document.getElementById('product-upload').click()}
                >
                  {productPreview ? (
                    <img src={productPreview} alt="Product preview" />
                  ) : (
                    <div className="upload-placeholder-text">
                      <span className="icon">🛍️</span>
                      <span>Upload Product Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="product-upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProductFile(file);
                        setProductPreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className="btn-group-row mt-6">
                <button
                  type="button"
                  onClick={() => updateOnboardingStep(5)}
                  className="action-btn skip-btn"
                  disabled={isSubmitting}
                >
                  Skip Step
                </button>
                <button type="submit" className="action-btn next-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Product...' : 'Create & Continue'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 5: Publish Store */}
        {currentStep === 5 && (
          <div className="wizard-step fade-in">
            <h2>Ready to Launch!</h2>
            <p className="step-subtitle">
              Review your store setup details below. Click "Publish Store" to make your online storefront live.
            </p>

            <div className="summary-card">
              <div className="summary-item">
                <span className="summary-label">Store Name:</span>
                <span className="summary-value">{storeName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Store Slug:</span>
                <span className="summary-value">/store/{slug}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">First Category:</span>
                <span className="summary-value">
                  {categoryName ? `Created: ${categoryName}` : 'Skipped (None)'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">First Product:</span>
                <span className="summary-value">
                  {productName ? `Created: ${productName} (₹${productPrice})` : 'Skipped (None)'}
                </span>
              </div>
            </div>

            <button
              onClick={handlePublishStore}
              className="action-btn next-btn w-full mt-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Launching Storefront...' : 'Publish Store'}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .onboarding-container {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, rgba(99, 102, 241, 0.03) 50%, rgba(255, 255, 255, 0) 70%);
          filter: blur(60px);
          bottom: -200px;
          right: -200px;
          z-index: 1;
        }

        .onboarding-w-card {
          width: 100%;
          max-width: 640px;
          background: #ffffff;
          padding: 40px;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.05);
          z-index: 2;
        }

        .stepper-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          font-size: 20px;
        }

        .logo-section h3 {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }

        .step-indicator-text {
          font-size: 13px;
          font-weight: 700;
          color: #8b5cf6;
          background: #f5f3ff;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .stepper-visual {
          position: relative;
          margin-bottom: 40px;
          padding-top: 10px;
        }

        .bar-bg {
          height: 4px;
          background: #e2e8f0;
          width: 100%;
          position: absolute;
          top: 28px;
          left: 0;
          z-index: 1;
          border-radius: 2px;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 2px;
        }

        .dots-row {
          display: flex;
          justify-content: space-between;
          position: relative;
          z-index: 2;
        }

        .step-dot-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .step-dot-wrapper .dot {
          width: 36px;
          height: 36px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          transition: all 0.3s ease;
        }

        .step-dot-wrapper.active .dot {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: #ffffff;
        }

        .step-dot-wrapper.current .dot {
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
          background: #ffffff;
          border-color: #8b5cf6;
          color: #8b5cf6;
        }

        .dot-label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          transition: color 0.3s ease;
        }

        .step-dot-wrapper.active .dot-label,
        .step-dot-wrapper.current .dot-label {
          color: #475569;
        }

        h2 {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          text-align: center;
        }

        .step-subtitle {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 28px;
          text-align: center;
        }

        .illustration-wrapper {
          display: flex;
          justify-content: center;
          margin: 32px 0;
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          outline: none;
          background: #f8fafc;
          font-size: 14px;
          color: #1e293b;
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #8b5cf6;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.08);
        }

        .live-preview-url {
          font-size: 11px;
          color: #64748b;
          margin-top: 4px;
        }

        .live-preview-url strong {
          color: #8b5cf6;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .upload-box-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .upload-zone {
          height: 110px;
          border: 1.5px dashed #cbd5e1;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          background: #f8fafc;
          transition: all 0.2s;
          padding: 4px;
        }

        .upload-zone:hover {
          border-color: #8b5cf6;
          background: #f5f3ff;
        }

        .upload-zone img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .upload-zone.banner img {
          object-fit: cover;
        }

        .upload-placeholder-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .logo-guidelines-onboarding {
          padding: 8px;
          text-align: center;
          gap: 2px !important;
        }

        .logo-guidelines-onboarding strong {
          font-size: 10px;
          color: #1e293b;
        }

        .logo-list-mini {
          grid-template-columns: repeat(2, 1fr);
          gap: 2px 6px !important;
        }

        .logo-list-mini span {
          font-size: 8px !important;
        }

        .upload-guidelines-above {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
          margin-bottom: 6px;
        }

        .guideline-item {
          font-size: 9px;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 6px;
          border-radius: 4px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .banner-guidelines-onboarding {
          padding: 8px;
          text-align: center;
          gap: 4px !important;
        }

        .banner-guidelines-onboarding strong {
          font-size: 11px;
          color: #1e293b;
        }

        .guidelines-list-mini {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px 10px;
          margin-top: 4px;
        }

        .guidelines-list-mini span {
          font-size: 9px;
          color: #64748b;
          font-weight: 500;
          white-space: nowrap;
        }

        .upload-placeholder-text .icon {
          font-size: 20px;
        }

        .category-zone,
        .product-zone {
          height: 140px;
        }

        .double-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .summary-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 24px;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .summary-label {
          font-weight: 600;
          color: #64748b;
        }

        .summary-value {
          font-weight: 700;
          color: #1e293b;
        }

        .btn-group-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 12px;
        }

        .action-btn {
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .next-btn {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          border: none;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }

        .next-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.25);
        }

        .next-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .skip-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .skip-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .w-full {
          width: 100%;
        }

        @media (max-width: 600px) {
          .upload-grid {
            grid-template-columns: 1fr;
          }
          .double-form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
