export const mockAdminData = {
  stores: [
    {
      id: 'store-1',
      name: 'Modern Home',
      ownerName: 'Alex Johnson',
      email: 'alex@modernhome.com',
      status: 'Active',
      createdDate: '2026-04-15',
      productsCount: 12,
      ordersCount: 45,
      revenue: 12430.50,
      growth: 24.6
    },
    {
      id: 'store-2',
      name: 'Tech Gadgets',
      ownerName: 'Sarah Smith',
      email: 'sarah@techgadgets.io',
      status: 'Pending',
      createdDate: '2026-05-01',
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
      growth: 0
    },
    {
      id: 'store-3',
      name: 'Outdoor Gear',
      ownerName: 'Mike Miller',
      email: 'mike@outdoorgear.com',
      status: 'Active',
      createdDate: '2026-03-20',
      productsCount: 25,
      ordersCount: 110,
      revenue: 9850.20,
      growth: 18.7
    },
    {
      id: 'store-4',
      name: 'Cozy Knits',
      ownerName: 'Emma Wilson',
      email: 'emma@cozyknits.shop',
      status: 'Active',
      createdDate: '2026-02-10',
      productsCount: 8,
      ordersCount: 32,
      revenue: 5210.80,
      growth: 12.8
    },
    {
      id: 'store-5',
      name: 'Nature Care',
      ownerName: 'David Green',
      email: 'david@naturecare.com',
      status: 'Pending',
      createdDate: '2026-05-08',
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
      growth: 0
    }
  ],
  products: [
    { id: '1', name: 'Ceramic Vase', store: 'Modern Home', category: 'Decor', price: 45, status: 'Published' },
    { id: '2', name: 'Smart Watch', store: 'Tech Gadgets', category: 'Electronics', price: 199, status: 'Draft' },
    { id: '3', name: 'Hiking Boots', store: 'Outdoor Gear', category: 'Footwear', price: 120, status: 'Published' },
    { id: '4', name: 'Wool Scarf', store: 'Cozy Knits', category: 'Accessories', price: 35, status: 'Published' }
  ],
  orders: [
    { id: 'ORD-12548', customer: 'John Doe', store: 'Modern Home', total: 85.50, status: 'Delivered', date: '2026-05-05', time: '10 min ago' },
    { id: 'ORD-12547', customer: 'Jane Smith', store: 'Outdoor Gear', total: 120.00, status: 'Processing', date: '2026-05-07', time: '25 min ago' },
    { id: 'ORD-12546', customer: 'Michael Brown', store: 'Cozy Knits', total: 35.00, status: 'Shipped', date: '2026-05-06', time: '1 hour ago' },
    { id: 'ORD-12545', customer: 'Emily Davis', store: 'Tech World', total: 210.00, status: 'Delivered', date: '2026-05-08', time: '2 hours ago' },
    { id: 'ORD-12544', customer: 'William Lee', store: 'Beauty Bliss', total: 65.20, status: 'Cancelled', date: '2026-05-08', time: '3 hours ago' }
  ],
  customers: [
    { id: 'cust-1', name: 'John Doe', email: 'john@example.com', phone: '+1 234 567 890', totalOrders: 5, totalSpent: '450.00' },
    { id: 'cust-2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1 987 654 321', totalOrders: 3, totalSpent: '320.00' },
    { id: 'cust-3', name: 'Bob Brown', email: 'bob@example.com', phone: '+1 555 666 777', totalOrders: 8, totalSpent: '1,200.00' }
  ],
  analytics: {
    revenueData: [12000, 15000, 13000, 18000, 22000, 28000, 35000],
    ordersData: [450, 520, 480, 610, 750, 890, 1020],
    miniCharts: {
      stores: [10, 15, 12, 18, 20, 25, 24],
      revenue: [30, 45, 35, 55, 65, 80, 75],
      orders: [20, 30, 25, 40, 50, 60, 55],
      creators: [15, 20, 18, 25, 30, 35, 34],
      pending: [5, 10, 8, 12, 15, 20, 23],
      growth: [12, 18, 15, 22, 28, 35, 32]
    }
  },
  activity: [
    { id: 1, type: 'approve', message: 'Store "Tech World" has been approved', time: '2 minutes ago', status: 'success' },
    { id: 2, type: 'product', message: 'New product "Smart Watch X" added by Sarah Smith', time: '8 minutes ago', status: 'info' },
    { id: 3, type: 'creator', message: 'New creator "John Doe" registered', time: '15 minutes ago', status: 'primary' },
    { id: 4, type: 'report', message: 'Product "Wireless Earbuds" reported by a user', time: '25 minutes ago', status: 'warning' },
    { id: 5, type: 'payout', message: 'Payout of $1,250.00 to "Modern Home" processed', time: '1 hour ago', status: 'success' }
  ],
  alerts: [
    { id: 1, title: 'Flagged Products', count: 12, type: 'danger' },
    { id: 2, title: 'Disputes & Complaints', count: 7, type: 'warning' },
    { id: 3, title: 'Failed Payouts', count: 3, type: 'danger' },
    { id: 4, title: 'Suspicious Activities', count: 5, type: 'warning' }
  ],
  systemHealth: [
    { id: 1, name: 'Server Status', status: 'Healthy', color: '#10b981' },
    { id: 2, name: 'Payment Gateway', status: 'Healthy', color: '#10b981' },
    { id: 3, name: 'Database', status: 'Healthy', color: '#10b981' },
    { id: 4, name: 'Delivery Services', status: 'Warning', color: '#f59e0b' }
  ],
  aiInsights: [
    'Orders increased by 18% this week compared to last week.',
    '3 stores are pending approval.',
    'Outdoor Gear category is trending up.',
    '2 creators are inactive for more than 30 days.'
  ]
};
