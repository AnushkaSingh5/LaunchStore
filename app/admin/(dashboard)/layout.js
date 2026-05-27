import AdminLayout from '@/components/Admin/AdminLayout';
import { AdminProvider } from '@/context/AdminContext';

export default function DashboardLayout({ children }) {
  return (
    <AdminProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  );
}
