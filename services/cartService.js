import { supabaseClient } from '@/lib/supabase';

export const cartService = {
  /**
   * Fetch a customer's cart, or create it if it doesn't exist.
   */
  getOrCreateCart: async (customerId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    
    // Check if cart exists
    const { data: cart, error: fetchError } = await supabaseClient
      .from('customer_carts')
      .select('*')
      .eq('customer_id', customerId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (cart) return cart;

    // Create a new cart if not found
    const { data: newCart, error: createError } = await supabaseClient
      .from('customer_carts')
      .insert([{ customer_id: customerId }])
      .select()
      .single();

    if (createError) throw createError;
    return newCart;
  },

  /**
   * Fetch all items in a cart, joining with product and store details.
   */
  getCartItems: async (cartId) => {
    if (!supabaseClient) return [];

    const { data, error } = await supabaseClient
      .from('cart_items')
      .select(`
        id,
        quantity,
        product_id,
        products:product_id (
          id,
          name,
          price,
          image_url,
          stock,
          store_id,
          is_deleted,
          store:store_id (
            slug
          ),
          category:category_id (
            name
          )
        )
      `)
      .eq('cart_id', cartId);

    if (error) throw error;
    
    // Map items to the format expected by the frontend CartContext state
    return (data || []).map(item => {
      const p = item.products;
      if (!p) {
        return {
          id: item.product_id,
          name: 'Deleted Product',
          price: 0,
          image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
          category: 'Uncategorized',
          store_id: null,
          store_slug: '',
          stock: 0,
          quantity: item.quantity,
          is_deleted: true
        };
      }
      return {
        id: p.id,
        name: p.name,
        price: parseFloat(p.price) || 0,
        image: p.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        category: p.category?.name || 'Uncategorized',
        store_id: p.store_id,
        store_slug: p.store?.slug || '',
        stock: p.stock !== undefined ? p.stock : 999,
        quantity: item.quantity,
        is_deleted: p.is_deleted || false
      };
    });
  },

  /**
   * Add or update an item in the database cart.
   */
  addOrUpdateCartItem: async (cartId, productId, quantity) => {
    if (!supabaseClient) return;

    // Verify product's store is approved
    const { data: product, error: prodError } = await supabaseClient
      .from('products')
      .select('store:store_id(status, creator_id)')
      .eq('id', productId)
      .single();
    if (prodError) throw prodError;
    
    if (product?.store?.status !== 'approved') {
      const { data: { user } } = await supabaseClient.auth.getUser().catch(() => ({ data: { user: null } }));
      const isOwner = user?.id && user.id === product.store.creator_id;
      if (!isOwner) {
        throw new Error('This store is currently under admin review and is not available to customers.');
      }
    }

    // Check if the item already exists in the cart
    const { data: existing, error: fetchError } = await supabaseClient
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Update quantity
      const { data, error } = await supabaseClient
        .from('cart_items')
        .update({ quantity })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Insert new item
      const { data, error } = await supabaseClient
        .from('cart_items')
        .insert([{
          cart_id: cartId,
          product_id: productId,
          quantity
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  /**
   * Remove a single item from the database cart.
   */
  removeCartItem: async (cartId, productId) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId)
      .eq('product_id', productId);
    if (error) throw error;
  },

  /**
   * Empty all items in a database cart.
   */
  clearCart: async (cartId) => {
    if (!supabaseClient) return;
    const { error } = await supabaseClient
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);
    if (error) throw error;
  },

  /**
   * Sync/merge the local cart items into the database cart upon customer login.
   * If an item already exists in both, we can either sum quantities or use the local one.
   * We will sum or choose local, then return the fully synced list.
   */
  syncLocalCartToDb: async (cartId, localCartItems) => {
    if (!supabaseClient) return [];
    
    // 1. Fetch current database items
    const dbItems = await cartService.getCartItems(cartId);

    // 2. Merge local items into database
    for (const localItem of localCartItems) {
      const dbItem = dbItems.find(item => item.id === localItem.id);
      const newQty = dbItem ? dbItem.quantity + localItem.quantity : localItem.quantity;
      await cartService.addOrUpdateCartItem(cartId, localItem.id, newQty);
    }

    // 3. Return the fully refreshed items list from database
    return await cartService.getCartItems(cartId);
  }
};
