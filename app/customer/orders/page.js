'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { orderService } from '@/services/orderService';
import { useLoading } from '@/components/TopLoader';

export default function CustomerOrdersPage() {
  const { customer, customerProfile } = useCustomerAuth();
  const { startLoading, completeLoading } = useLoading();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customer || !customerProfile) return;
      setLoadingOrders(true);
      try {
        const data = await orderService.getCustomerOrders(customer.email, customerProfile.id);
        setOrders(data);
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [customer, customerProfile]);

  const handleViewDetails = async (orderId) => {
    setLoadingDetails(true);
    startLoading();
    try {
      const details = await orderService.getOrderDetails(orderId);
      setSelectedOrder(details);
    } catch (err) {
      console.error('Failed to load order details:', err);
      alert('Could not retrieve order details. Please try again.');
    } finally {
      setLoadingDetails(false);
      completeLoading();
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'shipped': return 'status-shipped';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="orders-page fade-in">
      <div className="orders-card dashboard-card">
        <h2>My Purchases</h2>
        <p className="subtitle">Track and view history of your store orders</p>

        <div className="divider"></div>

        {loadingOrders ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Fetching your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🛍️</span>
            <h3>No orders found</h3>
            <p>You haven't placed any orders yet. Start shopping to see your purchase history here!</p>
          </div>
        ) : (
          <div className="orders-list">
            <div className="orders-table-header">
              <span>Order ID</span>
              <span>Date</span>
              <span>Store</span>
              <span>Total Charged</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            
            {orders.map((order) => (
              <div key={order.id} className="order-row">
                <span className="order-id">#{order.id.slice(0, 8).toUpperCase()}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                <span className="order-store">{order.store?.name || 'Online Store'}</span>
                <span className="order-amount">₹{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                <span className="order-status">
                  <span className={`status-pill ${getStatusClass(order.status)}`}>
                    {order.status}
                  </span>
                </span>
                <span className="order-actions">
                  <button 
                    onClick={() => handleViewDetails(order.id)} 
                    className="view-btn"
                  >
                    View Details
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-card glass" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="details-grid">
                <div>
                  <span className="label">Order ID</span>
                  <p className="value">#{selectedOrder.id.toUpperCase()}</p>
                </div>
                <div>
                  <span className="label">Store</span>
                  <p className="value">{selectedOrder.store?.name || 'Online Store'}</p>
                </div>
                <div>
                  <span className="label">Date Placed</span>
                  <p className="value">
                    {new Date(selectedOrder.created_at).toLocaleString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span className="label">Status</span>
                  <p>
                    <span className={`status-pill ${getStatusClass(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="modal-divider"></div>

              <div className="address-section">
                <span className="label">Shipping Destination</span>
                <p className="value address-val">{selectedOrder.shipping_address}</p>
                <p className="value font-semibold">{selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              </div>

              <div className="modal-divider"></div>

              <div className="items-section">
                <span className="label">Purchased Items</span>
                <div className="items-list">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="item-row">
                      <div className="item-img-placeholder">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} />
                        ) : (
                          '📦'
                        )}
                      </div>
                      <div className="item-info">
                        <h4>{item.productName}</h4>
                        <span className="qty-price">{item.quantity} × ₹{parseFloat(item.price || 0).toFixed(2)}</span>
                      </div>
                      <span className="item-subtotal">₹{(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-divider"></div>

              <div className="total-breakdown">
                <div className="breakdown-row grand-total">
                  <span>Grand Total Paid</span>
                  <span>₹{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .orders-card {
          background: var(--white, #ffffff);
          border-radius: var(--radius-lg, 24px);
          padding: 40px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        h2 {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main, #1d1d1f);
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-sub, #64748b);
        }

        .divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 24px 0;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          font-size: 48px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
        }

        .empty-state p {
          font-size: 14px;
          color: var(--text-sub, #64748b);
          max-width: 320px;
          line-height: 1.6;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(0, 0, 0, 0.05);
          border-left-color: var(--accent, #2563eb);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .orders-table-header {
          display: grid;
          grid-template-columns: 100px 120px 1fr 120px 100px 100px;
          padding: 12px 16px;
          background: var(--bg-main, #f8f9fb);
          font-size: 12px;
          font-weight: 700;
          color: var(--text-sub, #64748b);
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .order-row {
          display: grid;
          grid-template-columns: 100px 120px 1fr 120px 100px 100px;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
          font-size: 14px;
          transition: var(--transition-fast, all 0.2s);
        }

        .order-row:hover {
          background: rgba(0, 0, 0, 0.01);
        }

        .order-id {
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
        }

        .order-date, .order-store {
          color: var(--text-main, #1d1d1f);
        }

        .order-amount {
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
        }

        .status-pill {
          padding: 4px 8px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          display: inline-block;
          text-align: center;
        }

        .status-pending {
          background: #fffbeb;
          color: #b45309;
        }

        .status-shipped {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .status-delivered {
          background: #ecfdf5;
          color: #047857;
        }

        .status-cancelled {
          background: #fef2f2;
          color: #b91c1c;
        }

        .view-btn {
          font-size: 13px;
          font-weight: 700;
          color: var(--accent, #2563eb);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .view-btn:hover {
          text-decoration: underline;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1200;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-card {
          background: var(--white, #ffffff);
          border-radius: var(--radius-lg, 24px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          width: 100%;
          max-width: 560px;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main, #1d1d1f);
        }

        .close-btn {
          font-size: 16px;
          color: var(--text-sub, #64748b);
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .close-btn:hover {
          color: var(--text-main, #1d1d1f);
        }

        .modal-body {
          padding: 24px;
          max-height: 75vh;
          overflow-y: auto;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        .label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--text-sub, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .value {
          font-size: 14px;
          color: var(--text-main, #1d1d1f);
          font-weight: 600;
        }

        .address-val {
          line-height: 1.5;
          margin-bottom: 4px;
        }

        .font-semibold {
          font-weight: 600;
          color: var(--text-sub, #64748b);
        }

        .modal-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.05);
          margin: 20px 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 10px;
        }

        .item-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .item-img-placeholder {
          width: 52px;
          height: 52px;
          border-radius: 8px;
          background: var(--bg-main, #f8f9fb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          overflow: hidden;
        }

        .item-img-placeholder img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-main, #1d1d1f);
          margin-bottom: 2px;
        }

        .qty-price {
          font-size: 12px;
          color: var(--text-sub, #64748b);
        }

        .item-subtotal {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-main, #1d1d1f);
        }

        .total-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-sub, #64748b);
        }

        .grand-total {
          font-size: 18px;
          font-weight: 800;
          color: var(--text-main, #1d1d1f);
        }

        @media (max-width: 768px) {
          .orders-table-header {
            display: none;
          }
          .order-row {
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 20px 0;
          }
          .order-store {
            grid-column: span 2;
            font-weight: 700;
          }
          .order-actions {
            grid-column: span 2;
            text-align: right;
          }
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
