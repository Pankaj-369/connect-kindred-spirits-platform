import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Calendar } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  campaign_title: string;
}

const ActiveVolunteers = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveVolunteers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get approved applications for campaigns owned by this NGO
        const { data, error } = await supabase
          .from('campaign_applications')
          .select(`
            name,
            email,
            phone,
            created_at,
            campaigns!inner(
              title,
              ngo_id
            )
          `)
          .eq('status', 'approved')
          .eq('campaigns.ngo_id', user.id);

        if (error) {
          console.error('Error fetching active volunteers:', error);
          return;
        }

        const activeVolunteers = (data || []).map((app: any) => ({
          id: `${app.email}-${app.campaigns.title}`, // Unique ID for each volunteer-campaign pair
          name: app.name,
          email: app.email,
          phone: app.phone,
          created_at: app.created_at,
          campaign_title: app.campaigns.title
        }));

        setVolunteers(activeVolunteers);
      } catch (error) {
        console.error('Error fetching active volunteers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveVolunteers();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (volunteers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Volunteers</CardTitle>
          <CardDescription>
            Volunteers currently working with your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No active volunteers yet. Approve volunteer applications to see them here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Active Volunteers ({volunteers.length})</h3>
      </div>
      
      <div className="grid gap-4">
        {volunteers.map((volunteer) => (
          <Card key={volunteer.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between space-x-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarFallback>
                      {volunteer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <h4 className="font-semibold">{volunteer.name}</h4>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{volunteer.email}</span>
                    </div>
                    
                    {volunteer.phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{volunteer.phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(volunteer.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <Badge variant="secondary" className="mt-2">
                      {volunteer.campaign_title}
                    </Badge>
                  </div>
                </div>
                
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActiveVolunteers;