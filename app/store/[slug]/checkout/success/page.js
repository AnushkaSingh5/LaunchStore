'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeService } from '@/services/storeService';
import { orderService } from '@/services/orderService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutSuccessPage({ params }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const router = useRouter();

  const [storeDetails, setStoreDetails] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        router.push(`/store/${slug}`);
        return;
      }
      try {
        const [store, order] = await Promise.all([
          storeService.getStoreBySlug(slug),
          orderService.getOrderDetails(orderId)
        ]);
        setStoreDetails(store);
        setOrderDetails(order);
      } catch (err) {
        console.error('⚠️ [SuccessPage] Error loading checkout details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, orderId, router]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Confirming Order Details...</p>
        <style jsx>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #0f172a;
            color: #fff;
            gap: 16px;
            font-family: 'Outfit', sans-serif;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-left-color: #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const orderNum = orderId ? String(orderId).slice(0, 8).toUpperCase() : '';
  const totalAmount = orderDetails ? parseFloat(orderDetails.total_amount || 0).toFixed(2) : '0.00';
  const paymentStatus = orderDetails?.payment_status || 'Paid';

  return (
    <div className="success-page">
      <Navbar storeName={storeDetails?.name} logoUrl={storeDetails?.logo_url || storeDetails?.logo} />
      
      <main className="container success-container fade-in">
        <div className="success-card dashboard-card">
          <div className="success-icon-wrapper">
            <span className="success-icon">🎉</span>
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="success-lead">
            Thank you for shopping at <strong>{storeDetails?.name}</strong>! Your payment has been processed and your order is confirmed.
          </p>
          
          <div className="orders-summary-box">
            <h3>Payment & Order Summary</h3>
            <div className="order-summary-item">
              <span className="order-lbl">Order ID</span>
              <span className="order-val">#{orderNum}</span>
            </div>
            <div className="order-summary-item">
              <span className="order-lbl">Total Paid</span>
              <span className="order-val highlight">₹{totalAmount}</span>
            </div>
            <div className="order-summary-item">
              <span className="order-lbl">Payment Status</span>
              <span className={`status-badge ${paymentStatus.toLowerCase()}`}>
                {paymentStatus}
              </span>
            </div>
            {orderDetails?.payment_id && (
              <div className="order-summary-item">
                <span className="order-lbl">Transaction ID</span>
                <span className="order-val txn-id">{orderDetails.payment_id}</span>
              </div>
            )}
            <div className="order-summary-item">
              <span className="order-lbl">Deliver To</span>
              <span className="order-val address-val">{orderDetails?.shipping_address}</span>
            </div>
          </div>

          <div className="action-row">
            <Link href={`/store/${slug}`} className="primary-btn">Continue Shopping</Link>
            <Link href={`/customer/orders?store=${slug}`} className="secondary-btn">View My Orders</Link>
          </div>
        </div>
      </main>

      <Footer storeName={storeDetails?.name} />

      <style jsx>{`
        .success-page {
          background: var(--bg-main, #f8fafc);
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
        }
        .success-container {
          padding-top: 140px;
          padding-bottom: 80px;
          display: flex;
          justify-content: center;
        }
        .success-card {
          max-width: 600px;
          width: 100%;
          background: #fff;
          border: 1px solid var(--secondary, #e2e8f0);
          border-radius: 24px;
          padding: 48px 36px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .success-icon-wrapper {
          width: 80px;
          height: 80px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .success-icon {
          font-size: 44px;
        }
        h1 {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main, #0f172a);
          letter-spacing: -0.5px;
          margin: 0;
        }
        .success-lead {
          color: var(--text-sub, #64748b);
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }
        .orders-summary-box {
          width: 100%;
          background: var(--bg-main, #f8fafc);
          border-radius: 16px;
          border: 1px solid var(--secondary, #e2e8f0);
          padding: 24px;
          margin: 10px 0;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .orders-summary-box h3 {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main, #0f172a);
          margin: 0 0 4px 0;
          border-bottom: 1px solid var(--secondary, #e2e8f0);
          padding-bottom: 8px;
        }
        .order-summary-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 14px;
          gap: 16px;
        }
        .order-lbl {
          font-weight: 600;
          color: var(--text-sub, #64748b);
          min-width: 110px;
        }
        .order-val {
          font-weight: 700;
          color: var(--text-main, #0f172a);
          text-align: right;
        }
        .order-val.highlight {
          color: #10b981;
          font-size: 16px;
        }
        .txn-id {
          font-family: monospace;
          font-size: 12px;
          color: #475569;
        }
        .address-val {
          font-weight: 500;
          color: #475569;
          font-size: 13px;
          line-height: 1.4;
          max-width: 300px;
        }
        .status-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 99px;
          text-transform: uppercase;
        }
        .status-badge.paid {
          background: #d1fae5;
          color: #065f46;
        }
        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-badge.failed {
          background: #fee2e2;
          color: #991b1b;
        }
        .action-row {
          display: flex;
          gap: 16px;
          width: 100%;
          margin-top: 10px;
        }
        .primary-btn, .secondary-btn {
          flex: 1;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          text-align: center;
          transition: all 0.2s;
          text-decoration: none;
        }
        .primary-btn {
          background: var(--primary, #8b5cf6);
          color: #fff;
        }
        .primary-btn:hover {
          background: var(--accent, #7c3aed);
          transform: translateY(-1px);
        }
        .secondary-btn {
          background: transparent;
          color: var(--text-main, #0f172a);
          border: 1px solid var(--secondary, #e2e8f0);
        }
        .secondary-btn:hover {
          background: var(--secondary, #e2e8f0);
          transform: translateY(-1px);
        }
        @media (max-width: 576px) {
          .action-row {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
