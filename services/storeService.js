import { products, categories, storeData } from '@/data/mockData';

export const storeService = {
  getProducts: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('dash_products') : null;
      if (saved) {
        resolve(JSON.parse(saved));
      } else {
        setTimeout(() => resolve(products), 100);
      }
    });
  },

  getProductById: async (id) => {
    return new Promise((resolve) => {
      const product = products.find((p) => p.id === parseInt(id));
      setTimeout(() => resolve(product), 100);
    });
  },

  getCategories: async () => {
    return new Promise((resolve) => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('dash_categories') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        // Map dashboard 'name' to storefront 'title'
        const mapped = parsed.map(c => ({
          ...c,
          title: c.name || c.title,
          image: c.image || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600'
        }));
        resolve(mapped);
      } else {
        setTimeout(() => resolve(categories), 100);
      }
    });
  },

  getStoreData: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(storeData), 100);
    });
  },

  getRelatedProducts: async (categoryId, currentProductId) => {
    return new Promise((resolve) => {
      const related = products.filter(
        (p) => p.category === categoryId && p.id !== currentProductId
      );
      setTimeout(() => resolve(related), 100);
    });
  }
};
