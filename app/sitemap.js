import { storeService } from '@/services/storeService';
import { productService } from '@/services/productService';

export default async function sitemap() {
  const baseUrl = 'https://launchcart.com';
  
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    const stores = await storeService.getStores();
    
    for (const store of stores) {
      if (!store.slug) continue;
      
      const storeUrl = `${baseUrl}/store/${store.slug}`;
      routes.push({
        url: storeUrl,
        lastModified: new Date(store.created_at || Date.now()),
        changeFrequency: 'daily',
        priority: 0.8,
      });

      try {
        const products = await productService.getProductsByStore(store.id, false);
        for (const product of products) {
          const productSlugOrId = product.slug || product.id;
          routes.push({
            url: `${storeUrl}/product/${productSlugOrId}`,
            lastModified: new Date(product.created_at || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      } catch (prodErr) {
        console.error(`[LaunchCart - Sitemap] Error fetching products for store ${store.id}:`, prodErr);
      }
    }
  } catch (storeErr) {
    console.error('[LaunchCart - Sitemap] Error fetching stores for sitemap:', storeErr);
  }

  return routes;
}
