'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`${styles.container} container`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className={styles.logoText}>LaunchCart</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#how-it-works" className={styles.navLink}>How it Works</a>
          <a href="#showcase" className={styles.navLink}>Showcase</a>
          <a href="#pricing" className={styles.navLink}>Pricing</a>
          <a href="#faq" className={styles.navLink}>FAQ</a>
        </nav>

        {/* Desktop CTA */}
        <div className={styles.ctaGroup}>
          <Link href="/login" className={styles.loginBtn}>Sign In</Link>
          <Link href="/signup" className={styles.getStartedBtn}>Get Started</Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className={`${styles.mobileToggle} ${isMobileMenuOpen ? styles.active : ''}`} 
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNav}>
          <a href="#features" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Features</a>
          <a href="#how-it-works" className={styles.mobileNavLink} onClick={toggleMobileMenu}>How it Works</a>
          <a href="#showcase" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Showcase</a>
          <a href="#pricing" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Pricing</a>
          <a href="#faq" className={styles.mobileNavLink} onClick={toggleMobileMenu}>FAQ</a>
          <div className={styles.mobileDivider}></div>
          <Link href="/login" className={styles.mobileLoginBtn} onClick={toggleMobileMenu}>Sign In</Link>
          <Link href="/signup" className={styles.mobileGetStartedBtn} onClick={toggleMobileMenu}>Get Started</Link>
        </nav>
      </div>
    </header>
  );
}
