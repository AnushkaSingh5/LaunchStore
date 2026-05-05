import { products, categories, storeData } from '@/data/mockData';

export const storeService = {
  getProducts: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(products), 100);
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
      setTimeout(() => resolve(categories), 100);
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
