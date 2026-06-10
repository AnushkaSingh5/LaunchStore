'use client';

import { useStore } from '@/context/StoreContext';

export default function CategoryCard({ category }) {
  const { selectedCategory, setSelectedCategory } = useStore();
  const isActive = selectedCategory === category.title;

  return (
    <div 
      className={`category-tile dashboard-card ${isActive ? 'active' : ''}`}
      onClick={() => setSelectedCategory(category.title)}
    >
      <div className="tile-image">
        <img src={category.image} alt={category.title} onError={(e) => { e.target.style.display = 'none'; }} />
        <div className="tile-overlay"></div>
      </div>
      <div className="tile-content">
        <h3 className="tile-title">{category.title}</h3>
        <span className="tile-link">{isActive ? 'Viewing' : 'Explore'}</span>
      </div>

      <style jsx>{`
        .category-tile {
          position: relative;
          cursor: pointer;
          height: 240px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .category-tile.active {
          border: 2px solid var(--accent);
          transform: scale(1.02);
        }

        .category-tile:hover {
          transform: scale(1.02);
          box-shadow: var(--shadow-md);
        }

        .tile-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%);
        }

        .tile-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-smooth);
        }

        .tile-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%);
          transition: var(--transition-fast);
        }

        .category-tile:hover .tile-overlay, .category-tile.active .tile-overlay {
          background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
        }

        .tile-content {
          position: relative;
          z-index: 1;
          color: var(--white);
        }

        .tile-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
          transition: var(--transition-fast);
        }

        .category-tile:hover .tile-title, .category-tile.active .tile-title {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 2px;
        }

        .tile-link {
          font-size: 12px;
          font-weight: 500;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          transition: var(--transition-fast);
        }

        @media (max-width: 768px) {
          .category-tile {
            height: 160px;
            padding: 15px;
            border-radius: 16px;
          }
          .tile-title {
            font-size: 15px;
            margin-bottom: 2px;
          }
          .tile-link {
            font-size: 10px;
          }
          .category-tile.active {
            border-width: 2px;
          }
        }
      `}</style>
    </div>
  );
}
