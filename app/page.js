import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import StoreShowcase from '@/components/landing/StoreShowcase';
import DashboardShowcase from '@/components/landing/DashboardShowcase';
import Benefits from '@/components/landing/Benefits';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'LaunchCart - Create Your Custom E-commerce Store in Minutes',
  description: 'LaunchCart is the premier multi-store e-commerce builder for creators, merchants, and agencies. Build and launch custom online stores with no coding required.',
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <StoreShowcase />
        <DashboardShowcase />
        <Benefits />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
