import { DollarSign, Users, Shield, CheckCircle, Check, TrendingUp, Clock, Star } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// Feature data with icons and descriptions for hosts
const features = [
  {
    icon: <DollarSign className="w-6 h-6 text-green-600" />,
    title: "Maximize Earnings",
    description: "Turn your empty space into a profitable income stream with competitive rates and flexible booking."
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Vetted Clients",
    description: "Connect with verified filmmakers, photographers, and event planners who respect your space."
  },
  {
    icon: <Shield className="w-6 h-6 text-purple-600" />,
    title: "Full Protection",
    description: "Comprehensive insurance coverage and host guarantee program for complete peace of mind."
  },
  {
    icon: <Clock className="w-6 h-6 text-orange-600" />,
    title: "24h Payouts",
    description: "Get paid within 24 hours of completed bookings - no waiting around for monthly transfers."
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
    title: "Spotlight Boost",
    description: "Feature your property in curated collections and editorial picks for maximum visibility."
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-teal-600" />,
    title: "Zero Fees",
    description: "List your property for free with no upfront costs or subscription fees to get started."
  }
];

export function WhyListSection() {
  const { t } = useTranslation();
  
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-white dark:from-background dark:to-background"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-100/30 dark:bg-emerald-900/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-emerald-100/30 dark:bg-green-800/10 blur-3xl"></div>
      
      <div className="container relative mx-auto px-4">
        {/* Header with badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-50 dark:bg-green-900/30 mb-4">
            <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">For Hosts</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why List With <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">Blocmark?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of property owners who are earning substantial income by sharing their unique spaces with creative professionals.
          </p>
        </div>
        
        {/* Features grid - 6 cards in one row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-white dark:bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-800"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Icon container */}
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
              
              {/* Success indicator */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Check className="w-3 h-3 text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}