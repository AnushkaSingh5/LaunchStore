import { supabaseClient } from '@/lib/supabase';
import { couponService } from './couponService';

// Memory cache for offline mock orders
let mockOrders = [];

export const orderService = {
  /**
   * Place an order: inserts order record, inserts linked items, and gracefully adjusts product stock levels.
   */
  createOrder: async ({
    store_id,
    customer_id,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_amount,
    items,
    payment_provider = 'Razorpay',
    coupon_id = null,
    coupon_code = null,
    discount_amount = 0
  }) => {
    if (!supabaseClient) {
      console.warn('[orderService]: Offline mode. Mocking order placement success.');
      const mockOrder = {
        id: `ORD-MOCK-${Date.now().toString().slice(-6)}`,
        store_id,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount: parseFloat(total_amount) || 0,
        status: 'pending_payment',
        payment_status: 'pending',
        payment_provider,
        coupon_id: coupon_id || null,
        coupon_code: coupon_code || null,
        discount_amount: parseFloat(discount_amount) || 0,
        created_at: new Date().toISOString(),
        items: (items || []).map(item => ({
          ...item,
          productName: item.name || 'Mock Product',
          productImage: item.image_url || ''
        }))
      };
      mockOrders.push(mockOrder);
      return { ...mockOrder, success: true };
    }

    try {
      // 1. Insert Order
      const insertPayload = {
        store_id,
        customer_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount: parseFloat(total_amount) || 0,
        status: 'pending_payment',
        payment_status: 'pending',
        payment_provider,
        coupon_id: coupon_id || null,
        coupon_code: coupon_code || null,
        discount_amount: parseFloat(discount_amount) || 0
      };

      let result = await supabaseClient
        .from('orders')
        .insert([insertPayload])
        .select()
        .single();

      if (result.error) {
        console.warn('⚠️ [orderService]: Initial order insert failed. Detailed DB response:', JSON.stringify(result.error, null, 2));

        const isCheckConstraintError = result.error.code === '23514';
        const isColumnMissingError = result.error.code === '42703' || result.error.message?.includes('payment_status');

        if (isColumnMissingError || isCheckConstraintError) {
          console.warn('🔄 [orderService]: Falling back to legacy status values (Pending) due to DB constraints or missing columns.');
          const fallbackPayload = {
            store_id,
            customer_id,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            total_amount: parseFloat(total_amount) || 0,
            status: 'Pending',
            coupon_id: coupon_id || null,
            coupon_code: coupon_code || null,
            discount_amount: parseFloat(discount_amount) || 0
          };
          result = await supabaseClient
            .from('orders')
            .insert([fallbackPayload])
            .select()
            .single();
        }
      }

      const { data: order, error: orderErr } = result;
      if (orderErr) {
        console.error('❌ [orderService.createOrder] Failed to create order even after fallbacks. Full response:', JSON.stringify(orderErr, null, 2));
        throw orderErr;
      }

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

      return { ...order, success: true };
    } catch (e) {
      console.error('[orderService]: Place order exception:', e);
      throw e;
    }
  },

  /**
   * Update order payment information safely, checking for database columns presence.
   */
  updateOrderPayment: async (orderId, { paymentStatus, paymentProvider, paymentId, paymentOrderId, status }) => {
    if (!supabaseClient) {
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        if (paymentStatus) order.payment_status = paymentStatus;
        if (paymentProvider) order.payment_provider = paymentProvider;
        if (paymentId) order.payment_id = paymentId;
        if (paymentOrderId) order.payment_order_id = paymentOrderId;
        if (status) order.status = status;
        if (paymentStatus === 'paid' || paymentStatus === 'Paid') {
          order.paid_at = new Date().toISOString();
          if (order.coupon_id) {
            await couponService.incrementCouponUsage(order.coupon_id);
          }
        }
      }
      return { success: true };
    }
    try {
      const updateData = {};
      if (paymentStatus) updateData.payment_status = paymentStatus;
      if (paymentProvider) updateData.payment_provider = paymentProvider;
      if (paymentId) updateData.payment_id = paymentId;
      if (paymentOrderId) updateData.payment_order_id = paymentOrderId;
      if (status) updateData.status = status;
      if (paymentStatus === 'paid' || paymentStatus === 'Paid') {
        updateData.paid_at = new Date().toISOString();
      }

      console.log(`🔄 [orderService.updateOrderPayment] Sending update to order ${orderId}:`, updateData);

      const { data, error } = await supabaseClient
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        console.error('❌ [orderService.updateOrderPayment] Supabase update query error:', JSON.stringify(error, null, 2));

        const isCheckConstraintError = error.code === '23514';
        const isColumnMissingError = error.code === '42703' || error.message?.includes('payment_status');

        // Check if the check constraint violation is due to stock exhaustion trigger
        if (isCheckConstraintError && (status === 'confirmed' || status === 'Confirmed' || error.message?.includes('stock') || error.details?.includes('stock'))) {
          throw new Error('Some products are no longer available in requested quantity.');
        }

        if (isColumnMissingError || isCheckConstraintError) {
          console.warn('🔄 [orderService]: Falling back to legacy status updates...');
          
          const statusUpdate = {};
          if (status) {
            // Map new statuses to old ones if constraint is violated
            if (status === 'confirmed') statusUpdate.status = 'Completed';
            else if (status === 'awaiting_payment') statusUpdate.status = 'Pending';
            else statusUpdate.status = status;
          }

          if (Object.keys(statusUpdate).length > 0) {
            console.log(`🔄 [orderService.updateOrderPayment] Triggering fallback status update:`, statusUpdate);
            const { data: fallbackData, error: fallbackError } = await supabaseClient
              .from('orders')
              .update(statusUpdate)
              .eq('id', orderId)
              .select()
              .single();

            if (fallbackError) {
              console.error('❌ [orderService.updateOrderPayment] Fallback status update failed. Full response:', JSON.stringify(fallbackError, null, 2));
              throw fallbackError;
            }
            
            // Check if coupon increment is needed for fallback update
            if (paymentStatus === 'paid' || paymentStatus === 'Paid') {
              if (fallbackData && fallbackData.coupon_id) {
                await couponService.incrementCouponUsage(fallbackData.coupon_id);
              }
            }
            return { ...fallbackData, success: true, columnsMissing: true };
          }
          return { success: true, columnsMissing: true };
        }
        throw error;
      }

      // Check if coupon increment is needed for normal update
      if (paymentStatus === 'paid' || paymentStatus === 'Paid') {
        if (data && data.coupon_id) {
          await couponService.incrementCouponUsage(data.coupon_id);
        }
      }

      return { ...data, success: true };
    } catch (e) {
      console.error('❌ [orderService]: Error updating order payment:', e);
      throw e;
    }
  },

  /**
   * Fetch all orders belonging to a creator's store
   */
  getCreatorOrders: async (storeId) => {
    if (!supabaseClient) {
      return mockOrders.filter(o => o.store_id === storeId);
    }
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
    if (!supabaseClient) {
      const mockOrder = mockOrders.find(o => o.id === orderId);
      return mockOrder || null;
    }
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
    if (!supabaseClient) {
      const order = mockOrders.find(o => o.id === orderId);
      if (order) {
        order.status = newStatus;
      }
      return order || true;
    }
    try {
      const { data, error } = await supabaseClient
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Handle stock restoration is now handled automatically by the database trigger
      return data;
    } catch (e) {
      console.error('[orderService]: Error updating order status:', e);
      throw e;
    }
  },

  /**
   * Fetch all historical purchases made by a customer's email
   */
  getCustomerOrders: async (customerEmail, customerId = null) => {
    if (!supabaseClient) {
      return mockOrders.filter(o => o.customer_email === customerEmail);
    }
    try {
      let query = supabaseClient
        .from('orders')
        .select('*, store:store_id(name, slug)');
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      } else {
        query = query.eq('customer_email', customerEmail);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('[orderService]: Error fetching customer orders:', e);
      return [];
    }
  }
};

export default orderService;
