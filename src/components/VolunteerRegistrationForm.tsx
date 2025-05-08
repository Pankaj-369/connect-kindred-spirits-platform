
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
import { Form } from "@/components/ui/form";
import { useVolunteerRegistration } from "@/hooks/use-volunteer-registration";
import VolunteerFormFields from "@/components/volunteer/VolunteerFormFields";

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
  const { form, isSubmitting, onSubmit } = useVolunteerRegistration({
    ngoId,
    ngoName,
    onClose,
  });

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
            <VolunteerFormFields form={form} />

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
