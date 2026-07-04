// services/shipping/shippingService.js
import { supabaseClient } from '@/lib/supabase';
import { orderService } from '../orderService';
import { shippingFactory } from './shippingFactory';

// Defensive DB helper to update orders table, handles missing columns
async function safeOrderUpdate(supabase, orderId, payload) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    const isMissingColumnError = 
      err.code === '42703' || 
      err.code === 'PGRST200' || 
      err.code === 'PGRST204' || 
      err.status === 400 ||
      (err.message && (
        err.message.includes('schema cache') || 
        err.message.includes('Could not find the') || 
        err.message.includes('column')
      ));

    if (isMissingColumnError) {
      console.warn('⚠️ [safeOrderUpdate] Some columns do not exist in database orders table. Retrying with basic columns...', err.message);
      const strippedPayload = { ...payload };
      delete strippedPayload.pickup_location_name;
      delete strippedPayload.pickup_location_id;
      delete strippedPayload.customer_phone;
      delete strippedPayload.shipping_address_2;
      delete strippedPayload.shipping_city;
      delete strippedPayload.shipping_state;
      delete strippedPayload.shipping_country;
      delete strippedPayload.shipping_pincode;
      
      const { data, error } = await supabase
        .from('orders')
        .update(strippedPayload)
        .eq('id', orderId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw err;
  }
}

