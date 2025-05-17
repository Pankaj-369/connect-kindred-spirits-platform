
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OpportunityCard from './OpportunityCard';
import DriveApplicationForm from './DriveApplicationForm';
import { Button } from './ui/button';
import { Search, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Sample data for opportunities (now representing drives from the database)
const opportunities = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000', // Using UUID format
    title: 'Beach Cleanup Drive',
    organization: 'Ocean Conservancy',
    location: 'Miami, FL',
    date: 'May 15, 2025',
    spots: 12,
    image: 'https://images.unsplash.com/photo-1618477461853-cf177663618e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Environment',
    organizationId: '201'
  },
  {
    id: '223e4567-e89b-12d3-a456-426614174001', // Using UUID format
    title: 'Homeless Shelter Assistance',
    organization: 'City Hope Foundation',
    location: 'Portland, OR',
    date: 'May 20, 2025',
    spots: 5,
    image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Community',
    organizationId: '202'
  },
  {
    id: '323e4567-e89b-12d3-a456-426614174002', // Using UUID format
    title: 'After-School Tutoring',
    organization: 'Bright Futures',
    location: 'Chicago, IL',
    date: 'Ongoing',
    spots: 8,
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Education',
    organizationId: '203'
  },
  {
    id: '423e4567-e89b-12d3-a456-426614174003', // Using UUID format
    title: 'Wildlife Conservation Project',
    organization: 'Wildlife Protection Society',
    location: 'Denver, CO',
    date: 'June 5, 2025',
    spots: 6,
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Animals',
    organizationId: '104'
  },
  {
    id: '523e4567-e89b-12d3-a456-426614174004', // Using UUID format
    title: 'Food Bank Assistant',
    organization: 'Community Food Network',
    location: 'Austin, TX',
    date: 'Every Saturday',
    spots: 15,
    image: 'https://images.unsplash.com/photo-1593113616828-7ad829b01c8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Hunger Relief',
    organizationId: '105'
  },
  {
    id: '623e4567-e89b-12d3-a456-426614174005', // Using UUID format
    title: 'Senior Home Visit Program',
    organization: 'Elder Care Alliance',
    location: 'Seattle, WA',
    date: 'Flexible',
    spots: 10,
    image: 'https://images.unsplash.com/photo-1576765608866-5b51037ed7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    category: 'Healthcare',
    organizationId: '106'
  }
];

const categories = ['All', 'Environment', 'Community', 'Education', 'Animals', 'Hunger Relief', 'Healthcare'];

const OpportunitySection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrive, setSelectedDrive] = useState<any | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  const filteredOpportunities = opportunities.filter(opportunity => {
    // Filter by category
    if (activeFilter !== 'All' && opportunity.category !== activeFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !opportunity.organization.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleApply = (drive: any) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: '/opportunities' } });
      return;
    }
    setSelectedDrive(drive);
    setIsApplicationFormOpen(true);
  };

  const handleCloseApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedDrive(null);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Volunteer Opportunities</h2>
            <p className="text-gray-600">Find opportunities that match your interests and make a difference.</p>
          </div>
          <div className="mt-4 md:mt-0 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text"
              placeholder="Search opportunities..."
              className="pl-10 pr-4 py-3 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-connect-primary/20 w-full md:w-[280px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeFilter === category ? "default" : "outline"}
              className={activeFilter === category 
                ? "bg-connect-primary hover:bg-connect-primary/90" 
                : "text-gray-600 hover:text-connect-primary"}
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <OpportunityCard
              key={opportunity.id}
              {...opportunity}
              onApply={() => handleApply(opportunity)}
            />
          ))}
        </div>
        
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No opportunities found matching your criteria.</p>
            <Button 
              className="mt-4 bg-connect-primary hover:bg-connect-primary/90"
              onClick={() => {
                setActiveFilter('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
        
        <div className="flex justify-center mt-12">
          <Button 
            className="bg-connect-primary hover:bg-connect-primary/90"
            onClick={() => navigate('/opportunities')}
          >
            Browse All Opportunities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Application Form Dialog */}
      {selectedDrive && (
        <DriveApplicationForm
          driveId={selectedDrive.id}
          driveTitle={selectedDrive.title}
          isOpen={isApplicationFormOpen}
          onClose={handleCloseApplicationForm}
        />
      )}
    </section>
  );
};

export default OpportunitySection;
