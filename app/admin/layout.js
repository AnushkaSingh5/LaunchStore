import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminGuard from '@/components/Admin/AdminGuard';

export const metadata = {
  title: 'Platform Admin Dashboard | E-commerce Store',
  description: 'Manage stores, products, orders, and customers across the platform.',
};

export default function Layout({ children }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        {children}
      </AdminGuard>
    </AdminAuthProvider>
  );
}
