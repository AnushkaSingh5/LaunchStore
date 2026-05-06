import { mockDashboardData } from '@/data/mockDashboardData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  getOverviewStats: async () => {
    await delay(500);
    const totalSales = mockDashboardData.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    
    const chartData = [
      { name: '30 Apr', sales: 70 },
      { name: '1 May', sales: 220 },
      { name: '2 May', sales: 200 },
      { name: '3 May', sales: 300 },
      { name: '4 May', sales: 498 },
      { name: '5 May', sales: 250 },
      { name: '6 May', sales: 350 },
    ];

    return {
      totalSales,
      totalOrders: mockDashboardData.orders.length,
      activeProducts: mockDashboardData.products.filter(p => p.status === 'Published').length,
      totalCustomers: mockDashboardData.customers.length,
      recentOrders: mockDashboardData.orders.slice(0, 4),
      chartData
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
