'use client';

import { useState } from 'react';
import styles from './DashboardShowcase.module.css';

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', label: 'Analytics Panel', emoji: '📈' },
    { id: 'products', label: 'Product Manager', emoji: '📦' },
    { id: 'orders', label: 'Order Processing', emoji: '🛒' },
    { id: 'theme', label: 'Theme Customizer', emoji: '🎨' }
  ];

  console.log('[DashboardShowcase] Rendered. activeTab:', activeTab);

  return (
    <section className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Backoffice Powerhouse</span>
          <h2 className={styles.title}>The Complete Command Center</h2>
          <p className={styles.description}>
            Manage every element of your business from a fast, single-screen dashboard. Designed for speed, flexibility, and absolute control.
          </p>
        </div>

        {/* Tab Buttons Row */}
        <div className={styles.tabContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => {
                console.log('[DashboardShowcase] Tab clicked:', tab.id);
                setActiveTab(tab.id);
              }}
            >
              <span className={styles.tabEmoji}>{tab.emoji}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Showcase View Area */}
        <div className={`${styles.displayFrame} dashboard-card`}>
          {/* Simulated Browser Header */}
          <div className={styles.frameHeader}>
            <div className={styles.windowControls}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className={styles.windowAddress}>launchcart.com/dashboard/{activeTab}</div>
          </div>

          {/* Simulated Content Area */}
          <div className={styles.frameBody}>
            {/* ANALYTICS TAB CONTENT */}
            {activeTab === 'analytics' && (
              <div className={`${styles.viewContent} fade-in`}>
                <div className={styles.overviewHeader}>
                  <div>
                    <h4 className={styles.panelTitle}>Store Analytics</h4>
                    <p className={styles.panelSubtitle}>Real-time updates of your shop performance.</p>
                  </div>
                  <div className={styles.badgeSuccess}>Live Monitoring</div>
                </div>

                <div className={styles.analyticsGrid}>
                  <div className={styles.statsCard}>
                    <span className={styles.cardLabel}>Weekly Revenue</span>
                    <strong className={styles.cardVal}>$14,850.40</strong>
                    <span className={styles.trendUp}>+18.2% from last week</span>
                  </div>
                  <div className={styles.statsCard}>
                    <span className={styles.cardLabel}>Store Conversions</span>
                    <strong className={styles.cardVal}>4.26%</strong>
                    <span className={styles.trendUp}>+0.8% increase</span>
                  </div>
                </div>

                {/* Sales Chart Mock */}
                <div className={styles.chartContainer}>
                  <div className={styles.chartGuides}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className={styles.chartLineWrapper}>
                    <svg className={styles.chartSvg} viewBox="0 0 500 120">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path d="M 0 120 Q 80 50 160 80 T 320 20 T 500 40 L 500 120 L 0 120 Z" fill="url(#chartGrad)" />
                      {/* Line */}
                      <path d="M 0 120 Q 80 50 160 80 T 320 20 T 500 40" fill="none" stroke="#2563eb" strokeWidth="3" />
                      {/* Dot */}
                      <circle cx="320" cy="20" r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className={styles.glowDot} />
                    </svg>
                  </div>
                  <div className={styles.chartXAxis}>
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS TAB CONTENT */}
            {activeTab === 'products' && (
              <div className={`${styles.viewContent} fade-in`}>
                <div className={styles.overviewHeader}>
                  <div>
                    <h4 className={styles.panelTitle}>Product Catalog</h4>
                    <p className={styles.panelSubtitle}>Add, edit, and organize variants in clicks.</p>
                  </div>
                  <button className={styles.addBtn}>+ Add Product</button>
                </div>

                {/* Table Simulation */}
                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <span>Product Detail</span>
                    <span>Inventory</span>
                    <span>Price</span>
                    <span>Status</span>
                  </div>
                  
                  <div className={styles.tableRow}>
                    <div className={styles.productCell}>
                      <span className={styles.prodThumb} style={{ background: '#ffe4e6' }}>🪑</span>
                      <div className={styles.prodDetails}>
                        <strong>Luxe Lounge Armchair</strong>
                        <span>Furniture & Cozy</span>
                      </div>
                    </div>
                    <span>42 in stock</span>
                    <strong>$299.00</strong>
                    <span className={styles.badgeSuccess}>Active</span>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.productCell}>
                      <span className={styles.prodThumb} style={{ background: '#dbeafe' }}>🎧</span>
                      <div className={styles.prodDetails}>
                        <strong>SonicPro Headset</strong>
                        <span>Electronics</span>
                      </div>
                    </div>
                    <span>18 in stock</span>
                    <strong>$149.00</strong>
                    <span className={styles.badgeSuccess}>Active</span>
                  </div>

                  <div className={styles.tableRow}>
                    <div className={styles.productCell}>
                      <span className={styles.prodThumb} style={{ background: '#dcfce7' }}>🏺</span>
                      <div className={styles.prodDetails}>
                        <strong>Ceramic Minimal Vase</strong>
                        <span>Home Decor</span>
                      </div>
                    </div>
                    <span className={styles.textLow}>4 left (Low stock)</span>
                    <strong>$45.00</strong>
                    <span className={styles.badgeWarning}>Low Stock</span>
                  </div>
                </div>
              </div>
            )}

            {/* ORDERS TAB CONTENT */}
            {activeTab === 'orders' && (
              <div className={`${styles.viewContent} fade-in`}>
                <div className={styles.overviewHeader}>
                  <div>
                    <h4 className={styles.panelTitle}>Recent Orders</h4>
                    <p className={styles.panelSubtitle}>Fulfill purchases and check checkout states.</p>
                  </div>
                  <div className={styles.badgeOutline}>8 Pending Fulfillment</div>
                </div>

                <div className={styles.table}>
                  <div className={styles.tableHeader}>
                    <span>Order ID</span>
                    <span>Customer</span>
                    <span>Fulfillment</span>
                    <span>Amount</span>
                  </div>

                  <div className={styles.tableRow}>
                    <strong>#LC-2041</strong>
                    <span>Alice Vance</span>
                    <span className={styles.badgeSuccess}>Fulfilled</span>
                    <strong>$344.00</strong>
                  </div>

                  <div className={styles.tableRow}>
                    <strong>#LC-2040</strong>
                    <span>Bob Miller</span>
                    <span className={styles.badgeWarning}>Pending</span>
                    <strong>$145.00</strong>
                  </div>

                  <div className={styles.tableRow}>
                    <strong>#LC-2039</strong>
                    <span>Charlie Jenkins</span>
                    <span className={styles.badgeSuccess}>Fulfilled</span>
                    <strong>$28.00</strong>
                  </div>
                </div>
              </div>
            )}

            {/* THEME CUSTOMIZER TAB CONTENT */}
            {activeTab === 'theme' && (
              <div className={`${styles.viewContent} fade-in`}>
                <div className={styles.overviewHeader}>
                  <div>
                    <h4 className={styles.panelTitle}>Live Brand Customizer</h4>
                    <p className={styles.panelSubtitle}>Set visual themes, color scales, and layout roundness.</p>
                  </div>
                  <button className={styles.saveBtn}>Publish Theme</button>
                </div>

                <div className={styles.customizerLayout}>
                  {/* Styling Controls sidebar */}
                  <div className={styles.custSidebar}>
                    <div className={styles.custGroup}>
                      <label>Color Preset</label>
                      <div className={styles.presetGrid}>
                        <span className={styles.presetCircle} style={{ background: '#2563eb' }}></span>
                        <span className={styles.presetCircle} style={{ background: '#db2777' }}></span>
                        <span className={styles.presetCircle} style={{ background: '#16a34a' }}></span>
                        <span className={styles.presetCircle} style={{ background: '#e11d48' }}></span>
                      </div>
                    </div>

                    <div className={styles.custGroup}>
                      <label>Border Roundness</label>
                      <div className={styles.rangeMock}>
                        <span className={styles.rangeLine}></span>
                        <span className={styles.rangeHandle} style={{ left: '70%' }}></span>
                      </div>
                    </div>
                  </div>

                  {/* Styling Live Preview card */}
                  <div className={styles.custPreview}>
                    <div className={styles.previewShopNavbar}>
                      <div className={styles.previewLogo}></div>
                      <div className={styles.previewLinks}></div>
                    </div>
                    <div className={styles.previewHero}>
                      <div className={styles.previewTitle}></div>
                      <div className={styles.previewButton}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
