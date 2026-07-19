'use client';

import { useState, useEffect, useRef } from 'react';

export default function ImageCropperModal({
  isOpen,
  imageFile,
  cropType = 'banner', // 'banner' or 'logo'
  storeName,
  logoUrl,
  onClose,
  onConfirm
}) {
  const [imageSrc, setImageSrc] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(640);
  
  // Cropper states
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Load selected image file (can be File object or URL string)
  useEffect(() => {
    if (!imageFile) {
      setImageSrc('');
      return;
    }
    
    if (typeof imageFile === 'string') {
      setImageSrc(imageFile);
    } else {
      const objectUrl = URL.createObjectURL(imageFile);
      setImageSrc(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [imageFile]);

  // Reset cropper parameters when modal is opened or cropType changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, cropType]);

  // Measure container dimensions when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      setViewportWidth(containerRef.current.offsetWidth);
    }
  }, [isOpen, cropType, imageSrc]);

  if (!isOpen || !imageFile || !imageSrc) return null;

  const handleImageLoad = (e) => {
    const img = e.target;
    if (!containerRef.current) return;
    
    const Wv = containerRef.current.offsetWidth;
    const Hv = containerRef.current.offsetHeight;
    const Wi = img.naturalWidth;
    const Hi = img.naturalHeight;
    
    // We want the image to COVER the viewport by default (like object-fit: cover)
    const initScale = Math.max(Wv / Wi, Hv / Hi);
    
    setViewportWidth(Wv);
    setInitialScale(initScale);
    setImageSize({
      width: Wi * initScale,
      height: Hi * initScale,
      naturalWidth: Wi,
      naturalHeight: Hi
    });
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  // Pointer dragging events
  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPrevPosition({ x: position.x, y: position.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosition({
      x: prevPosition.x + dx,
      y: prevPosition.y + dy
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore pointer capture errors
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleRotate90 = (dir) => {
    setRotation(prev => {
      let newRot = prev + (dir === 'right' ? 90 : -90);
      if (newRot >= 360) newRot -= 360;
      if (newRot <= -360) newRot += 360;
      return newRot;
    });
  };

  const handleConfirmCrop = async () => {
    if (!imageSize.naturalWidth) return;
    setIsProcessing(true);
    
    try {
      const croppedBlob = await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // CRITICAL: Avoid CORS issues with stored Supabase URLs
        img.src = imageSrc;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Setup output resolutions
          const Wo = cropType === 'logo' ? 500 : 1920;
          const Ho = cropType === 'logo' ? 500 : 600;
          
          canvas.width = Wo;
          canvas.height = Ho;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not retrieve 2D context for canvas cropping'));
            return;
          }
          
          // Clear and fill canvas
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, Wo, Ho);
          
          // Math translation ratio from viewport coordinates to high-res canvas coordinates
          const scaleRatio = Wo / viewportWidth;
          const canvasScale = initialScale * zoom * scaleRatio;
          
          // Perform translations
          ctx.translate(
            Wo / 2 + position.x * scaleRatio,
            Ho / 2 + position.y * scaleRatio
          );
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(canvasScale, canvasScale);
          
          // Draw image centered on current origin
          ctx.drawImage(
            img, 
            -imageSize.naturalWidth / 2, 
            -imageSize.naturalHeight / 2, 
            imageSize.naturalWidth, 
            imageSize.naturalHeight
          );
          
          const mimeType = (typeof imageFile !== 'string' && imageFile.type) ? imageFile.type : 'image/jpeg';
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Cropping operation returned empty blob'));
            },
            mimeType,
            0.92
          );
        };
        img.onerror = () => {
          reject(new Error('Could not load image asset onto canvas. Possible cross-origin/CORS blocking.'));
        };
      });

      // Construct a new cropped File object
      const originalName = typeof imageFile === 'string' ? `${cropType}.jpg` : (imageFile.name || `${cropType}.jpg`);
      const mimeType = (typeof imageFile !== 'string' && imageFile.type) ? imageFile.type : 'image/jpeg';
      const croppedFile = new File([croppedBlob], originalName, {
        type: mimeType,
        lastModified: Date.now()
      });
      
      onConfirm(croppedFile);
    } catch (err) {
      console.error(err);
      alert('Crop failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Setup scaling for live preview storefront mockup (mockup area is 480px wide)
  const mockupWidth = cropType === 'logo' ? 200 : 480;
  const ratio = mockupWidth / viewportWidth;

  const isLogo = cropType === 'logo';

  return (
    <div className="cropper-overlay" onClick={onClose}>
      <div className="cropper-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cropper-header">
          <div>
            <h3>Crop Store {isLogo ? 'Logo' : 'Banner'}</h3>
            <p className="subheader-text">Reposition, zoom, or rotate your image</p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="cropper-body">
          
          {/* Section 1: Interactive Crop Window */}
          <div className="cropper-viewport-wrapper">
            <div 
              ref={containerRef}
              className={`crop-viewport ${cropType}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                alt="Original source preview"
                onLoad={handleImageLoad}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: imageSize.width ? `${imageSize.width * zoom}px` : 'auto',
                  height: imageSize.height ? `${imageSize.height * zoom}px` : 'auto',
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
              
              {/* Guidelines / Grid lines */}
              <div className={`crop-guideline-overlay ${cropType}`}>
                {!isLogo && (
                  <>
                    <div className="grid-line horizontal-1"></div>
                    <div className="grid-line horizontal-2"></div>
                    <div className="grid-line vertical-1"></div>
                    <div className="grid-line vertical-2"></div>
                  </>
                )}
                <span className="drag-hint-pill">Drag to Reposition</span>
              </div>
            </div>
            <div className="aspect-ratio-badge">
              {isLogo ? 'Aspect Ratio 1:1 (500 × 500 px)' : 'Aspect Ratio 16:5 (1920 × 600 px)'}
            </div>
          </div>

          {/* Section 2: Controls Panel */}
          <div className="controls-panel">
            <div className="control-slider-group">
              <label>
                <span>Zoom</span>
                <span className="value-label">{zoom.toFixed(1)}x</span>
              </label>
              <div className="slider-row">
                <button className="icon-btn" onClick={() => setZoom(z => Math.max(1, z - 0.1))}>−</button>
                <input 
                  type="range"
                  min="1"
                  max="4"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="cropper-slider"
                />
                <button className="icon-btn" onClick={() => setZoom(z => Math.min(4, z + 0.1))}>+</button>
              </div>
            </div>

            <div className="control-slider-group">
              <label>
                <span>Rotate</span>
                <span className="value-label">{rotation}°</span>
              </label>
              <div className="slider-row">
                <button className="icon-btn" onClick={() => handleRotate90('left')}>↺</button>
                <input 
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="cropper-slider"
                />
                <button className="icon-btn" onClick={() => handleRotate90('right')}>↻</button>
              </div>
            </div>

            <button className="reset-btn" onClick={handleReset}>
              Reset Adjustments
            </button>
          </div>

          {/* Section 3: Live Storefront Mockup Preview */}
          <div className="live-preview-section">
            <h4 className="section-title">Live Storefront Preview</h4>
            <p className="section-desc">
              {isLogo 
                ? 'How this logo will look on your header Navbar and Profile avatar card:' 
                : 'How this cover banner will look on your customer storefront page:'}
            </p>
            
            {isLogo ? (
              <div className="logo-preview-container-box">
                {/* 1. Navbar Mockup */}
                <div className="storefront-mockup logo-navbar-mock">
                  <div className="mock-navbar">
                    <div className="mock-logo-col">
                      <div className="mock-logo-container-circle">
                        <img
                          src={imageSrc}
                          alt="Logo in navbar"
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            width: imageSize.width ? `${imageSize.width * zoom * (24 / viewportWidth)}px` : 'auto',
                            height: imageSize.height ? `${imageSize.height * zoom * (24 / viewportWidth)}px` : 'auto',
                            transform: `translate(-50%, -50%) translate(${position.x * (24 / viewportWidth)}px, ${position.y * (24 / viewportWidth)}px) rotate(${rotation}deg)`,
                            maxWidth: 'none',
                            maxHeight: 'none',
                            pointerEvents: 'none'
                          }}
                        />
                      </div>
                      <span className="mock-store-name">{storeName || 'My Store'}</span>
                    </div>
                    <div className="mock-nav-links">
                      <span>Home</span>
                      <span>Catalog</span>
                    </div>
                  </div>
                </div>

                {/* 2. Large Avatar Profile Mockup */}
                <div className="storefront-mockup logo-profile-mock">
                  <div className="profile-banner-stub"></div>
                  <div className="profile-details-stub">
                    <div className="profile-logo-circle-container">
                      <img
                        src={imageSrc}
                        alt="Logo large profile"
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          width: imageSize.width ? `${imageSize.width * zoom * (64 / viewportWidth)}px` : 'auto',
                          height: imageSize.height ? `${imageSize.height * zoom * (64 / viewportWidth)}px` : 'auto',
                          transform: `translate(-50%, -50%) translate(${position.x * (64 / viewportWidth)}px, ${position.y * (64 / viewportWidth)}px) rotate(${rotation}deg)`,
                          maxWidth: 'none',
                          maxHeight: 'none',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                    <div className="profile-text-stub">
                      <div className="stub-store-name">{storeName || 'My Store'}</div>
                      <div className="stub-store-status">Active Storefront</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="storefront-mockup">
                {/* Mock Navbar */}
                <div className="mock-navbar">
                  <div className="mock-logo-col">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Store logo" className="mock-logo" />
                    ) : (
                      <div className="mock-logo-placeholder">
                        {storeName ? storeName.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <span className="mock-store-name">{storeName || 'My Store'}</span>
                  </div>
                  <div className="mock-nav-links">
                    <span>Home</span>
                    <span>Products</span>
                    <span>About</span>
                    <span className="cart-icon">Cart</span>
                  </div>
                </div>
                
                {/* Mock Banner Block */}
                <div className="mock-banner-container">
                  <img
                    src={imageSrc}
                    alt="Mock storefront banner"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: imageSize.width ? `${imageSize.width * zoom * ratio}px` : 'auto',
                      height: imageSize.height ? `${imageSize.height * zoom * ratio}px` : 'auto',
                      transform: `translate(-50%, -50%) translate(${position.x * ratio}px, ${position.y * ratio}px) rotate(${rotation}deg)`,
                      maxWidth: 'none',
                      maxHeight: 'none',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  />
                  <div className="mock-banner-tint"></div>
                  
                  {/* Floating reviews badge replicated from storefront Hero */}
                  <div className="mock-reviews-badge">
                    <div className="mock-avatar-stack">
                      <div className="mock-avatar bg-avatar-1"></div>
                      <div className="mock-avatar bg-avatar-2"></div>
                      <div className="mock-avatar bg-avatar-3"></div>
                    </div>
                    <div className="mock-badge-text">
                      <span className="bold">2K+ Happy Customers</span>
                      <span className="light">rating our products</span>
                    </div>
                    <div className="mock-rating">
                      <span className="star">★</span>
                      <span className="score">4.8</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="cropper-footer">
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="confirm-btn" 
            onClick={handleConfirmCrop} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Save & Confirm'}
          </button>
        </div>

      </div>

      <style jsx>{`
        .cropper-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .cropper-modal {
          background: #ffffff;
          width: 100%;
          max-width: 600px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .cropper-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cropper-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .subheader-text {
          margin: 4px 0 0 0;
          font-size: 13px;
          color: #64748b;
        }

        .close-btn {
          background: #f8fafc;
          border: none;
          color: #64748b;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .cropper-body {
          padding: 20px 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Crop Viewport area */
        .cropper-viewport-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .crop-viewport {
          position: relative;
          overflow: hidden;
          background: #090d16;
          border: 2px dashed #6366f1;
          touch-action: none;
          box-shadow: inset 0 4px 20px rgba(0,0,0,0.6);
        }

        .crop-viewport.banner {
          width: 100%;
          aspect-ratio: 16 / 5;
          border-radius: 12px;
        }

        .crop-viewport.logo {
          width: 240px;
          height: 240px;
          border-radius: 50%; /* circular view */
        }

        .crop-guideline-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .crop-guideline-overlay.logo {
          border-radius: 50%;
          border: 2px solid #6366f1;
        }

        .grid-line {
          position: absolute;
          background: rgba(255, 255, 255, 0.25);
        }

        .horizontal-1 { top: 33.33%; left: 0; right: 0; height: 1px; }
        .horizontal-2 { top: 66.66%; left: 0; right: 0; height: 1px; }
        .vertical-1 { left: 33.33%; top: 0; bottom: 0; width: 1px; }
        .vertical-2 { left: 66.66%; top: 0; bottom: 0; width: 1px; }

        .drag-hint-pill {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.65);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.5px;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          white-space: nowrap;
        }

        .aspect-ratio-badge {
          font-size: 11px;
          color: #6366f1;
          background: #e0e7ff;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* Controls */
        .controls-panel {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border: 1px solid #edf2f7;
        }

        .control-slider-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .control-slider-group label {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }

        .value-label {
          color: #6366f1;
          font-weight: 700;
        }

        .slider-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cropper-slider {
          flex: 1;
          accent-color: #6366f1;
          cursor: pointer;
          height: 6px;
          border-radius: 3px;
          background: #cbd5e1;
        }

        .icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .reset-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          align-self: center;
          padding: 4px;
          margin-top: 4px;
        }

        .reset-btn:hover {
          color: #334155;
        }

        /* Live Preview Mockup */
        .live-preview-section {
          border-top: 1px solid #f1f5f9;
          padding-top: 16px;
        }

        .section-title {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }

        .section-desc {
          margin: 4px 0 12px 0;
          font-size: 11px;
          color: #64748b;
        }

        .logo-preview-container-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .storefront-mockup {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          background: #f8fafc;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .logo-navbar-mock {
          width: 100%;
        }

        .logo-profile-mock {
          width: 100%;
          height: 120px;
          position: relative;
          background: #fff;
        }

        .profile-banner-stub {
          height: 40px;
          background: linear-gradient(90deg, #e2e8f0, #cbd5e1);
        }

        .profile-details-stub {
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .profile-logo-circle-container {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 3px solid #ffffff;
          background: #f1f5f9;
          position: relative;
          overflow: hidden;
          margin-top: -32px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .profile-text-stub {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .stub-store-name {
          font-size: 12px;
          font-weight: 700;
          color: #0f172a;
        }

        .stub-store-status {
          font-size: 10px;
          color: #10b981;
          font-weight: 600;
        }

        .mock-navbar {
          background: #ffffff;
          padding: 8px 16px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mock-logo-col {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mock-logo-container-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #f1f5f9;
          position: relative;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .mock-logo {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          object-fit: cover;
        }

        .mock-logo-placeholder {
          width: 18px;
          height: 18px;
          background: #8b5cf6;
          color: white;
          font-weight: bold;
          border-radius: 50%;
          font-size: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mock-store-name {
          font-size: 10px;
          font-weight: 700;
          color: #0f172a;
        }

        .mock-nav-links {
          display: flex;
          gap: 12px;
          font-size: 9px;
          font-weight: 600;
          color: #64748b;
        }

        .cart-icon {
          color: #0f172a;
        }

        .mock-banner-container {
          width: 100%;
          height: 150px;
          position: relative;
          overflow: hidden;
          background: #f3f4f6;
        }

        .mock-banner-tint {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.05);
          pointer-events: none;
        }

        .mock-reviews-badge {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 20px;
          padding: 4px 10px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.5);
          pointer-events: none;
        }

        .mock-avatar-stack {
          display: flex;
          align-items: center;
        }

        .mock-avatar {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid #FAF8F5;
          margin-right: -4px;
        }

        .mock-avatar:last-child {
          margin-right: 0;
        }

        .bg-avatar-1 {
          background-image: url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=60');
          background-size: cover;
        }

        .bg-avatar-2 {
          background-image: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=60');
          background-size: cover;
        }

        .bg-avatar-3 {
          background-image: url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=60');
          background-size: cover;
        }

        .mock-badge-text {
          display: flex;
          flex-direction: column;
          font-size: 7px;
          line-height: 1.1;
        }

        .mock-badge-text .bold {
          font-weight: 600;
          color: #121212;
        }

        .mock-badge-text .light {
          color: #706f6c;
        }

        .mock-rating {
          display: flex;
          align-items: center;
          gap: 2px;
          border-left: 1px solid rgba(0, 0, 0, 0.08);
          padding-left: 5px;
          font-size: 7px;
        }

        .mock-rating .star {
          color: #f59e0b;
        }

        .mock-rating .score {
          font-weight: 700;
          color: #121212;
        }

        /* Footer Actions */
        .cropper-footer {
          padding: 16px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: #f8fafc;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .confirm-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          color: white;
          font-weight: 600;
          font-size: 13px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .confirm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .confirm-btn:disabled, .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
