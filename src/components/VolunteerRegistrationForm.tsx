
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
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
import { LoaderCircle } from "lucide-react";

// Define the schema for the registration form
const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  interest: z.string().optional(),
  availability: z.string().optional(),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface VolunteerRegistrationFormProps {
  ngoId: string;
  ngoName: string;
  isOpen: boolean;
  onClose: () => void;
}

const VolunteerRegistrationForm = ({
  ngoId,
  ngoName,
  isOpen,
  onClose,
}: VolunteerRegistrationFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      interest: "",
      availability: "",
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register as a volunteer",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // First, check if the user is already registered with this NGO
      const { data: existingRegistration, error: checkError } = await supabase
        .from("volunteer_registrations")
        .select("*")
        .eq("volunteer_id", user.id)
        .eq("ngo_id", ngoId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // Something went wrong other than "no rows returned"
        throw checkError;
      }

      if (existingRegistration) {
        toast({
          title: "Already registered",
          description: "You have already registered with this organization",
          variant: "destructive",
        });
        onClose();
        return;
      }

      // Insert new registration
      const { error } = await supabase.from("volunteer_registrations").insert({
        volunteer_id: user.id,
        ngo_id: ngoId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        interest: values.interest,
        availability: values.availability,
        created_at: new Date().toISOString()
      });

      if (error) {
        throw error;
      }

      // Try to create a notification for the NGO
      try {
        await supabase.from("notifications").insert({
          recipient_id: ngoId,
          sender_id: user.id,
          type: "volunteer_application",
          content: `${values.name} has applied to volunteer with your organization`,
          is_read: false,
          created_at: new Date().toISOString()
        });
      } catch (notifError) {
        // Silently fail if notifications table doesn't exist
        console.error("Failed to create notification:", notifError);
      }

      toast({
        title: "Registration submitted",
        description: `Your volunteer application for ${ngoName} has been submitted successfully!`,
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register as a Volunteer</DialogTitle>
          <DialogDescription>
            Apply to volunteer with {ngoName}. The organization will review your application
            and get in touch with you.
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
                  <FormControl>
                    <Input 
                      placeholder="e.g., Education, Environment, Healthcare" 
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

export default VolunteerRegistrationForm;
