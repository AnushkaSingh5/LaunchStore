import { mockDashboardData } from '@/data/mockDashboardData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  getOverviewStats: async (timeframe = 'Last 7 Days') => {
    await delay(500);
    const totalSales = mockDashboardData.orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    
    let chartData = [];
    if (timeframe === 'Last 7 Days') {
      chartData = [
        { name: '30 Apr', sales: 70 },
        { name: '1 May', sales: 220 },
        { name: '2 May', sales: 200 },
        { name: '3 May', sales: 300 },
        { name: '4 May', sales: 498 },
        { name: '5 May', sales: 250 },
        { name: '6 May', sales: 350 },
      ];
    } else if (timeframe === 'Last 30 Days') {
      chartData = [
        { name: 'Week 1', sales: 1200 },
        { name: 'Week 2', sales: 1800 },
        { name: 'Week 3', sales: 1400 },
        { name: 'Week 4', sales: 2100 },
      ];
    } else if (timeframe === 'Last 12 Months') {
      chartData = [
        { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 5000 },
        { name: 'Apr', sales: 4500 }, { name: 'May', sales: 6000 }, { name: 'Jun', sales: 5500 },
        { name: 'Jul', sales: 7000 }, { name: 'Aug', sales: 6500 }, { name: 'Sep', sales: 8000 },
        { name: 'Oct', sales: 7500 }, { name: 'Nov', sales: 9000 }, { name: 'Dec', sales: 8500 },
      ];
    } else {
      chartData = [
        { name: '2023', sales: 45000 },
        { name: '2024', sales: 68000 },
        { name: '2025', sales: 82000 },
        { name: '2026', sales: 95000 },
      ];
    }

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
