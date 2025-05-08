
import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

type Campaign = {
  id: number;
  title: string;
  description: string;
  goal: string;
  organizer: string;
  imageUrl: string;
  createdAt: Date;
};

const initialCampaigns: Campaign[] = [
  {
    id: 1,
    title: 'Clean Water Initiative',
    description: 'Help us provide clean water to communities in need.',
    goal: '$10,000',
    organizer: 'Water For All NGO',
    imageUrl: 'https://images.unsplash.com/photo-1544307399-86bef69e7dc8',
    createdAt: new Date('2023-05-12'),
  },
  {
    id: 2,
    title: 'Food Bank Expansion',
    description: 'Support our effort to expand our food bank to serve more families.',
    goal: '$5,000',
    organizer: 'Community Food Bank',
    imageUrl: 'https://images.unsplash.com/photo-1534732806146-b3bf32171b48',
    createdAt: new Date('2023-06-23'),
  },
  {
    id: 3,
    title: 'Education for All',
    description: 'Help us build a school in a rural area.',
    goal: '$25,000',
    organizer: 'Education First',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    createdAt: new Date('2023-04-18'),
  },
];

type FormData = {
  title: string;
  description: string;
  goal: string;
  organizer: string;
  imageUrl: string;
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      goal: '',
      organizer: profile?.ngo_name || '',
      imageUrl: '',
    }
  });
  
  const onSubmit = async (data: FormData) => {
    if (!user) return;

    const newCampaign: Campaign = {
      id: campaigns.length + 1,
      ...data,
      createdAt: new Date(),
    };
    
    // Add campaign to the local state
    setCampaigns([...campaigns, newCampaign]);
    
    try {
      // For demo purposes, we'll simulate storing in Supabase
      // In a real app, you'd add this to an actual "campaigns" table
      
      // Notify all volunteers about the new campaign
      const { data: volunteers, error: volunteersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_ngo', false);
      
      if (volunteersError) {
        console.error("Error fetching volunteers:", volunteersError);
        throw volunteersError;
      }

      // Create notifications for each volunteer
      if (volunteers && volunteers.length > 0) {
        const notifications = volunteers.map(volunteer => ({
          recipient_id: volunteer.id,
          type: "new_campaign",
          content: `New campaign: ${data.title}`,
          metadata: JSON.stringify({
            campaign_title: data.title,
            campaign_description: data.description,
            ngo_name: data.organizer,
            ngo_id: user.id,
          }),
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) {
          console.error("Error creating notifications:", notificationError);
          throw notificationError;
        }
      }

      // Send an email to all volunteers (This would be implemented with an Edge Function in a real app)
      // For now, we'll show a toast message simulating email sent
      toast({
        title: "Notifications sent",
        description: `${volunteers?.length || 0} volunteers have been notified about your new campaign.`,
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "There was an error creating notifications.",
        variant: "destructive"
      });
    }
    
    toast({
      title: "Campaign created!",
      description: "Your campaign has been successfully created.",
    });
    
    form.reset();
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Campaigns</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-connect-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create a New Campaign</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a new fundraising campaign.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter campaign title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your campaign" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fundraising Goal</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. $5,000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="organizer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organizer</FormLabel>
                          <FormControl>
                            <Input placeholder="Organization name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter image URL" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a URL for the campaign image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" className="bg-connect-primary">Create Campaign</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <img 
                  src={campaign.imageUrl} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle>{campaign.title}</CardTitle>
                <CardDescription>
                  Organized by {campaign.organizer}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {campaign.description}
                </p>
                <div className="mt-4">
                  <p className="text-sm font-medium">Goal: {campaign.goal}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">View Details</Button>
                <Button>Donate</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Campaigns;
