
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Mail, Phone, Calendar } from "lucide-react";

type VolunteerRegistration = {
  id: string;
  volunteer_id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  availability: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  approved: <CheckCircle className="w-4 h-4" />,
  rejected: <XCircle className="w-4 h-4" />,
};

const VolunteerManagement = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<VolunteerRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!user?.id || !profile?.is_ngo) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("volunteer_registrations")
          .select("*")
          .eq("ngo_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setRegistrations(data as VolunteerRegistration[]);
      } catch (error: any) {
        console.error("Error fetching volunteer registrations:", error);
        toast({
          title: "Error",
          description: "Failed to load volunteer registrations",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegistrations();
  }, [user, profile, toast]);
  
  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("volunteer_registrations")
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      // Update the local state to reflect the change
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === id ? { ...reg, status, updated_at: new Date().toISOString() } : reg
        )
      );
      
      toast({
        title: `Volunteer ${status}`,
        description: `The volunteer has been ${status} successfully.`,
      });
    } catch (error: any) {
      console.error("Error updating volunteer status:", error);
      toast({
        title: "Error",
        description: "Failed to update volunteer status",
        variant: "destructive"
      });
    }
  };
  
  // Show message if not authenticated or not an NGO
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to access the volunteer management page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/auth"} className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!profile?.is_ngo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>NGO Access Only</CardTitle>
              <CardDescription>
                This page is only accessible to NGO accounts. Please update your profile
                to identify as an NGO if you represent an organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = "/profile"} className="w-full">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Volunteer Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage volunteer applications for {profile.ngo_name || "your organization"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              <span>Pending: {registrations.filter(r => r.status === "pending").length}</span>
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Approved: {registrations.filter(r => r.status === "approved").length}</span>
            </Badge>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Applications</CardTitle>
            <CardDescription>
              Review and manage volunteer applications for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-connect-primary mx-auto"></div>
                <p className="mt-4">Loading volunteer data...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
                <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                  When volunteers apply to your organization, they will appear here for you to review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>{registration.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{registration.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              <span>{registration.email}</span>
                            </div>
                            {registration.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1" />
                                <span>{registration.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {registration.interest && (
                              <div className="text-sm">
                                <span className="font-medium">Interest:</span> {registration.interest}
                              </div>
                            )}
                            {registration.availability && (
                              <div className="text-sm">
                                <span className="font-medium">Availability:</span> {registration.availability}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${statusColors[registration.status as keyof typeof statusColors]}`}>
                              {statusIcons[registration.status as keyof typeof statusIcons]}
                              <span className="ml-1 capitalize">{registration.status}</span>
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(registration.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {registration.status === "pending" ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                onClick={() => updateRegistrationStatus(registration.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                onClick={() => updateRegistrationStatus(registration.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <Select 
                              defaultValue={registration.status} 
                              onValueChange={(value) => updateRegistrationStatus(registration.id, value)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Change status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VolunteerManagement;
