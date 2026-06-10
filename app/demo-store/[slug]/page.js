import { demoStores } from '@/lib/demoData';
import DemoStoreClientPage from './DemoStoreClientPage';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = demoStores[slug];
  if (!store) {
    return {
      title: 'Demo Store Not Found | LaunchCart',
      description: 'The requested demo store does not exist.',
    };
  }
  return {
    title: `${store.name} | Live Demo | LaunchCart`,
    description: store.description || `Explore the beautiful ${store.name} demo store storefront.`,
    keywords: [store.name, 'demo store', 'LaunchCart', store.type, 'e-commerce demo'],
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <DemoStoreClientPage slug={slug} />;
}
