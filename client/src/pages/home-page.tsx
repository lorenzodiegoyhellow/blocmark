import { useQuery } from "@tanstack/react-query";
import { Location, SpotlightLocation } from "@shared/schema";
import { LocationGrid } from "@/components/locations/location-grid";
import { SearchBar } from "@/components/search/search-bar";
import { Loader2, Search, Building, Home, Hotel, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useTranslation } from "@/hooks/use-translation";
import { GuideSection } from "@/components/blog/guide-section";

import { SecretCornersSection } from "@/components/sections/secret-corners-section";
import { ConciergeSection } from "@/components/sections/concierge-section";

import { HostBenefitsSection } from "@/components/sections/host-benefits-section";
import { MobileAppSection } from "@/components/sections/mobile-app-section";
import { HeroSection } from "@/components/sections/hero-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Type for spotlight location with location data
type SpotlightWithLocation = SpotlightLocation & {
  location: Location;
};

export default function HomePage() {
  const { t } = useTranslation();
  
  // Fetch all locations
  const { data: locations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });
  
  // Fetch current spotlight locations
  const { data: spotlightLocations, isLoading: spotlightLoading } = useQuery<SpotlightWithLocation[]>({
    queryKey: ["/api/spotlight/current"],
  });
  
  // Filter out non-approved locations for backup featured section if no spotlights
  const approvedLocations = locations?.filter(location => location.status === "approved") || [];
  
  // Extract just the location data from spotlight locations and sort by spotlightOrder
  const spotlightLocationData = spotlightLocations
    ? spotlightLocations
        .sort((a, b) => a.spotlightOrder - b.spotlightOrder)
        .map(spotlight => spotlight.location)
    : [];

  const isLoading = locationsLoading || spotlightLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <AppLayout>
      {/* Full-width Hero Section */}
      <HeroSection />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {spotlightLocationData.length > 0 ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h3 className="text-2xl font-semibold">{t("home.spotlightTitle")}</h3>
              </div>
              <p className="text-muted-foreground mb-6">{t("home.spotlightSubtitle")}</p>
              <LocationGrid locations={spotlightLocationData.slice(0, 3)} horizontalLayout={true} />
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-semibold mb-2">{t("home.featuredTitle")}</h3>
              <p className="text-muted-foreground mb-6">{t("home.featuredSubtitle")}</p>
              <LocationGrid locations={approvedLocations.slice(0, 3)} horizontalLayout={true} />
            </div>
          )}
        </div>
      </div>
      
      {/* Made with Blocmark Gallery Section - Full width */}
      <GallerySection />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {/* Secret Corners Section */}
          <SecretCornersSection />
          
          {/* Concierge Service Section */}
          <ConciergeSection />
          
          {/* Host Benefits Section */}
          <HostBenefitsSection />
          

          
          <GuideSection />
          
          {/* Mobile App Section */}
          <MobileAppSection />
        </div>
      </div>
    </AppLayout>
  );
}