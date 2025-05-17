
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

const VolunteerApplicationsTracker = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadApplications = async () => {
      setLoading(true);
      
      // Using any type to avoid TypeScript issues with the new tables
      try {
        // First try the direct query since we've already created the tables
        const { data, error } = await supabase
          .from('drive_applications' as any)
          .select(`
            *,
            drives:drive_id (
              title,
              location,
              date,
              category
            )
          `)
          .eq('volunteer_id', user.id);
        
        if (error) {
          console.error('Error fetching applications:', error);
          toast.error('Failed to load your applications');
        } else {
          setApplications(data || []);
        }
      } catch (err) {
        console.error('Error in application loading:', err);
        toast.error('Failed to load your applications');
      }
      
      setLoading(false);
    };

    loadApplications();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-connect-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications</CardTitle>
        <CardDescription>
          Track the status of your volunteer applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        {applications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">
                    {app.drives?.title || 'Unknown Opportunity'}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-connect-primary" />
                        <span>{app.drives?.location || 'Unknown location'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-connect-primary" />
                        <span>{app.drives?.date || 'No date specified'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(app.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg font-medium">No applications yet</p>
            <p className="text-gray-500 mt-1">
              You haven't applied to any volunteer opportunities yet. 
              Browse opportunities and apply to see your applications here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VolunteerApplicationsTracker;
