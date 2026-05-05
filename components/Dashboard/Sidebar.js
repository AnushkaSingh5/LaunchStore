import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './DashboardLayout.module.css';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Overview', path: '/dashboard', icon: '📊' },
    { label: 'Store Settings', path: '/dashboard/settings', icon: '⚙️' },
    { label: 'Products', path: '/dashboard/products', icon: '📦' },
    { label: 'Categories', path: '/dashboard/categories', icon: '📁' },
    { label: 'Orders', path: '/dashboard/orders', icon: '🛒' },
    { label: 'Customers', path: '/dashboard/customers', icon: '👥' },
    { label: 'Payments & Shipping', path: '/dashboard/payments', icon: '💳' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.logo}>
          <Link href="/dashboard">
            <h2>Creator Panel</h2>
          </Link>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <nav className={styles.nav}>
          <ul>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    onClick={() => { if(window.innerWidth <= 1024) onClose(); }}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn}>
            <span className={styles.icon}>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
