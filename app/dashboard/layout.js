import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { DashboardProvider } from '@/context/DashboardContext';

export default function Layout({ children }) {
  return (
    <DashboardProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardProvider>
  );
}
