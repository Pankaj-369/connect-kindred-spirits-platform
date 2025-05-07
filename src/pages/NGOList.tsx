
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/Navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type NGOProfile = {
  id: string;
  ngo_name: string;
  ngo_description: string;
  ngo_website: string;
  avatar_url: string;
};

const NGOList = () => {
  const [ngos, setNgos] = useState<NGOProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, ngo_name, ngo_description, ngo_website, avatar_url')
          .eq('is_ngo', true);
        
        if (error) {
          throw error;
        }

        // Add some dummy data if no data returned from database
        const ngoData = data?.length 
          ? data 
          : [
              {
                id: "1",
                ngo_name: "Water For All",
                ngo_description: "Providing clean water solutions to communities in need worldwide.",
                ngo_website: "https://waterforall.org",
                avatar_url: "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce"
              },
              {
                id: "2",
                ngo_name: "Education First",
                ngo_description: "Building schools and supporting education in underserved areas.",
                ngo_website: "https://educationfirst.org",
                avatar_url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b"
              },
              {
                id: "3",
                ngo_name: "Community Food Bank",
                ngo_description: "Fighting hunger by providing meals to families in need.",
                ngo_website: "https://communityfoodbank.org",
                avatar_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c"
              }
            ];
        
        setNgos(ngoData as NGOProfile[]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load NGO data.",
          variant: "destructive"
        });
        console.error("Error fetching NGOs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNGOs();
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">NGO Directory</h1>
            <p className="text-muted-foreground mt-2">
              Connect with verified non-profit organizations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-connect-primary" />
            <span className="font-medium">{ngos.length} NGOs</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="opacity-70 animate-pulse">
                <CardHeader>
                  <div className="h-8 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded" />
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngos.map((ngo) => (
              <Card key={ngo.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={ngo.avatar_url} />
                    <AvatarFallback>
                      <Building className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{ngo.ngo_name}</CardTitle>
                    <CardDescription>
                      <a 
                        href={ngo.ngo_website}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {ngo.ngo_website?.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {ngo.ngo_description || "No description available."}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Profile</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && ngos.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium">No NGOs Found</h2>
            <p className="mt-2 text-muted-foreground">
              There are currently no registered NGOs in the system.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default NGOList;
