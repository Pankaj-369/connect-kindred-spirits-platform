
import HeroSection from '@/components/HeroSection';
import FeatureSection from '@/components/FeatureSection';
import OpportunitySection from '@/components/OpportunitySection';
import ImpactSection from '@/components/ImpactSection';
import NGOSpotlightSection from '@/components/NGOSpotlightSection';
import TestimonialSection from '@/components/TestimonialSection';
import CTASection from '@/components/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main>
        <HeroSection />
        <FeatureSection />
        <OpportunitySection />
        <ImpactSection />
        <NGOSpotlightSection />
        <TestimonialSection />
        <CTASection />
      </main>
    </div>
  );
};

export default Index;
