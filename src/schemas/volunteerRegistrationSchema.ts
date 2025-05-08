
import { z } from "zod";

// Define the schema for the volunteer registration form
export const volunteerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  interest: z.string().optional(),
  availability: z.string().optional(),
});

export type VolunteerRegistrationFormValues = z.infer<typeof volunteerRegistrationSchema>;
