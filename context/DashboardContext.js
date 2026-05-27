'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { supabaseClient } from '@/lib/supabase';
import { mockDashboardData } from '@/data/mockDashboardData';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const { store, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const loadStoreData = async () => {
      if (!user) {
        console.log('[LaunchCart - DashboardContext]: No user logged in, setting loading to false');
        setLoading(false);
        return;
      }
      
      if (!store) {
        console.log('[LaunchCart - DashboardContext]: No store found, clearing states and setting loading to false');
        // Clear previous store data
        setCategories([]);
        setProducts([]);
        setOrders([]);
        setCustomers([]);
        setLoading(false);
        return;
      }

      console.log('[LaunchCart - DashboardContext]: Beginning loadStoreData for store:', store.id);
      setLoading(true);
      try {
        if (!supabaseClient) {
          console.log('[LaunchCart - DashboardContext]: Supabase client missing, falling back to mock data');
          // Fallback to mock data if offline
          setCategories(mockDashboardData.categories.map(c => ({ ...c, title: c.name, image: '' })));
          setProducts(mockDashboardData.products.map(p => ({ ...p, image: '', images: [] })));
          setOrders(mockDashboardData.orders);
          setCustomers(mockDashboardData.customers);
          return;
        }

        console.log('[LaunchCart - DashboardContext]: Fetching products and categories from services...');
        // Fetch from Supabase
        const [prodData, catData] = await Promise.all([
          productService.getProductsByStore(store.id, true),
          categoryService.getCategoriesByStore(store.id),
        ]);
        
        console.log('[LaunchCart - DashboardContext]: Fetching orders...');
        // Fetch orders for this store
        const { data: ordData, error: ordErr } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });

        if (ordErr) {
          console.error('[LaunchCart - DashboardContext]: Orders query error:', ordErr);
        }

        const safeProdData = prodData || [];
        const safeCatData = catData || [];
        
        console.log('[LaunchCart - DashboardContext]: Fetched counts:', {
          productsRaw: safeProdData.length,
          categoriesRaw: safeCatData.length,
          ordersRaw: ordData?.length || 0
        });

        const mappedCategories = safeCatData.map(c => {
          const count = safeProdData.filter(p => p.category_id === c.id || p.category === c.name).length;
          return {
            ...c,
            productCount: count,
            status: 'Active'
          };
        });

        const mappedProducts = safeProdData.map(p => {
          const categoryObj = mappedCategories.find(c => c.id === p.category_id);
          return {
            ...p,
            category: categoryObj ? categoryObj.name : 'Uncategorized'
          };
        });

        console.log('[LaunchCart - DashboardContext]: Successfully mapped products and categories.');
        setProducts(mappedProducts);
        setCategories(mappedCategories);
        setOrders(ordData || []);

        // Derive customers from orders
        if (ordData && ordData.length > 0) {
          const uniqueCustomers = [];
          const emailMap = new Set();
          ordData.forEach((order, index) => {
            if (!emailMap.has(order.customer_email)) {
              emailMap.add(order.customer_email);
              uniqueCustomers.push({
                id: `CUST-${index + 1}`,
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone || 'N/A',
                orders: ordData.filter(o => o.customer_email === order.customer_email).length,
              });
            }
          });
          console.log('[LaunchCart - DashboardContext]: Derived customers count:', uniqueCustomers.length);
          setCustomers(uniqueCustomers);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error('[LaunchCart - DashboardContext]: Error loading dashboard data from Supabase:', error);
      } finally {
        console.log('[LaunchCart - DashboardContext]: Finished loading. Setting loading to false');
        setLoading(false);
      }
    };

    loadStoreData();
  }, [store?.id, user?.id]);

  // Category Actions
  const addCategory = async (categoryData) => {
    if (!store) return;
    try {
      const newCat = await categoryService.createCategory({
        ...categoryData,
        store_id: store.id
      });
      const enrichedCat = {
        ...newCat,
        productCount: 0,
        status: 'Active'
      };
      setCategories(prev => [enrichedCat, ...prev]);
    } catch (e) {
      console.error('Error adding category:', e);
      alert('Error adding category: ' + e.message);
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      const updatedCat = await categoryService.updateCategory(id, updatedData);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedCat } : c));
    } catch (e) {
      console.error('Error updating category:', e);
      alert('Error updating category: ' + e.message);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Error deleting category:', e);
      alert('Error deleting category: ' + e.message);
    }
  };

  // Product Actions
  const addProduct = async (productData) => {
    if (!store) {
      console.warn('[LaunchCart - DashboardContext] Attempted to add product, but store was null/undefined');
      return;
    }
    try {
      console.log('[LaunchCart - DashboardContext] addProduct input data:', productData);
      
      // Find category UUID by title if category is represented as string in form
      let categoryId = null;
      if (productData.category) {
        const catObj = categories.find(c => c.title === productData.category || c.name === productData.category);
        if (catObj) categoryId = catObj.id;
      }
      
      console.log('[LaunchCart - DashboardContext] Resolved category ID for product insertion:', categoryId);

      const newProduct = await productService.createProduct({
        ...productData,
        store_id: store.id,
        category_id: categoryId
      });
      
      console.log('[LaunchCart - DashboardContext] Received new product from service:', newProduct);

      // Map string-based category property back for the UI grid to prevent "Uncategorized" display
      const catObj = categories.find(c => c.id === newProduct.category_id);
      const mappedProduct = {
        ...newProduct,
        category: catObj ? (catObj.name || catObj.title) : 'Uncategorized'
      };

      console.log('[LaunchCart - DashboardContext] Prepending mapped product to products list:', mappedProduct);
      setProducts(prev => [mappedProduct, ...prev]);
    } catch (e) {
      console.error('[LaunchCart - DashboardContext] Error in addProduct action:', e);
      alert('Error adding product: ' + e.message);
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      console.log('[LaunchCart - DashboardContext] updateProduct input data:', { id, updatedData });
      
      let categoryId = null;
      if (updatedData.category) {
        const catObj = categories.find(c => c.title === updatedData.category || c.name === updatedData.category);
        if (catObj) categoryId = catObj.id;
      }

      console.log('[LaunchCart - DashboardContext] Resolved category ID for product update:', categoryId);

      const updatedProduct = await productService.updateProduct(id, {
        ...updatedData,
        category_id: categoryId
      });

      console.log('[LaunchCart - DashboardContext] Received updated product from service:', updatedProduct);

      // Map string-based category property back for the UI grid
      const catObj = categories.find(c => c.id === updatedProduct.category_id);
      const mappedProduct = {
        ...updatedProduct,
        category: catObj ? (catObj.name || catObj.title) : 'Uncategorized'
      };

      console.log('[LaunchCart - DashboardContext] Updating product in state products list:', mappedProduct);
      setProducts(prev => prev.map(p => p.id === id ? mappedProduct : p));
    } catch (e) {
      console.error('[LaunchCart - DashboardContext] Error in updateProduct action:', e);
      alert('Error updating product: ' + e.message);
    }
  };

  const deleteProduct = async (id) => {
    try {
      console.log('[LaunchCart - DashboardContext] deleteProduct triggered for product ID:', id);
      await productService.deleteProduct(id);
      console.log('[LaunchCart - DashboardContext] Product successfully deleted in backend. Removing from state list.');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      console.error('[LaunchCart - DashboardContext] Error in deleteProduct action:', e);
      alert('Error deleting product: ' + e.message);
    }
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
