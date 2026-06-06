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
    return await supabaseClient.auth.signUp({
      email,
      password,
      options: {
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
    return data;
  },

  /**
   * Update active user profile
   */
  updateProfile: async (userId, profileData) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default authService;
