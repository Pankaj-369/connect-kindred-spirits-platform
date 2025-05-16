
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle } from 'lucide-react';
import VolunteerRegistrationForm from '@/components/auth/VolunteerRegistrationForm';
import NGORegistrationForm from '@/components/auth/NGORegistrationForm';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const { isAuthenticated, isLoading, signIn, signUp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { from?: Location };
  const [activeTab, setActiveTab] = useState<string>('login');
  const [registerType, setRegisterType] = useState<string>('simple');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    // If authenticated, redirect to dashboard or previous location
    if (isAuthenticated && !isLoading) {
      const redirectPath = state?.from?.pathname || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, state]);

  useEffect(() => {
    // Check if URL has a tab parameter
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [location]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await signIn(values.email, values.password);
      // Redirect is handled by the useEffect
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await signUp(values.email, values.password);
      // Redirect is handled by the useEffect
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-connect-primary"></div>
      </div>
    );
  }

  // Don't render the auth form at all if already authenticated
  if (isAuthenticated) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col items-center max-w-md mx-auto mb-8">
            <CardTitle className="text-2xl text-center mb-2">Connect4Good</CardTitle>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="login">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-xl">Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => setActiveTab("register")} 
                    className="text-connect-primary hover:underline"
                  >
                    Register
                  </button>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            {registerType === 'simple' ? (
              <div className="max-w-3xl mx-auto mb-8">
                <h2 className="text-2xl font-bold text-center mb-6">Join Connect4Good</h2>
                <p className="text-center mb-6">I want to register as:</p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <Card className="w-full md:w-1/2 cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setRegisterType('volunteer')}>
                    <CardHeader>
                      <CardTitle className="text-xl">Volunteer</CardTitle>
                      <CardDescription>
                        Register as an individual volunteer to help NGOs and participate in campaigns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">Create Volunteer Account</Button>
                    </CardContent>
                  </Card>
                  
                  <Card className="w-full md:w-1/2 cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setRegisterType('ngo')}>
                    <CardHeader>
                      <CardTitle className="text-xl">NGO</CardTitle>
                      <CardDescription>
                        Register your organization to find volunteers and create campaigns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">Register Your NGO</Button>
                    </CardContent>
                  </Card>
                </div>
                <p className="text-center mt-6">
                  <button 
                    onClick={() => setActiveTab("login")} 
                    className="text-connect-primary hover:underline"
                  >
                    Already have an account? Log in
                  </button>
                </p>
              </div>
            ) : registerType === 'volunteer' ? (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setRegisterType('simple')}
                  className="mb-4"
                >
                  ← Back to registration options
                </Button>
                <VolunteerRegistrationForm />
              </div>
            ) : (
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setRegisterType('simple')}
                  className="mb-4"
                >
                  ← Back to registration options
                </Button>
                <NGORegistrationForm />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
