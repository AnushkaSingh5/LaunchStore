'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { mockAdminData } from '@/data/mockAdminData';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemHealth, setSystemHealth] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadData = async () => {
      try {
        const savedStores = localStorage.getItem('admin_stores');
        const savedProducts = localStorage.getItem('admin_products');
        const savedOrders = localStorage.getItem('admin_orders');
        const savedCustomers = localStorage.getItem('admin_customers');
        const savedAnalytics = localStorage.getItem('admin_analytics');
        const savedActivity = localStorage.getItem('admin_activity');
        const savedAlerts = localStorage.getItem('admin_alerts');
        const savedHealth = localStorage.getItem('admin_health');
        const savedAI = localStorage.getItem('admin_ai');

        if (savedStores) setStores(JSON.parse(savedStores));
        else setStores(mockAdminData.stores);

        if (savedProducts) setProducts(JSON.parse(savedProducts));
        else setProducts(mockAdminData.products);

        if (savedOrders) setOrders(JSON.parse(savedOrders));
        else setOrders(mockAdminData.orders);

        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        else setCustomers(mockAdminData.customers);

        if (savedAnalytics) setAnalytics(JSON.parse(savedAnalytics));
        else setAnalytics(mockAdminData.analytics);

        if (savedActivity) setActivity(JSON.parse(savedActivity));
        else setActivity(mockAdminData.activity);

        if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
        else setAlerts(mockAdminData.alerts);

        if (savedHealth) setSystemHealth(JSON.parse(savedHealth));
        else setSystemHealth(mockAdminData.systemHealth);

        if (savedAI) setAiInsights(JSON.parse(savedAI));
        else setAiInsights(mockAdminData.aiInsights);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        localStorage.setItem('admin_stores', JSON.stringify(stores));
        localStorage.setItem('admin_products', JSON.stringify(products));
        localStorage.setItem('admin_orders', JSON.stringify(orders));
        localStorage.setItem('admin_customers', JSON.stringify(customers));
        localStorage.setItem('admin_analytics', JSON.stringify(analytics));
        localStorage.setItem('admin_activity', JSON.stringify(activity));
        localStorage.setItem('admin_alerts', JSON.stringify(alerts));
        localStorage.setItem('admin_health', JSON.stringify(systemHealth));
        localStorage.setItem('admin_ai', JSON.stringify(aiInsights));
      }, 500); // Debounce saves
      return () => clearTimeout(timer);
    }
  }, [stores, products, orders, customers, analytics, activity, alerts, systemHealth, aiInsights, loading]);

  // Actions
  const approveStore = (id) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'Active' } : s));
    const store = stores.find(s => s.id === id);
    if (store) {
      setActivity(prev => [{
        id: Date.now(),
        type: 'approve',
        message: `Store "${store.name}" has been approved`,
        time: 'Just now',
        status: 'success'
      }, ...prev]);
    }
  };

  const rejectStore = (id) => {
    setStores(prev => prev.filter(s => s.id !== id));
  };

  const disableStore = (id) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, status: 'Disabled' } : s));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AdminContext.Provider value={{
      stores,
      products,
      orders,
      customers,
      analytics,
      activity,
      alerts,
      systemHealth,
      aiInsights,
      loading,
      approveStore,
      rejectStore,
      disableStore,
      deleteProduct
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
