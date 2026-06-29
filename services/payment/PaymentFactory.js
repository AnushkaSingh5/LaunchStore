import { RazorpayProvider } from './RazorpayProvider';
import { CashfreeProvider } from './CashfreeProvider';

class PaymentFactory {
  constructor() {
    this.providers = {
      Razorpay: new RazorpayProvider(),
      Cashfree: new CashfreeProvider(),
    };
  }

  /**
   * Get instance of a payment provider by name
   * @param {string} name - Name of the provider ('Razorpay', 'Cashfree', etc.)
   * @returns {PaymentProvider}
   */
  getProvider(name = process.env.NEXT_PUBLIC_ACTIVE_PAYMENT_PROVIDER || 'Razorpay') {
    const provider = this.providers[name];
    if (!provider) {
      throw new Error(`Payment provider '${name}' is not supported.`);
    }
    return provider;
  }
}

export const paymentFactory = new PaymentFactory();
export default paymentFactory;
