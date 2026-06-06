import { supabaseClient } from '@/lib/supabase';

export const customerService = {
  /**
   * Fetch customer profile from customers table by customer's primary key ID
   */
  getCustomerProfile: async (customerId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetch customer profile by auth_id (Supabase Auth User ID)
   */
  getCustomerProfileByAuthId: async (authId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('customers')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Update customer profile data
   */
  updateCustomerProfile: async (customerId, profileData) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('customers')
      .update(profileData)
      .eq('id', customerId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetch all customer addresses
   */
  getAddresses: async (customerId) => {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new customer address
   */
  createAddress: async (addressData) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    
    // If setting as default, unset other defaults first
    if (addressData.is_default) {
      await supabaseClient
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', addressData.customer_id);
    }

    const { data, error } = await supabaseClient
      .from('customer_addresses')
      .insert([addressData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update an existing customer address
   */
  updateAddress: async (addressId, customerId, addressData) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    
    if (addressData.is_default) {
      await supabaseClient
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);
    }

    const { data, error } = await supabaseClient
      .from('customer_addresses')
      .update(addressData)
      .eq('id', addressId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Delete a customer address
   */
  deleteAddress: async (addressId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { error } = await supabaseClient
      .from('customer_addresses')
      .delete()
      .eq('id', addressId);
    if (error) throw error;
    return true;
  },

  /**
   * Set a specific address as default shipping address
   */
  setDefaultAddress: async (addressId, customerId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    
    // 1. Unset all defaults
    await supabaseClient
      .from('customer_addresses')
      .update({ is_default: false })
      .eq('customer_id', customerId);

    // 2. Set this one as default
    const { data, error } = await supabaseClient
      .from('customer_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default customerService;
