
import { UseFormReturn } from "react-hook-form";
import { 
  FormField,
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VolunteerRegistrationFormValues } from "@/schemas/volunteerRegistrationSchema";

interface VolunteerFormFieldsProps {
  form: UseFormReturn<VolunteerRegistrationFormValues>;
}

const VolunteerFormFields = ({ form }: VolunteerFormFieldsProps) => {
  return (
    <>
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
    </>
  );
};

export default VolunteerFormFields;
