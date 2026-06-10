import { demoStores } from '@/lib/demoData';
import CheckoutClientPage from './CheckoutClientPage';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = demoStores[slug];
  if (!store) {
    return {
      title: 'Checkout | Store Not Found',
    };
  }
  return {
    title: `Secure Checkout | ${store.name}`,
    description: `Complete your purchase at ${store.name} demo store.`,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <CheckoutClientPage slug={slug} />;
}
