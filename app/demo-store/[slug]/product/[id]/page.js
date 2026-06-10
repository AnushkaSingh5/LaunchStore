import { demoStores } from '@/lib/demoData';
import ProductDetailsClient from './ProductDetailsClient';

export async function generateMetadata({ params }) {
  const { slug, id } = await params;
  const store = demoStores[slug];
  if (!store) {
    return {
      title: 'Store Not Found | LaunchCart',
    };
  }
  const product = store.products?.find(p => p.id === id);
  if (!product) {
    return {
      title: `Product Not Found | ${store.name}`,
    };
  }
  return {
    title: `${product.name} | ${store.name}`,
    description: product.description || `Buy ${product.name} at ${store.name}.`,
    keywords: [product.name, product.category, store.name, 'LaunchCart', 'live demo'],
  };
}

export default async function Page({ params }) {
  const { slug, id } = await params;
  return <ProductDetailsClient slug={slug} id={id} />;
}
