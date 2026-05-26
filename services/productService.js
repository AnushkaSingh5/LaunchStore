import { supabaseClient } from '@/lib/supabase';
import { products } from '@/data/mockData';

const compressImage = (file, maxWidth = 800, maxHeight = 800) => {
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

export const productService = {
  /**
   * Fetch all products matching a specific storeId
   */
  getProductsByStore: async (storeId, includeDraft = false) => {
    if (!supabaseClient) return products;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      let url = `${supabaseUrl}/rest/v1/products?store_id=eq.${storeId}&select=*&order=created_at.desc`;
      if (!includeDraft) {
        url += `&status=eq.Published`;
      }

      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();

      // Map schema columns to match dashboard frontend expected properties
      return data.map(p => ({
        ...p,
        image: p.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        images: p.images || [p.image_url],
      }));
    } catch (e) {
      console.error('Error fetching products by store:', e);
      return [];
    }
  },

  /**
   * Fetch a single product details by its ID
   */
  getProductById: async (productId) => {
    if (!supabaseClient) return products.find(p => p.id === parseInt(productId) || p.id === productId) || null;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const url = `${supabaseUrl}/rest/v1/products?id=eq.${productId}&select=*,store:store_id(*),category:category_id(*)`;
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();
      if (!data || data.length === 0) return null;

      const product = data[0];
      return {
        ...product,
        image: product.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
        images: product.images || [product.image_url],
        category: product.category?.name || 'Uncategorized',
      };
    } catch (e) {
      console.error('Error fetching product by ID:', e);
      return null;
    }
  },

  /**
   * Create a new product record
   */
  createProduct: async (productInput) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    
    console.log('[LaunchCart - ProductService] createProduct input:', productInput);
    
    // Convert property names to match active schema columns
    const dbInput = {
      store_id: productInput.store_id,
      category_id: productInput.category_id || null,
      name: productInput.name,
      description: productInput.description || '',
      price: parseFloat(productInput.price) || 0.00,
      image_url: productInput.image || productInput.image_url || '',
      images: productInput.images || [],
      status: productInput.status || 'Published',
      stock: parseInt(productInput.stock) || 0,
      featured: !!productInput.featured,
    };

    console.log('[LaunchCart - ProductService] dbInput mapped:', dbInput);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sessionData = await supabaseClient.auth.getSession();
    const token = sessionData.data.session?.access_token || supabaseAnonKey;

    console.log('[LaunchCart - ProductService] session token found:', !!sessionData.data.session?.access_token);

    const response = await fetch(`${supabaseUrl}/rest/v1/products`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbInput)
    });
    
    console.log('[LaunchCart - ProductService] HTTP POST response status:', response.status);

    if (!response.ok) {
      let errMsg = 'Failed to create product';
      try {
        const errData = await response.json();
        console.error('[LaunchCart - ProductService] Error JSON:', errData);
        errMsg = errData.message || errData.hint || errMsg;
      } catch (_) {
        try {
          const text = await response.text();
          console.error('[LaunchCart - ProductService] Error Text:', text);
          errMsg = text || errMsg;
        } catch (_) {}
      }
      throw new Error(errMsg);
    }
    
    const data = await response.json();
    console.log('[LaunchCart - ProductService] Created response data:', data);
    const created = data[0];
    return {
      ...created,
      image: created.image_url,
      images: created.images
    };
  },

  /**
   * Update existing product record
   */
  updateProduct: async (productId, updateInput) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    
    console.log('[LaunchCart - ProductService] updateProduct input:', { productId, updateInput });

    const dbInput = {
      category_id: updateInput.category_id || null,
      name: updateInput.name,
      description: updateInput.description,
      price: parseFloat(updateInput.price),
      image_url: updateInput.image || updateInput.image_url,
      images: updateInput.images,
      status: updateInput.status,
      stock: parseInt(updateInput.stock),
      featured: !!updateInput.featured,
    };

    // Filter undefined keys
    Object.keys(dbInput).forEach(key => dbInput[key] === undefined && delete dbInput[key]);

    console.log('[LaunchCart - ProductService] dbInput mapped:', dbInput);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sessionData = await supabaseClient.auth.getSession();
    const token = sessionData.data.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbInput)
    });
    
    console.log('[LaunchCart - ProductService] HTTP PATCH response status:', response.status);

    if (!response.ok) {
      let errMsg = 'Failed to update product';
      try {
        const errData = await response.json();
        console.error('[LaunchCart - ProductService] Error JSON:', errData);
        errMsg = errData.message || errData.hint || errMsg;
      } catch (_) {
        try {
          const text = await response.text();
          console.error('[LaunchCart - ProductService] Error Text:', text);
          errMsg = text || errMsg;
        } catch (_) {}
      }
      throw new Error(errMsg);
    }
    
    const data = await response.json();
    console.log('[LaunchCart - ProductService] Updated response data:', data);
    const updated = data[0];
    return {
      ...updated,
      image: updated.image_url,
      images: updated.images
    };
  },

  /**
   * Delete product record
   */
  deleteProduct: async (productId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sessionData = await supabaseClient.auth.getSession();
    const token = sessionData.data.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${productId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    return true;
  },

  /**
   * Upload product image file to product-images storage bucket
   */
  uploadProductImage: async (file, storeId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const fileExt = file.name.split('.').pop();
    const filePath = `${storeId}/product-${Date.now()}.${fileExt}`;

    try {
      const { data, error } = await supabaseClient.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });
        
      if (error) {
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket_not_found')) {
          console.warn('[LaunchCart - Storage] Bucket "product-images" not found. Attempting to create it...');
          try {
            await supabaseClient.storage.createBucket('product-images', { public: true });
            const { data: retryData, error: retryError } = await supabaseClient.storage
              .from('product-images')
              .upload(filePath, file, { upsert: true });
            if (!retryError) {
              const { data: { publicUrl } } = supabaseClient.storage
                .from('product-images')
                .getPublicUrl(filePath);
              return publicUrl;
            }
          } catch (createErr) {
            console.error('[LaunchCart - Storage] Failed to create bucket programmatically:', createErr.message);
          }
        }
        console.warn('[LaunchCart - Storage] Falling back to compressed Base64 data URL for product image.');
        return await compressImage(file, 800, 800);
      }
      
      const { data: { publicUrl } } = supabaseClient.storage
        .from('product-images')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (err) {
      console.warn('[LaunchCart - Storage] Error uploading product image, falling back to Base64:', err.message);
      return await compressImage(file, 800, 800);
    }
  },

  /**
   * Fetch related products (same category and same store)
   */
  getRelatedProducts: async (storeId, categoryName, currentProductId) => {
    if (!supabaseClient) return [];
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const headers = {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      };

      // Find category first
      let categoryId = null;
      try {
        const catUrl = `${supabaseUrl}/rest/v1/categories?store_id=eq.${storeId}&name=eq.${encodeURIComponent(categoryName)}&select=id`;
        const catRes = await fetch(catUrl, { headers });
        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData && catData.length > 0) categoryId = catData[0].id;
        }
      } catch (catErr) {
        console.error('Error matching category in related products:', catErr);
      }

      let url = `${supabaseUrl}/rest/v1/products?store_id=eq.${storeId}&status=eq.Published&id=neq.${currentProductId}&limit=4&select=*`;
      if (categoryId) {
        url += `&category_id=eq.${categoryId}`;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Failed to fetch related products');
      const data = await response.json();

      return data.map(p => ({
        ...p,
        image: p.image_url,
        images: p.images
      }));
    } catch (e) {
      console.error('Error fetching related products:', e);
      return [];
    }
  }
};

export default productService;
