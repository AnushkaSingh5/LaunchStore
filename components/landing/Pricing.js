import Link from 'next/link';
import styles from './Pricing.module.css';

export default function Pricing() {
  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for new side-hustlers and emerging brand builders.',
      features: [
        '1 Active Online Store',
        'Up to 15 Product Uploads',
        'Platform Default Subdomain',
        'Standard Payment Checkout',
        'Basic Store Analytics',
        'Mobile Responsive Layout'
      ],
      cta: 'Create Free Store',
      popular: false
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      desc: 'For serious sellers, growing merchants, and custom brands.',
      features: [
        '3 Active Online Stores',
        'Unlimited Product Uploads',
        'Custom Domain Binding',
        'Priority Cart Checkout',
        'Weekly Analytics Reports',
        'Priority Chat Support',
        'Fulfillment Order Trackers',
        'Custom Styling Presets'
      ],
      cta: 'Start Pro Free Trial',
      popular: true
    },
    {
      name: 'Enterprise Business',
      price: '$79',
      period: 'per month',
      desc: 'For established agencies, high-volume creators, and stores.',
      features: [
        'Unlimited Online Stores',
        'Unlimited Product Uploads',
        'Multi-Custom Domain Binding',
        'Premium API Integration Access',
        'Custom Webhooks & Webhooks',
        'Dedicated Support Expert Manager',
        'Daily Advanced Analytics',
        'Platform SLA Guarantee'
      ],
      cta: 'Deploy Business Now',
      popular: false
    }
  ];

  return (
    <section id="pricing" className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Simple Pricing</span>
          <h2 className={styles.title}>Scalable Plans for Every Merchant</h2>
          <p className={styles.description}>
            All plans start with a 14-day free trial. No credit card required. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className={styles.grid}>
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`${styles.planCard} ${plan.popular ? styles.popularCard : ''} dashboard-card`}
            >
              {plan.popular && <span className={styles.popularBadge}>Most Popular</span>}
              
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDesc}>{plan.desc}</p>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.priceNum}>{plan.price}</span>
                <span className={styles.periodText}>/{plan.period}</span>
              </div>

              {/* Features List */}
              <ul className={styles.featuresList}>
                {plan.features.map((feat, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link 
                href="/signup" 
                className={`${styles.planCta} ${plan.popular ? styles.popularCta : ''}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
