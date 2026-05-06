'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    if (window.innerWidth <= 1024) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setDesktopCollapsed(!isDesktopCollapsed);
    }
  };
  const closeSidebar = () => setSidebarOpen(false);

  // Derive title and breadcrumbs from pathname
  const getHeaderInfo = () => {
    if (pathname === '/dashboard') return { title: 'Overview', breadcrumbs: null };
    
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];
    const title = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
    
    // Simple breadcrumb logic for now
    const breadcrumbs = [
      { label: 'Dashboard', path: '/dashboard' },
      { label: title, path: pathname, active: true }
    ];
    
    return { title, breadcrumbs };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isCollapsed={isDesktopCollapsed} onToggle={toggleSidebar} />
      <div className={`${styles.mainWrapper} ${isDesktopCollapsed ? styles.fullWidth : ''}`}>
        <Navbar 
          onMenuClick={toggleSidebar} 
          title={headerInfo.title} 
          breadcrumbs={headerInfo.breadcrumbs}
          isSidebarCollapsed={isDesktopCollapsed} 
        />
        <main className={styles.content}>
          <div className={styles.contentInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
