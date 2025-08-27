import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Environmental Volunteer',
    organization: 'Green Earth Foundation',
    content: 'Connect4Good helped me find the perfect volunteer opportunity that aligned with my passion for environmental conservation. The matching system is incredibly accurate!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    impact: '120 hours contributed',
    location: 'Mumbai, India'
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    role: 'NGO Director',
    organization: 'Education for All',
    content: 'The platform revolutionized how we connect with volunteers. We\'ve seen a 300% increase in quality applications since joining Connect4Good.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    impact: '500+ students helped',
    location: 'Delhi, India'
  },
  {
    id: 3,
    name: 'Anita Desai',
    role: 'Community Health Volunteer',
    organization: 'HealthCare Reach',
    content: 'The time tracking and certificate features motivated me to contribute more. I\'ve earned 5 certificates and made lifelong friendships through volunteering.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1559599534-c87c03e7b0fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=769&q=80',
    impact: '80 families served',
    location: 'Bangalore, India'
  },
  {
    id: 4,
    name: 'Vikram Singh',
    role: 'Tech Volunteer',
    organization: 'Digital Literacy Project',
    content: 'As a software engineer, I wanted to use my skills for social good. Connect4Good connected me with NGOs that needed tech expertise.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
    impact: '200+ people trained',
    location: 'Pune, India'
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-r from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full animate-float" />
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-secondary/10 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Community Says</h2>
          <p className="text-lg text-gray-600">
            Real stories from volunteers and NGOs who are making a difference together.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main testimonial card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
            {/* Quote decoration */}
            <div className="absolute top-8 left-8 text-primary/20">
              <Quote size={80} />
            </div>
            
            <div className="relative z-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Content */}
                <div>
                  <div className="flex items-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-5 w-5",
                          i < currentTestimonial.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        )} 
                      />
                    ))}
                  </div>
                  
                  <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                    "{currentTestimonial.content}"
                  </blockquote>
                  
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold text-gray-900">{currentTestimonial.name}</h4>
                    <p className="text-primary font-semibold">{currentTestimonial.role}</p>
                    <p className="text-gray-600">{currentTestimonial.organization}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                      <span>{currentTestimonial.impact}</span>
                      <span>{currentTestimonial.location}</span>
                    </div>
                  </div>
                </div>
                
                {/* Image */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl">
                      <img 
                        src={currentTestimonial.image} 
                        alt={currentTestimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots indicator */}
            <div className="flex space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setIsAutoPlaying(false);
                  }}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-300",
                    index === currentIndex 
                      ? "bg-primary scale-125" 
                      : "bg-gray-300 hover:bg-gray-400"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;