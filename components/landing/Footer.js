import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`${styles.container} container`}>
        {/* Logo and Description */}
        <div className={styles.brandCol}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className={styles.logoText}>LaunchCart</span>
          </Link>
          <p className={styles.brandDesc}>
            The multi-store e-commerce engine designed for modern brand owners, creators, and merchants. Build, customize, and deploy fully functional storefronts in under 5 minutes.
          </p>
          <div className={styles.socials}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
              🕊️
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              💼
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="GitHub">
              💻
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Product</h4>
          <nav className={styles.linkList}>
            <a href="#features" className={styles.link}>Platform Features</a>
            <a href="#how-it-works" className={styles.link}>How it Works</a>
            <a href="#showcase" className={styles.link}>Demo Stores</a>
            <a href="#pricing" className={styles.link}>SaaS Pricing</a>
          </nav>
        </div>

        {/* Creators & Admin Portals */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Portals</h4>
          <nav className={styles.linkList}>
            <Link href="/dashboard" className={styles.link}>Creator Dashboard</Link>
            <Link href="/admin/login" className={styles.link}>Admin Access</Link>
            <Link href="/login" className={styles.link}>Merchant Login</Link>
            <Link href="/signup" className={styles.link}>Merchant Register</Link>
          </nav>
        </div>

        {/* Contact Info */}
        <div className={styles.linksCol}>
          <h4 className={styles.colTitle}>Contact & Info</h4>
          <p className={styles.contactText}>
            Have questions? Get in touch with our product experts.
          </p>
          <div className={styles.contactDetails}>
            <span>✉️ support@launchcart.com</span>
            <span>📞 +1 (800) 555-0199</span>
          </div>
        </div>
      </div>

      {/* Footer Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={`${styles.bottomContainer} container`}>
          <span className={styles.copyright}>
            © {currentYear} LaunchCart Inc. All rights reserved.
          </span>
          <div className={styles.bottomLinks}>
            <Link href="/privacy" className={styles.bottomLink}>Privacy Policy</Link>
            <Link href="/terms" className={styles.bottomLink}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
