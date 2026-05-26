import { supabaseClient } from '@/lib/supabase';

/**
 * Reusable Supabase Service Layer
 * Scalable stubs and helper wrappers for database operations, storage, and realtime.
 */
export const supabaseService = {
  // 1. DATABASE CRUD OPERATORS (future use)
  db: {
    /**
     * Get records from a table with optional filters
     */
    select: async (table, query = '*') => {
      if (!supabaseClient) throw new Error('Supabase client is not initialized.');
      return await supabaseClient.from(table).select(query);
    },

    /**
     * Insert a record into a table
     */
    insert: async (table, data) => {
      if (!supabaseClient) throw new Error('Supabase client is not initialized.');
      return await supabaseClient.from(table).insert(data).select();
    },

    /**
     * Update existing records matching filters
     */
    update: async (table, matchConditions, updatedData) => {
      if (!supabaseClient) throw new Error('Supabase client is not initialized.');
      return await supabaseClient.from(table).update(updatedData).match(matchConditions).select();
    },

    /**
     * Delete records matching filters
     */
    delete: async (table, matchConditions) => {
      if (!supabaseClient) throw new Error('Supabase client is not initialized.');
      return await supabaseClient.from(table).delete().match(matchConditions).select();
    }
  },

  // 2. STORAGE BUCKET UPLOADS (future use)
  storage: {
    /**
     * Upload an asset file to a public storage bucket
     */
    uploadFile: async (bucket, path, file) => {
      if (!supabaseClient) throw new Error('Supabase client is not initialized.');
      const { data, error } = await supabaseClient.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (error) return { data: null, error };

      // Return public URL
      const { data: { publicUrl } } = supabaseClient.storage.from(bucket).getPublicUrl(path);
      return { data: { publicUrl, ...data }, error: null };
    }
  },

  // 3. REALTIME SUBSCRIPTION CHANNELS (future use)
  realtime: {
    /**
     * Subscribe to live record changes on a table (RLS must be enabled in DB)
     */
    subscribeTable: (table, callback) => {
      if (!supabaseClient) {
        console.warn('Supabase client is not initialized. Cannot listen to realtime events.');
        return null;
      }
      
      const channel = supabaseClient
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          callback(payload);
        })
        .subscribe();

      return channel;
    },

    /**
     * Unsubscribe from an active channel
     */
    unsubscribeChannel: async (channel) => {
      if (channel) {
        await supabaseClient.removeChannel(channel);
      }
    }
  }
};

export default supabaseService;
