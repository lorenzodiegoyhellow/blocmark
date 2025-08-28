import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';
import { SiFacebook, SiGoogle } from 'react-icons/si';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';

// Form validation schemas
const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(5, "Please enter a valid phone number"),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export default function AuthPage() {
  const { login, register } = useAuth();
  const [showMaintenanceMessage, setShowMaintenanceMessage] = useState(false);

  // Check OAuth providers availability
  const { data: oauthStatus } = useQuery({
    queryKey: ['/api/auth/oauth-status'],
  });

  // Login form
  type LoginFormValues = {
    username: string;
    password: string;
  };

  const loginForm = useForm<LoginFormValues>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => {
      return apiRequest({
        url: "/api/login",
        method: "POST",
        body: data,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        login(response.user);
        // Redirect handled by useAuth
      } else {
        loginForm.setError("root", {
          type: "manual",
          message: response.message || "Login failed. Please check your credentials.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      
      // Handle different types of error responses
      let errorMessage = "An error occurred during login. Please try again.";
      
      if (error?.response?.data?.message) {
        // API returned structured error with message
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        // Standard error message
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Improve specific error messages for better user experience
      if (errorMessage.includes("Account has been banned")) {
        errorMessage = "🚫 Your account has been suspended. Please contact support if you believe this is an error.";
      } else if (errorMessage.includes("Account is temporarily suspended")) {
        errorMessage = "⏸️ Your account is temporarily suspended. Please contact support for more information.";
      } else if (errorMessage.includes("Invalid username or password")) {
        errorMessage = "❌ Invalid username or password. Please check your credentials and try again.";
      } else if (errorMessage.includes("Login is currently disabled due to maintenance") || 
                 error?.response?.status === 503) {
        errorMessage = "🔧 Login is currently disabled while we perform maintenance. Please try again later.";
        setShowMaintenanceMessage(true);
      }
      
      loginForm.setError("root", {
        type: "manual",
        message: errorMessage,
      });
    },
  });

  // Register form
  const registerForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      phoneNumber: "",
      termsAccepted: false,
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: z.infer<typeof authSchema>) => {
      return apiRequest({
        url: "/api/register",
        method: "POST",
        body: data,
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: "Account created!",
          description: "Your account has been successfully created.",
        });
        register(response.user);
        // Redirect handled by useAuth
      } else {
        registerForm.setError("root", {
          type: "manual",
          message: response.message || "Registration failed. Please try again.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Registration error:", error);
      
      let errorMessage = error.message || "An error occurred during registration. Please try again.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      if (errorMessage.includes("Login is currently disabled due to maintenance") || 
          error?.response?.status === 503) {
        errorMessage = "🔧 Registration is currently disabled while we perform maintenance. Please try again later.";
        setShowMaintenanceMessage(true);
      }
      
      registerForm.setError("root", {
        type: "manual",
        message: errorMessage,
      });
    },
  });

  // Image Carousel Component
  const Carousel = ({ images, interval = 6000 }: { images: string[], interval?: number }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
      }, interval);
      
      return () => clearInterval(timer);
    }, [images.length, interval]);
    
    return (
      <div className="relative w-full h-full">
        {images.map((src, index) => (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentIndex ? 1 : 0,
              zIndex: index === currentIndex ? 1 : 0
            }}
            transition={{ duration: 1.5 }}
          >
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${src})` }}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full p-4 flex items-center z-10 bg-white">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </Link>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-col md:flex-row flex-grow">
        {/* Left Side - Form */}
        <div className="md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-none shadow-xl">
              <CardHeader className="space-y-1 pb-6">
                <div className="flex justify-between items-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <CardTitle className="text-3xl font-bold text-gray-800">
                      Welcome Back
                      <motion.span
                        animate={{ 
                          rotate: [0, 10, 0, -10, 0],
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          repeatDelay: 5
                        }}
                        className="inline-block ml-2"
                      >
                        <Sparkles className="h-6 w-6 text-amber-500" />
                      </motion.span>
                    </CardTitle>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <CardDescription className="text-base mt-1">
                    Sign in to access your account and discover extraordinary spaces
                  </CardDescription>
                </motion.div>
              </CardHeader>
              
              <CardContent className="pb-8">
                {showMaintenanceMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔧</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900">Maintenance Mode Active</h4>
                        <p className="text-sm text-amber-800 mt-1">
                          Login and registration are temporarily disabled while we perform system maintenance. 
                          You can still browse the site as a visitor.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login" className="text-base py-2">Login</TabsTrigger>
                    <TabsTrigger value="register" className="text-base py-2">Register</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit((data: LoginFormValues) => {
                          console.log("Login form submitted:", JSON.stringify(data));
                          loginMutation.mutate(data);
                        })}
                        className="space-y-5"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-gray-700">
                                  Username
                                  <Star className="h-2.5 w-2.5 text-amber-500" />
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter your username" 
                                    className="h-11" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-gray-700">
                                  Password
                                  <Star className="h-2.5 w-2.5 text-amber-500" />
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Enter your password" 
                                    className="h-11" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                          className="pt-2"
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 text-base"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Logging in..." : "Sign In"}
                          </Button>
                        </motion.div>
                        
                        {loginForm.formState.errors.root && (
                          <p className="text-destructive text-sm mt-2">{loginForm.formState.errors.root.message}</p>
                        )}

                        {/* OAuth Divider */}
                        <div className="relative my-6">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">or</span>
                          </div>
                        </div>

                        {/* OAuth Buttons */}
                        {(oauthStatus?.google || oauthStatus?.facebook ) && (
                          <div className="space-y-3">
                            {oauthStatus?.facebook && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base"
                                onClick={() => window.location.href = '/api/auth/facebook'}
                              >
                                <SiFacebook className="mr-2 h-5 w-5 text-blue-600" />
                                Sign up with Facebook
                              </Button>
                            )}
                            {oauthStatus?.google && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base"
                                onClick={() => window.location.href = '/api/auth/google'}
                              >
                                <SiGoogle className="mr-2 h-5 w-5" />
                                Sign up with Google
                              </Button>
                            )}
                          </div>
                        )}
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit((data: z.infer<typeof authSchema>) => {
                          console.log("Register form submitted:", data);
                          registerMutation.mutate(data);
                        })}
                        className="space-y-3"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-gray-700">
                                  Username
                                  <Star className="h-2.5 w-2.5 text-amber-500" />
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Choose username" 
                                    className="h-9" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-gray-700">
                                  Password
                                  <Star className="h-2.5 w-2.5 text-amber-500" />
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Create a strong password" 
                                    className="h-9" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-gray-700">
                                  Email Address
                                  <Star className="h-2.5 w-2.5 text-amber-500" />
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="your@email.com" 
                                    className="h-9" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1 text-gray-700">
                                  Phone Number
                                  <Star className="h-2.5 w-2.5 text-amber-500" />
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+1 (123) 456-7890" 
                                    className="h-9" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.5 }}
                        >
                          <FormField
                            control={registerForm.control}
                            name="termsAccepted"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3 border border-gray-200">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="mt-1 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  
                                  {/* Terms and Conditions */}
                                  <FormLabel className="text-sm text-gray-700">
                                    I accept the{" "}
                                    <Dialog>
                                      <DialogTrigger className="text-gray-900 font-medium underline underline-offset-2 cursor-pointer hover:text-gray-700 transition-colors">
                                        Terms and Conditions
                                      </DialogTrigger>
                                      <DialogContent className="max-w-3xl max-h-[80vh]">
                                        <DialogHeader>
                                          <DialogTitle>Terms and Conditions</DialogTitle>
                                          <DialogDescription>
                                            Please read these terms and conditions carefully before using our service.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <ScrollArea className="h-[60vh]">
                                          <div className="p-4 text-sm">
                                            <h3 className="font-bold text-base mb-2">1. AGREEMENT TO TERMS</h3>
                                            <p className="mb-4">
                                              These Terms and Conditions constitute a legally binding agreement made between you and Blocmark, concerning your access to and use of the Blocmark website as well as any related applications.
                                            </p>
                                            
                                            <h3 className="font-bold text-base mb-2">2. DATA COLLECTION AND ADVERTISING</h3>
                                            <p className="mb-4">
                                              By using our services, you acknowledge and agree that we collect and use personal data about you in accordance with our Privacy Policy. This data may include, but is not limited to:
                                            </p>
                                            <ul className="list-disc pl-5 mb-4 space-y-1">
                                              <li>Information you provide during registration (name, email, phone number)</li>
                                              <li>Your location data when using our services</li>
                                              <li>Your browsing behavior and search history on our platform</li>
                                              <li>Device information and IP address</li>
                                            </ul>
                                            <p className="mb-4">
                                              <strong>Advertising and Marketing:</strong> We use your personal data to show you relevant advertisements and marketing communications. This includes:
                                            </p>
                                            <ul className="list-disc pl-5 mb-4 space-y-1">
                                              <li>Displaying personalized advertisements based on your interests and behavior</li>
                                              <li>Sharing anonymized data with advertising partners and analytics providers</li>
                                              <li>Using cookies and similar technologies to track your activity across devices</li>
                                              <li>Measuring the effectiveness of advertisements displayed to you</li>
                                            </ul>
                                            <p className="mb-4">
                                              You can manage your advertising preferences through your account settings or by contacting our support team.
                                            </p>
                                            
                                            <h3 className="font-bold text-base mb-2">3. USER REGISTRATION AND ACCOUNT</h3>
                                            <p className="mb-4">
                                              To access certain features of our platform, you must register for an account. You agree to provide accurate information during registration and to update your information as necessary. You are responsible for maintaining the confidentiality of your password and account information.
                                            </p>
                                            
                                            <h3 className="font-bold text-base mb-2">4. USER CONDUCT</h3>
                                            <p className="mb-4">
                                              When using our services, you agree not to:
                                            </p>
                                            <ul className="list-disc pl-5 mb-4 space-y-1">
                                              <li>Violate any applicable laws or regulations</li>
                                              <li>Infringe on the rights of others, including intellectual property rights</li>
                                              <li>Distribute harmful content or engage in disruptive behavior</li>
                                              <li>Attempt to gain unauthorized access to our systems or user accounts</li>
                                            </ul>
                                            
                                            <h3 className="font-bold text-base mb-2">5. INTELLECTUAL PROPERTY</h3>
                                            <p className="mb-4">
                                              All content on Blocmark, including text, graphics, logos, and software, is owned by Blocmark or its licensors and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express permission.
                                            </p>
                                            
                                            <h3 className="font-bold text-base mb-2">6. LIMITATION OF LIABILITY</h3>
                                            <p className="mb-4">
                                              To the maximum extent permitted by law, Blocmark shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or any content provided therein.
                                            </p>
                                            
                                            <h3 className="font-bold text-base mb-2">7. CHANGES TO TERMS</h3>
                                            <p className="mb-4">
                                              We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on the platform. Your continued use of our services after such changes constitutes your acceptance of the revised terms.
                                            </p>
                                          </div>
                                        </ScrollArea>
                                        <div className="flex justify-end">
                                          <DialogTrigger asChild>
                                            <Button variant="outline" className="mt-2">
                                              Close
                                            </Button>
                                          </DialogTrigger>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 }}
                          className="pt-1"
                        >
                          <Button
                            type="submit"
                            className="w-full h-10 text-base"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating account..." : "Create Account"}
                          </Button>
                        </motion.div>
                        
                        {registerForm.formState.errors.root && (
                          <p className="text-destructive text-sm mt-2">{registerForm.formState.errors.root.message}</p>
                        )}

                        {/* OAuth Divider */}
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">or</span>
                          </div>
                        </div>

                        {/* OAuth Buttons */}
                        {(oauthStatus?.google || oauthStatus?.facebook ) && (
                          <div className="space-y-3">
                            {oauthStatus?.facebook && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base"
                                onClick={() => window.location.href = '/api/auth/facebook'}
                              >
                                <SiFacebook className="mr-2 h-5 w-5 text-blue-600" />
                                Sign up with Facebook
                              </Button>
                            )}
                            {oauthStatus?.google && (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base"
                                onClick={() => window.location.href = '/api/auth/google'}
                              >
                                <SiGoogle className="mr-2 h-5 w-5" />
                                Sign up with Google
                              </Button>
                            )}
                          </div>
                        )}
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Side - Image Carousel with Content Overlay */}
        <div className="md:w-1/2 relative h-[300px] md:h-auto overflow-hidden">
          {/* Carousel of Background Images */}
          <div className="absolute inset-0">
            <Carousel images={[
              '/attached_assets/6I4B6500.jpg',
              '/attached_assets/hotel27112.jpg',
              '/attached_assets/victorian28972.jpg',
              '/attached_assets/6I4B5772.jpg',
              '/attached_assets/vault2698-2.jpg',
              '/attached_assets/6I4B5955.jpg',
            ]} 
            interval={6000}
            />
          </div>
          
          {/* Semi-transparent overlay - fixed position with higher z-index */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          
          {/* Content - fixed position with highest z-index */}
          <div className="absolute inset-0 z-20 h-full flex flex-col justify-center px-8 py-12 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-md"
            >
              <h2 className="text-4xl font-bold mb-6 drop-shadow-md">Discover Extraordinary Spaces</h2>
              <p className="text-lg mb-8 drop-shadow-md">
                Join our community of creators and location owners to unlock premium experiences.
              </p>
              
              <div className="space-y-6 mt-auto hidden md:block">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 shadow-lg">
                  <h3 className="text-xl font-semibold mb-2">Secret Corners Access</h3>
                  <p className="text-sm leading-relaxed">
                    After registration, apply for our exclusive invitation-only collection of hidden locations.
                    Tell us how you'll contribute to our community of creators to gain access.
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2"></div>
                    <p className="text-xs italic text-white/90">Only approved members gain access</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 italic text-sm hidden md:block">
                <blockquote className="border-l-2 border-white pl-4 py-1">
                  "Blocmark has completely transformed how we source locations for our photography. The Secret Corners access is worth the membership alone."
                </blockquote>
                <p className="font-medium mt-2 text-right">— Alex Chen, Professional Photographer</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}