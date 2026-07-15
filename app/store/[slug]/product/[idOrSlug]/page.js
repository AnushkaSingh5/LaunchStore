import { storeService } from '@/services/storeService';
import { productService } from '@/services/productService';
import ProductClient from './ProductClient';

const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export async function generateMetadata({ params }) {
  const { slug, idOrSlug } = await params;
  const store = await storeService.getStoreBySlug(slug);

  if (!store) {
    return {
      title: 'Store Not Found | LaunchCart',
      description: 'The requested store could not be found.'
    };
  }

  let product = null;
  if (isUUID(idOrSlug)) {
    product = await productService.getProductById(idOrSlug);
  } else {
    product = await productService.getProductBySlug(store.id, idOrSlug);
  }

  if (!product) {
    return {
      title: 'Product Not Found | LaunchCart',
      description: 'The requested product could not be found.'
    };
  }

  const title = product.seo_title || `${product.name} | ${store.name}`;
  const description = product.seo_description || product.description || `Buy ${product.name} at ${store.name}`;
  const ogTitle = product.og_title || title;
  const ogDescription = product.og_description || description;
  const ogImage = product.image_url || product.image || '';
  const canonical = product.canonical_url || `https://launchcart.com/store/${slug}/product/${product.slug || product.id}`;

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
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : [],
    }
  };
}

export default async function ProductDetailsPage({ params }) {
  const { slug, idOrSlug } = await params;

  let storeDetails = null;
  let product = null;
  let relatedProducts = [];

  try {
    storeDetails = await storeService.getStoreBySlug(slug);
    
    if (storeDetails && storeDetails.id) {
      if (isUUID(idOrSlug)) {
        product = await productService.getProductById(idOrSlug);
      } else {
        product = await productService.getProductBySlug(storeDetails.id, idOrSlug);
      }

      if (product) {
        relatedProducts = await productService.getProductsByStore(storeDetails.id, false);
      }
    }
  } catch (error) {
    console.error('[LaunchCart - ProductDetails Server] Failed to prefetch data:', error);
  }

  return (
    <ProductClient
      slug={slug}
      initialStoreDetails={storeDetails}
      initialProduct={product}
      initialRelatedProducts={relatedProducts}
    />
  );
}
