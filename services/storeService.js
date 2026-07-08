import { supabaseClient } from '@/lib/supabase';
import { products, categories, storeData } from '@/data/mockData';

const compressImage = (file, maxWidth = 800, maxHeight = 600) => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn('[LaunchCart - Image Compression] Timeout reached. Returning empty string.');
      resolve('');
    }, 4000);

    if (typeof window === 'undefined' || !window.FileReader) {
      clearTimeout(timeout);
      resolve('');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        clearTimeout(timeout);
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
        clearTimeout(timeout);
        resolve(event.target.result); // Fallback to raw base64 if loading image fails
      };
    };
    reader.onerror = () => {
      clearTimeout(timeout);
      resolve('');
    };
  });
};

const runWithTimeoutAndRetry = async (queryFn, maxRetries = 3, timeoutMs = 30000) => {
  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const timeoutPromise = new Promise((_, reject) => {
      const id = setTimeout(() => {
        controller.abort();
        reject(new Error('Database operation timed out. Please try again.'));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([
        queryFn(),
        timeoutPromise
      ]);
      return result;
    } catch (err) {
      console.warn(`⚠️ [LaunchCart - Query] Attempt ${attempt} failed:`, err.message || err);
      
      const isJwtFuture = err.message?.includes('JWT issued at future') || 
                           err.message?.includes('issued at future') ||
                           err.status === 401 ||
                           String(err.code) === 'PGRST301';

      if (attempt < maxRetries) {
        console.log(`🔄 [LaunchCart - Query] Retrying query in 1.5s (Attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        continue;
      }
      throw err;
    }
  }
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
        cache: 'no-store',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'X-Cache-Buster': Date.now().toString()
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
      // Return the store details so that the storefront page can read its status
      // and display the correct blocked screens (Under Review, Unavailable, Disabled) to visitors,
      // or preview mode to the creator.
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
    return runWithTimeoutAndRetry(async () => {
      const { data, error } = await supabaseClient
        .from('stores')
        .insert([storeInput])
        .select()
        .single();
      if (error) throw error;
      return data;
    });
  },

  /**
   * Update existing store configuration
   */
  updateStore: async (storeId, updateData) => {
    if (!supabaseClient) {
      console.warn('[storeService]: Offline mode. Mocking store update.');
      Object.assign(storeData, updateData);
      return storeData;
    }
    return runWithTimeoutAndRetry(async () => {
      const { data, error } = await supabaseClient
        .from('stores')
        .update(updateData)
        .eq('id', storeId)
        .select()
        .single();
      if (error) throw error;
      console.log("Store Updated:", data);
      return data;
    });
  },

  /**
   * Upload logo file to store-assets bucket in Supabase storage
   */
  uploadLogo: async (file, storeId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `stores/${storeId}/logo-${Date.now()}.${fileExt}`;

    let attempt = 0;
    const maxAttempts = 3;
    
    while (attempt < maxAttempts) {
      attempt++;
      try {
        console.log(`[LaunchCart - Storage] Uploading logo (Attempt ${attempt}/${maxAttempts})...`);
        const uploadPromise = supabaseClient.storage
          .from('store-assets')
          .upload(filePath, file, { upsert: true });

        const uploadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Storage upload timed out')), 6000);
        });

        const { data, error } = await Promise.race([
          uploadPromise,
          uploadTimeout
        ]);
          
        if (error) {
          console.warn(`[LaunchCart - Storage] Logo upload attempt ${attempt} error:`, error.message || error);
          
          const isBucketErr = error.message?.includes('Bucket not found') || 
                              error.message?.includes('bucket_not_found') || 
                              error.status === 400 || 
                              error.statusCode === 400 ||
                              error.status === 403 ||
                              error.statusCode === 403;
          
          if (isBucketErr) {
            console.warn('[LaunchCart - Storage] Storage bucket error/not found. Falling back to compressed Base64 data URL immediately.');
            const base64Url = await compressImage(file, 200, 200);
            console.log("Upload Success:", base64Url);
            return base64Url;
          }
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          throw error;
        }
        
        const { data: { publicUrl } } = supabaseClient.storage
          .from('store-assets')
          .getPublicUrl(filePath);
          
        console.log("Upload Success:", publicUrl);
        return publicUrl;
      } catch (err) {
        console.warn(`[LaunchCart - Storage] Exception on logo upload attempt ${attempt}:`, err.message || err);
        
        const isBucketErr = err.message?.includes('Bucket not found') || 
                            err.message?.includes('bucket_not_found') || 
                            err.status === 400 || 
                            err.statusCode === 400 ||
                            err.status === 403 ||
                            err.statusCode === 403;
        
        const isTimeout = err.message?.includes('timed out') || err.message?.includes('timeout');

        if (isBucketErr || isTimeout) {
          console.warn('[LaunchCart - Storage] Storage bucket exception/timeout. Falling back to compressed Base64 data URL immediately.');
          const base64Url = await compressImage(file, 200, 200);
          console.log("Upload Success:", base64Url);
          return base64Url;
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        console.warn('[LaunchCart - Storage] Falling back to compressed Base64 data URL for logo.');
        const base64Url = await compressImage(file, 200, 200);
        console.log("Upload Success:", base64Url);
        return base64Url;
      }
    }
  },

  /**
   * Upload banner file to store-assets bucket in Supabase storage
   */
  uploadBanner: async (file, storeId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `stores/${storeId}/banner-${Date.now()}.${fileExt}`;

    let attempt = 0;
    const maxAttempts = 3;
    
    while (attempt < maxAttempts) {
      attempt++;
      try {
        console.log(`[LaunchCart - Storage] Uploading banner (Attempt ${attempt}/${maxAttempts})...`);
        const uploadPromise = supabaseClient.storage
          .from('store-assets')
          .upload(filePath, file, { upsert: true });

        const uploadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Storage upload timed out')), 6000);
        });

        const { data, error } = await Promise.race([
          uploadPromise,
          uploadTimeout
        ]);
          
        if (error) {
          console.warn(`[LaunchCart - Storage] Banner upload attempt ${attempt} error:`, error.message || error);
          
          const isBucketErr = error.message?.includes('Bucket not found') || 
                              error.message?.includes('bucket_not_found') || 
                              error.status === 400 || 
                              error.statusCode === 400 ||
                              error.status === 403 ||
                              error.statusCode === 403;
          
          if (isBucketErr) {
            console.warn('[LaunchCart - Storage] Storage bucket error/not found. Falling back to compressed Base64 data URL immediately.');
            const base64Url = await compressImage(file, 800, 500);
            console.log("Upload Success:", base64Url);
            return base64Url;
          }
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            continue;
          }
          throw error;
        }
        
        const { data: { publicUrl } } = supabaseClient.storage
          .from('store-assets')
          .getPublicUrl(filePath);
          
        console.log("Upload Success:", publicUrl);
        return publicUrl;
      } catch (err) {
        console.warn(`[LaunchCart - Storage] Exception on banner upload attempt ${attempt}:`, err.message || err);
        
        const isBucketErr = err.message?.includes('Bucket not found') || 
                            err.message?.includes('bucket_not_found') || 
                            err.status === 400 || 
                            err.statusCode === 400 ||
                            err.status === 403 ||
                            err.statusCode === 403;
        
        const isTimeout = err.message?.includes('timed out') || err.message?.includes('timeout');

        if (isBucketErr || isTimeout) {
          console.warn('[LaunchCart - Storage] Storage bucket exception/timeout. Falling back to compressed Base64 data URL immediately.');
          const base64Url = await compressImage(file, 800, 500);
          console.log("Upload Success:", base64Url);
          return base64Url;
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        console.warn('[LaunchCart - Storage] Falling back to compressed Base64 data URL for banner.');
        const base64Url = await compressImage(file, 800, 500);
        console.log("Upload Success:", base64Url);
        return base64Url;
      }
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
