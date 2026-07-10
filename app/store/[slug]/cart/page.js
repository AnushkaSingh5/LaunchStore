'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { storeService } from '@/services/storeService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StoreUnderReview from '@/components/StoreUnderReview';

export default function CartPage({ params }) {
  const { slug } = use(params);
  const { cart: globalCart, updateQuantity, removeFromCart, clearCart } = useStore();
  const { user } = useAuth();
  const [storeDetails, setStoreDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        const data = await storeService.getStoreBySlug(slug);
        setStoreDetails(data);
      } catch (e) {
        console.error('Failed to fetch store details in cart:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [slug]);

  if (loading) {
    return (
      <div className="store-loading-screen">
        <div className="spinner"></div>
        <p>Loading Cart...</p>
        <style jsx>{`
          .store-loading-screen {
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
            border-left-color: #8b5cf6;
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

  if (!storeDetails) {
    return (
      <div className="store-not-found-screen">
        <div className="glass-card">
          <h2>Store Not Found 🔍</h2>
          <p>We couldn't find an active store with the link <strong>/store/{slug}</strong>. Please check the spelling or contact the owner.</p>
          <Link href="/" className="back-link">Return to Home</Link>
        </div>
        <style jsx>{`
          .store-not-found-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            padding: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            max-width: 480px;
            text-align: center;
            color: #fff;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
          .glass-card h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #f43f5e, #fb7185);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .back-link {
            display: inline-block;
            padding: 12px 24px;
            background: #e11d48;
            color: #fff;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
          }
        `}</style>
      </div>
    );
  }

  const currentUserId = user?.id;
  const isCreator = currentUserId && currentUserId === storeDetails?.creator_id;

  if (storeDetails && storeDetails.status !== 'approved' && !isCreator) {
    return (
      <StoreUnderReview 
        storeName={storeDetails.name} 
        status={storeDetails.status} 
        statusReason={storeDetails.status_reason} 
      />
    );
  }

  const cart = (globalCart || []).filter(
    item => item.store_id === storeDetails?.id || item.store_slug === slug
  );
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasInventoryErrors = cart.some(item => item.stock === 0 || item.quantity > item.stock);

  const shippingType = storeDetails?.theme_settings?.shippingType ?? 'flat';
  const flatFee = parseFloat(storeDetails?.theme_settings?.flatFee) ?? 15;
  
  let shipping = 0;
  if (cart.length > 0) {
    if (shippingType === 'flat') {
      shipping = flatFee;
    } else if (shippingType === 'calculated') {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      shipping = 40 + (totalItems * 10);
    } else {
      shipping = 0;
    }
  }

  const tax = cartTotal * 0.08;
  const total = cartTotal + tax + shipping;

  return (
    <div className="cart-page">
      <Navbar storeName={storeDetails?.name} logoUrl={storeDetails?.logo_url || storeDetails?.logo} />

      <main className="container main-content">
        <h1 className="page-title">Shopping Cart</h1>

        {cart.length === 0 ? (
          <div className="empty-cart dashboard-card fade-in">
            <div className="empty-icon">🛍️</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven&apos;t added anything yet. Explore our collection to find something you love.</p>
            <Link href={`/store/${slug}`} className="shop-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items dashboard-card fade-in">
              <div className="items-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
                <span>Action</span>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p className="category">{item.category}</p>
                      <p className="price">₹{item.price.toLocaleString()}</p>
                      {item.stock === 0 ? (
                        <p className="stock-warning out-of-stock">Out of Stock</p>
                      ) : item.quantity > item.stock ? (
                        <p className="stock-warning low-stock">Only {item.stock} items available.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="item-quantity">
                    <div className="quantity-selector">
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>

                  <div className="item-total">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>

                  <div className="item-action">
                    {item.stock === 0 || item.quantity > item.stock ? (
                      <button className="row-buy-btn disabled-btn" disabled>
                        Buy
                      </button>
                    ) : (
                      <Link href={`/store/${slug}/checkout`} className="row-buy-btn">
                        Buy
                      </Link>
                    )}
                    <button className="action-delete-btn" onClick={() => removeFromCart(item.id)} title="Remove from cart">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-footer">
                <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
                <Link href={`/store/${slug}`} className="back-link">← Continue Shopping</Link>
              </div>
            </div>

            <div className="cart-summary dashboard-card fade-in">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax (8%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? "free" : ""}>
                  {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString()}`}
                </span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>

              {hasInventoryErrors ? (
                <button className="checkout-btn disabled-btn" disabled style={{ width: '100%', border: 'none', cursor: 'not-allowed' }}>
                  Proceed to Checkout
                </button>
              ) : (
                <Link href={`/store/${slug}/checkout`} className="checkout-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  Proceed to Checkout
                </Link>
              )}

              <div className="payment-icons">
                <span>Secure payments via</span>
                <div className="icons">💳 🏦 📦</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer storeName={storeDetails?.name} />

      <style jsx>{`
        .cart-page {
          background: var(--bg-main);
          min-height: 100vh;
        }

        .main-content {
          padding-top: 140px;
          padding-bottom: 80px;
        }

        .page-title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 40px;
          letter-spacing: -1px;
        }

        .empty-cart {
          text-align: center;
          padding: 100px 40px;
          background: var(--white);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .empty-icon {
          font-size: 64px;
        }

        .empty-cart h2 {
          font-size: 28px;
          font-weight: 700;
        }

        .empty-cart p {
          color: var(--text-sub);
          max-width: 400px;
          line-height: 1.6;
        }

        :global(.shop-btn) {
          margin-top: 20px;
          padding: 14px 40px;
          background: var(--primary);
          color: var(--white) !important;
          border-radius: 12px;
          font-weight: 700;
          transition: var(--transition-smooth);
          display: inline-block;
          text-decoration: none;
        }

        :global(.shop-btn:hover) {
          background: var(--accent);
          transform: translateY(-2px);
        }

        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
          align-items: start;
        }

        .cart-items {
          background: var(--white);
          padding: 0;
        }

        .items-header {
          display: grid;
          grid-template-columns: 1fr 140px 100px 120px;
          gap: 40px;
          padding: 24px 40px;
          border-bottom: 1px solid var(--secondary);
          font-size: 13px;
          font-weight: 700;
          color: var(--text-sub);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 1fr 140px 100px 120px;
          gap: 40px;
          align-items: center;
          padding: 30px 40px;
          border-bottom: 1px solid var(--secondary);
        }

        .item-info {
          display: flex;
          gap: 24px;
          align-items: center;
        }

        .item-image {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-main);
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
        }

        .item-details h3 {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .item-details .category {
          font-size: 13px;
          color: var(--text-sub);
          margin-bottom: 8px;
        }

        .item-details .price {
          font-weight: 700;
          color: var(--accent);
        }

         .quantity-selector {
          display: flex;
          align-items: center;
          background: var(--bg-main);
          border-radius: 10px;
          padding: 4px;
          width: 120px;
          justify-content: space-between;
          margin: 0 auto;
        }

        .quantity-selector button {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .quantity-selector span {
          width: 40px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
        }

        .item-total {
          font-weight: 700;
          font-size: 18px;
        }

        .item-action {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .action-delete-btn {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .action-delete-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: #b91c1c;
          transform: scale(1.08);
        }

        :global(.row-buy-btn) {
          display: inline-block;
          padding: 8px 20px;
          background: var(--accent);
          color: var(--white) !important;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          text-align: center;
          text-decoration: none !important;
          transition: var(--transition-fast);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        :global(.row-buy-btn:hover) {
          background: var(--primary);
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .remove-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #ef4444;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition-fast);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .item-image:hover .remove-btn {
          opacity: 1;
        }

        .remove-btn:hover {
          opacity: 1;
          transform: scale(1.1);
          background: white;
        }

        .cart-footer {
          padding: 30px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .clear-btn {
          font-size: 14px;
          font-weight: 600;
          color: #ef4444;
        }

        .back-link {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .cart-summary {
          background: var(--white);
          padding: 40px;
          position: sticky;
          top: 120px;
        }

        .summary-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          font-size: 15px;
          color: var(--text-sub);
        }

        .summary-row .free {
          color: #22c55e;
          font-weight: 700;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 2px solid var(--secondary);
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 40px;
        }

        :global(.checkout-btn) {
          width: 100%;
          padding: 16px;
          background: var(--primary);
          color: white !important;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 24px;
          transition: var(--transition-smooth);
        }

        :global(.checkout-btn:hover) {
          background: var(--accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .payment-icons {
          text-align: center;
          font-size: 13px;
          color: var(--text-sub);
        }

        .payment-icons .icons {
          font-size: 24px;
          margin-top: 8px;
        }

        @media (max-width: 1200px) {
          .cart-layout {
            grid-template-columns: 1fr;
          }
          .cart-summary {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 28px;
            margin-bottom: 24px;
            padding: 0 10px;
          }
          .items-header {
            display: none;
          }
          .cart-item {
            grid-template-columns: 1fr;
            gap: 16px;
            padding: 24px 15px;
            position: relative;
          }
          .item-info {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          .item-image {
            width: 100%;
            max-width: 180px;
            height: auto;
            aspect-ratio: 1/1;
            margin: 0 auto;
          }
          .item-quantity, .item-total {
            justify-self: center;
          }
          .item-total {
            border-top: 1px solid var(--secondary);
            width: 100%;
            text-align: center;
            padding-top: 12px;
          }
          .item-action {
            justify-self: center;
            width: 100%;
            text-align: center;
            margin-top: 8px;
          }
          .row-buy-btn {
            display: block;
            width: 100%;
            max-width: 200px;
            margin: 0 auto;
            padding: 10px 20px;
          }
          .remove-btn {
            opacity: 1; /* Always show on mobile since there is no hover */
          }
          .cart-footer {
            padding: 20px 15px;
            flex-direction: column;
            gap: 16px;
          }
          .cart-summary {
            padding: 24px 15px;
          }
        }

        .stock-warning {
          font-size: 11px;
          font-weight: 700;
          margin-top: 6px;
          display: inline-block;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .stock-warning.out-of-stock {
          background: #fee2e2;
          color: #ef4444;
        }
        .stock-warning.low-stock {
          background: #fffbeb;
          color: #f59e0b;
        }
        .disabled-btn {
          opacity: 0.6;
          cursor: not-allowed !important;
          background: #cbd5e1 !important;
          color: #64748b !important;
          box-shadow: none !important;
          transform: none !important;
        }
      `}</style>
    </div>
  );
}
