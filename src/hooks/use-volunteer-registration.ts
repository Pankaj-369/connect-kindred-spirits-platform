
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  volunteerRegistrationSchema, 
  ngoRegistrationSchema,
  VolunteerRegistrationFormValues,
  NGORegistrationFormValues,
  interestAreas 
} from "@/schemas/volunteerRegistrationSchema";

interface UseVolunteerRegistrationProps {
  ngoId?: string;
  ngoName?: string;
  onClose: () => void;
  registrationType: "volunteer" | "ngo";
}

export const useVolunteerRegistration = ({ 
  ngoId, 
  ngoName, 
  onClose,
  registrationType
}: UseVolunteerRegistrationProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const volunteerForm = useForm<VolunteerRegistrationFormValues>({
    resolver: zodResolver(volunteerRegistrationSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      interest: undefined as any,
      availability: "",
      skills: "",
      experience: "",
      additionalInfo: "",
    },
  });

  const ngoForm = useForm<NGORegistrationFormValues>({
    resolver: zodResolver(ngoRegistrationSchema),
    defaultValues: {
      name: profile?.ngo_name || "",
      email: user?.email || "",
      phone: "",
      website: profile?.ngo_website || "",
      description: profile?.ngo_description || "",
      registrationNumber: "",
      darpanId: "",
      certificate: "",
      additionalInfo: "",
    },
  });

  // Choose the appropriate form based on registration type
  const form = registrationType === "volunteer" ? volunteerForm : ngoForm;

  const onSubmit = async (values: VolunteerRegistrationFormValues | NGORegistrationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      if (registrationType === "volunteer" && ngoId) {
        // Volunteer registration with a specific NGO
        const volunteerValues = values as VolunteerRegistrationFormValues;
        
        // Check if already registered with this NGO
        const { data: existingRegistration, error: checkError } = await supabase
          .from("volunteer_registrations")
          .select("*")
          .eq("volunteer_id", user.id)
          .eq("ngo_id", ngoId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
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

        // Insert new registration - ensure ngoId is properly formatted
        const { error } = await supabase.from("volunteer_registrations").insert({
          volunteer_id: user.id,
          ngo_id: ngoId.toString(), // Ensure ngoId is a string
          name: volunteerValues.name,
          email: volunteerValues.email,
          phone: volunteerValues.phone || null,
          interest: volunteerValues.interest || null,
          availability: volunteerValues.availability || null,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) {
          console.error("Registration error:", error);
          throw error;
        }
        
        toast({
          title: "Registration submitted",
          description: `Your volunteer application for ${ngoName} has been submitted successfully!`,
        });

        // Send confirmation email (in a real app, this would be handled by a server function)
        // This is a mock version
        console.log(`Email would be sent to ${volunteerValues.email} confirming application to ${ngoName}`);
      } 
      else if (registrationType === "volunteer") {
        // General volunteer registration (profile update)
        const volunteerValues = values as VolunteerRegistrationFormValues;
        
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: volunteerValues.name,
            is_ngo: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Registration successful",
          description: "Your volunteer profile has been updated!",
        });
      } 
      else {
        // NGO registration
        const ngoValues = values as NGORegistrationFormValues;
        
        const { error } = await supabase
          .from("profiles")
          .update({
            ngo_name: ngoValues.name,
            ngo_website: ngoValues.website,
            ngo_description: ngoValues.description,
            is_ngo: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) {
          throw error;
        }

        toast({
          title: "Registration successful",
          description: "Your NGO profile has been created!",
        });
      }
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
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
