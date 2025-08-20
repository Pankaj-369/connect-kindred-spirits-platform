import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  campaign_id: string;
  volunteer_id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  availability: string | null;
  skills: string[] | null;
  experience: string | null;
  additional_info: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string | null;
  goal: string | null;
  image_url: string | null;
  category: string | null;
  ngo_id: string;
}

interface ApplicationWithCampaign extends Application {
  campaign: Campaign;
}

const VolunteerCampaignApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      setLoading(true);
      
      try {
        // Fetch applications with campaign details
        const { data: applicationsData, error } = await supabase
          .from('campaign_applications')
          .select(`
            *,
            campaigns!inner(*)
          `)
          .eq('volunteer_id', user.id);

        if (error) {
          console.error('Error fetching applications:', error);
        } else if (applicationsData) {
          // Transform the data to include campaign info
          const transformedData = applicationsData.map((app: any) => ({
            ...app,
            campaign: app.campaigns
          }));
          setApplications(transformedData as ApplicationWithCampaign[]);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-connect-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg font-medium">No applications yet</p>
        <p className="text-muted-foreground">
          You haven't applied to any campaigns. Browse campaigns to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{application.campaign.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  {application.campaign.location && (
                    <>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="mr-3">{application.campaign.location}</span>
                    </>
                  )}
                  {application.campaign.date && (
                    <>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(application.campaign.date).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
              <Badge
                variant={
                  application.status === 'approved'
                    ? 'default'
                    : application.status === 'rejected'
                    ? 'destructive'
                    : 'outline'
                }
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {application.campaign.description || 'No description available'}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Applied On:</p>
                <p className="text-muted-foreground">
                  {new Date(application.created_at).toLocaleDateString()}
                </p>
              </div>
              {application.campaign.goal && (
                <div>
                  <p className="font-medium">Campaign Goal:</p>
                  <p className="text-muted-foreground">{application.campaign.goal}</p>
                </div>
              )}
              {application.interest && (
                <div>
                  <p className="font-medium">Your Interest:</p>
                  <p className="text-muted-foreground">{application.interest}</p>
                </div>
              )}
              {application.availability && (
                <div>
                  <p className="font-medium">Your Availability:</p>
                  <p className="text-muted-foreground">{application.availability}</p>
                </div>
              )}
            </div>
            {application.status === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">
                  Your application is under review. The NGO will contact you once they've made a decision.
                </p>
              </div>
            )}
            {application.status === 'approved' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-700">
                  Congratulations! Your application has been approved. The NGO should contact you with next steps.
                </p>
              </div>
            )}
            {application.status === 'rejected' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  Your application was not selected for this campaign. Keep looking for other opportunities!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VolunteerCampaignApplications;