
import { z } from "zod";

// Define the available interest areas for better type safety
export const interestAreas = [
  "Education",
  "Environment",
  "Healthcare",
  "Animal Welfare",
  "Poverty Alleviation",
  "Arts & Culture",
  "Human Rights",
  "Disaster Relief",
  "Community Development",
  "Other"
] as const;

// Define the available skill options
export const skillOptions = [
  "Teaching",
  "Planting",
  "Fundraising",
  "Event Management",
  "Social Media",
  "Graphic Design",
  "Web Development",
  "Photography",
  "Videography",
  "Administration",
  "Medical Assistance",
  "Counseling",
  "Legal Aid",
  "Translation",
  "Other"
] as const;

// Define the gender options
export const genderOptions = ["Male", "Female", "Other"] as const;

// Define the schema for the volunteer registration form
export const volunteerRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  dateOfBirth: z.date({
    required_error: "Please select your date of birth",
  }),
  gender: z.enum(genderOptions, {
    errorMap: () => ({ message: "Please select your gender" })
  }),
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
  interest: z.enum(interestAreas, {
    errorMap: () => ({ message: "Please select an area of interest" })
  }),
  city: z.string().min(2, "Please enter your city"),
  state: z.string().min(2, "Please enter your state"),
  pincode: z.string().min(6, "Please enter a valid pincode").max(6, "Pincode should be 6 digits"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  availability: z.string().optional(),
  experience: z.string().optional(),
  additionalInfo: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type VolunteerRegistrationFormValues = z.infer<typeof volunteerRegistrationSchema>;

// Define the schema for NGO registration form (multi-step)
export const ngoRegistrationSchema = z.object({
  // Step 1: NGO Details
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  registrationNumber: z.string().min(1, "Registration number is required for verification"),
  certificate: z.string().min(1, "Registration certificate is required"),
  email: z.string().email("Please enter a valid official email"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal('')),
  
  // Step 2: Contact & Location
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Please enter a valid pincode").max(6, "Pincode should be 6 digits"),
  
  // Step 3: Additional Info
  description: z.string().min(10, "Please provide a brief description of your organization"),
  foundingYear: z.string().min(4, "Please provide a valid founding year"),
  darpanId: z.string().min(1, "DARPAN ID is required for verification"),
  taxExemptionStatus: z.string().min(1, "Please select tax exemption status"),
  areas: z.array(z.string()).min(1, "Please select at least one area of work"),
  additionalInfo: z.string().optional(),
  
  // Step 4: Account Setup
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type NGORegistrationFormValues = z.infer<typeof ngoRegistrationSchema>;
