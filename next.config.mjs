/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/dashboard/product',
        destination: '/dashboard/products',
        permanent: true,
      },
      {
        source: '/dashboard/category',
        destination: '/dashboard/categories',
        permanent: true,
      },
      {
        source: '/dashboard/order',
        destination: '/dashboard/orders',
        permanent: true,
      },
      {
        source: '/dashboard/customer',
        destination: '/dashboard/customers',
        permanent: true,
      },
      {
        source: '/dashboard/custoomers',
        destination: '/dashboard/customers',
        permanent: true,
      },
      {
        source: '/dashboard/payment',
        destination: '/dashboard/payments',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
