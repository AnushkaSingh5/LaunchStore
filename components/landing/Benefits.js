import styles from './Benefits.module.css';

export default function Benefits() {
  const benefits = [
    {
      title: 'No Coding Required',
      desc: 'No HTML/CSS or hosting knowledge needed. Simply enter products and go live.',
      icon: '✨'
    },
    {
      title: 'Fast Setup Flow',
      desc: 'Onboard your entire business catalog and categories in less than 5 minutes.',
      icon: '⚡'
    },
    {
      title: 'Fully Scalable',
      desc: 'Runs on Next.js App Router for enterprise-grade, blazing-fast speed at any volume.',
      icon: '📈'
    },
    {
      title: 'Secure Database',
      desc: 'Robust system security ensures customer data and payment integrations are secure.',
      icon: '🛡️'
    },
    {
      title: 'Mobile Optimized',
      desc: 'Deliver a breathtaking shopping experience on iPhones, Androids, and tablets.',
      icon: '📱'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Left column: Grid of benefits */}
        <div className={styles.leftCol}>
          <span className={styles.sub}>Why LaunchCart?</span>
          <h2 className={styles.title}>The Smartest Way to Sell Online</h2>
          <p className={styles.description}>
            Traditional web builders are slow, bloated, and complicated. We built a streamlined e-commerce engine that takes care of the technical heavy lifting so you can focus on building your brand.
          </p>

          <div className={styles.benefitsList}>
            {benefits.map((benefit, i) => (
              <div key={i} className={styles.benefitItem}>
                <span className={styles.benefitIcon}>{benefit.icon}</span>
                <div className={styles.benefitText}>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Premium CSS preview card */}
        <div className={styles.rightCol}>
          <div className={`${styles.visualCard} dashboard-card`}>
            <div className={styles.cardHeader}>
              <div className={styles.statusGlow}></div>
              <span>Live Store Optimization</span>
            </div>
            
            <div className={styles.speedMetric}>
              <div className={styles.speedCircle}>
                <span className={styles.speedNum}>98</span>
                <span className={styles.speedLabel}>Performance Score</span>
              </div>
            </div>

            <div className={styles.metricTextRows}>
              <div className={styles.metricRow}>
                <span>LCP (Largest Contentful Paint)</span>
                <strong>0.6s</strong>
              </div>
              <div className={styles.metricRow}>
                <span>SEO Configuration</span>
                <strong>100/100</strong>
              </div>
              <div className={styles.metricRow}>
                <span>Security Standard</span>
                <strong>Enterprise</strong>
              </div>
            </div>

            <div className={styles.glowingFooter}>
              <span>⚡ Powered by Next.js & Turbopack</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
