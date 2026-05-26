'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { storeService } from '@/services/storeService';
import { checkoutService } from '@/services/checkoutService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StoreCheckoutPage({ params }) {
  const { slug } = use(params);
  const { cart: globalCart, setCart } = useStore();
  const [storeDetails, setStoreDetails] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      setLoadingDetails(true);
      try {
        const data = await storeService.getStoreBySlug(slug);
        setStoreDetails(data);
      } catch (e) {
        console.error('Failed to fetch store details in checkout:', e);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchStore();
  }, [slug]);

  if (loadingDetails) {
    return (
      <div className="store-loading-screen">
        <div className="spinner"></div>
        <p>Loading Checkout...</p>
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

  // Filter global cart items to only purchase items belonging to this specific store
  const cart = (globalCart || []).filter(
    item => item.store_id === storeDetails?.id || item.store_slug === slug
  );
  
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = cartTotal * 0.08;
  const total = cartTotal + tax; // Free shipping

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const validation = checkoutService.validateCheckoutForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      const response = await checkoutService.processCheckout(cart, form);
      if (response.success && response.orders?.length > 0) {
        setPlacedOrder(response.orders[0]);
        setSuccess(true);
        
        // Clear only this store's items from the global cart
        setCart(prev => prev.filter(
          item => item.store_id !== storeDetails?.id && item.store_slug !== slug
        ));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <Navbar storeName={storeDetails?.name} />
        <main className="container success-container fade-in">
          <div className="success-card dashboard-card">
            <div className="success-icon">🎉</div>
            <h1>Purchase Completed!</h1>
            <p className="success-lead">Thank you for ordering from <strong>{storeDetails?.name}</strong>! Your order is registered and is being processed by the creator.</p>
            
            <div className="orders-summary-box">
              <h3>Order Details</h3>
              <div className="order-summary-item">
                <span className="order-num">Order ID</span>
                <span className="order-val">#{String(placedOrder?.id || '').slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="order-summary-item">
                <span className="order-num">Total Charged</span>
                <span className="order-val">${parseFloat(placedOrder?.total_amount || 0).toFixed(2)}</span>
              </div>
              <div className="order-summary-item">
                <span className="order-num">Status</span>
                <span className="order-status-badge">Pending</span>
              </div>
            </div>

            <div className="action-row">
              <Link href={`/store/${slug}`} className="primary-btn">Back to Shop</Link>
              <Link href="/account/orders" className="secondary-btn">Track Order History</Link>
            </div>
          </div>
        </main>
        <Footer storeName={storeDetails?.name} />
        <style jsx>{`
          .success-container {
            padding-top: 140px;
            padding-bottom: 80px;
            display: flex;
            justify-content: center;
          }
          .success-card {
            max-width: 640px;
            width: 100%;
            background: var(--white);
            text-align: center;
            padding: 50px 40px;
            border-radius: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
            border: 1px solid var(--secondary);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          .success-icon {
            font-size: 64px;
          }
          h1 {
            font-size: 32px;
            font-weight: 800;
            color: var(--text-main);
          }
          .success-lead {
            color: var(--text-sub);
            line-height: 1.6;
            font-size: 15px;
          }
          .orders-summary-box {
            width: 100%;
            background: var(--bg-main);
            border-radius: 16px;
            padding: 20px;
            margin: 10px 0;
            text-align: left;
          }
          .orders-summary-box h3 {
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 12px;
            color: var(--text-main);
            border-bottom: 1px solid var(--secondary);
            padding-bottom: 8px;
          }
          .order-summary-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            font-size: 14px;
          }
          .order-num {
            font-weight: 600;
            color: var(--text-sub);
          }
          .order-val {
            font-weight: 700;
            color: var(--text-main);
          }
          .order-status-badge {
            font-size: 11px;
            background: #fffbeb;
            color: #b45309;
            padding: 2px 8px;
            border-radius: 99px;
            font-weight: 700;
          }
          .action-row {
            display: flex;
            gap: 16px;
            margin-top: 10px;
            width: 100%;
          }
          .primary-btn, .secondary-btn {
            flex: 1;
            padding: 14px;
            border-radius: 12px;
            font-weight: 700;
            text-align: center;
            transition: var(--transition-smooth);
            text-decoration: none;
            font-size: 14px;
          }
          .primary-btn {
            background: var(--primary);
            color: var(--white);
          }
          .primary-btn:hover {
            background: var(--accent);
            transform: translateY(-1px);
          }
          .secondary-btn {
            background: var(--bg-main);
            color: var(--text-main);
            border: 1px solid var(--secondary);
          }
          .secondary-btn:hover {
            background: var(--secondary);
            transform: translateY(-1px);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar storeName={storeDetails?.name} />

      <main className="container main-content">
        <h1 className="page-title">Secure Checkout</h1>

        {cart.length === 0 ? (
          <div className="empty-cart dashboard-card fade-in">
            <div className="empty-icon">🛍️</div>
            <h2>Nothing to checkout</h2>
            <p>Your cart is currently empty for this store. Explore our collection to add items before proceeding.</p>
            <Link href={`/store/${slug}`} className="shop-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <form onSubmit={handleFormSubmit} className="checkout-form dashboard-card fade-in">
              <h2 className="section-title">Shipping & Contact Details</h2>
              
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={form.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. John Doe"
                  className={errors.name ? 'error-input' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleInputChange} 
                    placeholder="john@example.com"
                    className={errors.email ? 'error-input' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleInputChange} 
                    placeholder="+1 234 567 8900"
                    className={errors.phone ? 'error-input' : ''}
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Shipping Address</label>
                <textarea 
                  name="address" 
                  value={form.address} 
                  onChange={handleInputChange} 
                  placeholder="Street name, apartment, building no..."
                  rows="3"
                  className={errors.address ? 'error-input' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={form.city} 
                    onChange={handleInputChange} 
                    placeholder="e.g. San Francisco"
                    className={errors.city ? 'error-input' : ''}
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={form.state} 
                    onChange={handleInputChange} 
                    placeholder="e.g. California"
                    className={errors.state ? 'error-input' : ''}
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label>Pincode / Zipcode</label>
                  <input 
                    type="text" 
                    name="pincode" 
                    value={form.pincode} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 94103"
                    className={errors.pincode ? 'error-input' : ''}
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>

              <button type="submit" className="submit-order-btn" disabled={loading}>
                {loading ? 'Processing Your Purchase...' : 'Complete Order'}
              </button>
            </form>

            <div className="summary-section dashboard-card fade-in">
              <h2 className="summary-title">Order Summary</h2>

              <div className="cart-items-preview">
                {cart.map((item) => (
                  <div key={item.id} className="preview-item">
                    <img src={item.image} alt={item.name} />
                    <div className="preview-details">
                      <h3>{item.name}</h3>
                      <span className="qty-price">{item.quantity} × ${item.price.toLocaleString()}</span>
                    </div>
                    <span className="preview-total">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="sum-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="sum-row">
                  <span>Tax (8%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <div className="sum-row">
                  <span>Shipping</span>
                  <span className="free">FREE</span>
                </div>
                <div className="sum-row grand-total">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer storeName={storeDetails?.name} />

      <style jsx>{`
        .checkout-page {
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
        .shop-btn {
          margin-top: 20px;
          padding: 14px 40px;
          background: var(--primary);
          color: var(--white);
          border-radius: 12px;
          font-weight: 700;
          transition: var(--transition-smooth);
        }
        .shop-btn:hover {
          background: var(--accent);
          transform: translateY(-2px);
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 40px;
          align-items: start;
        }
        .checkout-form {
          background: var(--white);
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .section-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 10px;
          color: var(--text-main);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 120px;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-main);
        }
        .form-group input, .form-group textarea {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid var(--secondary);
          background: var(--bg-main);
          font-size: 14px;
          outline: none;
          transition: var(--transition-smooth);
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: var(--primary);
          background: var(--white);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.08);
        }
        .error-input {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
        }
        .error-text {
          font-size: 11px;
          color: #ef4444;
          font-weight: 600;
        }
        .submit-order-btn {
          margin-top: 10px;
          padding: 16px;
          background: var(--primary);
          color: var(--white);
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          transition: var(--transition-smooth);
          border: none;
          cursor: pointer;
        }
        .submit-order-btn:hover {
          background: var(--accent);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }
        .submit-order-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .summary-section {
          background: var(--white);
          padding: 40px;
        }
        .summary-title {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--secondary);
          padding-bottom: 12px;
        }
        .cart-items-preview {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }
        .preview-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .preview-item img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          background: var(--bg-main);
        }
        .preview-details {
          flex: 1;
        }
        .preview-details h3 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .qty-price {
          font-size: 12px;
          color: var(--text-sub);
        }
        .preview-total {
          font-weight: 700;
          font-size: 14px;
        }
        .summary-totals {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-top: 1px solid var(--secondary);
          padding-top: 24px;
        }
        .sum-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          color: var(--text-sub);
        }
        .sum-row.grand-total {
          border-top: 1.5px dashed var(--secondary);
          padding-top: 16px;
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
        }
        .free {
          color: #10b981;
          font-weight: 700;
        }
        @media (max-width: 991px) {
          .checkout-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
