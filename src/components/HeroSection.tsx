
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white/70"></div>
      
      <div className="container relative mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-connect-dark animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Connecting 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-connect-primary to-connect-secondary"> NGOs </span> 
            & 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-connect-secondary to-connect-accent"> Volunteers</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Join us in making a difference—support community projects, animal care, and environmental initiatives. Find meaningful volunteer opportunities matching your skills and interests.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <Button 
              size="lg" 
              className="bg-connect-primary hover:bg-connect-primary/90 text-lg px-8 py-6"
              onClick={() => navigate('/opportunities')}
            >
              Find Opportunities
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-connect-secondary text-connect-secondary hover:bg-connect-secondary/10 text-lg px-8 py-6"
              onClick={() => navigate('/auth')}
            >
              For NGOs
            </Button>
          </div>
          
          <div className="flex justify-center items-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-connect-primary">500+</p>
              <p className="text-sm text-gray-600">NGOs</p>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-connect-secondary">15k+</p>
              <p className="text-sm text-gray-600">Volunteers</p>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-connect-accent">2k+</p>
              <p className="text-sm text-gray-600">Projects</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
