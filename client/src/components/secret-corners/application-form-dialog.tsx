import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Heart, Users } from "lucide-react";

const applicationFormSchema = z.object({
  location: z.string().min(3, "Please enter where you live (city, country)"),
  motivation: z.string().min(20, "Please explain why you want to join (minimum 20 characters)"),
  contribution: z.string().min(20, "Please describe what you can bring to the community (minimum 20 characters)")
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

interface ApplicationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApplicationFormDialog({ open, onOpenChange }: ApplicationFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      location: "",
      motivation: "",
      contribution: ""
    }
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      console.log("Submitting Secret Corners application:", data);
      try {
        const response = await apiRequest({
          url: "/api/secret-corners-applications",
          method: "POST",
          body: data
        });
        console.log("Application submission response:", response);
        return response;
      } catch (error) {
        console.error("API request failed:", error);
        throw error;
      }
    },
    onSuccess: (response) => {
      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: response.message || "We'll review your application and get back to you soon.",
        variant: "default"
      });
      form.reset();
      // Don't close the dialog immediately - show success state
    },
    onError: (error) => {
      console.error("Application submission error:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ApplicationFormData) => {
    console.log("Form onSubmit triggered with data:", data);
    submitApplicationMutation.mutate(data);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    form.reset();
    onOpenChange(false);
  };

  if (isSubmitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold">Application Submitted!</DialogTitle>
            <DialogDescription className="text-base">
              Thank you for your interest in Secret Corners. We've received your application and will review it carefully. 
              You'll hear back from us within 48 hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Apply for Secret Corners Access</DialogTitle>
          <DialogDescription className="text-base">
            Tell us about yourself and why you'd like to join our exclusive community of location scouts and photographers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <MapPin className="w-4 h-4" />
                    Where are you located?
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Milan, Italy or New York, USA"
                      {...field}
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Heart className="w-4 h-4" />
                    Why do you want to join Secret Corners?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your passion for photography, scouting, or discovering hidden locations. What draws you to Secret Corners?"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contribution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Users className="w-4 h-4" />
                    What can you bring to the community?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your skills, local knowledge, photography expertise, or how you'd like to contribute to the Secret Corners community."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={submitApplicationMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitApplicationMutation.isPending}
                className="min-w-[120px] bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {submitApplicationMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}