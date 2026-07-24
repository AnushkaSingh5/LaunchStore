import { supabaseClient } from '@/lib/supabase';

export const authService = {
  /**
   * Log in a user with email and password
   */
  signIn: async (email, password) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Register a new user and add initial profile metadata
   */
  signUp: async (email, password, name, role = 'creator', phone = null) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const redirectToUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;
    return await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectToUrl,
        data: {
          name,
          role,
          phone,
        },
      },
    });
  },

  /**
   * Log out the active session
   */
  signOut: async () => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signOut();
  },

  /**
   * Fetch active user profile from profiles table
   */
  getProfile: async (userId) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return {
      ...data,
      full_name: data ? data.name : ''
    };
  },

  /**
   * Update active user profile
   */
  updateProfile: async (userId, profileData) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const dbData = { ...profileData };
    if ('full_name' in dbData) {
      dbData.name = dbData.full_name;
      delete dbData.full_name;
    }
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(dbData)
      .eq('id', userId)
      .select()
      .single();
    if (error) {
      console.error('❌ [LaunchCart - authService.updateProfile] Supabase update profile error:', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint
      });
      throw error;
    }
    return {
      ...data,
      full_name: data ? data.name : ''
    };
  },
};

export default authService;
