import styles from './DashboardLayout.module.css';

export default function Navbar({ onMenuClick, title, breadcrumbs }) {
  return (
    <header className={styles.navbar}>
      <div className={styles.navLeft}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>{title || 'Dashboard'}</h1>
          {breadcrumbs && (
            <div className={styles.breadcrumbs}>
              {breadcrumbs.map((bc, index) => (
                <div key={index} className={styles.breadcrumbItem}>
                  {index > 0 && (
                    <svg className={styles.separator} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  )}
                  <span className={bc.active ? styles.activeBc : ''}>{bc.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.navRight}>
        <div className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search..." />
        </div>
        <button className={styles.notificationBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <div className={styles.profile}>
          <img src="https://i.pravatar.cc/150?u=creator" alt="Profile" />
        </div>
      </div>
    </header>
  );
}
