
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Volunteer',
    organization: 'Tree Planters Alliance',
    quote: 'Connect4Good helped me find meaningful volunteer opportunities that perfectly matched my skills. The platform is so easy to use, and I love being able to track my hours and see my impact.',
    image: 'https://randomuser.me/api/portraits/women/45.jpg'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Program Director',
    organization: 'Urban Gardens Initiative',
    quote: 'As an NGO, finding dedicated volunteers used to be challenging. Connect4Good has transformed our recruitment process, allowing us to find volunteers who are passionate about our cause.',
    image: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Volunteer',
    organization: 'Coastal Cleanup Project',
    quote: 'The gamification elements make volunteering even more rewarding. I love earning badges and seeing my position on the leaderboard motivates me to contribute more to my community.',
    image: 'https://randomuser.me/api/portraits/women/63.jpg'
  }
];

const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-connect-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Community Says</h2>
          <p className="text-gray-600">Hear from volunteers and NGOs about their experience with Connect4Good.</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 lg:p-12 relative">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="md:w-1/3 flex-shrink-0">
                <img 
                  src={testimonials[currentIndex].image} 
                  alt={testimonials[currentIndex].name} 
                  className="w-24 h-24 rounded-full mx-auto border-4 border-connect-primary/20"
                />
                <div className="text-center mt-4">
                  <h4 className="font-bold text-lg">{testimonials[currentIndex].name}</h4>
                  <p className="text-sm text-gray-600">{testimonials[currentIndex].role}</p>
                  <p className="text-xs text-connect-primary">{testimonials[currentIndex].organization}</p>
                </div>
              </div>
              <div className="md:w-2/3">
                <svg className="h-8 w-8 text-connect-primary/30 mb-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-lg text-gray-700 italic leading-relaxed">
                  "{testimonials[currentIndex].quote}"
                </p>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full" 
                onClick={prev}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {testimonials.map((_, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  size="sm" 
                  className={`rounded-full w-2 h-2 p-0 ${index === currentIndex ? 'bg-connect-primary' : 'bg-gray-300'}`} 
                  onClick={() => setCurrentIndex(index)} 
                />
              ))}
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full" 
                onClick={next}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
