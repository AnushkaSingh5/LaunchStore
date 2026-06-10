'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { customerService } from '@/services/customerService';
import { useLoading } from '@/components/TopLoader';

const CustomerAuthContext = createContext();

export function CustomerAuthProvider({ children }) {
  const { startLoading, completeLoading } = useLoading();
  const [customer, setCustomer] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const initialSessionLoadedRef = useRef(false);

  // Fetch customer profile from public.customers using auth UID
  const fetchCustomerProfile = async (authId) => {
    console.log("Profile fetch started");
    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TimeoutError')), 10000)
        );
        const profileData = await Promise.race([
          customerService.getCustomerProfileByAuthId(authId),
          timeoutPromise
        ]);
        if (profileData) {
          setCustomerProfile(profileData);
          console.log("Profile fetch complete");
          return profileData;
        }
        console.log("Profile fetch complete");
        return null;
      } catch (err) {
        console.warn(`❌ [LaunchCart - CustomerAuth]: Error fetching customer profile (Attempt ${attempt}/${maxAttempts}):`, err.message || err);
        
        const isJwtFuture = err.message?.includes('JWT issued at future') || 
                             err.message?.includes('issued at future') ||
                             err.status === 401 ||
                             String(err.code) === 'PGRST301';

        const isTimeout = err.message === 'TimeoutError';

        // Do not retry on pure timeout to keep startup responsive
        if (isTimeout) {
          console.log("Profile fetch complete");
          return null;
        }

        if (isJwtFuture && attempt < maxAttempts) {
          console.log(`[LaunchCart - CustomerAuth] Retrying profile fetch in 1.5s due to authorization error...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          continue;
        }
        console.log("Profile fetch complete");
        return null;
      }
    }
    console.log("Profile fetch complete");
    return null;
  };

  useEffect(() => {
    if (!supabaseClient) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const loadSession = async () => {
      startLoading();
      try {
        console.log("Session restore started");
        const getSessionTimeout = new Promise((resolve) => {
          setTimeout(() => {
            console.warn('⚠️ [LaunchCart - CustomerAuth]: Initial getSession check timed out after 10s.');
            resolve({ data: { session: null } });
          }, 10000);
        });
        const { data: { session } } = await Promise.race([
          supabaseClient.auth.getSession(),
          getSessionTimeout
        ]);
        console.log("Session restore complete");

        if (session && session.user && isSubscribed) {
          const profileData = await fetchCustomerProfile(session.user.id);
          if (profileData) {
            setCustomer(session.user);
          } else {
            setCustomer(null);
            setCustomerProfile(null);
          }
        } else {
          setCustomer(null);
          setCustomerProfile(null);
        }
      } catch (err) {
        console.warn('❌ [LaunchCart - CustomerAuth]: Session load failed:', err);
      } finally {
        if (isSubscribed) {
          initialSessionLoadedRef.current = true;
          setLoading(false);
        }
        completeLoading();
      }
    };

    loadSession();

    // Listen to Supabase Auth State Changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;

      console.log(`🔑 [LaunchCart - CustomerAuth]: auth state changes: event="${event}"`);

      if (event === 'INITIAL_SESSION') {
        return; // Handled by loadSession
      }

      if (!initialSessionLoadedRef.current) {
        console.log(`🔔 [LaunchCart - CustomerAuth]: onAuthStateChange event "${event}" ignored during initial session load.`);
        return;
      }

      setLoading(true);
      startLoading();
      try {
        if (session && session.user) {
          const profileData = await fetchCustomerProfile(session.user.id);
          if (profileData) {
            setCustomer(session.user);
          } else {
            setCustomer(null);
            setCustomerProfile(null);
          }
        } else {
          setCustomer(null);
          setCustomerProfile(null);
        }
      } catch (err) {
        console.warn('❌ [LaunchCart - CustomerAuth]: Auth state change error:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
        completeLoading();
      }
    });

    return () => {
      isSubscribed = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    setLoading(true);
    startLoading();
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Verify the user is a registered customer
      const profileData = await fetchCustomerProfile(data.user.id);
      if (!profileData) {
        // If not a customer, log out immediately and throw error
        await supabaseClient.auth.signOut();
        setCustomer(null);
        setCustomerProfile(null);
        throw new Error('This account is not registered as a Customer. Please sign up or use a customer account.');
      }

      setCustomer(data.user);
      return { success: true };
    } catch (err) {
      console.error('❌ [LaunchCart - CustomerAuth]: Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  const signup = async (email, password, fullName, phone) => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    setLoading(true);
    startLoading();
    try {
      // 1. Create Supabase Auth User with metadata
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: fullName,
            role: 'customer',
            phone: phone,
          },
        },
      });
      if (error) throw error;

      let user = data.user;
      let session = data.session;

      if (!session) {
        const loginRes = await supabaseClient.auth.signInWithPassword({ email, password });
        if (loginRes.error) throw loginRes.error;
        user = loginRes.data.user;
        session = loginRes.data.session;
      }

      // 2. Fetch customer profile or wait for handle_new_user trigger
      let profileData = null;
      let retries = 5;
      while (retries > 0) {
        const profile = await customerService.getCustomerProfileByAuthId(user.id);
        if (profile) {
          profileData = profile;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        retries--;
      }

      // 3. Fallback: manual insert of customer record if trigger is slow or not set up
      if (!profileData) {
        const { data: newProfile, error: insertErr } = await supabaseClient
          .from('customers')
          .insert([{
            auth_id: user.id,
            full_name: fullName,
            email: email,
            phone: phone,
          }])
          .select()
          .single();
        if (insertErr) throw insertErr;
        profileData = newProfile;
      }

      setCustomer(user);
      setCustomerProfile(profileData);
      return { success: true };
    } catch (err) {
      console.warn('❌ [LaunchCart - CustomerAuth]: Signup failed:', err);
      throw err;
    } finally {
      setLoading(false);
      completeLoading();
    }
  };

  const logout = async () => {
    if (!supabaseClient) throw new Error('Supabase client is not initialized.');
    setLoading(true);
    startLoading();
    try {
      supabaseClient.auth.signOut().catch(err => {
        console.warn('⚠️ [LaunchCart - CustomerAuth]: Background Supabase signOut warning:', err.message || err);
      });
      console.log('✅ [LaunchCart - CustomerAuth]: Supabase signOut triggered in background.');
    } catch (err) {
      console.warn('❌ [LaunchCart - CustomerAuth]: Logout failed:', err);
    } finally {
      setCustomer(null);
      setCustomerProfile(null);
      setLoading(false);
      completeLoading();
      console.log('✅ [LaunchCart - CustomerAuth]: Local customer states cleared.');
    }
  };

  const refreshProfile = async () => {
    if (!customer) return;
    await fetchCustomerProfile(customer.id);
  };

  const value = {
    customer,
    customerProfile,
    loading,
    isAuthenticated: !!customer && !!customerProfile,
    login,
    signup,
    logout,
    refreshProfile,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
