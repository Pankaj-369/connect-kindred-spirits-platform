
import EnhancedHeroSection from '@/components/EnhancedHeroSection';
import InteractiveFeatureCards from '@/components/InteractiveFeatureCards';
import OpportunitySection from '@/components/OpportunitySection';
import ImpactSection from '@/components/ImpactSection';
import NGOSpotlightSection from '@/components/NGOSpotlightSection';
import TestimonialCarousel from '@/components/TestimonialCarousel';
import CTASection from '@/components/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main>
        <EnhancedHeroSection />
        <InteractiveFeatureCards />
        <OpportunitySection />
        <ImpactSection />
        <NGOSpotlightSection />
        <TestimonialCarousel />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
