import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { interestAreas } from "@/schemas/volunteerRegistrationSchema";

const applicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  interest: z.string().optional(),
  availability: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  additional_info: z.string().optional(),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

interface CampaignApplicationFormProps {
  campaignId: string;
  campaignTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const CampaignApplicationForm = ({
  campaignId,
  campaignTitle,
  isOpen,
  onClose,
}: CampaignApplicationFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      interest: "",
      availability: "",
      skills: "",
      experience: "",
      additional_info: "",
    },
  });

  const onSubmit = async (values: ApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for campaigns",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if already applied
      const { data: existingApplication, error: checkError } = await supabase
        .from("campaign_applications")
        .select("id")
        .eq("campaign_id", campaignId)
        .eq("volunteer_id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingApplication) {
        toast({
          title: "Already applied",
          description: "You have already applied to this campaign",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // Convert skills string to array
      const skillsArray = values.skills 
        ? values.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];

      // Insert new application
      const { error } = await supabase.from("campaign_applications").insert({
        campaign_id: campaignId,
        volunteer_id: user.id,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        interest: values.interest || null,
        availability: values.availability || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        experience: values.experience || null,
        additional_info: values.additional_info || null,
        status: 'pending',
      });

      if (error) {
        console.error("Application error:", error);
        throw error;
      }

      toast({
        title: "Your application has been sent to the NGO!",
        description: `Your application for "${campaignTitle}" has been submitted successfully. The NGO will review your application and get in touch with you.`,
      });

      form.reset();
      onClose();
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message || "An error occurred while submitting your application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Campaign</DialogTitle>
          <DialogDescription>
            Submit your application for "{campaignTitle}". The NGO will review your application and contact you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area of Interest (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an area of interest" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {interestAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
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
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Teaching, Web Design, Medical" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Weekends, Evenings, Remote only" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Previous Volunteer Experience (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe any previous volunteer experience" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any other information you'd like to share" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignApplicationForm;