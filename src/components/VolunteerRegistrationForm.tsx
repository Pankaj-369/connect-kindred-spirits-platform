
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVolunteerRegistration } from "@/hooks/use-volunteer-registration";
import VolunteerFormFields from "@/components/volunteer/VolunteerFormFields";
import NGOFormFields from "@/components/ngo/NGOFormFields";
import { useState } from "react";

interface VolunteerRegistrationFormProps {
  ngoId?: string;
  ngoName?: string;
  isOpen: boolean;
  onClose: () => void;
}

const VolunteerRegistrationForm = ({
  ngoId,
  ngoName,
  isOpen,
  onClose,
}: VolunteerRegistrationFormProps) => {
  const [registrationType, setRegistrationType] = useState<"volunteer" | "ngo">("volunteer");
  const { form, isSubmitting, onSubmit } = useVolunteerRegistration({
    ngoId,
    ngoName,
    onClose,
    registrationType,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registration</DialogTitle>
          <DialogDescription>
            {ngoId && ngoName 
              ? `Apply to volunteer with ${ngoName}. The organization will review your application and get in touch with you.` 
              : "Register as a volunteer to help organizations or register your NGO to find volunteers."}
          </DialogDescription>
        </DialogHeader>

        {!ngoId && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">I am registering as:</h3>
            <Tabs value={registrationType} onValueChange={(value) => setRegistrationType(value as "volunteer" | "ngo")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="volunteer">A Volunteer</TabsTrigger>
                <TabsTrigger value="ngo">An NGO</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {registrationType === "volunteer" || ngoId ? (
              <VolunteerFormFields form={form as any} />
            ) : (
              <NGOFormFields form={form as any} />
            )}

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
