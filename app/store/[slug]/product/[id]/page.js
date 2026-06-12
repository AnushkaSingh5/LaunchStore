'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { storeService } from '@/services/storeService';
import { productService } from '@/services/productService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import PageLoader from '@/components/PageLoader';

export default function ProductDetails({ params }) {
  const { id, slug } = use(params);
  const { addToCart } = useStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [storeDetails, setStoreDetails] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      console.log(`[LaunchCart - ProductDetails] Starting fetchProduct for product ID: "${id}" on store slug: "${slug}"`);
      setLoading(true);
      try {
        console.log(`[LaunchCart - ProductDetails] Calling storeService.getStoreBySlug("${slug}")...`);
        const storeData = await storeService.getStoreBySlug(slug);
        console.log(`[LaunchCart - ProductDetails] storeService.getStoreBySlug returned:`, storeData);
        setStoreDetails(storeData);
        
        if (storeData && storeData.id) {
          console.log(`[LaunchCart - ProductDetails] Store matched. Calling productService.getProductById("${id}")...`);
          const prodData = await productService.getProductById(id);
          console.log(`[LaunchCart - ProductDetails] productService.getProductById returned:`, prodData);
          if (prodData) {
            setProduct(prodData);
            console.log(`[LaunchCart - ProductDetails] Fetching related products...`);
            const related = await productService.getRelatedProducts(storeData.id, prodData.category, prodData.id);
            console.log(`[LaunchCart - ProductDetails] Related products fetched count: ${related?.length}`);
            setRelatedProducts(related);
          } else {
            console.warn(`[LaunchCart - ProductDetails] No product matches ID: "${id}"`);
          }
        } else {
          console.warn(`[LaunchCart - ProductDetails] No store matches slug: "${slug}"`);
        }
      } catch (error) {
        console.error("[LaunchCart - ProductDetails] Failed to fetch product details with error:", error);
      } finally {
        console.log("[LaunchCart - ProductDetails] Fetch product complete, setting loading to false.");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, slug]);

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push(`/store/${slug}/cart`);
  };

  if (loading && !product) {
    return <PageLoader />;
  }


  if (!storeDetails) {
    return (
      <div className="store-not-found-screen">
        <div className="glass-card">
          <h2>Store Not Found 🔍</h2>
          <p>We couldn't find an active store with the link <strong>/store/{slug}</strong>. Please check the spelling or contact the owner.</p>
          <Link href="/" className="back-link">Return to Home</Link>
        </div>
        <style jsx>{`
          .store-not-found-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            padding: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            max-width: 480px;
            text-align: center;
            color: #fff;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
          .glass-card h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #f43f5e, #fb7185);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .back-link {
            display: inline-block;
            padding: 12px 24px;
            background: #e11d48;
            color: #fff;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="store-not-found-screen">
        <div className="glass-card">
          <h2>Product Not Found 🔍</h2>
          <p>We couldn't find the product details in this store. It might have been removed or set to draft.</p>
          <Link href={`/store/${slug}`} className="back-link">Return to Store</Link>
        </div>
        <style jsx>{`
          .store-not-found-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            padding: 20px;
            font-family: 'Outfit', sans-serif;
          }
          .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            max-width: 480px;
            text-align: center;
            color: #fff;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          }
          .glass-card h2 {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #f43f5e, #fb7185);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .glass-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 28px;
          }
          .back-link {
            display: inline-block;
            padding: 12px 24px;
            background: #8b5cf6;
            color: #fff;
            border-radius: 12px;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
          }
          .back-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Navbar storeName={storeDetails?.name} logoUrl={storeDetails?.logo_url || storeDetails?.logo} />

      <main className="container main-content">
        <div className="product-layout dashboard-card fade-in">
          <div className="product-gallery">
            <div className="main-image">
              <img src={product.image} alt={product.name} />
              {product.trending && <span className="badge">Trending</span>}
            </div>
          </div>

          <div className="product-info">
            <nav className="breadcrumb">
              <span>Home</span> / <span>{product.category}</span> / <span>{product.name}</span>
            </nav>

            <h1 className="title">{product.name}</h1>
            <p className="price">₹{product.price.toLocaleString()}</p>

            <div className="rating">
              <div className="stars">★★★★★</div>
              <span className="reviews">(128 reviews)</span>
            </div>

            <p className="description">
              {product.description || `Experience unparalleled quality and minimalist design. This ${product.name.toLowerCase()} is crafted from premium materials to elevate your living space and provide lasting comfort and style.`}
            </p>

            <div className="actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            <div className="features">
              <div className="feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span>Free Shipping</span>
              </div>
              <div className="feature">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>2 Year Warranty</span>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="related-section">
            <div className="section-header">
              <h2 className="section-title">Related Products</h2>
              <p className="section-subtitle">You might also like these pieces from the {product.category} collection.</p>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer storeName={storeDetails?.name} />

      <style jsx>{`
        .product-details-page {
          background: var(--bg-main);
          min-height: 100vh;
        }

        .main-content {
          padding-top: 140px;
          padding-bottom: 80px;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          padding: 60px;
          background: var(--white);
          margin-bottom: 80px;
        }

        .product-gallery .main-image {
          position: relative;
          aspect-ratio: 1/1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-main);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-image .badge {
          position: absolute;
          top: 20px;
          left: 20px;
          background: var(--accent);
          color: white;
          padding: 6px 16px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
        }

        .breadcrumb {
          font-size: 13px;
          color: var(--text-sub);
          margin-bottom: 24px;
        }

        .title {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }

        .price {
          font-size: 28px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 20px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
        }

        .stars {
          color: #f59e0b;
          font-size: 18px;
        }

        .reviews {
          color: var(--text-sub);
          font-size: 14px;
        }

        .description {
          font-size: 16px;
          line-height: 1.7;
          color: var(--text-sub);
          margin-bottom: 40px;
        }

        .actions {
          display: flex;
          gap: 20px;
          margin-bottom: 40px;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          background: var(--bg-main);
          border-radius: 12px;
          padding: 4px;
        }

        .quantity-selector button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        .quantity-selector span {
          width: 40px;
          text-align: center;
          font-weight: 700;
        }

        .add-to-cart-btn {
          flex: 1;
          background: var(--primary);
          color: var(--white);
          font-weight: 700;
          border-radius: 12px;
          font-size: 16px;
          transition: var(--transition-smooth);
        }

        .add-to-cart-btn:hover {
          background: var(--accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding-top: 30px;
          border-top: 1px solid var(--secondary);
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-main);
        }

        .related-section {
          margin-top: 40px;
        }

        .section-header {
          margin-bottom: 40px;
          text-align: center;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
        }

        .section-subtitle {
          color: var(--text-sub);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .loading-screen, .error-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 600;
        }

        @media (max-width: 1024px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px;
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .title {
            font-size: 32px;
          }
          .actions {
            flex-direction: column;
          }
          .quantity-selector {
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
