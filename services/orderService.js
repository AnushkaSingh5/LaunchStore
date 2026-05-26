import { supabaseClient } from '@/lib/supabase';

export const orderService = {
  /**
   * Place an order: inserts order record, inserts linked items, and gracefully adjusts product stock levels.
   */
  createOrder: async ({
    store_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_amount,
    items
  }) => {
    if (!supabaseClient) {
      console.warn('[orderService]: Offline mode. Mocking order placement success.');
      return { id: `ORD-MOCK-${Date.now().toString().slice(-6)}`, success: true };
    }

    try {
      // 1. Insert Order
      const { data: order, error: orderErr } = await supabaseClient
        .from('orders')
        .insert([{
          store_id,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          total_amount: parseFloat(total_amount) || 0,
          status: 'Pending'
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert Order Items
      const orderItemsInput = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: parseInt(item.quantity) || 1,
        price: parseFloat(item.price) || 0
      }));

      const { error: itemsErr } = await supabaseClient
        .from('order_items')
        .insert(orderItemsInput);

      if (itemsErr) {
        console.error('[orderService]: Failed to insert order items, rolling back order.', itemsErr);
        // Attempt cleanup of orphan order row
        await supabaseClient.from('orders').delete().eq('id', order.id);
        throw itemsErr;
      }

      // 3. Gracefully Adjust Stock Levels
      // Wrapped in individual try-catches since public RLS policies might restrict direct product updates
      for (const item of items) {
        try {
          if (item.stock !== undefined && item.stock !== null) {
            const newStock = Math.max(0, item.stock - item.quantity);
            await supabaseClient
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.id);
          }
        } catch (stockErr) {
          console.warn(`[orderService]: Public stock adjustment skipped for product ${item.id} due to database RLS policies.`, stockErr.message);
        }
      }

      return { ...order, success: true };
    } catch (e) {
      console.error('[orderService]: Place order exception:', e);
      throw e;
    }
  },

  /**
   * Fetch all orders belonging to a creator's store
   */
  getCreatorOrders: async (storeId) => {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[orderService]: Error fetching creator orders:', e);
      return [];
    }
  },

  /**
   * Fetch full details for a single order, including all purchased items
   */
  getOrderDetails: async (orderId) => {
    if (!supabaseClient) return null;
    try {
      const { data: order, error: orderErr } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderErr) throw orderErr;

      // Fetch items joined with product basic details
      const { data: items, error: itemsErr } = await supabaseClient
        .from('order_items')
        .select('*, product:product_id(name, image_url)')
        .eq('order_id', orderId);

      if (itemsErr) throw itemsErr;

      return {
        ...order,
        items: (items || []).map(item => ({
          ...item,
          productName: item.product?.name || 'Deleted Product',
          productImage: item.product?.image_url || ''
        }))
      };
    } catch (e) {
      console.error('[orderService]: Error fetching order details:', e);
      return null;
    }
  },

  /**
   * Update the status of an existing order
   */
  updateOrderStatus: async (orderId, newStatus) => {
    if (!supabaseClient) return true;
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Handle stock restoration if order is cancelled
      if (newStatus === 'Cancelled') {
        try {
          const { data: items } = await supabaseClient
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', orderId);

          if (items && items.length > 0) {
            for (const item of items) {
              const { data: prod } = await supabaseClient
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single();

              if (prod) {
                const restoredStock = (prod.stock || 0) + item.quantity;
                await supabaseClient
                  .from('products')
                  .update({ stock: restoredStock })
                  .eq('id', item.product_id);
              }
            }
          }
        } catch (stockErr) {
          console.warn('[orderService]: Failed to restore stock upon cancellation (RLS restricted or product deleted).', stockErr.message);
        }
      }

      return data;
    } catch (e) {
      console.error('[orderService]: Error updating order status:', e);
      throw e;
    }
  },

  /**
   * Fetch all historical purchases made by a customer's email
   */
  getCustomerOrders: async (customerEmail) => {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('*, store:store_id(name, slug)')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[orderService]: Error fetching customer orders:', e);
      return [];
    }
  }
};
