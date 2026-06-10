import { demoStores } from '@/lib/demoData';
import CartClientPage from './CartClientPage';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = demoStores[slug];
  if (!store) {
    return {
      title: 'Cart | Store Not Found',
    };
  }
  return {
    title: `Shopping Cart | ${store.name}`,
    description: `View your shopping cart at ${store.name} demo store.`,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  return <CartClientPage slug={slug} />;
}
