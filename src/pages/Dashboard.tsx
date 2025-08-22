
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import RecommendedOpportunities from '@/components/RecommendedOpportunities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Heart, Star, BookmarkPlus, Users, TrendingUp, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/NotificationCenter';
import VolunteerCampaignApplications from '@/components/VolunteerCampaignApplications';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { isAuthenticated, profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalApplications: 0,
    activeVolunteers: 0,
    activeCampaigns: 0,
    recentApplications: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Mock data for the dashboard
  const upcomingEvents = [
    {
      id: 1,
      title: "Beach Cleanup",
      date: "May 15, 2025",
      organization: "Ocean Conservancy",
      location: "Miami Beach"
    },
    {
      id: 2,
      title: "Fundraising Gala",
      date: "May 25, 2025",
      organization: "Hope Foundation",
      location: "Downtown Convention Center"
    }
  ];

  const savedOpportunities = [
    {
      id: 101,
      title: "Wildlife Conservation",
      organization: "Wildlife Protection",
      date: "Flexible",
      location: "Denver, CO",
      category: "Environment"
    },
    {
      id: 102,
      title: "Homeless Shelter Assistant",
      organization: "City Hope",
      date: "Weekends",
      location: "Portland, OR",
      category: "Community"
    },
    {
      id: 103,
      title: "Digital Marketing Help",
      organization: "Arts Council",
      date: "Remote",
      location: "Virtual",
      category: "Arts & Culture"
    }
  ];

  // Default interests if not available in profile
  const interests = profile?.interests || ["Environment", "Education", "Community"];
  
  // Default location if not available in profile
  const userLocation = profile?.location || "Not specified";

  // Determine if user is volunteer or NGO
  const isNGO = profile?.is_ngo === true;

  // Fetch NGO stats
  useEffect(() => {
    if (!user || !isNGO) {
      setLoading(false);
      return;
    }

    const fetchNGOStats = async () => {
      try {
        // Get total applications from both sources
        const [volunteerApps, campaignApps, campaigns] = await Promise.all([
          supabase
            .from('volunteer_registrations')
            .select('*', { count: 'exact' })
            .eq('ngo_id', user.id),
          supabase
            .from('campaign_applications')
            .select(`
              *,
              campaigns!inner(ngo_id)
            `, { count: 'exact' })
            .eq('campaigns.ngo_id', user.id),
          supabase
            .from('campaigns')
            .select('*', { count: 'exact' })
            .eq('ngo_id', user.id)
        ]);

        // Get recent applications for activity feed
        const { data: recentApps } = await supabase
          .from('campaign_applications')
          .select(`
            *,
            campaigns!inner(title, ngo_id)
          `)
          .eq('campaigns.ngo_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const totalApps = (volunteerApps.count || 0) + (campaignApps.count || 0);
        const activeVols = (campaignApps.data?.filter(app => app.status === 'approved').length || 0);

        setStats({
          totalApplications: totalApps,
          activeVolunteers: activeVols,
          activeCampaigns: campaigns.count || 0,
          recentApplications: recentApps || []
        });
      } catch (error) {
        console.error('Error fetching NGO stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNGOStats();
  }, [user, isNGO]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Left Column - User Profile Summary */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
                  <img 
                    src={profile?.avatar_url || "https://ui-avatars.com/api/?name=Volunteer"}
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {isNGO ? profile?.ngo_name : profile?.full_name || "User"}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {userLocation}
                  </div>
                </div>
              </div>

              {!isNGO && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-connect-primary" />
                    Your Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <Star className="h-4 w-4 mr-1 text-connect-primary" />
                  Impact Stats
                </h4>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="block text-xl font-bold text-connect-primary">0</span>
                    <span className="text-xs text-muted-foreground">Hours</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="block text-xl font-bold text-connect-primary">0</span>
                    <span className="text-xs text-muted-foreground">Events</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommended Opportunities for volunteers */}
          {!isNGO && (
            <div className="mt-6">
              <RecommendedOpportunities />
            </div>
          )}
          
          {/* NGO Stats Overview */}
          {isNGO && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-connect-primary" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-connect-primary mr-2" />
                          <span className="text-sm font-medium">Total Applications</span>
                        </div>
                        <span className="text-lg font-bold text-connect-primary">{stats.totalApplications}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-connect-primary mr-2" />
                          <span className="text-sm font-medium">Active Volunteers</span>
                        </div>
                        <span className="text-lg font-bold text-connect-primary">{stats.activeVolunteers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-connect-primary mr-2" />
                          <span className="text-sm font-medium">Active Campaigns</span>
                        </div>
                        <span className="text-lg font-bold text-connect-primary">{stats.activeCampaigns}</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => navigate('/volunteer-management')}
                        className="w-full text-left px-4 py-3 bg-connect-primary text-white hover:bg-connect-primary/90 rounded-md flex justify-between items-center transition-colors"
                      >
                        <span className="font-medium">Manage Volunteers</span>
                        <span>→</span>
                      </button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Right Column - Activity & Saved */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <div className="px-6 pt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">
                    {isNGO ? "Recent Activity" : "Your Activities"}
                  </TabsTrigger>
                  <TabsTrigger value="saved">
                    {isNGO ? "Quick Actions" : "Saved Opportunities"}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview" className="flex-1 p-6">
                {!isNGO ? (
                  // Volunteer view - activities
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Your Applications</h3>
                      <VolunteerCampaignApplications />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-connect-primary" />
                        Upcoming Events
                      </h3>
                      
                      {upcomingEvents.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingEvents.map(event => (
                            <div key={event.id} className="flex items-center p-3 border rounded hover:bg-gray-50 transition-colors">
                              <div className="bg-gray-100 rounded-md h-12 w-12 flex items-center justify-center mr-4">
                                <Calendar className="h-6 w-6 text-connect-primary" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{event.title}</h4>
                                <div className="flex flex-wrap text-xs text-muted-foreground mt-1">
                                  <span className="mr-3">{event.date}</span>
                                  <span className="mr-3">•</span>
                                  <span>{event.location}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>You have no upcoming events</p>
                          <p className="text-sm mt-1">Browse opportunities to get involved!</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // NGO view - recent activity feed
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-connect-primary" />
                        Recent Activity
                      </h3>
                      
                      {loading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex items-center p-3 border rounded">
                              <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : stats.recentApplications.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentApplications.map(app => (
                            <div key={app.id} className="flex items-center p-3 border rounded hover:bg-gray-50 transition-colors">
                              <div className="bg-blue-100 rounded-full h-10 w-10 flex items-center justify-center mr-3">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{app.name} applied for "{app.campaigns?.title}"</h4>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span className="mr-3">{new Date(app.created_at).toLocaleDateString()}</span>
                                  <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                                    {app.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No recent activity</p>
                          <p className="text-sm mt-1">Applications will appear here as volunteers apply</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="saved" className="flex-1 p-6">
                {!isNGO ? (
                  // Volunteer view - saved opportunities
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <BookmarkPlus className="h-5 w-5 mr-2 text-connect-primary" />
                      Saved Opportunities
                    </h3>
                    
                    {savedOpportunities.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedOpportunities.map(opportunity => (
                          <div key={opportunity.id} className="border rounded hover:bg-gray-50 transition-colors p-4">
                            <Badge variant="outline" className="mb-2">{opportunity.category}</Badge>
                            <h4 className="font-semibold text-sm mb-1">{opportunity.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{opportunity.organization}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span className="mr-3">{opportunity.date}</span>
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{opportunity.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookmarkPlus className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No saved opportunities yet</p>
                        <p className="text-sm mt-1">Browse and bookmark opportunities you're interested in</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // NGO view - quick actions
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => navigate('/campaigns')}
                          className="p-6 border-2 border-dashed border-gray-300 hover:border-connect-primary hover:bg-connect-primary/5 rounded-lg text-center transition-colors group"
                        >
                          <Activity className="h-8 w-8 mx-auto mb-3 text-gray-400 group-hover:text-connect-primary transition-colors" />
                          <h4 className="font-semibold text-gray-900 group-hover:text-connect-primary transition-colors">Create Campaign</h4>
                          <p className="text-sm text-gray-500 mt-1">Start a new volunteer campaign</p>
                        </button>
                        <button
                          onClick={() => navigate('/volunteer-management')}
                          className="p-6 border-2 border-dashed border-gray-300 hover:border-connect-primary hover:bg-connect-primary/5 rounded-lg text-center transition-colors group"
                        >
                          <Users className="h-8 w-8 mx-auto mb-3 text-gray-400 group-hover:text-connect-primary transition-colors" />
                          <h4 className="font-semibold text-gray-900 group-hover:text-connect-primary transition-colors">Manage Volunteers</h4>
                          <p className="text-sm text-gray-500 mt-1">Review applications and manage volunteers</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
