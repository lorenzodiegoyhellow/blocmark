import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(1, {
    message: "Phone number is required.",
  }),
  locationType: z.string().min(1, {
    message: "Please select a location type.",
  }),
  eventType: z.string().min(1, {
    message: "Please describe your event or shooting type.",
  }),
  description: z.string().min(10, {
    message: "Please provide at least 10 characters describing what you're looking for.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ConciergePage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      locationType: "",
      eventType: "",
      description: "",
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      await apiRequest({
        url: "/api/concierge",
        method: "POST",
        body: data,
      });

      toast({
        title: "Concierge Request Submitted",
        description: "We'll be in touch soon to discuss your requirements.",
      });

      setIsSuccess(true);
      form.reset();
    } catch (error) {
      console.error("Failed to submit concierge request:", error);
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppLayout>
      {/* Premium Header */}
      <div className="relative bg-gradient-to-br from-background via-primary/[0.02] to-background border-b">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container mx-auto px-4 md:px-6 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-4 py-2 rounded-full mb-6 shadow-sm">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wide">Exclusive Access</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
              Concierge Service
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Access to the world's most exclusive venues through our premium concierge network
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content - Premium Form */}
      <div className="py-16 px-4 md:px-6 min-h-[60vh] flex items-center">
        <div className="container mx-auto max-w-lg">
          <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur border border-border/50 rounded-2xl p-8 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent rounded-2xl"></div>
            <div className="relative">
            {isSuccess ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-6 rounded-full inline-flex items-center justify-center mb-8 shadow-lg">
                  <Send className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Request Received</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Our elite concierge team will review your requirements and contact you within 24 hours with curated venue options.
                </p>
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="px-8 py-2.5 rounded-full border-primary/20 hover:bg-primary/5"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full mb-4">
                    <Send className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Premium Request</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Tell Us Your Vision</h2>
                  <p className="text-sm text-muted-foreground">We'll match you with the perfect exclusive venue</p>
                </div>

                <Form {...form}>
                  <form id="concierge-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your name" 
                                className="bg-background/50 border-border/50 focus:border-primary/50 rounded-lg" 
                                {...field} 
                              />
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
                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="+1 (555) 123-4567" 
                                className="bg-background/50 border-border/50 focus:border-primary/50 rounded-lg" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="your@email.com" 
                              type="email" 
                              className="bg-background/50 border-border/50 focus:border-primary/50 rounded-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="locationType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Location Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 rounded-lg">
                                  <SelectValue placeholder="Select location type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="studio">Photo/Film Studio</SelectItem>
                                <SelectItem value="mansion">Luxury Mansion/Estate</SelectItem>
                                <SelectItem value="venue">Exclusive Event Venue</SelectItem>
                                <SelectItem value="rooftop">Premium Rooftop</SelectItem>
                                <SelectItem value="office">Executive Office Space</SelectItem>
                                <SelectItem value="historical">Historical Property</SelectItem>
                                <SelectItem value="other">Other (Specify Below)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Event Purpose</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50 rounded-lg">
                                  <SelectValue placeholder="Select purpose" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="photo">Photo Shoot</SelectItem>
                                <SelectItem value="film">Film/Video Production</SelectItem>
                                <SelectItem value="event">Private Event</SelectItem>
                                <SelectItem value="corporate">Corporate Function</SelectItem>
                                <SelectItem value="wedding">Wedding/Celebration</SelectItem>
                                <SelectItem value="meeting">Executive Meeting</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Detailed Requirements</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your vision: preferred location, dates, guest count, budget range, special requirements, aesthetic preferences..."
                              className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary/50 rounded-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting Request...</span>
                          </div>
                        ) : (
                          "Submit Exclusive Request"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ConciergePage;