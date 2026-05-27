'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';

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

      // Fetch profile with 4s timeout protection
      let prof = null;
      try {
        const profRes = await fetchWithTimeout(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        }, 4000);
        
        if (profRes.ok) {
          const profs = await profRes.json();
          if (profs && profs.length > 0) prof = profs[0];
        }
      } catch (profErr) {
        console.error('[LaunchCart - Auth]: Profile fetch error/timeout:', profErr);
      }

      if (prof) {
        setProfile(prof);
        setRole(prof.role);
      } else {
        setProfile({ id: userId, email, role: 'creator', name: 'New Merchant' });
        setRole('creator');
      }

      // Fetch store with 4s timeout protection
      let str = null;
      try {
        const storeRes = await fetchWithTimeout(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        }, 4000);
        
        if (storeRes.ok) {
          const strs = await storeRes.json();
          if (strs && strs.length > 0) str = strs[0];
        }
      } catch (storeErr) {
        console.error('[LaunchCart - Auth]: Store fetch error/timeout:', storeErr);
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
    if (!supabaseClient) {
      setLoading(false);
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
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, activeSession) => {
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
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signUp({
      email,
      password,
      options,
    });
  };

  const signIn = async (email, password) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    return await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
  };

  const signOut = async () => {
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
