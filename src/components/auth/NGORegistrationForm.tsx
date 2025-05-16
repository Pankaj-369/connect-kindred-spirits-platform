import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

// Schema
import { 
  ngoRegistrationSchema, 
  interestAreas,
  NGORegistrationFormValues 
} from "@/schemas/volunteerRegistrationSchema";

// Tax Exemption Status options
const taxExemptionOptions = [
  "80G",
  "12A",
  "80G & 12A",
  "FCRA",
  "Not Registered"
];

const NGORegistrationForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [certificate, setCertificate] = useState<File | null>(null);
  
  const form = useForm<NGORegistrationFormValues>({
    resolver: zodResolver(ngoRegistrationSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      certificate: "",
      email: "",
      website: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      description: "",
      foundingYear: "",
      darpanId: "",
      taxExemptionStatus: "",
      areas: [],
      additionalInfo: "",
      password: "",
      confirmPassword: "",
    },
  });

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.match(/[A-Z]/)) strength += 20;
    if (password.match(/[a-z]/)) strength += 20;
    if (password.match(/[0-9]/)) strength += 20;
    if (password.match(/[^A-Za-z0-9]/)) strength += 20;
    
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 20) return "bg-red-500";
    if (strength <= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    form.setValue("password", password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCertificate(file);
      form.setValue("certificate", file.name);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["name", "registrationNumber", "certificate", "email", "website"];
        break;
      case 2:
        fieldsToValidate = ["phone", "address", "city", "state", "pincode"];
        break;
      case 3:
        fieldsToValidate = ["description", "foundingYear", "darpanId", "taxExemptionStatus", "areas"];
        break;
    }
    
    const result = await form.trigger(fieldsToValidate);
    if (result) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = async (data: NGORegistrationFormValues) => {
    setIsLoading(true);
    
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            ngo_name: data.name,
          }
        }
      });

      if (authError) throw authError;

      // If successful, create or update NGO profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            ngo_name: data.name,
            ngo_website: data.website || null,
            ngo_description: data.description,
            is_ngo: true,
            updated_at: new Date().toISOString(),
          });

        if (profileError) throw profileError;

        // In a real implementation, you would upload the certificate file to storage
        if (certificate) {
          // This is a mock - in production, upload to Supabase Storage
          console.log("Would upload certificate:", certificate.name);
        }
      }

      toast({
        title: "NGO Registration Successful!",
        description: "Your organization has been registered with Connect4Good.",
      });

      // Redirect to login
      setTimeout(() => {
        window.location.href = "/auth?tab=login";
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error?.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          NGO Registration
        </h2>
        
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step} 
                className={cn(
                  "flex flex-col items-center",
                  step === currentStep ? "text-connect-primary" : "text-gray-400"
                )}
              >
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                    step === currentStep 
                      ? "bg-connect-primary text-white" 
                      : step < currentStep 
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  )}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                <span className="text-xs hidden md:block">
                  {step === 1 && "NGO Details"}
                  {step === 2 && "Contact & Location"}
                  {step === 3 && "Additional Info"}
                  {step === 4 && "Account Setup"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-connect-primary h-full rounded-full transition-all" 
              style={{ width: `${(currentStep / 4) * 100}%` }} 
            />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: NGO Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">NGO Details</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NGO Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your organization name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your NGO registration number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="certificate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Registration Certificate</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png" 
                            className="cursor-pointer"
                            onChange={handleFileUpload} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Please upload a scanned copy of your registration certificate (PDF, JPG, PNG)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Official Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your organization's email address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your organization's website URL" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 2: Contact & Location */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Contact & Location</h3>
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="Enter your organization's phone number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your organization's address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter pincode" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            
            {/* Step 3: Additional Info */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Additional Information</h3>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your organization's mission and activities" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="foundingYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founding Year</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 2010" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="darpanId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DARPAN ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your NGO DARPAN ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="taxExemptionStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Exemption Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tax exemption status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {taxExemptionOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="areas"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Areas of Work</FormLabel>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {interestAreas.map((area) => (
                          <FormField
                            key={area}
                            control={form.control}
                            name="areas"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={area}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(area)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, area])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== area
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {area}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other relevant information about your organization"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {/* Step 4: Account Setup */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Account Setup</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a secure password"
                              {...field}
                              onChange={onPasswordChange}
                            />
                          </FormControl>
                          <div 
                            className="absolute right-2 top-2.5 cursor-pointer" 
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress 
                            value={passwordStrength} 
                            className={cn("h-1", getPasswordStrengthColor(passwordStrength))} 
                          />
                          <p className="text-xs mt-1">
                            {passwordStrength <= 20 && "Very weak"}
                            {passwordStrength > 20 && passwordStrength <= 40 && "Weak"}
                            {passwordStrength > 40 && passwordStrength <= 60 && "Medium"}
                            {passwordStrength > 60 && passwordStrength <= 80 && "Strong"}
                            {passwordStrength > 80 && "Very strong"}
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              {...field}
                            />
                          </FormControl>
                          <div 
                            className="absolute right-2 top-2.5 cursor-pointer" 
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOffIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mt-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Registration Process
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    After submitting your registration, our team will review your application 
                    and verify the provided information. This process typically takes 1-2 business days. 
                    Upon approval, you will receive an email confirmation.
                  </p>
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-between">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button type="button" className="ml-auto" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" className="ml-auto" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>Complete Registration</>
                  )}
                </Button>
              )}
            </div>
            
            <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <a 
                href="/auth?tab=login" 
                className="text-connect-primary hover:underline"
              >
                Log in
              </a>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NGORegistrationForm;
