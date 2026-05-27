'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import styles from './AdminLayout.module.css';

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setDesktopCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setSidebarOpen(!isSidebarOpen);
    } else {
      setDesktopCollapsed(!isDesktopCollapsed);
    }
  };
  
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`${styles.adminLayout} ${isDesktopCollapsed ? styles.layoutCollapsed : ''}`}>
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        isCollapsed={isDesktopCollapsed} 
        onToggle={toggleSidebar} 
      />
      <div className={styles.main}>
        <AdminNavbar 
          onToggleSidebar={toggleSidebar} 
        />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
