import HeroSection from '@/components/landing/HeroSection';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import InteractiveDemo from '@/components/landing/InteractiveDemo';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <InteractiveDemo />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
