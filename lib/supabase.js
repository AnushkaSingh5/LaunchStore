import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Scalable client state initialization
let supabase = null;

// Gracefully handle missing or default placeholder credentials to prevent runtime crashes during initial setup
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ [LaunchCart - Supabase]: Missing environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY). Please configure them in your .env.local file.'
  );
} else if (
  supabaseUrl.includes('your-project-id') || 
  supabaseAnonKey.includes('mockAnonKeyHere')
) {
  console.warn(
    'ℹ️ [LaunchCart - Supabase]: Supabase client loaded with mock environment variables. Please replace them with actual Supabase project keys in .env.local for full backend features.'
  );
}

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        ...(typeof window === 'undefined' || !navigator?.locks ? {
          lock: async (_name, _acquireTimeout, fn) => {
            return await fn();
          }
        } : {})
      },
    });
  }
} catch (error) {
  console.error('❌ [LaunchCart - Supabase]: Failed to initialize Supabase client:', error.message);
}

// Export configured global client and a helper to check connection status
export const supabaseClient = supabase;

export const checkSupabaseConnection = () => {
  if (!supabase) {
    return {
      connected: false,
      error: 'Client not initialized due to missing or invalid credentials.',
    };
  }
  return {
    connected: true,
    message: 'Supabase client initialized successfully.',
    projectUrl: supabaseUrl,
  };
};

export default supabaseClient;
