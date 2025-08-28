import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layout/app-layout";
import { Sparkles, Lock, User, Info, Send, Camera, Compass, MapPin } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Form schema with validation
const formSchema = z.object({
  contributionExplanation: z
    .string()
    .min(50, "Please provide at least 50 characters describing your contribution")
    .max(1000, "Your explanation cannot exceed 1000 characters"),
  photographyExperience: z
    .string()
    .min(50, "Please provide at least 50 characters about your experience")
    .max(500, "Your experience description cannot exceed 500 characters"),
  instagramHandle: z
    .string()
    .min(2, "Instagram handle is required")
    .refine(
      (val) => val.startsWith("@"),
      {
        message: "Instagram handle should start with @",
      }
    ),
  portfolioUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function SecretCornersApply() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Redirect to auth page if user is not logged in
  if (user === null) {
    navigate("/auth?redirect=/secret-corners-apply");
    return null;
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contributionExplanation: "",
      photographyExperience: "",
      instagramHandle: "",
      portfolioUrl: "",
    },
  });

  // Submit handler for the form
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create an application string that includes all form fields
      const applicationText = 
        `Contribution: ${data.contributionExplanation}\n\n` +
        `Photography Experience: ${data.photographyExperience}\n\n` +
        `Instagram: ${data.instagramHandle}\n` +
        (data.portfolioUrl ? `Portfolio: ${data.portfolioUrl}` : '');
      
      console.log('Submitting application:', applicationText);
      
      // Call API to submit application with the correct format
      const response = await apiRequest({
        url: "/api/secret-corners/apply", 
        method: "POST",
        body: {
          application: applicationText,
        }
      });

      console.log('Application submission response:', response);

      // Show success state
      toast({
        title: "Application Submitted!",
        description: "Your application for Secret Corners access is being reviewed.",
      });
      
      setShowSuccess(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      
      // Check if the error is due to authentication
      if (error.message?.includes('Authentication required') || 
          error.status === 401 || 
          error.statusCode === 401) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to submit an application. Please log in and try again.",
          variant: "destructive",
        });
        
        // Redirect to login page with return URL
        navigate(`/auth-page?redirect=/secret-corners-apply`);
      } else {
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your application. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user already has access, we should redirect them
  if (user && user.secretCornersAccess === "approved") {
    return (
      <AppLayout>
        <div className="bg-black text-white min-h-[70vh] flex items-center">
          <div className="container mx-auto px-4 py-16 relative">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 left-1/3 w-64 h-64 rounded-full bg-amber-700/5 blur-3xl"></div>
              <div className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl"></div>
            </div>
            
            <div className="max-w-3xl mx-auto relative">
              {/* Success card */}
              <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl shadow-2xl border border-amber-800/20 overflow-hidden">
                {/* Image header */}
                <div className="h-48 relative">
                  <img 
                    src="/attached_assets/6I4B6500.jpg" 
                    alt="Secret location" 
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-gray-900"></div>
                  
                  {/* Overlay content */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-6">
                    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black/30 backdrop-blur-md border border-amber-500/30 mb-4">
                      <Compass className="h-10 w-10 text-amber-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Access Granted</h1>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8 text-center">
                  <div className="mb-8">
                    <p className="text-amber-50/90 text-lg mb-6">
                      Your access to Secret Corners has been approved. You can now explore exclusive locations shared by our community members.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center mb-6">
                      <div className="py-1.5 px-4 bg-amber-900/20 text-amber-300 rounded-full text-sm">Exclusive Maps</div>
                      <div className="py-1.5 px-4 bg-amber-900/20 text-amber-300 rounded-full text-sm">Photography Tips</div>
                      <div className="py-1.5 px-4 bg-amber-900/20 text-amber-300 rounded-full text-sm">Member Community</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => navigate("/secret-corners")}
                    className="relative overflow-hidden group bg-amber-600 hover:bg-amber-700 text-black px-10 py-3 rounded-md font-medium shadow-md transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Compass className="h-5 w-5" />
                      <span>Explore Secret Corners</span>
                    </span>
                    <span className="absolute top-0 left-0 w-full h-full bg-amber-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // If user has a pending application
  if (user && user.secretCornersAccess === "pending") {
    return (
      <AppLayout>
        {/* Custom style to override footer for this page only */}
        <style dangerouslySetInnerHTML={{__html: `
          footer {
            background-color: black !important;
            border-top-color: #222 !important;
            color: white !important;
          }
          footer a, footer p, footer h3, footer .text-muted-foreground {
            color: #aaa !important;
          }
          footer a:hover {
            color: white !important;
          }
        `}} />

        <div className="bg-black text-white min-h-screen flex items-center">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-3xl mx-auto">
              <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 p-8 md:p-10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-700/5 rounded-full blur-3xl"></div>
                
                {/* Status icon */}
                <div className="mb-8 relative">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full border-t-4 border-amber-500 animate-spin"></div>
                      <Info className="h-8 w-8 text-amber-400" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-center relative z-10">
                  <h2 className="text-3xl font-bold mb-4 text-white">Application In Review</h2>
                  <div className="max-w-xl mx-auto">
                    <p className="text-amber-300 text-lg mb-6">
                      Your Secret Corners application is currently being reviewed
                    </p>
                    <div className="space-y-4 mb-8 bg-black/30 rounded-xl p-6 border border-gray-800">
                      <div className="flex items-start space-x-3 text-left">
                        <div className="bg-amber-900/20 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        </div>
                        <p className="text-gray-300 text-sm">
                          We carefully review each application to ensure members will contribute positively to the community.
                        </p>
                      </div>
                      <div className="flex items-start space-x-3 text-left">
                        <div className="bg-amber-900/20 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Applications typically take 1-3 business days to review, depending on current volume.
                        </p>
                      </div>
                      <div className="flex items-start space-x-3 text-left">
                        <div className="bg-amber-900/20 p-1.5 rounded-full flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        </div>
                        <p className="text-gray-300 text-sm">
                          You'll receive a notification once your application has been reviewed.
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="default" 
                      onClick={() => navigate("/")}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-6"
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Render the application form
  return (
    <AppLayout>
      {/* Custom style to override footer for this page only */}
      <style dangerouslySetInnerHTML={{__html: `
        footer {
          background-color: black !important;
          border-top-color: #222 !important;
          color: white !important;
        }
        footer a, footer p, footer h3, footer .text-muted-foreground {
          color: #aaa !important;
        }
        footer a:hover {
          color: white !important;
        }
      `}} />
      
      {/* Success dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="bg-gray-900 border border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-6 w-6 text-amber-400" />
              Application Submitted!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Thank you for applying to join our Secret Corners community. We've received your application and our team will review it shortly. You'll receive a notification when a decision has been made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => navigate("/")} className="bg-amber-500 hover:bg-amber-600 text-black">
              Return to Home
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hero Section with Image Overlay */}
      <div className="relative text-white">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 z-10"></div>
          <div className="w-full h-full overflow-hidden">
            <div className="w-full h-full flex">
              <div className="w-1/3 h-full opacity-70">
                <img src="/attached_assets/79affd34-8cc5-4fb9-8b73-056cf5555bbb.jpg" alt="" className="object-cover h-full w-full" />
              </div>
              <div className="w-1/3 h-full opacity-70">
                <img src="/attached_assets/9f9d2711-2da8-48ee-9e1b-71db13c786b6.jpg" alt="" className="object-cover h-full w-full" />
              </div>
              <div className="w-1/3 h-full opacity-70">
                <img src="/attached_assets/6I4B5772.jpg" alt="" className="object-cover h-full w-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-20 py-20">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full mb-8 mx-auto">
              <Compass className="h-5 w-5 text-amber-400" />
              <span className="text-sm font-medium">Secret Corners</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              Join Our <span className="text-amber-400">Hidden Community</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12">
              Apply to our curated network of photographers and explorers who discover and document the world's most extraordinary hidden locations.
            </p>
            
            <div className="flex justify-center mb-6">
              <div className="h-[1px] w-24 bg-amber-400/50"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto relative">
              <div className="group relative overflow-hidden rounded-xl aspect-square shadow-lg">
                <img 
                  src="/attached_assets/victorian28972.jpg" 
                  alt="Victorian Architecture" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-medium text-sm">Ancient Ruins</div>
              </div>
              <div className="group relative overflow-hidden rounded-xl aspect-square shadow-lg">
                <img 
                  src="/attached_assets/hotel27112.jpg" 
                  alt="Secret Location" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-medium text-sm">Hidden Hotels</div>
              </div>
              <div className="group relative overflow-hidden rounded-xl aspect-square shadow-lg">
                <img 
                  src="/attached_assets/6I4B6500.jpg" 
                  alt="Secret Beach" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-medium text-sm">Secret Beaches</div>
              </div>
              <div className="group relative overflow-hidden rounded-xl aspect-square shadow-lg">
                <img 
                  src="/attached_assets/vault2698-2.jpg" 
                  alt="Vault" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white font-medium text-sm">Underground Places</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Benefits and Application Section */}
      <div className="bg-black text-white py-16 px-4 md:px-6 relative">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-700/5 blur-3xl"></div>
          <div className="absolute bottom-40 right-10 w-56 h-56 rounded-full bg-amber-500/5 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto">
          {/* Section heading */}
          <div className="text-center mb-16 relative">
            <h2 className="text-3xl font-bold mb-4">What Makes Secret Corners Special</h2>
            <div className="flex justify-center items-center">
              <div className="h-px w-12 bg-amber-400/40"></div>
              <Compass className="mx-4 h-6 w-6 text-amber-400" />
              <div className="h-px w-12 bg-amber-400/40"></div>
            </div>
          </div>
          
          {/* Two column layout with benefits and form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left column - Feature boxes */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 p-5 border border-l-4 border-l-amber-500 border-gray-800 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-black/40 p-2 rounded-lg border border-amber-800/30 mr-4">
                    <User className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Exclusive Community</h3>
                    <p className="text-gray-400 text-sm">Join a curated network of photographers who value hidden places and responsible exploration.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 p-5 border border-l-4 border-l-amber-500 border-gray-800 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-black/40 p-2 rounded-lg border border-amber-800/30 mr-4">
                    <MapPin className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Secret Locations</h3>
                    <p className="text-gray-400 text-sm">Access our interactive map of verified hidden spots not found in typical travel guides.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 p-5 border border-l-4 border-l-amber-500 border-gray-800 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-black/40 p-2 rounded-lg border border-amber-800/30 mr-4">
                    <Lock className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Ethical Access</h3>
                    <p className="text-gray-400 text-sm">Learn responsible practices for visiting sensitive locations while preserving their beauty.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 p-5 border border-l-4 border-l-amber-500 border-gray-800 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start">
                  <div className="bg-black/40 p-2 rounded-lg border border-amber-800/30 mr-4">
                    <Camera className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-2">Photo Techniques</h3>
                    <p className="text-gray-400 text-sm">Get location-specific photography tips to capture each setting in its best light.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column - Application Form */}
            <div className="bg-gray-950 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
              {/* Section header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-950 p-6 border-b border-gray-800 relative">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  Application Form
                </h2>
              </div>
              
              {/* Form contents */}
              <div className="p-6">
                <p className="text-amber-50/80 mb-8">
                  Tell us about yourself and how you'll contribute to our community of photographers and explorers.
                  Applications are reviewed by our team within 1-3 days.
                </p>
                
                <Form {...form}>
                  <form id="application-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="contributionExplanation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                            How will you contribute to the community?
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe how you plan to contribute to the Secret Corners community. Will you share locations, photography tips, or engage with other members? What makes your perspective unique?"
                              className="min-h-[120px] bg-black border-gray-800 focus:border-amber-600/50 text-white resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500 text-xs">
                            Be specific about the value you'll bring to our community.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="photographyExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                            Tell us about your photography experience
                          </FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Share your background in photography or content creation. What's your style or specialty? How long have you been exploring unique locations?"
                              className="min-h-[100px] bg-black border-gray-800 focus:border-amber-600/50 text-white resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <FormField
                        control={form.control}
                        name="instagramHandle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                              Instagram Handle
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="@yourusername"
                                className="bg-black border-gray-800 focus:border-amber-600/50 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-gray-500 text-xs">
                              Required for portfolio review.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="portfolioUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 bg-amber-500 rounded-full"></span>
                              Portfolio URL (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="url"
                                placeholder="https://your-portfolio.com"
                                className="bg-black border-gray-800 focus:border-amber-600/50 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full relative overflow-hidden group bg-amber-600 hover:bg-amber-700 text-black py-3 font-medium rounded-md transition-all duration-300 shadow-md"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="h-4 w-4 border-2 border-black border-t-amber-900 rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Lock className="h-5 w-5" /> Submit Application
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Experiences Section with Images */}
      <div className="w-full bg-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 relative inline-block">
              <span className="relative z-10">Community Perspectives</span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-amber-500/60"></span>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mt-6">
              Our members capture moments in hidden places around the world.
              Here's what they have to say about the experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
            {/* Testimonial 1 - with image */}
            <div className="group relative h-full">
              {/* Image container */}
              <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                <img 
                  src="/attached_assets/6I4B5955.jpg" 
                  alt="Landscape" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Content container */}
              <div className="bg-gray-900 p-3 rounded-b-lg shadow-lg">
                <p className="text-gray-200 mb-3 text-xs leading-tight relative">
                  <span className="text-amber-400 absolute -top-6 left-0 text-2xl">"</span>
                  Secret Corners gave me access to locations I never knew existed in my own city. The photography tips from other members helped me capture them perfectly.
                </p>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-amber-700/40">
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-amber-200 font-semibold text-xs">
                      A
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">Alex Wu</p>
                    <p className="text-amber-300/70 text-xs">Urban Explorer</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 - with image */}
            <div className="group relative h-full">
              {/* Image container */}
              <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                <img 
                  src="/attached_assets/6I4B5772.jpg" 
                  alt="Architecture" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Content container */}
              <div className="bg-gray-900 p-3 rounded-b-lg shadow-lg">
                <p className="text-gray-200 mb-3 text-xs leading-tight relative">
                  <span className="text-amber-400 absolute -top-6 left-0 text-2xl">"</span>
                  I appreciate that our community focuses on responsible photography. We explore hidden places but always respect the environment and local guidelines.
                </p>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-amber-700/40">
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-amber-200 font-semibold text-xs">
                      S
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">Sarah Martinez</p>
                    <p className="text-amber-300/70 text-xs">Adventure Photographer</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 - with image */}
            <div className="group relative h-full">
              {/* Image container */}
              <div className="aspect-[16/9] overflow-hidden rounded-t-lg">
                <img 
                  src="/attached_assets/6I4B6500.jpg" 
                  alt="Landscape" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              
              {/* Content container */}
              <div className="bg-gray-900 p-3 rounded-b-lg shadow-lg">
                <p className="text-gray-200 mb-3 text-xs leading-tight relative">
                  <span className="text-amber-400 absolute -top-6 left-0 text-2xl">"</span>
                  The friends I've made through Secret Corners have become my go-to travel companions. We plan photography trips together to locations shared in the community.
                </p>
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full overflow-hidden mr-2 border border-amber-700/40">
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-amber-200 font-semibold text-xs">
                      T
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-white text-xs">Thomas Rowe</p>
                    <p className="text-amber-300/70 text-xs">Wilderness Photographer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 text-center bg-gray-900/50 max-w-4xl mx-auto p-8 rounded-xl border border-gray-800/80 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to discover hidden photographic treasures?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of passionate photographers who share exclusive locations and techniques.
            </p>
            <button 
              onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })} 
              className="relative overflow-hidden group bg-amber-600 hover:bg-amber-700 text-black px-10 py-3 rounded-md font-medium shadow-lg transition-all duration-300"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                <span>Apply to Join</span>
              </span>
              <span className="absolute top-0 left-0 w-full h-full bg-amber-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}