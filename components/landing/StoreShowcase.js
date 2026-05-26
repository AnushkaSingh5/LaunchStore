import Link from 'next/link';
import styles from './StoreShowcase.module.css';

export default function StoreShowcase() {
  const stores = [
    {
      name: 'Luxe Apparel',
      type: 'Fashion & Apparel',
      emoji: '🧥',
      slug: 'luxe-apparel',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      bgColor: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
      accentColor: '#e11d48',
      desc: 'Elegant garments, minimal product grids, soft shadows, and clean filtering.'
    },
    {
      name: 'SonicTech',
      type: 'Electronics & Gadgets',
      emoji: '🎧',
      slug: 'sonic-tech',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
      bgColor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      accentColor: '#2563eb',
      desc: 'High-contrast product cards, crisp specification specs, and dark layout themes.'
    },
    {
      name: 'FreshBites',
      type: 'Food & Groceries',
      emoji: '🥗',
      slug: 'fresh-bites',
      image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=800',
      bgColor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      accentColor: '#16a34a',
      desc: 'Organic groceries, grid categories, and immediate instant checkout flow.'
    },
    {
      name: 'GlowSkin',
      type: 'Beauty & Cosmetics',
      emoji: '💄',
      slug: 'glow-skin',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
      bgColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
      accentColor: '#db2777',
      desc: 'Pastel layout aesthetics, detailed ratings, and interactive shopping cart overlays.'
    }
  ];

  return (
    <section id="showcase" className={styles.section}>
      <div className={`${styles.container} container`}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.sub}>Infinite Versatility</span>
          <h2 className={styles.title}>Beautiful Demo Storefronts</h2>
          <p className={styles.description}>
            See what you can build with our highly adaptable layout configurations. One backend platform, endless visual identity potentials.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className={styles.grid}>
          {stores.map((store, i) => (
            <div key={i} className={`${styles.storeCard} dashboard-card`}>
              {/* Card visual header */}
              <div className={styles.visualHeader} style={{ background: store.bgColor }}>
                <img src={store.image} alt={store.name} className={styles.storeImg} />
                <span className={styles.storeEmoji}>{store.emoji}</span>
                <span className={styles.storeTag} style={{ color: store.accentColor, background: '#ffffffcc' }}>
                  {store.type}
                </span>
              </div>

              {/* Card Content */}
              <div className={styles.content}>
                <h3 className={styles.storeName}>{store.name}</h3>
                <p className={styles.storeDesc}>{store.desc}</p>
                <div className={styles.footerRow}>
                  <Link 
                    href={`/store/${store.slug}`} 
                    className={styles.demoLink}
                    style={{ '--accent-hover': store.accentColor }}
                  >
                    Launch Live Demo
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
