import { supabaseClient } from '@/lib/supabase';
import { products, categories, storeData } from '@/data/mockData';

const compressImage = (file, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.FileReader) {
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target.result); // Fallback to raw base64 if canvas is unsupported
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress as optimized JPEG at 70% quality
      };
      img.onerror = () => {
        resolve(event.target.result); // Fallback to raw base64 if loading image fails
      };
    };
    reader.onerror = () => resolve('');
  });
};

export const storeService = {
  /**
   * Fetch store details dynamically using slug
   */
  getStoreBySlug: async (slug) => {
    if (!supabaseClient) return { ...storeData, slug };
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/rest/v1/stores?slug=eq.${slug}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        console.warn(`[LaunchCart] Store with slug "${slug}" not found in Supabase.`);
        return null;
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        console.warn(`[LaunchCart] Store with slug "${slug}" not found in Supabase.`);
        return null;
      }
      const store = data[0];
      
      // Public storefront strictly requires the store to be approved by admin moderators
      if (store.status !== 'approved') {
        console.warn(`[LaunchCart] Public storefront access denied. Store status: "${store.status}".`);
        return null;
      }

      return {
        ...store,
        name: store.name,
        logo: store.logo_url || '/logo.svg',
        banner: store.banner_url,
      };
    } catch (e) {
      console.error('Error fetching store by slug:', e);
      return null;
    }
  },

  /**
   * Fetch all approved/live stores
   */
  getStores: async () => {
    if (!supabaseClient) return [];
    try {
      const { data, error } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('status', 'approved')
        .order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Error fetching all stores:', e);
      return [];
    }
  },

  /**
   * Fetch creator's store from database
   */
  getStoreByCreator: async (creatorId) => {
    if (!supabaseClient) return null;
    const { data, error } = await supabaseClient
      .from('stores')
      .select('*')
      .eq('creator_id', creatorId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Insert new store configuration
   */
  createStore: async (storeInput) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('stores')
      .insert([storeInput])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Update existing store configuration
   */
  updateStore: async (storeId, updateData) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('stores')
      .update(updateData)
      .eq('id', storeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Upload logo file to store-assets bucket in Supabase storage
   */
  uploadLogo: async (file, creatorId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const fileExt = file.name.split('.').pop();
    const filePath = `${creatorId}/logo-${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabaseClient.storage
        .from('store-assets')
        .upload(filePath, file, { upsert: true });
        
      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket_not_found')) {
          console.warn('[LaunchCart - Storage] Bucket "store-assets" not found. Attempting to create it...');
          try {
            await supabaseClient.storage.createBucket('store-assets', { public: true });
            const { data: retryData, error: retryError } = await supabaseClient.storage
              .from('store-assets')
              .upload(filePath, file, { upsert: true });
            if (!retryError) {
              const { data: { publicUrl } } = supabaseClient.storage
                .from('store-assets')
                .getPublicUrl(filePath);
              return publicUrl;
            }
          } catch (createErr) {
            console.error('[LaunchCart - Storage] Failed to create bucket programmatically:', createErr.message);
          }
        }
        console.warn('[LaunchCart - Storage] Falling back to compressed Base64 data URL for logo.');
        return await compressImage(file, 200, 200); // Lightweight logo compression
      }
      
      const { data: { publicUrl } } = supabaseClient.storage
        .from('store-assets')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err) {
      console.warn('[LaunchCart - Storage] Error uploading logo, falling back to Base64:', err.message);
      return await compressImage(file, 200, 200);
    }
  },

  /**
   * Upload banner file to store-assets bucket in Supabase storage
   */
  uploadBanner: async (file, creatorId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const fileExt = file.name.split('.').pop();
    const filePath = `${creatorId}/banner-${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabaseClient.storage
        .from('store-assets')
        .upload(filePath, file, { upsert: true });
        
      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket_not_found')) {
          console.warn('[LaunchCart - Storage] Bucket "store-assets" not found. Attempting to create it...');
          try {
            await supabaseClient.storage.createBucket('store-assets', { public: true });
            const { data: retryData, error: retryError } = await supabaseClient.storage
              .from('store-assets')
              .upload(filePath, file, { upsert: true });
            if (!retryError) {
              const { data: { publicUrl } } = supabaseClient.storage
                .from('store-assets')
                .getPublicUrl(filePath);
              return publicUrl;
            }
          } catch (createErr) {
            console.error('[LaunchCart - Storage] Failed to create bucket programmatically:', createErr.message);
          }
        }
        console.warn('[LaunchCart - Storage] Falling back to compressed Base64 data URL for banner.');
        return await compressImage(file, 800, 500); // Optimized banner compression
      }
      
      const { data: { publicUrl } } = supabaseClient.storage
        .from('store-assets')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err) {
      console.warn('[LaunchCart - Storage] Error uploading banner, falling back to Base64:', err.message);
      return await compressImage(file, 800, 500);
    }
  },

  // --- BACKWARD COMPATIBILITY STUBS FOR PUBLIC RETAIL SIDEBOARD NAVS ---
  getProducts: async () => {
    return new Promise((resolve) => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('dash_products') : null;
      if (saved) {
        resolve(JSON.parse(saved));
      } else {
        setTimeout(() => resolve(products), 100);
      }
    });
  },

  getProductById: async (id) => {
    return new Promise((resolve) => {
      const product = products.find((p) => p.id === parseInt(id));
      setTimeout(() => resolve(product), 100);
    });
  },

  getCategories: async () => {
    return new Promise((resolve) => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('dash_categories') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        const mapped = parsed.map(c => ({
          ...c,
          title: c.name || c.title,
          image: c.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
        }));
        resolve(mapped);
      } else {
        setTimeout(() => resolve(categories), 100);
      }
    });
  },

  getStoreData: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(storeData), 100);
    });
  },

  getRelatedProducts: async (categoryId, currentProductId) => {
    return new Promise((resolve) => {
      const related = products.filter(
        (p) => p.category === categoryId && p.id !== currentProductId
      );
      setTimeout(() => resolve(related), 100);
    });
  }
};
