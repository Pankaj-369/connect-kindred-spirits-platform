
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

const NGOSpotlightSection = () => {
  const featuredNGOs = [
    {
      id: 1,
      name: 'Ocean Guardians',
      logo: 'https://ui-avatars.com/api/?name=Ocean+Guardians&background=0D8ABC&color=fff&size=128',
      category: 'Environment',
      description: 'Protecting marine ecosystems through conservation efforts and education.',
      opportunities: 5,
      location: 'Global',
    },
    {
      id: 2,
      name: 'Community Builders',
      logo: 'https://ui-avatars.com/api/?name=Community+Builders&background=7CB342&color=fff&size=128',
      category: 'Community',
      description: 'Creating resilient communities through local development projects.',
      opportunities: 8,
      location: 'Multiple Cities',
    },
    {
      id: 3,
      name: 'Animal Protectors',
      logo: 'https://ui-avatars.com/api/?name=Animal+Protectors&background=EF6C00&color=fff&size=128',
      category: 'Animal Welfare',
      description: 'Rescuing and protecting animals in need through shelter and advocacy.',
      opportunities: 3,
      location: 'National',
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured NGOs</h2>
          <p className="text-gray-600">Get to know our partner organizations making a difference in various fields.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredNGOs.map((ngo) => (
            <div key={ngo.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex items-center mb-4">
                <img src={ngo.logo} alt={ngo.name} className="w-16 h-16 rounded-full" />
                <div className="ml-4">
                  <h3 className="font-bold text-lg text-connect-dark">{ngo.name}</h3>
                  <span className="badge-primary">{ngo.category}</span>
                </div>
              </div>
              <p className="text-gray-600 mb-6 flex-grow">{ngo.description}</p>
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>{ngo.opportunities} opportunities</span>
                <span>{ngo.location}</span>
              </div>
              <Button 
                variant="outline" 
                className="w-full border-connect-primary text-connect-primary hover:bg-connect-primary/10"
              >
                View Profile
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button className="bg-connect-primary hover:bg-connect-primary/90">
            Explore All NGOs
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NGOSpotlightSection;
