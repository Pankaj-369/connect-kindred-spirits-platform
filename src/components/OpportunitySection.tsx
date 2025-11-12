
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpportunityCard from './OpportunityCard';
import { Button } from './ui/button';
import { Search, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CampaignApplicationForm from './CampaignApplicationForm';

const categories = ['All', 'Environment', 'Community', 'Education', 'Animals', 'Hunger Relief', 'Healthcare'];

const OpportunitySection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true);
        const { data: campaignsData, error } = await supabase
          .from('campaigns')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        if (!campaignsData) {
          setCampaigns([]);
          return;
        }

        // Fetch NGO profiles for all campaigns
        const ngoIds = [...new Set(campaignsData.map(c => c.ngo_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, ngo_name, full_name, username')
          .in('id', ngoIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const formattedCampaigns = campaignsData.map(campaign => {
          const profile = profileMap.get(campaign.ngo_id);
          return {
            id: campaign.id,
            title: campaign.title,
            organization: profile?.ngo_name || profile?.full_name || profile?.username || 'Unknown Organization',
            location: campaign.location || 'Location TBD',
            date: campaign.date ? new Date(campaign.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD',
            spots: 10, // Default since we don't have spots in DB
            image: campaign.image_url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            category: campaign.category || 'General',
            organizationId: campaign.ngo_id,
          };
        });

        setCampaigns(formattedCampaigns);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const filteredOpportunities = campaigns.filter(opportunity => {
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

  const handleApply = (campaign: any) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: '/' } });
      return;
    }
    setSelectedCampaign(campaign);
    setIsApplicationFormOpen(true);
  };

  const handleCloseApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedCampaign(null);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-connect-primary"></div>
          </div>
        </div>
      </section>
    );
  }

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
      {selectedCampaign && (
        <CampaignApplicationForm
          campaignId={selectedCampaign.id}
          campaignTitle={selectedCampaign.title}
          isOpen={isApplicationFormOpen}
          onClose={handleCloseApplicationForm}
        />
      )}
    </section>
  );
};

export default OpportunitySection;
