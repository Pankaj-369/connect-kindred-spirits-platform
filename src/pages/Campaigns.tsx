import { useState, useEffect } from 'react';
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
  id: string;
  ngo_id?: string;
  title: string;
  description?: string;
  location?: string;
  date?: string | Date;
  goal?: string;
  image_url?: string;
  imageUrl?: string;
  category?: string;
  organizer?: string;
  created_at?: string;
  createdAt?: Date;
};

type FormData = {
  title: string;
  description: string;
  location: string;
  goal: string;
  imageUrl: string;
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  // Fetch campaigns from database on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: "Error",
          description: "Failed to load campaigns",
          variant: "destructive"
        });
      } else if (data) {
        setCampaigns(data);
      }
    };
    
    fetchCampaigns();
  }, [toast]);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      goal: '',
      imageUrl: '',
    }
  });
  
  const onSubmit = async (data: FormData) => {
    if (!user) return;

    try {
      // Insert campaign into database
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          ngo_id: user.id,
          title: data.title,
          description: data.description,
          location: data.location,
          goal: data.goal,
          image_url: data.imageUrl,
          category: 'Community', // Default category
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCampaigns(prev => [newCampaign, ...prev]);
      
      toast({
        title: "Campaign created!",
        description: "Your campaign has been successfully created and is now visible to volunteers.",
      });
      
      form.reset();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
                  Fill out the form below to create a new volunteer campaign/drive.
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
                          <Input placeholder="e.g., Beach Cleanup Drive" {...field} />
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
                            placeholder="Describe your campaign activities and goals" 
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
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Miami Beach, FL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 50 volunteers" {...field} />
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
                  src={campaign.image_url || campaign.imageUrl || "/placeholder.svg"} 
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
                  {campaign.location && `${campaign.location} • `}
                  {campaign.date && new Date(campaign.date).toLocaleDateString()}
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
                <Button>Apply Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
    </div>
  );
};

export default Campaigns;
