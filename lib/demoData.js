export const demoStores = {
  'luxe-apparel': {
    name: 'Luxe Apparel',
    type: 'Fashion & Apparel',
    emoji: '🧥',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    banner: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600',
    logo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200',
    bgColor: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    accentColor: '#e11d48',
    description: 'Elegant garments, minimal product grids, soft shadows, and clean filtering.',
    categories: [
      { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600' },
      { id: 'apparel', title: 'Apparel', image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=600' },
      { id: 'accessories', title: 'Accessories', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600' },
      { id: 'footwear', title: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600' }
    ],
    products: [
      {
        id: 'la-1',
        name: 'Premium Cotton T-Shirt',
        price: 35,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Made from 100% long-staple organic cotton. Super soft, breathable, and pre-shrunk for a perfect fit.'
      },
      {
        id: 'la-2',
        name: 'Classic Oversized Hoodie',
        price: 75,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: false,
        description: 'Heavyweight loopback French terry. Relaxed, dropped shoulder silhouette with double-layer hood.'
      },
      {
        id: 'la-3',
        name: 'Slim Fit Selvedge Jeans',
        price: 110,
        category: 'Apparel',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600',
        featured: false,
        trending: true,
        description: 'Raw indigo Japanese selvedge denim. Tailored fit that breaks in beautifully over time.'
      },
      {
        id: 'la-4',
        name: 'Minimalist Leather Sneakers',
        price: 145,
        category: 'Footwear',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Italian full-grain calfskin leather with durable Margom rubber cupsoles. Crafted in Portugal.'
      },
      {
        id: 'la-5',
        name: 'Cashmere Beanie Hat',
        price: 45,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&q=80&w=600',
        featured: false,
        trending: false,
        description: 'Exquisitely soft 100% Mongolian cashmere. Rib-knit construction for ultimate warmth.'
      }
    ]
  },
  'sonic-tech': {
    name: 'SonicTech',
    type: 'Electronics & Gadgets',
    emoji: '🎧',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1600',
    logo: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=200',
    bgColor: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    accentColor: '#2563eb',
    description: 'High-contrast product cards, crisp specification specs, and dark layout themes.',
    categories: [
      { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600' },
      { id: 'audio', title: 'Audio', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600' },
      { id: 'wearables', title: 'Wearables', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600' },
      { id: 'accessories', title: 'Accessories', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600' }
    ],
    products: [
      {
        id: 'st-1',
        name: 'Wireless ANC Headphones',
        price: 249,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Industry-leading Active Noise Cancellation, custom high-excursion drivers, and 40-hour battery life.'
      },
      {
        id: 'st-2',
        name: 'Pro Smart Watch',
        price: 199,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Always-on AMOLED display, comprehensive fitness tracking, built-in GPS, and water-resistance up to 50m.'
      },
      {
        id: 'st-3',
        name: 'Mechanical Gaming Keyboard',
        price: 129,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
        featured: false,
        trending: true,
        description: 'Hot-swappable linear mechanical switches, anodized aluminum top frame, and vibrant per-key RGB backlighting.'
      },
      {
        id: 'st-4',
        name: 'Noise-Isolating Earbuds',
        price: 99,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: false,
        description: 'True wireless stereo earbuds with dynamic soundstage, touch control interface, and wireless charging case.'
      }
    ]
  },
  'fresh-bites': {
    name: 'FreshBites',
    type: 'Food & Groceries',
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=800',
    banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600',
    logo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200',
    bgColor: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    accentColor: '#16a34a',
    description: 'Organic groceries, grid categories, and immediate instant checkout flow.',
    categories: [
      { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600' },
      { id: 'vegetables', title: 'Vegetables', image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=600' },
      { id: 'fruits', title: 'Fruits', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600' },
      { id: 'beverages', title: 'Beverages', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600' }
    ],
    products: [
      {
        id: 'fb-1',
        name: 'Organic Avocados (Pack of 4)',
        price: 6.99,
        category: 'Fruits',
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Rich, creamy Hass avocados grown sustainably on organic family farms. Perfect for guacamole or toast.'
      },
      {
        id: 'fb-2',
        name: 'Fresh Kale Bunch',
        price: 2.49,
        category: 'Vegetables',
        image: 'https://images.unsplash.com/photo-1628773822503-930a8589c313?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: false,
        description: 'Crisp, nutrient-dense green curly kale. Harvested daily and delivered fresh to maintain crispness.'
      },
      {
        id: 'fb-3',
        name: 'Cold-Pressed Green Juice',
        price: 4.99,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1610970881699-44a5587caa90?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Juiced from organic cucumber, celery, spinach, green apple, kale, and lemon. No sugar added.'
      }
    ]
  },
  'glow-skin': {
    name: 'GlowSkin',
    type: 'Beauty & Cosmetics',
    emoji: '💄',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
    banner: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=1600',
    logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=200',
    bgColor: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    accentColor: '#db2777',
    description: 'Pastel layout aesthetics, detailed ratings, and interactive shopping cart overlays.',
    categories: [
      { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600' },
      { id: 'skincare', title: 'Skincare', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600' },
      { id: 'makeup', title: 'Makeup', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=600' },
      { id: 'fragrance', title: 'Fragrance', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600' }
    ],
    products: [
      {
        id: 'gs-1',
        name: 'Hyaluronic Acid Hydration Serum',
        price: 28,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Formulated with multi-weight hyaluronic acid molecules to penetrate deep and lock in moisture for plump skin.'
      },
      {
        id: 'gs-2',
        name: 'Matte Velvet Lipstick',
        price: 22,
        category: 'Makeup',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Vibrant, high-pigment formula with a velvet-matte finish. Hydrating agents ensure comfort all day.'
      },
      {
        id: 'gs-3',
        name: 'Gentle Foaming Cleanser',
        price: 18,
        category: 'Skincare',
        image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600',
        featured: false,
        trending: false,
        description: 'Sulfate-free botanical face wash. Deeply cleanses impurities while preserving skin\'s natural moisture barrier.'
      },
      {
        id: 'gs-4',
        name: 'Citrus Blossom Eau de Parfum',
        price: 65,
        category: 'Fragrance',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'A light, refreshing fragrance combining notes of bergamot, orange blossom, and soft amber.'
      }
    ]
  },
  'home-decor-demo': {
    name: 'Luxe Decor',
    type: 'Home Decor',
    emoji: '🏺',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
    banner: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1600',
    logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200',
    bgColor: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    accentColor: '#d97706',
    description: 'Minimalist ceramic vases, cozy cushions, and architectural lighting.',
    categories: [
      { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600' },
      { id: 'Lighting', title: 'Lighting', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600' },
      { id: 'Accessories', title: 'Accessories', image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600' }
    ],
    products: [
      {
        id: 'hd-1',
        name: 'Minimalist Ceramic Vase',
        price: 45,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Matte finished stoneware vase. Individually hand-thrown, perfect for dried botanicals.'
      },
      {
        id: 'hd-2',
        name: 'Modern Brass Desk Lamp',
        price: 85,
        category: 'Lighting',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: true,
        description: 'Solid brass structure with adjustable arm and warm LED source. Adds mid-century warmth to any workspace.'
      },
      {
        id: 'hd-3',
        name: 'Linen Throw Cushion',
        price: 30,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=600',
        featured: false,
        trending: false,
        description: '100% Belgian flax linen cover with plush feather down insert. Breathable and durable.'
      },
      {
        id: 'hd-4',
        name: 'Architectural Pendant Light',
        price: 180,
        category: 'Lighting',
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600',
        featured: true,
        trending: false,
        description: 'Sculptural metal pendant fixture. Casts a soft geometric shadow and serves as an art piece.'
      }
    ]
  }
};

// Add aliasing so both route sets work seamlessly
demoStores['fashion-demo'] = demoStores['luxe-apparel'];
demoStores['electronics-demo'] = demoStores['sonic-tech'];
demoStores['beauty-demo'] = demoStores['glow-skin'];

