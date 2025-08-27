import { useState } from 'react';
import { Search, Calendar, User, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const features = [
  {
    icon: <Search className="h-8 w-8" />,
    title: 'Smart Matching',
    description: 'AI-powered matching system finds perfect volunteer opportunities based on your skills and interests.',
    gradient: 'from-blue-500 to-purple-600',
    hoverColor: 'hover:shadow-blue-500/25',
    details: [
      'Skill-based recommendations',
      'Location proximity matching', 
      'Schedule compatibility',
      'Interest alignment'
    ]
  },
  {
    icon: <Calendar className="h-8 w-8" />,
    title: 'Time Tracking',
    description: 'Automatically track your volunteer hours and earn certificates for your meaningful contributions.',
    gradient: 'from-green-500 to-emerald-600',
    hoverColor: 'hover:shadow-green-500/25',
    details: [
      'Automatic hour logging',
      'Digital certificates',
      'Progress analytics',
      'Achievement badges'
    ]
  },
  {
    icon: <User className="h-8 w-8" />,
    title: 'Profile Building',
    description: 'Build a comprehensive volunteer profile that showcases your skills and experience to NGOs.',
    gradient: 'from-orange-500 to-red-600',
    hoverColor: 'hover:shadow-orange-500/25',
    details: [
      'Skills showcase',
      'Experience timeline',
      'Testimonials & reviews',
      'Portfolio gallery'
    ]
  },
  {
    icon: <Heart className="h-8 w-8" />,
    title: 'Impact Analytics',
    description: 'Visualize your contribution with detailed analytics and see the real-world impact of your work.',
    gradient: 'from-pink-500 to-rose-600',
    hoverColor: 'hover:shadow-pink-500/25',
    details: [
      'Impact visualization',
      'Community metrics',
      'Personal statistics',
      'Global contributions'
    ]
  }
];

const InteractiveFeatureCards = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-primary mr-2 animate-bounce-subtle" />
            <h2 className="text-4xl font-bold text-gradient">Revolutionary Features</h2>
            <Sparkles className="h-6 w-6 text-secondary ml-2 animate-bounce-subtle" />
          </div>
          <p className="text-lg text-gray-600">
            Experience next-generation volunteer management with cutting-edge features designed for maximum impact.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={cn(
                "group relative bg-white rounded-2xl p-8 border border-gray-200 transition-all duration-700 cursor-pointer",
                "hover:shadow-2xl hover:-translate-y-2",
                feature.hoverColor,
                hoveredCard === index && "scale-105",
                expandedCard === index && "md:col-span-2"
              )}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              {/* Background gradient effect */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-2xl",
                `bg-gradient-to-br ${feature.gradient}`
              )} />
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-r p-[2px]",
                  feature.gradient
                )}>
                  <div className="bg-white rounded-2xl h-full w-full" />
                </div>
              </div>
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={cn(
                  "inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6 transition-all duration-500",
                  `bg-gradient-to-br ${feature.gradient} text-white`,
                  "group-hover:scale-110 group-hover:rotate-6"
                )}>
                  {feature.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary transition-all duration-500">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Expandable details */}
                <div className={cn(
                  "transition-all duration-500 overflow-hidden",
                  expandedCard === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}>
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="font-semibold mb-4 text-gray-800">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center">
                          <div className="h-2 w-2 bg-primary rounded-full mr-2" />
                          <span className="text-sm text-gray-600">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  variant="ghost" 
                  className="group-hover:bg-primary group-hover:text-white transition-all duration-300 mt-4"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Floating particles effect */}
              {hoveredCard === index && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "absolute w-1 h-1 rounded-full animate-float",
                        `bg-gradient-to-r ${feature.gradient}`
                      )}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: `${3 + Math.random() * 2}s`
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatureCards;