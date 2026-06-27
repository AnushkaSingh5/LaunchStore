// Curated default categories and products for empty stores based on their niche

const homeDecorNiche = {
  niche: 'home-decor',
  categoryTitle: 'Shop By Space',
  categorySubtitle: 'Find the perfect pieces for every corner.',
  arrivalsTitle: 'Fresh Finds for Beautiful Spaces',
  arrivalsSubtitle: 'Explore our latest additions, thoughtfully curated to inspire your home.',
  brandDesc: 'Redefining modern living through minimalist design and premium craftsmanship.',
  categories: [
    { id: 'living-room', title: 'Living Room', count: 24, image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600', icon: 'armchair' },
    { id: 'bedroom', title: 'Bedroom', count: 18, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600', icon: 'bed' },
    { id: 'bathroom', title: 'Bathroom', count: 12, image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=600', icon: 'bath' },
    { id: 'kitchen', title: 'Kitchen', count: 15, image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600', icon: 'chef-hat' },
    { id: 'decor', title: 'Decor', count: 28, image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600', icon: 'flower' }
  ],
  products: [
    {
      id: 'default-hd-1',
      name: 'Sofa Emerald',
      price: 320,
      category: 'Living Room',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Luxurious deep green velvet sofa with tapered wooden legs. Comfortable, elegant, and durable.',
      featured: true,
      trending: false,
      stock: 15
    },
    {
      id: 'default-hd-2',
      name: 'Mirror Aura',
      price: 100,
      category: 'Decor',
      image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Organic-shaped backlit wall mirror. Creates a beautiful warm glow in any modern space.',
      featured: true,
      trending: false,
      stock: 8
    },
    {
      id: 'default-hd-3',
      name: 'Wooden Shelf',
      price: 110,
      category: 'Kitchen',
      image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Minimalist oak wood kitchen shelf with black iron supports. Perfect for spices and jars.',
      featured: true,
      trending: false,
      stock: 20
    },
    {
      id: 'default-hd-4',
      name: 'Table Lamp',
      price: 82,
      category: 'Bedroom',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      description: 'Ceramic base table lamp with natural linen shade. Soft diffused lighting.',
      featured: false,
      trending: true,
      stock: 12
    },
    {
      id: 'default-hd-5',
      name: 'Abstract Wall Art',
      price: 45,
      category: 'Decor',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Minimalist geometric canvas art print. Comes with a premium oak wood frame.',
      featured: false,
      trending: true,
      stock: 15
    },
    {
      id: 'default-hd-6',
      name: 'Ceramic Vase',
      price: 36,
      category: 'Decor',
      image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Handcrafted matte textured ceramic vase. Beautiful standalone or with dried florals.',
      featured: false,
      trending: true,
      stock: 25
    },
    {
      id: 'default-hd-7',
      name: 'Woven Basket',
      price: 28,
      category: 'Living Room',
      image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Handwoven seagrass storage basket with handles. Stylish organization.',
      featured: false,
      trending: true,
      stock: 18
    }
  ]
};

const fashionNiche = {
  niche: 'fashion',
  categoryTitle: 'Shop By Style',
  categorySubtitle: 'Find the perfect look for every occasion.',
  arrivalsTitle: 'Fresh Finds for Your Wardrobe',
  arrivalsSubtitle: 'Explore our latest additions, thoughtfully curated to inspire your style.',
  brandDesc: 'Redefining modern style through sustainable design and premium tailoring.',
  categories: [
    { id: 'tops-shirts', title: 'Tops & Shirts', count: 32, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600', icon: 'shirt' },
    { id: 'outerwear', title: 'Outerwear', count: 14, image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600', icon: 'jacket' },
    { id: 'pants-denim', title: 'Pants & Denim', count: 20, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=600', icon: 'pants' },
    { id: 'footwear', title: 'Footwear', count: 16, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600', icon: 'shoes' },
    { id: 'accessories', title: 'Accessories', count: 25, image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600', icon: 'watch' }
  ],
  products: [
    {
      id: 'default-fs-1',
      name: 'Linen Blazer',
      price: 120,
      category: 'Outerwear',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Breathable lightweight organic linen blazer. Relaxed modern tailoring.',
      featured: true,
      trending: false,
      stock: 10
    },
    {
      id: 'default-fs-2',
      name: 'Gold Link Chain',
      price: 75,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: '18k gold plated recycled sterling silver link chain necklace. Minimal daily wear.',
      featured: true,
      trending: false,
      stock: 14
    },
    {
      id: 'default-fs-3',
      name: 'Leather Boots',
      price: 160,
      category: 'Footwear',
      image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Handcrafted water-resistant Italian leather chelsea boots with elastic side panels.',
      featured: true,
      trending: false,
      stock: 6
    },
    {
      id: 'default-fs-4',
      name: 'Cotton Crewneck',
      price: 45,
      category: 'Tops & Shirts',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      description: '100% organic cotton daily crewneck tee. Durable and comfortable.',
      featured: false,
      trending: true,
      stock: 22
    },
    {
      id: 'default-fs-5',
      name: 'Selvedge Denim',
      price: 95,
      category: 'Pants & Denim',
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Japanese raw selvedge denim in slim straight cut. Classic indigo wash.',
      featured: false,
      trending: true,
      stock: 12
    },
    {
      id: 'default-fs-6',
      name: 'Silk Scarf',
      price: 35,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Hand-printed pure mulberry silk scarf with minimal geo prints.',
      featured: false,
      trending: true,
      stock: 30
    },
    {
      id: 'default-fs-7',
      name: 'Knit Beanie',
      price: 24,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Ultra-soft merino wool ribbed knit beanie for winter warmth.',
      featured: false,
      trending: true,
      stock: 25
    }
  ]
};

const beautyNiche = {
  niche: 'beauty',
  categoryTitle: 'Shop By Concern',
  categorySubtitle: 'Find the perfect products for your skin.',
  arrivalsTitle: 'Fresh Finds for Radiant Skin',
  arrivalsSubtitle: 'Explore our latest additions, thoughtfully curated to inspire your routine.',
  brandDesc: 'Redefining modern beauty through organic skincare and premium formulations.',
  categories: [
    { id: 'face-serums', title: 'Face Serums', count: 15, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600', icon: 'face' },
    { id: 'moisturizers', title: 'Moisturizers', count: 12, image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600', icon: 'cream' },
    { id: 'cleansers', title: 'Cleansers', count: 8, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600', icon: 'spray' },
    { id: 'fragrance', title: 'Fragrance', count: 10, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600', icon: 'bottle' },
    { id: 'body-care', title: 'Body Care', count: 18, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', icon: 'body' }
  ],
  products: [
    {
      id: 'default-bt-1',
      name: 'Glow Drops',
      price: 42,
      category: 'Face Serums',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Hydrating hyaluronic acid + niacinamide glow serum for a luminous complexion.',
      featured: true,
      trending: false,
      stock: 20
    },
    {
      id: 'default-bt-2',
      name: 'Rosewater Mist',
      price: 28,
      category: 'Cleansers',
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Soothing organic rosewater facial mist to balance and refresh skin.',
      featured: true,
      trending: false,
      stock: 15
    },
    {
      id: 'default-bt-3',
      name: 'Santal Perfume',
      price: 85,
      category: 'Fragrance',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Warm woody sandalwood eau de parfum. Long lasting complex scent.',
      featured: true,
      trending: false,
      stock: 9
    },
    {
      id: 'default-bt-4',
      name: 'Clay Mask',
      price: 32,
      category: 'Face Serums',
      image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      description: 'Detoxifying French green clay facial mask for deep pore cleansing.',
      featured: false,
      trending: true,
      stock: 12
    },
    {
      id: 'default-bt-5',
      name: 'Body Oil',
      price: 38,
      category: 'Body Care',
      image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Nourishing dry body oil infused with golden shimmer and essential oils.',
      featured: false,
      trending: true,
      stock: 14
    },
    {
      id: 'default-bt-6',
      name: 'Lip Balm',
      price: 12,
      category: 'Body Care',
      image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Ultra-hydrating shea butter lip treatment. Restores dry lips instantly.',
      featured: false,
      trending: true,
      stock: 50
    },
    {
      id: 'default-bt-7',
      name: 'Face Cream',
      price: 48,
      category: 'Moisturizers',
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Rich botanical youth renewal daily cream. Plumps and smooths texture.',
      featured: false,
      trending: true,
      stock: 16
    }
  ]
};

const techNiche = {
  niche: 'electronics',
  categoryTitle: 'Shop By Category',
  categorySubtitle: 'Find the perfect gadgets for your lifestyle.',
  arrivalsTitle: 'Fresh Finds for Smart Living',
  arrivalsSubtitle: 'Explore our latest additions, thoughtfully curated to inspire your setup.',
  brandDesc: 'Redefining modern productivity through innovative gadgets and tech.',
  categories: [
    { id: 'audio', title: 'Audio', count: 18, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', icon: 'headphone' },
    { id: 'smart-tech', title: 'Smart Tech', count: 14, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', icon: 'watch' },
    { id: 'charging', title: 'Power & Charging', count: 9, image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=600', icon: 'bolt' },
    { id: 'office', title: 'Office Setup', count: 22, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600', icon: 'keyboard' },
    { id: 'photography', title: 'Photography', count: 8, image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600', icon: 'camera' }
  ],
  products: [
    {
      id: 'default-tc-1',
      name: 'Studio Headphones',
      price: 199,
      category: 'Audio',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Pro-grade studio monitor over-ear wireless headphones with active noise cancelling.',
      featured: true,
      trending: false,
      stock: 12
    },
    {
      id: 'default-tc-2',
      name: 'Desk Mat',
      price: 39,
      category: 'Office Setup',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Premium merino wool felt desk pad. Protects surface and dampens keyboard noise.',
      featured: true,
      trending: false,
      stock: 25
    },
    {
      id: 'default-tc-3',
      name: 'Smart Speaker',
      price: 129,
      category: 'Audio',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: '360 degree acoustic smart assistant speaker. Exceptional fidelity and voice control.',
      featured: true,
      trending: false,
      stock: 8
    },
    {
      id: 'default-tc-4',
      name: 'Wireless Charger',
      price: 49,
      category: 'Power & Charging',
      image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      description: 'Fast magnetic dual device charging stand. Anodized aluminum build.',
      featured: false,
      trending: true,
      stock: 15
    },
    {
      id: 'default-tc-5',
      name: 'Keyboard Aura',
      price: 149,
      category: 'Office Setup',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Compact mechanical keyboard with brown tactile switches and aluminum body.',
      featured: false,
      trending: true,
      stock: 10
    },
    {
      id: 'default-tc-6',
      name: 'Travel Pouch',
      price: 29,
      category: 'Smart Tech',
      image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Waterproof tech accessory organizer pouch. Keeps cords, plugs and cards sorted.',
      featured: false,
      trending: true,
      stock: 40
    },
    {
      id: 'default-tc-7',
      name: 'Retro Camera',
      price: 249,
      category: 'Photography',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Classic rangefinder style digital camera with 35mm equivalent prime lens.',
      featured: false,
      trending: true,
      stock: 5
    }
  ]
};

const foodNiche = {
  niche: 'food',
  categoryTitle: 'Shop By Category',
  categorySubtitle: 'Find the perfect treats for every craving.',
  arrivalsTitle: 'Fresh Finds for Fresh Cravings',
  arrivalsSubtitle: 'Explore our latest additions, thoughtfully curated to inspire your palate.',
  brandDesc: 'Redefining modern eating through artisanal ingredients and fresh flavors.',
  categories: [
    { id: 'produce', title: 'Fresh Produce', count: 20, image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=600', icon: 'apple' },
    { id: 'bakery', title: 'Bakery', count: 15, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600', icon: 'bread' },
    { id: 'beverages', title: 'Beverages', count: 24, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600', icon: 'cup' },
    { id: 'pantry', title: 'Pantry', count: 35, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', icon: 'package' },
    { id: 'snacks', title: 'Snacks', count: 18, image: 'https://images.unsplash.com/photo-1599490659223-930b44ce6a1c?auto=format&fit=crop&q=80&w=600', icon: 'cookie' }
  ],
  products: [
    {
      id: 'default-fd-1',
      name: 'Honey Jar',
      price: 16,
      category: 'Pantry',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Raw organic wildflower honey, ethically harvested from sustainable hives.',
      featured: true,
      trending: false,
      stock: 30
    },
    {
      id: 'default-fd-2',
      name: 'Sourdough Boule',
      price: 8,
      category: 'Bakery',
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Naturally leavened country style sourdough bread with a crispy golden crust.',
      featured: true,
      trending: false,
      stock: 10
    },
    {
      id: 'default-fd-3',
      name: 'Matcha Powder',
      price: 24,
      category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1582725911776-6c525f6f3609?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Ceremonial grade Japanese Uji matcha green tea powder. Stone-ground.',
      featured: true,
      trending: false,
      stock: 25
    },
    {
      id: 'default-fd-4',
      name: 'Avocado Pack',
      price: 7,
      category: 'Fresh Produce',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=600',
      rating: 4.6,
      description: 'Pack of 4 organic Hass avocados. Grown in sunny orchards.',
      featured: false,
      trending: true,
      stock: 15
    },
    {
      id: 'default-fd-5',
      name: 'Dark Chocolate',
      price: 6,
      category: 'Snacks',
      image: 'https://images.unsplash.com/photo-1548907040-4d42b52115ca?auto=format&fit=crop&q=80&w=600',
      rating: 4.8,
      description: 'Single-origin 72% dark chocolate bar with hand-harvested sea salt.',
      featured: false,
      trending: true,
      stock: 45
    },
    {
      id: 'default-fd-6',
      name: 'Granola Bag',
      price: 12,
      category: 'Pantry',
      image: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?auto=format&fit=crop&q=80&w=600',
      rating: 4.7,
      description: 'Toasted maple pecan gluten-free organic granola. Sweetened with maple syrup.',
      featured: false,
      trending: true,
      stock: 20
    },
    {
      id: 'default-fd-7',
      name: 'Cold Brew Concentrate',
      price: 14,
      category: 'Beverages',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600',
      rating: 4.9,
      description: 'Organic signature dark roast cold brew concentrate. Mix 1:1 with water/milk.',
      featured: false,
      trending: true,
      stock: 18
    }
  ]
};

export function getDefaultStoreData(name = '', description = '') {
  const text = `${name || ''} ${description || ''}`.toLowerCase();
  
  let niche = 'general';
  
  if (
    text.includes('clothing') || 
    text.includes('clothes') || 
    text.includes('apparel') || 
    text.includes('fashion') || 
    text.includes('boutique') || 
    text.includes('wear') || 
    text.includes('shoes') || 
    text.includes('garment') || 
    text.includes('garments') || 
    text.includes('traditional') || 
    text.includes('sari') || 
    text.includes('kurta') || 
    text.includes('ethnic') || 
    text.includes('wardrobe') || 
    text.includes('style')
  ) {
    niche = 'fashion';
  } else if (
    text.includes('beauty') || 
    text.includes('cosmetic') || 
    text.includes('skincare') || 
    text.includes('fragrance') || 
    text.includes('makeup') || 
    text.includes('glow') || 
    text.includes('perfume') || 
    text.includes('lipstick') || 
    text.includes('balm') || 
    text.includes('serum') || 
    text.includes('skin')
  ) {
    niche = 'beauty';
  } else if (
    text.includes('tech') || 
    text.includes('electronic') || 
    text.includes('electronics') || 
    text.includes('gadget') || 
    text.includes('gadgets') || 
    text.includes('device') || 
    text.includes('devices') || 
    text.includes('headphone') || 
    text.includes('audio') || 
    text.includes('smartwatch') || 
    text.includes('camera') || 
    text.includes('keyboard')
  ) {
    niche = 'electronics';
  } else if (
    text.includes('food') || 
    text.includes('grocery') || 
    text.includes('groceries') || 
    text.includes('eat') || 
    text.includes('bake') || 
    text.includes('cafe') || 
    text.includes('coffee') || 
    text.includes('honey') || 
    text.includes('bread') || 
    text.includes('produce')
  ) {
    niche = 'food';
  } else if (
    text.includes('decor') || 
    text.includes('furniture') || 
    text.includes('home') || 
    text.includes('space') || 
    text.includes('interior') || 
    text.includes('interiors') || 
    text.includes('living') || 
    text.includes('bedroom')
  ) {
    niche = 'home-decor';
  }

  if (niche === 'fashion') {
    return {
      niche: 'fashion',
      categoryTitle: 'Shop By Style',
      categorySubtitle: `Find the perfect look from our ${description || 'collection'}.`,
      arrivalsTitle: `Fresh Finds at ${name || 'Our Store'}`,
      arrivalsSubtitle: `Explore our latest additions, thoughtfully curated for your style.`,
      brandDesc: description || `Redefining modern style through sustainable design and premium tailoring.`,
      categories: fashionNiche.categories,
      products: fashionNiche.products
    };
  }
  
  if (niche === 'beauty') {
    return {
      niche: 'beauty',
      categoryTitle: 'Shop By Concern',
      categorySubtitle: `Find the perfect products for your skin concern.`,
      arrivalsTitle: `New Arrivals at ${name || 'Our Store'}`,
      arrivalsSubtitle: `Explore our latest beauty additions, thoughtfully curated for your routine.`,
      brandDesc: description || `Redefining modern beauty through organic skincare and premium formulations.`,
      categories: beautyNiche.categories,
      products: beautyNiche.products
    };
  }
  
  if (niche === 'electronics') {
    return {
      niche: 'electronics',
      categoryTitle: 'Shop By Category',
      categorySubtitle: `Find the perfect gadgets for your digital lifestyle.`,
      arrivalsTitle: `Smart Tech at ${name || 'Our Store'}`,
      arrivalsSubtitle: `Explore our latest high-performance additions, curated for your setup.`,
      brandDesc: description || `Redefining modern productivity through innovative gadgets and tech.`,
      categories: techNiche.categories,
      products: techNiche.products
    };
  }
  
  if (niche === 'food') {
    return {
      niche: 'food',
      categoryTitle: 'Shop By Cravings',
      categorySubtitle: `Find the perfect treats for every occasion.`,
      arrivalsTitle: `Fresh Additions at ${name || 'Our Store'}`,
      arrivalsSubtitle: `Explore our latest fresh foods and artisanal treats, curated to inspire.`,
      brandDesc: description || `Redefining modern eating through artisanal ingredients and fresh flavors.`,
      categories: foodNiche.categories,
      products: foodNiche.products
    };
  }
  
  if (niche === 'home-decor') {
    return {
      niche: 'home-decor',
      categoryTitle: 'Shop By Space',
      categorySubtitle: `Find the perfect pieces for every corner.`,
      arrivalsTitle: `Fresh Finds for Beautiful Spaces`,
      arrivalsSubtitle: `Explore our latest additions, thoughtfully curated to inspire your home.`,
      brandDesc: description || `Redefining modern living through minimalist design and premium craftsmanship.`,
      categories: homeDecorNiche.categories,
      products: homeDecorNiche.products
    };
  }
  
  // General Niche - completely customized based on store name and description!
  return {
    niche: 'general',
    categoryTitle: 'Shop Collections',
    categorySubtitle: `Browse our curated selection of premium products.`,
    arrivalsTitle: `New Arrivals at ${name || 'Our Store'}`,
    arrivalsSubtitle: description ? `Discover the latest additions to our ${description}.` : `Explore our latest collections and unique finds, curated with care.`,
    brandDesc: description || `Curating high-quality products to bring value, utility, and delight to your life.`,
    categories: [
      { id: 'new-arrivals', title: 'New Arrivals', count: 12, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600', icon: 'sparkles' },
      { id: 'featured', title: 'Featured', count: 8, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', icon: 'award' },
      { id: 'best-sellers', title: 'Best Sellers', count: 16, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', icon: 'trending-up' }
    ],
    products: []
  };
}
