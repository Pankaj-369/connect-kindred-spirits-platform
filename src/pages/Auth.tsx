import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const interestOptions = [
  "Environment", "Education", "Healthcare", "Animal Welfare", 
  "Arts & Culture", "Community Development", "Disaster Relief",
  "Human Rights", "Hunger Relief", "Sports", "Technology", "Youth"
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [fullName, setFullName] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [isNgo, setIsNgo] = useState(false);
  const [ngoName, setNgoName] = useState("");
  const [ngoDescription, setNgoDescription] = useState("");
  const [ngoWebsite, setNgoWebsite] = useState("");
  const [certificate, setCertificate] = useState<File | null>(null);
  
  const { signIn, signUp, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const tab = params.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [loc]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/profile");
    }
  }, [isAuthenticated, navigate]);

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCertificate(e.target.files[0]);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      navigate("/profile");
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const metadata = {
        full_name: fullName,
        interests: selectedInterests,
        location: location,
        is_ngo: isNgo,
        ngo_name: ngoName,
        ngo_description: ngoDescription,
        ngo_website: ngoWebsite,
      };
      
      await signUp(email, password);
    } catch (error) {
      console.error("Register error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle>Login to Connect4Good</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Join Connect4Good to connect with NGOs and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-type">Account Type</Label>
                    <div className="flex space-x-2">
                      <Button 
                        type="button"
                        variant={!isNgo ? "default" : "outline"}
                        className={!isNgo ? "bg-connect-primary hover:bg-connect-primary/90" : ""}
                        onClick={() => setIsNgo(false)}
                      >
                        Volunteer
                      </Button>
                      <Button 
                        type="button"
                        variant={isNgo ? "default" : "outline"}
                        className={isNgo ? "bg-connect-primary hover:bg-connect-primary/90" : ""}
                        onClick={() => setIsNgo(true)}
                      >
                        NGO
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{isNgo ? "Contact Person Name" : "Full Name"}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={isNgo ? "Contact person" : "Your name"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="City, State"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  
                  {isNgo ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ngoName">NGO Name</Label>
                        <Input
                          id="ngoName"
                          type="text"
                          placeholder="Organization name"
                          value={ngoName}
                          onChange={(e) => setNgoName(e.target.value)}
                          required={isNgo}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ngoDescription">NGO Description</Label>
                        <Textarea
                          id="ngoDescription"
                          placeholder="Tell us about your organization"
                          value={ngoDescription}
                          onChange={(e) => setNgoDescription(e.target.value)}
                          required={isNgo}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ngoWebsite">NGO Website</Label>
                        <Input
                          id="ngoWebsite"
                          type="url"
                          placeholder="https://yourorganization.org"
                          value={ngoWebsite}
                          onChange={(e) => setNgoWebsite(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="certificate">Upload 80G Certificate</Label>
                        <Input
                          id="certificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleCertificateChange}
                          required={isNgo}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          For verification purposes. Only PDF, JPG or PNG formats.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="interests">Your Interests</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {interestOptions.map((interest) => (
                          <Badge
                            key={interest}
                            variant={selectedInterests.includes(interest) ? "default" : "outline"}
                            className={`cursor-pointer ${
                              selectedInterests.includes(interest) 
                                ? "bg-connect-primary hover:bg-connect-primary/90" 
                                : "hover:bg-gray-100"
                            }`}
                            onClick={() => handleInterestToggle(interest)}
                          >
                            {selectedInterests.includes(interest) && (
                              <Check className="h-3 w-3 mr-1" />
                            )}
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Register"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
