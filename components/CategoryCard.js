'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

export default function CategoryCard({ category, productCount }) {
  const { selectedCategory, setSelectedCategory } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleCategoryClick = () => {
    setSelectedCategory(category.title);
    const pathParts = pathname ? pathname.split('/') : [];
    const isDemo = pathParts[1] === 'demo-store';
    const isStorePage = (pathParts[1] === 'store' || isDemo) && pathParts[2];
    const storeSlug = isStorePage ? pathParts[2] : null;

    if (storeSlug) {
      router.push(`/${pathParts[1]}/${storeSlug}/products?category=${encodeURIComponent(category.title)}`);
    }
  };
  const isActive = selectedCategory === category.title;

  const displayCount = productCount !== undefined ? productCount : (category.count || 0);

  // SVG Icons mapper based on category title/icon name
  const getCategoryIcon = (iconName = '', title = '') => {
    const term = `${iconName || ''} ${title || ''}`.toLowerCase();
    
    // Living Room / Armchair
    if (term.includes('living') || term.includes('armchair') || term.includes('salon')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"></path><path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"></path><path d="M6 18v2"></path><path d="M18 18v2"></path></svg>
      );
    }
    // Bedroom / Bed
    if (term.includes('bedroom') || term.includes('bed') || term.includes('sleep')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"></path><path d="M2 11h20"></path><path d="M6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5"></path><path d="M22 4v16"></path></svg>
      );
    }
    // Bathroom / Bath
    if (term.includes('bathroom') || term.includes('bath') || term.includes('shower') || term.includes('sink')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.12 0L3.5 4.38a1.5 1.5 0 0 0 0 2.12L6 9"></path><path d="M3 16a9 9 0 0 0 18 0v-4H3v4Z"></path><path d="M12 9v3"></path><path d="M19 12v6"></path><path d="M5 12v6"></path></svg>
      );
    }
    // Kitchen / Chef
    if (term.includes('kitchen') || term.includes('chef') || term.includes('cooking') || term.includes('utensils')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M5 6.6A10.9 10.9 0 0 0 3 13a9 9 0 0 0 18 0 10.9 10.9 0 0 0-2-6.4M6.7 19.5 9 13.5"></path><path d="m17.3 19.5-2.3-6"></path><path d="m10 7-3-3"></path><path d="m14 7 3-3"></path></svg>
      );
    }
    // Decor / Accessories / Flower
    if (term.includes('decor') || term.includes('flower') || term.includes('vase') || term.includes('art')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M12 21.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path><path d="M19 12a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path><path d="M10 12a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"></path><path d="M12 7.5v9"></path><path d="M7.5 12h9"></path></svg>
      );
    }
    // Apparel / Shirts
    if (term.includes('apparel') || term.includes('shirt') || term.includes('clothing') || term.includes('tops')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 7.83V5c0-1.1-.9-2-2-2H10c-1.1 0-2 .9-2 2v2.83L3.62 3.46a1 1 0 0 0-1.57.83v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-14a1 1 0 0 0-1.67-.83Z"></path></svg>
      );
    }
    // Footwear / Shoes
    if (term.includes('footwear') || term.includes('shoes') || term.includes('boots')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16v-2a4 4 0 1 1 8 0v2"></path><path d="M3 20h18a1 1 0 0 0 1-1v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1a1 1 0 0 0 1 1Z"></path></svg>
      );
    }
    // Accessories / Watch
    if (term.includes('accessories') || term.includes('watch') || term.includes('jewelry')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="7"></circle><polyline points="12 9 12 12 13.5 13.5"></polyline><path d="M16.51 5.5h-9M16.51 18.5h-9"></path></svg>
      );
    }
    // Audio / Headphones
    if (term.includes('audio') || term.includes('headphone') || term.includes('speaker')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z"></path><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z"></path></svg>
      );
    }
    // Smart Tech / Camera / Tech
    if (term.includes('tech') || term.includes('camera') || term.includes('charging') || term.includes('keyboard')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
      );
    }
    // Fresh Produce / Food / Fruits / Vegetables
    if (term.includes('food') || term.includes('produce') || term.includes('fruits') || term.includes('vegetables') || term.includes('grocery') || term.includes('bakery')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Zm0 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"></path></svg>
      );
    }
    // Default Grid Icon
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
    );
  };

  return (
    <div 
      className={`category-arched-card ${isActive ? 'active' : ''}`}
      onClick={handleCategoryClick}
    >
      <div className="arched-image-wrapper">
        <img 
          src={category.image} 
          alt={category.title} 
          className="arched-img"
          onError={(e) => { 
            e.target.src = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600'; 
          }} 
        />
        <div className="icon-overlay-circle">
          {getCategoryIcon(category.icon, category.title)}
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title">{category.title}</h3>
        <span className="card-count">{displayCount} {displayCount === 1 ? 'Product' : 'Products'}</span>
      </div>

      <style jsx>{`
        .category-arched-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
          padding: 8px;
          border-radius: 20px;
          width: 100%;
        }

        .arched-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 3.2/4;
          border-radius: 120px 120px 24px 24px;
          overflow: hidden;
          background: #EFECE6;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.02);
          transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .arched-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .icon-overlay-circle {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #FAF8F5;
          color: #232724;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border: 1.5px solid rgba(0, 0, 0, 0.03);
          transition: all 0.35s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 2;
        }

        /* Hover States */
        .category-arched-card:hover .arched-image-wrapper {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.06);
        }

        .category-arched-card:hover .arched-img {
          transform: scale(1.06);
        }

        .category-arched-card:hover .icon-overlay-circle {
          background: #232724;
          color: #FAF8F5;
          box-shadow: 0 8px 20px rgba(35, 39, 36, 0.25);
        }

        /* Active State */
        .category-arched-card.active .arched-image-wrapper {
          transform: translateY(-8px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
        }

        .category-arched-card.active .icon-overlay-circle {
          background: #232724;
          color: #FAF8F5;
        }

        .card-info {
          text-align: center;
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #121212;
          font-family: 'Outfit', sans-serif;
          transition: color 0.2s ease;
        }

        .category-arched-card:hover .card-title {
          color: #232724;
        }

        .card-count {
          font-size: 12px;
          color: #706f6c;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .arched-image-wrapper {
            border-radius: 80px 80px 16px 16px;
          }
          .icon-overlay-circle {
            width: 38px;
            height: 38px;
            bottom: 12px;
          }
          .icon-overlay-circle svg {
            width: 16px;
            height: 16px;
          }
          .card-info {
            margin-top: 12px;
          }
          .card-title {
            font-size: 14px;
          }
          .card-count {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
