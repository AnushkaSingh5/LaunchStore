'use client';

import { useAdmin } from '@/context/AdminContext';
import Table from '@/components/UI/Table';
import Button from '@/components/UI/Button';
import Input from '@/components/UI/Input';
import Modal from '@/components/UI/Modal';
import { useState, useEffect } from 'react';
import { profileService } from '@/services/profileService';

export default function AdminCreators() {
  const { stores = [], loading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState(null);

  // Extended Profile and Document States
  const [extendedProfile, setExtendedProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Derive creators from stores mapping creatorId
  const creators = loading ? [] : stores.map(store => ({
    id: store.id,
    creatorId: store.creatorId || 'mock-creator-uid',
    name: store.ownerName || '',
    email: store.email || '',
    storeName: store.name || '',
    status: store.status || '',
    joinedDate: store.createdDate || '',
    revenue: store.revenue || 0,
    growth: store.growth || 0
  })).filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.storeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch extended details when creator is selected
  useEffect(() => {
    if (selectedCreator) {
      const loadCreatorData = async () => {
        setDocsLoading(true);
        try {
          const profRes = await profileService.getProfile(selectedCreator.creatorId);
          const docsRes = await profileService.getCreatorDocuments(selectedCreator.creatorId);
          if (profRes.success) setExtendedProfile(profRes.profile);
          if (docsRes.success) setDocuments(docsRes.documents);
        } catch (e) {
          console.error('Error fetching creator data:', e);
        } finally {
          setDocsLoading(false);
        }
      };
      loadCreatorData();
    } else {
      setExtendedProfile(null);
      setDocuments([]);
    }
  }, [selectedCreator]);

  const handleVerifyCreator = async () => {
    if (!selectedCreator) return;
    if (!confirm('Are you sure you want to verify this creator? All uploaded documents will be marked as verified.')) return;
    
    setActionLoading(true);
    try {
      const res = await profileService.adminUpdateVerificationStatus(selectedCreator.creatorId, 'Verified');
      if (res.success) {
        alert('Creator marked as Verified successfully!');
        // Refresh details
        const profRes = await profileService.getProfile(selectedCreator.creatorId);
        const docsRes = await profileService.getCreatorDocuments(selectedCreator.creatorId);
        if (profRes.success) setExtendedProfile(profRes.profile);
        if (docsRes.success) setDocuments(docsRes.documents);
      } else {
        alert('Failed to verify creator: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCreator = async () => {
    if (!selectedCreator) return;
    if (!confirm('Are you sure you want to reject this creator\'s verification request?')) return;

    setActionLoading(true);
    try {
      const res = await profileService.adminUpdateVerificationStatus(selectedCreator.creatorId, 'Rejected');
      if (res.success) {
        alert('Creator verification status updated to Rejected.');
        // Refresh details
        const profRes = await profileService.getProfile(selectedCreator.creatorId);
        const docsRes = await profileService.getCreatorDocuments(selectedCreator.creatorId);
        if (profRes.success) setExtendedProfile(profRes.profile);
        if (docsRes.success) setDocuments(docsRes.documents);
      } else {
        alert('Failed to reject verification: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { field: 'name', label: 'Creator Name', render: (row) => <span style={{ fontWeight: 700 }}>{row.name}</span> },
    { field: 'email', label: 'Email' },
    { field: 'storeName', label: 'Primary Store' },
    { field: 'revenue', label: 'Total Revenue', render: (row) => `₹${(row.revenue || 0).toLocaleString()}` },
    { field: 'status', label: 'Status', render: (row) => (
      <span className={`status-badge ${row.status.toLowerCase()}`}>{row.status}</span>
    )},
  ];

  const actions = (row) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="secondary" size="sm" onClick={() => setSelectedCreator(row)}>Details</Button>
    </div>
  );

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'Verified': return '#10b981';
      case 'Under Review': return '#f59e0b';
      case 'Rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="admin-creators">
      <div className="page-header">
        <div className="header-text">
          <h2>Creator Management</h2>
          <p>Monitor profiles, verify credentials, and review verification documents.</p>
        </div>
        <div className="header-actions">
          <Input 
            placeholder="Search creators or stores..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="creators-card">
        <Table columns={columns} data={creators} actions={actions} loading={loading} />
      </div>

      <Modal 
        isOpen={!!selectedCreator} 
        onClose={() => setSelectedCreator(null)}
        title="Creator Verification & Profile details"
        footer={
          <div className="modal-footer-actions">
            {extendedProfile && (extendedProfile.verification_status === 'Under Review' || extendedProfile.verification_status === 'Not Submitted') && (
              <>
                <button className="btn-moderate verify" onClick={handleVerifyCreator} disabled={actionLoading}>Verify Creator</button>
                <button className="btn-moderate reject" onClick={handleRejectCreator} disabled={actionLoading}>Reject Verification</button>
              </>
            )}
            <Button variant="secondary" onClick={() => setSelectedCreator(null)}>Close</Button>
          </div>
        }
      >
        {selectedCreator && (
          <div className="creator-details">
            <div className="profile-main">
              <div className="avatar">
                {extendedProfile?.profile_image ? (
                  <img src={extendedProfile.profile_image} alt={selectedCreator.name} />
                ) : (
                  selectedCreator.name.charAt(0)
                )}
              </div>
              <div className="info">
                <h3>{selectedCreator.name}</h3>
                <p>{selectedCreator.email}</p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`status-badge ${selectedCreator.status.toLowerCase()}`}>Store: {selectedCreator.status}</span>
                  <span className="ver-badge" style={{ background: getVerificationStatusColor(extendedProfile?.verification_status || 'Not Submitted') }}>
                    ID: {extendedProfile?.verification_status || 'Not Submitted'}
                  </span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Basic Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Full Name</strong>
                  <span>{extendedProfile?.full_name || selectedCreator.name || '--'}</span>
                </div>
                <div className="detail-item">
                  <strong>Phone</strong>
                  <span>{extendedProfile?.phone || '--'}</span>
                </div>
                <div className="detail-item">
                  <strong>Date of Birth</strong>
                  <span>{extendedProfile?.date_of_birth || '--'}</span>
                </div>
                <div className="detail-item">
                  <strong>Gender</strong>
                  <span>{extendedProfile?.gender || '--'}</span>
                </div>
                <div className="detail-item full-width">
                  <strong>Bio / About Creator</strong>
                  <p className="bio-text">{extendedProfile?.bio || 'No bio provided.'}</p>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Business Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Business Name</strong>
                  <span>{extendedProfile?.business_name || '--'}</span>
                </div>
                <div className="detail-item">
                  <strong>Business Type</strong>
                  <span>{extendedProfile?.business_type || '--'}</span>
                </div>
                <div className="detail-item full-width">
                  <strong>Address</strong>
                  <span>{extendedProfile?.address || '--'}</span>
                </div>
                <div className="detail-item">
                  <strong>City</strong>
                  <span>{extendedProfile?.city || '--'}</span>
                </div>
                <div className="detail-item">
                  <strong>State / Country</strong>
                  <span>{extendedProfile?.state ? `${extendedProfile.state}, ${extendedProfile.country}` : '--'}</span>
                </div>
              </div>
            </div>

            <div className="details-section">
              <h4>Verification Documents</h4>
              {docsLoading ? (
                <div className="docs-loader">Loading documents...</div>
              ) : documents.length === 0 ? (
                <p className="no-docs-message">No verification documents have been uploaded yet.</p>
              ) : (
                <div className="docs-list">
                  {documents.map((doc, idx) => (
                    <div className="doc-row" key={doc.id || idx}>
                      <div className="doc-info">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <div className="doc-meta">
                          <strong>{doc.document_type}</strong>
                          <span>Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                      <div className="doc-actions">
                        <span className="doc-status-pill" style={{ color: getVerificationStatusColor(doc.status), borderColor: getVerificationStatusColor(doc.status) }}>
                          {doc.status}
                        </span>
                        <a href={doc.document_url} target="_blank" rel="noopener noreferrer" className="btn-view-doc">View</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .admin-creators { display: flex; flex-direction: column; gap: 32px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .header-text h2 { font-size: 24px; font-weight: 800; color: #1e293b; margin: 0; }
        .header-text p { color: #64748b; margin: 4px 0 0 0; }
        .header-actions { width: 300px; }
        
        .creators-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
        }
        .status-badge.active { background: #dcfce7; color: #166534; }
        .status-badge.pending { background: #fef3c7; color: #92400e; }
        .status-badge.disabled { background: #fee2e2; color: #b91c1c; }

        .ver-badge {
          padding: 4px 10px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #fff;
        }

        .creator-details { display: flex; flex-direction: column; gap: 24px; max-height: 70vh; overflow-y: auto; padding-right: 8px; }
        .profile-main { display: flex; align-items: center; gap: 16px; margin-bottom: 8px; }
        .avatar {
          width: 64px; height: 64px; background: #8b5cf6; color: #fff;
          border-radius: 20px; display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-weight: 800; overflow: hidden;
        }
        .avatar img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .info h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
        .info p { font-size: 14px; color: #64748b; margin: 4px 0 8px 0; }
        
        .details-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .details-section h4 {
          font-size: 14px;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
          padding-bottom: 6px;
          border-bottom: 1px dashed #cbd5e1;
        }

        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 20px; padding: 16px; background: #f8fafc; border-radius: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-item strong { font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
        .detail-item span { font-size: 14px; font-weight: 700; color: #334155; }
        .detail-item.full-width { grid-column: span 2; }

        .bio-text {
          font-size: 14px;
          color: #475569;
          margin: 0;
          line-height: 1.5;
        }

        /* Docs Styles */
        .docs-loader, .no-docs-message {
          padding: 16px;
          text-align: center;
          color: #94a3b8;
          font-size: 14px;
        }
        .docs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .doc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 12px;
        }
        .doc-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .doc-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .doc-meta strong {
          font-size: 14px;
          color: #334155;
        }
        .doc-meta span {
          font-size: 11px;
          color: #94a3b8;
        }
        .doc-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .doc-status-pill {
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          background: #fff;
          border: 1px solid;
        }
        .btn-view-doc {
          background: #fff;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-view-doc:hover {
          background: #f1f5f9;
        }

        /* Modal Footer Moderate */
        .modal-footer-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          width: 100%;
        }
        .btn-moderate {
          padding: 8px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .btn-moderate.verify {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
        }
        .btn-moderate.verify:hover {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .btn-moderate.reject {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
        }
        .btn-moderate.reject:hover {
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }
      `}</style>
    </div>
  );
}
