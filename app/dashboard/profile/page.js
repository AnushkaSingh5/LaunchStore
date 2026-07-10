'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileService } from '@/services/profileService';

export default function CreatorProfile() {
  const { user, profile, setProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');

  // Extended Profile fields state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Business Details state
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Individual');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('Not Submitted');

  // Documents state
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const res = await profileService.getProfile(user.id);
      const docRes = await profileService.getCreatorDocuments(user.id);
      
      if (res.success && res.profile) {
        const p = res.profile;
        setFullName(p.full_name || '');
        setPhone(p.phone || '');
        setDob(p.date_of_birth || '');
        setGender(p.gender || 'Male');
        setBio(p.bio || '');
        setProfileImage(p.profile_image || '');
        setBusinessName(p.business_name || '');
        setBusinessType(p.business_type || 'Individual');
        setAddress(p.address || '');
        setCity(p.city || '');
        setState(p.state || '');
        setCountry(p.country || 'India');
        setPostalCode(p.postal_code || '');
        setVerificationStatus(p.verification_status || 'Not Submitted');
      }
      if (docRes.success) {
        setDocuments(docRes.documents || []);
      }
    } catch (e) {
      console.error('Error loading creator profile data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    
    const profileData = {
      full_name: fullName,
      phone,
      date_of_birth: dob || null,
      gender,
      bio,
      business_name: businessName,
      business_type: businessType,
      address,
      city,
      state,
      country,
      postal_code: postalCode
    };

    try {
      const res = await profileService.updateProfile(user.id, profileData);
      if (res.success) {
        alert('Profile updated successfully!');
        if (setProfile) setProfile(res.profile); // Sync auth state
      } else {
        alert('Failed to update profile: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    // File validation
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Image file size must be less than 2MB.');
      return;
    }

    setSaving(true);
    try {
      const res = await profileService.uploadProfilePhoto(file, user.id);
      if (res.success) {
        setProfileImage(res.publicUrl);
        // Sync context
        if (setProfile) {
          setProfile(prev => ({ ...prev, profile_image: res.publicUrl }));
        }
        alert('Profile photo uploaded successfully!');
      } else {
        alert('Failed to upload photo: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploadingDoc(docType);
    try {
      const res = await profileService.uploadVerificationDocument(file, docType, user.id);
      if (res.success) {
        alert(`${docType} uploaded successfully! Status changed to Under Review.`);
        // Reload docs & profile verification status
        await loadProfileData();
      } else {
        alert('Failed to upload document: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc('');
    }
  };

  const getDocByTypeName = (docType) => {
    return documents.find(d => d.document_type === docType);
  };

  const getVerificationBadgeColor = () => {
    switch (verificationStatus) {
      case 'Verified': return '#dcfce7';
      case 'Under Review': return '#fef3c7';
      case 'Rejected': return '#fee2e2';
      default: return '#cbd5e1';
    }
  };

  const getVerificationTextColor = () => {
    switch (verificationStatus) {
      case 'Verified': return '#166534';
      case 'Under Review': return '#92400e';
      case 'Rejected': return '#991b1b';
      default: return '#475569';
    }
  };

  if (loading) {
    return <div className="loading-state">Loading profile details...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="header-info">
          <h2>Creator Profile Settings</h2>
          <p>Update your personal bio, business info, and verification documents.</p>
        </div>
        <div 
          className="verification-banner" 
          style={{ background: getVerificationBadgeColor(), color: getVerificationTextColor() }}
        >
          <span className="status-dot" style={{ background: getVerificationTextColor() }}></span>
          <strong>Verification: {verificationStatus}</strong>
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left Side: Avatar & Basic Information Form */}
        <div className="form-card main-form">
          <form onSubmit={handleProfileSubmit}>
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {profileImage ? (
                  <img src={profileImage} alt="Profile Avatar" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar-fallback">{fullName ? fullName.charAt(0) : 'C'}</div>
                )}
                <label className="btn-upload-photo" htmlFor="photo-input">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  <input type="file" id="photo-input" onChange={handlePhotoUpload} accept="image/*" style={{ display: 'none' }} />
                </label>
              </div>
              <div className="avatar-text">
                <h3>{fullName || 'Your Name'}</h3>
                <p>{user?.email}</p>
              </div>
            </div>

            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address (Read-only)</label>
                <input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Mobile Number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9999999999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <div className="select-wrapper">
                  <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="bio">Bio / About Creator</label>
                <textarea
                  id="bio"
                  rows={4}
                  placeholder="Tell customers about your designs, brand, or store journey..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn-save-profile" disabled={saving}>
                {saving ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Business & Verification Documents */}
        <div className="right-panel">
          <div className="form-card business-card">
            <h3 className="section-title">Business Profile</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="e.g. Anushka Singh Designs"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessType">Business Type</label>
                <div className="select-wrapper">
                  <select id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                    <option value="Individual">Individual/Proprietor</option>
                    <option value="Partnership">Partnership Company</option>
                    <option value="LLP">Limited Liability Partnership</option>
                    <option value="Private Limited">Private Limited Company</option>
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Registered Business Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Office/House No, Building, Street Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  type="text"
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  id="state"
                  type="text"
                  placeholder="e.g. Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  type="text"
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="postalCode">Postal PIN Code</label>
                <input
                  id="postalCode"
                  type="text"
                  placeholder="e.g. 110001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Documents Upload Grid */}
          <div className="form-card doc-card">
            <h3 className="section-title">KYC Document Verification</h3>
            <p className="doc-section-desc">Submit valid identity and address documents to verify your store payouts eligibility.</p>
            
            <div className="doc-upload-grid">
              {/* Document 1: Government ID Proof */}
              {(() => {
                const doc = getDocByTypeName('Government ID Proof');
                return (
                  <div className="doc-upload-box">
                    <div className="doc-box-header">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><path d="M14 17c0-2-3-2-3-2s-3 0-3 2"></path></svg>
                      <div className="doc-header-meta">
                        <h4>Government ID Proof</h4>
                        <span className="doc-requirements">Aadhaar Card, Passport, or PAN Card</span>
                      </div>
                    </div>
                    
                    <div className="doc-box-footer">
                      {doc ? (
                        <div className="uploaded-indicator">
                          <span className={`badge-status status-${doc.status.toLowerCase().replace(/\s+/g, '')}`}>{doc.status}</span>
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="btn-view-doc">View File</a>
                        </div>
                      ) : (
                        <label className="btn-upload-file">
                          {uploadingDoc === 'Government ID Proof' ? 'Uploading...' : 'Upload ID Proof'}
                          <input type="file" onChange={(e) => handleDocumentUpload(e, 'Government ID Proof')} style={{ display: 'none' }} disabled={!!uploadingDoc} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Document 2: Address Proof */}
              {(() => {
                const doc = getDocByTypeName('Address Proof');
                return (
                  <div className="doc-upload-box">
                    <div className="doc-box-header">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <div className="doc-header-meta">
                        <h4>Address Proof</h4>
                        <span className="doc-requirements">Utility Bill, Rent Agreement, or Bank Statement</span>
                      </div>
                    </div>
                    
                    <div className="doc-box-footer">
                      {doc ? (
                        <div className="uploaded-indicator">
                          <span className={`badge-status status-${doc.status.toLowerCase().replace(/\s+/g, '')}`}>{doc.status}</span>
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="btn-view-doc">View File</a>
                        </div>
                      ) : (
                        <label className="btn-upload-file">
                          {uploadingDoc === 'Address Proof' ? 'Uploading...' : 'Upload Address Proof'}
                          <input type="file" onChange={(e) => handleDocumentUpload(e, 'Address Proof')} style={{ display: 'none' }} disabled={!!uploadingDoc} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Document 3: Business Registration Document */}
              {(() => {
                const doc = getDocByTypeName('Business Registration Document');
                return (
                  <div className="doc-upload-box">
                    <div className="doc-box-header">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                      <div className="doc-header-meta">
                        <h4>Business Certificate (Optional)</h4>
                        <span className="doc-requirements">GST Registration, Udyam MSME, or shop license</span>
                      </div>
                    </div>
                    
                    <div className="doc-box-footer">
                      {doc ? (
                        <div className="uploaded-indicator">
                          <span className={`badge-status status-${doc.status.toLowerCase().replace(/\s+/g, '')}`}>{doc.status}</span>
                          <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="btn-view-doc">View File</a>
                        </div>
                      ) : (
                        <label className="btn-upload-file">
                          {uploadingDoc === 'Business Registration Document' ? 'Uploading...' : 'Upload Business Document'}
                          <input type="file" onChange={(e) => handleDocumentUpload(e, 'Business Registration Document')} style={{ display: 'none' }} disabled={!!uploadingDoc} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .profile-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
          padding: 24px;
          box-sizing: border-box;
        }

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info h2 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px 0;
        }

        .header-info p {
          color: #64748b;
          font-size: 15px;
          margin: 0;
        }

        .verification-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }

        .profile-content-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .form-card {
          background: #fff;
          border-radius: 24px;
          padding: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03);
        }

        .avatar-section {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .avatar-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          position: relative;
        }

        .profile-avatar {
          width: 100%;
          height: 100%;
          border-radius: 24px;
          object-fit: cover;
          border: 2px solid #8b5cf6;
        }

        .profile-avatar-fallback {
          width: 100%;
          height: 100%;
          border-radius: 24px;
          background: #8b5cf6;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: 800;
        }

        .btn-upload-photo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #8b5cf6;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: -4px;
          right: -4px;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .btn-upload-photo:hover {
          transform: scale(1.1);
        }

        .avatar-text h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
        }

        .avatar-text p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .section-title {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 20px 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #475569;
        }

        .form-group input, .form-group textarea, .select-wrapper select {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
          color: #334155;
        }

        .form-group input:focus, .form-group textarea:focus, .select-wrapper select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }

        .form-group input.disabled-input {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .select-wrapper select {
          width: 100%;
          appearance: none;
          padding-right: 40px;
        }

        .select-wrapper::after {
          content: '▼';
          font-size: 10px;
          color: #94a3b8;
          position: absolute;
          right: 16px;
          pointer-events: none;
        }

        .form-submit-row {
          margin-top: 28px;
          display: flex;
          justify-content: flex-end;
        }

        .btn-save-profile {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
          border: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
          transition: all 0.2s;
        }
        .btn-save-profile:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
        }
        .btn-save-profile:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .right-panel {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* KYC Documents styling */
        .doc-section-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .doc-upload-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .doc-upload-box {
          border: 1px solid #f1f5f9;
          background: #f8fafc;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .doc-box-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .doc-header-meta h4 {
          font-size: 14px;
          font-weight: 800;
          color: #334155;
          margin: 0 0 4px 0;
        }

        .doc-requirements {
          font-size: 11px;
          color: #94a3b8;
          display: block;
          font-weight: 500;
        }

        .doc-box-footer {
          display: flex;
          justify-content: flex-end;
          border-top: 1px dashed #e2e8f0;
          padding-top: 14px;
        }

        .btn-upload-file {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #475569;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
        }
        .btn-upload-file:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        .uploaded-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          justify-content: space-between;
        }

        .badge-status {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: capitalize;
        }
        .badge-status.status-verified { background: #dcfce7; color: #166534; }
        .badge-status.status-underreview { background: #fef3c7; color: #92400e; }
        .badge-status.status-rejected { background: #fee2e2; color: #991b1b; }

        .btn-view-doc {
          font-size: 12px;
          font-weight: 700;
          color: #6366f1;
          text-decoration: none;
        }
        .btn-view-doc:hover {
          text-decoration: underline;
        }

        .loading-state {
          padding: 100px;
          text-align: center;
          color: #94a3b8;
          font-size: 16px;
        }

        @media (max-width: 1280px) {
          .profile-content-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
