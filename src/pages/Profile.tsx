
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

const Profile = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    bio: "",
    is_ngo: false,
    ngo_name: "",
    ngo_description: "",
    ngo_website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }

    if (profile) {
      setForm({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        is_ngo: profile.is_ngo || false,
        ngo_name: profile.ngo_name || "",
        ngo_description: profile.ngo_description || "",
        ngo_website: profile.ngo_website || "",
      });
    }
  }, [isAuthenticated, isLoading, navigate, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm({ ...form, is_ngo: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: form.username,
          full_name: form.full_name,
          bio: form.bio,
          is_ngo: form.is_ngo,
          ngo_name: form.ngo_name,
          ngo_description: form.ngo_description,
          ngo_website: form.ngo_website,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback>{profile?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <CardTitle>{profile?.full_name || profile?.username || "User"}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {profile?.is_ngo && (
              <div className="mt-2">
                <span className="badge-primary inline-block mb-2">NGO</span>
                <h3 className="text-lg font-semibold">{profile.ngo_name}</h3>
                {profile.ngo_website && (
                  <a 
                    href={profile.ngo_website.startsWith('http') ? profile.ngo_website : `https://${profile.ngo_website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-connect-primary hover:underline text-sm"
                  >
                    {profile.ngo_website}
                  </a>
                )}
              </div>
            )}
            {profile?.bio && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-1">Bio</h3>
                <p className="text-sm">{profile.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information and NGO details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <Switch
                  id="is_ngo"
                  checked={form.is_ngo}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="is_ngo">I represent an NGO</Label>
              </div>
              
              {form.is_ngo && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="font-medium">NGO Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ngo_name">NGO Name</Label>
                    <Input
                      id="ngo_name"
                      name="ngo_name"
                      value={form.ngo_name}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ngo_description">NGO Description</Label>
                    <Textarea
                      id="ngo_description"
                      name="ngo_description"
                      value={form.ngo_description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ngo_website">NGO Website</Label>
                    <Input
                      id="ngo_website"
                      name="ngo_website"
                      value={form.ngo_website}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