// Defensive DB helper to upsert store_shipping_settings table, handles missing columns
async function safeSettingsUpsert(supabase, payload) {
  try {
    const { data, error } = await supabase
      .from('store_shipping_settings')
      .upsert(payload, { onConflict: 'store_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    const isMissingColumnError = 
      err.code === '42703' || 
      err.code === 'PGRST200' || 
      err.code === 'PGRST204' || 
      err.status === 400 ||
      (err.message && (
        err.message.includes('schema cache') || 
        err.message.includes('Could not find the') || 
        err.message.includes('column')
      ));

    if (isMissingColumnError) {
      console.warn('⚠️ [safeSettingsUpsert] Some columns do not exist in database store_shipping_settings table. Retrying with basic columns...', err.message);
      const strippedPayload = { ...payload };
      delete strippedPayload.pickup_location_name;
      delete strippedPayload.pickup_location_id;
      delete strippedPayload.pickup_contact;
      delete strippedPayload.pickup_phone;
      delete strippedPayload.pickup_email;
      delete strippedPayload.pickup_address;
      delete strippedPayload.pickup_city;
      delete strippedPayload.pickup_state;
      delete strippedPayload.pickup_country;
      delete strippedPayload.pickup_pincode;
      
      const { data, error } = await supabase
        .from('store_shipping_settings')
        .upsert(strippedPayload, { onConflict: 'store_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    throw err;
  }
}

// In-memory fallback for shipping settings during mock/offline testing
let mockStoreShippingSettings = {};

export const shippingService = {
  /**
   * Fetch shipping pickup address settings for a specific store
   */
  getShippingSettings: async (storeId) => {
    if (!storeId) return null;
    
    if (!supabaseClient) {
      console.log(`[shippingService]: Offline mode. Fetching mock shipping settings for store: ${storeId}`);
      return mockStoreShippingSettings[storeId] || {
        warehouse_name: 'Primary Warehouse',
        contact_person: 'Jane Doe',
        email: 'merchant@store.com',
        phone: '9999999999',
        address: '123 Maker Lane, Innovation District',
        pincode: '560001',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        gstin: '29AAAAA0000A1Z5'
      };
    }

    try {
      const { data, error } = await supabaseClient
        .from('store_shipping_settings')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) {
        console.error('❌ [shippingService.getShippingSettings] Error:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.error('❌ [shippingService.getShippingSettings] Exception:', e);
      return null;
    }
  },

  /**
   * Save (upsert) shipping pickup settings for a store
   */
  saveShippingSettings: async (storeId, settings) => {
    if (!storeId) throw new Error('Store ID is required to save settings.');

    // 1. Resolve active shipping provider and register/verify pickup location
    const providerName = process.env.NEXT_PUBLIC_ACTIVE_SHIPPING_PROVIDER || 'Shiprocket';
    const provider = shippingFactory.getProvider(providerName);
    
    let regResult = { lat: null, lon: null, registered: false, pickup_location_name: null, pickup_location_id: null };
    if (provider && typeof provider.addPickupLocation === 'function') {
      try {
        regResult = await provider.addPickupLocation(settings);
      } catch (regErr) {
        console.error('⚠️ [shippingService.saveShippingSettings]: Provider pickup location registration failed:', regErr.message);
        throw new Error(`Shipping provider registration failed: ${regErr.message}`);
      }
    }

    const payload = {
      store_id: storeId,
      warehouse_name: settings.warehouse_name,
      contact_person: settings.contact_person,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
      pincode: settings.pincode,
      city: settings.city,
      state: settings.state,
      country: settings.country || 'India',
      gstin: settings.gstin || null,
      lat: regResult.lat,
      lon: regResult.lon,
      shiprocket_registered: regResult.registered,
      pickup_location_name: regResult.pickup_location_name || null,
      pickup_location_id: regResult.pickup_location_id || null
    };

    if (!supabaseClient) {
      console.log(`[shippingService]: Offline mode. Saving mock shipping settings for store: ${storeId}`);
      mockStoreShippingSettings[storeId] = payload;
      return { ...payload, success: true };
    }

    try {
      const data = await safeSettingsUpsert(supabaseClient, payload);
      return data;
    } catch (e) {
      console.error('❌ [shippingService.saveShippingSettings] Exception:', e);
      throw e;
    }
  },

  /**
   * Create shipment on the active shipping provider for a paid order
   */
  createShipment: async (orderId) => {
    if (!orderId) throw new Error('Order ID is required to create a shipment.');

    try {
      console.log(`🔄 [shippingService.createShipment]: Initializing shipment for Order: ${orderId}...`);
      
      // 1. Fetch order details
      const orderDetails = await orderService.getOrderDetails(orderId);
      if (!orderDetails) {
        throw new Error(`Order ${orderId} details could not be found.`);
      }

      // Pre-Validation: address, pincode, phone, products
      const address = (orderDetails.shipping_address || '').trim();
      const pincode = (orderDetails.shipping_address_pincode || '').trim();
      const phone = (orderDetails.customer_phone || '').trim();
      
      if (!address || address.length < 10) {
        throw new Error('Customer shipping address is too short. Shiprocket requires at least 10 characters to generate shipment.');
      }
      if (!pincode || pincode.replace(/\D/g, '').length !== 6) {
        throw new Error('Customer shipping pincode must be exactly 6 digits.');
      }
      if (!phone || phone.replace(/\D/g, '').length < 10) {
        throw new Error('Customer phone number must be at least 10 digits.');
      }

      // 2. Fetch shipping settings for the store
      const pickupSettings = await shippingService.getShippingSettings(orderDetails.store_id);
      if (!pickupSettings) {
        throw new Error(`Warehouse settings (pickup address) are missing for store ${orderDetails.store_id}. Please configure shipping settings in the Creator dashboard.`);
      }

      // 3. Resolve active shipping provider
      const providerName = process.env.NEXT_PUBLIC_ACTIVE_SHIPPING_PROVIDER || 'Shiprocket';
      const provider = shippingFactory.getProvider(providerName);

      // 4. Call provider to trigger shipment creation
      const result = await provider.createShipment(orderId, orderDetails, pickupSettings);
      
      // 5. Update order details in the database
      if (supabaseClient) {
        const isShipped = result.status === 'Picked Up' || result.status === 'In Transit' || result.status === 'Out For Delivery';
        await safeOrderUpdate(supabaseClient, orderId, {
          shipping_provider: providerName,
          shipment_id: result.shipment_id || null,
          awb_number: result.awb_number || null,
          courier_name: result.courier_name || null,
          tracking_number: result.tracking_number || null,
          tracking_url: result.tracking_url || null,
          shipping_status: result.status || 'Shipment Created',
          estimated_delivery: result.estimated_delivery || null,
          shipped_at: isShipped ? new Date().toISOString() : null,
          delivered_at: result.status === 'Delivered' ? new Date().toISOString() : null,
          pickup_location_name: result.pickup_location_name || null,
          pickup_location_id: result.pickup_location_id || null
        });
      } else {
        // Fallback mock update in memory
        console.log(`✅ [shippingService.createShipment]: Offline mock database sync complete.`);
      }

      console.log(`✅ [shippingService.createShipment]: Shipment created successfully for Order: ${orderId}. AWB: ${result.awb_number}`);
      return result;
    } catch (e) {
      console.error(`❌ [shippingService.createShipment] Failed for Order ${orderId}:`, e.message);
      throw e;
    }
  },

  /**
   * Cancel shipment
   */
  cancelShipment: async (orderId) => {
    if (!orderId) throw new Error('Order ID is required to cancel shipment.');

    try {
      const orderDetails = await orderService.getOrderDetails(orderId);
      if (!orderDetails) throw new Error('Order details not found.');
      if (!orderDetails.shipment_id) throw new Error('No shipment has been created for this order.');

      const provider = shippingFactory.getProvider(orderDetails.shipping_provider);
      await provider.cancelShipment(orderId, orderDetails.shipment_id);

      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('orders')
          .update({ 
            status: 'Cancelled',
            shipping_status: 'Cancelled' 
          })
          .eq('id', orderId);

        if (error) throw error;
      } else {
        // Fallback update order in memory
        console.log(`✅ [shippingService.cancelShipment]: Offline mock database sync complete.`);
        // Find in mock data and update status
        const { orderService } = await import('@/services/orderService');
        await orderService.updateOrderPayment(orderId, { status: 'Cancelled' });
        
        // Manual stock restore for offline mock mode
        const { products } = await import('@/data/mockData');
        if (products && orderDetails.items) {
          for (const item of orderDetails.items) {
            const mockProduct = products.find(p => p.id === item.product_id || p.id === parseInt(item.product_id));
            if (mockProduct) {
              mockProduct.stock = (mockProduct.stock || 0) + (item.quantity || 1);
              console.log(`[Offline Mock]: Restored stock for product ${mockProduct.name} (+${item.quantity}). New stock: ${mockProduct.stock}`);
            }
          }
        }
      }
      
      console.log(`✅ [shippingService.cancelShipment]: Cancelled shipment and restored stock for Order: ${orderId}`);
      return { success: true };
    } catch (e) {
      console.error(`❌ [shippingService.cancelShipment] Failed for Order ${orderId}:`, e.message);
      throw e;
    }
  },

  /**
   * Retrieve tracking updates from the provider and update order status
   */
  syncTrackingStatus: async (orderId) => {
    if (!orderId) throw new Error('Order ID is required to sync tracking.');

    try {
      const orderDetails = await orderService.getOrderDetails(orderId);
      if (!orderDetails) throw new Error('Order details not found.');
      if (!orderDetails.tracking_number) {
        throw new Error('This order has no active AWB or tracking number assigned.');
      }

      const provider = shippingFactory.getProvider(orderDetails.shipping_provider);
      const trackingInfo = await provider.getTrackingStatus(orderDetails.tracking_number);

      if (supabaseClient) {
        const updatePayload = { 
          shipping_status: trackingInfo.status,
          estimated_delivery: trackingInfo.estimated_delivery || null
        };
        
        if (trackingInfo.status === 'Picked Up' || trackingInfo.status === 'In Transit' || trackingInfo.status === 'Out For Delivery') {
          updatePayload.shipped_at = new Date().toISOString();
        }
        
        if (trackingInfo.status === 'Delivered') {
          updatePayload.delivered_at = new Date().toISOString();
        }

        await safeOrderUpdate(supabaseClient, orderId, updatePayload);
      }

      console.log(`🔄 [shippingService.syncTracking]: Synced status for Order ${orderId} as "${trackingInfo.status}"`);
      return trackingInfo;
    } catch (e) {
      console.error(`❌ [shippingService.syncTracking] Failed for Order ${orderId}:`, e.message);
      throw e;
    }
  },

  /**
   * Securely fetch Shipping Label PDF URL
   */
  getLabelUrl: async (orderId) => {
    if (!orderId) throw new Error('Order ID is required to fetch label.');

    try {
      const orderDetails = await orderService.getOrderDetails(orderId);
      if (!orderDetails) throw new Error('Order details not found.');
      if (!orderDetails.shipment_id) throw new Error('No shipment exists for this order.');

      const provider = shippingFactory.getProvider(orderDetails.shipping_provider);
      return await provider.getLabelUrl(orderDetails.shipment_id);
    } catch (e) {
      console.error(`❌ [shippingService.getLabelUrl] Failed for Order ${orderId}:`, e.message);
      throw e;
    }
  }
};

export default shippingService;
