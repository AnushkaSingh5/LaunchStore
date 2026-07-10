'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { payoutService } from '@/services/payoutService';
import Table from '@/components/UI/Table';
import Modal from '@/components/UI/Modal';

export default function EarningsPage() {
  const { store } = useAuth();
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    availableEarnings: 0,
    lifetimeOrders: 0
  });
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadEarningsData = async () => {
    if (!store) return;
    setLoading(true);
    try {
      const [sumRes, earnList, payRequests] = await Promise.all([
        payoutService.getCreatorEarningsSummary(store.creator_id, store.id),
        payoutService.getCreatorEarningsList(store.creator_id, store.id),
        payoutService.getPayoutRequests(store.creator_id)
      ]);
      setSummary(sumRes);
      setEarnings(earnList);
      setPayouts(payRequests);
    } catch (e) {
      console.error('Error loading creator earnings data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store) {
      loadEarningsData();
    }
  }, [store]);

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!store) return;
    
    const amt = parseFloat(payoutAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }
    
    if (amt < 500) {
      alert('Minimum payout amount is ₹500.');
      return;
    }

    if (amt > summary.availableEarnings) {
      alert('Payout amount cannot exceed available earnings.');
      return;
    }

    if (!accountDetails.trim()) {
      alert('Please provide your account details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await payoutService.createPayoutRequest(
        store.creator_id,
        amt,
        payoutMethod,
        accountDetails.trim()
      );

      if (res.success) {
        alert('Payout request submitted successfully!');
        setRequestModalOpen(false);
        setPayoutAmount('');
        setAccountDetails('');
        await loadEarningsData();
      } else {
        alert('Failed to submit payout request: ' + res.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const earningColumns = [
    { field: 'orderId', label: 'ORDER ID', render: (row) => <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{row.orderId}</span> },
    { field: 'date', label: 'DATE', render: (row) => <span className="text-secondary">{row.date}</span> },
    { field: 'orderAmount', label: 'ORDER AMOUNT', render: (row) => <span>₹{parseFloat(row.orderAmount).toLocaleString()}</span> },
    { field: 'creatorAmount', label: 'CREATOR AMOUNT', render: (row) => <span className="text-green font-bold">₹{parseFloat(row.creatorAmount).toLocaleString()}</span> },
    { 
      field: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-badge status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ) 
    }
  ];

  const payoutColumns = [
    { field: 'id', label: 'PAYOUT ID', render: (row) => <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>#{row.id.substring(0, 8)}...</span> },
    { field: 'amount', label: 'AMOUNT', render: (row) => <span className="font-bold">₹{row.amount.toLocaleString()}</span> },
    { field: 'method', label: 'METHOD' },
    { field: 'accountDetails', label: 'DETAILS', render: (row) => <span className="details-text" title={row.accountDetails}>{row.accountDetails}</span> },
    { field: 'requestedAt', label: 'REQUESTED ON', render: (row) => <span className="text-secondary">{row.requestedAt}</span> },
    { 
      field: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-badge status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ) 
    },
    { field: 'adminNotes', label: 'ADMIN NOTES', render: (row) => <span className="notes-text" style={{ color: row.status === 'rejected' ? '#ef4444' : '#64748b' }}>{row.adminNotes || '--'}</span> }
  ];

  if (loading && earnings.length === 0) {
    return <div className="loading-state">Loading financial details...</div>;
  }

  return (
    <div className="creator-earnings-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Creator Earnings & Payouts</h1>
          <p>Track your sales revenues, available balance, and withdrawal requests.</p>
        </div>
        <button 
          className="btn-payout-trigger" 
          onClick={() => setRequestModalOpen(true)}
          disabled={summary.availableEarnings < 500}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          Request Payout
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="icon-wrapper total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Total Earnings</span>
            <h3 className="card-value">₹{summary.totalEarnings.toLocaleString()}</h3>
            <span className="card-hint">All historical revenues</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrapper pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Pending Earnings</span>
            <h3 className="card-value">₹{summary.pendingEarnings.toLocaleString()}</h3>
            <span className="card-hint">Under 7-day holding period</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrapper available">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Available Earnings</span>
            <h3 className="card-value">₹{summary.availableEarnings.toLocaleString()}</h3>
            <span className="card-hint">Eligible for withdrawal</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrapper orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Lifetime Orders</span>
            <h3 className="card-value">{summary.lifetimeOrders}</h3>
            <span className="card-hint">Revenues generated</span>
          </div>
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-card">
          <div className="card-header">
            <h3>Recent Earnings Ledger</h3>
          </div>
          <Table columns={earningColumns} data={earnings.slice(0, 10)} loading={loading} />
        </div>

        <div className="table-card">
          <div className="card-header">
            <h3>Payout Withdrawal Requests</h3>
          </div>
          <Table columns={payoutColumns} data={payouts} loading={loading} />
        </div>
      </div>

      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Request Payout Withdrawal"
      >
        <form onSubmit={handlePayoutSubmit} className="payout-request-form">
          <div className="available-indicator">
            <span>Available Balance:</span>
            <strong>₹{summary.availableEarnings.toLocaleString()}</strong>
          </div>

          <div className="form-group">
            <label htmlFor="payout-amount">Withdrawal Amount (₹)</label>
            <input
              id="payout-amount"
              type="number"
              placeholder="e.g. 1000"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              min="500"
              max={summary.availableEarnings}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
              }}
              required
            />
            <span className="field-hint">Minimum payout request ₹500. Maximum is your available balance.</span>
          </div>

          <div className="form-group">
            <label htmlFor="payout-method">Payment Destination Method</label>
            <div className="select-wrapper">
              <select 
                id="payout-method"
                value={payoutMethod} 
                onChange={(e) => setPayoutMethod(e.target.value)}
              >
                <option value="UPI">UPI Payment ID</option>
                <option value="Bank Transfer">Direct Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="account-details">Recipient Account Details</label>
            <textarea
              id="account-details"
              rows={3}
              placeholder={payoutMethod === 'UPI' ? 'Enter your UPI ID (e.g. username@upi)' : 'Bank Account Number, IFSC Code, Account Holder Name, Bank Name'}
              value={accountDetails}
              onChange={(e) => setAccountDetails(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={() => setRequestModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        .creator-earnings-page {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-text h1 {
          font-size: 28px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 6px 0;
        }

        .header-text p {
          color: #64748b;
          font-size: 15px;
          margin: 0;
        }

        .btn-payout-trigger {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
        }

        .btn-payout-trigger:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
        }

        .btn-payout-trigger:disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
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

        .summary-card .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-card .icon-wrapper.total { background: #ecfdf5; }
        .summary-card .icon-wrapper.pending { background: #fffbeb; }
        .summary-card .icon-wrapper.available { background: #f5f3ff; }
        .summary-card .icon-wrapper.orders { background: #eff6ff; }

        .card-data {
          display: flex;
          flex-direction: column;
        }

        .card-label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 4px;
        }

        .card-value {
          font-size: 26px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 4px 0;
          line-height: 1.1;
        }

        .card-hint {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        /* Tables Grid */
        .tables-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        .table-card {
          background: #fff;
          border-radius: 24px;
          padding: 28px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }

        .card-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: #1e293b;
          margin: 0 0 20px 0;
        }

        /* Typography & Helper Utils */
        .text-secondary { color: #64748b; }
        .text-green { color: #10b981; }
        .font-bold { font-weight: 700; }
        .details-text {
          max-width: 200px;
          display: inline-block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }
        .notes-text {
          font-size: 13px;
          font-style: italic;
        }

        /* Status Badges */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
        }
        .status-badge.status-pending { background: #fffbeb; color: #d97706; }
        .status-badge.status-available { background: #f5f3ff; color: #7c3aed; }
        .status-badge.status-paid { background: #ecfdf5; color: #059669; }
        .status-badge.status-approved { background: #eff6ff; color: #2563eb; }
        .status-badge.status-rejected { background: #fef2f2; color: #dc2626; }
        .status-badge.status-completed { background: #ecfdf5; color: #059669; }

        /* Modal Payout Form */
        .payout-request-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .available-indicator {
          background: #f5f3ff;
          border: 1px solid #ddd6fe;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .available-indicator span {
          font-size: 14px;
          color: #4c1d95;
          font-weight: 600;
        }

        .available-indicator strong {
          font-size: 20px;
          color: #7c3aed;
          font-weight: 800;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

        .form-group input, .form-group textarea, .select-wrapper select {
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus, .form-group textarea:focus, .select-wrapper select:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
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

        .field-hint {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 12px;
        }

        .btn-cancel, .btn-submit {
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #fff;
          border: 1px solid #cbd5e1;
          color: #475569;
        }

        .btn-cancel:hover:not(:disabled) {
          background: #f8fafc;
        }

        .btn-submit {
          background: linear-gradient(135deg, #8b5cf6, #6d28d9);
          color: #fff;
          border: none;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.35);
        }

        .btn-cancel:disabled, .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .loading-state {
          padding: 80px;
          text-align: center;
          color: #94a3b8;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
}
