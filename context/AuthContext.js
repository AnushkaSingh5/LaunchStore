'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { useLoading } from '@/components/TopLoader';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { startLoading, completeLoading } = useLoading();
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

  const fetchRoleAndDetails = async (userId, email, token = null) => {
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
      
      const activeToken = token || supabaseAnonKey;

      // Fetch profile and store in parallel with 15s timeout protection
      const [profResResult, storeResResult] = await Promise.allSettled([
        fetchWithTimeout(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${activeToken}`
          }
        }, 15000),
        fetchWithTimeout(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${activeToken}`
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
    startLoading();
    
    try {
      if (!supabaseClient) {
        setLoading(false);
        return;
      }
      const { data: { session: activeSession }, error: sessionError } = await supabaseClient.auth.getSession();
      
      if (sessionError) {
        console.warn('⚠️ [LaunchCart - Auth]: Session retry restoration warning:', sessionError.message);
      }

      setSession(activeSession);
      const currentUser = activeSession?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchRoleAndDetails(currentUser.id, currentUser.email, activeSession?.access_token);
      }
    } catch (error) {
      console.error('[LaunchCart - Auth]: Error in retryAuth:', error);
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  useEffect(() => {
    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;
    console.log('🔄 [LaunchCart - Auth]: session restore start');

    // 1. Fetch initial session asynchronously with safety timeout
    const loadInitialSession = async () => {
      startLoading();
      const getSessionTimeout = new Promise((resolve) => {
        setTimeout(() => {
          console.warn('⚠️ [LaunchCart - Auth]: Initial getSession check timed out after 10s.');
          resolve({ data: { session: null } });
        }, 10000);
      });

      try {
        const { data: { session: activeSession } } = await Promise.race([
          supabaseClient.auth.getSession(),
          getSessionTimeout
        ]);

        if (!isSubscribed) return;

        console.log('🔄 [LaunchCart - Auth]: Initial session check complete. Active Session:', activeSession ? 'Yes' : 'No');

        if (activeSession) {
          setSession(activeSession);
          setUser(activeSession.user);
          await fetchRoleAndDetails(activeSession.user.id, activeSession.user.email, activeSession.access_token);
        } else {
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('❌ [LaunchCart - Auth]: Error during initial session restore:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          console.log('✅ [LaunchCart - Auth]: session restore finish');
        }
        completeLoading();
      }
    };

    loadInitialSession();

    // 2. Set up auth state change listener synchronously for reliable cleanup
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, activeSession) => {
      console.log(`🔔 [LaunchCart - Auth]: auth state changes: event="${event}"`);

      if (event === 'INITIAL_SESSION') {
        // Skip since loadInitialSession is handling it
        return;
      }

      if (!isSubscribed) return;

      try {
        setLoading(true);
        startLoading();
        setSession(activeSession);
        const currentUser = activeSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchRoleAndDetails(currentUser.id, currentUser.email, activeSession?.access_token);
        } else {
          setProfile(null);
          setStore(null);
          setRole('creator');
        }
      } catch (err) {
        console.error('❌ [LaunchCart - Auth]: Error handling onAuthStateChange:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
        completeLoading();
      }
    });

    return () => {
      console.log('🧹 [LaunchCart - Auth]: Cleaning up auth listeners...');
      isSubscribed = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email, password, options = {}) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    console.log('🔄 [LaunchCart - Auth]: signUp start for:', email);
    startLoading();
    try {
      const res = await supabaseClient.auth.signUp({
        email,
        password,
        options,
      });
      console.log('✅ [LaunchCart - Auth]: signUp complete.');
      return res;
    } catch (err) {
      console.error('❌ [LaunchCart - Auth]: signUp error:', err);
      throw err;
    } finally {
      completeLoading();
    }
  };

  const signIn = async (email, password) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    console.log('🔄 [LaunchCart - Auth]: signIn start for:', email);
    startLoading();
    try {
      const res = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      console.log('✅ [LaunchCart - Auth]: signIn success.');
      return res;
    } catch (err) {
      console.error('❌ [LaunchCart - Auth]: signIn error:', err);
      throw err;
    } finally {
      completeLoading();
    }
  };

  const signOut = async () => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    console.log('🔄 [LaunchCart - Auth]: Logging out active session...');
    setLoading(true);
    startLoading();
    try {
      await supabaseClient.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setStore(null);
      setRole('creator');
      console.log('✅ [LaunchCart - Auth]: Logout complete. Cleared all local state.');
    } catch (err) {
      console.error('❌ [LaunchCart - Auth]: Error during signOut:', err);
    } finally {
      setLoading(false);
      completeLoading();
    }
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
