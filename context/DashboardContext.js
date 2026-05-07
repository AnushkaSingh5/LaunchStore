'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { dashboardService } from '@/services/dashboardService';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try localStorage first
        const savedCategories = localStorage.getItem('dash_categories');
        const savedProducts = localStorage.getItem('dash_products');
        const savedOrders = localStorage.getItem('dash_orders');
        const savedCustomers = localStorage.getItem('dash_customers');

        if (savedCategories) setCategories(JSON.parse(savedCategories));
        else {
          const data = await dashboardService.getCategories();
          setCategories(data);
        }

        if (savedProducts) setProducts(JSON.parse(savedProducts));
        else {
          const data = await dashboardService.getProducts();
          setProducts(data);
        }

        if (savedOrders) setOrders(JSON.parse(savedOrders));
        else {
          const data = await dashboardService.getOrders();
          setOrders(data);
        }

        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        else {
          const data = await dashboardService.getCustomers();
          setCustomers(data);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('dash_categories', JSON.stringify(categories));
      localStorage.setItem('dash_products', JSON.stringify(products));
      localStorage.setItem('dash_orders', JSON.stringify(orders));
      localStorage.setItem('dash_customers', JSON.stringify(customers));
    }
  }, [categories, products, orders, customers, loading]);

  // Category Actions
  const addCategory = (category) => {
    const normalized = {
      ...category,
      title: category.name,
      slug: category.name.toLowerCase().replace(/\s+/g, '-')
    };
    setCategories(prev => [normalized, ...prev]);
  };

  const updateCategory = (id, updatedData) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Product Actions
  const addProduct = (product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <DashboardContext.Provider value={{
      categories,
      setCategories,
      products,
      setProducts,
      orders,
      setOrders,
      customers,
      setCustomers,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addProduct,
      updateProduct,
      deleteProduct
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
