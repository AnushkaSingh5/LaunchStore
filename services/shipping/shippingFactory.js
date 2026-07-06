// services/shipping/shippingFactory.js
import { ShiprocketProvider } from './shiprocketProvider';
import { DelhiveryProvider } from './delhiveryProvider';

class ShippingFactory {
  constructor() {
    this.providers = {
      Shiprocket: new ShiprocketProvider(),
      Delhivery: new DelhiveryProvider()
    };
  }

  /**
   * Get the configured active shipping provider instance
   */
  getProvider(providerName) {
    const activeProvider = providerName || process.env.NEXT_PUBLIC_ACTIVE_SHIPPING_PROVIDER || 'Delhivery';
    const provider = this.providers[activeProvider];
    
    if (!provider) {
      console.warn(`⚠️ [ShippingFactory]: Provider "${activeProvider}" not found. Falling back to Delhivery.`);
      return this.providers['Delhivery'];
    }
    
    return provider;
  }
}

export const shippingFactory = new ShippingFactory();
export default shippingFactory;
