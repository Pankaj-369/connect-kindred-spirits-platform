
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import OpportunitySection from '@/components/OpportunitySection';
import ImpactSection from '@/components/ImpactSection';
import NGOSpotlightSection from '@/components/NGOSpotlightSection';
import TestimonialSection from '@/components/TestimonialSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main>
        <HeroSection />
        <FeatureSection />
        <OpportunitySection />
        <ImpactSection />
        <NGOSpotlightSection />
        <TestimonialSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
