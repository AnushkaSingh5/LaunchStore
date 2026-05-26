import Link from 'next/link';
import styles from './CTA.module.css';

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.glowBg}></div>
      <div className={`${styles.container} container`}>
        <div className={`${styles.ctaCard} dashboard-card`}>
          <div className={styles.glowOverlay}></div>
          <div className={styles.content}>
            <span className={styles.sub}>No Credit Card Required</span>
            <h2 className={styles.title}>Start Building Your Online Store Today</h2>
            <p className={styles.description}>
              Join thousands of independent business owners, brand builders, and creators taking their sales to the next level. Sign up for your 14-day free trial.
            </p>
            <div className={styles.ctaGroup}>
              <Link href="/signup" className={styles.primaryCta}>
                Create Store
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
              <a href="mailto:support@launchcart.com" className={styles.secondaryCta}>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
