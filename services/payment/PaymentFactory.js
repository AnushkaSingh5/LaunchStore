import { RazorpayProvider } from './RazorpayProvider';

class PaymentFactory {
  constructor() {
    this.providers = {
      Razorpay: new RazorpayProvider(),
    };
  }

  /**
   * Get instance of a payment provider by name
   * @param {string} name - Name of the provider ('Razorpay', etc.)
   * @returns {PaymentProvider}
   */
  getProvider(name = 'Razorpay') {
    const provider = this.providers[name];
    if (!provider) {
      throw new Error(`Payment provider '${name}' is not supported.`);
    }
    return provider;
  }
}

export const paymentFactory = new PaymentFactory();
export default paymentFactory;
