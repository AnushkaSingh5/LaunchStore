'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { walletService } from '@/services/walletService';
import { payoutService } from '@/services/payoutService';
import Table from '@/components/UI/Table';
import Modal from '@/components/UI/Modal';

export default function CreatorWallet() {
  const { store } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Overview stats state
  const [overview, setOverview] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    availableBalance: 0,
    totalPayouts: 0
  });

  // Transactions state
  const [transactions, setTransactions] = useState([]);

  // Payout request form state
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [accountDetails, setAccountDetails] = useState('');

  useEffect(() => {
    if (store) {
      loadWalletData();
    }
  }, [store]);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [stats, txs] = await Promise.all([
        walletService.getWalletOverview(store.creator_id, store.id),
        walletService.getWalletTransactions(store.creator_id)
      ]);
      setOverview(stats);
      setTransactions(txs);
    } catch (e) {
      console.error('Error loading wallet data:', e);
    } finally {
      setLoading(false);
    }
  };

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

    if (amt > overview.availableBalance) {
      alert('Payout amount cannot exceed available balance.');
      return;
    }

    if (!accountDetails.trim()) {
      alert('Please enter your account details.');
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
        await loadWalletData();
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

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'Sale Credit': return '#10b981';
      case 'Refund Adjustment': return '#ef4444';
      case 'Payout Request': return '#3b82f6';
      case 'Payout Completed': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const columns = [
    { 
      field: 'created_at', 
      label: 'DATE', 
      render: (row) => <span className="text-secondary">{row.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'}</span> 
    },
    { 
      field: 'type', 
      label: 'TRANSACTION TYPE', 
      render: (row) => (
        <span className="tx-type-pill" style={{ background: `${getTransactionTypeColor(row.type)}12`, color: getTransactionTypeColor(row.type) }}>
          {row.type}
        </span>
      )
    },
    { 
      field: 'amount', 
      label: 'AMOUNT', 
      render: (row) => {
        const isNegative = row.amount < 0;
        return (
          <span className={`font-bold ${isNegative ? 'text-red' : 'text-green'}`}>
            {isNegative ? '-' : '+'}₹{Math.abs(row.amount).toLocaleString()}
          </span>
        );
      }
    },
    { 
      field: 'status', 
      label: 'STATUS', 
      render: (row) => (
        <span className={`status-badge status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ) 
    },
    {
      field: 'reference_id',
      label: 'REFERENCE ID',
      render: (row) => <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8' }}>#{row.reference_id ? row.reference_id.substring(0, 8) : 'N/A'}</span>
    }
  ];

  if (loading && transactions.length === 0) {
    return <div className="loading-state">Loading wallet ledger...</div>;
  }

  return (
    <div className="wallet-page">
      <div className="page-header">
        <div className="header-text">
          <h1>Seller Wallet</h1>
          <p>Review ledger transactions, track withdrawals, and inspect sales credits.</p>
        </div>
        <button 
          className="btn-payout-trigger" 
          onClick={() => setRequestModalOpen(true)}
          disabled={overview.availableBalance < 500}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
          Request Withdrawal
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="icon-wrapper total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Total Earnings</span>
            <h3 className="card-value">₹{overview.totalEarnings.toLocaleString()}</h3>
            <span className="card-hint">All sales revenue credit</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrapper pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Pending Earnings</span>
            <h3 className="card-value">₹{overview.pendingEarnings.toLocaleString()}</h3>
            <span className="card-hint">Locked under holding period</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrapper available">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Available Balance</span>
            <h3 className="card-value">₹{overview.availableBalance.toLocaleString()}</h3>
            <span className="card-hint">Withdrawable funds</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="icon-wrapper payouts">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          </div>
          <div className="card-data">
            <span className="card-label">Total Payouts</span>
            <h3 className="card-value">₹{overview.totalPayouts.toLocaleString()}</h3>
            <span className="card-hint">Settled cash withdrawals</span>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="card-header">
          <h3>Wallet Transactions History</h3>
        </div>
        <div className="desktop-columns">
          <Table columns={columns} data={transactions} loading={loading} />
        </div>
        <div className="mobile-card-wrapper">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const isNegative = tx.amount < 0;
              return (
                <div className="tx-card" key={tx.id}>
                  <div className="tx-card-top">
                    <span className="tx-type-pill" style={{ background: `${getTransactionTypeColor(tx.type)}12`, color: getTransactionTypeColor(tx.type) }}>
                      {tx.type}
                    </span>
                    <span className={`status-badge status-${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="tx-card-middle">
                    <div className="tx-metric">
                      <span className="tx-lbl">Amount</span>
                      <strong className={isNegative ? 'text-red' : 'text-green'}>
                        {isNegative ? '-' : '+'}₹{Math.abs(tx.amount).toLocaleString()}
                      </strong>
                    </div>
                    <div className="tx-metric">
                      <span className="tx-lbl">Reference ID</span>
                      <span className="tx-ref">#{tx.reference_id ? tx.reference_id.substring(0, 8).toUpperCase() : 'N/A'}</span>
                    </div>
                  </div>
                  <div className="tx-card-footer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-tx">No wallet transactions found.</div>
          )}
        </div>
      </div>

      <Modal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        title="Submit Wallet Payout Request"
      >
        <form onSubmit={handlePayoutSubmit} className="payout-request-form">
          <div className="available-indicator">
            <span>Withdrawable Balance:</span>
            <strong>₹{overview.availableBalance.toLocaleString()}</strong>
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
              max={overview.availableBalance}
              onKeyDown={(e) => {
                if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
              }}
              required
            />
            <span className="field-hint">Minimum payout request ₹500. Maximum is your available balance.</span>
          </div>

          <div className="form-group">
            <label htmlFor="payout-method">Payout Method</label>
            <div className="select-wrapper">
              <select 
                id="payout-method"
                value={payoutMethod} 
                onChange={(e) => setPayoutMethod(e.target.value)}
              >
                <option value="UPI">UPI Address</option>
                <option value="Bank Transfer">Bank Account Transfer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="account-details">Payment Destination Details</label>
            <textarea
              id="account-details"
              rows={3}
              placeholder={payoutMethod === 'UPI' ? 'Enter UPI ID (e.g. name@upi)' : 'Account Holder Name, Account Number, Bank Name, IFSC code'}
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
        .wallet-page {
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
          background: linear-gradient(135deg, #f59e0b, #d97706);
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
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        .btn-payout-trigger:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
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
        .summary-card .icon-wrapper.payouts { background: #fdf2f8; }

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

        /* Table container */
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

        /* Helper styles */
        .text-secondary { color: #64748b; }
        .text-green { color: #10b981; }
        .text-red { color: #ef4444; }
        .font-bold { font-weight: 700; }

        .tx-type-pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
        }

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
        .status-badge.status-completed { background: #ecfdf5; color: #059669; }
        .status-badge.status-rejected { background: #fef2f2; color: #dc2626; }
        .status-badge.status-failed { background: #fef2f2; color: #dc2626; }

        /* Modal Form */
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
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          border: none;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.35);
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

        .mobile-card-wrapper {
          display: none;
        }
        .desktop-columns {
          display: contents;
        }

        @media (max-width: 768px) {
          .wallet-page {
            gap: 16px !important;
          }
          .page-header {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .btn-payout-trigger {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .summary-cards {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .summary-card {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 14px !important;
            gap: 10px !important;
          }
          .summary-card .icon-wrapper {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
          }
          .summary-card .icon-wrapper svg {
            width: 16px !important;
            height: 16px !important;
          }
          .card-data {
            width: 100% !important;
          }
          .card-label {
            font-size: 11px !important;
            white-space: normal !important;
            word-break: break-word !important;
          }
          .card-value {
            font-size: 18px !important;
          }
          .card-hint {
            font-size: 10px !important;
            white-space: normal !important;
            word-break: break-word !important;
          }

          .table-card {
            padding: 0 !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
          }
          .card-header h3 {
            font-size: 16px !important;
            margin-bottom: 12px !important;
          }

          .desktop-columns {
            display: none !important;
          }
          .mobile-card-wrapper {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            width: 100% !important;
          }

          /* Transaction Card mobile styles */
          .tx-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 16px !important;
            padding: 14px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.01) !important;
            width: 100% !important;
          }

          .tx-card-top {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            width: 100% !important;
          }
          .tx-type-pill {
            font-size: 11px !important;
            padding: 4px 10px !important;
            font-weight: 700 !important;
          }

          .tx-card-middle {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            background: #f8fafc !important;
            padding: 10px !important;
            border-radius: 10px !important;
            border: 1px solid #f1f5f9 !important;
            width: 100% !important;
          }
          .tx-metric {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
            align-items: center !important;
          }
          .tx-lbl {
            font-size: 9.5px !important;
            font-weight: 700 !important;
            color: #94a3b8 !important;
            text-transform: uppercase !important;
          }
          .tx-metric strong, .tx-metric span {
            font-size: 13px !important;
          }
          .tx-ref {
            font-family: monospace !important;
            color: #64748b !important;
          }

          .tx-card-footer {
            display: flex !important;
            align-items: center !important;
            gap: 4px !important;
            font-size: 11.5px !important;
            color: #64748b !important;
            border-top: 1px solid #f1f5f9 !important;
            padding-top: 10px !important;
          }
          .tx-card-footer svg {
            color: #94a3b8 !important;
          }

          .empty-state-tx {
            padding: 24px !important;
            text-align: center !important;
            color: #94a3b8 !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}
