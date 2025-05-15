
import { z } from "zod";

// Define the schema for the volunteer registration form
export const volunteerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  interest: z.string().min(1, "Please select an area of interest"),
  availability: z.string().optional(),
  skills: z.string().optional(),
  experience: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type VolunteerRegistrationFormValues = z.infer<typeof volunteerRegistrationSchema>;

// Define the schema for NGO registration form 
export const ngoRegistrationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().min(10, "Please provide a brief description of your organization"),
  certificate: z.string().min(1, "80G certificate is required for verification"),
  additionalInfo: z.string().optional(),
});

export type NGORegistrationFormValues = z.infer<typeof ngoRegistrationSchema>;
