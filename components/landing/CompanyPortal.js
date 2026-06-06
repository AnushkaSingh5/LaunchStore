import Link from 'next/link';
import styles from './CompanyPortal.module.css';

export default function CompanyPortal() {
  return (
    <section className={styles.section} id="company-portal">
      <div className={styles.glowBg}></div>
      <div className={`${styles.container} container`}>
        <div className={`${styles.portalCard} dashboard-card`}>
          <div className={styles.glowOverlay}></div>
          <div className={styles.content}>
            {/* Badge */}
            <span className={styles.badge}>Internal Access</span>
            
            {/* Icon */}
            <div className={styles.iconContainer}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.shieldIcon}
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>

            {/* Content Text */}
            <h2 className={styles.title}>Company Portal</h2>
            <p className={styles.description}>
              Access platform administration, creator approvals, store moderation, order monitoring, customer management and platform analytics.
            </p>

            {/* Button */}
            <div className={styles.buttonGroup}>
              <Link href="/admin/login" className={styles.adminBtn}>
                Admin Login
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
