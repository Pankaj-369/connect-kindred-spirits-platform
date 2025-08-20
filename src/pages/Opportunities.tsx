
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignApplicationForm from '@/components/CampaignApplicationForm';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MapPin } from 'lucide-react';

type Campaign = {
  id: string;
  ngo_id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  goal: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
};

const Opportunities = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching campaigns:', error);
      } else if (data) {
        setCampaigns(data);
      }
      setLoading(false);
    };
    
    fetchCampaigns();
  }, []);

  const handleViewDetails = (campaign: Campaign) => {
    navigate(`/ngo/${campaign.ngo_id}`);
  };
  
  const handleApplyNow = (campaign: Campaign) => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnTo: '/opportunities' } });
      return;
    }
    setSelectedCampaign(campaign);
    setIsApplicationFormOpen(true);
  };

  const handleCloseApplicationForm = () => {
    setIsApplicationFormOpen(false);
    setSelectedCampaign(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-connect-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Find active campaigns and drives to volunteer for
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{campaign.title}</CardTitle>
                  {campaign.category && <Badge variant="secondary">{campaign.category}</Badge>}
                </div>
                <CardDescription className="flex flex-col gap-1 mt-2">
                  {campaign.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {campaign.location}
                    </div>
                  )}
                  {campaign.date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(campaign.date).toLocaleDateString()}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {campaign.description || 'Join this volunteer campaign to make a difference!'}
                </p>
                {campaign.goal && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Goal:</h4>
                    <p className="text-xs text-muted-foreground">{campaign.goal}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleViewDetails(campaign)}
                >
                  View NGO
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleApplyNow(campaign)}
                >
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

      {selectedCampaign && (
        <CampaignApplicationForm
          campaignId={selectedCampaign.id}
          campaignTitle={selectedCampaign.title}
          isOpen={isApplicationFormOpen}
          onClose={handleCloseApplicationForm}
        />
      )}
    </div>
  );
};

export default Opportunities;
