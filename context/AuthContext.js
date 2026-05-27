'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseClient, isSupabaseMockMode } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState('creator');
  const [profile, setProfile] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(() => !supabaseClient ? false : true);
  const [authTimeoutError, setAuthTimeoutError] = useState(false);

  const fetchWithTimeout = async (url, options = {}, timeoutMs = 4000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  const fetchRoleAndDetails = async (userId, email) => {
    try {
      if (email?.toLowerCase().includes('admin')) {
        setRole('admin');
        setProfile({ id: userId, email, role: 'admin', name: 'Admin User' });
        return;
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      let token = supabaseAnonKey;
      try {
        const sessionData = await supabaseClient.auth.getSession();
        token = sessionData.data.session?.access_token || supabaseAnonKey;
      } catch (sessionErr) {
        console.warn('[LaunchCart - Auth]: Failed to fetch active session token, falling back to anon key:', sessionErr);
      }

      // Fetch profile and store in parallel with 3.5s timeout protection to prevent sequential bottlenecks
      const [profResResult, storeResResult] = await Promise.allSettled([
        fetchWithTimeout(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        }, 3500),
        fetchWithTimeout(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        }, 3500)
      ]);

      // Handle profile response
      let prof = null;
      if (profResResult.status === 'fulfilled' && profResResult.value.ok) {
        try {
          const profs = await profResResult.value.json();
          if (profs && profs.length > 0) prof = profs[0];
        } catch (e) {
          console.error('[LaunchCart - Auth]: Error parsing profile json:', e);
        }
      } else if (profResResult.status === 'rejected') {
        console.error('[LaunchCart - Auth]: Profile fetch rejected or timed out:', profResResult.reason);
      }

      if (prof) {
        setProfile(prof);
        setRole(prof.role);
      } else {
        setProfile({ id: userId, email, role: 'creator', name: 'New Merchant' });
        setRole('creator');
      }

      // Handle store response
      let str = null;
      if (storeResResult.status === 'fulfilled' && storeResResult.value.ok) {
        try {
          const strs = await storeResResult.value.json();
          if (strs && strs.length > 0) str = strs[0];
        } catch (e) {
          console.error('[LaunchCart - Auth]: Error parsing store json:', e);
        }
      } else if (storeResResult.status === 'rejected') {
        console.error('[LaunchCart - Auth]: Store fetch rejected or timed out:', storeResResult.reason);
      }

      setStore(str);
    } catch (e) {
      console.error('[LaunchCart - Auth]: General error in fetchRoleAndDetails:', e);
      setRole('creator');
    }
  };

  const refreshStore = async (userId) => {
    if (!supabaseClient || !userId) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const sessionData = await supabaseClient.auth.getSession();
      const token = sessionData.data.session?.access_token || supabaseAnonKey;

      const response = await fetchWithTimeout(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      }, 4000);
      if (response.ok) {
        const data = await response.json();
        setStore(data && data.length > 0 ? data[0] : null);
      }
    } catch (e) {
      console.error('Error refreshing store:', e);
    }
  };

  const refreshProfile = async (userId) => {
    if (!supabaseClient || !userId) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const sessionData = await supabaseClient.auth.getSession();
      const token = sessionData.data.session?.access_token || supabaseAnonKey;

      const response = await fetchWithTimeout(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      }, 4000);
      if (response.ok) {
        const data = await response.json();
        setProfile(data && data.length > 0 ? data[0] : null);
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  const retryAuth = async () => {
    setAuthTimeoutError(false);
    setLoading(true);
    
    if (isSupabaseMockMode()) {
      console.log('[LaunchCart - Auth]: Bypassing retryAuth for mock mode.');
      setLoading(false);
      return;
    }
    
    const fallbackTimer = setTimeout(() => {
      console.warn('[LaunchCart - Auth]: Retry exceeded 6s fallback. Clearing loading state.');
      setAuthTimeoutError(true);
      setLoading(false);
    }, 6000);

    try {
      if (!supabaseClient) {
        setLoading(false);
        return;
      }
      const { data: { session: activeSession } } = await supabaseClient.auth.getSession();
      setSession(activeSession);
      const currentUser = activeSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchRoleAndDetails(currentUser.id, currentUser.email);
      }
    } catch (error) {
      console.error('[LaunchCart - Auth]: Error in retryAuth:', error);
    } finally {
      clearTimeout(fallbackTimer);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabaseClient || isSupabaseMockMode()) {
      // Mock session setup for high availability demo flow
      const loadMockSession = () => {
        console.log('[LaunchCart - Auth]: Supabase is in mock/placeholder mode. Instantly resolving mock creator session.');
        const mockUser = {
          id: 'mock-user-id',
          email: 'anushka.2327cse1234@kiet.edu',
          user_metadata: { name: 'Anushka Singh' }
        };
        setUser(mockUser);
        setSession({ user: mockUser, access_token: 'mock-token' });
        setProfile({ id: 'mock-user-id', name: 'Anushka Singh', role: 'creator' });
        setRole('creator');
        
        const savedStore = typeof window !== 'undefined' ? localStorage.getItem('launchcart_store') : null;
        if (savedStore) {
          setStore(JSON.parse(savedStore));
        } else {
          const defaultStore = {
            id: 'mock-store-id',
            creator_id: 'mock-user-id',
            name: 'Luxe Modern',
            slug: 'luxe-modern',
            description: 'Experience custom curated minimalist designs',
            banner_url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800',
            status: 'active'
          };
          setStore(defaultStore);
          if (typeof window !== 'undefined') {
            localStorage.setItem('launchcart_store', JSON.stringify(defaultStore));
          }
        }
        setLoading(false);
      };

      loadMockSession();
      return;
    }

    // Check active session on mount with 6s fail-safe fallback
    const checkSession = async () => {
      const fallbackTimer = setTimeout(() => {
        console.warn('[LaunchCart - Auth]: Mount checkSession exceeded 6s fallback. Force clearing loading state.');
        setAuthTimeoutError(true);
        setLoading(false);
      }, 6000);

      try {
        const { data: { session: activeSession } } = await supabaseClient.auth.getSession();
        setSession(activeSession);
        const currentUser = activeSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchRoleAndDetails(currentUser.id, currentUser.email);
        }
      } catch (error) {
        console.error('[LaunchCart - Auth]: Error checking active session:', error);
      } finally {
        clearTimeout(fallbackTimer);
        setLoading(false);
      }
    };
    checkSession();

    // Listen for session auth changes with 6s fail-safe fallback
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, activeSession) => {
      // Ignore INITIAL_SESSION in state change listener since checkSession handles it on mount
      if (event === 'INITIAL_SESSION') {
        return;
      }

      const fallbackTimer = setTimeout(() => {
        console.warn('[LaunchCart - Auth]: AuthStateChange handler exceeded 6s fallback. Clearing loading state.');
        setAuthTimeoutError(true);
        setLoading(false);
      }, 6000);

      try {
        setSession(activeSession);
        const currentUser = activeSession?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchRoleAndDetails(currentUser.id, currentUser.email);
        } else {
          setProfile(null);
          setStore(null);
          setRole('creator');
        }
      } catch (error) {
        console.error('[LaunchCart - Auth]: Error in onAuthStateChange:', error);
      } finally {
        clearTimeout(fallbackTimer);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Future authentication wrappers
  const signUp = async (email, password, options = {}) => {
    if (isSupabaseMockMode()) {
      return { data: { user: { id: 'mock-user-id', email } }, error: null };
    }
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signUp({
      email,
      password,
      options,
    });
  };

  const signIn = async (email, password) => {
    if (isSupabaseMockMode()) {
      console.log('[LaunchCart - Auth]: Bypassing signIn for mock mode.');
      const mockUser = {
        id: 'mock-user-id',
        email: email,
        user_metadata: { name: 'Demo User' }
      };
      setUser(mockUser);
      setSession({ user: mockUser, access_token: 'mock-token' });
      
      const is_admin = email.toLowerCase().includes('admin');
      const defaultRole = is_admin ? 'admin' : 'creator';
      setRole(defaultRole);
      
      const mockProfile = { id: 'mock-user-id', name: is_admin ? 'Admin User' : 'Demo User', role: defaultRole };
      setProfile(mockProfile);
      
      if (!is_admin) {
        const savedStore = typeof window !== 'undefined' ? localStorage.getItem('launchcart_store') : null;
        if (savedStore) {
          setStore(JSON.parse(savedStore));
        } else {
          const defaultStore = {
            id: 'mock-store-id',
            creator_id: 'mock-user-id',
            name: 'Luxe Modern',
            slug: 'luxe-modern',
            description: 'Experience custom curated minimalist designs',
            banner_url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800',
            status: 'active'
          };
          setStore(defaultStore);
          if (typeof window !== 'undefined') {
            localStorage.setItem('launchcart_store', JSON.stringify(defaultStore));
          }
        }
      } else {
        setStore(null);
      }
      
      return { data: { user: mockUser, session: { user: mockUser } }, error: null };
    }

    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
    if (isSupabaseMockMode()) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setStore(null);
      setRole('creator');
      return { error: null };
    }
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signOut();
  };

  const value = {
    user,
    session,
    role,
    loading,
    authTimeoutError,
    retryAuth,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
    profile,
    store,
    setStore,
    setProfile,
    refreshStore: () => refreshStore(user?.id),
    refreshProfile: () => refreshProfile(user?.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
