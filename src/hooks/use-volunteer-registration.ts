
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  volunteerRegistrationSchema, 
  VolunteerRegistrationFormValues 
} from "@/schemas/volunteerRegistrationSchema";

interface UseVolunteerRegistrationProps {
  ngoId: string;
  ngoName: string;
  onClose: () => void;
}

export const useVolunteerRegistration = ({ 
  ngoId, 
  ngoName, 
  onClose 
}: UseVolunteerRegistrationProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VolunteerRegistrationFormValues>({
    resolver: zodResolver(volunteerRegistrationSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      interest: "",
      availability: "",
    },
  });

  const onSubmit = async (values: VolunteerRegistrationFormValues) => {
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

      // Note: We're not attempting to create notifications through Supabase
      // since the 'notifications' table doesn't exist yet in the database schema
      
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

  return {
    form,
    isSubmitting,
    onSubmit,
  };
};
