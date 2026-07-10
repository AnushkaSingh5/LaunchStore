import { storeService } from '@/services/storeService';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import ProductsClient from './ProductsClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = await storeService.getStoreBySlug(slug);

  if (!store) {
    return {
      title: 'Store Not Found | LaunchCart',
      description: 'The requested store could not be found.'
    };
  }

  const title = `All Products | ${store.seo_title || `${store.name} | LaunchCart`}`;
  const description = store.seo_description || store.description || `Welcome to ${store.name}`;
  const ogTitle = store.og_title || title;
  const ogDescription = store.og_description || description;
  const ogImage = store.logo_url || store.banner_url || '';
  const canonical = store.canonical_url || `https://launchcart.com/store/${slug}/products`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [{ url: ogImage }] : [],
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    }
  };
}

export default async function StoreProductsPage({ params }) {
  const { slug } = await params;
  
  let storeDetails = null;
  let initialProducts = [];
  let initialCategories = [];

  try {
    storeDetails = await storeService.getStoreBySlug(slug);
    
    if (storeDetails && storeDetails.id && storeDetails.status === 'approved') {
      const [prodData, catData] = await Promise.all([
        productService.getProductsByStore(storeDetails.id, false),
        categoryService.getCategoriesByStore(storeDetails.id)
      ]);
      
      const safeCatData = catData || [];
      const mappedProducts = (prodData || []).map(p => {
        const categoryObj = safeCatData.find(c => c.id === p.category_id);
        return {
          ...p,
          category: categoryObj ? (categoryObj.name || categoryObj.title) : 'Uncategorized'
        };
      });

      initialProducts = mappedProducts;
      initialCategories = [
        { id: 'all', title: 'All', image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800' },
        ...safeCatData
      ];
    }
  } catch (error) {
    console.error('[LaunchCart - StoreProductsPage Server] Failed to prefetch store catalog data:', error);
  }

  return (
    <ProductsClient 
      slug={slug} 
      initialStoreDetails={storeDetails} 
      initialProducts={initialProducts} 
      initialCategories={initialCategories} 
    />
  );
}
