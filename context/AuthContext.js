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

  const fetchWithTimeout = async (url, options = {}, timeoutMs = 15000) => {
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
    const startTime = performance.now();
    console.log(`🔄 [LaunchCart - Auth]: Fetching profile & store details for: "${email}"`);

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
        console.warn('⚠️ [LaunchCart - Auth]: Failed to extract session token:', sessionErr.message);
      }

      // Fetch profile and store in parallel with 15s timeout protection to prevent sequential bottlenecks
      const [profResResult, storeResResult] = await Promise.allSettled([
        fetchWithTimeout(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        }, 15000),
        fetchWithTimeout(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        }, 15000)
      ]);

      // Handle profile response
      let prof = null;
      if (profResResult.status === 'fulfilled') {
        const res = profResResult.value;
        if (res.ok) {
          try {
            const profs = await res.json();
            if (profs && profs.length > 0) prof = profs[0];
          } catch (jsonErr) {
            console.error('❌ [LaunchCart - Auth]: Profile JSON parsing failed:', jsonErr);
          }
        } else {
          console.error(`❌ [LaunchCart - Auth]: Profile HTTP Error ${res.status}:`, res.statusText);
        }
      } else {
        const error = profResResult.reason;
        if (error.name === 'AbortError') {
          console.error('❌ [LaunchCart - Auth]: Profile request timed out (exceeded 15s limit). Network delay.');
        } else {
          console.error('❌ [LaunchCart - Auth]: Profile request network failure:', error.message);
        }
      }

      if (prof) {
        setProfile(prof);
        setRole(prof.role);
      } else {
        console.warn('⚠️ [LaunchCart - Auth]: No profile matched database. Using fallback creator role.');
        setProfile({ id: userId, email, role: 'creator', name: 'New Merchant' });
        setRole('creator');
      }

      // Handle store response
      let str = null;
      if (storeResResult.status === 'fulfilled') {
        const res = storeResResult.value;
        if (res.ok) {
          try {
            const strs = await res.json();
            if (strs && strs.length > 0) str = strs[0];
          } catch (jsonErr) {
            console.error('❌ [LaunchCart - Auth]: Store JSON parsing failed:', jsonErr);
          }
        } else {
          console.error(`❌ [LaunchCart - Auth]: Store HTTP Error ${res.status}:`, res.statusText);
        }
      } else {
        const error = storeResResult.reason;
        if (error.name === 'AbortError') {
          console.error('❌ [LaunchCart - Auth]: Store request timed out (exceeded 15s limit). Network delay.');
        } else {
          console.error('❌ [LaunchCart - Auth]: Store request network failure:', error.message);
        }
      }

      setStore(str);
      const duration = (performance.now() - startTime).toFixed(1);
      console.log(`✅ [LaunchCart - Auth]: Fetched details successfully in ${duration}ms.`);
    } catch (e) {
      console.error('❌ [LaunchCart - Auth]: Exception in fetchRoleAndDetails:', e);
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
      }, 15000);
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
      }, 15000);
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
      console.warn('⚠️ [LaunchCart - Auth]: Retry exceeded 20s fallback. Clearing loading state.');
      setAuthTimeoutError(true);
      setLoading(false);
    }, 20000);

    try {
      if (!supabaseClient) {
        setLoading(false);
        return;
      }
      const { data: { session: activeSession }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError) {
        console.warn('⚠️ [LaunchCart - Auth]: Session retry restoration warning:', sessionError.message);
        if (sessionError.message?.toLowerCase().includes('refresh_token') || sessionError.message?.toLowerCase().includes('refresh token')) {
          try {
            await supabaseClient.auth.signOut();
          } catch (signOutErr) {
            console.warn('[LaunchCart - Auth]: Stale retry session cleanup skipped:', signOutErr.message);
          }
        }
      }

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

    let isSubscribed = true;
    let subscription = null;

    // Check active session on mount with 20s fail-safe fallback to support slow connections
    const bootstrap = async () => {
      const startTime = performance.now();
      console.log('🔄 [LaunchCart - Auth]: Initializing production session restore...');

      const fallbackTimer = setTimeout(() => {
        if (isSubscribed) {
          console.warn('⚠️ [LaunchCart - Auth]: Production bootstrap exceeded 20s minimum timeout fallback. Forcing loading state cleanup.');
          setAuthTimeoutError(true);
          setLoading(false);
        }
      }, 20000);

      try {
        const { data: { session: activeSession }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.warn('⚠️ [LaunchCart - Auth]: Session restoration warning (normal for guest or expired session):', sessionError.message);
          // Auto-clear stale storage to prevent persistent loop warnings in browser console
          if (sessionError.message?.toLowerCase().includes('refresh_token') || sessionError.message?.toLowerCase().includes('refresh token')) {
            try {
              await supabaseClient.auth.signOut();
            } catch (signOutErr) {
              console.warn('[LaunchCart - Auth]: Stale session cleanup skipped:', signOutErr.message);
            }
          }
        }

        if (!isSubscribed) return;

        setSession(activeSession);
        const currentUser = activeSession?.user ?? null;
        setUser(currentUser);

        const duration = (performance.now() - startTime).toFixed(1);
        console.log(`✅ [LaunchCart - Auth]: Session restore complete in ${duration}ms. Active User:`, currentUser?.email || 'Guest');

        if (currentUser) {
          await fetchRoleAndDetails(currentUser.id, currentUser.email);
        }
      } catch (error) {
        console.error('❌ [LaunchCart - Auth]: Error during bootstrap checkSession:', error);
      } finally {
        clearTimeout(fallbackTimer);
        if (isSubscribed) {
          setLoading(false);
        }
      }

      // Set up listener AFTER initial session check is completed to avoid duplicate concurrent query loads
      if (!isSubscribed) return;

      const { data } = supabaseClient.auth.onAuthStateChange(async (event, activeSession) => {
        console.log(`🔔 [LaunchCart - Auth]: Auth state change event fired: "${event}"`);
        
        // Skip INITIAL_SESSION event since bootstrap getSession already handled it
        if (event === 'INITIAL_SESSION') {
          return;
        }

        if (!isSubscribed) return;

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
        setLoading(false);
      });

      subscription = data.subscription;
    };

    bootstrap();

    return () => {
      isSubscribed = false;
      if (subscription) {
        subscription.unsubscribe();
      }
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
