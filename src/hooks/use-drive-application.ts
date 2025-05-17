
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// UUID validation regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const driveApplicationSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  interest: z.string().optional(),
  availability: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type DriveApplicationFormValues = z.infer<typeof driveApplicationSchema>;

interface UseDriveApplicationProps {
  driveId: string;
  driveTitle?: string;
  onClose: () => void;
}

export const useDriveApplication = ({ 
  driveId, 
  driveTitle, 
  onClose 
}: UseDriveApplicationProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate driveId is a valid UUID
  const isValidDriveId = UUID_REGEX.test(driveId);
  
  const form = useForm<DriveApplicationFormValues>({
    resolver: zodResolver(driveApplicationSchema),
    defaultValues: {
      name: profile?.full_name || "",
      email: user?.email || "",
      phone: "",
      interest: "",
      availability: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (values: DriveApplicationFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply",
        variant: "destructive",
      });
      onClose();
      return;
    }

    if (!isValidDriveId) {
      toast({
        title: "Invalid drive ID",
        description: "The drive ID is not valid",
        variant: "destructive",
      });
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if already applied to this drive
      try {
        const { data: existingApplication, error: checkError } = await supabase
          .from('drive_applications' as any)
          .select('*')
          .eq('volunteer_id', user.id)
          .eq('drive_id', driveId)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingApplication) {
          toast({
            title: "Already applied",
            description: "You have already applied for this opportunity",
            variant: "destructive",
          });
          onClose();
          return;
        }
      } catch (err) {
        console.error("Error checking existing application:", err);
      }

      // Insert new application using a typed object
      const newApplication = {
        drive_id: driveId,
        volunteer_id: user.id,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        interest: values.interest || null,
        availability: values.availability || null,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Direct insert approach
      const { error } = await supabase
        .from('drive_applications' as any)
        .insert(newApplication);

      if (error) {
        console.error("Application error:", error);
        throw error;
      }
      
      toast({
        title: "Application submitted",
        description: `Your application for ${driveTitle || "this opportunity"} has been submitted successfully!`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Application failed",
        description: error.message || "An error occurred during application",
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
