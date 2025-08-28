import { useState } from "react";
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
import { Sparkles, Send } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  locationType: z.string().min(1, {
    message: "Please select a location type.",
  }),
  eventType: z.string().min(1, {
    message: "Please describe your event or shooting type.",
  }),
  budget: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  dateNeeded: z.string().optional(),
  description: z.string().min(10, {
    message: "Please provide at least 10 characters describing what you're looking for.",
  }),
  preferredContactMethod: z.enum(["email", "phone"], {
    required_error: "Please select a preferred contact method.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ConciergeFormProps {
  onSuccess?: () => void;
}

export function ConciergeForm({ onSuccess }: ConciergeFormProps) {
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
      budget: undefined,
      dateNeeded: "",
      description: "",
      preferredContactMethod: "email",
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
      
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
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

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-600/30 p-6 rounded-full inline-flex items-center justify-center mb-8 shadow-md backdrop-blur-sm">
          <Sparkles className="h-12 w-12 text-amber-400" />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Request Received!</h2>
        <p className="text-gray-300 mb-10 text-lg max-w-md mx-auto">
          Thank you for your interest in our Concierge Service. Our team will review your request 
          and contact you within 24 hours to discuss your requirements in detail.
        </p>
        <Button 
          onClick={() => setIsSuccess(false)}
          className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-8 py-2.5 rounded-md shadow-md transition-all duration-300"
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="inline-flex items-center gap-2 bg-gray-800 px-4 py-1.5 rounded-full mb-6">
        <Send className="h-4 w-4 text-amber-400" />
        <span className="text-sm font-medium text-gray-300">Request Form</span>
      </div>
      <h2 className="text-3xl font-bold mb-8 text-white">Tell Us What You Need</h2>
      <Form {...form}>
        <form id="concierge-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-black/30 border-gray-700 text-white" {...field} />
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
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" className="bg-black/30 border-gray-700 text-white" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" className="bg-black/30 border-gray-700 text-white" {...field} />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    For urgent requests, we may need to call you.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Budget Range (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      className="bg-black/30 border-gray-700 text-white"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Approximate budget in USD
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Location Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/30 border-gray-700 text-white">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="studio">Photo/Film Studio</SelectItem>
                      <SelectItem value="mansion">Mansion/Estate</SelectItem>
                      <SelectItem value="warehouse">Warehouse/Industrial</SelectItem>
                      <SelectItem value="venue">Event Venue</SelectItem>
                      <SelectItem value="outdoor">Outdoor Location</SelectItem>
                      <SelectItem value="rooftop">Rooftop</SelectItem>
                      <SelectItem value="office">Office/Commercial</SelectItem>
                      <SelectItem value="retail">Retail Space</SelectItem>
                      <SelectItem value="historical">Historical Building</SelectItem>
                      <SelectItem value="other">Other (Specify in Description)</SelectItem>
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
                  <FormLabel className="text-gray-300">Event/Shooting Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/30 border-gray-700 text-white">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="photo">Photo Shoot</SelectItem>
                      <SelectItem value="film">Film/Video Production</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="corporate">Corporate Event</SelectItem>
                      <SelectItem value="party">Private Party</SelectItem>
                      <SelectItem value="meeting">Business Meeting</SelectItem>
                      <SelectItem value="workshop">Workshop/Class</SelectItem>
                      <SelectItem value="retreat">Retreat</SelectItem>
                      <SelectItem value="other">Other (Specify in Description)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dateNeeded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Date Needed (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      placeholder="Select a date" 
                      className="bg-black/30 border-gray-700 text-white"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-gray-500">
                    Leave blank if you're flexible with dates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferredContactMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-gray-300">Preferred Contact Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" className="border-gray-700 text-amber-500" />
                        <FormLabel htmlFor="email" className="font-normal text-gray-300">Email</FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone" className="border-gray-700 text-amber-500" />
                        <FormLabel htmlFor="phone" className="font-normal text-gray-300">Phone</FormLabel>
                      </div>
                    </RadioGroup>
                  </FormControl>
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
                <FormLabel className="text-gray-300">Tell us exactly what you're looking for</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please describe your requirements in detail including location preferences, specific features needed, etc." 
                    className="min-h-[150px] bg-black/30 border-gray-700 text-white resize-none" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 font-medium rounded-md transition-all duration-300 shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-black border-t-amber-900 rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}