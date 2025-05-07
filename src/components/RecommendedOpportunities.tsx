
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Opportunity = {
  id: number;
  title: string;
  organization: string;
  location: string;
  date: string;
  category: string;
  matchScore: number;
  image: string;
};

const mockRecommendations: Opportunity[] = [
  {
    id: 1,
    title: "Beach Cleanup Drive",
    organization: "Ocean Conservancy",
    location: "Miami, FL",
    date: "May 15, 2025",
    category: "Environment",
    matchScore: 95,
    image: "https://images.unsplash.com/photo-1618477461853-cf177663618e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "After-School Tutoring",
    organization: "Bright Futures",
    location: "Chicago, IL",
    date: "Ongoing",
    category: "Education",
    matchScore: 87,
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Senior Home Visit Program",
    organization: "Elder Care Alliance",
    location: "Seattle, WA",
    date: "Flexible",
    category: "Healthcare",
    matchScore: 82,
    image: "https://images.unsplash.com/photo-1576765608866-5b51037ed7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const RecommendedOpportunities = () => {
  const [recommendations] = useState<Opportunity[]>(mockRecommendations);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
          <CardDescription>Sign in to see opportunities matched to your interests</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/auth")} className="w-full bg-connect-primary hover:bg-connect-primary/90">
            Sign In to View Matches
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>Recommended For You</CardTitle>
        <CardDescription>Based on your interests and location</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-3">
          {recommendations.map((opportunity) => (
            <div key={opportunity.id} className="flex border-b last:border-0 p-4 hover:bg-gray-50 transition-colors">
              <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0 mr-4">
                <img src={opportunity.image} alt={opportunity.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{opportunity.title}</h4>
                <div className="flex items-center mt-1 text-muted-foreground text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{opportunity.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">{opportunity.category}</Badge>
                  <span className="text-connect-primary font-semibold text-xs">{opportunity.matchScore}% match</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 py-3 px-4">
        <Button 
          onClick={() => navigate('/opportunities')}
          variant="ghost" 
          className="w-full justify-between hover:bg-white hover:text-connect-primary text-sm"
        >
          <span>View more recommendations</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecommendedOpportunities;
