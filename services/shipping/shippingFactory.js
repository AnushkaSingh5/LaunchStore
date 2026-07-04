// services/shipping/shippingFactory.js
import { ShiprocketProvider } from './shiprocketProvider';

class ShippingFactory {
  constructor() {
    this.providers = {
      Shiprocket: new ShiprocketProvider()
    };
  }

  /**
   * Get the configured active shipping provider instance
   */
  getProvider(providerName) {
    const activeProvider = providerName || process.env.NEXT_PUBLIC_ACTIVE_SHIPPING_PROVIDER || 'Shiprocket';
    const provider = this.providers[activeProvider];
    
    if (!provider) {
      console.warn(`⚠️ [ShippingFactory]: Provider "${activeProvider}" not found. Falling back to Shiprocket.`);
      return this.providers['Shiprocket'];
    }
    
    return provider;
  }
}

export const shippingFactory = new ShippingFactory();
export default shippingFactory;
