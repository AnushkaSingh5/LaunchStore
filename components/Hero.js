import { storeData } from '../data/mockData';

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-card dashboard-card overflow-hidden fade-in">
          <div className="hero-background">
            <img src="/hero.png" alt="Featured Space" />
            <div className="overlay"></div>
          </div>
          
          <div className="hero-content">
            <span className="welcome-tag">Premium Collection</span>
            <h1 className="hero-title">{storeData.description}</h1>
            <p className="hero-subtitle">Discover high-end minimalist designs curated for modern living.</p>
            <div className="hero-actions">
              <button className="primary-btn">Explore Now</button>
              <button className="secondary-btn">New Arrivals</button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          padding-top: 140px;
          padding-bottom: 40px;
        }

        .hero-card {
          position: relative;
          height: 540px;
          display: flex;
          align-items: center;
          padding: 60px;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .hero-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 10s ease;
        }

        .hero-card:hover .hero-background img {
          transform: scale(1.05);
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 580px;
          color: var(--white);
        }

        .welcome-tag {
          display: inline-block;
          padding: 6px 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border-radius: 30px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .hero-title {
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 20px;
          letter-spacing: -1.5px;
        }

        .hero-subtitle {
          font-size: 17px;
          line-height: 1.6;
          margin-bottom: 40px;
          opacity: 0.85;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
        }

        .primary-btn {
          background: var(--accent);
          color: var(--white);
          padding: 14px 32px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
          transition: var(--transition-smooth);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
        }

        .secondary-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          color: var(--white);
          padding: 14px 32px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-weight: 600;
          transition: var(--transition-smooth);
        }

        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .hero-section {
            padding-top: 160px; /* Increased padding for the 2-row mobile navbar */
            padding-bottom: 20px;
          }
          .hero-card {
            height: auto;
            padding: 40px 20px;
            text-align: center;
            border-radius: 20px;
          }
          .hero-content {
            max-width: 100%;
          }
          .hero-title {
            font-size: 28px;
            margin-bottom: 12px;
          }
          .hero-subtitle {
            font-size: 14px;
            margin-bottom: 24px;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          .primary-btn, .secondary-btn {
            width: 100%;
            padding: 12px 24px;
            font-size: 14px;
          }
          .welcome-tag {
            margin-bottom: 12px;
            font-size: 11px;
            padding: 4px 12px;
          }
        }
      `}</style>
    </section>
  );
}
