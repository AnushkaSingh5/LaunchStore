import { supabaseClient } from '@/lib/supabase';
import { categories } from '@/data/mockData';

const compressImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.FileReader || !base64Str || !base64Str.startsWith('data:')) {
      resolve(base64Str || '');
      return;
    }

    const img = new window.Image();
    img.src = base64Str;
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
        resolve(base64Str);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

export const categoryService = {
  /**
   * Fetch all categories belonging to a store
   */
  getCategoriesByStore: async (storeId) => {
    if (!supabaseClient) return categories;
    try {
      const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(c => ({
        ...c,
        title: c.name,
        image: c.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
      }));
    } catch (e) {
      console.error('Error fetching categories:', e);
      return [];
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryInput) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');

    let rawImage = categoryInput.image || categoryInput.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600';
    
    // Automatically compress huge Base64 strings to prevent DB Payload Limit violation
    if (typeof rawImage === 'string' && rawImage.startsWith('data:')) {
      rawImage = await compressImage(rawImage, 400, 400);
    }

    const dbInput = {
      store_id: categoryInput.store_id,
      name: categoryInput.name,
      slug: categoryInput.slug || categoryInput.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      image_url: rawImage,
    };

    const { data, error } = await supabaseClient
      .from('categories')
      .insert([dbInput])
      .select();

    if (error) {
      console.error('[LaunchCart - CategoryService] Error creating category:', error);
      throw new Error(error.message || 'Failed to create category');
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to create category: No data returned.');
    }

    const created = data[0];
    return {
      ...created,
      title: created.name,
      image: created.image_url
    };
  },

  /**
   * Update existing category
   */
  updateCategory: async (categoryId, updateInput) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');

    let rawImage = updateInput.image || updateInput.image_url;
    if (typeof rawImage === 'string' && rawImage.startsWith('data:')) {
      rawImage = await compressImage(rawImage, 400, 400);
    }

    const dbInput = {
      name: updateInput.name,
      slug: updateInput.slug || (updateInput.name ? updateInput.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined),
      image_url: rawImage,
    };

    // Filter undefined keys
    Object.keys(dbInput).forEach(key => dbInput[key] === undefined && delete dbInput[key]);

    const { data, error } = await supabaseClient
      .from('categories')
      .update(dbInput)
      .eq('id', categoryId)
      .select();

    if (error) {
      console.error('[LaunchCart - CategoryService] Error updating category:', error);
      throw new Error(error.message || 'Failed to update category');
    }

    if (!data || data.length === 0) {
      throw new Error('Failed to update category: No data returned.');
    }

    const updated = data[0];
    return {
      ...updated,
      title: updated.name,
      image: updated.image_url
    };
  },

  /**
   * Delete existing category
   */
  deleteCategory: async (categoryId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');

    const { error } = await supabaseClient
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('[LaunchCart - CategoryService] Error deleting category:', error);
      throw new Error(error.message || 'Failed to delete category');
    }
    return true;
  },

  /**
   * Update category sort orders in bulk
   */
  updateCategoriesOrder: async (categoriesList) => {
    if (!supabaseClient) return true;
    try {
      const promises = categoriesList.map(item => 
        supabaseClient
          .from('categories')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      );
      await Promise.all(promises);
      return true;
    } catch (e) {
      console.error('[LaunchCart - CategoryService] Error updating categories sort order:', e);
      throw e;
    }
  }
};

export default categoryService;
