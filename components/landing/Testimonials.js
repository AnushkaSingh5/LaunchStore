import styles from './Testimonials.module.css';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Sarah K.',
      role: 'Fashion Designer & Founder',
      avatar: '👩‍🎨',
      review: 'I launched Luxe Apparel in just one evening. LaunchCart handles the checkout, shipping rates, and product variations flawlessly. My weekly sales have doubled since moving off WordPress.'
    },
    {
      name: 'David L.',
      role: 'Hardware Innovator',
      avatar: '👨‍💻',
      review: 'The page speeds are insane! Next.js Turbopack makes my store feel instant. Customers always comment on how fast and responsive the shopping cart is compared to standard Shopify sites.'
    },
    {
      name: 'Maria R.',
      role: 'Gourmet Baker & Creator',
      avatar: '👩‍🍳',
      review: 'I have zero coding skills, but I customized my entire storefront layout and got payments active in under ten minutes. The admin dashboard is simple, beautiful, and so easy to use.'
    }
  ];

  return (
    <section className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Loved by Merchants</span>
          <h2 className={styles.title}>What Store Owners are Saying</h2>
          <p className={styles.description}>
            Join thousands of independent business owners, side-hustlers, and creators building their brands on our platform.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className={styles.grid}>
          {reviews.map((rev, i) => (
            <div key={i} className={`${styles.testimonialCard} dashboard-card`}>
              <span className={styles.quoteIcon}>“</span>
              <p className={styles.reviewText}>{rev.review}</p>
              
              <div className={styles.profileRow}>
                <span className={styles.avatarEmoji}>{rev.avatar}</span>
                <div className={styles.profileText}>
                  <h4>{rev.name}</h4>
                  <span>{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
