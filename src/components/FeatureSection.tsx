
import { Calendar, Heart, Search, User } from 'lucide-react';

const features = [
  {
    icon: <Search className="h-6 w-6 text-connect-primary" />,
    title: 'Find Opportunities',
    description: 'Search for volunteer opportunities that match your skills, interests, and availability.'
  },
  {
    icon: <Calendar className="h-6 w-6 text-connect-secondary" />,
    title: 'Track Hours',
    description: 'Log and track your volunteer hours easily and get certificates for your contributions.'
  },
  {
    icon: <User className="h-6 w-6 text-connect-accent" />,
    title: 'Build Profile',
    description: 'Create a volunteer profile showcasing your skills and experience to NGOs.'
  },
  {
    icon: <Heart className="h-6 w-6 text-connect-primary" />,
    title: 'Make Impact',
    description: 'See your impact statistics and how your volunteering is making a difference.'
  }
];

const FeatureSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">How Connect4Good Works</h2>
          <p className="text-gray-600">Our platform makes it easy to find volunteering opportunities and connect with NGOs that align with your values.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="bg-gray-50 rounded-full w-14 h-14 flex items-center justify-center mb-5 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
