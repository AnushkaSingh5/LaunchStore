export const mockDashboardData = {
  settings: {
    storeName: 'Luxe Modern',
    description: 'Curated modern furniture and home decor for the contemporary lifestyle.',
    showCategories: true,
    showFeatured: true,
    defaultSort: 'newest',
  },
  products: [
    { id: '1', name: 'Modern Coffee Table', category: 'Living Room', price: 450, stock: 12, status: 'Published' },
    { id: '2', name: 'Linen Bedding Set', category: 'Bedroom', price: 199, stock: 45, status: 'Published' },
    { id: '3', name: 'Ceramic Vase', category: 'Decor', price: 85, stock: 0, status: 'Draft' },
    { id: '4', name: 'Velvet Armchair', category: 'Living Room', price: 899, stock: 5, status: 'Published' },
  ],
  categories: [
    { id: '1', name: 'Living Room', productCount: 24 },
    { id: '2', name: 'Bedroom', productCount: 18 },
    { id: '3', name: 'Decor', productCount: 36 },
  ],
  orders: [
    { id: 'ORD-1001', customer: 'Alice Smith', date: '2023-10-25', total: 450, status: 'Delivered' },
    { id: 'ORD-1002', customer: 'Bob Jones', date: '2023-10-26', total: 199, status: 'Shipped' },
    { id: 'ORD-1003', customer: 'Charlie Brown', date: '2023-10-27', total: 899, status: 'Pending' },
    { id: 'ORD-1004', customer: 'Diana Prince', date: '2023-10-27', total: 85, status: 'Cancelled' },
  ],
  customers: [
    { id: 'CUST-1', name: 'Alice Smith', email: 'alice@example.com', phone: '+1 234 567 8900', orders: 3 },
    { id: 'CUST-2', name: 'Bob Jones', email: 'bob@example.com', phone: '+1 234 567 8901', orders: 1 },
    { id: 'CUST-3', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 234 567 8902', orders: 5 },
    { id: 'CUST-4', name: 'Diana Prince', email: 'diana@example.com', phone: '+1 234 567 8903', orders: 0 },
  ],
  payments: {
    enableCard: true,
    enableUPI: false,
    enableCOD: true,
    shippingType: 'flat',
    flatFee: 15,
    shippingHandler: 'platform'
  }
};
