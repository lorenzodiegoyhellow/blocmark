import { Building2, Calculator, Shield, CheckCircle, Check, Image as ImageIcon, Clock, LandPlot } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// Feature data with icons and descriptions
const features = [
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Find Unique Spaces",
    description: "Discover professionally vetted locations for any creative need - from intimate studios to expansive venues and unique outdoor settings.",
    image: "./attached_assets/1.jpg",
    alt: "Elegant ornate interior with grand staircase and chandelier",
    points: [
      "Over 5,000 unique locations across the globe",
      "From studios to warehouses & outdoor settings",
      "Exclusive venues not available elsewhere"
    ]
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    title: "Transparent Pricing",
    description: "Book with confidence knowing all costs upfront - hourly rates, deposits, and additional services are clearly displayed with no hidden fees.",
    image: "./attached_assets/2.png",
    alt: "Woman smiling at her phone after checking transparent pricing",
    points: [
      "Clear hourly rates without hidden fees",
      "Detailed breakdown of all costs upfront",
      "Flexible deposit and cancellation policies"
    ]
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Secure Bookings",
    description: "Every booking comes with comprehensive insurance coverage and our location protection guarantee for peace of mind.",
    image: "./attached_assets/3.jpg",
    alt: "Group of diverse people gathered around laptop working together",
    points: [
      "Up to $2M insurance coverage included",
      "Secure payment processing system",
      "24/7 customer support for all bookings"
    ]
  }
];

export function FeatureSection() {
  const { t } = useTranslation();
  
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-white dark:from-background dark:to-background"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-cyan-100/30 dark:bg-teal-900/10 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-teal-100/30 dark:bg-cyan-800/10 blur-3xl"></div>
      
      <div className="container relative mx-auto px-4">
        {/* Header with badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 mb-4">
            <CheckCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Trusted Platform</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Book with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">Confidence</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("home.featuredSubtitle")}
          </p>
        </div>
        
        {/* Features section with alternating layout */}
        <div className="space-y-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              {/* Image side */}
              <div className="w-full md:w-1/2 relative">
                <div className="rounded-2xl overflow-hidden aspect-video shadow-xl relative">
                  <img 
                    src={feature.image} 
                    alt={feature.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none`}></div>
                  
                  {/* Feature highlights on the image */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="bg-white/10 backdrop-blur-md py-2 px-4 rounded-full flex items-center gap-2">
                      {index === 0 ? (
                        <><LandPlot className="w-4 h-4 text-white" /><span className="text-white text-sm font-medium">5,000+ Locations</span></>
                      ) : index === 1 ? (
                        <><Clock className="w-4 h-4 text-white" /><span className="text-white text-sm font-medium">Book by the Hour</span></>
                      ) : (
                        <><Shield className="w-4 h-4 text-white" /><span className="text-white text-sm font-medium">$2M Coverage</span></>
                      )}
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Decorative pattern under the image */}
                <div className="absolute -z-10 -bottom-6 -right-6 w-full h-full rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800"></div>
              </div>
              
              {/* Content side */}
              <div className="w-full md:w-1/2">
                <div className={`p-1.5 rounded-lg inline-flex items-center justify-center bg-gradient-to-br ${
                  index === 0 ? 'from-cyan-400 to-teal-500' : 
                  index === 1 ? 'from-sky-400 to-cyan-600' : 
                  'from-teal-400 to-cyan-600'
                } mb-4`}>
                  <div className="w-10 h-10 rounded-md bg-white dark:bg-gray-900 flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-100/80 dark:bg-cyan-900/30 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 flex items-center gap-2 text-sm bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-lg inline-block">
                  <CheckCircle className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}