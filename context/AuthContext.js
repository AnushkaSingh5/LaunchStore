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

  const refreshStore = async (userId) => {
    if (!supabaseClient || !userId) return;
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const sessionData = await supabaseClient.auth.getSession();
      const token = sessionData.data.session?.access_token || supabaseAnonKey;

      const response = await fetch(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      });
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

      const response = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data && data.length > 0 ? data[0] : null);
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  useEffect(() => {
    if (!supabaseClient) {
      return;
    }

    const fetchRoleAndDetails = async (userId, email) => {
      try {
        if (email?.toLowerCase().includes('admin')) {
          setRole('admin');
          setProfile({ id: userId, email, role: 'admin', name: 'Admin User' });
          return;
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const sessionData = await supabaseClient.auth.getSession();
        const token = sessionData.data.session?.access_token || supabaseAnonKey;

        // Fetch profile
        const profRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        });
        
        let prof = null;
        if (profRes.ok) {
          const profs = await profRes.json();
          if (profs && profs.length > 0) prof = profs[0];
        }

        if (prof) {
          setProfile(prof);
          setRole(prof.role);
        } else {
          setProfile({ id: userId, email, role: 'creator', name: 'New Merchant' });
          setRole('creator');
        }

        // Fetch store
        const storeRes = await fetch(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`
          }
        });
        
        let str = null;
        if (storeRes.ok) {
          const strs = await storeRes.json();
          if (strs && strs.length > 0) str = strs[0];
        }

        setStore(str);
      } catch (e) {
        console.error('Error fetching details:', e);
        setRole('creator');
      }
    };

    // Check active session on mount
    const checkSession = async () => {
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
        setLoading(false);
      }
    };
    checkSession();

    // Listen for session auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, activeSession) => {
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
