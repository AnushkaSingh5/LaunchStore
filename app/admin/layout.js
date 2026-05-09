import AdminLayout from '@/components/Admin/AdminLayout';
import { AdminProvider } from '@/context/AdminContext';

export const metadata = {
  title: 'Platform Admin Dashboard | E-commerce Store',
  description: 'Manage stores, products, orders, and customers across the platform.',
};

export default function Layout({ children }) {
  return (
    <AdminProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  );
}
