'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { payoutService } from '@/services/payoutService';
import Table from '@/components/UI/Table';
import Modal from '@/components/UI/Modal';
import PageLoader from '@/components/PageLoader';
import { useRouter } from 'next/navigation';

export default function AdminPayouts() {
  const { adminUser, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  
  const [payouts, setPayouts] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('All');
  
  // Modals state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [completingId, setCompletingId] = useState(null);
  const [txnNotes, setTxnNotes] = useState('');
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/admin/login');
    }
  }, [adminUser, authLoading, router]);

  const loadAdminPayoutData = async () => {
    setLoading(true);
    try {
      const [payoutRequests, allEarnings] = await Promise.all([
        payoutService.adminGetPayoutRequests(),
        payoutService.adminGetAllEarnings()
      ]);
      setPayouts(payoutRequests);
      setEarnings(allEarnings);
    } catch (e) {
      console.error('Error fetching admin payout data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadAdminPayoutData();
    }
  }, [adminUser]);

  if (authLoading || (loading && payouts.length === 0)) {
    return <PageLoader />;
  }

  if (!adminUser) return null;

  // Moderation Actions
  const handleApprove = async (id) => {
    if (confirm('Are you sure you want to approve this payout request?')) {
      setActioning(true);
      try {
        const res = await payoutService.adminUpdatePayoutStatus(id, 'approved', 'Payout approved, pending settlement');
        if (res.success) {
          alert('Payout request approved.');
          await loadAdminPayoutData();
        } else {
          alert('Failed to approve request: ' + res.error);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setActioning(false);
      }
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setActioning(true);
    try {
      const res = await payoutService.adminUpdatePayoutStatus(rejectingId, 'rejected', rejectReason.trim());
      if (res.success) {
        alert('Payout request rejected.');
        setRejectingId(null);
        setRejectReason('');
        await loadAdminPayoutData();
      } else {
        alert('Failed to reject request: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!txnNotes.trim()) {
      alert('Please provide transaction reference details.');
      return;
    }

    setActioning(true);
    try {
      const res = await payoutService.adminUpdatePayoutStatus(completingId, 'completed', txnNotes.trim());
      if (res.success) {
        alert('Payout marked as completed and settled.');
        setCompletingId(null);
        setTxnNotes('');
        await loadAdminPayoutData();
      } else {
        alert('Failed to complete payout: ' + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActioning(false);
    }
  };

  // Metrics calculations
  const totalCreatorEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);
  const totalPaidOut = payouts.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
  const pendingRequestsCount = payouts.filter(r => r.status === 'pending').length;
  
  // Available balance platform-wide
  const totalAvailableBalance = earnings.filter(e => e.status === 'available').reduce((sum, e) => sum + parseFloat(e.creator_amount || 0), 0);

  // Tab Filtering & Search
  const filteredByTab = currentTab === 'All' ? payouts : payouts.filter(r => r.status === currentTab.toLowerCase());
  
  const filteredPayouts = filteredByTab.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.creatorName.toLowerCase().includes(query) ||
      r.creatorEmail.toLowerCase().includes(query) ||
      r.id.toLowerCase().includes(query)
    );
  });

  const getAvatarColor = (name) => {
    const colors = [
      { bg: '#f3e8ff', text: '#8b5cf6' }, // purple
      { bg: '#dcfce7', text: '#166534' }, // green
      { bg: '#fee2e2', text: '#ef4444' }, // red
      { bg: '#fffbeb', text: '#b45309' }, // orange
      { bg: '#e0f2fe', text: '#0369a1' }  // blue
    ];
    let sum = 0;
    const cleanName = name || '';
    for (let i = 0; i < cleanName.length; i++) {
      sum += cleanName.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const columns = [
    { field: 'id', label: 'PAYOUT ID', render: (row) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{row.id.substring(0, 8)}...</span> },
    { 
      field: 'creatorName', 
      label: 'CREATOR', 
      render: (row) => (
        <div className="creator-cell">
          <strong>{row.creatorName}</strong>
          <span className="creator-email">{row.creatorEmail}</span>
        </div>
      ) 
    },
    { field: 'amount', label: 'AMOUNT', render: (row) => <span className="font-bold">₹{row.amount.toLocaleString()}</span> },
    { field: 'method', label: 'METHOD' },
    { field: 'accountDetails', label: 'ACCOUNT DETAILS', render: (row) => <span className="details-text" title={row.accountDetails}>{row.accountDetails}</span> },
    { field: 'requestedAt', label: 'REQUESTED ON', render: (row) => <span className="date-text">{row.requestedAt}</span> },
    { 
      field: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-pill ${row.status.toLowerCase()}`}>
          <span className={`status-dot ${row.status.toLowerCase()}`}></span>
          {row.status}
        </span>
      ) 
    },
    { field: 'adminNotes', label: 'REMARKS/NOTES', render: (row) => <span className="notes-text" style={{ color: row.status === 'rejected' ? '#ef4444' : '#64748b' }}>{row.adminNotes || '--'}</span> }
  ];

  const actions = (row) => (
    <div className="action-buttons">
      {row.status === 'pending' && (
        <>
          <button className="btn-action btn-approve" onClick={() => handleApprove(row.id)} disabled={actioning}>Approve</button>
          <button className="btn-action btn-reject" onClick={() => setRejectingId(row.id)} disabled={actioning}>Reject</button>
        </>
      )}
      {row.status === 'approved' && (
        <>
          <button className="btn-action btn-complete" onClick={() => setCompletingId(row.id)} disabled={actioning}>Settle</button>
          <button className="btn-action btn-reject" onClick={() => setRejectingId(row.id)} disabled={actioning}>Reject</button>
        </>
      )}
    </div>
  );

  return (
    <div className="admin-payouts-page">
      <div className="page-header">
        <div className="header-text">
          <h2>Financial Payout Requests</h2>
          <p>Review creator withdrawal applications, approve funding reserves, and log bank clearances.</p>
        </div>
        <div className="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text"
            placeholder="Search creator name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="icon-wrap purple-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Platform Creator Revenue</p>
            <h3 className="card-val">₹{totalCreatorEarnings.toLocaleString()}</h3>
            <p className="card-subtext gray-subtext">Cumulative sales payout ledger</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrap green-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Total Settled (Paid Out)</p>
            <h3 className="card-val">₹{totalPaidOut.toLocaleString()}</h3>
            <p className="card-subtext green-subtext">Withdrawals marked completed</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrap orange-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Pending Payout Requests</p>
            <h3 className="card-val">{pendingRequestsCount}</h3>
            <p className="card-subtext orange-subtext">Withdrawals awaiting review</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrap available-bg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l2 2 4-4"></path></svg>
          </div>
          <div className="card-data">
            <p className="card-label">Outstanding Available Balance</p>
            <h3 className="card-val">₹{totalAvailableBalance.toLocaleString()}</h3>
            <p className="card-subtext gray-subtext">Funds eligible for payout</p>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="filter-tabs">
          {['All', 'Pending', 'Approved', 'Rejected', 'Completed'].map(tab => {
            let countVal = 0;
            if (tab === 'All') countVal = payouts.length;
            else if (tab === 'Pending') countVal = pendingRequestsCount;
            else if (tab === 'Approved') countVal = payouts.filter(r => r.status === 'approved').length;
            else if (tab === 'Rejected') countVal = payouts.filter(r => r.status === 'rejected').length;
            else if (tab === 'Completed') countVal = payouts.filter(r => r.status === 'completed').length;

            return (
              <button
                key={tab}
                className={`tab-btn ${currentTab === tab ? 'active' : ''}`}
                onClick={() => setCurrentTab(tab)}
              >
                <span>{tab}</span>
                <span className="tab-count">{countVal}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop view: Table */}
        <div className="desktop-view-only">
          <Table columns={columns} data={filteredPayouts} actions={actions} loading={loading} />
        </div>

        {/* Mobile view: Payout Cards */}
        <div className="mobile-view-only mobile-list">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading payouts...</div>
          ) : filteredPayouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '16px' }}>No payout requests found.</div>
          ) : (
            filteredPayouts.map(payout => {
              const avatarStyles = getAvatarColor(payout.creatorName);
              const statusClass = payout.status.toLowerCase();
              return (
                <div key={payout.id} className="mobile-payout-card">
                  {/* Header Row: Request ID & Status Badge */}
                  <div className="mobile-payout-header-row">
                    <span className="mobile-payout-id">#{payout.id.substring(0, 8)}...</span>
                    <span className={`status-pill ${statusClass}`}>
                      <span className={`status-dot ${statusClass}`}></span>
                      {payout.status}
                    </span>
                  </div>

                  {/* Creator Profile Info */}
                  <div className="mobile-payout-profile-row">
                    <div className="profile-avatar" style={{ background: avatarStyles.bg, color: avatarStyles.text }}>
                      {getInitials(payout.creatorName)}
                    </div>
                    <div className="profile-info">
                      <span className="profile-name">{payout.creatorName}</span>
                      <span className="profile-email">{payout.creatorEmail}</span>
                    </div>
                    <div className="requested-date">
                      <span className="date-label">Requested on</span>
                      <span className="date-val">{payout.requestedAt}</span>
                    </div>
                  </div>

                  {/* Metadata details grid (wrapped/flex) */}
                  <div className="mobile-payout-meta-row">
                    <div className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                      <div className="meta-info">
                        <span className="meta-label">AMOUNT</span>
                        <span className="meta-val highlight">₹{payout.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="meta-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                      <div className="meta-info">
                        <span className="meta-label">METHOD</span>
                        <span className="meta-val">{payout.method}</span>
                      </div>
                    </div>

                    <div className="meta-item full-width-meta">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 12l2 2 4-4"></path></svg>
                      <div className="meta-info">
                        <span className="meta-label">ACCOUNT DETAILS</span>
                        <span className="meta-val account-text">{payout.accountDetails}</span>
                      </div>
                    </div>
                  </div>

                  {/* Remarks Row */}
                  <div className="mobile-payout-remarks">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <div className="remarks-info">
                      <span className="remarks-label">REMARKS/NOTES</span>
                      <span className="remarks-val" style={{ color: payout.status === 'rejected' ? '#ef4444' : '#475569' }}>
                        {payout.adminNotes || '--'}
                      </span>
                    </div>
                  </div>

                  {/* Approve/Reject Action Buttons */}
                  {payout.status === 'pending' && (
                    <div className="mobile-payout-actions-row">
                      <button className="btn-action btn-approve" onClick={() => handleApprove(payout.id)} disabled={actioning}>Approve</button>
                      <button className="btn-action btn-reject" onClick={() => setRejectingId(payout.id)} disabled={actioning}>Reject</button>
                    </div>
                  )}
                  {payout.status === 'approved' && (
                    <div className="mobile-payout-actions-row">
                      <button className="btn-action btn-complete" onClick={() => setCompletingId(payout.id)} disabled={actioning}>Settle</button>
                      <button className="btn-action btn-reject" onClick={() => setRejectingId(payout.id)} disabled={actioning}>Reject</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingId}
        onClose={() => {
          setRejectingId(null);
          setRejectReason('');
        }}
        title="Reject Payout Request"
      >
        <form onSubmit={handleReject} className="reason-modal-content">
          <p className="reason-modal-desc text-danger">
            Specify the reason why this payout request is being rejected. The creator will view this feedback in their dashboard.
          </p>
          <div className="reason-form-group">
            <label htmlFor="reject-notes">Rejection Reason Notes</label>
            <textarea
              id="reject-notes"
              placeholder="e.g. Account details invalid. Recipient name mismatch in bank records..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="reason-modal-actions">
            <button 
              type="button"
              className="btn-action btn-details" 
              onClick={() => {
                setRejectingId(null);
                setRejectReason('');
              }}
              disabled={actioning}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-action btn-reject" 
              disabled={actioning}
            >
              {actioning ? 'Processing...' : 'Reject Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete/Settle Modal */}
      <Modal
        isOpen={!!completingId}
        onClose={() => {
          setCompletingId(null);
          setTxnNotes('');
        }}
        title="Complete & Settle Payout"
      >
        <form onSubmit={handleComplete} className="reason-modal-content">
          <p className="reason-modal-desc">
            Provide the reference details for the bank clearance or UPI transfer to mark this payout completed.
          </p>
          <div className="reason-form-group">
            <label htmlFor="settle-notes">Transaction Settle Details</label>
            <textarea
              id="settle-notes"
              placeholder="e.g. UPI Ref: 610934857201, Bank IMPS Txn: HDFCR52026061599"
              value={txnNotes}
              onChange={(e) => setTxnNotes(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="reason-modal-actions">
            <button 
              type="button"
              className="btn-action btn-details" 
              onClick={() => {
                setCompletingId(null);
                setTxnNotes('');
              }}
              disabled={actioning}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn-action btn-complete-submit" 
              disabled={actioning}
            >
              {actioning ? 'Settling...' : 'Complete Settlement'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        .admin-payouts-page {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-text h2 {
          font-size: 24px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px 0;
        }
        .header-text p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 10px 16px;
          width: 320px;
          gap: 12px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
          transition: border-color 0.2s;
        }
        .search-box:focus-within {
          border-color: #cbd5e1;
        }
        .search-box input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          font-family: inherit;
        }

        /* Summary Cards */
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .summary-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }
        .icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .purple-bg { background: #f3e8ff; }
        .green-bg { background: #dcfce7; }
        .orange-bg { background: #fef3c7; }
        .available-bg { background: #e0f7fa; }

        .card-data {
          display: flex;
          flex-direction: column;
        }
        .card-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin: 0 0 4px 0;
        }
        .card-val {
          font-size: 26px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px 0;
          line-height: 1;
        }
        .card-subtext {
          font-size: 12px;
          font-weight: 500;
          margin: 0;
        }
        .gray-subtext { color: #94a3b8; }
        .green-subtext { color: #10b981; font-weight: 700; }
        .orange-subtext { color: #f59e0b; font-weight: 600; }

        /* Table Container */
        .table-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px 24px 12px 24px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.02), 0 8px 10px -6px rgba(0,0,0,0.02);
          border: 1px solid #f8fafc;
        }

        /* Filter Tabs */
        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .tab-btn.active {
          background: #f1f5f9;
          color: #1e293b;
          border-color: #e2e8f0;
        }
        .tab-count {
          font-size: 11px;
          font-weight: 700;
          background: #e2e8f0;
          color: #475569;
          padding: 2px 6px;
          border-radius: 20px;
        }
        .tab-btn.active .tab-count {
          background: #8b5cf6;
          color: #fff;
        }

        /* Table custom cells */
        .creator-cell {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }
        .creator-cell strong {
          color: #1e293b;
          font-size: 14px;
        }
        .creator-email {
          font-size: 12px;
          color: #64748b;
        }

        .details-text {
          max-width: 180px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          color: #475569;
          font-weight: 500;
        }

        .date-text, .notes-text {
          font-size: 13px;
          color: #475569;
        }

        /* Status Pills */
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        
        .status-pill.pending { background: #fffbeb; color: #d97706; }
        .status-dot.pending { background: #d97706; }
        
        .status-pill.approved { background: #eff6ff; color: #2563eb; }
        .status-dot.approved { background: #2563eb; }
        
        .status-pill.rejected { background: #fef2f2; color: #dc2626; }
        .status-dot.rejected { background: #dc2626; }

        .status-pill.completed { background: #ecfdf5; color: #059669; }
        .status-dot.completed { background: #059669; }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .btn-action {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-details {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #475569;
        }
        .btn-details:hover { background: #f8fafc; }

        .btn-approve {
          background: #eff6ff;
          border: 1px solid transparent;
          color: #2563eb;
        }
        .btn-approve:hover { background: #dbeafe; }

        .btn-reject {
          background: #fef2f2;
          border: 1px solid transparent;
          color: #dc2626;
        }
        .btn-reject:hover { background: #fee2e2; }

        .btn-complete {
          background: #ecfdf5;
          border: 1px solid transparent;
          color: #059669;
        }
        .btn-complete:hover { background: #d1fae5; }

        /* Modals Forms */
        .reason-modal-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .reason-modal-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin: 0;
        }
        .reason-modal-desc.text-danger {
          color: #ef4444;
          font-weight: 500;
        }
        .reason-form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .reason-form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .reason-form-group textarea {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-family: inherit;
          resize: none;
          outline: none;
          transition: all 0.2s;
        }
        .reason-form-group textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
        }
        .reason-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .btn-complete-submit {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }
        .btn-complete-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        /* Desktop / Mobile view toggles */
        .desktop-view-only {
          display: block;
        }
        .mobile-view-only {
          display: none;
        }

        @media (max-width: 768px) {
          .desktop-view-only {
            display: none !important;
          }
          .mobile-view-only {
            display: block !important;
          }
          .admin-payouts-page {
            gap: 16px !important;
          }
          .page-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
            margin-bottom: 0 !important;
          }
          .search-box {
            width: 100% !important;
          }

          .summary-cards {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .summary-card {
            padding: 16px !important;
            border-radius: 16px !important;
            gap: 10px !important;
          }
          .icon-wrap {
            width: 36px !important;
            height: 36px !important;
          }
          .icon-wrap svg {
            width: 18px !important;
            height: 18px !important;
          }
          .card-val {
            font-size: 20px !important;
          }
          .card-label {
            font-size: 11px !important;
          }
          .card-subtext {
            font-size: 10px !important;
          }
          
          .table-card {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          .filter-tabs {
            margin-bottom: 16px !important;
            padding-bottom: 8px !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
          }
          .tab-btn {
            padding: 6px 12px !important;
            font-size: 13px !important;
          }
        }

        /* Mobile Payout Card CSS */
        .mobile-payout-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.01);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .mobile-payout-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f8fafc;
          padding-bottom: 8px;
        }
        .mobile-payout-id {
          font-family: monospace;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
        }
        
        .mobile-payout-profile-row {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
        }
        .mobile-payout-profile-row .profile-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .mobile-payout-profile-row .profile-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;
        }
        .profile-name {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }
        .profile-email {
          font-size: 12px;
          color: #64748b;
          word-break: break-all;
        }
        .requested-date {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          font-size: 11px;
          flex-shrink: 0;
        }
        .date-label {
          color: #94a3b8;
          font-weight: 600;
        }
        .date-val {
          color: #475569;
          font-weight: 700;
        }

        .mobile-payout-meta-row {
          display: flex;
          flex-wrap: wrap;
          column-gap: 16px;
          row-gap: 10px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 12px;
        }
        .meta-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          flex: 1;
          min-width: 120px;
        }
        .meta-item.full-width-meta {
          flex: 1 1 100%;
          border-top: 1px solid #f1f5f9;
          padding-top: 8px;
          margin-top: 4px;
        }
        .meta-item svg {
          margin-top: 2px;
          flex-shrink: 0;
        }
        .meta-info {
          display: flex;
          flex-direction: column;
        }
        .meta-label {
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.3px;
        }
        .meta-val {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }
        .meta-val.highlight {
          color: #1e293b;
          font-size: 13px;
        }
        .account-text {
          word-break: break-all;
        }

        .mobile-payout-remarks {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 0 4px;
        }
        .mobile-payout-remarks svg {
          margin-top: 2px;
          flex-shrink: 0;
        }
        .remarks-info {
          display: flex;
          flex-direction: column;
        }
        .remarks-label {
          font-size: 9px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.3px;
        }
        .remarks-val {
          font-size: 12px;
          font-weight: 600;
        }

        .mobile-payout-actions-row {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .mobile-payout-actions-row button {
          flex: 1;
          padding: 8px 16px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
        }
      `}</style>
    </div>
  );
}
