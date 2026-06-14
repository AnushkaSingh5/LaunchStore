import { PaymentProvider } from './PaymentProvider';

export class RazorpayProvider extends PaymentProvider {
  constructor() {
    super('Razorpay');
    this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  }

  /**
   * Helper to dynamically load the Razorpay checkout script
   */
  loadScript() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Create a Razorpay order by calling the backend API
   */
  async createPaymentOrder(orderId, amount, customerInfo) {
    // 1. Call backend API to create payment order
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          amount,
          customerInfo,
          provider: 'Razorpay'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order on server.');
      }

      const data = await response.json();
      return data; // Expected keys: { id (gateway order id), amount, currency, mock }
    } catch (err) {
      console.warn('⚠️ [RazorpayProvider] Backend order creation failed, falling back to local mock order:', err.message);
      // Fallback local mock order
      return {
        id: `rzp_mock_order_${Date.now()}`,
        amount: amount * 100, // paise
        currency: 'INR',
        mock: true
      };
    }
  }

  /**
   * Verify the payment signature by calling the backend API
   */
  async verifyPaymentSignature(paymentDetails) {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentDetails,
          provider: 'Razorpay'
        })
      });

      if (!response.ok) {
        throw new Error('Signature verification rejected by server.');
      }

      const data = await response.json();
      return data.verified === true;
    } catch (err) {
      console.warn('⚠️ [RazorpayProvider] Server signature verification failed, falling back to local check:', err.message);
      // Fallback for mock payments
      if (paymentDetails.razorpay_payment_id && paymentDetails.razorpay_payment_id.startsWith('pay_mock_')) {
        return true;
      }
      return false;
    }
  }

  /**
   * Normalize payment failure details
   */
  async handlePaymentFailure(errorDetails) {
    return {
      success: false,
      error: errorDetails.description || errorDetails.reason || 'Payment failed or cancelled by user.',
      code: errorDetails.code || 'PAYMENT_FAILED',
      metadata: errorDetails
    };
  }
}
