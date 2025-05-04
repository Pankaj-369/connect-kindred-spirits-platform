
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const CTASection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-connect-primary to-connect-secondary opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative py-16 px-6 md:px-12 lg:px-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Make a Difference?</h2>
            <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
              Join thousands of volunteers and hundreds of NGOs on Connect4Good. Start making a positive impact in your community today.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-connect-primary hover:bg-white/90 text-lg px-8">
                Find Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 text-lg px-8">
                For NGOs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
