import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, User } from 'lucide-react';

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
  location: string | null;
  date: string | null;
  ngo_id: string;
}

const CampaignApplicationsManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Record<string, Campaign>>({});

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setLoading(true);
      
      // 1. First fetch NGO's campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('ngo_id', user.id);
      
      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        toast.error('Failed to load campaigns');
        setLoading(false);
        return;
      }

      // Create a mapping of campaign ID to campaign
      const campaignsMap: Record<string, Campaign> = {};
      if (campaignsData) {
        campaignsData.forEach((campaign: any) => {
          campaignsMap[campaign.id] = campaign as Campaign;
        });
      }

      setCampaigns(campaignsMap);
      
      // If no campaigns, no need to fetch applications
      if (!campaignsData?.length) {
        setApplications([]);
        setLoading(false);
        return;
      }
      
      // 2. Fetch applications for these campaigns
      const campaignIds = campaignsData.map((c: any) => c.id);
      
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('campaign_applications')
        .select('*')
        .in('campaign_id', campaignIds);
      
      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        toast.error('Failed to load volunteer applications');
      } else if (applicationsData) {
        setApplications(applicationsData as Application[]);
      } else {
        setApplications([]);
      }
      
      setLoading(false);
    };

    loadData();
  }, [user]);

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected' | 'pending') => {
    const { error } = await supabase
      .from('campaign_applications')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', applicationId);
    
    if (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application status');
      return;
    }
    
    // Update local state
    setApplications(prev => 
      prev.map(app => 
        app.id === applicationId ? { ...app, status } : app
      )
    );
    
    toast.success(`Application ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'reset to pending'} successfully`);
  };

  const filteredApplications = applications.filter(app => app.status === activeTab);
  
  const emptyState = (
    <div className="text-center py-12">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
      <p className="mt-4 text-lg font-medium">No applications found</p>
      <p className="text-muted-foreground">
        {activeTab === 'pending'
          ? 'There are no pending applications at this time.'
          : activeTab === 'approved'
          ? 'You have not approved any applications yet.'
          : 'You have not rejected any applications yet.'}
      </p>
    </div>
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Campaign Applications</CardTitle>
        <CardDescription>
          Manage volunteer applications for your campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-connect-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredApplications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const campaign = campaigns[application.campaign_id];
                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">{application.name}</p>
                              <p className="text-sm text-muted-foreground">{application.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{campaign?.title || "Unknown Campaign"}</TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell className="text-right">
                          {application.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={() => updateApplicationStatus(application.id, 'approved')}
                              >
                                <Check className="h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-1 border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              >
                                <X className="h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {application.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateApplicationStatus(application.id, 'pending')}
                            >
                              Reset Status
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              emptyState
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CampaignApplicationsManagement;