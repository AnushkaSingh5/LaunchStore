import { mockDashboardData } from '../data/mockDashboardData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  getOverviewStats: async () => {
    await delay(500);
    const totalSales = mockDashboardData.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    
    return {
      totalSales,
      totalOrders: mockDashboardData.orders.length,
      activeProducts: mockDashboardData.products.filter(p => p.status === 'Published').length,
      totalCustomers: mockDashboardData.customers.length
    };
  },

  getSettings: async () => {
    await delay(300);
    return { ...mockDashboardData.settings };
  },

  updateSettings: async (newSettings) => {
    await delay(600);
    Object.assign(mockDashboardData.settings, newSettings);
    return { success: true };
  },

  getProducts: async () => {
    await delay(400);
    return [...mockDashboardData.products];
  },

  getCategories: async () => {
    await delay(300);
    return [...mockDashboardData.categories];
  },

  getOrders: async () => {
    await delay(500);
    return [...mockDashboardData.orders];
  },

  getCustomers: async () => {
    await delay(400);
    return [...mockDashboardData.customers];
  },

  getPayments: async () => {
    await delay(300);
    return { ...mockDashboardData.payments };
  },

  updatePayments: async (newPayments) => {
    await delay(500);
    Object.assign(mockDashboardData.payments, newPayments);
    return { success: true };
  }
};
