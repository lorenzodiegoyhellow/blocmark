import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion, useScroll, useTransform } from "framer-motion";
import { WorldMapPreview } from "@/components/secret-corners/world-map-preview";
import { ApplicationFormDialog } from "@/components/secret-corners/application-form-dialog";
import { 
  Map, 
  Camera, 
  Compass, 
  Sparkles, 
  User,
  UserCircle,
  CircleUser,
  UserRound, 
  Locate, 
  Sun, 
  Mountain, 
  Lock,
  BadgePlus,
  Star,
  Eye,
  MapPin,
  Users,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Search,
  Rocket
} from "lucide-react";

export default function SecretCornersLanding() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [animationComplete, setAnimationComplete] = useState(false);
  const { toast } = useToast();
  const [redirected, setRedirected] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);

  // Pricing data
  const pricingTiers = [
    {
      name: "Wanderer",
      monthlyPrice: 4,
      yearlyPrice: 40, // ~17% discount
      icon: <Globe className="w-6 h-6 text-green-600" />,
      color: "green",
      tagline: "🌍 Discover at your own pace",
      features: [
        "Access up to 30 hidden locations monthly",
        "Community discussions",
        "Save favorite spots to your secret list",
        "No upload or monetization access"
      ],
      bottomNote: "Best for casual explorers and weekend creators",
      buttonText: "Apply for Access"
    },
    {
      name: "Explorer", 
      monthlyPrice: 14,
      yearlyPrice: 140, // ~17% discount  
      icon: <Search className="w-6 h-6 text-primary" />,
      color: "primary",
      isPopular: true,
      tagline: "🔎 Explore deeper. Start earning.",
      features: [
        "Access up to 100 locations per month",
        "Upload and monetize your own locations", 
        "Get basic listing insights",
        "Photography and scouting tips",
        "All Wanderer features included"
      ],
      bottomNote: "Great for content creators and side hustlers",
      buttonText: "Apply for Access"
    },
    {
      name: "Architect",
      monthlyPrice: 34,
      yearlyPrice: 340, // ~17% discount
      icon: <Rocket className="w-6 h-6 text-yellow-600" />,
      color: "yellow",
      tagline: "🚀 Full access. Full potential.",
      features: [
        "Access up to 1000 locations per month",
        "Featured placement for your best listings",
        "Advanced analytics (views, saves, trends)", 
        "Submit custom scout requests",
        "Priority support + trend reports",
        "All Explorer features included"
      ],
      bottomNote: "Made for professionals, producers, and power users",
      buttonText: "Apply for Access"
    }
  ];

  const getPrice = (tier: typeof pricingTiers[0]) => {
    return isYearly ? tier.yearlyPrice : tier.monthlyPrice;
  };

  const getSavings = (tier: typeof pricingTiers[0]) => {
    const yearlyMonthly = tier.yearlyPrice / 12;
    const savings = Math.round(((tier.monthlyPrice - yearlyMonthly) / tier.monthlyPrice) * 100);
    return savings;
  };

  // Handle apply for access button clicks
  const handleApplyForAccess = () => {
    // Open the application dialog
    setShowApplicationDialog(true);
  };
  
  // Check if the user has access to Secret Corners and redirect if they do
  useEffect(() => {
    // Skip check if already redirected or no user
    if (redirected || !user) return;
    
    async function checkAccess() {
      try {
        const response = await fetch('/api/secret-corners/access');
        const accessData = await response.json();
        
        // If user has access or is admin, redirect directly to the Secret Corners page
        if (accessData.hasAccess || user?.roles?.includes('admin')) {
          console.log("User already has access to Secret Corners, redirecting...");
          navigate('/secret-corners');
          setRedirected(true);
        }
      } catch (error) {
        console.error("Error checking Secret Corners access:", error);
      }
    }
    
    checkAccess();
  }, [user, navigate, redirected]);

  // Complete animation after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // For debugging purposes
  useEffect(() => {
    if (user) {
      console.log("Secret corners landing - User logged in:", user);
    }
    if (animationComplete) {
      console.log("Secret corners landing - Animation complete");
    }
  }, [user, animationComplete]);

  // Handle the Explore button click explicitly
  const handleExplore = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default button behavior
    console.log("Explore button clicked. User:", user);
    
    if (!user) {
      console.log("No user - Redirecting to /secret-corners-apply");
      navigate("/secret-corners-apply");
      return;
    }
    
    try {
      console.log("Checking Secret Corners access...");
      const response = await fetch('/api/secret-corners/access');
      const accessData = await response.json();
      
      console.log("Access check response:", accessData);
      
      // If the user has access or is an admin, redirect to the Secret Corners page
      if (accessData.hasAccess || user?.roles?.includes('admin')) {
        console.log("User has access, redirecting to Secret Corners");
        
        // Create a direct anchor element and click it (most reliable method)
        const link = document.createElement('a');
        link.href = '/secret-corners';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Fallback method 1
        setTimeout(() => {
          console.log("Fallback 1: window.location.href");
          window.location.href = "/secret-corners";
        }, 100);
        
        // Fallback method 2
        setTimeout(() => {
          console.log("Fallback 2: navigate function");
          navigate("/secret-corners");
        }, 200);
      } else {
        // If not, show status-specific message and redirect to the application page
        if (accessData.status === 'pending') {
          toast({
            title: "Application In Review",
            description: "Your Secret Corners application is still being reviewed. We'll notify you when it's approved.",
          });
        } else if (accessData.status === 'rejected') {
          toast({
            title: "Application Not Approved",
            description: "Your previous application wasn't approved. Please apply again with more details.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Access Required",
            description: "You need to apply for access to Secret Corners.",
          });
        }
        
        console.log("No access, redirecting to application page");
        navigate("/secret-corners-apply");
      }
    } catch (error) {
      console.error("Error checking access:", error);
      toast({
        title: "Error",
        description: "There was an error checking your access. Please try again.",
        variant: "destructive"
      });
      navigate("/secret-corners-apply");
    }
  };

  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const featureVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Features data for the cards
  const features = [
    {
      icon: <Compass className="h-8 w-8 text-primary" />,
      title: "Members Only",
      description: "Exclusive locations only accessible to our invite-only community.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Camera className="h-8 w-8 text-primary" />,
      title: "Photography Gold",
      description: "Access to unique locations that will elevate your photography portfolio.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Sun className="h-8 w-8 text-primary" />,
      title: "Hidden Viewpoints",
      description: "Secret spots with breathtaking vistas you won't find on travel sites.",
      color: "from-orange-500/20 to-yellow-500/20"
    },
    {
      icon: <Mountain className="h-8 w-8 text-primary" />,
      title: "Private Network",
      description: "Join a community of passionate explorers sharing exclusive locations.",
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: <Locate className="h-8 w-8 text-primary" />,
      title: "Vetted Locations",
      description: "Every spot is personally verified and includes precise coordinates.",
      color: "from-red-500/20 to-rose-500/20"
    },
    {
      icon: <BadgePlus className="h-8 w-8 text-primary" />,
      title: "Application Process",
      description: "Apply to contribute your own locations and receive exclusive invitations.",
      color: "from-indigo-500/20 to-purple-500/20"
    }
  ];

  // Stats data
  const stats = [
    { value: 2500, label: "Hidden Locations", icon: <MapPin className="w-6 h-6" /> },
    { value: 1500, label: "Active Members", icon: <Users className="w-6 h-6" /> },
    { value: 25, label: "Countries", icon: <Globe className="w-6 h-6" /> }
  ];



  return (
    <AppLayout>
      <div className="relative overflow-hidden">
        {/* Interactive Pricing Section */}
        <div className="relative pt-6 pb-12 md:pt-8 md:pb-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-yellow-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Choose Your Access Level</h2>
              <p className="text-muted-foreground text-base max-w-4xl mx-auto mb-6 leading-relaxed">
                Multiple ways to discover hidden locations, from community access to premium member benefits.
              </p>
              
              {/* Monthly/Yearly Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-lg font-medium transition-colors ${!isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
                  Monthly
                </span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-primary"
                />
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-medium transition-colors ${isYearly ? 'text-primary' : 'text-muted-foreground'}`}>
                    Yearly
                  </span>
                  {isYearly && (
                    <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                      Save 17%
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mt-16"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {pricingTiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  variants={featureVariants}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="group"
                >
                  <Card className={`p-6 h-full relative ${tier.isPopular ? 'overflow-visible scale-105' : 'overflow-hidden'} ${
                    tier.color === 'primary' ? 'border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl shadow-primary/10' :
                    tier.color === 'green' ? 'border-green-500/20 bg-gradient-to-br from-green-50/50 to-emerald-50/50 hover:shadow-lg hover:shadow-green-500/10' :
                    'border-yellow-500/20 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 hover:shadow-lg hover:shadow-yellow-500/10'
                  } backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      tier.color === 'primary' ? 'from-primary/10 to-primary/5' :
                      tier.color === 'green' ? 'from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100' :
                      'from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100'
                    } transition-opacity duration-300`} />
                    
                    {tier.isPopular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                        <Badge className="bg-primary text-primary-foreground px-3 py-1.5 shadow-lg text-xs font-medium">Most Popular</Badge>
                      </div>
                    )}
                    
                    <div className="relative z-10 h-full">
                      {/* Header section - icon, name, price in a sleek row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${
                            tier.color === 'primary' ? 'bg-gradient-to-br from-primary/20 to-primary/30' :
                            tier.color === 'green' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/30' :
                            'bg-gradient-to-br from-yellow-500/20 to-orange-500/30'
                          } rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            {React.cloneElement(tier.icon, { 
                              className: `w-6 h-6 ${
                                tier.color === 'primary' ? 'text-primary' :
                                tier.color === 'green' ? 'text-green-600' :
                                'text-yellow-600'
                              }` 
                            })}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold leading-tight mb-1">{tier.name}</h3>
                            {tier.tagline && (
                              <p className="text-muted-foreground text-sm leading-tight">{tier.tagline}</p>
                            )}
                          </div>
                        </div>
                        <div className={`text-right`}>
                          <div className={`text-2xl font-bold ${
                            tier.color === 'primary' ? 'text-primary' :
                            tier.color === 'green' ? 'text-green-600' :
                            'text-yellow-600'
                          }`}>
                            ${getPrice(tier)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {isYearly ? '/year' : '/month'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Features in a sleek layout */}
                      <div className="mb-5">
                        <ul className="text-left space-y-2 text-sm">
                          {tier.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start">
                              <CheckCircle className={`w-4 h-4 mr-3 mt-0.5 flex-shrink-0 ${
                                tier.color === 'primary' ? 'text-primary' :
                                tier.color === 'green' ? 'text-green-500' :
                                'text-yellow-500'
                              }`} />
                              <span className="leading-relaxed text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {tier.bottomNote && (
                          <div className="text-sm text-muted-foreground italic text-center mt-4 px-2 py-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/50">
                            {tier.bottomNote}
                          </div>
                        )}
                      </div>
                      
                      {/* Premium Button section */}
                      <div className="mt-auto">
                        <Button 
                          className={`w-full font-semibold py-3 shadow-lg transition-all duration-300 ${
                            tier.color === 'primary' 
                              ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/25 hover:shadow-primary/40' 
                              : tier.color === 'green'
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/25 hover:shadow-green-600/40'
                              : 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-yellow-600/25 hover:shadow-yellow-600/40'
                          } hover:scale-105`}
                          onClick={handleApplyForAccess}
                        >
                          {tier.buttonText}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Modern Info Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 md:py-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
              backgroundSize: '50px 50px'
            }} />
          </div>
          
          <div className="container mx-auto px-4 relative">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Exclusive Access
                <span className="block text-2xl md:text-3xl font-normal text-muted-foreground mt-2">By Invitation Only</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Join a curated community of passionate explorers discovering hidden gems that aren't found on any travel guide.
              </p>
            </motion.div>

            {/* Modern Features Layout */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true }}
            >
              {/* Left Column - Main Features */}
              <div className="space-y-6">
                <motion.div 
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="flex items-start space-x-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Vetted Locations</h3>
                      <p className="text-muted-foreground">Every location is personally verified by our community, ensuring authenticity and precise coordinates.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="flex items-start space-x-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Photography Gold</h3>
                      <p className="text-muted-foreground">Access unique locations that will elevate your photography portfolio with breathtaking, undiscovered views.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  variants={itemVariants}
                  className="group relative"
                >
                  <div className="flex items-start space-x-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">Private Network</h3>
                      <p className="text-muted-foreground">Connect with a selective community of explorers sharing exclusive locations and insider knowledge.</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - Application Process */}
              <motion.div 
                variants={itemVariants}
                className="relative"
              >
                <div className="sticky top-8 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/80 mb-4 shadow-lg">
                      <BadgePlus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Apply for Access</h3>
                    <p className="text-muted-foreground">Join our exclusive community of location scouts and photographers.</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Submit your application</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Community review process</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <span className="text-sm">Gain access to secret locations</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleApplyForAccess}
                  >
                    Apply for Access
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Limited spots available • Review process takes 2-3 days
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </div>

        {/* Animated Stats Section */}
        <div className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Secret Corners by the Numbers</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Join a growing community of explorers discovering hidden gems around the world.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-card p-6 rounded-2xl border border-border hover:border-primary/40 transition-colors duration-300 shadow-sm hover:shadow-md">
                    <div className="text-primary mb-2 flex justify-center group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.value}{stat.label.includes('%') ? '%' : '+'}
                    </div>
                    <div className="text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Interactive World Map Preview */}
        <WorldMapPreview />

        {/* Testimonials Section */}
        <div className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Members Are Saying</h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Join our community of explorers and photographers who are discovering amazing hidden locations.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    S
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Sara K.</h4>
                    <p className="text-sm text-muted-foreground">Photographer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Being invited to join Secret Corners has transformed my portfolio with unique locations
                  that most photographers will never discover."
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    M
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Miguel T.</h4>
                    <p className="text-sm text-muted-foreground">Filmmaker</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "My invitation to Secret Corners gave me access to filming locations I couldn't find anywhere else.
                  It completely elevated the quality of my indie film."
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-card p-6 rounded-lg shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    L
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Lisa W.</h4>
                    <p className="text-sm text-muted-foreground">Explorer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Getting invited to Secret Corners was the best thing that happened to my travel photography.
                  These hidden gems are truly exclusive and magical."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>

      </div>
      
      {/* Application Form Dialog */}
      <ApplicationFormDialog 
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
      />
    </AppLayout>
  );
}