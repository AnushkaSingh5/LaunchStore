import { supabaseClient } from '@/lib/supabase';

// Local mock storage for offline mode testing
let mockCoupons = [
  {
    id: 'mock-coupon-save10',
    store_id: 'aestheticstore-id',
    code: 'SAVE10',
    discount_type: 'percentage',
    discount_value: 10,
    max_uses: 100,
    current_uses: 23,
    minimum_order_amount: 500,
    expiry_date: '2026-12-31T23:59:59Z',
    is_active: true
  },
  {
    id: 'mock-coupon-flat100',
    store_id: 'aestheticstore-id',
    code: 'FLAT100',
    discount_type: 'fixed',
    discount_value: 100,
    max_uses: 50,
    current_uses: 50, // Max uses reached
    minimum_order_amount: 200,
    expiry_date: '2026-12-31T23:59:59Z',
    is_active: true
  },
  {
    id: 'mock-coupon-expired',
    store_id: 'aestheticstore-id',
    code: 'EXPIRED',
    discount_type: 'fixed',
    discount_value: 50,
    max_uses: 10,
    current_uses: 2,
    minimum_order_amount: 0,
    expiry_date: '2020-01-01T00:00:00Z', // Expired
    is_active: true
  }
];

export const couponService = {
  /**
   * Fetch all coupons belonging to a specific store
   */
  getCouponsByStore: async (storeId) => {
    if (!supabaseClient) {
      console.warn('[couponService]: Supabase client offline. Using mock coupons.');
      return mockCoupons.filter(c => c.store_id === storeId);
    }
    try {
      const { data, error } = await supabaseClient
        .from('coupons')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[couponService] getCouponsByStore error:', e);
      return [];
    }
  },

  /**
   * Create a new coupon for a store
   */
  createCoupon: async (couponInput) => {
    // Standardise code to uppercase
    const formattedCode = (couponInput.code || '').toUpperCase().trim();
    if (!formattedCode) throw new Error('Coupon code is required.');

    if (!supabaseClient) {
      const newCoupon = {
        id: `mock-coupon-${Date.now()}`,
        ...couponInput,
        code: formattedCode,
        current_uses: 0,
        discount_value: parseFloat(couponInput.discount_value) || 0,
        max_uses: parseInt(couponInput.max_uses) || 0,
        minimum_order_amount: parseFloat(couponInput.minimum_order_amount) || 0,
        created_at: new Date().toISOString()
      };
      
      // Duplicate check in mock storage
      const exists = mockCoupons.some(c => c.store_id === couponInput.store_id && c.code === formattedCode);
      if (exists) throw new Error('Coupon code already exists in this store.');

      mockCoupons.push(newCoupon);
      return newCoupon;
    }

    // Uniqueness check
    const { data: existing } = await supabaseClient
      .from('coupons')
      .select('id')
      .eq('store_id', couponInput.store_id)
      .eq('code', formattedCode)
      .maybeSingle();

    if (existing) {
      throw new Error('Coupon code already exists in this store.');
    }

    const dbInput = {
      store_id: couponInput.store_id,
      code: formattedCode,
      discount_type: couponInput.discount_type,
      discount_value: parseFloat(couponInput.discount_value),
      max_uses: parseInt(couponInput.max_uses) || 0,
      minimum_order_amount: parseFloat(couponInput.minimum_order_amount) || 0,
      expiry_date: couponInput.expiry_date || null,
      is_active: couponInput.is_active !== undefined ? couponInput.is_active : true
    };

    const { data, error } = await supabaseClient
      .from('coupons')
      .insert([dbInput])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update coupon configurations
   */
  updateCoupon: async (couponId, updateInput) => {
    let formattedCode = undefined;
    if (updateInput.code) {
      formattedCode = updateInput.code.toUpperCase().trim();
    }

    if (!supabaseClient) {
      const idx = mockCoupons.findIndex(c => c.id === couponId);
      if (idx === -1) throw new Error('Coupon not found.');

      if (formattedCode && formattedCode !== mockCoupons[idx].code) {
        const exists = mockCoupons.some(c => c.store_id === mockCoupons[idx].store_id && c.code === formattedCode);
        if (exists) throw new Error('Coupon code already exists in this store.');
      }

      const updated = {
        ...mockCoupons[idx],
        ...updateInput,
        code: formattedCode !== undefined ? formattedCode : mockCoupons[idx].code,
        discount_value: updateInput.discount_value !== undefined ? parseFloat(updateInput.discount_value) : mockCoupons[idx].discount_value,
        max_uses: updateInput.max_uses !== undefined ? parseInt(updateInput.max_uses) : mockCoupons[idx].max_uses,
        minimum_order_amount: updateInput.minimum_order_amount !== undefined ? parseFloat(updateInput.minimum_order_amount) : mockCoupons[idx].minimum_order_amount
      };

      mockCoupons[idx] = updated;
      return updated;
    }

    // Check code uniqueness if code is updated
    if (formattedCode) {
      const { data: currentCoupon } = await supabaseClient
        .from('coupons')
        .select('store_id, code')
        .eq('id', couponId)
        .single();
        
      if (currentCoupon && currentCoupon.code !== formattedCode) {
        const { data: existing } = await supabaseClient
          .from('coupons')
          .select('id')
          .eq('store_id', currentCoupon.store_id)
          .eq('code', formattedCode)
          .maybeSingle();

        if (existing) {
          throw new Error('Coupon code already exists in this store.');
        }
      }
    }

    const dbInput = {
      code: formattedCode,
      discount_type: updateInput.discount_type,
      discount_value: updateInput.discount_value !== undefined ? parseFloat(updateInput.discount_value) : undefined,
      max_uses: updateInput.max_uses !== undefined ? parseInt(updateInput.max_uses) : undefined,
      minimum_order_amount: updateInput.minimum_order_amount !== undefined ? parseFloat(updateInput.minimum_order_amount) : undefined,
      expiry_date: updateInput.expiry_date,
      is_active: updateInput.is_active
    };

    // Clean undefined values
    Object.keys(dbInput).forEach(key => dbInput[key] === undefined && delete dbInput[key]);

    const { data, error } = await supabaseClient
      .from('coupons')
      .update(dbInput)
      .eq('id', couponId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete coupon record
   */
  deleteCoupon: async (couponId) => {
    if (!supabaseClient) {
      mockCoupons = mockCoupons.filter(c => c.id !== couponId);
      return true;
    }

    const { error } = await supabaseClient
      .from('coupons')
      .delete()
      .eq('id', couponId);

    if (error) throw error;
    return true;
  },

  /**
   * Validate coupon eligibility during checkout
   */
  validateCoupon: async ({ storeId, code, subtotal }) => {
    const formattedCode = (code || '').toUpperCase().trim();
    if (!formattedCode) {
      return { isValid: false, message: 'Please enter a coupon code.' };
    }

    let coupon = null;

    if (!supabaseClient) {
      // Offline fallback lookup
      coupon = mockCoupons.find(c => (c.store_id === storeId || storeId === 'aestheticstore-id') && c.code === formattedCode);
    } else {
      try {
        const { data, error } = await supabaseClient
          .from('coupons')
          .select('*')
          .eq('store_id', storeId)
          .eq('code', formattedCode)
          .maybeSingle();

        if (error) throw error;
        coupon = data;
      } catch (err) {
        console.error('[couponService] Error fetching coupon for validation:', err);
      }
    }

    if (!coupon) {
      return { isValid: false, message: 'Invalid coupon code.' };
    }

    if (!coupon.is_active) {
      return { isValid: false, message: 'This coupon is inactive.' };
    }

    // Expiry Check
    if (coupon.expiry_date) {
      const expiry = new Date(coupon.expiry_date);
      if (expiry < new Date()) {
        return { isValid: false, message: 'Coupon expired.' };
      }
    }

    // Usage Limit Check
    if (coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses) {
      return { isValid: false, message: 'This coupon has reached its usage limit.' };
    }

    // Minimum Order Amount Check
    if (coupon.minimum_order_amount > 0 && subtotal < coupon.minimum_order_amount) {
      return { 
        isValid: false, 
        message: `Minimum order amount of ₹${coupon.minimum_order_amount.toLocaleString()} required.` 
      };
    }

    return {
      isValid: true,
      coupon
    };
  },

  /**
   * Increment coupon current_uses usage count
   */
  incrementCouponUsage: async (couponId) => {
    if (!supabaseClient) {
      const idx = mockCoupons.findIndex(c => c.id === couponId);
      if (idx !== -1) {
        mockCoupons[idx].current_uses += 1;
        console.log(`[couponService - Mock]: Incremented coupon ${couponId} uses to ${mockCoupons[idx].current_uses}`);
      }
      return true;
    }

    try {
      // Call Supabase RPC or directly update using atomic increment query
      const { data: currentData } = await supabaseClient
        .from('coupons')
        .select('current_uses')
        .eq('id', couponId)
        .single();
        
      if (currentData) {
        await supabaseClient
          .from('coupons')
          .update({ current_uses: (currentData.current_uses || 0) + 1 })
          .eq('id', couponId);
      }
      return true;
    } catch (e) {
      console.error('[couponService] Error incrementing coupon usage:', e);
      return false;
    }
  },

  /**
   * Fetch all coupons across the entire platform (Admin monitoring)
   */
  getAllCoupons: async () => {
    if (!supabaseClient) {
      return mockCoupons.map(c => ({
        ...c,
        store: 'Mock Aesthetic Store'
      }));
    }
    try {
      const { data, error } = await supabaseClient
        .from('coupons')
        .select('*, store:store_id(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(c => ({
        ...c,
        store: c.store?.name || 'Unknown Store'
      }));
    } catch (e) {
      console.error('[couponService] getAllCoupons error:', e);
      return [];
    }
  }
};

export default couponService;
