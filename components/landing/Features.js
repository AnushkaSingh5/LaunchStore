import FeatureCard from './FeatureCard';
import styles from './Features.module.css';

export default function Features() {
  const featureList = [
    {
      title: 'Store Builder',
      description: 'Drag, drop, and launch your customized storefront in minutes with zero coding required.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="9" y1="9" x2="21" y2="9"></line>
        </svg>
      )
    },
    {
      title: 'Product Management',
      description: 'Easily upload catalog items, track inventories, set size/color variants, and edit in bulk.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
      )
    },
    {
      title: 'Creator Dashboard',
      description: 'A beautiful centralized portal for managing your layout, products, stock levels, and branding.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      )
    },
    {
      title: 'Orders Management',
      description: 'Track orders from pending to complete, organize customer deliveries, and set shipping rates.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    {
      title: 'Analytics & Insights',
      description: 'Keep a live pulse on your revenue growth, weekly sales charts, conversion rates, and hot items.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
      )
    },
    {
      title: 'Mobile Responsive',
      description: 'Ensure your customers get a pixel-perfect, premium shopping experience on iOS, Android, and tablets.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      )
    },
    {
      title: 'Secure Authentication',
      description: 'Next-generation robust user signups and logins powered securely by PostgreSQL database schemas.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      )
    },
    {
      title: 'Fast Performance',
      description: 'Statically pre-rendered routes and code delivery with Turbopack for lightning-fast loads.',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      )
    }
  ];

  return (
    <section id="features" className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Powerful Capabilities</span>
          <h2 className={styles.title}>Everything You Need to Run & Grow Your Brand</h2>
          <p className={styles.description}>
            LaunchCart gives you a fully functional storefront alongside an industrial-grade backoffice. Stop worrying about servers or templates, start focusing on selling.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.grid}>
          {featureList.map((feat, i) => (
            <FeatureCard 
              key={i}
              title={feat.title}
              description={feat.description}
              icon={feat.icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
