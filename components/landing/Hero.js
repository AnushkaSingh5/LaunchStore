'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './Hero.module.css';

export default function Hero() {
  const { user } = useAuth();
  return (
    <section className={styles.heroSection}>
      <div className={styles.glowBg}></div>
      <div className={`${styles.container} container`}>
        {/* Left Side: Content */}
        <div className={styles.contentBox}>
          <div className={styles.badge}>
            <span className={styles.badgePulse}></span>
            <span>Next-Gen E-commerce SaaS</span>
          </div>
          <h1 className={styles.title}>
            Build Your Own <span className={styles.gradientText}>Online Store</span> In Minutes
          </h1>
          <p className={styles.description}>
            The ultimate multi-store e-commerce builder for creators, brand builders, and modern merchants. No coding required. Beautiful designs, lightning fast loading, and complete control over your brand.
          </p>
          <div className={styles.ctaGroup}>
            <Link href={user ? "/dashboard" : "/signup"} className={styles.primaryCta}>
              {user ? "Go to Dashboard" : "Create Your Store"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
            <a href="#showcase" className={styles.secondaryCta}>
              Explore Demo Stores
            </a>
          </div>

          {/* Social Proof metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricItem}>
              <strong className={styles.metricVal}>15K+</strong>
              <span className={styles.metricLabel}>Stores Created</span>
            </div>
            <div className={styles.metricItem}>
              <strong className={styles.metricVal}>$48M+</strong>
              <span className={styles.metricLabel}>Volume Processed</span>
            </div>
            <div className={styles.metricItem}>
              <strong className={styles.metricVal}>99.9%</strong>
              <span className={styles.metricLabel}>Platform Uptime</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive CSS Dashboard Mockup */}
        <div className={styles.mockupBox}>
          <div className={styles.mockupContainer}>
            {/* Dashboard Header Bar */}
            <div className={styles.mockupHeader}>
              <div className={styles.dots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className={styles.mockupSearch}>launchcart.com/dashboard</div>
            </div>

            {/* Dashboard Workspace */}
            <div className={styles.mockupBody}>
              {/* Sidebar */}
              <div className={styles.mockupSidebar}>
                <div className={styles.sideItemActive}></div>
                <div className={styles.sideItem}></div>
                <div className={styles.sideItem}></div>
                <div className={styles.sideItem}></div>
              </div>

              {/* Main Workspace Area */}
              <div className={styles.mockupContent}>
                <div className={styles.contentHeader}>
                  <div className={styles.avatar}></div>
                  <div className={styles.barLong}></div>
                </div>

                {/* Simulated Chart block */}
                <div className={styles.chartBlock}>
                  <div className={styles.chartLabel}>
                    <div className={styles.barShort}></div>
                    <div className={styles.priceText}>$12,480.00</div>
                  </div>
                  <div className={styles.chartBars}>
                    <span style={{ height: '35%' }}></span>
                    <span style={{ height: '55%' }}></span>
                    <span style={{ height: '40%' }}></span>
                    <span style={{ height: '80%' }}></span>
                    <span style={{ height: '65%' }}></span>
                    <span style={{ height: '95%' }}></span>
                  </div>
                </div>

                {/* Dashboard Grid Items */}
                <div className={styles.dashboardGrid}>
                  <div className={styles.gridCard}>
                    <div className={styles.barMedium}></div>
                    <div className={styles.cardValue}>142</div>
                  </div>
                  <div className={styles.gridCard}>
                    <div className={styles.barMedium}></div>
                    <div className={styles.cardValue}>+12.4%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card 1: Active Store Notification */}
            <div className={`${styles.floatingCard} ${styles.float1} glass`}>
              <div className={styles.floatIcon}>💰</div>
              <div className={styles.floatText}>
                <strong>New Order</strong>
                <span>$249.00 from Alice S.</span>
              </div>
            </div>

            {/* Floating Card 2: Live Visitor Indicator */}
            <div className={`${styles.floatingCard} ${styles.float2} glass`}>
              <div className={styles.floatIconIndicator}></div>
              <div className={styles.floatText}>
                <strong>Active Visitors</strong>
                <span>482 shopping now</span>
              </div>
            </div>

            {/* Floating Card 3: Custom Styling trigger */}
            <div className={`${styles.floatingCard} ${styles.float3} glass`}>
              <div className={styles.floatIcon}>🎨</div>
              <div className={styles.floatText}>
                <strong>Theme Published</strong>
                <span>Luxe Premium Minimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
