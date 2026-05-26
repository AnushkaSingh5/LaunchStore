import { supabaseClient } from '@/lib/supabase';
import { categories } from '@/data/mockData';

export const categoryService = {
  /**
   * Fetch all categories belonging to a store
   */
  getCategoriesByStore: async (storeId) => {
    if (!supabaseClient) return categories;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      const url = `${supabaseUrl}/rest/v1/categories?store_id=eq.${storeId}&select=*&order=created_at.desc`;
      const response = await fetch(url, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();

      // Map columns for frontend compatibility
      return data.map(c => ({
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
    
    const dbInput = {
      store_id: categoryInput.store_id,
      name: categoryInput.name,
      slug: categoryInput.slug || categoryInput.name.toLowerCase().replace(/\s+/g, '-'),
      image_url: categoryInput.image || categoryInput.image_url || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sessionData = await supabaseClient.auth.getSession();
    const token = sessionData.data.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/rest/v1/categories`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbInput)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to create category');
    }
    const data = await response.json();
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
    
    const dbInput = {
      name: updateInput.name,
      slug: updateInput.slug || (updateInput.name ? updateInput.name.toLowerCase().replace(/\s+/g, '-') : undefined),
      image_url: updateInput.image || updateInput.image_url,
    };

    // Filter undefined keys
    Object.keys(dbInput).forEach(key => dbInput[key] === undefined && delete dbInput[key]);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sessionData = await supabaseClient.auth.getSession();
    const token = sessionData.data.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${categoryId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(dbInput)
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Failed to update category');
    }
    const data = await response.json();
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const sessionData = await supabaseClient.auth.getSession();
    const token = sessionData.data.session?.access_token || supabaseAnonKey;

    const response = await fetch(`${supabaseUrl}/rest/v1/categories?id=eq.${categoryId}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete category');
    }
    return true;
  }
};

export default categoryService;
