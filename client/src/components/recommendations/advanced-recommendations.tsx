import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, DollarSign, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

type LocationRecommendation = {
  type: string;
  features: string[];
  priceRange: { min: number; max: number };
  description: string;
  suitability: number;
  idealFor: string[];
  nearbyAmenities: string[];
  bestTimeToBook: string[];
  photographyTips?: string[];
};

type RecommendationsResponse = {
  recommendations: LocationRecommendation[];
  explanation: string;
};

export function AdvancedRecommendations() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<RecommendationsResponse>({
    queryKey: ["/api/recommendations/personalized"],
    enabled: !!user, // Only fetch if user is logged in
  });

  if (!user) return null; // Don't render anything if user is not logged in

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    console.error("Failed to load recommendations:", error);
    return null; // Don't show anything if there's an error
  }

  if (!data?.recommendations?.length) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Personalized Recommendations</h2>
        <p className="text-muted-foreground">{data.explanation}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {data.recommendations.map((rec, index) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {rec.type}
                <Badge variant="secondary" className="ml-auto">
                  {Math.round(rec.suitability * 100)}% Match
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <p className="text-sm text-muted-foreground">{rec.description}</p>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-primary" />
                <span>
                  ${rec.priceRange.min} - ${rec.priceRange.max} per day
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Perfect for:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rec.idealFor.map((use, i) => (
                    <Badge key={i} variant="outline">
                      {use}
                    </Badge>
                  ))}
                </div>
              </div>

              {rec.photographyTips && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Photography Tips:</span>
                  <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                    {rec.photographyTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Nearby:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rec.nearbyAmenities.map((amenity, i) => (
                    <Badge key={i} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Best Times:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {rec.bestTimeToBook.map((time, i) => (
                    <Badge key={i} variant="outline">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}