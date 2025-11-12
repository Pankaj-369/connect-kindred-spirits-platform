import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Sparkles, MapPin, Calendar, TrendingUp, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CampaignApplicationForm from './CampaignApplicationForm';

interface MatchedCampaign {
  campaignId: string;
  matchScore: number;
  reason: string;
  highlights: string[];
  campaign: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    image_url: string;
    ngo_id: string;
    ngoName: string;
  };
}

const AIMatchingDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('');
  const [matches, setMatches] = useState<MatchedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);

  const handleFindMatches = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to find matches",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-match-volunteer', {
        body: {
          interests: interests || 'General volunteering',
          skills: skills || 'Willing to learn',
          availability: availability || 'Flexible schedule',
          location: location || 'Remote or local'
        }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      
      if (data.matches && data.matches.length > 0) {
        toast({
          title: "Matches found! 🎉",
          description: `Found ${data.matches.length} perfect opportunities for you`
        });
      } else {
        toast({
          title: "No matches yet",
          description: "Try adjusting your preferences or check back later"
        });
      }
    } catch (error: any) {
      console.error('Error finding matches:', error);
      toast({
        title: "Error finding matches",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-blue-600 bg-blue-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleApply = (match: MatchedCampaign) => {
    setSelectedCampaign({
      id: match.campaign.id,
      title: match.campaign.title
    });
    setIsApplicationFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="font-semibold">AI-Powered Matching</span>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Find Your Perfect Volunteer Match
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let AI analyze your skills and interests to connect you with opportunities that truly matter
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-12 shadow-2xl border-0 overflow-hidden animate-scale-in">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Tell Us About Yourself
            </CardTitle>
            <CardDescription>
              Share your interests and preferences for personalized matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="interests">Your Interests</Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., Environment, Education, Healthcare, Community Development..."
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Your Skills</Label>
                <Textarea
                  id="skills"
                  placeholder="e.g., Teaching, Organizing events, Social media, First aid..."
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g., Weekends, Evenings, Full-time..."
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Preferred Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, Remote, Anywhere..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleFindMatches}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  AI is finding your perfect matches...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Find My Perfect Matches
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {matches.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8">
              Your Top Matches 🎯
            </h2>
            
            <div className="grid gap-6">
              {matches.map((match, index) => (
                <Card 
                  key={match.campaignId}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-1/3 h-64 md:h-auto relative overflow-hidden">
                      <img 
                        src={match.campaign.image_url || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={match.campaign.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <div className={`px-4 py-2 rounded-full font-bold text-lg shadow-lg ${getScoreColor(match.matchScore)}`}>
                          {match.matchScore}% Match
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge className="mb-2 bg-purple-100 text-purple-700">
                            {match.campaign.category}
                          </Badge>
                          <h3 className="text-2xl font-bold mb-2">{match.campaign.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{match.campaign.ngoName}</p>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4 italic">
                        "{match.reason}"
                      </p>

                      <div className="mb-4">
                        <p className="font-semibold mb-2 text-sm text-gray-600">Why this matches you:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.highlights.map((highlight, idx) => (
                            <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              ✓ {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {match.campaign.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {match.campaign.date ? new Date(match.campaign.date).toLocaleDateString() : 'Flexible'}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => navigate(`/ngo/${match.campaign.ngo_id}`)}
                          variant="outline"
                          className="flex-1"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleApply(match)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Form */}
      {selectedCampaign && (
        <CampaignApplicationForm
          campaignId={selectedCampaign.id}
          campaignTitle={selectedCampaign.title}
          isOpen={isApplicationFormOpen}
          onClose={() => {
            setIsApplicationFormOpen(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
};

export default AIMatchingDashboard;
