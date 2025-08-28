import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useHostMode } from "@/hooks/use-host-mode";
import { AppLayout } from "@/components/layout/app-layout";
import { CommissionSection } from "@/components/sections/commission-section";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Camera, 
  CalendarDays, 
  DollarSign, 
  MessageSquare, 
  ShieldCheck, 
  Zap,
  Building,
  Home,
  PenTool,
  Bookmark,
  Music,
  Theater,
  Users,
  Tv,
  ArrowRight,
  Star,
  CheckCircle,
  Globe,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  Rocket,
  Shield,
  Settings,
  Calendar,
  User,
  UserCircle,
  CircleUser,
  UserRound
} from "lucide-react";

export default function HostLandingPage() {
  const { user } = useAuth();
  const { isHostMode, setHostMode } = useHostMode();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeUsers, setActiveUsers] = useState(147);
  const [hourlyRate, setHourlyRate] = useState(75);
  const [spaceType, setSpaceType] = useState('studio');
  const [locationTier, setLocationTier] = useState('major');

  // Calculate booking frequency based on space type and location
  const getBookingMultipliers = () => {
    const spaceMultipliers = {
      studio: { slow: [3, 5], good: [6, 9] },     // Photo studios - high demand
      event: { slow: [6, 8], good: [10, 14] },    // Event spaces - highest demand
      office: { slow: [4, 6], good: [8, 12] },    // Office spaces - consistent demand
      outdoor: { slow: [2, 3], good: [4, 6] },    // Outdoor locations - weather dependent
      warehouse: { slow: [1, 2], good: [3, 4] },  // Warehouses - specialized demand
      residential: { slow: [2, 4], good: [5, 8] }  // Residential - moderate demand
    };

    const locationMultipliers = {
      major: 1.5,    // Major cities - 50% more bookings
      medium: 1.0,   // Mid-size cities - baseline
      small: 0.7     // Small cities - 30% fewer bookings
    };

    const baseBookings = spaceMultipliers[spaceType as keyof typeof spaceMultipliers];
    const locationFactor = locationMultipliers[locationTier as keyof typeof locationMultipliers];

    return {
      slow: [
        Math.round(baseBookings.slow[0] * locationFactor),
        Math.round(baseBookings.slow[1] * locationFactor)
      ],
      good: [
        Math.round(baseBookings.good[0] * locationFactor),
        Math.round(baseBookings.good[1] * locationFactor)
      ]
    };
  };

  const bookingRanges = getBookingMultipliers();
  // Assume average 6-hour bookings
  const avgSessionHours = 6;

  // Hero background images for slideshow
  const heroImages = [
    {
      url: "./attached_assets/article_full@3x.jpg",
      alt: "Professional photography studio with lighting equipment"
    },
    {
      url: "./attached_assets/6I4B6500.jpg", 
      alt: "Modern creative workspace interior"
    },
    {
      url: "./attached_assets/1.jpg",
      alt: "Elegant residential interior space"
    }
  ];

  // Preload images and setup slideshow
  useEffect(() => {
    const imagePromises = heroImages.map((img) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = img.url;
        image.onload = resolve;
        image.onerror = reject;
      });
    });

    Promise.all(imagePromises)
      .then(() => setImagesLoaded(true))
      .catch(() => setImagesLoaded(true));
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [imagesLoaded, heroImages.length]);

  // Active users counter with realistic random changes
  useEffect(() => {
    const updateActiveUsers = () => {
      const change = Math.floor(Math.random() * 7) - 3; // Random change between -3 and +3
      setActiveUsers(prev => {
        const newCount = prev + change;
        // Keep between 100-200 with some buffer
        if (newCount < 100) return 100 + Math.floor(Math.random() * 10);
        if (newCount > 200) return 190 + Math.floor(Math.random() * 10);
        return newCount;
      });
    };

    // Update every 8-15 seconds for realistic feel
    const getRandomInterval = () => 8000 + Math.random() * 7000;
    
    let timeoutId: NodeJS.Timeout;
    const scheduleNextUpdate = () => {
      timeoutId = setTimeout(() => {
        updateActiveUsers();
        scheduleNextUpdate();
      }, getRandomInterval());
    };
    
    scheduleNextUpdate();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const categories = [
    { 
      title: "Residential Properties", 
      icon: <Home className="h-8 w-8" />, 
      description: "Homes & apartments",
      color: "from-blue-500 to-cyan-500",
      percentage: "34%",
      popularity: "Most Popular"
    },
    { 
      title: "Studios", 
      icon: <Camera className="h-8 w-8" />, 
      description: "Photo & creative studios",
      color: "from-purple-500 to-indigo-500",
      percentage: "28%",
      popularity: "High Demand"
    },
    { 
      title: "Event Spaces", 
      icon: <Users className="h-8 w-8" />, 
      description: "Parties & gatherings",
      color: "from-teal-500 to-cyan-500",
      percentage: "18%",
      popularity: "Growing"
    },
    { 
      title: "Creative Spaces", 
      icon: <PenTool className="h-8 w-8" />, 
      description: "Art & design spaces",
      color: "from-orange-500 to-red-500",
      percentage: "12%",
      popularity: "Trending"
    },
    { 
      title: "Commercial Spaces", 
      icon: <Building className="h-8 w-8" />, 
      description: "Offices & retail",
      color: "from-green-500 to-emerald-500",
      percentage: "8%",
      popularity: "Specialized"
    }
  ];

  // Unified timeline combining how it works and benefits
  const journeySteps = [
    {
      step: "1",
      type: "action",
      title: "Create Your Listing",
      description: "Upload stunning photos and set competitive pricing for your space",
      icon: <Camera className="w-6 h-6" />,
      benefit: "Professional setup tools make it simple"
    },
    {
      step: "2", 
      type: "action",
      title: "Get Discovered",
      description: "Your space appears in curated collections and search results",
      icon: <Globe className="w-6 h-6" />,
      benefit: "Spotlight exposure to quality clients"
    },
    {
      step: "3",
      type: "action", 
      title: "Receive Bookings",
      description: "Accept or decline requests with complete calendar control",
      icon: <Calendar className="w-6 h-6" />,
      benefit: "Own your schedule completely"
    },
    {
      step: "4",
      type: "action",
      title: "Host Your Event", 
      description: "Clients use your space with comprehensive coverage included",
      icon: <Shield className="w-6 h-6" />,
      benefit: "Peace of mind with full protection"
    },
    {
      step: "5",
      type: "benefit",
      title: "Get Paid Fast",
      description: "Receive secure payments within 24 hours of completed bookings",
      icon: <DollarSign className="w-6 h-6" />,
      benefit: "Fast, guaranteed payments"
    },
    {
      step: "6",
      type: "benefit",
      title: "Scale Your Success",
      description: "Manage multiple bookings effortlessly with beautiful dashboard tools",
      icon: <Settings className="w-6 h-6" />,
      benefit: "Effortless control and growth"
    }
  ];

  const features = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Get Paid in 24h",
      description: "Fast, secure payments within 24 hours of completed bookings",
      color: "from-green-100 to-emerald-100",
      iconColor: "text-green-600"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Own Your Schedule", 
      description: "Complete control over your availability and booking calendar",
      color: "from-blue-100 to-cyan-100",
      iconColor: "text-blue-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Peace of Mind",
      description: "Comprehensive damage and liability coverage included automatically",
      color: "from-purple-100 to-indigo-100", 
      iconColor: "text-purple-600"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Zero to Booked Fast",
      description: "No setup fees, no monthly costs - start earning immediately",
      color: "from-orange-100 to-amber-100",
      iconColor: "text-orange-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Spotlight Exposure", 
      description: "Featured in curated collections and editorial picks",
      color: "from-teal-100 to-cyan-100",
      iconColor: "text-teal-600"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Effortless Control",
      description: "Beautiful dashboard to manage bookings and payments",
      color: "from-rose-100 to-pink-100",
      iconColor: "text-rose-600"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Listing",
      description: "Upload photos and set your pricing",
      icon: <Camera className="w-5 h-5" />
    },
    {
      number: "2", 
      title: "Get Discovered",
      description: "Receive booking requests from clients",
      icon: <Target className="w-5 h-5" />
    },
    {
      number: "3",
      title: "Accept Bookings",
      description: "Choose which bookings work for you",
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      number: "4",
      title: "Host & Earn",
      description: "Welcome guests and get paid fast",
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  const testimonials = [
    {
      quote: "I've been able to offset my mortgage by renting my home for photoshoots just 2-3 days a month. The platform makes it so easy!",
      author: "Michael S.",
      role: "Homeowner",
      location: "Los Angeles, CA",
      rating: 5,
      avatar: "MS"
    },
    {
      quote: "As a studio owner, this platform has connected me with photographers and production companies I would have never found otherwise.",
      author: "Samantha T.",
      role: "Studio Owner", 
      location: "New York, NY",
      rating: 5,
      avatar: "ST"
    },
    {
      quote: "My unique warehouse space was sitting empty on weekends. Now it's booked nearly every Saturday for events and photo shoots.",
      author: "James L.",
      role: "Property Manager",
      location: "Chicago, IL", 
      rating: 5,
      avatar: "JL"
    }
  ];

  const stats = [
    { number: "6,237+", label: "Active Locations", icon: <Building className="w-5 h-5" /> },
    { number: "7,849+", label: "Monthly Bookings", icon: <Calendar className="w-5 h-5" /> },
    { number: "$1.3M+", label: "Host Earnings (Monthly)", icon: <DollarSign className="w-5 h-5" /> }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col">
        {/* Modern Hero Section with Slideshow */}
        <section className="relative w-full h-[700px] md:h-[800px] overflow-hidden -mt-[90px]">
          {/* Loading state */}
          {!imagesLoaded && (
            <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-20">
              <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Background slideshow */}
          {imagesLoaded && (
            <div className="h-full w-full relative">
              {heroImages.map((image, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out 
                    ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img 
                    src={image.url}
                    alt={image.alt}
                    className="absolute w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                </div>
              ))}
            </div>
          )}
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-20 z-10">
            <div className="text-center space-y-6 max-w-4xl">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Join 5,000+ Successful Hosts
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                Turn Your Space Into
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Passive Income
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                Join thousands of hosts earning $500-$5,000+ monthly by renting their spaces to photographers, filmmakers, and event organizers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                {user ? (
                  <>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" asChild>
                      <Link href="/add-listing" onClick={() => {
                        if (!isHostMode) {
                          setHostMode(true, user?.roles?.includes("owner"), undefined, true);
                        }
                      }}>
                        <Rocket className="w-5 h-5 mr-2" />
                        List Your Space Now
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm" asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0" asChild>
                      <Link href="/auth?action=register">
                        <Rocket className="w-5 h-5 mr-2" />
                        Start Hosting Today
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-2xl mx-4 my-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent)]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Platform Growth
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Trusted by Thousands</h2>
              <p className="text-white/80 text-sm">Join our growing community of successful hosts</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/10">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 rounded-2xl bg-white/20 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <div className="text-white text-xl">{stat.icon}</div>
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                    <div className="text-white/80 font-medium text-sm group-hover:text-white transition-colors duration-300">{stat.label}</div>
                    
                  </div>
                </div>
              ))}
            </div>
            
            {/* Live Active Users Counter */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-sm rounded-full px-5 py-3 border border-white/25 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <Users className="w-4 h-4 text-white/90" />
                </div>
                <div className="text-white/95 text-sm font-medium">
                  <span className="font-semibold tabular-nums">{activeUsers}</span> active users online now
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Minimal & Cool */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl mx-4 my-6 overflow-hidden relative">
          <div className="container mx-auto px-6">
            {/* Header */}
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">Simple Process</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Start earning from your space in 3 simple steps
              </p>
            </div>
            
            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Camera className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">List Your Space</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Upload photos and create your listing in minutes
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Get Booked</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Accept bookings that work with your schedule
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Earn Money</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Get paid fast and securely after each booking
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              {user ? (
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg" asChild>
                  <Link href="/add-listing" onClick={() => {
                    if (!isHostMode) {
                      setHostMode(true, user?.roles?.includes("owner"), undefined, true);
                    }
                  }}>
                    <Rocket className="w-5 h-5 mr-2" />
                    List Your Space Now
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg" asChild>
                  <Link href="/auth?action=register">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Hosting Today
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Earning Calculator */}
        <section className="py-24 relative overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 dark:from-emerald-500/20 dark:via-blue-500/10 dark:to-purple-500/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-blue-100/20 dark:from-emerald-900/20 dark:to-blue-900/20"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className="container mx-auto px-6 relative">
            {/* Header */}
            <div className="text-center mb-16 overflow-visible">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 text-emerald-700 dark:text-emerald-300 px-6 py-3 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
                Earnings Calculator
              </div>
              <div className="py-2 overflow-visible">
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 dark:from-white dark:via-emerald-300 dark:to-blue-300 bg-clip-text text-transparent mb-6 leading-normal pb-6">
                  Calculate Your 
                  <br className="hidden sm:block" />
                  Earning Potential
                </h2>
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Discover realistic income projections based on your space type, location, and hourly rate. Get personalized estimates in seconds.
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Calculator Controls */}
                <div className="space-y-8">
                  <div className="relative group">
                    {/* Glassmorphism Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/20 shadow-2xl group-hover:shadow-3xl transition-all duration-500"></div>
                    
                    <div className="relative p-8">
                      <div className="space-y-8">
                        {/* Space Type */}
                        <div className="group/field">
                          <label className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                            </svg>
                            Space Type
                          </label>
                          <select 
                            className="w-full p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300 group-hover/field:bg-white/80 dark:group-hover/field:bg-gray-800/80"
                            value={spaceType}
                            onChange={(e) => setSpaceType(e.target.value)}
                          >
                            <option value="studio">Photo Studio</option>
                            <option value="event">Event Space</option>
                            <option value="office">Office Space</option>
                            <option value="outdoor">Outdoor Location</option>
                            <option value="warehouse">Warehouse</option>
                            <option value="residential">Residential</option>
                          </select>
                        </div>

                        {/* Location */}
                        <div className="group/field">
                          <label className="flex items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                            </svg>
                            Location Tier
                          </label>
                          <select 
                            className="w-full p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 rounded-2xl text-gray-900 dark:text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 group-hover/field:bg-white/80 dark:group-hover/field:bg-gray-800/80"
                            value={locationTier}
                            onChange={(e) => setLocationTier(e.target.value)}
                          >
                            <option value="major">Major City (NYC, LA, SF)</option>
                            <option value="medium">Mid-size City</option>
                            <option value="small">Small City/Suburban</option>
                          </select>
                        </div>

                        {/* Hourly Rate */}
                        <div className="group/field">
                          <label className="flex items-center justify-between text-base font-semibold text-gray-800 dark:text-gray-200 mb-6">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                              </svg>
                              Your Hourly Rate
                            </div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                              ${hourlyRate}
                            </div>
                          </label>
                          <div className="relative">
                            <input 
                              type="range" 
                              min="25" 
                              max="200" 
                              value={hourlyRate}
                              className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full appearance-none cursor-pointer slider-modern focus:outline-none"
                              onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                              style={{
                                background: `linear-gradient(to right, #10b981 0%, #3b82f6 ${((hourlyRate - 25) / (200 - 25)) * 100}%, #e5e7eb ${((hourlyRate - 25) / (200 - 25)) * 100}%, #e5e7eb 100%)`
                              }}
                            />
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
                              <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">$25</span>
                              <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">$200</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Display */}
                <div className="space-y-4">

                  {/* Slow Month */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 to-indigo-100/60 dark:from-blue-900/60 dark:to-indigo-900/60 backdrop-blur-xl rounded-2xl border border-blue-200/30 dark:border-blue-700/30 shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Slow Month</h4>
                            <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">Conservative estimate</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
                            <span className="text-blue-700 dark:text-blue-300 font-semibold text-xs">
                              {bookingRanges.slow[0]}-{bookingRanges.slow[1]} bookings
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                        ${(hourlyRate * avgSessionHours * bookingRanges.slow[0]).toLocaleString()} - ${(hourlyRate * avgSessionHours * bookingRanges.slow[1]).toLocaleString()}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Earnings during quieter periods
                      </p>
                    </div>
                  </div>

                  {/* Good Month */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 to-green-100/60 dark:from-emerald-900/60 dark:to-green-900/60 backdrop-blur-xl rounded-2xl border border-emerald-200/30 dark:border-emerald-700/30 shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-500"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Good Month</h4>
                            <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">Expected performance</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1 rounded-full">
                            <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                              {bookingRanges.good[0]}-{bookingRanges.good[1]} bookings
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                        ${(hourlyRate * avgSessionHours * bookingRanges.good[0]).toLocaleString()} - ${(hourlyRate * avgSessionHours * bookingRanges.good[1]).toLocaleString()}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Earnings during peak demand periods
                      </p>
                    </div>
                  </div>

                  {/* Annual Projection */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/60 to-pink-100/60 dark:from-purple-900/60 dark:to-pink-900/60 backdrop-blur-xl rounded-2xl border border-purple-200/30 dark:border-purple-700/30 shadow-lg group-hover:shadow-purple-500/20 transition-all duration-500"></div>
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Annual Potential</h4>
                            <p className="text-purple-600 dark:text-purple-400 font-medium text-sm">Yearly projection</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                            <span className="text-purple-700 dark:text-purple-300 font-semibold text-xs">
                              Mixed months
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        ${((hourlyRate * avgSessionHours * bookingRanges.slow[0] * 6) + (hourlyRate * avgSessionHours * bookingRanges.good[0] * 6)).toLocaleString()} - ${((hourlyRate * avgSessionHours * bookingRanges.slow[1] * 6) + (hourlyRate * avgSessionHours * bookingRanges.good[1] * 6)).toLocaleString()}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Based on 6 slow + 6 good months per year
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Note */}
              <div className="text-center mt-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-100/60 to-orange-100/60 dark:from-amber-900/60 dark:to-orange-900/60 backdrop-blur-sm rounded-xl border border-amber-200/30 dark:border-amber-700/30"></div>
                  <div className="relative px-6 py-4 flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                        Realistic Projections
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-300">
                        Earnings are estimates based on platform averages and may vary by location, seasonality, and market conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900 rounded-2xl mx-4 my-6">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 overflow-visible">
              <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">Popular Categories</Badge>
              <div className="py-2 overflow-visible">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent leading-normal pb-4">
                  List Any Type of Space
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                See what types of spaces are most in demand - percentages show rental frequency across our platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
              {categories.map((category, index) => (
                <Link key={index} href="/auth?action=register" className="h-full">
                  <Card className="group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 border-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm overflow-hidden relative hover:-translate-y-2 h-full cursor-pointer">
                  <CardContent className="p-0 relative h-full">
                    {/* Gradient border effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-lg`}></div>
                    <div className="absolute inset-[1px] bg-white dark:bg-gray-900 rounded-lg"></div>
                    
                    {/* Content */}
                    <div className="relative p-6 h-full flex flex-col">
                      {/* Header with icon and percentage */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-4 rounded-2xl bg-gradient-to-r ${category.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <div className="text-white">
                            {category.icon}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                            {category.percentage}
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1 bg-gray-100 dark:bg-gray-800">
                            {category.popularity}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Title and description */}
                      <div className="mb-6 flex-grow">
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      
                      {/* Enhanced progress bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                          <span>Rental frequency</span>
                          <span className="font-medium">{category.percentage}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out shadow-sm`}
                            style={{ width: category.percentage }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Footer with arrow */}
                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <span className="text-sm font-medium text-muted-foreground">Start hosting</span>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                    
                    {/* Hover glow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg`}></div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <div className="inline-flex items-center space-x-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-muted-foreground font-medium">
                  Based on booking data from the last 12 months across our platform
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl mx-4 my-6">
          <div className="container mx-auto px-4">
            <CommissionSection />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-2xl mx-4 my-6">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4">Success Stories</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">What Our Hosts Say</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Join thousands of satisfied hosts who've transformed their spaces into profitable businesses
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-900">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-lg italic mb-6 text-muted-foreground leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role} • {testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white rounded-2xl mx-4 my-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Start Earning?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Join our community of successful hosts and turn your space into a profitable business today.
            </p>
            
            {user ? (
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4" asChild>
                <Link href="/add-listing" onClick={() => {
                  if (!isHostMode) {
                    setHostMode(true, user?.roles?.includes("owner"), undefined, true);
                  }
                }}>
                  <Rocket className="w-5 h-5 mr-2" />
                  List Your Space Now
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4" asChild>
                <Link href="/auth?action=register">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Hosting Today
                </Link>
              </Button>
            )}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}