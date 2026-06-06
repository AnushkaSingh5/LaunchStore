'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { customerService } from '@/services/customerService';
import { useLoading } from '@/components/TopLoader';

const CustomerAuthContext = createContext();

export function CustomerAuthProvider({ children }) {
  const { startLoading, completeLoading } = useLoading();
  const [customer, setCustomer] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch customer profile from public.customers using auth UID
  const fetchCustomerProfile = async (authId) => {
    try {
      const profileData = await customerService.getCustomerProfileByAuthId(authId);
      if (profileData) {
        setCustomerProfile(profileData);
        return profileData;
      }
      return null;
    } catch (err) {
      console.error('❌ [LaunchCart - CustomerAuth]: Error fetching customer profile:', err.message);
      return null;
    }
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
        console.log('🔄 [LaunchCart - CustomerAuth]: loadSession start');
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('🔄 [LaunchCart - CustomerAuth]: getSession done. Session:', session ? 'Yes' : 'No');
        if (session && session.user && isSubscribed) {
          console.log('🔄 [LaunchCart - CustomerAuth]: Fetching customer profile for auth ID:', session.user.id);
          const profileData = await fetchCustomerProfile(session.user.id);
          console.log('🔄 [LaunchCart - CustomerAuth]: fetchCustomerProfile done. profileData:', profileData);
          if (profileData) {
            setCustomer(session.user);
          } else {
            console.log('🔄 [LaunchCart - CustomerAuth]: User has no customer profile. Set as logged out.');
            setCustomer(null);
            setCustomerProfile(null);
          }
        } else {
          console.log('🔄 [LaunchCart - CustomerAuth]: No session or not subscribed.');
          setCustomer(null);
          setCustomerProfile(null);
        }
      } catch (err) {
        console.error('❌ [LaunchCart - CustomerAuth]: Session load failed:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          console.log('✅ [LaunchCart - CustomerAuth]: loadSession finish, loading set to false');
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

      setLoading(true);
      startLoading();
      try {
        if (session && session.user) {
          console.log('🔄 [LaunchCart - CustomerAuth]: Fetching customer profile on state change for auth ID:', session.user.id);
          const profileData = await fetchCustomerProfile(session.user.id);
          console.log('🔄 [LaunchCart - CustomerAuth]: Fetch complete on state change. profileData:', profileData);
          if (profileData) {
            setCustomer(session.user);
          } else {
            console.log('🔄 [LaunchCart - CustomerAuth]: User has no customer profile on state change. Set as logged out.');
            setCustomer(null);
            setCustomerProfile(null);
          }
        } else {
          console.log('🔄 [LaunchCart - CustomerAuth]: No session on state change.');
          setCustomer(null);
          setCustomerProfile(null);
        }
      } catch (err) {
        console.error('❌ [LaunchCart - CustomerAuth]: Auth state change error:', err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
          console.log('✅ [LaunchCart - CustomerAuth]: auth state change finish, loading set to false');
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

      // If signUp doesn't automatically create session (e.g. email verification configuration)
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
      console.error('❌ [LaunchCart - CustomerAuth]: Signup failed:', err);
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
      await supabaseClient.auth.signOut();
      setCustomer(null);
      setCustomerProfile(null);
    } catch (err) {
      console.error('❌ [LaunchCart - CustomerAuth]: Logout failed:', err);
    } finally {
      setLoading(false);
      completeLoading();
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
