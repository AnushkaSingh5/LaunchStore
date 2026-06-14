/**
 * Base abstract class representing a Payment Provider.
 * All future payment integrations (Stripe, PayPal, Cashfree, etc.) must extend this class.
 */
export class PaymentProvider {
  constructor(name) {
    this.name = name; // Name of the provider (e.g., 'Razorpay')
  }

  /**
   * Initialize the payment order on the gateway.
   * @param {string} orderId - The system order ID.
   * @param {number} amount - The total order amount in Rupees.
   * @param {object} customerInfo - Contact details of the customer (name, email, phone).
   * @returns {Promise<object>} Gateway order data (e.g., { gatewayOrderId, amount, currency, ... }).
   */
  async createPaymentOrder(orderId, amount, customerInfo) {
    throw new Error('createPaymentOrder() must be implemented by the subclass.');
  }

  /**
   * Verify the webhook or client-returned signature to ensure payment legitimacy.
   * @param {object} paymentDetails - Verification params returned by the gateway.
   * @returns {Promise<boolean>} True if signature is valid.
   */
  async verifyPaymentSignature(paymentDetails) {
    throw new Error('verifyPaymentSignature() must be implemented by the subclass.');
  }

  /**
   * Handle payment failure, extract reason/metadata.
   * @param {object} errorDetails - Failure details.
   * @returns {object} Normalized error object.
   */
  async handlePaymentFailure(errorDetails) {
    throw new Error('handlePaymentFailure() must be implemented by the subclass.');
  }
}
