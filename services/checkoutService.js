import { orderService } from './orderService';

export const checkoutService = {
  /**
   * Validate checkout input fields
   */
  validateCheckoutForm: (form) => {
    const errors = {};
    
    if (!form.name || !form.name.trim()) {
      errors.name = 'Full Name is required.';
    }
    
    if (!form.email || !form.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please provide a valid email address.';
    }
    
    if (!form.phone || !form.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s\-()]{7,15}$/.test(form.phone)) {
      errors.phone = 'Please provide a valid phone number.';
    }
    
    if (!form.address || !form.address.trim()) {
      errors.address = 'Shipping address is required.';
    }
    
    if (!form.city || !form.city.trim()) {
      errors.city = 'City is required.';
    }
    
    if (!form.state || !form.state.trim()) {
      errors.state = 'State is required.';
    }
    
    if (!form.pincode || !form.pincode.trim()) {
      errors.pincode = 'Pincode is required.';
    } else if (!/^[0-9a-zA-Z\s\-]{3,10}$/.test(form.pincode)) {
      errors.pincode = 'Please provide a valid pincode.';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Group cart items by their store_id, place distinct orders per merchant, and combine results.
   */
  processCheckout: async (cartItems, customerInfo) => {
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cannot checkout with an empty cart.');
    }

    // Group items by store_id
    const storeGroups = {};
    cartItems.forEach(item => {
      const storeId = item.store_id || 'unknown';
      if (!storeGroups[storeId]) {
        storeGroups[storeId] = [];
      }
      storeGroups[storeId].push(item);
    });

    const results = [];
    const shippingAddressFormatted = `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} - ${customerInfo.pincode}`;

    // Place separate database orders per store group
    for (const storeId of Object.keys(storeGroups)) {
      const items = storeGroups[storeId];
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.08;
      const totalAmount = subtotal + tax; // Free shipping

      const orderData = {
        store_id: storeId === 'unknown' ? null : storeId,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: shippingAddressFormatted,
        total_amount: totalAmount,
        items
      };

      const result = await orderService.createOrder(orderData);
      results.push(result);
    }

    return {
      success: true,
      orders: results
    };
  }
};
