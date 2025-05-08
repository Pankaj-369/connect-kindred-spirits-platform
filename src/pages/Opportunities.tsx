
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import VolunteerRegistrationForm from '@/components/VolunteerRegistrationForm';
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

type Opportunity = {
  id: number;
  title: string;
  organization: string;
  organizationId: string;
  location: string;
  commitment: string;
  category: string;
  description: string;
  requirements: string[];
};

const opportunities: Opportunity[] = [
  {
    id: 1,
    title: "Volunteer Teacher",
    organization: "Education First",
    organizationId: "1",
    location: "Remote",
    commitment: "5 hours/week",
    category: "Education",
    description: "Help teach English to underprivileged children through our online program.",
    requirements: ["Fluent English", "Teaching experience (preferred)", "Reliable internet connection"]
  },
  {
    id: 2,
    title: "Food Distribution Assistant",
    organization: "Community Food Bank",
    organizationId: "2",
    location: "San Francisco, CA",
    commitment: "3 hours/week",
    category: "Food Security",
    description: "Help package and distribute food to families in need in your local community.",
    requirements: ["Ability to lift 25 lbs", "Weekend availability"]
  },
  {
    id: 3,
    title: "Web Developer",
    organization: "Water For All",
    organizationId: "3",
    location: "Remote",
    commitment: "Project-based",
    category: "IT & Technology",
    description: "Help redesign our website to better showcase our clean water initiatives around the world.",
    requirements: ["HTML/CSS/JavaScript", "Responsive design experience", "WordPress knowledge"]
  },
  {
    id: 4,
    title: "Event Coordinator",
    organization: "Animal Rescue Foundation",
    organizationId: "4",
    location: "New York, NY",
    commitment: "10 hours/month",
    category: "Animal Welfare",
    description: "Help organize fundraising events and adoption drives for rescued pets.",
    requirements: ["Event planning experience", "Excellent communication skills", "Social media knowledge"]
  },
  {
    id: 5,
    title: "Environmental Researcher",
    organization: "Green Earth Initiative",
    organizationId: "5", 
    location: "Portland, OR",
    commitment: "Part-time",
    category: "Environment",
    description: "Collect and analyze data on local environmental conditions to support conservation efforts.",
    requirements: ["Background in environmental science", "Research experience", "Data analysis skills"]
  },
];

const Opportunities = () => {
  const navigate = useNavigate();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isRegistrationFormOpen, setIsRegistrationFormOpen] = useState(false);

  const handleViewDetails = (opportunity: Opportunity) => {
    navigate(`/ngo/${opportunity.organizationId}`);
  };
  
  const handleApplyNow = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    setIsRegistrationFormOpen(true);
  };

  const handleCloseRegistrationForm = () => {
    setIsRegistrationFormOpen(false);
    setSelectedOpportunity(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Opportunities</h1>
            <p className="text-muted-foreground mt-2">
              Find ways to contribute your skills and time to make a difference
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                  <Badge variant="secondary">{opportunity.category}</Badge>
                </div>
                <CardDescription className="flex flex-col gap-1 mt-2">
                  <span className="font-medium">{opportunity.organization}</span>
                  <span>{opportunity.location}</span>
                  <span className="text-xs text-muted-foreground">{opportunity.commitment}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {opportunity.description}
                </p>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside text-xs text-muted-foreground">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleViewDetails(opportunity)}
                >
                  View Details
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => handleApplyNow(opportunity)}
                >
                  Apply Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {selectedOpportunity && (
        <VolunteerRegistrationForm
          ngoId={selectedOpportunity.organizationId}
          ngoName={selectedOpportunity.organization}
          isOpen={isRegistrationFormOpen}
          onClose={handleCloseRegistrationForm}
        />
      )}
    </div>
  );
};

export default Opportunities;
