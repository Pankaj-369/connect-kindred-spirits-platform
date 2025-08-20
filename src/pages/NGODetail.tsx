
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import VolunteerRegistrationForm from "@/components/VolunteerRegistrationForm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Globe, Users, MapPin, Calendar, ExternalLink } from "lucide-react";

type NGOProfile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  ngo_name: string | null;
  ngo_description: string | null;
  ngo_website: string | null;
  location?: string;
};

const NGODetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ngo, setNgo] = useState<NGOProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);
  
  useEffect(() => {
    const fetchNGODetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .eq("is_ngo", true)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setNgo(data as NGOProfile);
        }
      } catch (error: any) {
        console.error("Error fetching NGO details:", error);
        toast({
          title: "Error",
          description: "Failed to load NGO details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNGODetails();
  }, [id, toast]);
  
  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register as a volunteer",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsRegistrationFormOpen(true);
  };
  
  // Use placeholder data if actual data is not available
  const placeholderCategories = ["Environment", "Education", "Community"];
  const placeholderActivities = [
    {
      title: "Beach Cleanup",
      date: "May 20, 2025",
      location: "Miami Beach"
    },
    {
      title: "Tutoring Program",
      date: "Ongoing",
      location: "Online"
    }
  ];
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded w-72"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
      </div>
    );
  }
  
  if (!ngo) {
    return (
      <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-medium">NGO Not Found</h2>
            <p className="mt-2 text-muted-foreground">
              The NGO you're looking for doesn't exist or isn't registered as an NGO.
            </p>
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => navigate("/ngo-list")}
            >
              Return to NGO Directory
            </Button>
          </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left column - NGO profile */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={ngo.avatar_url || ""} />
                  <AvatarFallback><Building /></AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{ngo.ngo_name || ngo.full_name || ngo.username}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    {ngo.location && (
                      <>
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{ngo.location}</span>
                      </>
                    )}
                    {ngo.ngo_website && (
                      <a 
                        href={ngo.ngo_website.startsWith('http') ? ngo.ngo_website : `https://${ngo.ngo_website}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-4 flex items-center text-blue-500 hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        <span>{ngo.ngo_website.replace(/(^\w+:|^)\/\//, '')}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">
                    {ngo.ngo_description || ngo.bio || "No description available."}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {placeholderCategories.map((category, index) => (
                      <Badge key={index} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Upcoming Activities</h3>
                  <div className="space-y-3">
                    {placeholderActivities.map((activity, index) => (
                      <div key={index} className="flex items-center p-3 border rounded">
                        <Calendar className="h-5 w-5 mr-3 text-connect-primary" />
                        <div>
                          <p className="font-medium">{activity.title}</p>
                          <div className="flex text-xs text-muted-foreground mt-1">
                            <span>{activity.date}</span>
                            <span className="mx-2">•</span>
                            <span>{activity.location}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleRegisterClick}
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Register as a Volunteer
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Right column - Impact stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Impact</CardTitle>
                <CardDescription>Organization statistics and achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-connect-primary">24</p>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-connect-primary">120</p>
                    <p className="text-sm text-muted-foreground">Volunteers</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-connect-primary">5</p>
                    <p className="text-sm text-muted-foreground">Years Active</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-3xl font-bold text-connect-primary">3K+</p>
                    <p className="text-sm text-muted-foreground">People Helped</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Volunteer Testimonials</h3>
                  <blockquote className="border-l-2 border-connect-primary pl-4 italic text-muted-foreground">
                    "Volunteering with this organization has been one of the most rewarding experiences of my life. The team is dedicated and the impact is real."
                    <footer className="text-xs mt-2 not-italic">- Sarah J, Volunteer since 2023</footer>
                  </blockquote>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      
      {/* Volunteer Registration Form Dialog */}
      <VolunteerRegistrationForm 
        ngoId={ngo.id} 
        ngoName={ngo.ngo_name || ngo.full_name || ngo.username} 
        isOpen={isRegistrationFormOpen}
        onClose={() => setIsRegistrationFormOpen(false)}
      />
    </div>
  );
};

export default NGODetail;
