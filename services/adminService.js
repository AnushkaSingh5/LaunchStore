import { mockAdminData } from '@/data/mockAdminData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const adminService = {
  getStores: async () => {
    await delay(500);
    return [...mockAdminData.stores];
  },
  
  approveStore: async (id) => {
    await delay(300);
    const index = mockAdminData.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      mockAdminData.stores[index].status = 'Active';
      return { success: true };
    }
    return { success: false };
  },

  rejectStore: async (id) => {
    await delay(300);
    const index = mockAdminData.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      mockAdminData.stores.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },

  disableStore: async (id) => {
    await delay(300);
    const index = mockAdminData.stores.findIndex(s => s.id === id);
    if (index !== -1) {
      mockAdminData.stores[index].status = 'Disabled';
      return { success: true };
    }
    return { success: false };
  },

  getProducts: async () => {
    await delay(400);
    return [...mockAdminData.products];
  },

  removeProduct: async (id) => {
    await delay(300);
    const index = mockAdminData.products.findIndex(p => p.id === id);
    if (index !== -1) {
      mockAdminData.products.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },

  getOrders: async () => {
    await delay(500);
    return [...mockAdminData.orders];
  },

  getCustomers: async () => {
    await delay(400);
    return [...mockAdminData.customers];
  }
};
