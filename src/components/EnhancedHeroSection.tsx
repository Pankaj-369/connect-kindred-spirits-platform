import { Button } from './ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AnimatedCounter from './AnimatedCounter';
import LiveActivityFeed from './LiveActivityFeed';

const EnhancedHeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-5" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 animate-float" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-secondary to-accent rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }} />
      </div>
      
      <div className="container relative mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main content */}
          <div className="lg:col-span-7">
            <div className="max-w-3xl">
              <div className="flex items-center mb-6 animate-fade-in">
                <Sparkles className="h-5 w-5 text-primary mr-2 animate-pulse" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                  Platform for Change
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Connecting 
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"> NGOs </span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary opacity-20 blur-lg -z-10 animate-glow" />
                </span>
                & 
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-accent"> Volunteers</span>
                  <div className="absolute -inset-2 bg-gradient-to-r from-secondary to-accent opacity-20 blur-lg -z-10 animate-glow" style={{ animationDelay: '0.5s' }} />
                </span>
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Transform communities through meaningful volunteer work. Our AI-powered platform matches passionate volunteers with impactful NGO projects, creating lasting change together.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                  onClick={() => navigate('/opportunities')}
                >
                  Find Opportunities
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="group border-2 border-primary text-primary hover:bg-primary hover:text-white text-lg px-8 py-6 transition-all duration-300"
                  onClick={() => navigate('/auth')}
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Animated statistics */}
              <div className="flex justify-start items-center gap-8 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    <AnimatedCounter end={500} suffix="+" />
                  </div>
                  <p className="text-sm text-gray-600">Active NGOs</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary">
                    <AnimatedCounter end={15000} suffix="+" />
                  </div>
                  <p className="text-sm text-gray-600">Volunteers</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent">
                    <AnimatedCounter end={2500} suffix="+" />
                  </div>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Live activity feed */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Main activity feed */}
              <div className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <LiveActivityFeed />
              </div>
              
              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center animate-float">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">98%</div>
                  <div className="text-xs text-gray-600">Success Rate</div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-28 h-28 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center animate-float text-white" style={{ animationDelay: '1s' }}>
                <div className="text-center">
                  <div className="text-lg font-bold">
                    <AnimatedCounter end={850} suffix="k+" />
                  </div>
                  <div className="text-xs">Volunteer Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;