import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Create Your Account',
      description: 'Sign up in seconds. Enter your shop name and claim your custom store URL instantly.',
      badge: 'Start Free'
    },
    {
      num: '02',
      title: 'Customize Store Layout',
      description: 'Upload your branding, products, and categories. Configure shipping fees in clicks.',
      badge: 'No Code'
    },
    {
      num: '03',
      title: 'Publish & Start Selling',
      description: 'Go live instantly. Share your store link, accept payments, and manage order deliveries.',
      badge: 'Launch Live'
    }
  ];

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Zero Friction Setup</span>
          <h2 className={styles.title}>How LaunchCart Works</h2>
          <p className={styles.description}>
            We built a streamlined onboarding workflow so you can launch your complete brand and take your first purchase in under 5 minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className={styles.grid}>
          {steps.map((step, idx) => (
            <div key={idx} className={styles.stepCard}>
              <div className={styles.numBox}>
                <span className={styles.numText}>{step.num}</span>
                <span className={styles.stepBadge}>{step.badge}</span>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
              {idx < steps.length - 1 && <div className={styles.arrowIcon}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
